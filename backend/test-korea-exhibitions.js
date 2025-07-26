/**
 * 한국 전시 정보 크롤링 테스트
 */

const ArtmapKoreaExhibitionsCrawler = require('./src/services/artmapKoreaExhibitionsCrawler');

async function testKoreaExhibitions() {
  const crawler = new ArtmapKoreaExhibitionsCrawler();
  
  console.log('=== Testing Korea Exhibitions Crawler ===\n');
  
  try {
    // 한국 전시 찾기 (DB 저장 없이)
    const exhibitions = await crawler.crawlKoreanExhibitions();
    
    if (exhibitions.length > 0) {
      console.log('\n\n=== Found Korean Exhibitions ===');
      exhibitions.forEach((ex, i) => {
        console.log(`\n${i + 1}. ${ex.title}`);
        console.log(`   Venue: ${ex.venue}`);
        console.log(`   Dates: ${ex.startDate} - ${ex.endDate}`);
        console.log(`   URL: ${ex.url}`);
        console.log(`   Found at: ${ex.foundAt}`);
      });
    } else {
      console.log('\nNo Korean exhibitions found in current listings.');
      console.log('This might mean:');
      console.log('1. No Korean exhibitions are currently listed on Artmap');
      console.log('2. The venue names are not in our keyword list');
      console.log('3. Artmap might not have many Asian exhibitions');
    }
    
    // 한국 장소 검색
    console.log('\n\n=== Searching for Korean Venues ===');
    const venues = await crawler.searchKoreanVenues();
    
    if (venues.length > 0) {
      console.log('\nFound venues:');
      venues.forEach((venue, i) => {
        console.log(`${i + 1}. ${venue.name} (found by: ${venue.searchTerm})`);
        console.log(`   URL: ${venue.url}`);
      });
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// 실행
testKoreaExhibitions().then(() => {
  console.log('\n\nTest completed!');
  process.exit(0);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});