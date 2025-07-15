#!/usr/bin/env node

const axios = require('axios');
require('dotenv').config();

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function testExhibitionAPI() {
  console.log('🧪 Testing Exhibition API endpoints...');
  console.log(`📍 API Base URL: ${API_BASE_URL}`);
  
  try {
    // 1. Test GET /api/exhibitions
    console.log('\n1. Testing GET /api/exhibitions...');
    const exhibitionsResponse = await axios.get(`${API_BASE_URL}/api/exhibitions?limit=5`, {
      headers: {
        'Content-Type': 'application/json'
      },
      decompress: false // Disable automatic decompression
    });
    console.log(`✅ Status: ${exhibitionsResponse.status}`);
    console.log(`📊 Found ${exhibitionsResponse.data.data.length} exhibitions`);
    console.log(`📄 Pagination:`, exhibitionsResponse.data.pagination);
    console.log(`📈 Stats:`, exhibitionsResponse.data.stats);
    
    // 2. Test GET /api/exhibitions/:id (first exhibition)
    if (exhibitionsResponse.data.data.length > 0) {
      const firstExhibition = exhibitionsResponse.data.data[0];
      console.log(`\n2. Testing GET /api/exhibitions/${firstExhibition.id}...`);
      
      const exhibitionResponse = await axios.get(`${API_BASE_URL}/api/exhibitions/${firstExhibition.id}`);
      console.log(`✅ Status: ${exhibitionResponse.status}`);
      console.log(`🎨 Exhibition: ${exhibitionResponse.data.data.title}`);
      console.log(`📍 Venue: ${exhibitionResponse.data.data.venue_name}`);
      console.log(`📅 Date: ${exhibitionResponse.data.data.start_date} ~ ${exhibitionResponse.data.data.end_date}`);
    }
    
    // 3. Test GET /api/venues
    console.log('\n3. Testing GET /api/venues...');
    const venuesResponse = await axios.get(`${API_BASE_URL}/api/venues?limit=10`);
    console.log(`✅ Status: ${venuesResponse.status}`);
    console.log(`🏛️  Found ${venuesResponse.data.data.length} venues`);
    
    // 4. Test GET /api/exhibitions/stats/cities
    console.log('\n4. Testing GET /api/exhibitions/stats/cities...');
    const statsResponse = await axios.get(`${API_BASE_URL}/api/exhibitions/stats/cities`);
    console.log(`✅ Status: ${statsResponse.status}`);
    console.log(`🌍 City Stats:`, JSON.stringify(statsResponse.data.data, null, 2));
    
    // 5. Test GET /api/exhibitions/popular
    console.log('\n5. Testing GET /api/exhibitions/popular...');
    const popularResponse = await axios.get(`${API_BASE_URL}/api/exhibitions/popular?limit=3`);
    console.log(`✅ Status: ${popularResponse.status}`);
    console.log(`🔥 Popular exhibitions: ${popularResponse.data.data.length}`);
    
    // 6. Test filtering
    console.log('\n6. Testing filtering - ongoing exhibitions in Seoul...');
    const filteredResponse = await axios.get(`${API_BASE_URL}/api/exhibitions?status=ongoing&city=서울&limit=3`);
    console.log(`✅ Status: ${filteredResponse.status}`);
    console.log(`🔍 Filtered results: ${filteredResponse.data.data.length}`);
    
    // 7. Test search
    console.log('\n7. Testing search functionality...');
    const searchResponse = await axios.get(`${API_BASE_URL}/api/exhibitions?search=미술관&limit=3`);
    console.log(`✅ Status: ${searchResponse.status}`);
    console.log(`🔍 Search results: ${searchResponse.data.data.length}`);
    
    console.log('\n✅ All API tests passed!');
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      console.error('Request was made but no response:', error.request);
    } else {
      console.error('Error config:', error.config);
    }
    console.error('Full error:', error);
  }
}

// Export for programmatic use
module.exports = { testExhibitionAPI };

// Run if called directly
if (require.main === module) {
  testExhibitionAPI();
}