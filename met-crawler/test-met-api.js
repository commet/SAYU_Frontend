const axios = require('axios');

// Met Museum API 테스트
async function testMetAPI() {
  console.log('🧪 Met Museum API 테스트 시작...\n');
  
  try {
    // 1. Van Gogh 검색 테스트
    console.log('1️⃣ Van Gogh 작품 검색 테스트');
    const searchUrl = 'https://collectionapi.metmuseum.org/public/collection/v1/search?q=Vincent%20van%20Gogh&hasImages=true';
    const searchResult = await axios.get(searchUrl);
    console.log(`   ✅ ${searchResult.data.total}개 작품 발견\n`);
    
    // 2. 작품 상세 정보 테스트
    if (searchResult.data.objectIDs && searchResult.data.objectIDs.length > 0) {
      console.log('2️⃣ 작품 상세 정보 테스트');
      const objectId = searchResult.data.objectIDs[0];
      const detailUrl = `https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectId}`;
      const artwork = await axios.get(detailUrl);
      
      console.log('   작품 정보:');
      console.log(`   - ID: ${artwork.data.objectID}`);
      console.log(`   - 제목: ${artwork.data.title}`);
      console.log(`   - 작가: ${artwork.data.artistDisplayName}`);
      console.log(`   - 날짜: ${artwork.data.objectDate}`);
      console.log(`   - 부서: ${artwork.data.department}`);
      console.log(`   - 공개 도메인: ${artwork.data.isPublicDomain}`);
      console.log(`   - 하이라이트: ${artwork.data.isHighlight}`);
      console.log(`   - 이미지 URL: ${artwork.data.primaryImage ? '있음' : '없음'}\n`);
    }
    
    // 3. 하이라이트 작품 테스트
    console.log('3️⃣ 하이라이트 작품 검색 테스트');
    const highlightUrl = 'https://collectionapi.metmuseum.org/public/collection/v1/search?isHighlight=true&hasImages=true&q=*';
    const highlightResult = await axios.get(highlightUrl);
    console.log(`   ✅ ${highlightResult.data.total}개 하이라이트 작품 발견\n`);
    
    console.log('✨ API 테스트 완료! 모든 기능이 정상 작동합니다.');
    
  } catch (error) {
    console.error('❌ API 테스트 실패:', error.message);
    if (error.response) {
      console.error('   응답 상태:', error.response.status);
      console.error('   응답 데이터:', error.response.data);
    }
  }
}

// 실행
testMetAPI();