#!/usr/bin/env node
const axios = require('axios');

// Google Places API (New) 테스트
const API_KEY = process.env.GOOGLE_PLACES_API_KEY || '';

if (!API_KEY) {
  console.error('❌ GOOGLE_PLACES_API_KEY 환경변수가 설정되지 않았습니다.');
  console.log('터미널에서: export GOOGLE_PLACES_API_KEY="your-api-key-here"');
  console.log('또는 .env 파일에: GOOGLE_PLACES_API_KEY=your-api-key-here');
  process.exit(1);
}

async function testNewPlacesAPI() {
  console.log('🔍 Google Places API (New) 테스트\n');

  try {
    // 1. Text Search (New) API 테스트
    console.log('1️⃣ Text Search (New) API 테스트:');
    const textSearchUrl = 'https://places.googleapis.com/v1/places:searchText';
    
    const searchResponse = await axios.post(
      textSearchUrl,
      {
        textQuery: 'MoMA Museum of Modern Art New York',
        languageCode: 'en'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': API_KEY,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location'
        }
      }
    );

    if (searchResponse.data.places && searchResponse.data.places.length > 0) {
      console.log('✅ 검색 성공!');
      const place = searchResponse.data.places[0];
      console.log(`   장소명: ${place.displayName?.text || 'N/A'}`);
      console.log(`   주소: ${place.formattedAddress || 'N/A'}`);
      console.log(`   좌표: ${place.location?.latitude}, ${place.location?.longitude}`);
      console.log(`   Place ID: ${place.id}\n`);

      // 2. Place Details (New) API 테스트
      if (place.id) {
        console.log('2️⃣ Place Details (New) API 테스트:');
        const detailsUrl = `https://places.googleapis.com/v1/places/${place.id.replace('places/', '')}`;
        
        const detailsResponse = await axios.get(detailsUrl, {
          headers: {
            'X-Goog-Api-Key': API_KEY,
            'X-Goog-FieldMask': 'id,displayName,formattedAddress,location,rating,userRatingCount,websiteUri,nationalPhoneNumber,regularOpeningHours,currentOpeningHours'
          }
        });

        const details = detailsResponse.data;
        console.log('✅ 상세 정보 조회 성공!');
        console.log(`   평점: ${details.rating || 'N/A'} (${details.userRatingCount || 0}개 리뷰)`);
        console.log(`   웹사이트: ${details.websiteUri || 'N/A'}`);
        console.log(`   전화번호: ${details.nationalPhoneNumber || 'N/A'}`);
        
        if (details.regularOpeningHours?.weekdayDescriptions) {
          console.log('   운영 시간:');
          details.regularOpeningHours.weekdayDescriptions.forEach(day => {
            console.log(`     ${day}`);
          });
        }
      }
    } else {
      console.log('❌ 검색 결과 없음');
    }

  } catch (error) {
    console.error('❌ API 오류:', error.response?.data || error.message);
    
    if (error.response?.status === 403) {
      console.log('\n⚠️  API 키 문제 또는 API 활성화 필요:');
      console.log('1. Google Cloud Console에서 Places API (New) 활성화');
      console.log('2. API 키에 Places API (New) 권한 부여');
      console.log('3. 청구 계정 활성화 확인');
    }
  }
}

testNewPlacesAPI();