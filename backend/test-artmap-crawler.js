/**
 * Artmap.com 도시별 전시 크롤러 테스트 스크립트
 */

const ArtmapCityExhibitionsCrawler = require('./src/services/artmapCityExhibitionsCrawler');

async function testArtmapCrawler() {
  const crawler = new ArtmapCityExhibitionsCrawler();
  
  console.log('=== Artmap.com City Exhibitions Crawler Test ===\n');

  // 1. 서울 테스트
  console.log('1. Testing Seoul exhibitions...');
  try {
    const seoulExhibitions = await crawler.testCrawl('seoul');
    console.log(`\nTotal Seoul exhibitions found: ${seoulExhibitions.length}`);
  } catch (error) {
    console.error('Seoul test failed:', error.message);
  }

  // 2. 뉴욕 테스트
  console.log('\n\n2. Testing New York exhibitions...');
  try {
    const nyExhibitions = await crawler.testCrawl('new-york');
    console.log(`\nTotal New York exhibitions found: ${nyExhibitions.length}`);
  } catch (error) {
    console.error('New York test failed:', error.message);
  }

  // 3. 런던 테스트
  console.log('\n\n3. Testing London exhibitions...');
  try {
    const londonExhibitions = await crawler.testCrawl('london');
    console.log(`\nTotal London exhibitions found: ${londonExhibitions.length}`);
  } catch (error) {
    console.error('London test failed:', error.message);
  }
}

// 단일 도시 상세 크롤링 테스트
async function testSingleCity(cityName) {
  const crawler = new ArtmapCityExhibitionsCrawler();
  
  console.log(`\n=== Detailed crawling test for ${cityName} ===\n`);
  
  try {
    // 페이지 구조 분석
    console.log('Analyzing page structure...');
    const pageInfo = await crawler.analyzeCityPage(cityName);
    
    if (!pageInfo) {
      console.log(`Could not access ${cityName} page`);
      return;
    }

    // 전시 목록 수집
    console.log('\nCollecting exhibitions...');
    const exhibitions = await crawler.crawlCityExhibitions(cityName);
    
    console.log(`Found ${exhibitions.length} exhibitions`);
    
    // 처음 10개 전시 정보 출력
    console.log('\n=== First 10 exhibitions ===');
    exhibitions.slice(0, 10).forEach((ex, index) => {
      console.log(`\n${index + 1}. ${ex.title}`);
      console.log(`   Venue: ${ex.venue || 'N/A'}`);
      console.log(`   Dates: ${ex.dates || ex.dateText || 'N/A'}`);
      console.log(`   URL: ${ex.url || 'N/A'}`);
    });

    // 상세 정보 테스트 (처음 3개만)
    console.log('\n=== Testing detailed information retrieval ===');
    for (let i = 0; i < Math.min(3, exhibitions.length); i++) {
      const ex = exhibitions[i];
      if (ex.url) {
        console.log(`\nFetching details for: ${ex.title}`);
        const details = await crawler.crawlExhibitionDetail(ex.url);
        if (details) {
          console.log('  Artists:', details.artists.join(', ') || 'N/A');
          console.log('  Description:', details.description ? 
            details.description.substring(0, 150) + '...' : 'N/A');
          console.log('  Images found:', details.images.length);
        }
      }
    }
    
  } catch (error) {
    console.error(`Error testing ${cityName}:`, error);
  }
}

// 모든 도시 크롤링 테스트 (실제 데이터 수집)
async function crawlAllCities() {
  const crawler = new ArtmapCityExhibitionsCrawler();
  
  console.log('=== Starting full crawl of all cities ===\n');
  console.log('Target cities:', crawler.targetCities.join(', '));
  console.log('\nThis will take some time due to rate limiting...\n');
  
  const results = await crawler.crawlAllCities();
  
  // 결과를 JSON 파일로 저장
  const fs = require('fs');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `artmap-exhibitions-${timestamp}.json`;
  
  fs.writeFileSync(filename, JSON.stringify(results, null, 2));
  console.log(`\nResults saved to: ${filename}`);
}

// 명령줄 인자 처리
const args = process.argv.slice(2);

if (args.length === 0) {
  // 기본 테스트 실행
  testArtmapCrawler().then(() => {
    console.log('\nTest completed!');
    process.exit(0);
  }).catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
  });
} else if (args[0] === 'city' && args[1]) {
  // 특정 도시 상세 테스트
  testSingleCity(args[1]).then(() => {
    console.log('\nTest completed!');
    process.exit(0);
  }).catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
  });
} else if (args[0] === 'crawl-all') {
  // 모든 도시 크롤링
  crawlAllCities().then(() => {
    console.log('\nCrawling completed!');
    process.exit(0);
  }).catch(error => {
    console.error('Crawling failed:', error);
    process.exit(1);
  });
} else {
  console.log('Usage:');
  console.log('  node test-artmap-crawler.js              # Run basic tests');
  console.log('  node test-artmap-crawler.js city seoul   # Test specific city');
  console.log('  node test-artmap-crawler.js crawl-all    # Crawl all cities');
  process.exit(0);
}