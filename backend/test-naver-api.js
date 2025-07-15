#!/usr/bin/env node

const axios = require('axios');
require('dotenv').config();

async function testNaverAPI() {
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('❌ Naver API credentials not found in .env file');
    return;
  }

  console.log('🔍 Testing Naver Search API...');
  console.log(`Client ID: ${clientId.substring(0, 5)}...${clientId.substring(clientId.length - 3)}`);

  const headers = {
    'X-Naver-Client-Id': clientId,
    'X-Naver-Client-Secret': clientSecret
  };

  try {
    // Test 1: Blog Search
    console.log('\n📝 Test 1: Blog Search API');
    const blogResponse = await axios.get('https://openapi.naver.com/v1/search/blog', {
      headers,
      params: {
        query: '국립현대미술관 현재전시',
        display: 5,
        sort: 'date'
      }
    });

    console.log(`✅ Blog search successful! Found ${blogResponse.data.total} results`);
    console.log(`Sample result: ${blogResponse.data.items[0]?.title || 'No results'}`);

    // Test 2: News Search
    console.log('\n📰 Test 2: News Search API');
    const newsResponse = await axios.get('https://openapi.naver.com/v1/search/news', {
      headers,
      params: {
        query: '서울시립미술관 전시',
        display: 5,
        sort: 'date'
      }
    });

    console.log(`✅ News search successful! Found ${newsResponse.data.total} results`);
    console.log(`Sample result: ${newsResponse.data.items[0]?.title || 'No results'}`);

    // Test 3: Exhibition parsing
    console.log('\n🎨 Test 3: Exhibition Info Parsing');
    const testQuery = '리움미술관 2024년 전시';
    const exhibitionResponse = await axios.get('https://openapi.naver.com/v1/search/blog', {
      headers,
      params: {
        query: testQuery,
        display: 10,
        sort: 'date'
      }
    });

    console.log(`Searching for: "${testQuery}"`);
    console.log(`Found ${exhibitionResponse.data.items.length} recent blog posts`);

    // Parse exhibition info from results
    const patterns = {
      dateRange: /(\d{4})[.\s]?(\d{1,2})[.\s]?(\d{1,2})\s*[-~]\s*(\d{4})[.\s]?(\d{1,2})[.\s]?(\d{1,2})/,
      title: /\[(.*?)\]|「(.*?)」|"(.*?)"|'(.*?)'/
    };

    exhibitionResponse.data.items.forEach((item, index) => {
      const content = item.description.replace(/<[^>]*>/g, '');
      const dateMatch = content.match(patterns.dateRange);
      const titleMatch = content.match(patterns.title);

      if (dateMatch || titleMatch) {
        console.log(`\n📍 Potential exhibition found in result ${index + 1}:`);
        if (titleMatch) {
          console.log(`   Title: ${titleMatch[1] || titleMatch[2] || titleMatch[3] || titleMatch[4]}`);
        }
        if (dateMatch) {
          console.log(`   Period: ${dateMatch[1]}.${dateMatch[2]}.${dateMatch[3]} ~ ${dateMatch[4]}.${dateMatch[5]}.${dateMatch[6]}`);
        }
      }
    });

    console.log('\n✨ All tests passed! Naver API is working correctly.');
    console.log('📊 Daily API limit: 25,000 calls');
    
  } catch (error) {
    console.error('\n❌ API Test Failed:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Message: ${error.response.data.errorMessage || error.response.data}`);
      
      if (error.response.status === 401) {
        console.error('\n🔑 Authentication failed. Please check your credentials.');
      } else if (error.response.status === 429) {
        console.error('\n⏱️ Rate limit exceeded. Try again later.');
      }
    } else {
      console.error(error.message);
    }
  }
}

// Run test
testNaverAPI();