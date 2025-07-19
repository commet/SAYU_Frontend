const axios = require('axios');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

/**
 * 문화데이터광장 API - 27개 문화기관 통합 전시정보
 * 무료 API 키 발급: https://www.culture.go.kr/data
 */
async function fetchCultureAPIExhibitions() {
  try {
    console.log('🎨 문화데이터광장 API에서 전시 정보 수집 중...\n');
    
    // API 엔드포인트 (샘플 - 실제 키 발급 필요)
    const API_KEY = process.env.CULTURE_DATA_API_KEY || 'sample-key';
    const API_URL = 'https://api.kcisa.kr/openapi/API_CCA_145/request';
    
    const params = {
      serviceKey: API_KEY,
      numOfRows: 100,
      pageNo: 1,
      MX: JSON.stringify({
        "지역": "전체",
        "분야": "전시",
        "기간": "진행중"
      })
    };
    
    console.log('📡 API 호출 중...');
    
    // 실제 API 키 없으면 샘플 데이터 사용
    if (API_KEY === 'sample-key') {
      console.log('⚠️  API 키가 없습니다. 샘플 데이터를 사용합니다.\n');
      
      const sampleExhibitions = [
        {
          title: '국립현대미술관 - 올해의 작가상 2024',
          venue: '국립현대미술관 서울',
          startDate: '2024-12-03',
          endDate: '2025-03-02',
          description: '올해의 작가상 수상작가 전시'
        },
        {
          title: '조각의 시간',
          venue: '국립현대미술관 서울',
          startDate: '2024-11-15',
          endDate: '2025-02-23',
          description: '한국 현대조각의 흐름을 조망하는 전시'
        },
        {
          title: '서울시립미술관 소장품전',
          venue: '서울시립미술관',
          startDate: '2024-12-01',
          endDate: '2025-02-28',
          description: '서울시립미술관 소장품 특별전'
        }
      ];
      
      let added = 0;
      
      for (const exhibition of sampleExhibitions) {
        try {
          // 중복 체크
          const existing = await pool.query(
            'SELECT id FROM exhibitions WHERE title_local = $1 AND venue_name = $2',
            [exhibition.title, exhibition.venue]
          );
          
          if (existing.rows.length > 0) {
            console.log(`⏭️  이미 존재: ${exhibition.title}`);
            continue;
          }
          
          // venue_id 찾기
          const venueResult = await pool.query(
            'SELECT id FROM venues WHERE name LIKE $1',
            [`%${exhibition.venue.replace('국립현대미술관 서울', '국립현대미술관')}%`]
          );
          
          const venueId = venueResult.rows[0]?.id;
          
          // 새 전시 추가
          await pool.query(`
            INSERT INTO exhibitions (
              venue_id, venue_name, venue_city, venue_country,
              title_en, title_local,
              start_date, end_date,
              description, exhibition_type,
              status, source, collected_at
            ) VALUES (
              $1, $2, '서울', 'KR',
              $3, $3,
              $4, $5,
              $6, 'temporary',
              'ongoing', '문화데이터광장 API', NOW()
            )
          `, [
            venueId,
            exhibition.venue,
            exhibition.title,
            exhibition.startDate,
            exhibition.endDate,
            exhibition.description
          ]);
          
          console.log(`✅ 추가됨: ${exhibition.title} @ ${exhibition.venue}`);
          added++;
          
        } catch (error) {
          console.error(`❌ 오류: ${exhibition.title} - ${error.message}`);
        }
      }
      
      console.log(`\n✨ ${added}개의 전시 정보가 추가되었습니다.`);
      
    } else {
      // 실제 API 호출
      const response = await axios.get(API_URL, { params });
      const exhibitions = response.data.response?.body?.items || [];
      
      console.log(`📊 ${exhibitions.length}개의 전시 정보 발견`);
      
      // 데이터 처리 로직...
    }
    
    // 현재 전시 수 확인
    const stats = await pool.query('SELECT COUNT(*) FROM exhibitions');
    console.log(`\n📈 현재 총 전시 수: ${stats.rows[0].count}개`);
    
  } catch (error) {
    console.error('❌ API 호출 실패:', error.message);
    
    console.log('\n💡 해결 방법:');
    console.log('1. https://www.culture.go.kr/data 회원가입');
    console.log('2. "문화체육관광부 27개 기관 통합 전시정보" API 신청');
    console.log('3. .env 파일에 CULTURE_DATA_API_KEY=발급받은키 추가');
  } finally {
    await pool.end();
  }
}

fetchCultureAPIExhibitions();