const ArtMapCrawler = require('./artmapCrawler');
const fs = require('fs').promises;
const path = require('path');

class ArtMapBatchCrawler {
  constructor() {
    this.crawler = new ArtMapCrawler();
    this.logDir = path.join(__dirname, 'logs');
    this.progressFile = path.join(__dirname, 'crawl-progress.json');
  }

  // 로그 디렉토리 생성
  async ensureLogDir() {
    try {
      await fs.mkdir(this.logDir, { recursive: true });
    } catch (error) {
      console.error('Error creating log directory:', error);
    }
  }

  // 진행 상황 저장
  async saveProgress(progress) {
    try {
      await fs.writeFile(
        this.progressFile,
        JSON.stringify(progress, null, 2)
      );
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }

  // 진행 상황 로드
  async loadProgress() {
    try {
      const data = await fs.readFile(this.progressFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return {
        completedCities: [],
        totalStats: {
          exhibitions: 0,
          venues: 0,
          errors: 0
        },
        lastRun: null
      };
    }
  }

  // 크롤링 로그 저장
  async saveLog(citySlug, result) {
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const logFile = path.join(this.logDir, `${citySlug}_${timestamp}.json`);

    try {
      await fs.writeFile(logFile, JSON.stringify(result, null, 2));
      console.log(`Log saved: ${logFile}`);
    } catch (error) {
      console.error('Error saving log:', error);
    }
  }

  // Tier별 도시 목록 (확장된 목록)
  getCityTiers() {
    return {
      tier1: [
        // 주요 예술 도시
        'newyork', 'london', 'paris', 'berlin', 'tokyo', 'seoul'
      ],
      tier2: [
        // 중요 예술 도시
        'losangeles', 'amsterdam', 'zurich', 'basel', 'vienna', 'madrid',
        'hongkong', 'shanghai', 'singapore', 'barcelona', 'rome', 'milan'
      ],
      tier3: [
        // 지역 예술 허브
        'chicago', 'sanfrancisco', 'miami', 'venice', 'brussels', 'copenhagen',
        'stockholm', 'oslo', 'munich', 'frankfurt', 'toronto', 'montreal'
      ],
      tier4: [
        // 신흥 예술 도시
        'washington', 'boston', 'seattle', 'beijing', 'taipei', 'bangkok',
        'sydney', 'melbourne', 'dubai', 'telaviv', 'mexico', 'saopaulo', 'buenosaires'
      ]
    };
  }

  // 배치 크롤링 실행
  async runBatchCrawl(options = {}) {
    const {
      tiers = ['tier1'],
      resumeFrom = null,
      maxVenuesPerType = 50, // 더 많은 venue 수집
      venueTypes = ['institutions', 'galleries', 'furtherSpaces'],
      parallel = false, // 병렬 처리 옵션
      maxParallel = 3 // 동시 처리할 도시 수
    } = options;

    await this.ensureLogDir();
    const progress = await this.loadProgress();

    console.log('=== ArtMap Batch Crawler ===');
    console.log(`Starting time: ${new Date().toISOString()}`);
    console.log(`Selected tiers: ${tiers.join(', ')}`);
    console.log(`Max venues per type: ${maxVenuesPerType}`);
    console.log(`Venue types: ${venueTypes.join(', ')}`);

    if (progress.completedCities.length > 0) {
      console.log(`Previously completed cities: ${progress.completedCities.join(', ')}`);
    }

    const cityTiers = this.getCityTiers();
    const citiesToCrawl = [];

    // 선택된 tier의 도시들 수집
    for (const tier of tiers) {
      if (cityTiers[tier]) {
        citiesToCrawl.push(...cityTiers[tier]);
      }
    }

    // resumeFrom이 지정된 경우 해당 도시부터 시작
    let startIndex = 0;
    if (resumeFrom) {
      startIndex = citiesToCrawl.indexOf(resumeFrom);
      if (startIndex === -1) startIndex = 0;
    }

    const results = {
      successful: [],
      failed: [],
      totalStats: {
        exhibitions: 0,
        venues: 0,
        errors: 0,
        duration: 0
      }
    };

    const startTime = Date.now();

    // 각 도시 크롤링
    for (let i = startIndex; i < citiesToCrawl.length; i++) {
      const city = citiesToCrawl[i];

      // 이미 완료된 도시는 건너뛰기
      if (progress.completedCities.includes(city)) {
        console.log(`\nSkipping ${city} (already completed)`);
        continue;
      }

      console.log(`\n[${i + 1}/${citiesToCrawl.length}] Crawling ${city}...`);

      try {
        const result = await this.crawler.crawlCity(city, {
          maxVenues: maxVenuesPerType,
          venueTypes
        });

        // 결과 저장
        await this.saveLog(city, result);

        // 통계 업데이트
        results.totalStats.exhibitions += result.exhibitionsFound;
        results.totalStats.venues += result.venuesProcessed;
        results.totalStats.errors += result.errors.length;

        results.successful.push({
          city,
          stats: result
        });

        // 진행 상황 업데이트
        progress.completedCities.push(city);
        progress.totalStats.exhibitions += result.exhibitionsFound;
        progress.totalStats.venues += result.venuesProcessed;
        progress.lastRun = new Date().toISOString();

        await this.saveProgress(progress);

        // 도시 간 휴식 시간 (서버 부하 방지)
        if (i < citiesToCrawl.length - 1) {
          console.log('Waiting 10 seconds before next city...');
          await this.crawler.delay(10000);
        }

      } catch (error) {
        console.error(`Failed to crawl ${city}:`, error);
        results.failed.push({
          city,
          error: error.message
        });
        results.totalStats.errors++;
      }
    }

    // 최종 통계
    const endTime = Date.now();
    results.totalStats.duration = Math.round((endTime - startTime) / 1000); // 초 단위

    console.log('\n=== Batch Crawl Complete ===');
    console.log(`Duration: ${results.totalStats.duration} seconds`);
    console.log(`Successful cities: ${results.successful.length}`);
    console.log(`Failed cities: ${results.failed.length}`);
    console.log(`Total exhibitions found: ${results.totalStats.exhibitions}`);
    console.log(`Total venues processed: ${results.totalStats.venues}`);
    console.log(`Total errors: ${results.totalStats.errors}`);

    // 최종 결과 저장
    const summaryFile = path.join(
      this.logDir,
      `batch_summary_${new Date().toISOString().replace(/:/g, '-')}.json`
    );
    await fs.writeFile(summaryFile, JSON.stringify(results, null, 2));
    console.log(`\nSummary saved to: ${summaryFile}`);

    return results;
  }

  // 크롤러 종료
  async close() {
    await this.crawler.close();
  }
}

// CLI 실행
async function main() {
  const args = process.argv.slice(2);
  const batchCrawler = new ArtMapBatchCrawler();

  try {
    const options = {
      tiers: ['tier1'],
      maxVenuesPerType: 10,
      venueTypes: ['institutions', 'galleries']
    };

    // 명령행 인수 파싱
    if (args.includes('--tier2')) {
      options.tiers = ['tier2'];
    } else if (args.includes('--tier3')) {
      options.tiers = ['tier3'];
    } else if (args.includes('--all')) {
      options.tiers = ['tier1', 'tier2', 'tier3'];
    }

    if (args.includes('--full')) {
      options.maxVenuesPerType = 50;
      options.venueTypes = ['institutions', 'galleries', 'furtherSpaces'];
    }

    const resumeIndex = args.indexOf('--resume');
    if (resumeIndex !== -1 && args[resumeIndex + 1]) {
      options.resumeFrom = args[resumeIndex + 1];
    }

    console.log('Starting batch crawl with options:', options);
    await batchCrawler.runBatchCrawl(options);

  } catch (error) {
    console.error('Batch crawl failed:', error);
  } finally {
    await batchCrawler.close();
  }
}

// 사용법 표시
if (process.argv.length === 2) {
  console.log('Usage: node batch-crawl-artmap.js [options]');
  console.log('\nOptions:');
  console.log('  --tier1        Crawl Tier 1 cities (default)');
  console.log('  --tier2        Crawl Tier 2 cities');
  console.log('  --tier3        Crawl Tier 3 cities');
  console.log('  --all          Crawl all cities');
  console.log('  --full         Use full settings (more venues)');
  console.log('  --resume CITY  Resume from specific city');
  console.log('\nExamples:');
  console.log('  node batch-crawl-artmap.js --tier1');
  console.log('  node batch-crawl-artmap.js --all --full');
  console.log('  node batch-crawl-artmap.js --tier2 --resume hongkong');
} else {
  main();
}

module.exports = ArtMapBatchCrawler;
