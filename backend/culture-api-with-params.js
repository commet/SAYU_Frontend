#!/usr/bin/env node
require('dotenv').config();
const axios = require('axios');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function getCultureDataWithParams() {
  console.log('🎨 문화공공데이터광장 박물관/미술관 전시정보 API\n');
  
  const serviceKey = '654edab9-ec4b-47db-9d5f-6e8d5d8cda50'; // 원래 서비스키
  const baseUrl = 'https://api.kcisa.kr/openapi/API_CCA_144/request';
  
  // 다양한 검색어로 시도
  const searchTerms = [
    { museumNm: '미술관', evntNm: '전시' },
    { museumNm: '갤러리', evntNm: '전시' },
    { museumNm: '박물관', evntNm: '전시' },
    { museumNm: '국립', evntNm: '전시' },
    { museumNm: '서울', evntNm: '전시' },
    { museumNm: '현대', evntNm: '개인전' },
    { museumNm: '미술', evntNm: '특별전' }
  ];
  
  let allExhibitions = [];
  
  for (const term of searchTerms) {
    console.log(`\n🔍 검색: ${term.museumNm} + ${term.evntNm}`);
    
    try {
      const response = await axios.get(baseUrl, {
        params: {
          serviceKey: serviceKey,
          numOfRows: '100',
          pageNo: '1',
          museumNm: term.museumNm,
          evntNm: term.evntNm,
          dist: '100'  // 100km 반경
        },
        headers: {
          'Accept': 'application/json'
        },
        timeout: 15000
      });
      
      const data = response.data;
      
      if (data.response?.header?.resultCode === '0000') {
        console.log('✅ 성공');
        console.log(`총 결과: ${data.response.body.totalCount}개`);
        
        if (data.response.body.items?.item) {
          const items = Array.isArray(data.response.body.items.item) 
            ? data.response.body.items.item 
            : [data.response.body.items.item];
          
          console.log(`🎨 ${items.length}개 데이터 수집`);
          
          // 샘플 출력
          if (items.length > 0) {
            const sample = items[0];
            console.log(`\n샘플:`);
            console.log(`- 미술관: ${sample.museumNm}`);
            console.log(`- 주소: ${sample.museumRoadNmAddr || sample.museumLotnoAddr}`);
            console.log(`- 전시: ${sample.evntNm}`);
            console.log(`- 장소: ${sample.evntPlcNm}`);
          }
          
          allExhibitions = allExhibitions.concat(items);
        }
      }
      
    } catch (error) {
      console.log(`❌ 실패: ${error.message}`);
    }
  }
  
  // 중복 제거
  const uniqueExhibitions = allExhibitions.filter((item, index, self) =>
    index === self.findIndex(t => 
      t.evntNm === item.evntNm && t.museumNm === item.museumNm
    )
  );
  
  console.log(`\n\n✨ 총 수집된 전시: ${uniqueExhibitions.length}개 (중복 제거)`);
  
  return uniqueExhibitions;
}

async function saveToDatabase(exhibitions) {
  console.log('\n💾 데이터베이스 저장...');
  
  const client = await pool.connect();
  let saved = 0;
  
  try {
    for (const item of exhibitions) {
      try {
        // 전시 정보가 있는 경우만
        if (item.evntNm && item.museumNm) {
          await client.query(`
            INSERT INTO exhibitions (
              title_en, title_local, 
              venue_name, venue_city,
              description,
              source, collected_at
            ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
            ON CONFLICT (title_en, venue_name, start_date) DO UPDATE
            SET description = EXCLUDED.description,
                updated_at = NOW()
          `, [
            item.evntNm,
            item.evntNm,
            item.museumNm,
            item.museumRoadNmAddr?.split(' ')[0] || '서울',
            item.evntInfo || '',
            '문화공공데이터광장'
          ]);
          
          saved++;
        }
        
      } catch (err) {
        console.log(`⚠️ 저장 실패: ${err.message}`);
      }
    }
    
    console.log(`✅ ${saved}개 저장 완료`);
    
  } finally {
    client.release();
  }
}

// 실행
async function main() {
  const exhibitions = await getCultureDataWithParams();
  
  if (exhibitions.length > 0) {
    console.log('\n📊 수집된 전시 정보:');
    exhibitions.slice(0, 10).forEach((item, idx) => {
      console.log(`\n${idx + 1}. ${item.evntNm}`);
      console.log(`   미술관: ${item.museumNm}`);
      console.log(`   주소: ${item.museumRoadNmAddr || item.museumLotnoAddr}`);
      console.log(`   전화: ${item.museumOperInstTelno || '정보 없음'}`);
    });
    
    console.log(`\n💾 ${exhibitions.length}개를 저장하시겠습니까?`);
    console.log('저장하려면 주석 해제: // await saveToDatabase(exhibitions);');
    
    // await saveToDatabase(exhibitions);
  }
  
  process.exit(0);
}

main();