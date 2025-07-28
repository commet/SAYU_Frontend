#!/usr/bin/env node

console.log('🎯 더 나은 대안: 공공데이터포털(data.go.kr)\n');

console.log('문화공공데이터광장 API가 401 오류를 내는 이유:');
console.log('- 승인 대기 중일 수 있음');
console.log('- 서비스키 활성화가 안 되었을 수 있음');
console.log('- API 문서와 실제 엔드포인트가 다를 수 있음\n');

console.log('✅ 공공데이터포털 추천 API (즉시 사용 가능):\n');

const recommendedAPIs = [
  {
    name: '한국관광공사_국문 관광정보 서비스',
    desc: '전국 문화시설, 전시, 축제 정보 포함',
    url: 'https://www.data.go.kr/data/15101578/openapi.do',
    features: [
      '즉시 승인',
      '전시/문화시설 정보 포함',
      '상세한 위치, 운영시간 정보',
      '이미지 URL 제공'
    ],
    endpoint: 'http://apis.data.go.kr/B551011/KorService1/searchKeyword1'
  },
  {
    name: '서울특별시_문화행사 정보',
    desc: '서울시 전체 문화행사 및 전시 정보',
    url: 'https://www.data.go.kr/data/15113122/openapi.do',
    features: [
      '자동 승인',
      '실시간 업데이트',
      '무료/유료 구분',
      '대표 이미지 제공'
    ],
    endpoint: 'http://openapi.seoul.go.kr:8088/[인증키]/json/culturalEventInfo/1/100/'
  },
  {
    name: '문화재청_문화유산 전시안내 서비스',
    desc: '박물관, 미술관 전시 정보',
    url: 'https://www.data.go.kr/data/15058493/openapi.do',
    features: [
      '국공립 박물관 전시',
      '전시 상세 정보',
      '관람료 정보'
    ]
  }
];

console.log('🏆 가장 추천: 한국관광공사 API\n');

recommendedAPIs.forEach((api, index) => {
  console.log(`${index + 1}. ${api.name}`);
  console.log(`   📝 ${api.desc}`);
  console.log(`   🔗 ${api.url}`);
  console.log(`   ✨ 특징:`);
  api.features.forEach(f => console.log(`      - ${f}`));
  if (api.endpoint) {
    console.log(`   📍 엔드포인트: ${api.endpoint}`);
  }
  console.log();
});

console.log('💡 한국관광공사 API 사용법:');
console.log(`
const tourAPIKey = '공공데이터포털에서_발급받은_키';
const url = 'http://apis.data.go.kr/B551011/KorService1/searchKeyword1';

const params = {
  serviceKey: tourAPIKey,
  numOfRows: 10,
  pageNo: 1,
  MobileOS: 'ETC',
  MobileApp: 'SAYU',
  keyword: '미술관',
  contentTypeId: 14  // 14=문화시설
};

// 이 API는 즉시 승인되고 바로 사용 가능!
`);

console.log('\n🚀 지금 바로 할 수 있는 것:');
console.log('1. data.go.kr에서 "한국관광공사" 검색');
console.log('2. "국문 관광정보 서비스" 활용신청');
console.log('3. 즉시 승인 → 바로 사용!');
console.log('4. 전시, 미술관, 갤러리 정보 모두 포함됨');
