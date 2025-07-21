#!/usr/bin/env node
const axios = require('axios');

async function testTourAPI() {
  console.log('🔍 한국관광공사 API 키 테스트\n');
  
  // 다양한 키 형식 테스트
  const keys = [
    {
      name: '원본 인코딩 키',
      key: '%2Bwfa%2BsUFfXVTtQtcbqA2cFvHiWWKJh2jLQzuMZywhdM0LfcNiHbuX9DkLvJJ5JDFa%2B3%2BDxNM7RHCETyzDMbzmA%3D%3D'
    },
    {
      name: '디코딩된 키',
      key: '+wfa+sUFfXVTtQtcbqA2cFvHiWWKJh2jLQzuMZywhdM0LfcNiHbuX9DkLvJJ5JDFa+3+DxNM7RHCETyzDMbzmA=='
    },
    {
      name: '재인코딩된 키',
      key: encodeURIComponent('+wfa+sUFfXVTtQtcbqA2cFvHiWWKJh2jLQzuMZywhdM0LfcNiHbuX9DkLvJJ5JDFa+3+DxNM7RHCETyzDMbzmA==')
    }
  ];
  
  for (const keyInfo of keys) {
    console.log(`\n📌 ${keyInfo.name} 테스트`);
    console.log(`키: ${keyInfo.key.substring(0, 20)}...`);
    
    try {
      // 1. GET 파라미터로 테스트
      const url = `http://apis.data.go.kr/B551011/KorService1/areaCode1?serviceKey=${keyInfo.key}&numOfRows=1&pageNo=1&MobileOS=ETC&MobileApp=SAYU&_type=json`;
      
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0'
        }
      });
      
      console.log('응답 상태:', response.status);
      
      // XML 응답 처리
      if (typeof response.data === 'string' && response.data.includes('<?xml')) {
        const errorMatch = response.data.match(/<returnReasonCode>(.*?)<\/returnReasonCode>/);
        const msgMatch = response.data.match(/<returnAuthMsg>(.*?)<\/returnAuthMsg>/);
        
        if (errorMatch && errorMatch[1] === '00') {
          console.log('✅ 성공! API 키가 작동합니다.');
          
          // JSON 형식으로 다시 요청
          console.log('\nJSON 형식으로 재요청...');
          const jsonUrl = url.replace('_type=xml', '_type=json');
          const jsonResponse = await axios.get(jsonUrl);
          
          if (jsonResponse.data.response) {
            console.log('JSON 응답 성공:', jsonResponse.data.response.header.resultMsg);
            return keyInfo.key;
          }
        } else {
          console.log('❌ 실패');
          console.log('에러 코드:', errorMatch ? errorMatch[1] : '알 수 없음');
          console.log('에러 메시지:', msgMatch ? msgMatch[1] : '알 수 없음');
        }
      }
      
      // JSON 응답 처리
      else if (response.data.response) {
        if (response.data.response.header.resultCode === '0000') {
          console.log('✅ 성공! API 키가 작동합니다.');
          return keyInfo.key;
        } else {
          console.log('❌ 실패:', response.data.response.header.resultMsg);
        }
      }
      
    } catch (error) {
      console.log('❌ 요청 실패:', error.message);
      if (error.response) {
        console.log('응답 상태:', error.response.status);
      }
    }
  }
  
  console.log('\n\n💡 해결 방법:');
  console.log('1. API 키가 승인되었는지 확인');
  console.log('2. 서비스 활성화 상태 확인');
  console.log('3. 일일 호출 제한 확인');
  console.log('4. IP 제한이 있는지 확인');
}

testTourAPI();