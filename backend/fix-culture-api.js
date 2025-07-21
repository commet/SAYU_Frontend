#!/usr/bin/env node
const axios = require('axios');
const xml2js = require('xml2js');

async function fixCultureAPI() {
  console.log('🔧 문화공공데이터광장 API 401 오류 해결\n');
  
  const serviceKey = '654edab9-ec4b-47db-9d5f-6e8d5d8cda50';
  
  // 가능한 모든 방법 시도
  const attempts = [
    {
      name: 'GET 요청 (쿼리 파라미터)',
      method: 'GET',
      url: 'http://api.kcisa.kr/openapi/API_CCA_145/request',
      params: { serviceKey }
    },
    {
      name: 'GET 요청 (URL에 직접 포함)',
      method: 'GET', 
      url: `http://api.kcisa.kr/openapi/API_CCA_145/request?serviceKey=${serviceKey}`,
      params: null
    },
    {
      name: 'POST 요청 (form-data)',
      method: 'POST',
      url: 'http://api.kcisa.kr/openapi/API_CCA_145/request',
      data: new URLSearchParams({ serviceKey }),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    },
    {
      name: 'Header에 서비스키',
      method: 'GET',
      url: 'http://api.kcisa.kr/openapi/API_CCA_145/request',
      headers: { 
        'Authorization': `Bearer ${serviceKey}`,
        'serviceKey': serviceKey 
      }
    }
  ];

  for (const attempt of attempts) {
    console.log(`\n🔍 시도: ${attempt.name}`);
    
    try {
      const config = {
        method: attempt.method,
        url: attempt.url,
        timeout: 10000
      };
      
      if (attempt.params) config.params = attempt.params;
      if (attempt.data) config.data = attempt.data;
      if (attempt.headers) config.headers = attempt.headers;
      
      const response = await axios(config);
      
      console.log('✅ 성공!');
      console.log('응답 타입:', response.headers['content-type']);
      
      // XML 응답 처리
      if (typeof response.data === 'string' && response.data.includes('<?xml')) {
        console.log('📄 XML 응답 받음');
        
        const parser = new xml2js.Parser();
        const result = await parser.parseStringPromise(response.data);
        
        console.log('\n파싱된 데이터 구조:', Object.keys(result));
        
        // 전시 정보 추출 시도
        if (result.response?.body?.[0]?.items?.[0]?.item) {
          const items = result.response.body[0].items[0].item;
          console.log(`\n🎨 전시 정보 ${items.length}개 발견!`);
          
          // 샘플 출력
          items.slice(0, 3).forEach((item, idx) => {
            console.log(`\n${idx + 1}. ${item.title?.[0] || '제목 없음'}`);
            console.log(`   장소: ${item.eventSite?.[0] || '정보 없음'}`);
            console.log(`   기간: ${item.period?.[0] || '정보 없음'}`);
          });
        }
        
        return result;
      }
      
      // JSON 응답 처리
      else if (response.data) {
        console.log('📊 응답 데이터:', JSON.stringify(response.data, null, 2).substring(0, 500));
      }
      
    } catch (error) {
      console.log(`❌ 실패: ${error.message}`);
      if (error.response?.status === 401) {
        console.log('💡 인증 실패 - 다른 방법 시도 중...');
      }
    }
  }
  
  console.log('\n\n📌 추가 확인사항:');
  console.log('1. 문화공공데이터광장 마이페이지에서 API 상태 확인');
  console.log('2. 서비스키 활성화 여부 확인');
  console.log('3. API 문서에서 정확한 인증 방법 확인');
  console.log('4. 혹시 "인증키"와 "서비스키"가 다른 것은 아닌지 확인');
}

// xml2js 설치 확인
try {
  require('xml2js');
  fixCultureAPI();
} catch (e) {
  console.log('📦 xml2js 설치 필요: npm install xml2js');
}