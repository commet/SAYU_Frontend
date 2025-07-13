const axios = require('axios');

const API_URL = 'http://localhost:3001';

async function testCloudinaryAPI() {
  console.log('🧪 Testing Cloudinary Artvee API...\n');

  try {
    // Test 1: 성격 유형별 작품 조회
    console.log('1️⃣ Testing personality artworks endpoint...');
    const personalityResponse = await axios.get(`${API_URL}/api/artvee/personality/LAEF?limit=3`);
    console.log('✅ Success! Got', personalityResponse.data.count, 'artworks');
    
    if (personalityResponse.data.data && personalityResponse.data.data.length > 0) {
      const firstArtwork = personalityResponse.data.data[0];
      console.log('\nFirst artwork:');
      console.log('- Title:', firstArtwork.title);
      console.log('- Artist:', firstArtwork.artist);
      console.log('- Cloudinary URL:', firstArtwork.imageUrl ? '✅ Present' : '❌ Missing');
      console.log('- Thumbnail URL:', firstArtwork.thumbnailUrl ? '✅ Present' : '❌ Missing');
    }

    // Test 2: 개별 작품 조회
    console.log('\n2️⃣ Testing individual artwork endpoint...');
    const artworkId = 'self-portrait-27';
    const artworkResponse = await axios.get(`${API_URL}/api/artvee/artwork/${artworkId}`);
    console.log('✅ Success! Got artwork:', artworkResponse.data.data?.title);

    // Test 3: 랜덤 작품 조회
    console.log('\n3️⃣ Testing random artworks endpoint...');
    const randomResponse = await axios.get(`${API_URL}/api/artvee/random?limit=5`);
    console.log('✅ Success! Got', randomResponse.data.count, 'random artworks');

    // Test 4: 통계 조회
    console.log('\n4️⃣ Testing stats endpoint...');
    const statsResponse = await axios.get(`${API_URL}/api/artvee/stats`);
    console.log('✅ Success! Stats:');
    console.log('- Total artworks:', statsResponse.data.data.totalArtworks);
    console.log('- Uploaded to Cloudinary:', statsResponse.data.data.uploadedToCloudinary);

    console.log('\n✨ All tests passed!');

  } catch (error) {
    console.error('\n❌ Error during testing:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Message:', error.message);
    }
  }
}

// Run tests
testCloudinaryAPI();