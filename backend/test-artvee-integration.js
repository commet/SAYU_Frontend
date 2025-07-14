const axios = require('axios');

async function testArtveeIntegration() {
  const baseUrl = 'http://localhost:3001/api/artvee';
  
  try {
    console.log('🎨 Testing Artvee Integration...\n');
    
    // Test 1: Get random artworks for a personality type
    console.log('1. Testing random artworks endpoint for LAEF personality:');
    const randomResponse = await axios.get(`${baseUrl}/random/LAEF/5`);
    console.log(`   ✓ Found ${randomResponse.data.count} artworks`);
    console.log(`   ✓ First artwork: ${randomResponse.data.artworks[0].title} by ${randomResponse.data.artworks[0].artist}`);
    
    // Test 2: Get available artworks for a personality type
    console.log('\n2. Testing available artworks endpoint:');
    const availableResponse = await axios.get(`${baseUrl}/available/LAEF`);
    console.log(`   ✓ Total artworks for LAEF: ${availableResponse.data.totalArtworks}`);
    console.log(`   ✓ Available with images: ${availableResponse.data.availableArtworks}`);
    
    // Test 3: Test image serving
    if (randomResponse.data.artworks.length > 0) {
      const artwork = randomResponse.data.artworks[0];
      console.log('\n3. Testing image serving:');
      
      // Test thumbnail
      const thumbUrl = `${baseUrl}/images/thumbnails/${artwork.artveeId}.jpg`;
      console.log(`   Testing thumbnail: ${thumbUrl}`);
      const thumbResponse = await axios.head(`http://localhost:3001${artwork.thumbnailUrl}`);
      console.log(`   ✓ Thumbnail available (${thumbResponse.headers['content-length']} bytes)`);
      
      // Test full image
      const fullUrl = `${baseUrl}/images/full/${artwork.artveeId}.jpg`;
      console.log(`   Testing full image: ${fullUrl}`);
      const fullResponse = await axios.head(`http://localhost:3001${artwork.imageUrl}`);
      console.log(`   ✓ Full image available (${fullResponse.headers['content-length']} bytes)`);
    }
    
    // Test 4: Test different personality types
    console.log('\n4. Testing multiple personality types:');
    const personalities = ['LAEF', 'LAEC', 'LREF', 'SREF'];
    for (const personality of personalities) {
      const response = await axios.get(`${baseUrl}/random/${personality}/3`);
      console.log(`   ✓ ${personality}: ${response.data.count} artworks found`);
    }
    
    console.log('\n✅ All tests passed! Artvee integration is working correctly.');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Response:', error.response.data);
    }
  }
}

testArtveeIntegration();