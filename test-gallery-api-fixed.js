// Gallery Collection API 테스트 스크립트 (UUID 형식 수정)
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

// UUID 형식의 테스트 데이터
const TEST_USER_ID = uuidv4();
const TEST_ARTWORK_ID = uuidv4();

const TEST_ARTWORK_DATA = {
  title: '테스트 작품 - 모나리자',
  artist: '레오나르도 다 빈치',
  year: '1503',
  imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/800px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg',
  medium: '유화',
  style: '르네상스',
  description: '세계에서 가장 유명한 초상화',
  museum: '루브르 박물관',
  department: '회화부',
  isPublicDomain: true,
  license: 'Public Domain',
  matchPercent: 98,
  curatorNote: '미소의 신비로움으로 유명한 작품',
  emotionTags: ['신비로운', '우아한', '고전적인'],
  tags: ['초상화', '르네상스', '이탈리아']
};

async function testGalleryAPI() {
  const baseUrl = 'http://localhost:3000/api/gallery/collection';
  
  console.log('🎨 Gallery Collection API 테스트 시작 (UUID 형식)\n');
  console.log('테스트 사용자 ID:', TEST_USER_ID);
  console.log('테스트 작품 ID:', TEST_ARTWORK_ID);
  console.log('=====================================\n');

  try {
    // 1. 저장된 작품 조회 테스트 (초기 상태)
    console.log('1️⃣ 초기 컬렉션 조회 테스트...');
    try {
      const getResponse1 = await axios.get(`${baseUrl}?userId=${TEST_USER_ID}`);
      console.log('✅ 초기 컬렉션:', {
        success: getResponse1.data.success,
        count: getResponse1.data.count,
        items: getResponse1.data.items.length
      });
    } catch (error) {
      console.log('ℹ️ 초기 조회:', error.response?.data || error.message);
    }
    console.log('\n');

    // 2. 작품 저장 테스트
    console.log('2️⃣ 작품 저장 테스트...');
    console.log('   저장할 작품:', {
      id: TEST_ARTWORK_ID,
      title: TEST_ARTWORK_DATA.title,
      artist: TEST_ARTWORK_DATA.artist
    });
    
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
      hasItems: getResponse2.data.items.length > 0
    });
    
    if (getResponse2.data.items.length > 0) {
      const savedItem = getResponse2.data.items[0];
      console.log('   저장된 작품 정보:', {
        title: savedItem.title,
        artist: savedItem.artist,
        style: savedItem.style,
        museum: savedItem.museum
      });
    }
    console.log('\n');

    // 4. 중복 저장 시도 테스트
    console.log('4️⃣ 중복 저장 테스트...');
    const duplicateSave = await axios.post(baseUrl, {
      userId: TEST_USER_ID,
      artworkId: TEST_ARTWORK_ID,
      action: 'save'
    });
    console.log('ℹ️ 중복 저장 결과:', duplicateSave.data);
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
      isEmpty: finalResponse.data.items.length === 0
    });
    console.log('\n');

    // 7. 실제 샘플 데이터로 테스트
    console.log('7️⃣ 실제 샘플 데이터 테스트...');
    const SAMPLE_ARTWORK_ID = 'a1111111-1111-1111-1111-111111111111'; // 이미 DB에 있는 작품
    
    const sampleSave = await axios.post(baseUrl, {
      userId: TEST_USER_ID,
      artworkId: SAMPLE_ARTWORK_ID,
      action: 'save'
    });
    console.log('✅ 샘플 작품 저장:', sampleSave.data);
    
    const sampleGet = await axios.get(`${baseUrl}?userId=${TEST_USER_ID}`);
    console.log('✅ 샘플 작품 조회:', {
      count: sampleGet.data.count,
      artwork: sampleGet.data.items[0]?.title
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
    
    if (error.response?.data) {
      console.error('\n상세 오류 정보:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// UUID 패키지 설치 확인
try {
  require('uuid');
} catch (e) {
  console.log('⚠️ uuid 패키지를 설치합니다...');
  require('child_process').execSync('npm install uuid', { stdio: 'inherit' });
}

// 스크립트 실행
console.log('🚀 Gallery Collection API 테스트 스크립트 (UUID 버전)\n');
testGalleryAPI().catch(console.error);