const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// JSON 파일 로드
const urlsFilePath = path.join(__dirname, '../artvee-crawler/data/cloudinary-urls.json');
const urlsData = JSON.parse(fs.readFileSync(urlsFilePath, 'utf8'));

console.log('🔍 Starting validation of all artwork URLs...');
console.log(`📊 Total artworks to check: ${Object.keys(urlsData).length}`);

let validCount = 0;
let invalidCount = 0;
let checkedCount = 0;
const invalidArtworks = [];
const validArtworks = {};

function checkUrl(url, artworkKey, urlType = 'main') {
  return new Promise((resolve) => {
    const curl = spawn('curl', ['-I', url], { stdio: 'pipe' });
    let responseData = '';
    
    curl.stdout.on('data', (data) => {
      responseData += data.toString();
    });
    
    curl.on('close', (code) => {
      const isValid = responseData.includes('HTTP/1.1 200') || responseData.includes('HTTP/2 200');
      checkedCount++;
      
      if (isValid) {
        validCount++;
        console.log(`✅ ${checkedCount.toString().padStart(3)}: ${artworkKey} (${urlType})`);
      } else {
        invalidCount++;
        console.log(`❌ ${checkedCount.toString().padStart(3)}: ${artworkKey} (${urlType}) - INVALID`);
        invalidArtworks.push({ key: artworkKey, url, urlType, response: responseData.split('\n')[0] });
      }
      
      // Progress indicator
      if (checkedCount % 50 === 0) {
        console.log(`\n📊 Progress: ${checkedCount}/${Object.keys(urlsData).length} checked`);
        console.log(`   ✅ Valid: ${validCount} | ❌ Invalid: ${invalidCount}\n`);
      }
      
      resolve(isValid);
    });
    
    curl.stderr.on('data', () => {
      // Suppress curl errors
    });
  });
}

async function validateAllArtworks() {
  const artworkKeys = Object.keys(urlsData);
  
  for (let i = 0; i < artworkKeys.length; i++) {
    const artworkKey = artworkKeys[i];
    const artwork = urlsData[artworkKey];
    
    // Add delay to avoid overwhelming the server
    if (i > 0 && i % 10 === 0) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay every 10 requests
    }
    
    let artworkValid = false;
    
    // Check new format (full + thumbnail)
    if (artwork.full && artwork.thumbnail) {
      const fullValid = await checkUrl(artwork.full.url, artworkKey, 'full');
      const thumbValid = await checkUrl(artwork.thumbnail.url, artworkKey, 'thumbnail');
      
      if (fullValid && thumbValid) {
        validArtworks[artworkKey] = artwork;
        artworkValid = true;
      }
    } 
    // Check old format (single url)
    else if (artwork.url) {
      const isValid = await checkUrl(artwork.url, artworkKey, 'main');
      
      if (isValid) {
        validArtworks[artworkKey] = artwork;
        artworkValid = true;
      }
    }
    
    if (!artworkValid && !invalidArtworks.find(item => item.key === artworkKey)) {
      invalidArtworks.push({ key: artworkKey, url: 'N/A', urlType: 'missing', response: 'No valid URL found' });
    }
  }
  
  console.log('\n🏁 Validation completed!');
  console.log('=====================================');
  console.log(`📊 Total artworks: ${Object.keys(urlsData).length}`);
  console.log(`✅ Valid artworks: ${Object.keys(validArtworks).length}`);
  console.log(`❌ Invalid artworks: ${invalidArtworks.length}`);
  console.log(`📈 Success rate: ${Math.round((Object.keys(validArtworks).length / Object.keys(urlsData).length) * 100)}%`);
  
  // Save results
  const resultsDir = path.join(__dirname, '../artvee-crawler/validation-results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }
  
  // Save valid artworks to new JSON file
  fs.writeFileSync(
    path.join(resultsDir, 'valid-cloudinary-urls.json'),
    JSON.stringify(validArtworks, null, 2)
  );
  
  // Save invalid artworks list
  fs.writeFileSync(
    path.join(resultsDir, 'invalid-artworks.json'),
    JSON.stringify(invalidArtworks, null, 2)
  );
  
  // Create summary report
  const report = {
    validationDate: new Date().toISOString(),
    totalArtworks: Object.keys(urlsData).length,
    validArtworks: Object.keys(validArtworks).length,
    invalidArtworks: invalidArtworks.length,
    successRate: Math.round((Object.keys(validArtworks).length / Object.keys(urlsData).length) * 100),
    invalidSamples: invalidArtworks.slice(0, 10) // First 10 invalid ones for reference
  };
  
  fs.writeFileSync(
    path.join(resultsDir, 'validation-summary.json'),
    JSON.stringify(report, null, 2)
  );
  
  console.log('\n📁 Results saved to:');
  console.log(`   ✅ Valid artworks: validation-results/valid-cloudinary-urls.json`);
  console.log(`   ❌ Invalid list: validation-results/invalid-artworks.json`);
  console.log(`   📊 Summary: validation-results/validation-summary.json`);
  
  if (invalidArtworks.length > 0) {
    console.log('\n⚠️  Some invalid artworks found:');
    invalidArtworks.slice(0, 5).forEach(item => {
      console.log(`   - ${item.key}: ${item.response}`);
    });
    
    if (invalidArtworks.length > 5) {
      console.log(`   ... and ${invalidArtworks.length - 5} more`);
    }
  }
  
  return {
    valid: validArtworks,
    invalid: invalidArtworks,
    summary: report
  };
}

// Run validation
validateAllArtworks().catch(console.error);