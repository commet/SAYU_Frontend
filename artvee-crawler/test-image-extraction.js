const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Artvee 이미지 URL 추출 테스트
 */
async function testImageExtraction() {
  const testUrl = 'https://artvee.com/dl/la-passion-dedmond-haraucourt-drame-sacre-en-six-parties-musique-de-jean-sebastien-bach/';
  
  try {
    console.log('🔍 테스트 URL:', testUrl);
    
    const response = await axios.get(testUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 30000
    });
    
    const $ = cheerio.load(response.data);
    
    console.log('\n📊 페이지 분석:');
    
    // 다양한 이미지 선택자 테스트
    const selectors = [
      'img[src*="mdl.artvee.com"]',
      '.woocommerce-product-gallery__image img',
      '.wp-post-image',
      'img.attachment-woocommerce_single',
      'img[data-large_image]',
      'a[href*="mdl.artvee.com"]',
      'a[download]'
    ];
    
    for (const selector of selectors) {
      const elements = $(selector);
      if (elements.length > 0) {
        console.log(`\n✅ ${selector} (${elements.length}개 발견):`);
        elements.each((i, el) => {
          const $el = $(el);
          if (el.tagName === 'img') {
            const src = $el.attr('src') || $el.attr('data-src') || $el.attr('data-large_image');
            const alt = $el.attr('alt') || 'No alt';
            console.log(`  - ${src} (${alt})`);
          } else if (el.tagName === 'a') {
            const href = $el.attr('href');
            const text = $el.text().trim();
            console.log(`  - ${href} (${text})`);
          }
        });
      } else {
        console.log(`❌ ${selector}: 찾을 수 없음`);
      }
    }
    
    // 다운로드 링크 찾기
    console.log('\n🔍 다운로드 링크 찾기:');
    $('a').each((i, el) => {
      const $el = $(el);
      const href = $el.attr('href');
      const text = $el.text().trim().toLowerCase();
      
      if (href && (
        href.includes('mdl.artvee.com') || 
        href.includes('download') ||
        text.includes('download') ||
        text.includes('high resolution')
      )) {
        console.log(`  ✅ ${href} (${$el.text().trim()})`);
      }
    });
    
  } catch (error) {
    console.error('❌ 오류:', error.message);
  }
}

testImageExtraction();