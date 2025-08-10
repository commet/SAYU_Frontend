const puppeteer = require('puppeteer');
const fs = require('fs');

async function analyzeMuseumSites() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  const museums = [
    {
      name: '국립현대미술관',
      url: 'https://www.mmca.go.kr',
      exhibitionPath: '/exhibitions/exhibitions.do'
    },
    {
      name: '서울시립미술관',
      url: 'https://sema.seoul.go.kr',
      exhibitionPath: '/kr/exhibition'
    },
    {
      name: '가나아트갤러리',
      url: 'https://www.ganaart.com',
      exhibitionPath: '/exhibition'
    },
    {
      name: '갤러리현대',
      url: 'https://www.galleryhyundai.com',
      exhibitionPath: '/exhibitions'
    },
    {
      name: '대림미술관',
      url: 'https://www.daelimmuseum.org',
      exhibitionPath: '/exhibition'
    }
  ];

  const results = [];

  for (const museum of museums) {
    try {
      console.log(`분석 중: ${museum.name}`);
      
      // 메인 페이지 확인
      await page.goto(museum.url, { waitUntil: 'networkidle0', timeout: 30000 });
      
      const hasJS = await page.evaluate(() => {
        return document.querySelector('script[src*="jquery"]') !== null ||
               document.querySelector('script[src*="vue"]') !== null ||
               document.querySelector('script[src*="react"]') !== null;
      });

      // 전시 페이지 확인
      let exhibitionPageStatus = 'unknown';
      let exhibitionStructure = {};
      
      try {
        await page.goto(museum.url + museum.exhibitionPath, { 
          waitUntil: 'networkidle0', 
          timeout: 15000 
        });
        exhibitionPageStatus = 'accessible';
        
        // 전시 목록 구조 분석
        const structure = await page.evaluate(() => {
          const exhibitions = [];
          
          // 다양한 선택자로 전시 정보 찾기
          const selectors = [
            '.exhibition-item', '.exhibit-item', '.event-item',
            '.list-item', '.card', '.item',
            '[class*="exhibition"]', '[class*="exhibit"]'
          ];
          
          for (const selector of selectors) {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
              exhibitions.push({
                selector: selector,
                count: elements.length,
                hasTitle: elements[0].querySelector('h1, h2, h3, h4, .title, [class*="title"]') !== null,
                hasDate: elements[0].querySelector('[class*="date"], .period, time') !== null,
                hasImage: elements[0].querySelector('img') !== null
              });
            }
          }
          
          return {
            totalExhibitions: exhibitions.length > 0 ? Math.max(...exhibitions.map(e => e.count)) : 0,
            structures: exhibitions,
            hasNavigation: document.querySelector('.pagination, .paging, [class*="page"]') !== null,
            mainContent: document.querySelector('main, .main, .content, #content') !== null
          };
        });
        
        exhibitionStructure = structure;
        
      } catch (error) {
        exhibitionPageStatus = 'inaccessible';
      }

      results.push({
        name: museum.name,
        url: museum.url,
        status: 'accessible',
        hasJS: hasJS,
        exhibitionPageStatus,
        exhibitionStructure,
        crawlabilityScore: calculateCrawlabilityScore(hasJS, exhibitionPageStatus, exhibitionStructure)
      });

    } catch (error) {
      results.push({
        name: museum.name,
        url: museum.url,
        status: 'error',
        error: error.message,
        crawlabilityScore: 0
      });
    }
  }

  await browser.close();
  return results;
}

function calculateCrawlabilityScore(hasJS, exhibitionPageStatus, structure) {
  let score = 0;
  
  // 기본 접근성 (40점)
  if (exhibitionPageStatus === 'accessible') score += 40;
  
  // JavaScript 의존도 (20점 - JS가 적을수록 높은 점수)
  if (!hasJS) score += 20;
  else score += 10;
  
  // 구조화 정도 (40점)
  if (structure.structures && structure.structures.length > 0) {
    score += 20;
    const bestStructure = structure.structures[0];
    if (bestStructure.hasTitle) score += 7;
    if (bestStructure.hasDate) score += 7;
    if (bestStructure.hasImage) score += 6;
  }
  
  return score;
}

// 실행
if (require.main === module) {
  analyzeMuseumSites()
    .then(results => {
      console.log('\n=== 한국 미술관/갤러리 크롤링 적합성 분석 결과 ===\n');
      
      // 점수순으로 정렬
      results.sort((a, b) => (b.crawlabilityScore || 0) - (a.crawlabilityScore || 0));
      
      results.forEach((result, index) => {
        console.log(`${index + 1}. ${result.name}`);
        console.log(`   URL: ${result.url}`);
        console.log(`   크롤링 점수: ${result.crawlabilityScore}/100`);
        console.log(`   상태: ${result.status}`);
        if (result.hasJS !== undefined) console.log(`   JavaScript 사용: ${result.hasJS ? '예' : '아니오'}`);
        if (result.exhibitionPageStatus) console.log(`   전시 페이지: ${result.exhibitionPageStatus}`);
        if (result.exhibitionStructure && result.exhibitionStructure.totalExhibitions) {
          console.log(`   발견된 전시: ${result.exhibitionStructure.totalExhibitions}개`);
        }
        if (result.error) console.log(`   오류: ${result.error}`);
        console.log('');
      });
      
      // JSON 파일로 저장
      fs.writeFileSync('museum-analysis-results.json', JSON.stringify(results, null, 2));
      console.log('결과가 museum-analysis-results.json에 저장되었습니다.');
    })
    .catch(console.error);
}

module.exports = { analyzeMuseumSites };