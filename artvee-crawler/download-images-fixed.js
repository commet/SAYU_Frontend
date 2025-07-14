const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const { createWriteStream, existsSync } = require('fs');
const { pipeline } = require('stream').promises;
const cheerio = require('cheerio');

/**
 * Fixed Artvee image downloader with proper URL extraction
 */
class ArtveeImageDownloader {
  constructor() {
    this.baseDir = './images';
    this.delay = 2000; // 2 seconds between requests
    this.retryDelay = 3000;
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
    // Create directories
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
    console.log('🎨 Fixed Artvee Image Downloader\n');
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
    
    // Process each artwork
    for (let i = 0; i < allArtworks.length; i++) {
      const artwork = allArtworks[i];
      const artveeId = artwork.artveeId || this.extractId(artwork.url);
      
      // Check if already downloaded
      const fullPath = path.join(this.baseDir, 'full', `${artveeId}.jpg`);
      if (existsSync(fullPath)) {
        this.stats.skipped++;
        continue;
      }
      
      const percent = ((i + 1) / allArtworks.length * 100).toFixed(1);
      const elapsed = (Date.now() - this.stats.startTime) / 1000 / 60;
      
      console.log(`\n[${i + 1}/${allArtworks.length}] (${percent}%) - ${elapsed.toFixed(1)}min elapsed`);
      console.log(`📍 ${artwork.title || artveeId}`);
      console.log(`👤 ${artwork.artist || 'Unknown'}`);
      
      try {
        const downloaded = await this.downloadArtwork(artwork, artveeId);
        if (downloaded) {
          this.stats.success++;
          console.log(`✅ Downloaded successfully`);
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
    
    this.printFinalStats();
  }

  async downloadArtwork(artwork, artveeId) {
    // Get the artwork page to extract download links
    const response = await axios.get(artwork.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 30000
    });
    
    const $ = cheerio.load(response.data);
    let downloaded = false;
    
    // Method 1: Look for download button/link
    let downloadUrl = null;
    $('a.pf-button-download, a[download], a[href*="download"]').each((i, elem) => {
      const href = $(elem).attr('href');
      if (href && (href.endsWith('.jpg') || href.endsWith('.jpeg') || href.endsWith('.png'))) {
        downloadUrl = href;
        if (!downloadUrl.startsWith('http')) {
          downloadUrl = 'https://artvee.com' + downloadUrl;
        }
        return false; // break
      }
    });
    
    // Method 2: Look for high-res image in product gallery
    if (!downloadUrl) {
      const galleryImg = $('.single-product-main-image img, .woocommerce-product-gallery__image img').first();
      if (galleryImg.length) {
        // Try to get the full-size URL from data attributes
        downloadUrl = galleryImg.attr('data-large_image') || 
                     galleryImg.attr('data-src') || 
                     galleryImg.attr('src');
        
        // Sometimes the high-res version is linked
        const parentLink = galleryImg.parent('a');
        if (parentLink.length) {
          const linkHref = parentLink.attr('href');
          if (linkHref && linkHref.includes('.jpg')) {
            downloadUrl = linkHref;
          }
        }
      }
    }
    
    // Method 3: Look in scripts for image data
    if (!downloadUrl) {
      const scriptText = $('script').text();
      const matches = scriptText.match(/"large_image":"([^"]+\.jpg[^"]*)"/);
      if (matches) {
        downloadUrl = matches[1].replace(/\\/g, '');
      }
    }
    
    // Download the image if we found a URL
    if (downloadUrl) {
      const fullPath = path.join(this.baseDir, 'full', `${artveeId}.jpg`);
      await this.downloadImage(downloadUrl, fullPath);
      downloaded = true;
      
      // Also save a smaller thumbnail from the page
      const thumbUrl = $('meta[property="og:image"]').attr('content') || 
                      $('.woocommerce-product-gallery__image img').first().attr('src');
      if (thumbUrl) {
        const thumbPath = path.join(this.baseDir, 'thumbnails', `${artveeId}.jpg`);
        if (!existsSync(thumbPath)) {
          try {
            await this.downloadImage(thumbUrl, thumbPath);
          } catch (e) {
            // Thumbnail download failure is not critical
          }
        }
      }
    } else {
      throw new Error('Could not find download URL');
    }
    
    return downloaded;
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
        }
      });
      
      await pipeline(response.data, createWriteStream(filepath));
      
    } catch (error) {
      if (retries < this.maxRetries) {
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
    console.log('\n' + '='.repeat(50));
    console.log('📊 Progress Update:');
    console.log(`✅ Success: ${this.stats.success}`);
    console.log(`❌ Failed: ${this.stats.failed}`);
    console.log(`⏭️ Skipped: ${this.stats.skipped}`);
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
    
    // Save summary
    const summary = {
      totalArtworks: this.stats.total,
      downloaded: this.stats.success,
      failed: this.stats.failed,
      skipped: this.stats.skipped,
      totalTime: `${totalTime.toFixed(1)} minutes`,
      completedAt: new Date().toISOString()
    };
    
    fs.writeFile(
      path.join(this.baseDir, 'download-summary.json'),
      JSON.stringify(summary, null, 2)
    );
  }
}

// Run the downloader
async function main() {
  const downloader = new ArtveeImageDownloader();
  await downloader.downloadAll();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = ArtveeImageDownloader;