require('dotenv').config();
const cloudinaryArtveeService = require('./src/services/cloudinaryArtveeService');

async function testService() {
  console.log('🧪 Testing Cloudinary Artvee Service...\n');

  try {
    // Test 1: 성격 유형별 작품 조회
    console.log('1️⃣ Testing getArtworksForPersonality...');
    const personalityArtworks = await cloudinaryArtveeService.getArtworksForPersonality('LAEF', { limit: 3 });
    console.log(`✅ Found ${personalityArtworks.length} artworks for LAEF`);
    
    if (personalityArtworks.length > 0) {
      const first = personalityArtworks[0];
      console.log('\nFirst artwork:');
      console.log('- Title:', first.title);
      console.log('- Artist:', first.artist);
      console.log('- Image URL:', first.imageUrl?.substring(0, 50) + '...');
      console.log('- Thumbnail URL:', first.thumbnailUrl?.substring(0, 50) + '...');
    }

    // Test 2: 개별 작품 조회
    console.log('\n2️⃣ Testing getArtworkById...');
    const artwork = await cloudinaryArtveeService.getArtworkById('self-portrait-27');
    if (artwork) {
      console.log('✅ Found artwork:', artwork.title);
      console.log('- Artist:', artwork.artist);
      console.log('- Has Cloudinary URL:', !!artwork.imageUrl);
    } else {
      console.log('❌ Artwork not found');
    }

    // Test 3: 랜덤 작품 조회
    console.log('\n3️⃣ Testing getRandomArtworks...');
    const randomArtworks = await cloudinaryArtveeService.getRandomArtworks(5);
    console.log(`✅ Found ${randomArtworks.length} random artworks`);

    // Test 4: 통계 확인
    console.log('\n4️⃣ Testing getStats...');
    const stats = await cloudinaryArtveeService.getStats();
    console.log('✅ Stats:');
    console.log('- Total artworks:', stats.totalArtworks);
    console.log('- Uploaded to Cloudinary:', stats.uploadedToCloudinary);
    console.log('- By personality type:', stats.byPersonalityType);

    console.log('\n✨ All tests completed successfully!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

// Run the test
testService();