#!/usr/bin/env node
require('dotenv').config();
const axios = require('axios');

async function testAllCultureAPIs() {
  console.log('🎨 문화공공데이터광장 모든 API 테스트\n');
  
  const serviceKey = '654edab9-ec4b-47db-9d5f-6e8d5d8cda50';
  
  // 가능한 모든 API 엔드포인트
  const apis = [
    { name: '공연전시정보(통합)', code: 'API_CCA_145' },
    { name: '공연전시상세정보', code: 'API_CCA_144' },
    { name: '공연/전시정보', code: 'API_CCA_146' },
    { name: '전시정보', code: 'API_CCA_143' }
  ];
  
  for (const api of apis) {
    console.log(`\n📌 테스트: ${api.name} (${api.code})`);
    
    try {
      const response = await axios.get(`https://api.kcisa.kr/openapi/${api.code}/request`, {
        params: {
          serviceKey: serviceKey,
          numOfRows: '10',
          pageNo: '1'
        },
        headers: {
          'Accept': 'application/json'
        },
        timeout: 10000
      });
      
      const data = response.data;
      
      if (data.response?.header?.resultCode === '0000') {
        console.log('   ✅ 성공!');
        console.log(`   총 데이터: ${data.response.body.totalCount}개`);
        
        // items 확인
        if (data.response.body.items) {
          const items = Array.isArray(data.response.body.items.item) 
            ? data.response.body.items.item 
            : [data.response.body.items.item];
            
          console.log(`   수신 데이터: ${items.length}개`);
          
          if (items.length > 0 && items[0]) {
            console.log('   샘플 데이터:');
            console.log(`     제목: ${items[0].TITLE || items[0].title || '없음'}`);
            console.log(`     기관: ${items[0].CNTC_INSTT_NM || items[0].cntc_instt_nm || '없음'}`);
            console.log('   사용 가능한 필드:', Object.keys(items[0]).slice(0, 5).join(', '), '...');
          }
        } else {
          console.log('   ⚠️ items가 null입니다. 파라미터 조정 필요');
          
          // 다른 파라미터로 재시도
          console.log('   🔄 다른 파라미터로 재시도...');
          
          const retry = await axios.get(`https://api.kcisa.kr/openapi/${api.code}/request`, {
            params: {
              serviceKey: serviceKey,
              numOfRows: '10',
              pageNo: '1',
              keyword: '전시'  // 키워드 추가
            },
            timeout: 10000
          });
          
          if (retry.data.response?.body?.items) {
            console.log('   ✅ 키워드 파라미터로 성공!');
          }
        }
      }
      
    } catch (error) {
      console.log(`   ❌ 실패: ${error.message}`);
      if (error.response?.status === 401) {
        console.log('   💡 이 API는 다른 인증키가 필요할 수 있습니다');
      }
    }
  }
  
  console.log('\n\n💡 해결 방법:');
  console.log('1. totalCount는 있지만 items가 null인 경우:');
  console.log('   - 검색 키워드 파라미터 추가 필요');
  console.log('   - 날짜 범위 파라미터 추가 필요');
  console.log('   - 지역 파라미터 추가 필요');
  console.log('\n2. 문서 확인:');
  console.log('   - API 문서에서 필수 파라미터 확인');
  console.log('   - 샘플 코드의 파라미터 확인');
}

testAllCultureAPIs();