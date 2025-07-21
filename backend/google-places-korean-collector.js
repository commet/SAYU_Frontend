#!/usr/bin/env node
require('dotenv').config();

const { Pool } = require('pg');
const axios = require('axios');

// Google Places API 키
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || 'AIzaSyDlPB0BK6lUxzrVBSHt7RpXnKKX_SSFPTE';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// 지연 함수
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Google Places API (New) Text Search
async function searchPlace(venueName, city) {
  try {
    // 한국어 검색어 최적화
    const query = `${venueName} ${city}`;
    const url = 'https://places.googleapis.com/v1/places:searchText';
    
    const response = await axios.post(
      url,
      {
        textQuery: query,
        languageCode: 'ko',
        regionCode: 'KR'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.types'
        }
      }
    );

    if (response.data.places && response.data.places.length > 0) {
      // 미술관/갤러리 관련 타입을 가진 첫 번째 결과 선택
      const place = response.data.places.find(p => {
        const types = p.types || [];
        return types.some(t => 
          t.includes('museum') || 
          t.includes('art_gallery') || 
          t.includes('gallery') ||
          t.includes('tourist_attraction') ||
          t.includes('establishment')
        );
      }) || response.data.places[0];
      
      return place.id.replace('places/', '');
    }
    
    return null;
  } catch (error) {
    console.error(`❌ Place Search 오류 (${venueName}):`, error.response?.data?.error?.message || error.message);
    return null;
  }
}

// Google Places API (New) Place Details
async function getPlaceDetails(placeId) {
  try {
    const url = `https://places.googleapis.com/v1/places/${placeId}`;
    
    const response = await axios.get(url, {
      headers: {
        'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
        'X-Goog-FieldMask': 'id,displayName,formattedAddress,location,rating,userRatingCount,websiteUri,nationalPhoneNumber,internationalPhoneNumber,regularOpeningHours,types',
        'X-Goog-Language-Code': 'ko'
      }
    });

    return response.data;
  } catch (error) {
    console.error(`❌ Place Details 오류:`, error.response?.data?.error?.message || error.message);
    return null;
  }
}

// Venue 업데이트
async function updateVenueWithGoogleData(venueId, googleData) {
  try {
    const updateQuery = `
      UPDATE venues
      SET 
        google_place_id = $2,
        latitude = $3,
        longitude = $4,
        address = COALESCE($5, address),
        phone = COALESCE($6, phone),
        rating = $7,
        review_count = $8,
        website = COALESCE($9, website),
        opening_hours = $10,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;

    const openingHours = googleData.regularOpeningHours?.weekdayDescriptions ? 
      JSON.stringify(googleData.regularOpeningHours.weekdayDescriptions) : null;

    const values = [
      venueId,
      googleData.id,
      googleData.location?.latitude,
      googleData.location?.longitude,
      googleData.formattedAddress,
      googleData.nationalPhoneNumber,
      googleData.rating,
      googleData.userRatingCount,
      googleData.websiteUri,
      openingHours
    ];

    await pool.query(updateQuery, values);
    return true;
  } catch (error) {
    console.error(`❌ DB 업데이트 오류:`, error);
    return false;
  }
}

async function collectKoreanVenuesData() {
  try {
    console.log('🇰🇷 국내 미술관/갤러리 Google Places API (New) 데이터 수집 시작\n');
    console.log(`📍 API Key: ${GOOGLE_PLACES_API_KEY.substring(0, 10)}...`);

    // 국내 venues 중 Google Place ID가 없는 것들 가져오기
    const query = `
      SELECT id, name, city
      FROM venues
      WHERE country = 'KR' 
      AND (google_place_id IS NULL OR google_place_id = '')
      ORDER BY tier ASC, city, name
    `;

    const { rows: venues } = await pool.query(query);
    console.log(`\n📊 수집 대상: ${venues.length}개 국내 기관\n`);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < venues.length; i++) {
      const venue = venues[i];
      console.log(`\n[${i + 1}/${venues.length}] 🏛️  ${venue.name} (${venue.city || '서울'})`);

      // 1. Text Search로 place_id 찾기
      const placeId = await searchPlace(venue.name, venue.city || '서울');
      
      if (!placeId) {
        console.log(`   ⚠️  Place ID를 찾을 수 없음`);
        failCount++;
        await delay(1000); // API 제한 방지
        continue;
      }

      console.log(`   ✅ Place ID: ${placeId}`);

      // 2. Place Details로 상세 정보 가져오기
      await delay(500); // API 제한 방지
      const details = await getPlaceDetails(placeId);
      
      if (!details) {
        console.log(`   ⚠️  상세 정보를 가져올 수 없음`);
        failCount++;
        continue;
      }

      // 3. 데이터베이스 업데이트
      const updated = await updateVenueWithGoogleData(venue.id, details);
      
      if (updated) {
        console.log(`   ✅ 업데이트 완료:`);
        console.log(`      - 주소: ${details.formattedAddress || 'N/A'}`);
        console.log(`      - 좌표: ${details.location?.latitude}, ${details.location?.longitude}`);
        console.log(`      - 평점: ${details.rating || 'N/A'} (${details.userRatingCount || 0}개 리뷰)`);
        console.log(`      - 전화: ${details.nationalPhoneNumber || 'N/A'}`);
        console.log(`      - 웹사이트: ${details.websiteUri || 'N/A'}`);
        successCount++;
      } else {
        console.log(`   ❌ 업데이트 실패`);
        failCount++;
      }

      // API 호출 제한 방지 (분당 최대 100건)
      await delay(1500);
      
      // 10개마다 진행 상황 요약
      if ((i + 1) % 10 === 0) {
        console.log(`\n📊 진행 상황: ${i + 1}/${venues.length} (성공: ${successCount}, 실패: ${failCount})\n`);
      }
    }

    // 최종 통계
    console.log('\n' + '='.repeat(50));
    console.log('📊 수집 완료 통계:');
    console.log(`   ✅ 성공: ${successCount}개`);
    console.log(`   ❌ 실패: ${failCount}개`);
    console.log(`   📍 총계: ${venues.length}개`);

    // 업데이트된 국내 데이터 통계
    const statsQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(google_place_id) as with_place_id,
        COUNT(latitude) as with_coords,
        COUNT(address) as with_address,
        COUNT(phone) as with_phone,
        COUNT(rating) as with_rating,
        AVG(rating)::numeric(3,2) as avg_rating,
        MIN(rating) as min_rating,
        MAX(rating) as max_rating
      FROM venues
      WHERE country = 'KR'
    `;

    const { rows: [stats] } = await pool.query(statsQuery);
    
    console.log('\n📈 국내 기관 데이터 현황:');
    console.log(`   총 기관 수: ${stats.total}개`);
    console.log(`   Google Place ID 보유: ${stats.with_place_id}개 (${Math.round(stats.with_place_id/stats.total*100)}%)`);
    console.log(`   좌표 정보 보유: ${stats.with_coords}개 (${Math.round(stats.with_coords/stats.total*100)}%)`);
    console.log(`   주소 정보 보유: ${stats.with_address}개 (${Math.round(stats.with_address/stats.total*100)}%)`);
    console.log(`   전화번호 보유: ${stats.with_phone}개 (${Math.round(stats.with_phone/stats.total*100)}%)`);
    console.log(`   평점 정보 보유: ${stats.with_rating}개 (${Math.round(stats.with_rating/stats.total*100)}%)`);
    console.log(`   평균 평점: ${stats.avg_rating || 'N/A'} (${stats.min_rating || 'N/A'} ~ ${stats.max_rating || 'N/A'})`);

    // 도시별 수집 결과
    const cityResult = await pool.query(`
      SELECT 
        city,
        COUNT(*) as total,
        COUNT(google_place_id) as collected,
        ROUND(COUNT(google_place_id)::numeric/COUNT(*)::numeric * 100) as percentage
      FROM venues
      WHERE country = 'KR'
      GROUP BY city
      HAVING COUNT(*) > 3
      ORDER BY COUNT(*) DESC
      LIMIT 10
    `);
    
    console.log('\n🏙️ 도시별 수집 결과:');
    cityResult.rows.forEach(city => {
      const bar = '█'.repeat(Math.ceil(city.percentage / 10));
      const emptyBar = '░'.repeat(10 - Math.ceil(city.percentage / 10));
      console.log(`   ${(city.city || '기타').padEnd(8)} ${bar}${emptyBar} ${city.collected}/${city.total} (${city.percentage}%)`);
    });

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await pool.end();
  }
}

// 스크립트 실행
if (require.main === module) {
  collectKoreanVenuesData();
}

module.exports = { collectKoreanVenuesData };