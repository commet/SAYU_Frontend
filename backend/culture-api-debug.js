#!/usr/bin/env node
const axios = require('axios');

async function debugCultureAPI() {
  console.log('🔍 문화포털 API 디버깅\n');
  
  const serviceKey = '+wfa+sUFfXVTtQtcbqA2cFvHiWWKJh2jLQzuMZywhdM0LfcNiHbuX9DkLvJJ5JDFa+3+DxNM7RHCETyzDMbzmA==';
  
  // 다양한 엔드포인트 시도
  const endpoints = [
    {
      name: '공공데이터포털 문화정보 API',
      url: 'http://apis.data.go.kr/1383000/gmdb/msc/gmdbMscList',
      params: {
        serviceKey: serviceKey,
        pageNo: 1,
        numOfRows: 10,
        type: 'xml'
      }
    },
    {
      name: '문화포털 공연전시 (기간별)',
      url: 'http://www.culture.go.kr/openapi/rest/publicperformancedisplays/period',
      params: {
        serviceKey: serviceKey,
        from: '20250701',
        to: '20250731',
        rows: 10,
        cPage: 1
      }
    },
    {
      name: 'KOPIS 공연예술통합전산망',
      url: 'http://www.kopis.or.kr/openApi/restful/pblprfr',
      params: {
        service: serviceKey,
        stdate: '20250701',
        eddate: '20250731',
        rows: 10,
        cpage: 1
      }
    },
    {
      name: '한국문화정보원 API',
      url: 'http://api.kcisa.kr/openapi/service/rest/meta1/getMeta01List',
      params: {
        serviceKey: serviceKey,
        numOfRows: 10,
        pageNo: 1
      }
    }
  ];
  
  for (const endpoint of endpoints) {
    console.log(`\n📌 ${endpoint.name}`);
    console.log(`URL: ${endpoint.url}`);
    
    try {
      const response = await axios.get(endpoint.url, {
        params: endpoint.params,
        headers: {
          'Accept': 'application/xml, text/xml, application/json'
        },
        timeout: 10000
      });
      
      console.log(`✅ 상태: ${response.status}`);
      console.log(`📄 타입: ${response.headers['content-type']}`);
      
      // 응답 내용 확인
      const data = response.data;
      if (typeof data === 'string') {
        console.log(`📝 응답 (처음 500자):\n${data.substring(0, 500)}`);
        
        // HTML 응답인지 확인
        if (data.includes('<html') || data.includes('<!DOCTYPE')) {
          console.log('⚠️  HTML 페이지 반환됨 (API가 아님)');
        } else if (data.includes('<?xml')) {
          console.log('✅ XML 응답 확인');
        } else if (data.includes('{') && data.includes('}')) {
          console.log('✅ JSON 응답 확인');
        }
      } else {
        console.log('✅ JSON 객체 응답');
        console.log(JSON.stringify(data, null, 2).substring(0, 500));
      }
      
    } catch (error) {
      console.log(`❌ 오류: ${error.message}`);
      if (error.response) {
        console.log(`   상태 코드: ${error.response.status}`);
        if (error.response.data) {
          console.log(`   응답: ${String(error.response.data).substring(0, 300)}`);
        }
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n\n💡 결론:');
  console.log('제공하신 API 키가 어떤 서비스용인지 확인이 필요합니다.');
  console.log('위 테스트 결과를 보고 어떤 API가 작동하는지 확인해주세요.');
}

debugCultureAPI();