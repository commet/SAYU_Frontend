#!/usr/bin/env node
require('dotenv').config();
const axios = require('axios');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function getCultureExhibitions() {
  console.log('🎨 문화공공데이터광장 전시정보 API (JSON)\n');
  
  const serviceKey = '654edab9-ec4b-47db-9d5f-6e8d5d8cda50';
  const baseUrl = 'https://api.kcisa.kr/openapi/API_CCA_144/request';
  
  try {
    // 다양한 페이지로 시도 (items가 null인 경우 다른 페이지에 데이터가 있을 수 있음)
    for (let page = 1; page <= 5; page++) {
      console.log(`\n📡 페이지 ${page} 시도...`);
      
      const response = await axios.get(baseUrl, {
        params: {
          serviceKey: serviceKey,
          numOfRows: '100',
          pageNo: String(page)
        },
        headers: {
          'Accept': 'application/json'  // JSON 응답 명시
        },
        timeout: 15000
      });
      
      // 응답이 JSON인지 확인
      if (response.headers['content-type']?.includes('json')) {
        const data = response.data;
        
        console.log('✅ JSON 응답 받음');
        console.log(`결과: ${data.response?.header?.resultMsg}`);
        console.log(`전체 데이터: ${data.response?.body?.totalCount}개`);
        
        // items 확인
        if (data.response?.body?.items?.item) {
          const items = Array.isArray(data.response.body.items.item) 
            ? data.response.body.items.item 
            : [data.response.body.items.item];
          
          console.log(`\n🎨 ${items.length}개 데이터 발견!`);
          
          // 전시 관련 데이터만 필터
          const exhibitions = items.filter(item => {
            const genre = item.GENRE || '';
            const title = item.TITLE || '';
            const desc = item.DESCRIPTION || '';
            
            // 공연 제외하고 전시 관련만
            return !genre.includes('연극') && 
                   !genre.includes('무용') && 
                   !genre.includes('음악') &&
                   !genre.includes('오페라') &&
                   (title.includes('전시') || 
                    desc.includes('전시') ||
                    genre.includes('전시') ||
                    title.includes('展'));
          });
          
          console.log(`🖼️  전시 데이터: ${exhibitions.length}개`);
          
          // 샘플 출력
          exhibitions.slice(0, 5).forEach((item, idx) => {
            console.log(`\n${idx + 1}. ${item.TITLE}`);
            console.log(`   기관: ${item.CNTC_INSTT_NM || '정보 없음'}`);
            console.log(`   장소: ${item.EVENT_SITE || item.SPATIAL_COVERAGE || '정보 없음'}`);
            console.log(`   기간: ${item.PERIOD || item.EVENT_PERIOD || '정보 없음'}`);
            console.log(`   장르: ${item.GENRE || '정보 없음'}`);
            if (item.URL) console.log(`   링크: ${item.URL}`);
          });
          
          return exhibitions;
        }
      }
    }
    
    console.log('\n⚠️ 모든 페이지에서 items를 찾을 수 없습니다.');
    console.log('💡 API가 현재 데이터를 제공하지 않고 있을 수 있습니다.');
    
  } catch (error) {
    console.error('❌ 오류:', error.message);
    if (error.response) {
      console.error('상태:', error.response.status);
      console.error('응답:', error.response.data);
    }
  }
  
  return [];
}

async function saveToDatabase(exhibitions) {
  console.log('\n💾 데이터베이스 저장 시작...');
  
  const client = await pool.connect();
  let saved = 0;
  
  try {
    for (const item of exhibitions) {
      try {
        // 날짜 파싱
        let startDate = null, endDate = null;
        const period = item.PERIOD || item.EVENT_PERIOD || '';
        
        if (period) {
          // YYYYMMDD~YYYYMMDD 형식
          const match = period.match(/(\d{8})\s*~\s*(\d{8})/);
          if (match) {
            startDate = `${match[1].substring(0,4)}-${match[1].substring(4,6)}-${match[1].substring(6,8)}`;
            endDate = `${match[2].substring(0,4)}-${match[2].substring(4,6)}-${match[2].substring(6,8)}`;
          }
          // YYYY-MM-DD~YYYY-MM-DD 형식
          else {
            const match2 = period.match(/(\d{4}-\d{2}-\d{2})\s*~\s*(\d{4}-\d{2}-\d{2})/);
            if (match2) {
              startDate = match2[1];
              endDate = match2[2];
            }
          }
        }
        
        await client.query(`
          INSERT INTO exhibitions (
            title_en, title_local, venue_name, venue_city,
            start_date, end_date, description,
            source, source_url, collected_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
          ON CONFLICT (title_en, venue_name, start_date) DO UPDATE
          SET description = EXCLUDED.description,
              end_date = EXCLUDED.end_date,
              updated_at = NOW()
        `, [
          item.TITLE,
          item.TITLE,
          item.EVENT_SITE || item.SPATIAL_COVERAGE || item.CNTC_INSTT_NM,
          '서울', // 기본값
          startDate,
          endDate,
          item.DESCRIPTION || '',
          '문화공공데이터광장',
          item.URL || null
        ]);
        
        saved++;
        
      } catch (err) {
        console.log(`   ⚠️ 저장 실패: ${item.TITLE} - ${err.message}`);
      }
    }
    
    console.log(`✅ ${saved}개 전시 정보 저장 완료`);
    
  } finally {
    client.release();
  }
}

// 실행
async function main() {
  const exhibitions = await getCultureExhibitions();
  
  if (exhibitions.length > 0) {
    console.log(`\n💾 ${exhibitions.length}개 전시를 데이터베이스에 저장하시겠습니까?`);
    console.log('저장하려면 아래 주석을 해제하세요:');
    console.log('// await saveToDatabase(exhibitions);');
    
    // 실제 저장
    // await saveToDatabase(exhibitions);
  } else {
    console.log('\n💡 대안: 한국관광공사 API 사용을 권장합니다.');
  }
  
  process.exit(0);
}

main();