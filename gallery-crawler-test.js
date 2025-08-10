const axios = require('axios');
const cheerio = require('cheerio');

async function testGalleryHyundai() {
  console.log('\n=== 갤러리현대 크롤링 테스트 ===');
  
  try {
    const response = await axios.get('https://www.galleryhyundai.com/exhibitions');
    const $ = cheerio.load(response.data);
    
    console.log('✅ 페이지 접근 성공');
    console.log(`페이지 크기: ${response.data.length} bytes`);
    
    // 전시 목록 찾기
    const exhibitions = [];
    
    // 다양한 선택자 시도
    const selectors = [
      '.exhibition-item', '.exhibit-item', '.list-item',
      '.card', 'article', '[class*="exhibition"]',
      '.row .col', 'li', 'div[class*="item"]'
    ];
    
    for (const selector of selectors) {
      const items = $(selector);
      if (items.length > 0) {
        console.log(`"${selector}" 선택자로 ${items.length}개 요소 발견`);
        
        items.each((i, elem) => {
          if (i < 3) { // 처음 3개만 분석
            const title = $(elem).find('h1, h2, h3, h4, .title, [class*="title"]').text().trim();
            const date = $(elem).find('[class*="date"], .period, time').text().trim();
            const image = $(elem).find('img').attr('src');
            
            if (title) {
              exhibitions.push({ title, date, image, selector });
            }
          }
        });
        
        if (exhibitions.length > 0) break;
      }
    }
    
    if (exhibitions.length > 0) {
      console.log('\n발견된 전시:');
      exhibitions.forEach((ex, i) => {
        console.log(`${i + 1}. ${ex.title}`);
        if (ex.date) console.log(`   기간: ${ex.date}`);
        if (ex.image) console.log(`   이미지: ${ex.image}`);
        console.log(`   선택자: ${ex.selector}`);
      });
    } else {
      console.log('❌ 전시 정보를 찾지 못함');
      
      // 페이지 구조 분석
      console.log('\n페이지 구조 분석:');
      console.log(`제목: ${$('title').text()}`);
      console.log(`메인 컨텐츠 영역: ${$('main, .main, .content, #content').length}개`);
      console.log(`링크 수: ${$('a').length}개`);
      console.log(`이미지 수: ${$('img').length}개`);
      
      // 주요 클래스명 확인
      const classes = [];
      $('[class]').each((i, elem) => {
        if (i < 20) {
          const className = $(elem).attr('class');
          if (className && className.includes('exhibit') || className.includes('list')) {
            classes.push(className);
          }
        }
      });
      console.log('관련 클래스:', [...new Set(classes)]);
    }
    
  } catch (error) {
    console.log('❌ 오류:', error.message);
  }
}

async function testGanaArt() {
  console.log('\n=== 가나아트갤러리 크롤링 테스트 ===');
  
  try {
    // WordPress REST API 먼저 시도
    try {
      const apiResponse = await axios.get('https://www.ganaart.com/wp-json/wp/v2/exhibition?per_page=5');
      console.log('✅ WordPress REST API 접근 성공');
      console.log(`전시 개수: ${apiResponse.data.length}개`);
      
      if (apiResponse.data.length > 0) {
        console.log('\nAPI로 가져온 전시:');
        apiResponse.data.slice(0, 3).forEach((ex, i) => {
          console.log(`${i + 1}. ${ex.title.rendered}`);
          console.log(`   날짜: ${ex.date}`);
          console.log(`   슬러그: ${ex.slug}`);
        });
        return; // API가 작동하면 HTML 크롤링 건너뛰기
      }
    } catch (apiError) {
      console.log('WordPress API 실패, HTML 크롤링으로 전환');
    }
    
    // HTML 크롤링
    const response = await axios.get('https://www.ganaart.com/exhibition/');
    const $ = cheerio.load(response.data);
    
    console.log('✅ HTML 페이지 접근 성공');
    console.log(`페이지 크기: ${response.data.length} bytes`);
    
    // WordPress 포스트 구조 찾기
    const posts = [];
    $('.post, article, [class*="exhibition"]').each((i, elem) => {
      if (i < 5) {
        const title = $(elem).find('h1, h2, h3, .entry-title, [class*="title"]').text().trim();
        const date = $(elem).find('.date, time, [class*="date"]').text().trim();
        const link = $(elem).find('a').attr('href');
        
        if (title) {
          posts.push({ title, date, link });
        }
      }
    });
    
    if (posts.length > 0) {
      console.log('\n발견된 전시:');
      posts.forEach((post, i) => {
        console.log(`${i + 1}. ${post.title}`);
        if (post.date) console.log(`   날짜: ${post.date}`);
        if (post.link) console.log(`   링크: ${post.link}`);
      });
    }
    
  } catch (error) {
    console.log('❌ 오류:', error.message);
  }
}

async function testMMCA() {
  console.log('\n=== 국립현대미술관 크롤링 테스트 ===');
  
  try {
    // JavaScript 없는 페이지가 있는지 확인
    const response = await axios.get('https://www.mmca.go.kr/exhibitions/progressList.do');
    const $ = cheerio.load(response.data);
    
    console.log('✅ 페이지 접근 성공');
    console.log(`페이지 크기: ${response.data.length} bytes`);
    console.log(`JavaScript 스크립트 수: ${$('script').length}개`);
    
    // 전시 정보가 HTML에 있는지 확인
    const hasExhibitionData = response.data.includes('전시') && 
                             response.data.includes('기간');
    
    console.log(`전시 데이터 포함 여부: ${hasExhibitionData ? '예' : '아니오'}`);
    
    if (!hasExhibitionData) {
      console.log('⚠️  JavaScript를 통한 동적 로딩이 필요할 것으로 판단됨');
    }
    
  } catch (error) {
    console.log('❌ 오류:', error.message);
  }
}

// 실행
async function runTests() {
  await testGalleryHyundai();
  await testGanaArt();
  await testMMCA();
  
  console.log('\n=== 결론 ===');
  console.log('1. 갤러리현대: 구조 확인 필요 (JavaScript 사용 가능성)');
  console.log('2. 가나아트갤러리: WordPress 기반, REST API 또는 HTML 크롤링 가능');
  console.log('3. 국립현대미술관: JavaScript 필요, Puppeteer 등 브라우저 자동화 도구 필요');
}

if (require.main === module) {
  runTests().catch(console.error);
}