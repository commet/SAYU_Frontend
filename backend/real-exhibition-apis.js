#!/usr/bin/env node

console.log('🎨 실제 사용 가능한 전시 정보 API\n');

const realAPIs = [
  {
    name: '문화체육관광부 12개 기관 전시정보 통합 API',
    url: 'https://www.data.go.kr/data/15105037/openapi.do',
    description: '국립현대미술관 등 12개 주요 기관의 전시 정보를 통합 제공',
    features: [
      '14개 주요 문화기관 전시 정보',
      '제목, 기간, 장소, 관람료 등 24개 표준화된 메타데이터',
      '실시간 업데이트',
      '무료 사용'
    ],
    institutions: [
      '국립현대미술관',
      '예술의전당', 
      '국립중앙박물관',
      '국립대구박물관',
      '국립김해박물관',
      '국립제주박물관',
      '국립공주박물관',
      '한국예술종합학교',
      '한국영상자료원',
      '대한민국역사박물관'
    ]
  },
  {
    name: '문화공공데이터광장 API',
    url: 'https://www.culture.go.kr/data/openapi/openapiList.do',
    description: '문화체육관광부 소속기관 문화정보 통합 플랫폼',
    features: [
      '8대 문화 분야별 데이터',
      '맞춤형 API 서비스',
      '전시, 공연, 축제 등 포괄',
      'RESTful API 제공'
    ]
  },
  {
    name: '국립현대미술관 개별 API',
    url: 'https://www.data.go.kr/data/15058313/openapi.do',
    description: 'MMCA 전시 정보 직접 제공',
    features: [
      '국립현대미술관 전시 상세 정보',
      '서울, 덕수궁, 과천, 청주 전관',
      '작가, 작품 정보 포함'
    ]
  }
];

console.log('✅ 즉시 사용 가능한 공식 API:\n');

realAPIs.forEach((api, index) => {
  console.log(`${index + 1}. ${api.name}`);
  console.log(`   🔗 ${api.url}`);
  console.log(`   📝 ${api.description}`);
  console.log(`   🎯 특징:`);
  api.features.forEach(feature => {
    console.log(`      • ${feature}`);
  });
  
  if (api.institutions) {
    console.log(`   🏛️  포함 기관:`);
    api.institutions.forEach(inst => {
      console.log(`      • ${inst}`);
    });
  }
  console.log();
});

console.log('\n📌 신청 방법:');
console.log('1. 공공데이터포털(data.go.kr) 회원가입');
console.log('2. 해당 API 페이지에서 "활용신청" 클릭');
console.log('3. 1-2일 내 승인 (자동승인인 경우 즉시)');
console.log('4. 마이페이지에서 인증키 확인');
console.log('5. backend/.env에 API_KEY 추가');

console.log('\n💡 추천: "문화체육관광부 12개 기관 전시정보"');
console.log('   이것만 있어도 주요 미술관 전시는 모두 커버 가능!');

console.log('\n🔧 예시 코드:');
console.log(`
const axios = require('axios');

async function getExhibitions() {
  const serviceKey = process.env.CULTURE_API_KEY;
  const url = \`http://api.data.go.kr/openapi/tn_pubr_public_museum_exhibition_api\`;
  
  const params = {
    serviceKey: serviceKey,
    pageNo: 1,
    numOfRows: 100,
    type: 'json',
    insttNm: '국립현대미술관' // 기관명으로 필터
  };
  
  const response = await axios.get(url, { params });
  return response.data.response.body.items;
}
`);