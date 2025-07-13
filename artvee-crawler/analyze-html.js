const axios = require('axios');
const cheerio = require('cheerio');

async function analyzeHTML() {
  console.log('🔍 Artvee HTML 구조 분석\n');
  
  try {
    const response = await axios.get('https://artvee.com/artist/pierre-auguste-renoir/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    
    console.log('1️⃣ 모든 링크 확인:');
    let linkCount = 0;
    $('a').each((i, el) => {
      const href = $(el).attr('href');
      if (href && href.includes('/dl/')) {
        linkCount++;
        if (linkCount <= 5) {
          console.log(`   ${linkCount}. ${href}`);
          const text = $(el).text().trim();
          const img = $(el).find('img');
          console.log(`      텍스트: "${text}"`);
          console.log(`      이미지: ${img.length > 0 ? img.attr('alt') || '제목없음' : '없음'}`);
        }
      }
    });
    console.log(`   총 /dl/ 링크: ${linkCount}개\n`);
    
    console.log('2️⃣ 이미지와 함께 있는 링크만:');
    let imageLinks = 0;
    $('a[href*="/dl/"]').each((i, el) => {
      const href = $(el).attr('href');
      const img = $(el).find('img');
      
      if (img.length > 0) {
        imageLinks++;
        if (imageLinks <= 5) {
          console.log(`   ${imageLinks}. ${href}`);
          console.log(`      이미지 src: ${img.attr('src')}`);
          console.log(`      이미지 alt: ${img.attr('alt')}`);
        }
      }
    });
    console.log(`   이미지 포함 링크: ${imageLinks}개\n`);
    
    console.log('3️⃣ 페이지 전체 구조:');
    console.log(`   전체 <a> 태그: ${$('a').length}개`);
    console.log(`   전체 <img> 태그: ${$('img').length}개`);
    console.log(`   /dl/ 포함 링크: ${$('a[href*="/dl/"]').length}개`);
    
    console.log('\n4️⃣ 실제 HTML 샘플:');
    $('a[href*="/dl/"]').slice(0, 3).each((i, el) => {
      console.log(`\n--- 링크 ${i + 1} ---`);
      console.log($(el)[0].outerHTML);
    });
    
  } catch (error) {
    console.error('❌ 오류:', error.message);
  }
}

analyzeHTML();