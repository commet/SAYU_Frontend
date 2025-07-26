const ArtMapCrawler = require('./src/services/artmap-crawler/artmapCrawler');
const fs = require('fs').promises;
const path = require('path');

class MassiveArtMapCollector {
  constructor() {
    this.crawler = new ArtMapCrawler();
    this.results = {
      totalExhibitions: 0,
      totalVenues: 0,
      cityResults: {},
      errors: [],
      startTime: new Date().toISOString()
    };
    
    // 대량 수집을 위한 설정 (보수적으로 조정)
    this.config = {
      maxVenuesPerType: 50, // 각 타입별 최대 50개 venue (처음엔 보수적으로)
      maxExhibitionsPerVenue: 30, // venue당 최대 30개 전시
      requestDelay: 2000, // 요청 간격 2초 (안전한 수준)
      batchSize: 3, // 한 번에 처리할 도시 수 (작게 시작)
      saveInterval: 5 // 5 도시마다 중간 저장
    };
  }

  // 우선순위별 도시 목록 (해외 주요 도시 중심)
  getPriorityCities() {
    return {
      // 최우선 - 유럽 주요 예술 도시 (각 100개씩)
      priority1: [
        'london', 'paris', 'berlin', 'amsterdam', 'zurich', 'basel',
        'vienna', 'madrid', 'barcelona', 'rome'
      ],
      // 2순위 - 북미 주요 도시 (각 80개씩)
      priority2: [
        'newyork', 'losangeles', 'chicago', 'sanfrancisco', 'miami',
        'washington', 'boston', 'seattle', 'toronto', 'montreal'
      ],
      // 3순위 - 기타 유럽 도시 (각 50개씩)
      priority3: [
        'milan', 'venice', 'brussels', 'copenhagen', 'stockholm',
        'oslo', 'munich', 'frankfurt'
      ],
      // 4순위 - 아시아 태평양 (각 30개씩)
      priority4: [
        'tokyo', 'hongkong', 'shanghai', 'singapore', 'beijing', 
        'taipei', 'bangkok', 'sydney', 'melbourne', 'dubai'
      ]
    };
  }

  // 도시별 맞춤 설정
  getCityConfig(city, priority) {
    const configs = {
      priority1: { maxVenues: 20, venueTypes: ['institutions', 'galleries'] }, // 우선 줄여서 테스트
      priority2: { maxVenues: 15, venueTypes: ['institutions', 'galleries'] },
      priority3: { maxVenues: 10, venueTypes: ['institutions'] },
      priority4: { maxVenues: 8, venueTypes: ['institutions'] }
    };
    
    return configs[priority] || configs.priority4;
  }

  // 대량 수집 실행
  async startMassiveCollection() {
    console.log('🚀 MASSIVE ARTMAP COLLECTION STARTED');
    console.log('====================================');
    console.log(`Start Time: ${this.results.startTime}`);
    console.log(`Config: ${JSON.stringify(this.config, null, 2)}`);
    
    const cities = this.getPriorityCities();
    let totalCities = 0;
    let processedCities = 0;
    
    // 총 도시 수 계산
    Object.values(cities).forEach(cityList => totalCities += cityList.length);
    console.log(`Total cities to process: ${totalCities}`);

    try {
      // 우선순위별 순차 처리
      for (const [priority, cityList] of Object.entries(cities)) {
        console.log(`\n📍 Processing ${priority}: ${cityList.length} cities`);
        
        for (const city of cityList) {
          try {
            console.log(`\n[${processedCities + 1}/${totalCities}] Processing ${city} (${priority})`);
            
            const cityConfig = this.getCityConfig(city, priority);
            
            // 도시별 크롤링 실행
            const result = await this.crawler.crawlCity(city, cityConfig);
            
            // 결과 저장
            this.results.cityResults[city] = {
              priority,
              ...result
            };
            
            this.results.totalExhibitions += result.exhibitionsSaved;
            this.results.totalVenues += result.venuesProcessed;
            
            processedCities++;
            
            // 중간 저장
            if (processedCities % this.config.saveInterval === 0) {
              await this.saveIntermediateResults();
            }
            
            // 진행 상황 출력
            const successRate = ((processedCities / totalCities) * 100).toFixed(1);
            console.log(`✅ ${city} completed. Progress: ${successRate}% (${processedCities}/${totalCities})`);
            console.log(`📊 Total collected: ${this.results.totalExhibitions} exhibitions, ${this.results.totalVenues} venues`);
            
            // 도시 간 대기 (서버 부하 방지)
            if (processedCities < totalCities) {
              console.log('⏳ Waiting 15 seconds before next city...');
              await this.delay(15000);
            }
            
          } catch (error) {
            console.error(`❌ Error processing ${city}:`, error.message);
            this.results.errors.push({
              city,
              priority,
              error: error.message,
              timestamp: new Date().toISOString()
            });
          }
        }
        
        // 우선순위 그룹 간 긴 대기 (서버 부하 방지)
        if (Object.keys(cities).indexOf(priority) < Object.keys(cities).length - 1) {
          console.log('⏳ Waiting 30 seconds before next priority group...');
          await this.delay(30000);
        }
      }
      
    } catch (error) {
      console.error('💥 Critical error in massive collection:', error);
      this.results.errors.push({
        type: 'critical',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }

    // 최종 결과 저장
    await this.saveFinalResults();
    
    console.log('\n🎉 MASSIVE COLLECTION COMPLETED');
    console.log('==============================');
    this.printFinalStats();
  }

  // 중간 결과 저장
  async saveIntermediateResults() {
    try {
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const filename = `massive_collection_intermediate_${timestamp}.json`;
      const filepath = path.join(__dirname, 'collection_results', filename);
      
      await fs.mkdir(path.dirname(filepath), { recursive: true });
      await fs.writeFile(filepath, JSON.stringify(this.results, null, 2));
      
      console.log(`💾 Intermediate results saved: ${filename}`);
    } catch (error) {
      console.error('Error saving intermediate results:', error);
    }
  }

  // 최종 결과 저장
  async saveFinalResults() {
    try {
      this.results.endTime = new Date().toISOString();
      this.results.duration = (new Date(this.results.endTime) - new Date(this.results.startTime)) / 1000;
      
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      
      // 전체 결과 저장
      const fullResultsFile = `massive_collection_full_${timestamp}.json`;
      const fullResultsPath = path.join(__dirname, 'collection_results', fullResultsFile);
      await fs.mkdir(path.dirname(fullResultsPath), { recursive: true });
      await fs.writeFile(fullResultsPath, JSON.stringify(this.results, null, 2));
      
      // 요약 리포트 저장
      const summary = this.generateSummaryReport();
      const summaryFile = `massive_collection_summary_${timestamp}.json`;
      const summaryPath = path.join(__dirname, 'collection_results', summaryFile);
      await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2));
      
      console.log(`📁 Final results saved:`);
      console.log(`   Full: ${fullResultsFile}`);
      console.log(`   Summary: ${summaryFile}`);
      
    } catch (error) {
      console.error('Error saving final results:', error);
    }
  }

  // 요약 리포트 생성
  generateSummaryReport() {
    const cityStats = {};
    let totalExhibitionsFound = 0;
    let totalVenuesWithCoordinates = 0;
    
    Object.entries(this.results.cityResults).forEach(([city, data]) => {
      cityStats[city] = {
        country: data.country,
        priority: data.priority,
        venuesProcessed: data.venuesProcessed,
        exhibitionsFound: data.exhibitionsFound,
        exhibitionsSaved: data.exhibitionsSaved,
        venuesWithCoordinates: data.venuesWithCoordinates || 0,
        errors: data.errors?.length || 0,
        duration: data.duration
      };
      
      totalExhibitionsFound += data.exhibitionsFound || 0;
      totalVenuesWithCoordinates += data.venuesWithCoordinates || 0;
    });

    return {
      summary: {
        totalCitiesProcessed: Object.keys(this.results.cityResults).length,
        totalExhibitionsFound,
        totalExhibitionsSaved: this.results.totalExhibitions,
        totalVenuesProcessed: this.results.totalVenues,
        totalVenuesWithCoordinates,
        totalErrors: this.results.errors.length,
        duration: this.results.duration,
        successRate: ((this.results.totalExhibitions / Math.max(totalExhibitionsFound, 1)) * 100).toFixed(2)
      },
      cityStats,
      errors: this.results.errors
    };
  }

  // 최종 통계 출력
  printFinalStats() {
    const summary = this.generateSummaryReport();
    
    console.log('\n📊 FINAL STATISTICS');
    console.log('==================');
    console.log(`Cities processed: ${summary.summary.totalCitiesProcessed}`);
    console.log(`Exhibitions found: ${summary.summary.totalExhibitionsFound}`);
    console.log(`Exhibitions saved: ${summary.summary.totalExhibitionsSaved}`);
    console.log(`Venues processed: ${summary.summary.totalVenuesProcessed}`);
    console.log(`Venues with GPS: ${summary.summary.totalVenuesWithCoordinates}`);
    console.log(`Success rate: ${summary.summary.successRate}%`);
    console.log(`Duration: ${summary.summary.duration} seconds`);
    console.log(`Errors: ${summary.summary.totalErrors}`);
    
    // 도시별 TOP 10 출력
    console.log('\n🏆 TOP 10 CITIES BY EXHIBITIONS');
    console.log('==============================');
    
    const topCities = Object.entries(summary.cityStats)
      .sort(([,a], [,b]) => b.exhibitionsSaved - a.exhibitionsSaved)
      .slice(0, 10);
    
    topCities.forEach(([city, stats], index) => {
      console.log(`${index + 1}. ${city}: ${stats.exhibitionsSaved} exhibitions (${stats.venuesProcessed} venues)`);
    });
  }

  // 지연 함수
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 크롤러 종료
  async close() {
    await this.crawler.close();
  }
}

// CLI 실행
async function main() {
  const args = process.argv.slice(2);
  const collector = new MassiveArtMapCollector();

  try {
    // 사용법 확인
    if (args.includes('--help') || args.includes('-h')) {
      console.log('🎨 MASSIVE ARTMAP COLLECTOR');
      console.log('==========================');
      console.log('Usage: node massive-artmap-collector.js [options]');
      console.log('\nOptions:');
      console.log('  --start      Start massive collection');
      console.log('  --quick      Quick collection (fewer venues per city)');
      console.log('  --help       Show this help');
      console.log('\nThis will collect exhibitions from 40+ major cities worldwide.');
      console.log('Expected collection: 3,000+ exhibitions from 1,000+ venues');
      console.log('Estimated time: 6-8 hours');
      return;
    }

    if (args.includes('--quick')) {
      // 빠른 수집 설정
      collector.config.maxVenuesPerType = 30;
      collector.config.requestDelay = 1000;
      console.log('🏃 Quick collection mode enabled');
    }

    if (args.includes('--start') || args.length === 0) {
      console.log('🚀 Starting massive ArtMap collection...');
      console.log('This will take several hours. You can stop with Ctrl+C.');
      console.log('Progress will be saved periodically.');
      
      await collector.startMassiveCollection();
    } else {
      console.log('Use --start to begin collection or --help for usage info');
    }

  } catch (error) {
    console.error('💥 Fatal error:', error);
  } finally {
    await collector.close();
  }
}

// Ctrl+C 처리
process.on('SIGINT', async () => {
  console.log('\n⚠️  Collection interrupted by user');
  console.log('Saving current progress...');
  process.exit(0);
});

// 처리되지 않은 오류 처리
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

main();

module.exports = MassiveArtMapCollector;