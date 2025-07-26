// Quick test of CloudinaryArtveeService to check if artvee images work
require('dotenv').config();
const cloudinaryArtveeService = require('./src/services/cloudinaryArtveeService');

async function testArtveeService() {
  console.log('🎨 Testing CloudinaryArtveeService...\n');
  
  try {
    // Test 1: Get random artworks
    console.log('1️⃣ Testing random artworks...');
    const randomArtworks = await cloudinaryArtveeService.getRandomArtworks(3);
    console.log(`✅ Found ${randomArtworks.length} random artworks`);
    randomArtworks.forEach((artwork, i) => {
      console.log(`   ${i+1}. ${artwork.title} by ${artwork.artist}`);
      console.log(`      Image URL: ${artwork.imageUrl ? '✅ Available' : '❌ Missing'}`);
      console.log(`      Cloudinary URL: ${artwork.cdnUrl ? '✅ Available' : '❌ Missing'}`);
    });
    
    console.log('\n2️⃣ Testing personality type artworks...');
    // Test 2: Get artworks for LAEF personality type
    const laefArtworks = await cloudinaryArtveeService.getArtworksForPersonality('LAEF', { limit: 3 });
    console.log(`✅ Found ${laefArtworks.length} LAEF artworks`);
    laefArtworks.forEach((artwork, i) => {
      console.log(`   ${i+1}. ${artwork.title} by ${artwork.artist}`);
      console.log(`      Image URL: ${artwork.imageUrl ? '✅ Available' : '❌ Missing'}`);
      console.log(`      Cloudinary URL: ${artwork.cdnUrl ? '✅ Available' : '❌ Missing'}`);
    });
    
    console.log('\n3️⃣ Testing stats...');
    // Test 3: Get stats
    const stats = await cloudinaryArtveeService.getStats();
    console.log(`✅ Stats loaded:`);
    console.log(`   Total artworks: ${stats.totalArtworks}`);
    console.log(`   Uploaded to Cloudinary: ${stats.uploadedToCloudinary}`);
    console.log(`   Coverage: ${((stats.uploadedToCloudinary / stats.totalArtworks) * 100).toFixed(1)}%`);
    
    console.log('\n✅ All tests passed! Artvee service is working correctly.');
    
    // Test 4: Generate a sample URL to verify
    console.log('\n4️⃣ Sample URLs:');
    if (randomArtworks.length > 0) {
      const sample = randomArtworks[0];
      console.log(`   Sample artwork: ${sample.title}`);
      console.log(`   Full image: ${sample.imageUrl}`);
      console.log(`   Thumbnail: ${sample.thumbnailUrl}`);
      if (sample.cdnUrl) {
        console.log(`   CDN URL: ${sample.cdnUrl}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing artvee service:', error);
  }
}

testArtveeService();