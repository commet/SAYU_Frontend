const fs = require('fs');
const path = require('path');

// Read the cloudinary URLs file
const urlsFilePath = path.join(__dirname, '../artvee-crawler/data/cloudinary-urls.json');
const urlsData = JSON.parse(fs.readFileSync(urlsFilePath, 'utf8'));

let fixedCount = 0;

// Function to fix duplicated path segments
function fixDuplicatedPath(url, publicId) {
  // Pattern to match duplicated segments like "sayu/artvee/enhanced/sayu/artvee/enhanced/"
  const duplicatePattern = /(sayu\/artvee\/(?:enhanced|masters|full|thumbnails))\/\1/g;
  
  let fixedUrl = url;
  let fixedPublicId = publicId;
  
  if (duplicatePattern.test(url)) {
    fixedUrl = url.replace(duplicatePattern, '$1');
    fixedPublicId = publicId.replace(duplicatePattern, '$1');
    return { fixedUrl, fixedPublicId, wasFixed: true };
  }
  
  return { fixedUrl, fixedPublicId, wasFixed: false };
}

console.log('🔍 Scanning for malformed Cloudinary URLs...');

// Process each artwork entry
for (const [artworkKey, artworkData] of Object.entries(urlsData)) {
  // Check if this is the new format with full/thumbnail structure
  if (artworkData.full && artworkData.thumbnail) {
    // Fix full image URL
    const fullFix = fixDuplicatedPath(artworkData.full.url, artworkData.full.publicId);
    if (fullFix.wasFixed) {
      console.log(`🔧 Fixed full URL for "${artworkKey}"`);
      console.log(`   Before: ${artworkData.full.url}`);
      console.log(`   After:  ${fullFix.fixedUrl}`);
      artworkData.full.url = fullFix.fixedUrl;
      artworkData.full.publicId = fullFix.fixedPublicId;
      fixedCount++;
    }
    
    // Fix thumbnail URL
    const thumbnailFix = fixDuplicatedPath(artworkData.thumbnail.url, artworkData.thumbnail.publicId);
    if (thumbnailFix.wasFixed) {
      console.log(`🔧 Fixed thumbnail URL for "${artworkKey}"`);
      console.log(`   Before: ${artworkData.thumbnail.url}`);
      console.log(`   After:  ${thumbnailFix.fixedUrl}`);
      artworkData.thumbnail.url = thumbnailFix.fixedUrl;
      artworkData.thumbnail.publicId = thumbnailFix.fixedPublicId;
      fixedCount++;
    }
  } 
  // Check old format with direct url/publicId
  else if (artworkData.url && artworkData.publicId) {
    const fix = fixDuplicatedPath(artworkData.url, artworkData.publicId);
    if (fix.wasFixed) {
      console.log(`🔧 Fixed URL for "${artworkKey}"`);
      console.log(`   Before: ${artworkData.url}`);
      console.log(`   After:  ${fix.fixedUrl}`);
      artworkData.url = fix.fixedUrl;
      artworkData.publicId = fix.fixedPublicId;
      fixedCount++;
    }
  }
}

if (fixedCount > 0) {
  // Create backup
  const backupPath = urlsFilePath + '.backup.' + Date.now();
  fs.copyFileSync(urlsFilePath, backupPath);
  console.log(`📋 Created backup: ${backupPath}`);
  
  // Write fixed data
  fs.writeFileSync(urlsFilePath, JSON.stringify(urlsData, null, 2));
  console.log(`✅ Fixed ${fixedCount} malformed URLs and saved to ${urlsFilePath}`);
  
  // Verify the specific problematic artworks
  const problemArtworks = ['to-the-credit-of-the-sea', 'rest-along-the-stream-edge-of-the-wood', 'le-reve-the-dream'];
  console.log('\n🎯 Verification of specifically mentioned problematic artworks:');
  
  problemArtworks.forEach(artworkKey => {
    if (urlsData[artworkKey]) {
      const artwork = urlsData[artworkKey];
      if (artwork.url) {
        console.log(`✓ ${artworkKey}: ${artwork.url}`);
      } else if (artwork.full) {
        console.log(`✓ ${artworkKey}: ${artwork.full.url}`);
      }
    } else {
      console.log(`❌ ${artworkKey}: Not found in data`);
    }
  });
} else {
  console.log('✅ No malformed URLs found. All URLs are properly formatted.');
}

console.log('\n🏁 URL fix process completed!');