const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;

async function testSingleArtwork() {
  const testUrl = 'https://artvee.com/dl/cypresses/';
  
  console.log('🔍 Testing single artwork download');
  console.log(`URL: ${testUrl}\n`);
  
  try {
    const response = await axios.get(testUrl, {
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
    
    console.log('📄 Page loaded successfully\n');
    
    // Save HTML for inspection
    await fs.writeFile('test-page.html', response.data);
    console.log('💾 Saved HTML to test-page.html\n');
    
    // Method 1: Look for download links
    console.log('🔍 Method 1: Searching for download links...');
    const downloadLinks = [];
    
    $('a').each((i, elem) => {
      const href = $(elem).attr('href');
      const text = $(elem).text().trim();
      const classes = $(elem).attr('class') || '';
      
      if (href) {
        // Check for download-related attributes or text
        if (href.includes('download') || 
            $(elem).attr('download') !== undefined ||
            text.toLowerCase().includes('download') ||
            classes.includes('download')) {
          downloadLinks.push({
            href: href,
            text: text,
            classes: classes
          });
        }
        
        // Check for direct image links
        if (href.endsWith('.jpg') || href.endsWith('.jpeg') || href.endsWith('.png')) {
          downloadLinks.push({
            href: href,
            text: text || 'Direct image link',
            classes: classes
          });
        }
      }
    });
    
    console.log(`Found ${downloadLinks.length} download links:`);
    downloadLinks.forEach(link => {
      console.log(`  - ${link.text}: ${link.href}`);
    });
    
    // Method 2: Look for images
    console.log('\n🔍 Method 2: Searching for images...');
    const images = [];
    
    $('img').each((i, elem) => {
      const src = $(elem).attr('src');
      const dataSrc = $(elem).attr('data-src');
      const dataLarge = $(elem).attr('data-large_image');
      const alt = $(elem).attr('alt') || '';
      
      if (src || dataSrc || dataLarge) {
        images.push({
          src: src,
          dataSrc: dataSrc,
          dataLarge: dataLarge,
          alt: alt
        });
      }
    });
    
    console.log(`Found ${images.length} images:`);
    images.slice(0, 5).forEach(img => {
      console.log(`  - Alt: ${img.alt}`);
      if (img.src) console.log(`    src: ${img.src}`);
      if (img.dataSrc) console.log(`    data-src: ${img.dataSrc}`);
      if (img.dataLarge) console.log(`    data-large_image: ${img.dataLarge}`);
    });
    
    // Method 3: Look in scripts
    console.log('\n🔍 Method 3: Searching in scripts...');
    const scripts = $('script').map((i, elem) => $(elem).html()).get();
    
    scripts.forEach((script, i) => {
      if (script && script.includes('download')) {
        console.log(`  Script ${i} contains 'download'`);
        // Extract relevant parts
        const lines = script.split('\n');
        lines.forEach(line => {
          if (line.includes('download') || line.includes('.jpg')) {
            console.log(`    ${line.trim().substring(0, 100)}...`);
          }
        });
      }
    });
    
    // Method 4: Look for WooCommerce product data
    console.log('\n🔍 Method 4: Looking for WooCommerce data...');
    const productGallery = $('.woocommerce-product-gallery');
    if (productGallery.length) {
      console.log('  Found WooCommerce product gallery');
      const galleryData = productGallery.attr('data-columns');
      console.log(`  Gallery columns: ${galleryData}`);
    }
    
    // Method 5: Check meta tags
    console.log('\n🔍 Method 5: Checking meta tags...');
    const ogImage = $('meta[property="og:image"]').attr('content');
    if (ogImage) {
      console.log(`  Open Graph image: ${ogImage}`);
    }
    
    // Method 6: Look for specific Artvee patterns
    console.log('\n🔍 Method 6: Looking for Artvee-specific patterns...');
    
    // Check for pf-button classes (might be custom)
    $('.pf-button, .pf-button-download, [class*="download"]').each((i, elem) => {
      const $elem = $(elem);
      console.log(`  Found button: ${$elem.attr('class')}`);
      console.log(`    Text: ${$elem.text().trim()}`);
      const href = $elem.attr('href') || $elem.parent('a').attr('href');
      if (href) console.log(`    Href: ${href}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testSingleArtwork();