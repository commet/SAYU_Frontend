/**
 * 한국 공공 미술관 API 연동 설정
 * 
 * 1. 공공데이터포털 (data.go.kr)
 *    - 서울시립미술관 전시정보
 *    - API 신청 필요 (무료)
 * 
 * 2. 문화데이터광장 (culture.go.kr/data)
 *    - 12개 기관 통합 전시정보
 *    - 국립현대미술관, 서울시립미술관 등 포함
 */

const axios = require('axios');

// API 엔드포인트 정보
const APIS = {
  // 서울시립미술관 API
  SEOUL_MUSEUM: {
    name: '서울시립미술관',
    baseUrl: 'http://openapi.seoul.go.kr:8088',
    // API 키는 data.go.kr에서 신청 필요
    apiKey: process.env.SEOUL_DATA_API_KEY || 'sample',
    endpoints: {
      exhibitions: '/json/ListExhibitionOfSeoulMOAInfo'
    }
  },
  
  // 문화데이터광장 통합 API
  CULTURE_DATA: {
    name: '문화데이터광장',
    baseUrl: 'https://www.culture.go.kr/data/openapi',
    apiKey: process.env.CULTURE_DATA_API_KEY || 'sample',
    endpoints: {
      exhibitions: '/getExhibitionList'
    }
  },
  
  // 국립현대미술관 (MMCA)
  MMCA: {
    name: '국립현대미술관',
    note: '별도 API 미제공, 웹사이트 크롤링 필요',
    website: 'https://www.mmca.go.kr'
  }
};

// 테스트 함수
async function testPublicAPIs() {
  console.log('🏛️  한국 공공 미술관 API 연동 가이드\n');
  console.log('=' .repeat(60));
  
  console.log('\n📌 필요한 작업:\n');
  
  console.log('1. 공공데이터포털 (data.go.kr) 회원가입');
  console.log('2. 다음 API 신청:');
  console.log('   - 서울시립미술관 전시정보');
  console.log('   - 문화데이터광장 통합 전시정보');
  console.log('3. API 키를 .env 파일에 추가:');
  console.log('   SEOUL_DATA_API_KEY=your-key-here');
  console.log('   CULTURE_DATA_API_KEY=your-key-here');
  
  console.log('\n📊 예상 수집 가능 데이터:');
  console.log('- 서울시립미술관: 서소문, 남서울, 경희궁 등 전관');
  console.log('- 국립현대미술관: 서울, 과천, 덕수궁, 청주');
  console.log('- 국립중앙박물관 및 지방 국립박물관');
  console.log('- 대한민국역사박물관');
  console.log('- 전쟁기념관 등 12개 기관');
  
  console.log('\n✅ API 장점:');
  console.log('- 무료 사용');
  console.log('- 실시간 업데이트');
  console.log('- 공식 데이터 (100% 신뢰성)');
  console.log('- 표준화된 데이터 형식');
  
  console.log('\n🔗 신청 링크:');
  console.log('- 공공데이터포털: https://www.data.go.kr');
  console.log('- 문화데이터광장: https://www.culture.go.kr/data');
  
  console.log('\n' + '=' .repeat(60));
}

// 샘플 API 호출 함수 (API 키 발급 후 사용)
async function fetchSeoulMuseumExhibitions() {
  const { baseUrl, apiKey, endpoints } = APIS.SEOUL_MUSEUM;
  const url = `${baseUrl}/${apiKey}${endpoints.exhibitions}/1/100`;
  
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('API 호출 실패:', error.message);
    return null;
  }
}

module.exports = {
  APIS,
  testPublicAPIs,
  fetchSeoulMuseumExhibitions
};

// 직접 실행시 테스트
if (require.main === module) {
  testPublicAPIs();
}