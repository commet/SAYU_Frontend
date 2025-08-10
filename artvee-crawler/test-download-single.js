// 환경변수 로드
require('dotenv').config();

const CompleteArtworkDownloader = require('./download-and-upload-complete.js');

/**
 * 단일 작품 다운로드 테스트
 */
async function testSingleDownload() {
  const downloader = new CompleteArtworkDownloader();
  
  const testArtwork = {
    url: 'https://artvee.com/dl/la-passion-dedmond-haraucourt-drame-sacre-en-six-parties-musique-de-jean-sebastien-bach/',
    artist: 'Alphonse Mucha',
    title: 'La Passion d\'Edmond Haraucourt',
    artveeId: 'la-passion-dedmond-haraucourt-drame-sacre-en-six-parties-musique-de-jean-sebastien-bach'
  };
  
  console.log('🧪 단일 작품 다운로드 테스트 시작');
  console.log(`📍 ${testArtwork.title}`);
  console.log(`👤 ${testArtwork.artist}`);
  console.log(`🔗 ${testArtwork.url}\n`);
  
  try {
    // 이미지 URL 추출 테스트
    console.log('1️⃣ 이미지 URL 추출 테스트...');
    const imageUrls = await downloader.extractImageUrls(testArtwork.url);
    console.log('✅ 추출된 이미지 URLs:', imageUrls);
    
    if (!imageUrls.full) {
      console.log('❌ 이미지 URL을 찾을 수 없습니다.');
      return;
    }
    
    // 메타데이터 추출 테스트  
    console.log('\n2️⃣ 메타데이터 추출 테스트...');
    const metadata = await downloader.extractMetadata(testArtwork.url);
    console.log('✅ 메타데이터:', metadata);
    
    // 초기화
    console.log('\n3️⃣ 디렉토리 초기화...');
    await downloader.init();
    
    // 단일 작품 처리
    console.log('\n4️⃣ 작품 처리 시작...');
    const result = await downloader.processArtwork(testArtwork);
    console.log('✅ 처리 결과:', result);
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
  }
}

testSingleDownload();