const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const { createWriteStream, existsSync } = require('fs');
const { pipeline } = require('stream').promises;
const cheerio = require('cheerio');

/**
 * Artvee Image Downloader using AWS S3 signed URLs
 */
class ArtveeDownloader {
  constructor() {
    this.baseDir = './images';
    this.delay = 2500; // 2.5 seconds between requests
    this.retryDelay = 5000;
    this.maxRetries = 3;
    this.stats = {
      total: 0,
      success: 0,
      failed: 0,
      skipped: 0,
      startTime: Date.now()
    };
  }

  async init() {
    const dirs = [
      this.baseDir,
      path.join(this.baseDir, 'full'),
      path.join(this.baseDir, 'medium'),
      path.join(this.baseDir, 'thumbnails')
    ];
    
    for (const dir of dirs) {
      if (!existsSync(dir)) {
        await fs.mkdir(dir, { recursive: true });
      }
    }
  }

  async downloadAll() {
    console.log('🎨 Artvee AWS S3 Image Downloader\n');
    await this.init();
    
    // Load artwork data
    const [famousArtworks, bulkArtworks] = await Promise.all([
      this.loadJson('./data/famous-artists-artworks.json'),
      this.loadJson('./data/bulk-artworks.json')
    ]);
    
    // Combine and dedupe
    const allArtworks = [...famousArtworks];
    const existingUrls = new Set(famousArtworks.map(a => a.url));
    
    bulkArtworks.forEach(artwork => {
      if (!existingUrls.has(artwork.url)) {
        allArtworks.push(artwork);
      }
    });
    
    this.stats.total = allArtworks.length;
    console.log(`📊 Total artworks: ${this.stats.total}\n`);
    
    // Load progress
    const progressFile = path.join(this.baseDir, 'download-progress-aws.json');
    let progress = {};
    
    try {
      const progressData = await fs.readFile(progressFile, 'utf8');
      progress = JSON.parse(progressData);
      console.log(`📈 Previous progress: ${Object.keys(progress).length} completed\n`);
    } catch (e) {
      // No progress file
    }
    
    // Process each artwork
    for (let i = 0; i < allArtworks.length; i++) {
      const artwork = allArtworks[i];
      const artveeId = artwork.artveeId || this.extractId(artwork.url);
      
      // Skip if already downloaded
      if (progress[artveeId]?.completed) {
        this.stats.skipped++;
        continue;
      }
      
      const percent = ((i + 1) / allArtworks.length * 100).toFixed(1);
      const elapsed = (Date.now() - this.stats.startTime) / 1000 / 60;
      const rate = (this.stats.success + this.stats.failed + this.stats.skipped) / elapsed || 1;
      const remaining = (allArtworks.length - i) / rate;
      
      console.log(`\n[${i + 1}/${allArtworks.length}] (${percent}%) | ⏱️ ${elapsed.toFixed(1)}min | ETA: ${remaining.toFixed(1)}min`);
      console.log(`📍 ${artwork.title || artveeId}`);
      console.log(`👤 ${artwork.artist || 'Unknown'}`);
      
      try {
        const result = await this.downloadArtwork(artwork, artveeId);
        
        if (result.success) {
          this.stats.success++;
          progress[artveeId] = {
            completed: true,
            timestamp: new Date().toISOString(),
            files: result.downloaded
          };
          console.log(`✅ Downloaded: ${result.downloaded.join(', ')}`);
          
          // Save progress every 10 items
          if (this.stats.success % 10 === 0) {
            await fs.writeFile(progressFile, JSON.stringify(progress, null, 2));
          }
        }
      } catch (error) {
        this.stats.failed++;
        console.error(`❌ Failed: ${error.message}`);
      }
      
      // Progress summary every 50 items
      if ((i + 1) % 50 === 0) {
        this.printProgress();
      }
      
      await this.sleep(this.delay);
    }
    
    // Save final progress
    await fs.writeFile(progressFile, JSON.stringify(progress, null, 2));
    
    this.printFinalStats();
  }

  async downloadArtwork(artwork, artveeId) {
    const response = await axios.get(artwork.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': 'https://artvee.com/'
      },
      timeout: 30000
    });
    
    const $ = cheerio.load(response.data);
    const downloaded = [];
    
    // Find download link (AWS S3 signed URL)
    let downloadUrl = null;
    $('.prem-link.btn[href*="mdl.artvee.com"], a[href*="mdl.artvee.com/sdl/"]').each((i, elem) => {
      const href = $(elem).attr('href');
      if (href && href.includes('AWS4-HMAC-SHA256')) {
        downloadUrl = href;
        return false; // break
      }
    });
    
    // Fallback: look for any download button
    if (!downloadUrl) {
      $('a').each((i, elem) => {
        const href = $(elem).attr('href');
        const text = $(elem).text().trim();
        if (href && text.toLowerCase() === 'download' && href.includes('.jpg')) {
          downloadUrl = href;
          return false;
        }
      });
    }
    
    // Download full image
    if (downloadUrl) {
      const fullPath = path.join(this.baseDir, 'full', `${artveeId}.jpg`);
      if (!existsSync(fullPath)) {
        await this.downloadImage(downloadUrl, fullPath);
        downloaded.push('full');
      }
    } else {
      throw new Error('No download URL found');
    }
    
    // Get thumbnail from og:image or main image
    let thumbUrl = $('meta[property="og:image"]').attr('content');
    if (!thumbUrl) {
      thumbUrl = $('.single-product-main-image img').first().attr('src');
    }
    
    if (thumbUrl) {
      const thumbPath = path.join(this.baseDir, 'thumbnails', `${artveeId}.jpg`);
      if (!existsSync(thumbPath)) {
        try {
          await this.downloadImage(thumbUrl, thumbPath);
          downloaded.push('thumbnail');
        } catch (e) {
          // Thumbnail failure is not critical
          console.log(`  ⚠️ Thumbnail download failed`);
        }
      }
    }
    
    // For medium size, we'll use the full image for now
    // In production, you'd resize it using sharp or similar
    
    return { success: true, downloaded };
  }

  async downloadImage(url, filepath, retries = 0) {
    try {
      const response = await axios({
        method: 'GET',
        url: url,
        responseType: 'stream',
        timeout: 120000, // 2 minutes for large files
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://artvee.com/'
        },
        maxRedirects: 5
      });
      
      await pipeline(response.data, createWriteStream(filepath));
      
    } catch (error) {
      if (retries < this.maxRetries) {
        console.log(`  🔄 Retrying download (attempt ${retries + 1}/${this.maxRetries})`);
        await this.sleep(this.retryDelay);
        return this.downloadImage(url, filepath, retries + 1);
      }
      throw error;
    }
  }

  async loadJson(filepath) {
    const data = await fs.readFile(filepath, 'utf8');
    return JSON.parse(data);
  }

  extractId(url) {
    return url.split('/').filter(s => s).pop();
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  printProgress() {
    const elapsed = (Date.now() - this.stats.startTime) / 1000 / 60;
    const rate = (this.stats.success + this.stats.failed + this.stats.skipped) / elapsed;
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 Progress Update:');
    console.log(`✅ Success: ${this.stats.success}`);
    console.log(`❌ Failed: ${this.stats.failed}`);
    console.log(`⏭️ Skipped: ${this.stats.skipped}`);
    console.log(`📈 Rate: ${rate.toFixed(1)} items/min`);
    console.log(`⏱️ Time: ${elapsed.toFixed(1)} minutes`);
    console.log('='.repeat(50));
  }

  printFinalStats() {
    const totalTime = (Date.now() - this.stats.startTime) / 1000 / 60;
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 Download Complete:');
    console.log('='.repeat(50));
    console.log(`Total artworks: ${this.stats.total}`);
    console.log(`✅ Success: ${this.stats.success}`);
    console.log(`❌ Failed: ${this.stats.failed}`);
    console.log(`⏭️ Skipped: ${this.stats.skipped}`);
    console.log(`⏱️ Total time: ${totalTime.toFixed(1)} minutes`);
    console.log(`📁 Images saved to: ${path.resolve(this.baseDir)}`);
    console.log('='.repeat(50));
    
    // Estimate storage
    const avgSizeKB = 3500; // 3.5MB average
    const totalSizeGB = (this.stats.success * avgSizeKB / 1024 / 1024).toFixed(2);
    console.log(`\n💾 Estimated storage: ${totalSizeGB} GB`);
  }
}

// Run
async function main() {
  const downloader = new ArtveeDownloader();
  await downloader.downloadAll();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = ArtveeDownloader;