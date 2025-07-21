#!/usr/bin/env node
require('dotenv').config();
const axios = require('axios');
const xml2js = require('xml2js');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function getCultureExhibitions() {
  console.log('🎨 문화공공데이터광장 전시정보 수집\n');
  
  const serviceKey = '654edab9-ec4b-47db-9d5f-6e8d5d8cda50';
  
  // 직접 URL 구성 (샘플 코드처럼)
  const url = 'https://api.kcisa.kr/openapi/API_CCA_144/request';
  const queryParams = '?' + 'serviceKey=' + serviceKey;
  const fullUrl = url + queryParams + '&numOfRows=100&pageNo=1';
  
  try {
    console.log('📡 API 호출...');
    console.log('URL:', fullUrl);
    
    const response = await axios.get(fullUrl, {
      headers: {
        'Accept': 'application/json, application/xml, text/plain'
      },
      timeout: 15000
    });
    
    console.log('✅ 응답 받음');
    console.log('상태:', response.status);
    console.log('타입:', response.headers['content-type']);
    
    // XML 파싱
    let data;
    if (response.headers['content-type']?.includes('xml')) {
      console.log('📄 XML 응답 파싱...');
      const parser = new xml2js.Parser();
      const result = await parser.parseStringPromise(response.data);
      
      // XML 구조를 JSON처럼 변환
      if (result.response) {
        data = {
          response: {
            header: {
              resultCode: result.response.header?.[0]?.resultCode?.[0],
              resultMsg: result.response.header?.[0]?.resultMsg?.[0]
            },
            body: {
              totalCount: result.response.body?.[0]?.totalCount?.[0],
              items: result.response.body?.[0]?.items?.[0]
            }
          }
        };
      }
    } else {
      data = response.data;
    }
    
    if (data.response) {
      console.log('\n📊 API 응답 정보:');
      console.log('결과 코드:', data.response.header.resultCode);
      console.log('결과 메시지:', data.response.header.resultMsg);
      console.log('전체 데이터 수:', data.response.body.totalCount);
      
      // items가 없으면 다른 방법 시도
      if (!data.response.body.items) {
        console.log('\n⚠️ items가 null입니다.');
        console.log('💡 이 API는 특정 조건이나 파라미터가 필요할 수 있습니다.');
        
        // 공공데이터포털 사용 권장
        console.log('\n🔄 대안: 공공데이터포털 API 사용 권장');
        console.log('1. data.go.kr에서 "한국관광공사" 검색');
        console.log('2. "국문 관광정보 서비스" 신청 (즉시 승인)');
        console.log('3. 미술관, 전시 정보 모두 포함');
        console.log('4. 안정적이고 데이터 품질 높음');
        
      } else {
        // 데이터가 있으면 처리
        const items = Array.isArray(data.response.body.items.item) 
          ? data.response.body.items.item 
          : [data.response.body.items.item];
          
        console.log(`\n🎨 ${items.length}개 데이터 수신`);
        
        // 전시 관련만 필터
        const exhibitions = items.filter(item => {
          const title = item.TITLE || '';
          const genre = item.GENRE || '';
          return !genre.includes('공연') && 
                 (title.includes('전시') || genre.includes('전시'));
        });
        
        console.log(`🖼️ 전시: ${exhibitions.length}개`);
        
        return exhibitions;
      }
    }
    
  } catch (error) {
    console.error('\n❌ 오류:', error.message);
    if (error.response) {
      console.error('상태 코드:', error.response.status);
    }
  }
  
  return [];
}

// 실행
getCultureExhibitions().then(exhibitions => {
  console.log('\n✨ 작업 완료');
  if (exhibitions.length > 0) {
    console.log('데이터베이스에 저장하려면 saveToDatabase 함수 구현 필요');
  }
  process.exit(0);
});