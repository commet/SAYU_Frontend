const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const { createWriteStream, existsSync } = require('fs');
const { pipeline } = require('stream').promises;
const cheerio = require('cheerio');

/**
 * Artvee image downloader using AWS S3 URLs
 */
class ArtveeImageDownloader {
  constructor() {
    this.baseDir = './images';
    this.delay = 1500; // 1.5 seconds between requests
    this.retryDelay = 3000;
    this.maxRetries = 3;
    this.concurrentDownloads = 3; // Download 3 images at once
    this.progressFile = path.join(this.baseDir, 'download-progress-aws.json');
    this.stats = {
      total: 0,
      success: 0,
      failed: 0,
      skipped: 0,
      startTime: Date.now()
    };
  }

  async init() {
    // Create directories
    const dirs = [
      this.baseDir,
      path.join(this.baseDir, 'full'),
      path.join(this.baseDir, 'thumbnails')
    ];
    
    for (const dir of dirs) {
      if (!existsSync(dir)) {
        await fs.mkdir(dir, { recursive: true });
      }
    }
  }

  async downloadAll() {
    console.log('🎨 Artvee AWS Image Downloader\n');
    await this.init();
    
    // Load artwork data
    const [famousArtworks, bulkArtworks] = await Promise.all([
      this.loadJson('./data/famous-artists-artworks.json'),
      this.loadJson('./data/bulk-artworks.json').catch(() => [])
    ]);
    
    // Combine all artworks (both are arrays)
    const allArtworks = [
      ...famousArtworks,
      ...bulkArtworks
    ];
    
    console.log(`Found ${allArtworks.length} artworks to process\n`);
    this.stats.total = allArtworks.length;
    
    // Load progress
    const progress = await this.loadProgress();
    const completedIds = new Set(progress.completed || []);
    const failedIds = new Set(progress.failed || []);
    
    // Filter artworks that need downloading
    const pendingArtworks = allArtworks.filter(artwork => {
      const artveeId = this.extractArtveeId(artwork.url);
      return !completedIds.has(artveeId);
    });
    
    console.log(`Already completed: ${completedIds.size}`);
    console.log(`Pending downloads: ${pendingArtworks.length}\n`);
    
    this.stats.skipped = completedIds.size;
    
    // Process in batches
    for (let i = 0; i < pendingArtworks.length; i += this.concurrentDownloads) {
      const batch = pendingArtworks.slice(i, i + this.concurrentDownloads);
      
      await Promise.all(batch.map(async (artwork) => {
        const artveeId = this.extractArtveeId(artwork.url);
        console.log(`[${this.stats.success + this.stats.failed + this.stats.skipped + 1}/${this.stats.total}] Processing: ${artwork.title}`);
        
        try {
          await this.downloadArtwork(artwork, artveeId);
          this.stats.success++;
          completedIds.add(artveeId);
          console.log(`  ✓ Downloaded successfully`);
        } catch (error) {
          this.stats.failed++;
          failedIds.add(artveeId);
          console.error(`  ✗ Failed: ${error.message}`);
        }
        
        // Save progress after each download
        await this.saveProgress({
          completed: Array.from(completedIds),
          failed: Array.from(failedIds),
          lastUpdate: new Date().toISOString()
        });
      }));
      
      // Progress update
      if ((i + batch.length) % 10 === 0) {
        this.printStats();
      }
      
      // Delay between batches
      if (i + this.concurrentDownloads < pendingArtworks.length) {
        await this.sleep(this.delay);
      }
    }
    
    this.printFinalStats();
  }

  async downloadArtwork(artwork, artveeId) {
    // Skip if already exists
    const fullPath = path.join(this.baseDir, 'full', `${artveeId}.jpg`);
    const thumbPath = path.join(this.baseDir, 'thumbnails', `${artveeId}.jpg`);
    
    if (existsSync(fullPath) && existsSync(thumbPath)) {
      this.stats.skipped++;
      return;
    }
    
    // Get the artwork page
    const response = await axios.get(artwork.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      timeout: 30000
    });
    
    const $ = cheerio.load(response.data);
    
    // Look for AWS S3 download link
    let downloadUrl = null;
    let thumbnailUrl = null;
    
    // Find the AWS S3 link (usually in a.prem-link)
    $('a.prem-link[href*="mdl.artvee.com"], a[href*="mdl.artvee.com"]').each((i, elem) => {
      const href = $(elem).attr('href');
      if (href && href.includes('AWS4-HMAC-SHA256')) {
        downloadUrl = href;
        return false; // break
      }
    });
    
    // Get thumbnail from meta tag or pinterest share
    thumbnailUrl = $('meta[property="og:image"]').attr('content');
    if (!thumbnailUrl) {
      const pinterestLink = $('a[href*="pinterest.com"]').attr('href');
      if (pinterestLink) {
        const match = pinterestLink.match(/media=([^&]+)/);
        if (match) {
          thumbnailUrl = decodeURIComponent(match[1]);
        }
      }
    }
    
    // Download full image
    if (downloadUrl && !existsSync(fullPath)) {
      await this.downloadImage(downloadUrl, fullPath);
    }
    
    // Download thumbnail
    if (thumbnailUrl && !existsSync(thumbPath)) {
      try {
        await this.downloadImage(thumbnailUrl, thumbPath);
      } catch (e) {
        // Thumbnail failure is not critical
        console.log(`  ! Thumbnail download failed: ${e.message}`);
      }
    }
    
    if (!downloadUrl) {
      throw new Error('No AWS download URL found');
    }
  }

  async downloadImage(url, filepath, retries = 0) {
    try {
      const response = await axios({
        method: 'GET',
        url: url,
        responseType: 'stream',
        timeout: 60000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://artvee.com/'
        },
        maxRedirects: 5
      });
      
      await pipeline(response.data, createWriteStream(filepath));
      
      // Verify file was created and has size
      const stats = await fs.stat(filepath);
      if (stats.size === 0) {
        throw new Error('Downloaded file is empty');
      }
    } catch (error) {
      if (retries < this.maxRetries) {
        console.log(`  Retrying download (${retries + 1}/${this.maxRetries})...`);
        await this.sleep(this.retryDelay);
        return this.downloadImage(url, filepath, retries + 1);
      }
      throw error;
    }
  }

  extractArtveeId(url) {
    const match = url.match(/\/dl\/([^\/]+)/);
    return match ? match[1] : url.split('/').pop();
  }

  async loadJson(filepath) {
    const content = await fs.readFile(filepath, 'utf8');
    return JSON.parse(content);
  }

  async loadProgress() {
    try {
      if (existsSync(this.progressFile)) {
        const content = await fs.readFile(this.progressFile, 'utf8');
        return JSON.parse(content);
      }
    } catch (e) {
      console.error('Error loading progress:', e.message);
    }
    return { completed: [], failed: [] };
  }

  async saveProgress(progress) {
    try {
      await fs.writeFile(this.progressFile, JSON.stringify(progress, null, 2));
    } catch (e) {
      console.error('Error saving progress:', e.message);
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  printStats() {
    const elapsed = (Date.now() - this.stats.startTime) / 1000;
    const rate = (this.stats.success + this.stats.failed) / elapsed;
    console.log(`\n📊 Progress: ${this.stats.success + this.stats.failed + this.stats.skipped}/${this.stats.total} (${rate.toFixed(1)} items/sec)`);
  }

  printFinalStats() {
    const elapsed = (Date.now() - this.stats.startTime) / 1000;
    console.log('\n' + '='.repeat(50));
    console.log('📊 Final Statistics:');
    console.log('='.repeat(50));
    console.log(`Total artworks: ${this.stats.total}`);
    console.log(`✓ Downloaded: ${this.stats.success}`);
    console.log(`✗ Failed: ${this.stats.failed}`);
    console.log(`↷ Skipped: ${this.stats.skipped}`);
    console.log(`Time elapsed: ${Math.floor(elapsed / 60)}m ${Math.floor(elapsed % 60)}s`);
    console.log('='.repeat(50));
  }
}

// Run the downloader
const downloader = new ArtveeImageDownloader();
downloader.downloadAll().catch(console.error);