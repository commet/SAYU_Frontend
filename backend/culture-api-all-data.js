#!/usr/bin/env node
require('dotenv').config();
const axios = require('axios');

async function getAllCultureData() {
  console.log('🎨 문화공공데이터광장 전체 데이터 받기 시도\n');
  
  const serviceKey = '654edab9-ec4b-47db-9d5f-6e8d5d8cda50';
  const baseUrl = 'https://api.kcisa.kr/openapi/API_CCA_144/request';
  
  // 다양한 방법으로 시도
  const attempts = [
    {
      name: '기본 파라미터로 시도',
      params: {
        serviceKey: serviceKey,
        numOfRows: '1000',  // 많이 요청
        pageNo: '1'
      }
    },
    {
      name: '최소 파라미터로 시도', 
      params: {
        serviceKey: serviceKey
      }
    },
    {
      name: '다른 페이지 시도',
      params: {
        serviceKey: serviceKey,
        numOfRows: '100',
        pageNo: '100'  // 중간 페이지
      }
    },
    {
      name: '마지막 페이지 시도',
      params: {
        serviceKey: serviceKey,
        numOfRows: '10',
        pageNo: '4888'  // 거의 마지막 (48886 / 10)
      }
    }
  ];
  
  for (const attempt of attempts) {
    console.log(`\n📌 ${attempt.name}`);
    console.log('파라미터:', attempt.params);
    
    try {
      const response = await axios.get(baseUrl, {
        params: attempt.params,
        headers: {
          'Accept': 'application/json'
        },
        timeout: 15000
      });
      
      const data = response.data;
      
      if (data.response?.header?.resultCode === '0000') {
        console.log('✅ 성공');
        console.log(`총 데이터: ${data.response.body.totalCount}개`);
        console.log(`현재 페이지: ${data.response.body.pageNo}`);
        console.log(`페이지당 개수: ${data.response.body.numOfRows}`);
        
        if (data.response.body.items) {
          console.log('🎉 items 발견!');
          const items = Array.isArray(data.response.body.items.item) 
            ? data.response.body.items.item 
            : [data.response.body.items.item];
          console.log(`데이터 개수: ${items.length}개`);
          
          if (items.length > 0) {
            console.log('\n첫 번째 데이터 샘플:');
            console.log(JSON.stringify(items[0], null, 2));
            return items;
          }
        } else {
          console.log('⚠️ items가 여전히 null');
        }
      }
      
    } catch (error) {
      console.log(`❌ 실패: ${error.message}`);
    }
  }
  
  console.log('\n\n💡 분석 결과:');
  console.log('1. API는 정상 작동하지만 items를 제공하지 않음');
  console.log('2. 가능한 원인:');
  console.log('   - API가 비활성화 상태');
  console.log('   - 데이터가 실제로 없음');
  console.log('   - 다른 API 엔드포인트 사용 필요');
  console.log('\n3. 해결 방법:');
  console.log('   - 문화공공데이터광장 고객센터 문의');
  console.log('   - API 문서에서 다른 엔드포인트 확인');
  console.log('   - 또는 한국관광공사 API 사용 (권장)');
  
  // API_CCA_145도 시도해보기
  console.log('\n\n🔄 API_CCA_145 (전시정보) 재시도...');
  try {
    const url145 = 'https://api.kcisa.kr/openapi/API_CCA_145/request';
    const response = await axios.get(url145, {
      params: { serviceKey: serviceKey },
      headers: { 'Accept': 'application/json' },
      timeout: 10000
    });
    
    console.log('API_CCA_145 응답:', response.status);
  } catch (err) {
    console.log('API_CCA_145도 실패:', err.message);
  }
}

getAllCultureData();