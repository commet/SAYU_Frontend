const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const path = require('path');

/**
 * Bulk artwork crawler for Artvee
 */
class BulkArtworkCrawler {
  constructor() {
    this.delay = 2000; // 2 seconds between requests
    this.maxRetries = 3;
    this.batchSize = 50; // Save progress every 50 items
    this.results = [];
    this.errors = [];
  }

  async loadUrls() {
    const data = await fs.readFile('./data/artwork-urls-optimized.json', 'utf8');
    return JSON.parse(data);
  }

  async loadExistingData() {
    try {
      const data = await fs.readFile('./data/bulk-artworks.json', 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  async crawlArtwork(url, retries = 0) {
    try {
      console.log(`  📄 Crawling: ${url}`);
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 30000
      });
      
      const $ = cheerio.load(response.data);
      
      const artwork = {
        url: url,
        title: $('h1').first().text().trim() || 'Unknown',
        artist: $('.product-artist a').first().text().trim() || 'Unknown',
        artistSlug: $('.product-artist a').first().attr('href')?.split('/').filter(s => s).pop() || '',
        imageUrl: $('.woocommerce-product-gallery__image img').first().attr('src') || null,
        artveeId: url.split('/').filter(s => s).pop() || '',
        tags: [],
        metadata: {},
        crawledAt: new Date().toISOString()
      };
      
      // Extract tags
      $('.product-tags a').each((i, el) => {
        artwork.tags.push($(el).text().trim());
      });
      
      // Extract metadata
      $('.product-meta span').each((i, el) => {
        const text = $(el).text();
        if (text.includes('Date:')) {
          artwork.metadata.date = text.replace('Date:', '').trim();
        } else if (text.includes('Medium:')) {
          artwork.metadata.medium = text.replace('Medium:', '').trim();
        } else if (text.includes('Location:')) {
          artwork.metadata.location = text.replace('Location:', '').trim();
        }
      });
      
      // Description
      artwork.description = $('.product-description').text().trim() || '';
      
      console.log(`    ✅ Success: ${artwork.title} by ${artwork.artist}`);
      return artwork;
      
    } catch (error) {
      if (retries < this.maxRetries) {
        console.log(`    ⚠️ Retry ${retries + 1}/${this.maxRetries} for ${url}`);
        await this.sleep(this.delay);
        return this.crawlArtwork(url, retries + 1);
      }
      
      console.error(`    ❌ Failed: ${error.message}`);
      this.errors.push({
        url: url,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      return null;
    }
  }

  async crawlBatch(urls, startIndex = 0) {
    const existingData = await this.loadExistingData();
    const existingUrls = new Set(existingData.map(item => item.url));
    
    console.log(`\n🎨 Starting bulk crawl from index ${startIndex}`);
    console.log(`📊 Already have ${existingData.length} artworks`);
    
    this.results = existingData;
    
    for (let i = startIndex; i < urls.length; i++) {
      const url = urls[i];
      
      // Skip if already crawled
      if (existingUrls.has(url)) {
        console.log(`  ⏭️ Skipping (already crawled): ${url}`);
        continue;
      }
      
      console.log(`\n[${i + 1}/${urls.length}] Processing...`);
      
      const artwork = await this.crawlArtwork(url);
      if (artwork) {
        this.results.push(artwork);
      }
      
      // Save progress every batch
      if ((i + 1) % this.batchSize === 0 || i === urls.length - 1) {
        await this.saveProgress();
      }
      
      // Delay between requests
      if (i < urls.length - 1) {
        await this.sleep(this.delay);
      }
    }
    
    return this.results;
  }

  async saveProgress() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Save main results
    await fs.writeFile(
      './data/bulk-artworks.json',
      JSON.stringify(this.results, null, 2)
    );
    
    // Save errors if any
    if (this.errors.length > 0) {
      await fs.writeFile(
        `./logs/bulk-errors-${timestamp}.json`,
        JSON.stringify(this.errors, null, 2)
      );
    }
    
    console.log(`\n💾 Progress saved: ${this.results.length} artworks`);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async generateReport() {
    console.log('\n📊 Crawl Report:');
    console.log(`   Total artworks: ${this.results.length}`);
    console.log(`   Total errors: ${this.errors.length}`);
    
    // Artists summary
    const artists = {};
    this.results.forEach(artwork => {
      artists[artwork.artist] = (artists[artwork.artist] || 0) + 1;
    });
    
    console.log(`   Unique artists: ${Object.keys(artists).length}`);
    
    // Top artists
    const topArtists = Object.entries(artists)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
    
    console.log('\n   Top 10 artists:');
    topArtists.forEach(([artist, count]) => {
      console.log(`     - ${artist}: ${count} artworks`);
    });
  }
}

// Main execution
async function main() {
  const crawler = new BulkArtworkCrawler();
  
  try {
    // Load URLs
    const urls = await crawler.loadUrls();
    console.log(`📋 Loaded ${urls.length} URLs to crawl`);
    
    // Start crawling from where we left off
    const startIndex = parseInt(process.argv[2]) || 0;
    
    // Crawl all
    await crawler.crawlBatch(urls, startIndex);
    
    // Generate report
    await crawler.generateReport();
    
    console.log('\n✨ Bulk crawl completed!');
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = BulkArtworkCrawler;