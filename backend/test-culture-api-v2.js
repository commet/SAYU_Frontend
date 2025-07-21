#!/usr/bin/env node
require('dotenv').config();
const axios = require('axios');

async function testCultureAPIv2() {
  console.log('🎨 문화공공데이터광장 전시정보 API 테스트 v2\n');
  
  const serviceKey = '654edab9-ec4b-47db-9d5f-6e8d5d8cda50';
  
  // 다양한 엔드포인트 시도
  const endpoints = [
    {
      name: '전시정보 API (XML)',
      url: 'http://api.kcisa.kr/openapi/API_CCA_145/request',
      params: {
        serviceKey: serviceKey,
        numOfRows: 10,
        pageNo: 1
      }
    },
    {
      name: '전시정보 API (JSON 명시)',
      url: 'http://api.kcisa.kr/openapi/API_CCA_145/request',
      params: {
        serviceKey: serviceKey,
        numOfRows: 10,
        pageNo: 1,
        type: 'json'
      }
    },
    {
      name: '전시정보 API (키 인코딩)',
      url: 'http://api.kcisa.kr/openapi/API_CCA_145/request',
      params: {
        serviceKey: encodeURIComponent(serviceKey),
        numOfRows: 10,
        pageNo: 1
      }
    }
  ];
  
  for (const endpoint of endpoints) {
    console.log(`\n📌 테스트: ${endpoint.name}`);
    console.log(`   URL: ${endpoint.url}`);
    console.log(`   파라미터:`, endpoint.params);
    
    try {
      const response = await axios.get(endpoint.url, {
        params: endpoint.params,
        headers: {
          'Accept': 'application/json, application/xml'
        },
        timeout: 10000
      });
      
      console.log('   ✅ 성공!');
      console.log('   응답 타입:', response.headers['content-type']);
      
      // XML 응답인 경우
      if (response.headers['content-type']?.includes('xml')) {
        console.log('   📄 XML 응답 받음 (파싱 필요)');
        const dataStr = JSON.stringify(response.data).substring(0, 200);
        console.log('   샘플:', dataStr + '...');
      } 
      // JSON 응답인 경우
      else {
        console.log('   📊 데이터 구조:', Object.keys(response.data));
        if (response.data.response?.body?.items) {
          const items = response.data.response.body.items.item || [];
          console.log(`   🎨 전시 수: ${items.length}개`);
        }
      }
      
      break; // 성공하면 중단
      
    } catch (error) {
      console.log('   ❌ 실패:', error.message);
      if (error.response?.status === 401) {
        console.log('   💡 인증 문제 - 서비스키 확인 필요');
      }
    }
  }
  
  console.log('\n\n💡 문제 해결 방법:');
  console.log('1. 문화공공데이터광장 마이페이지에서 서비스키 재확인');
  console.log('2. API 신청 승인 상태 확인');
  console.log('3. API 문서의 정확한 엔드포인트 URL 확인');
  console.log('4. 서비스키가 URL 인코딩이 필요한지 확인');
  
  console.log('\n📌 대안: 공공데이터포털(data.go.kr) 사용 추천');
  console.log('   - 더 안정적인 API 제공');
  console.log('   - 명확한 문서와 예제');
  console.log('   - 즉시 승인되는 API 많음');
}

testCultureAPIv2();