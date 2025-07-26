require('dotenv').config();
const axios = require('axios');

const API_BASE = process.env.API_BASE_URL || 'http://localhost:3001';

async function testVenueAPI() {
  console.log('🧪 Venue API 테스트 시작...\n');

  try {
    // 1. 한국어로 서울 미술관 조회
    console.log('1. 한국어로 서울 미술관 조회:');
    const seoulMuseumsKo = await axios.get(`${API_BASE}/api/venues`, {
      params: {
        city: '서울',
        type: 'museum',
        lang: 'ko',
        limit: 5
      }
    });
    
    console.log(`총 ${seoulMuseumsKo.data.pagination.total}개 중 ${seoulMuseumsKo.data.data.length}개 표시:`);
    seoulMuseumsKo.data.data.forEach((venue, i) => {
      console.log(`  ${i+1}. ${venue.name} (${venue.city})`);
    });
    console.log('');

    // 2. 영어로 뉴욕 갤러리 조회
    console.log('2. 영어로 뉴욕 갤러리 조회:');
    const nycGalleriesEn = await axios.get(`${API_BASE}/api/venues`, {
      params: {
        city: 'New York',
        type: 'gallery',
        lang: 'en',
        limit: 5
      }
    });
    
    console.log(`총 ${nycGalleriesEn.data.pagination.total}개 중 ${nycGalleriesEn.data.data.length}개 표시:`);
    nycGalleriesEn.data.data.forEach((venue, i) => {
      console.log(`  ${i+1}. ${venue.name} (${venue.city})`);
    });
    console.log('');

    // 3. 한국어로 뉴욕 갤러리 조회 (번역 테스트)
    console.log('3. 한국어로 뉴욕 갤러리 조회 (번역):');
    const nycGalleriesKo = await axios.get(`${API_BASE}/api/venues`, {
      params: {
        city: 'New York',
        type: 'gallery',
        lang: 'ko',
        limit: 5
      }
    });
    
    nycGalleriesKo.data.data.forEach((venue, i) => {
      console.log(`  ${i+1}. ${venue.name} (${venue.city})`);
    });
    console.log('');

    // 4. 검색 테스트
    console.log('4. "갤러리" 검색 (한국어):');
    const searchKo = await axios.get(`${API_BASE}/api/venues/search`, {
      params: {
        q: '갤러리',
        lang: 'ko',
        limit: 5
      }
    });
    
    searchKo.data.data.forEach((venue, i) => {
      console.log(`  ${i+1}. ${venue.name} (${venue.city}, ${venue.country})`);
    });
    console.log('');

    // 5. "Museum" 검색 (영어)
    console.log('5. "Museum" 검색 (영어):');
    const searchEn = await axios.get(`${API_BASE}/api/venues/search`, {
      params: {
        q: 'Museum',
        lang: 'en',
        limit: 5
      }
    });
    
    searchEn.data.data.forEach((venue, i) => {
      console.log(`  ${i+1}. ${venue.name} (${venue.city}, ${venue.country})`);
    });
    console.log('');

    // 6. 국가별 통계 (한국어)
    console.log('6. 국가별 통계 (한국어):');
    const countriesKo = await axios.get(`${API_BASE}/api/venues/countries`, {
      params: { lang: 'ko' }
    });
    
    countriesKo.data.data.slice(0, 10).forEach((country, i) => {
      console.log(`  ${i+1}. ${country.country_display}: ${country.venue_count}개 (${country.city_count}개 도시)`);
    });
    console.log('');

    // 7. 국가별 통계 (영어)
    console.log('7. 국가별 통계 (영어):');
    const countriesEn = await axios.get(`${API_BASE}/api/venues/countries`, {
      params: { lang: 'en' }
    });
    
    countriesEn.data.data.slice(0, 10).forEach((country, i) => {
      console.log(`  ${i+1}. ${country.country_display}: ${country.venue_count} venues (${country.city_count} cities)`);
    });
    console.log('');

    // 8. 한국 도시별 통계
    console.log('8. 한국 도시별 통계:');
    const koreanCities = await axios.get(`${API_BASE}/api/venues/cities`, {
      params: { 
        country: 'South Korea',
        lang: 'ko'
      }
    });
    
    koreanCities.data.data.slice(0, 10).forEach((city, i) => {
      console.log(`  ${i+1}. ${city.city}: ${city.venue_count}개 (박물관: ${city.museum_count}, 갤러리: ${city.gallery_count})`);
    });

    console.log('\n✅ 모든 테스트 완료!');
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error.response?.data || error.message);
  }
}

testVenueAPI();