#!/usr/bin/env node
/**
 * SAYU 아티스트 데이터 수집 시스템 테스트 스크립트
 * 
 * 사용법:
 * node test-artist-collection.js --single "Pablo Picasso"
 * node test-artist-collection.js --batch "test-artists.txt"
 * node test-artist-collection.js --method hybrid --artist "Frida Kahlo"
 * node test-artist-collection.js --stats
 */

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

// 설정
const config = {
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3001',
  authToken: process.env.TEST_AUTH_TOKEN, // 테스트용 토큰
  outputDir: './test-results'
};

// 테스트 아티스트 목록
const TEST_ARTISTS = [
  'Pablo Picasso',
  'Vincent van Gogh',
  'Frida Kahlo',
  'Leonardo da Vinci',
  'Claude Monet',
  'Georgia O\'Keeffe',
  'Andy Warhol',
  'Salvador Dalí',
  'Yayoi Kusama',
  '백남준' // 한국 아티스트 테스트
];

class ArtistCollectionTester {
  constructor() {
    this.client = axios.create({
      baseURL: `${config.apiBaseUrl}/api/artist-data`,
      headers: config.authToken ? {
        'Authorization': `Bearer ${config.authToken}`
      } : {},
      timeout: 60000 // 1분 타임아웃
    });

    this.results = {
      tests: [],
      summary: {
        total: 0,
        successful: 0,
        failed: 0,
        startTime: new Date().toISOString()
      }
    };
  }

  /**
   * 단일 아티스트 테스트
   */
  async testSingleArtist(artistName, method = 'enhanced') {
    console.log(`🎨 단일 아티스트 테스트: ${artistName} (${method})`);
    
    const startTime = Date.now();
    
    try {
      const response = await this.client.post('/collect-single', {
        artistName: artistName,
        method: method,
        forceUpdate: false
      });

      const duration = Date.now() - startTime;
      
      const result = {
        type: 'single',
        artist: artistName,
        method: method,
        success: response.data.success,
        duration: duration,
        data: response.data,
        timestamp: new Date().toISOString()
      };

      this.results.tests.push(result);
      this.results.summary.total++;
      
      if (response.data.success) {
        this.results.summary.successful++;
        console.log(`✅ 성공: ${artistName} (${duration}ms)`);
        
        // 수집된 데이터 요약 출력
        const artist = response.data.artist;
        if (artist) {
          console.log(`   📊 정보: ${artist.nationality || '국적미상'}, ${artist.birth_year || '?'}-${artist.death_year || '?'}`);
          console.log(`   📝 전기: ${artist.bio ? artist.bio.substring(0, 100) + '...' : '없음'}`);
        }
      } else {
        this.results.summary.failed++;
        console.log(`❌ 실패: ${artistName} - ${response.data.error}`);
      }

      return result;

    } catch (error) {
      const duration = Date.now() - startTime;
      
      const result = {
        type: 'single',
        artist: artistName,
        method: method,
        success: false,
        duration: duration,
        error: error.message,
        timestamp: new Date().toISOString()
      };

      this.results.tests.push(result);
      this.results.summary.total++;
      this.results.summary.failed++;
      
      console.log(`❌ 오류: ${artistName} - ${error.message}`);
      return result;
    }
  }

  /**
   * 배치 아티스트 테스트
   */
  async testBatchArtists(artistNames, method = 'enhanced') {
    console.log(`📦 배치 아티스트 테스트: ${artistNames.length}명 (${method})`);
    
    const startTime = Date.now();
    
    try {
      const response = await this.client.post('/collect-batch', {
        artistNames: artistNames,
        method: method,
        batchSize: 5,
        delay: 1000,
        forceUpdate: false
      });

      const duration = Date.now() - startTime;
      
      const result = {
        type: 'batch',
        artistCount: artistNames.length,
        method: method,
        success: response.data.success,
        duration: duration,
        batchId: response.data.batchId,
        data: response.data,
        timestamp: new Date().toISOString()
      };

      this.results.tests.push(result);
      this.results.summary.total++;
      
      if (response.data.success) {
        this.results.summary.successful++;
        console.log(`✅ 배치 시작 성공: ${artistNames.length}명`);
        console.log(`   🆔 배치 ID: ${response.data.batchId}`);
        console.log(`   ⏱️ 예상 시간: ${response.data.estimatedTime}`);
      } else {
        this.results.summary.failed++;
        console.log(`❌ 배치 시작 실패: ${response.data.error}`);
      }

      return result;

    } catch (error) {
      const duration = Date.now() - startTime;
      
      const result = {
        type: 'batch',
        artistCount: artistNames.length,
        method: method,
        success: false,
        duration: duration,
        error: error.message,
        timestamp: new Date().toISOString()
      };

      this.results.tests.push(result);
      this.results.summary.total++;
      this.results.summary.failed++;
      
      console.log(`❌ 배치 오류: ${error.message}`);
      return result;
    }
  }

  /**
   * 검색 기능 테스트
   */
  async testSearch() {
    console.log(`🔍 검색 기능 테스트`);
    
    const searchQueries = [
      'Picasso',
      'Van Gogh',
      'Frida',
      '백남준',
      'Abstract'
    ];

    for (const query of searchQueries) {
      try {
        const response = await this.client.get('/search', {
          params: {
            query: query,
            limit: 5,
            sortBy: 'relevance'
          }
        });

        console.log(`✅ 검색 "${query}": ${response.data.results.length}개 결과`);
        
        // 첫 번째 결과 출력
        if (response.data.results.length > 0) {
          const first = response.data.results[0];
          console.log(`   🎯 최상위: ${first.name} (관련도: ${first.relevance_score})`);
        }

      } catch (error) {
        console.log(`❌ 검색 "${query}" 실패: ${error.message}`);
      }
    }
  }

  /**
   * 통계 조회 테스트
   */
  async testStats() {
    console.log(`📊 통계 조회 테스트`);
    
    try {
      const response = await this.client.get('/stats', {
        params: { period: 30 }
      });

      const stats = response.data.overview;
      console.log(`✅ 통계 조회 성공:`);
      console.log(`   👥 전체 아티스트: ${stats.total_artists}명`);
      console.log(`   📈 최근 추가: ${stats.recent_artists}명`);
      console.log(`   📝 전기 보유: ${stats.artists_with_bio}명`);
      console.log(`   🖼️ 이미지 보유: ${stats.artists_with_images}명`);
      console.log(`   🌍 국적 다양성: ${stats.unique_nationalities}개국`);
      
      return response.data;

    } catch (error) {
      console.log(`❌ 통계 조회 실패: ${error.message}`);
      return null;
    }
  }

  /**
   * 품질 리포트 테스트
   */
  async testQualityReport() {
    console.log(`📋 품질 리포트 테스트`);
    
    try {
      const response = await this.client.get('/quality-report');

      const report = response.data;
      console.log(`✅ 품질 리포트 조회 성공:`);
      console.log(`   🎯 평균 품질 점수: ${report.overview.averageQualityScore}/100`);
      console.log(`   📊 완성도 등급: ${report.overview.completenessRating}%`);
      
      console.log(`   📝 전기 완성도: ${report.completeness.biography.percentage}%`);
      console.log(`   📅 출생년도: ${report.completeness.birthYear.percentage}%`);
      console.log(`   🌍 국적 정보: ${report.completeness.nationality.percentage}%`);
      console.log(`   🖼️ 이미지 정보: ${report.completeness.images.percentage}%`);

      if (report.recommendations.length > 0) {
        console.log(`   💡 개선 권장사항:`);
        report.recommendations.forEach(rec => {
          console.log(`     - ${rec}`);
        });
      }
      
      return response.data;

    } catch (error) {
      console.log(`❌ 품질 리포트 실패: ${error.message}`);
      return null;
    }
  }

  /**
   * 메서드별 성능 비교 테스트
   */
  async testMethodComparison() {
    console.log(`⚡ 메서드별 성능 비교 테스트`);
    
    const testArtist = 'Georgia O\'Keeffe';
    const methods = ['enhanced', 'python', 'hybrid'];
    const results = {};

    for (const method of methods) {
      console.log(`\n🧪 ${method} 메서드 테스트...`);
      
      try {
        const result = await this.testSingleArtist(testArtist, method);
        results[method] = {
          success: result.success,
          duration: result.duration,
          dataQuality: this.evaluateDataQuality(result.data?.artist)
        };
        
        // 잠시 대기 (API 부하 방지)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        results[method] = {
          success: false,
          error: error.message
        };
      }
    }

    console.log(`\n📈 성능 비교 결과:`);
    methods.forEach(method => {
      const result = results[method];
      if (result.success) {
        console.log(`   ${method}: ${result.duration}ms, 품질: ${result.dataQuality}/10`);
      } else {
        console.log(`   ${method}: 실패 (${result.error})`);
      }
    });

    return results;
  }

  /**
   * 데이터 품질 평가
   */
  evaluateDataQuality(artistData) {
    if (!artistData) return 0;
    
    let score = 0;
    
    if (artistData.name) score += 1;
    if (artistData.bio && artistData.bio.length > 100) score += 2;
    if (artistData.birth_year) score += 1;
    if (artistData.death_year) score += 1;
    if (artistData.nationality) score += 1;
    if (artistData.images && Object.keys(artistData.images).length > 0) score += 1;
    if (artistData.sources && Object.keys(artistData.sources).length > 1) score += 1;
    if (artistData.copyright_status && artistData.copyright_status !== 'unknown') score += 1;
    if (artistData.era) score += 1;
    
    return score;
  }

  /**
   * 전체 테스트 실행
   */
  async runFullTest() {
    console.log(`🚀 SAYU 아티스트 수집 시스템 전체 테스트 시작\n`);
    
    try {
      // 1. 기본 기능 테스트
      console.log(`=== 1. 단일 아티스트 수집 테스트 ===`);
      await this.testSingleArtist('Leonardo da Vinci', 'enhanced');
      
      console.log(`\n=== 2. 검색 기능 테스트 ===`);
      await this.testSearch();
      
      console.log(`\n=== 3. 통계 조회 테스트 ===`);
      await this.testStats();
      
      console.log(`\n=== 4. 품질 리포트 테스트 ===`);
      await this.testQualityReport();
      
      // 2. 성능 테스트 (선택적)
      if (process.argv.includes('--performance')) {
        console.log(`\n=== 5. 성능 비교 테스트 ===`);
        await this.testMethodComparison();
      }
      
      // 3. 배치 테스트 (선택적)
      if (process.argv.includes('--batch-test')) {
        console.log(`\n=== 6. 배치 수집 테스트 ===`);
        await this.testBatchArtists(TEST_ARTISTS.slice(0, 3), 'enhanced');
      }

    } catch (error) {
      console.error(`💥 전체 테스트 중 오류 발생:`, error);
    }

    // 결과 요약
    this.results.summary.endTime = new Date().toISOString();
    this.results.summary.totalDuration = Date.now() - new Date(this.results.summary.startTime).getTime();
    
    console.log(`\n📋 테스트 결과 요약:`);
    console.log(`   총 테스트: ${this.results.summary.total}개`);
    console.log(`   성공: ${this.results.summary.successful}개`);
    console.log(`   실패: ${this.results.summary.failed}개`);
    console.log(`   성공률: ${this.results.summary.total > 0 ? 
      Math.round(this.results.summary.successful / this.results.summary.total * 100) : 0}%`);
    console.log(`   총 소요시간: ${Math.round(this.results.summary.totalDuration / 1000)}초`);

    // 결과 저장
    await this.saveResults();
  }

  /**
   * 결과 저장
   */
  async saveResults() {
    try {
      // 출력 디렉토리 생성
      await fs.mkdir(config.outputDir, { recursive: true });
      
      const filename = `test-results-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      const filepath = path.join(config.outputDir, filename);
      
      await fs.writeFile(filepath, JSON.stringify(this.results, null, 2));
      
      console.log(`💾 테스트 결과 저장: ${filepath}`);
      
    } catch (error) {
      console.error(`❌ 결과 저장 실패:`, error.message);
    }
  }
}

// 메인 실행 함수
async function main() {
  const args = process.argv.slice(2);
  const tester = new ArtistCollectionTester();

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
SAYU 아티스트 수집 시스템 테스트 도구

사용법:
  node test-artist-collection.js [옵션]

옵션:
  --single <name>     단일 아티스트 테스트
  --method <method>   수집 방법 (enhanced|python|hybrid)
  --batch <file>      배치 테스트 (파일에서 목록 읽기)
  --stats            통계만 조회
  --search <query>   검색 테스트
  --performance      성능 비교 테스트 포함
  --batch-test       배치 수집 테스트 포함
  --full             전체 테스트 실행

예시:
  node test-artist-collection.js --single "Pablo Picasso"
  node test-artist-collection.js --method hybrid --single "Frida Kahlo"
  node test-artist-collection.js --full --performance
  node test-artist-collection.js --stats
    `);
    return;
  }

  try {
    if (args.includes('--single')) {
      const nameIndex = args.indexOf('--single') + 1;
      const artistName = args[nameIndex];
      const methodIndex = args.indexOf('--method');
      const method = methodIndex !== -1 ? args[methodIndex + 1] : 'enhanced';
      
      await tester.testSingleArtist(artistName, method);
      
    } else if (args.includes('--stats')) {
      await tester.testStats();
      
    } else if (args.includes('--search')) {
      await tester.testSearch();
      
    } else if (args.includes('--full')) {
      await tester.runFullTest();
      
    } else {
      // 기본: 간단한 테스트
      console.log(`🎯 기본 테스트 실행 (--help로 전체 옵션 확인)`);
      await tester.testSingleArtist('Pablo Picasso');
      await tester.testStats();
    }

  } catch (error) {
    console.error(`💥 테스트 실행 중 오류:`, error);
    process.exit(1);
  }
}

// 스크립트 직접 실행 시에만 main 함수 호출
if (require.main === module) {
  main();
}

module.exports = ArtistCollectionTester;