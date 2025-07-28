const ArtMapCrawler = require('./artmapCrawler');

async function testArtMapCrawler() {
  const crawler = new ArtMapCrawler();

  try {
    console.log('=== ArtMap Crawler Test ===\n');

    // 1. 단일 도시 테스트 (서울)
    console.log('1. Testing Seoul crawl with limited venues...');
    const seoulResult = await crawler.crawlCity('seoul', {
      maxVenues: 5,  // 각 카테고리별 최대 5개 venue만
      venueTypes: ['institutions', 'galleries']  // 기관과 갤러리만
    });

    console.log('\nSeoul crawl results:', seoulResult);

    // 2. 잠시 대기
    await crawler.delay(5000);

    // 3. 뉴욕 테스트
    console.log('\n2. Testing New York crawl...');
    const nyResult = await crawler.crawlCity('new-york', {
      maxVenues: 3,  // 더 적은 수로 테스트
      venueTypes: ['institutions']  // 미술관만
    });

    console.log('\nNew York crawl results:', nyResult);

    // 4. 통계 출력
    console.log('\n=== Final Statistics ===');
    console.log('Total exhibitions found:',
      seoulResult.exhibitionsFound + nyResult.exhibitionsFound);
    console.log('Total exhibitions saved:',
      seoulResult.exhibitionsSaved + nyResult.exhibitionsSaved);
    console.log('Total errors:',
      seoulResult.errors.length + nyResult.errors.length);

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await crawler.close();
  }
}

// 개별 기능 테스트
async function testSpecificFeatures() {
  const crawler = new ArtMapCrawler();

  try {
    console.log('\n=== Testing Specific Features ===\n');

    // 1. 도시 venue 목록만 테스트
    console.log('1. Fetching Seoul venues...');
    const seoulVenues = await crawler.fetchCityVenues('seoul');
    console.log('Seoul venues summary:', {
      institutions: seoulVenues.institutions.length,
      galleries: seoulVenues.galleries.length,
      furtherSpaces: seoulVenues.furtherSpaces.length
    });

    // 2. 특정 venue의 전시 정보 테스트
    if (seoulVenues.institutions.length > 0) {
      const testVenue = seoulVenues.institutions[0];
      console.log(`\n2. Testing exhibition fetch for: ${testVenue.name}`);

      const exhibitions = await crawler.fetchVenueExhibitions(testVenue.url);
      console.log(`Found ${exhibitions.length} exhibitions`);

      if (exhibitions.length > 0) {
        console.log('\nSample exhibition:', exhibitions[0]);
      }
    }

  } catch (error) {
    console.error('Feature test failed:', error);
  } finally {
    await crawler.close();
  }
}

// 실행 옵션 선택
const args = process.argv.slice(2);

if (args.includes('--full')) {
  console.log('Running full test...');
  testArtMapCrawler();
} else if (args.includes('--features')) {
  console.log('Running feature test...');
  testSpecificFeatures();
} else {
  console.log('Usage:');
  console.log('  node test-artmap-crawler.js --full     # Full crawl test');
  console.log('  node test-artmap-crawler.js --features # Feature test only');
  console.log('\nDefaulting to feature test...\n');
  testSpecificFeatures();
}
