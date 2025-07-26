const ArtMapCrawler = require('./src/services/artmap-crawler/artmapCrawler');

class TestMassiveCollection {
  constructor() {
    this.crawler = new ArtMapCrawler();
  }

  // 테스트용 소규모 수집
  async runTestCollection() {
    console.log('🧪 TESTING MASSIVE COLLECTION SYSTEM');
    console.log('===================================');
    
    // 테스트용 도시 (소규모)
    const testCities = ['london', 'paris', 'newyork'];
    const results = [];
    
    for (const city of testCities) {
      console.log(`\n🏛️ Testing ${city}...`);
      
      try {
        const result = await this.crawler.crawlCity(city, {
          maxVenues: 5, // 테스트용으로 적은 수
          venueTypes: ['institutions', 'galleries'],
          saveToJson: true
        });
        
        results.push({
          city,
          ...result
        });
        
        console.log(`✅ ${city} test completed:`);
        console.log(`   Venues: ${result.venuesProcessed}`);
        console.log(`   Exhibitions: ${result.exhibitionsSaved}`);
        console.log(`   Duration: ${result.duration}s`);
        
        // 테스트 간 짧은 대기
        await this.delay(3000);
        
      } catch (error) {
        console.error(`❌ Test failed for ${city}:`, error.message);
        results.push({
          city,
          error: error.message
        });
      }
    }
    
    // 테스트 결과 요약
    this.printTestSummary(results);
    
    return results;
  }

  // 연결 테스트
  async testConnection() {
    console.log('🔍 TESTING ARTMAP CONNECTION');
    console.log('============================');
    
    try {
      // 단순 페이지 접근 테스트
      const testUrl = 'https://artmap.com/london';
      console.log(`Testing connection to: ${testUrl}`);
      
      const html = await this.crawler.safeFetch(testUrl);
      
      if (html) {
        console.log('✅ Connection successful');
        console.log(`Response length: ${html.length} characters`);
        
        // 기본 구조 확인
        const cheerio = require('cheerio');
        const $ = cheerio.load(html);
        
        const venues = $('.venue-item, .institution, .gallery').length;
        console.log(`Found ${venues} venue elements on page`);
        
        return true;
      } else {
        console.log('❌ Connection failed - no response');
        return false;
      }
      
    } catch (error) {
      console.error('❌ Connection test failed:', error.message);
      return false;
    }
  }

  // 파싱 테스트
  async testParsing() {
    console.log('\n🔧 TESTING PARSING LOGIC');
    console.log('========================');
    
    try {
      // 런던 페이지로 파싱 테스트
      const venues = await this.crawler.fetchCityVenues('london');
      
      console.log('Venue parsing results:');
      console.log(`- Institutions: ${venues.institutions?.length || 0}`);
      console.log(`- Galleries: ${venues.galleries?.length || 0}`);
      console.log(`- Further Spaces: ${venues.furtherSpaces?.length || 0}`);
      
      // 첫 번째 venue의 전시 정보 테스트
      if (venues.institutions?.length > 0) {
        const firstVenue = venues.institutions[0];
        console.log(`\nTesting exhibitions for: ${firstVenue.name}`);
        
        const { exhibitions, venueDetails } = await this.crawler.fetchVenueExhibitions(firstVenue.url);
        
        console.log(`Found ${exhibitions.length} exhibitions`);
        
        if (exhibitions.length > 0) {
          const ex = exhibitions[0];
          console.log('Sample exhibition:');
          console.log(`- Title: ${ex.title}`);
          console.log(`- Artists: ${ex.artists?.join(', ')}`);
          console.log(`- Dates: ${ex.startDate} - ${ex.endDate}`);
        }
        
        console.log('Venue details:');
        console.log(`- Address: ${venueDetails.address}`);
        console.log(`- Coordinates: ${venueDetails.latitude}, ${venueDetails.longitude}`);
      }
      
      return true;
      
    } catch (error) {
      console.error('❌ Parsing test failed:', error.message);
      return false;
    }
  }

  // 데이터베이스 연결 테스트
  async testDatabase() {
    console.log('\n💾 TESTING DATABASE CONNECTION');
    console.log('==============================');
    
    try {
      // 간단한 쿼리 테스트
      const result = await this.crawler.pool.query('SELECT NOW() as current_time');
      console.log('✅ Database connection successful');
      console.log(`Current time: ${result.rows[0].current_time}`);
      
      // 테이블 존재 확인
      const tables = await this.crawler.pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('exhibitions', 'venues')
      `);
      
      console.log(`Found tables: ${tables.rows.map(r => r.table_name).join(', ')}`);
      
      return true;
      
    } catch (error) {
      console.error('❌ Database test failed:', error.message);
      return false;
    }
  }

  // 전체 시스템 테스트
  async runFullSystemTest() {
    console.log('🚀 FULL SYSTEM TEST');
    console.log('==================');
    
    const tests = [
      { name: 'Connection', test: () => this.testConnection() },
      { name: 'Database', test: () => this.testDatabase() },
      { name: 'Parsing', test: () => this.testParsing() },
      { name: 'Collection', test: () => this.runTestCollection() }
    ];
    
    const results = {};
    
    for (const { name, test } of tests) {
      console.log(`\n🔄 Running ${name} test...`);
      try {
        const result = await test();
        results[name] = { success: true, result };
        console.log(`✅ ${name} test passed`);
      } catch (error) {
        results[name] = { success: false, error: error.message };
        console.log(`❌ ${name} test failed: ${error.message}`);
      }
    }
    
    // 최종 결과
    console.log('\n📊 TEST SUMMARY');
    console.log('===============');
    
    const passed = Object.values(results).filter(r => r.success).length;
    const total = Object.keys(results).length;
    
    console.log(`Passed: ${passed}/${total}`);
    
    Object.entries(results).forEach(([test, result]) => {
      const status = result.success ? '✅' : '❌';
      console.log(`${status} ${test}`);
    });
    
    if (passed === total) {
      console.log('\n🎉 All tests passed! System ready for massive collection.');
    } else {
      console.log('\n⚠️  Some tests failed. Check configuration before running massive collection.');
    }
    
    return results;
  }

  // 테스트 요약 출력
  printTestSummary(results) {
    console.log('\n📊 TEST COLLECTION SUMMARY');
    console.log('==========================');
    
    const successful = results.filter(r => !r.error);
    const failed = results.filter(r => r.error);
    
    console.log(`Successful cities: ${successful.length}`);
    console.log(`Failed cities: ${failed.length}`);
    
    if (successful.length > 0) {
      const totalExhibitions = successful.reduce((sum, r) => sum + (r.exhibitionsSaved || 0), 0);
      const totalVenues = successful.reduce((sum, r) => sum + (r.venuesProcessed || 0), 0);
      const avgDuration = successful.reduce((sum, r) => sum + (r.duration || 0), 0) / successful.length;
      
      console.log(`Total exhibitions collected: ${totalExhibitions}`);
      console.log(`Total venues processed: ${totalVenues}`);
      console.log(`Average duration per city: ${avgDuration.toFixed(1)}s`);
    }
    
    if (failed.length > 0) {
      console.log('\n❌ Failed cities:');
      failed.forEach(r => console.log(`   ${r.city}: ${r.error}`));
    }
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async close() {
    await this.crawler.close();
  }
}

// CLI 실행
async function main() {
  const args = process.argv.slice(2);
  const tester = new TestMassiveCollection();

  try {
    if (args.includes('--connection')) {
      await tester.testConnection();
    } else if (args.includes('--database')) {
      await tester.testDatabase();
    } else if (args.includes('--parsing')) {
      await tester.testParsing();
    } else if (args.includes('--collection')) {
      await tester.runTestCollection();
    } else if (args.includes('--full') || args.length === 0) {
      await tester.runFullSystemTest();
    } else {
      console.log('🧪 Test Massive Collection System');
      console.log('================================');
      console.log('Usage: node test-massive-collection.js [option]');
      console.log('\nOptions:');
      console.log('  --full        Run all tests (default)');
      console.log('  --connection  Test ArtMap connection only');
      console.log('  --database    Test database connection only');
      console.log('  --parsing     Test parsing logic only');
      console.log('  --collection  Test small collection only');
    }

  } catch (error) {
    console.error('💥 Test failed:', error);
  } finally {
    await tester.close();
  }
}

main();

module.exports = TestMassiveCollection;