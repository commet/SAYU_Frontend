const axios = require('axios');
const cheerio = require('cheerio');

async function debugArtistPage(artistSlug) {
  const url = `https://artvee.com/artist/${artistSlug}/`;
  
  console.log(`🔍 디버깅: ${url}\n`);
  
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    
    console.log('📄 페이지 제목:', $('title').text());
    console.log('👤 작가 이름:', $('h1').text().trim());
    
    // 다양한 선택자로 작품 링크 찾기
    console.log('\n🔗 작품 링크 찾기:');
    
    const selectors = [
      'a[href*="/dl/"]',
      '.artwork-item a',
      '.product-item a',
      '.grid-item a',
      'article a',
      '.entry a'
    ];
    
    selectors.forEach(selector => {
      const elements = $(selector);
      console.log(`   ${selector}: ${elements.length}개`);
      
      if (elements.length > 0) {
        elements.slice(0, 3).each((i, el) => {
          const href = $(el).attr('href');
          const img = $(el).find('img');
          console.log(`      ${i + 1}. ${href}`);
          if (img.length) {
            console.log(`         이미지: ${img.attr('alt') || img.attr('title') || '제목없음'}`);
          }
        });
      }
    });
    
    // 이미지 태그들 확인
    console.log('\n🖼️ 이미지 태그들:');
    $('img').slice(0, 5).each((i, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src');
      const alt = $(el).attr('alt');
      console.log(`   ${i + 1}. ${src}`);
      console.log(`      alt: ${alt}`);
    });
    
    // 전체 HTML 구조 샘플
    console.log('\n📝 HTML 구조 샘플:');
    const mainContent = $('main, .main, .content, #content').first();
    if (mainContent.length) {
      console.log(mainContent.html().substring(0, 500) + '...');
    } else {
      console.log('메인 콘텐츠 영역을 찾을 수 없음');
    }
    
  } catch (error) {
    console.error('❌ 오류:', error.message);
  }
}

// 실행
const artistSlug = process.argv[2] || 'pierre-auguste-renoir';
debugArtistPage(artistSlug);