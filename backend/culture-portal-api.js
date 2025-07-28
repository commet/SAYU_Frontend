#!/usr/bin/env node
const axios = require('axios');

async function testCultureAPIs() {
  console.log('🎨 한국 문화 관련 공공 API 조사\n');

  const apis = [
    {
      name: '문화포털 (한국문화정보원)',
      desc: '전국 문화시설, 전시, 공연 정보',
      url: 'https://www.culture.go.kr/data/openapi/openapiView.do?id=635',
      docs: 'https://www.culture.go.kr/data/openapi/openapiList.do',
      note: '무료, 일 1000건'
    },
    {
      name: '공공데이터포털 - 전시정보',
      desc: '한국문화정보원_전시정보',
      url: 'https://www.data.go.kr/data/15000282/openapi.do',
      endpoint: 'http://api.kcisa.kr/openapi/CNV_060/request',
      note: '인증키 필요'
    },
    {
      name: '국립중앙박물관 API',
      desc: '소장품 및 전시 정보',
      url: 'https://www.museum.go.kr/site/main/content/api_guide',
      note: '소장품 위주'
    },
    {
      name: '예술경영지원센터',
      desc: '미술시장 통계, 전시 정보',
      url: 'https://www.gokams.or.kr',
      note: '통계 위주'
    }
  ];

  console.log('📋 사용 가능한 문화 API 목록:\n');

  apis.forEach((api, index) => {
    console.log(`${index + 1}. ${api.name}`);
    console.log(`   📝 ${api.desc}`);
    console.log(`   🔗 ${api.url}`);
    console.log(`   💡 ${api.note}\n`);
  });

  // 문화포털 API 테스트
  console.log('\n🔍 문화포털 전시정보 API 구조:');
  console.log(`
  GET http://api.kcisa.kr/openapi/CNV_060/request
  Parameters:
    - serviceKey: 인증키
    - numOfRows: 한 페이지 결과 수
    - pageNo: 페이지 번호
    - keyword: 검색어 (예: '서울', '미술관')
    - period: 기간 (예: '202507')
  
  Response:
    - title: 전시명
    - place: 장소
    - startDate: 시작일
    - endDate: 종료일
    - charge: 관람료
    - url: 상세 URL
  `);

  console.log('\n💡 가장 유용한 API: 문화포털 전시정보 API');
  console.log('   ✅ 전국 전시 정보 제공');
  console.log('   ✅ 실시간 업데이트');
  console.log('   ✅ 무료 (일 1000건)');
  console.log('   ✅ 상세 정보 포함');

  console.log('\n📌 신청 방법:');
  console.log('1. https://www.culture.go.kr/data/openapi/openapiList.do 접속');
  console.log('2. "전시정보" API 신청');
  console.log('3. 승인 후 serviceKey 발급 (1-2일)');
  console.log('4. backend/.env에 CULTURE_API_KEY 추가');
}

testCultureAPIs();
