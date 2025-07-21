#!/usr/bin/env node
require('dotenv').config();
const axios = require('axios');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function testCultureAPI() {
  console.log('🎨 문화공공데이터광장 전시정보 API 테스트\n');
  
  const serviceKey = '654edab9-ec4b-47db-9d5f-6e8d5d8cda50';
  const baseUrl = 'http://api.kcisa.kr/openapi/API_CCA_145/request';
  
  try {
    // API 호출
    const response = await axios.get(baseUrl, {
      params: {
        serviceKey: serviceKey,
        numOfRows: 10,
        pageNo: 1
      },
      headers: {
        'Accept': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ API 연결 성공!');
    console.log('📊 응답 구조:', Object.keys(response.data));
    
    // 응답 데이터 구조 확인
    if (response.data.response) {
      const data = response.data.response;
      console.log('\n📋 데이터 정보:');
      console.log(`   총 건수: ${data.body?.totalCount || '확인 중...'}`);
      console.log(`   현재 페이지: ${data.body?.pageNo || 1}`);
      
      // 전시 정보 파싱
      const items = data.body?.items?.item || [];
      console.log(`\n🎨 수집된 전시: ${items.length}개\n`);
      
      // 샘플 데이터 출력
      items.slice(0, 5).forEach((item, index) => {
        console.log(`${index + 1}. ${item.title || item.TITLE || '제목 없음'}`);
        console.log(`   장소: ${item.eventSite || item.EVENT_SITE || '정보 없음'}`);
        console.log(`   기간: ${item.period || item.PERIOD || '정보 없음'}`);
        console.log(`   관람료: ${item.charge || item.CHARGE || '정보 없음'}`);
        console.log();
      });
      
      // 데이터 구조 분석
      if (items.length > 0) {
        console.log('📊 사용 가능한 필드:');
        Object.keys(items[0]).forEach(key => {
          console.log(`   - ${key}: ${items[0][key]}`);
        });
      }
      
    } else {
      console.log('❌ 예상과 다른 응답 구조:', JSON.stringify(response.data, null, 2));
    }
    
  } catch (error) {
    console.error('❌ API 호출 실패:', error.message);
    if (error.response) {
      console.error('응답 상태:', error.response.status);
      console.error('응답 데이터:', error.response.data);
    }
  }
}

// 실행
testCultureAPI();