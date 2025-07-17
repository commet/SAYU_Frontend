const https = require('https');
const axios = require('axios');

// HTTPS 에이전트 설정 (인증서 검증 무시 - 테스트용)
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

async function testMetAPI() {
  console.log('🧪 Met Museum API 간단 테스트\n');
  
  try {
    // 1. 기본 API 테스트
    console.log('1️⃣ 단일 오브젝트 조회 테스트 (ID: 45734)');
    const objectUrl = 'https://collectionapi.metmuseum.org/public/collection/v1/objects/45734';
    
    const response = await axios.get(objectUrl, {
      httpsAgent,
      timeout: 10000
    });
    
    console.log('✅ 성공!');
    console.log('작품 정보:');
    console.log(`- 제목: ${response.data.title}`);
    console.log(`- 작가: ${response.data.artistDisplayName}`);
    console.log(`- 공개 도메인: ${response.data.isPublicDomain}`);
    console.log(`- 이미지: ${response.data.primaryImage ? '있음' : '없음'}`);
    
    if (response.data.primaryImage) {
      console.log(`- 이미지 URL: ${response.data.primaryImage.substring(0, 50)}...`);
    }
    
  } catch (error) {
    console.error('❌ 오류 발생:');
    console.error(`- 메시지: ${error.message}`);
    console.error(`- 코드: ${error.code}`);
    if (error.response) {
      console.error(`- 상태: ${error.response.status}`);
    }
  }
}

testMetAPI();