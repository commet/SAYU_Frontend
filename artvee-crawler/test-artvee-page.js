const axios = require('axios');
const cheerio = require('cheerio');

async function testArtveePage() {
  try {
    // Test with a specific artwork URL
    const testUrl = 'https://artvee.com/dl/a-peasant-woman-digging-in-front-of-her-cottage/';
    
    console.log('Testing URL:', testUrl);
    console.log('Fetching page...\n');
    
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
    
    console.log('Page title:', $('title').text());
    console.log('\nSearching for download links...\n');
    
    // Method 1: Direct download button
    console.log('Method 1 - Download button:');
    $('a.pf-button-download, a[download], a[href*="download"]').each((i, elem) => {
      const href = $(elem).attr('href');
      const text = $(elem).text().trim();
      console.log(`  Found: ${text} -> ${href}`);
    });
    
    // Method 2: Product image
    console.log('\nMethod 2 - Product gallery images:');
    $('.single-product-main-image img, .woocommerce-product-gallery__image img').each((i, elem) => {
      const src = $(elem).attr('src');
      const dataSrc = $(elem).attr('data-src');
      const dataLarge = $(elem).attr('data-large_image');
      console.log(`  Image ${i + 1}:`);
      if (src) console.log(`    src: ${src}`);
      if (dataSrc) console.log(`    data-src: ${dataSrc}`);
      if (dataLarge) console.log(`    data-large_image: ${dataLarge}`);
    });
    
    // Method 3: Links containing images
    console.log('\nMethod 3 - Image links:');
    $('a[href*=".jpg"], a[href*=".jpeg"], a[href*=".png"]').each((i, elem) => {
      const href = $(elem).attr('href');
      const classes = $(elem).attr('class');
      if (i < 5) { // Limit output
        console.log(`  Link: ${href} (class: ${classes || 'none'})`);
      }
    });
    
    // Method 4: Look for download in page scripts
    console.log('\nMethod 4 - Script content:');
    $('script').each((i, elem) => {
      const content = $(elem).html();
      if (content && content.includes('download')) {
        console.log(`  Found 'download' in script ${i}`);
        // Extract relevant part
        const matches = content.match(/download[^,;}]{0,100}/gi);
        if (matches) {
          matches.slice(0, 3).forEach(match => {
            console.log(`    ${match.substring(0, 100)}`);
          });
        }
      }
    });
    
    // Method 5: Check all links
    console.log('\nAll unique links on page:');
    const allLinks = new Set();
    $('a').each((i, elem) => {
      const href = $(elem).attr('href');
      if (href && href.includes('artvee.com')) {
        allLinks.add(href);
      }
    });
    
    Array.from(allLinks).slice(0, 10).forEach(link => {
      console.log(`  ${link}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testArtveePage();