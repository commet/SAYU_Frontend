/**
 * Artmap.com 전 세계 전시에서 특정 도시 전시 찾기
 */

const ArtmapCityExhibitionsCrawler = require('./src/services/artmapCityExhibitionsCrawler');

async function findCityExhibitions(cityName) {
  const crawler = new ArtmapCityExhibitionsCrawler();
  
  console.log(`=== Finding ${cityName} exhibitions from worldwide list ===\n`);
  
  try {
    // 전 세계 전시에서 도시별 필터링 (최대 10페이지)
    const exhibitions = await crawler.crawlWorldwideExhibitions(cityName, 10);
    
    console.log(`\nTotal ${cityName} exhibitions found: ${exhibitions.length}`);
    
    if (exhibitions.length > 0) {
      console.log(`\n=== ${cityName} Exhibitions ===`);
      
      exhibitions.slice(0, 20).forEach((ex, index) => {
        console.log(`\n${index + 1}. ${ex.title}`);
        console.log(`   Venue: ${ex.venue}`);
        console.log(`   City: ${ex.city || 'N/A'}`);
        console.log(`   Dates: ${ex.dateText || 'N/A'}`);
        console.log(`   URL: ${ex.url}`);
      });
      
      // 통계
      console.log('\n=== Statistics ===');
      const venues = [...new Set(exhibitions.map(ex => ex.venue))];
      console.log(`Unique venues: ${venues.length}`);
      console.log('\nTop venues:');
      
      const venueCount = {};
      exhibitions.forEach(ex => {
        venueCount[ex.venue] = (venueCount[ex.venue] || 0) + 1;
      });
      
      Object.entries(venueCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .forEach(([venue, count]) => {
          console.log(`  ${venue}: ${count} exhibitions`);
        });
    }
    
    return exhibitions;
    
  } catch (error) {
    console.error(`Error finding ${cityName} exhibitions:`, error.message);
    return [];
  }
}

// 여러 도시 테스트
async function testMultipleCities() {
  const cities = ['Seoul', 'Tokyo', 'New York', 'London', 'Paris'];
  const results = {};
  
  for (const city of cities) {
    console.log(`\n\n${'='.repeat(60)}`);
    const exhibitions = await findCityExhibitions(city);
    results[city] = exhibitions.length;
  }
  
  // 전체 요약
  console.log('\n\n=== SUMMARY ===');
  console.log('Exhibitions found per city:');
  Object.entries(results).forEach(([city, count]) => {
    console.log(`  ${city}: ${count} exhibitions`);
  });
}

// 명령줄 인자 처리
const args = process.argv.slice(2);

if (args.length === 0) {
  // 기본: 서울 전시 찾기
  findCityExhibitions('Seoul').then(() => {
    console.log('\nDone!');
    process.exit(0);
  });
} else if (args[0] === 'all') {
  // 여러 도시 테스트
  testMultipleCities().then(() => {
    console.log('\nDone!');
    process.exit(0);
  });
} else {
  // 특정 도시
  findCityExhibitions(args[0]).then(() => {
    console.log('\nDone!');
    process.exit(0);
  });
}