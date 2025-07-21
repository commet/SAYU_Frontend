#!/usr/bin/env node
require('dotenv').config();
const axios = require('axios');
const xml2js = require('xml2js');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function fetchCultureExhibitions() {
  console.log('🎨 문화공공데이터광장 전시정보 API 연동\n');
  
  const serviceKey = '654edab9-ec4b-47db-9d5f-6e8d5d8cda50';
  const url = 'https://api.kcisa.kr/openapi/API_CCA_145/request'; // 전시정보 API
  
  try {
    console.log('📡 API 호출 중...');
    
    const response = await axios.get(url, {
      params: {
        serviceKey: serviceKey,
        numOfRows: '100',  // 한번에 100개
        pageNo: '1'
      },
      timeout: 15000
    });
    
    console.log('✅ API 응답 받음');
    console.log('응답 타입:', response.headers['content-type']);
    
    let items = [];
    
    // JSON 응답 처리
    if (response.headers['content-type']?.includes('json')) {
      const data = response.data;
      console.log('📊 JSON 응답 구조:', Object.keys(data));
      
      if (data.response?.body?.items?.item) {
        items = Array.isArray(data.response.body.items.item) 
          ? data.response.body.items.item 
          : [data.response.body.items.item];
      }
    } 
    // XML 응답 처리
    else {
      const parser = new xml2js.Parser();
      const result = await parser.parseStringPromise(response.data);
      
      if (result.response?.body?.[0]?.items?.[0]?.item) {
        items = result.response.body[0].items[0].item;
      }
    }
    
    if (items.length > 0) {
      console.log(`\n🎨 총 ${items.length}개 전시/공연 정보 수집\n`);
      
      // 전시 정보만 필터링 (공연 제외)
      const exhibitions = items.filter(item => {
        const genre = item.GENRE?.[0] || '';
        const title = item.TITLE?.[0] || '';
        // 전시 관련 키워드 포함하거나 공연 관련 키워드 제외
        return !genre.includes('무용') && 
               !genre.includes('연극') && 
               !genre.includes('음악') &&
               !genre.includes('오페라') &&
               !genre.includes('뮤지컬') &&
               (title.includes('전시') || 
                title.includes('展') || 
                title.includes('미술') ||
                title.includes('갤러리') ||
                genre.includes('전시'));
      });
      
      console.log(`🖼️  전시만 필터링: ${exhibitions.length}개\n`);
      
      // 샘플 출력
      exhibitions.slice(0, 5).forEach((item, idx) => {
        console.log(`${idx + 1}. ${item.TITLE?.[0] || '제목 없음'}`);
        console.log(`   기관: ${item.CNTC_INSTT_NM?.[0] || '정보 없음'}`);
        console.log(`   장소: ${item.EVENT_SITE?.[0] || item.SPATIAL_COVERAGE?.[0] || '정보 없음'}`);
        console.log(`   기간: ${item.PERIOD?.[0] || item.EVENT_PERIOD?.[0] || '정보 없음'}`);
        console.log(`   장르: ${item.GENRE?.[0] || '정보 없음'}`);
        console.log();
      });
      
      return exhibitions;
      
    } else {
      console.log('❌ 예상과 다른 응답 구조');
      console.log(JSON.stringify(response.data, null, 2).substring(0, 1000));
      
      // 다른 가능한 구조 확인
      if (response.data.response) {
        console.log('\n응답 내부 구조:', Object.keys(response.data.response));
        if (response.data.response.body) {
          console.log('body 구조:', Object.keys(response.data.response.body));
        }
      }
    }
    
  } catch (error) {
    console.error('❌ API 호출 실패:', error.message);
    if (error.response) {
      console.error('응답 상태:', error.response.status);
      console.error('응답 내용:', error.response.data?.substring(0, 200));
    }
  }
}

async function saveToDatabase(exhibitions) {
  console.log('\n💾 데이터베이스에 저장 시작...');
  
  const client = await pool.connect();
  let savedCount = 0;
  
  try {
    for (const item of exhibitions) {
      try {
        // 데이터 파싱
        const title = item.TITLE?.[0] || '제목 없음';
        const venue = item.EVENT_SITE?.[0] || item.SPATIAL_COVERAGE?.[0] || item.CNTC_INSTT_NM?.[0];
        const period = item.PERIOD?.[0] || item.EVENT_PERIOD?.[0] || '';
        const description = item.DESCRIPTION?.[0] || '';
        
        // 날짜 파싱 (YYYYMMDD 형식 처리)
        let startDate = null;
        let endDate = null;
        
        if (period) {
          const dateMatch = period.match(/(\d{8})\s*~\s*(\d{8})/);
          if (dateMatch) {
            startDate = `${dateMatch[1].substring(0,4)}-${dateMatch[1].substring(4,6)}-${dateMatch[1].substring(6,8)}`;
            endDate = `${dateMatch[2].substring(0,4)}-${dateMatch[2].substring(4,6)}-${dateMatch[2].substring(6,8)}`;
          }
        }
        
        // DB에 저장
        await client.query(`
          INSERT INTO exhibitions (
            title_en, title_local, venue_name, 
            start_date, end_date, description,
            source, source_url, collected_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
          ON CONFLICT (title_en, venue_name, start_date) DO NOTHING
        `, [
          title,
          title,
          venue,
          startDate,
          endDate,
          description,
          '문화공공데이터광장',
          item.URL?.[0] || null
        ]);
        
        savedCount++;
        
      } catch (err) {
        console.log(`   ⚠️ 저장 실패: ${err.message}`);
      }
    }
    
    console.log(`\n✅ ${savedCount}개 전시 정보 저장 완료`);
    
  } finally {
    client.release();
  }
}

// 실행
async function main() {
  const exhibitions = await fetchCultureExhibitions();
  
  if (exhibitions && exhibitions.length > 0) {
    console.log('\n💡 데이터베이스에 저장하시겠습니까?');
    console.log('   주석 해제하고 실행: await saveToDatabase(exhibitions);');
    
    // 실제 저장하려면 아래 주석 해제
    // await saveToDatabase(exhibitions);
  }
  
  process.exit(0);
}

main();