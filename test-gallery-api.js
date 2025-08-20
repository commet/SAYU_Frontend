// Gallery Collection API 테스트 스크립트
const axios = require('axios');

// 테스트용 데이터
const TEST_USER_ID = 'test-user-' + Date.now();
const TEST_ARTWORK_ID = 'test-artwork-' + Date.now();

const TEST_ARTWORK_DATA = {
  title: '테스트 작품',
  artist: '테스트 작가',
  year: '2024',
  imageUrl: 'https://via.placeholder.com/400',
  medium: '디지털 아트',
  style: '현대미술',
  description: '테스트용 작품입니다',
  museum: '테스트 미술관',
  department: '현대미술부',
  isPublicDomain: true,
  license: 'CC0',
  matchPercent: 95,
  curatorNote: '큐레이터 추천 작품',
  emotionTags: ['평화로운', '창의적인'],
  tags: ['테스트', '현대미술']
};

async function testGalleryAPI() {
  const baseUrl = 'http://localhost:3000/api/gallery/collection';
  
  console.log('🎨 Gallery Collection API 테스트 시작\n');
  console.log('테스트 사용자 ID:', TEST_USER_ID);
  console.log('테스트 작품 ID:', TEST_ARTWORK_ID);
  console.log('=====================================\n');

  try {
    // 1. 저장된 작품 조회 테스트 (초기 상태)
    console.log('1️⃣ 초기 컬렉션 조회 테스트...');
    const getResponse1 = await axios.get(`${baseUrl}?userId=${TEST_USER_ID}`);
    console.log('✅ 초기 컬렉션:', {
      success: getResponse1.data.success,
      count: getResponse1.data.count,
      items: getResponse1.data.items.length
    });
    console.log('\n');

    // 2. 작품 저장 테스트
    console.log('2️⃣ 작품 저장 테스트...');
    const saveResponse = await axios.post(baseUrl, {
      userId: TEST_USER_ID,
      artworkId: TEST_ARTWORK_ID,
      action: 'save',
      artworkData: TEST_ARTWORK_DATA
    });
    console.log('✅ 저장 결과:', saveResponse.data);
    console.log('\n');

    // 3. 저장 후 컬렉션 다시 조회
    console.log('3️⃣ 저장 후 컬렉션 조회...');
    const getResponse2 = await axios.get(`${baseUrl}?userId=${TEST_USER_ID}`);
    console.log('✅ 업데이트된 컬렉션:', {
      success: getResponse2.data.success,
      count: getResponse2.data.count,
      savedArtwork: getResponse2.data.items[0]
    });
    console.log('\n');

    // 4. 중복 저장 시도 테스트
    console.log('4️⃣ 중복 저장 테스트...');
    try {
      const duplicateSave = await axios.post(baseUrl, {
        userId: TEST_USER_ID,
        artworkId: TEST_ARTWORK_ID,
        action: 'save'
      });
      console.log('ℹ️ 중복 저장 결과:', duplicateSave.data);
    } catch (error) {
      console.log('ℹ️ 예상된 중복 저장 처리:', error.response?.data || error.message);
    }
    console.log('\n');

    // 5. 작품 삭제 테스트
    console.log('5️⃣ 작품 삭제 테스트...');
    const removeResponse = await axios.post(baseUrl, {
      userId: TEST_USER_ID,
      artworkId: TEST_ARTWORK_ID,
      action: 'remove'
    });
    console.log('✅ 삭제 결과:', removeResponse.data);
    console.log('\n');

    // 6. 삭제 후 최종 확인
    console.log('6️⃣ 삭제 후 최종 컬렉션 확인...');
    const finalResponse = await axios.get(`${baseUrl}?userId=${TEST_USER_ID}`);
    console.log('✅ 최종 컬렉션:', {
      success: finalResponse.data.success,
      count: finalResponse.data.count,
      items: finalResponse.data.items.length
    });
    console.log('\n');

    console.log('=====================================');
    console.log('✨ 모든 테스트 성공적으로 완료!');
    console.log('=====================================');

  } catch (error) {
    console.error('\n❌ 테스트 실패:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n⚠️ 서버가 실행 중이 아닙니다. Next.js 개발 서버를 먼저 시작하세요:');
      console.error('   npm run dev');
    }
  }
}

// 스크립트 실행
console.log('🚀 Gallery Collection API 테스트 스크립트\n');
testGalleryAPI().catch(console.error);