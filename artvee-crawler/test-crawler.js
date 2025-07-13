const axios = require('axios');
const cheerio = require('cheerio');

/**
 * 테스트 스크립트
 * 단일 작품 페이지로 크롤러 테스트
 */

async function testSingleArtwork() {
  console.log('🧪 Artvee 크롤러 테스트\n');
  
  // 테스트할 URL (실제 Artvee 작품 페이지)
  const testUrl = 'https://artvee.com/dl/the-starry-night/';
  
  try {
    console.log(`테스트 URL: ${testUrl}\n`);
    
    const response = await axios.get(testUrl, {
      headers: {
        'User-Agent': 'SAYU-Bot/1.0 (Test)'
      }
    });
    
    const $ = cheerio.load(response.data);
    
    // 각 추출 요소 테스트
    console.log('📋 추출된 데이터:\n');
    
    // 제목
    const title = $('h1').first().text().trim();
    console.log(`제목: ${title}`);
    
    // 작가
    const artist = $('a[href*="/artist/"]').first().text().trim();
    console.log(`작가: ${artist}`);
    
    // 이미지 URL
    const imageUrl = $('meta[property="og:image"]').attr('content');
    console.log(`이미지: ${imageUrl}`);
    
    // 다운로드 URL 찾기
    let downloadUrl = '';
    $('a').each((i, el) => {
      const href = $(el).attr('href');
      const text = $(el).text();
      if (text.includes('Download') || href?.includes('download')) {
        downloadUrl = href;
        return false; // break
      }
    });
    console.log(`다운로드: ${downloadUrl}`);
    
    // HTML 구조 분석
    console.log('\n🔍 HTML 구조 분석:');
    console.log('- h1 태그 수:', $('h1').length);
    console.log('- 이미지 수:', $('img').length);
    console.log('- 링크 수:', $('a').length);
    
    // 주요 클래스/ID 찾기
    console.log('\n🏷️ 주요 클래스/ID:');
    const importantElements = [
      '.artwork-image',
      '.artist-name',
      '.download-button',
      '#download',
      '.description',
      '.breadcrumb'
    ];
    
    importantElements.forEach(selector => {
      const exists = $(selector).length > 0;
      console.log(`${selector}: ${exists ? '✅ 있음' : '❌ 없음'}`);
    });
    
  } catch (error) {
    console.error('❌ 에러 발생:', error.message);
  }
}

// 실행
testSingleArtwork();