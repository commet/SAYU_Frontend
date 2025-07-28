const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const WikipediaDataCollector = require('./src/services/wikipediaDataCollector');
const MetMuseumDataCollector = require('./src/services/metMuseumDataCollector');
const { Pool } = require('pg');

class BatchArtistCollector {
  constructor() {
    this.wikipediaCollector = new WikipediaDataCollector();
    this.metCollector = new MetMuseumDataCollector();
    this.results = [];
    this.errors = [];
    this.processed = 0;
    this.startTime = Date.now();

    // PostgreSQL 연결
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
  }

  async loadArtistsFromCSV() {
    return new Promise((resolve, reject) => {
      const artists = [];
      const csvPath = path.join(__dirname, 'major_artists_wiki_data.csv');

      fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (row) => {
          artists.push({
            rank: parseInt(row.rank),
            name: row.name,
            category: row.category,
            estimatedImportance: parseFloat(row.estimated_importance),
            priorityTier: row.priority_tier,
            culturalSignificance: row.cultural_significance
          });
        })
        .on('end', () => {
          // 전체 작가 목록을 순위대로 정렬
          const sortedArtists = artists.sort((a, b) => a.rank - b.rank);

          console.log(`📊 CSV에서 총 ${sortedArtists.length}명 작가 데이터 로딩 완료`);
          resolve(sortedArtists);
        })
        .on('error', reject);
    });
  }

  async collectArtistData(artist) {
    console.log(`\n🎨 [${artist.rank}] ${artist.name} 데이터 수집 시작...`);

    try {
      // 1단계: Wikipedia 데이터 수집
      const wikipediaData = await this.wikipediaCollector.getArtistInfo(artist.name);
      await this.delay(2000); // API 제한 고려

      // 2단계: Met Museum 데이터 수집 (선택적)
      let metData = null;
      try {
        metData = await this.metCollector.getArtistInfo(artist.name);
        await this.delay(1000);
      } catch (metError) {
        console.log(`   ⚠️ Met Museum 데이터 수집 실패: ${metError.message}`);
      }

      // 3단계: 데이터 통합 및 품질 평가
      const integratedData = this.integrateData(artist, wikipediaData, metData);

      console.log(`   ✅ ${artist.name} 수집 완료 (신뢰도: ${integratedData.reliabilityScore})`);
      return integratedData;

    } catch (error) {
      console.error(`   ❌ ${artist.name} 수집 실패:`, error.message);
      return {
        originalArtist: artist,
        error: error.message,
        reliabilityScore: 'failed',
        timestamp: new Date().toISOString()
      };
    }
  }

  integrateData(originalArtist, wikipediaData, metData) {
    // 기본 신뢰도 계산
    let reliabilityScore = 0;
    const reliabilityFactors = [];

    // Wikipedia 데이터 품질 평가
    if (wikipediaData && wikipediaData.confidence) {
      if (wikipediaData.birth_year) reliabilityScore += 20;
      if (wikipediaData.death_year) reliabilityScore += 15;
      if (wikipediaData.nationality) reliabilityScore += 15;
      if (wikipediaData.art_movements && wikipediaData.art_movements.length > 0) reliabilityScore += 20;
      if (wikipediaData.bio && wikipediaData.bio.length > 100) reliabilityScore += 20;
      if (wikipediaData.key_works && wikipediaData.key_works.length > 0) reliabilityScore += 10;

      reliabilityFactors.push(`Wikipedia 데이터 (${wikipediaData.confidence})`);
    }

    // Met Museum 데이터 품질 평가
    if (metData && metData.works_count && metData.works_count > 0) {
      reliabilityScore += Math.min(metData.works_count * 2, 20);
      reliabilityFactors.push(`Met Museum ${metData.works_count}작품`);
    }

    // 신뢰도 등급 결정
    let reliabilityGrade;
    if (reliabilityScore >= 80) reliabilityGrade = 'high';
    else if (reliabilityScore >= 60) reliabilityGrade = 'medium';
    else if (reliabilityScore >= 40) reliabilityGrade = 'low';
    else reliabilityGrade = 'very_low';

    return {
      // 원본 정보
      originalArtist,

      // 수집된 데이터
      wikipediaData: wikipediaData || null,
      metMuseumData: metData || null,

      // 품질 평가
      reliabilityScore,
      reliabilityGrade,
      reliabilityFactors,

      // 메타데이터
      collectedAt: new Date().toISOString(),
      processingNotes: this.generateProcessingNotes(originalArtist, wikipediaData, metData)
    };
  }

  generateProcessingNotes(artist, wikipedia, met) {
    const notes = [];

    if (!wikipedia || !wikipedia.success) {
      notes.push('Wikipedia 데이터 수집 실패');
    }

    if (!met || !met.artworks || met.artworks.length === 0) {
      notes.push('Met Museum 작품 정보 없음');
    }

    if (wikipedia && wikipedia.movements && wikipedia.movements.length === 0) {
      notes.push('예술 운동/사조 정보 부족');
    }

    return notes;
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async saveBatchResults() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `batch_collection_results_${timestamp}.json`;
    const filepath = path.join(__dirname, filename);

    const summary = {
      metadata: {
        totalProcessed: this.processed,
        successfulCollections: this.results.filter(r => r.reliabilityGrade !== 'failed').length,
        failedCollections: this.results.filter(r => r.reliabilityGrade === 'failed').length,
        startTime: this.startTime,
        endTime: Date.now(),
        durationMinutes: Math.round((Date.now() - this.startTime) / 60000)
      },
      qualityDistribution: this.getQualityDistribution(),
      results: this.results,
      errors: this.errors
    };

    fs.writeFileSync(filepath, JSON.stringify(summary, null, 2));
    console.log(`\n💾 결과 저장 완료: ${filename}`);

    return summary;
  }

  getQualityDistribution() {
    const distribution = {
      high: 0,
      medium: 0,
      low: 0,
      very_low: 0,
      failed: 0
    };

    this.results.forEach(result => {
      if (result.reliabilityGrade in distribution) {
        distribution[result.reliabilityGrade]++;
      }
    });

    return distribution;
  }

  printProgress() {
    const elapsed = Math.round((Date.now() - this.startTime) / 1000);
    const rate = this.processed / elapsed * 60; // per minute

    console.log(`\n📈 진행 상황: ${this.processed}명 처리 완료 (${elapsed}초 경과, ${rate.toFixed(1)}명/분)`);
    console.log(`   성공: ${this.results.filter(r => r.reliabilityGrade !== 'failed').length}명`);
    console.log(`   실패: ${this.results.filter(r => r.reliabilityGrade === 'failed').length}명`);
  }

  async run(limit = 50, startIndex = 0) {
    console.log('🚀 배치 아티스트 데이터 수집 시작!');
    console.log(`📋 목표: ${startIndex + 1}번째부터 ${startIndex + limit}번째까지 작가 데이터 수집`);
    console.log(`⏱️ 예상 소요 시간: 약 ${Math.round(limit * 5 / 60)}분`);

    try {
      // CSV에서 작가 목록 로딩
      const allArtists = await this.loadArtistsFromCSV();

      // 지정된 범위의 작가들만 선택
      const artists = allArtists.slice(startIndex, startIndex + limit);
      console.log(`🎯 ${artists.length}명 작가 처리 시작 (${startIndex + 1}~${startIndex + artists.length}번째)`);

      // 배치 수집 실행
      for (const artist of artists) {
        const result = await this.collectArtistData(artist);
        this.results.push(result);
        this.processed++;

        // 진행 상황 출력 (10명마다)
        if (this.processed % 10 === 0) {
          this.printProgress();
        }

        // API 제한 고려한 대기 시간
        await this.delay(3000); // 3초 대기
      }

      // 최종 결과 저장 및 요약
      const summary = await this.saveBatchResults();
      this.printFinalSummary(summary);

      return summary;

    } catch (error) {
      console.error('❌ 배치 수집 중 오류:', error);
      throw error;
    } finally {
      await this.pool.end();
    }
  }

  printFinalSummary(summary) {
    console.log('\n🎯 배치 수집 완료!');
    console.log('='.repeat(50));
    console.log(`📊 총 처리: ${summary.metadata.totalProcessed}명`);
    console.log(`✅ 성공: ${summary.metadata.successfulCollections}명`);
    console.log(`❌ 실패: ${summary.metadata.failedCollections}명`);
    console.log(`⏱️ 소요 시간: ${summary.metadata.durationMinutes}분`);
    console.log('\n📈 품질 분포:');
    Object.entries(summary.qualityDistribution).forEach(([grade, count]) => {
      if (count > 0) {
        console.log(`   ${grade}: ${count}명`);
      }
    });

    // 다음 단계 안내
    console.log('\n🔄 다음 단계:');
    console.log('   1. 품질 검증: node analyzeCollectionResults.js');
    console.log('   2. 데이터베이스 통합: node integrateBatchResults.js');
    console.log('   3. APT 프로필 생성: node generateAPTProfiles.js');
  }
}

// 실행 스크립트
async function main() {
  const collector = new BatchArtistCollector();

  // 명령행 인자 파싱
  let limit = 50;
  let startIndex = 0;

  // 간단한 인자 파싱
  for (let i = 2; i < process.argv.length; i++) {
    if (process.argv[i] === '--start' && process.argv[i + 1]) {
      startIndex = parseInt(process.argv[i + 1]);
      i++;
    } else if (process.argv[i] === '--count' && process.argv[i + 1]) {
      limit = parseInt(process.argv[i + 1]);
      i++;
    } else if (!process.argv[i].startsWith('--')) {
      limit = parseInt(process.argv[i]);
    }
  }

  try {
    await collector.run(limit, startIndex);
    console.log('\n🎉 배치 수집 성공적으로 완료!');
    process.exit(0);
  } catch (error) {
    console.error('\n💥 배치 수집 실패:', error);
    process.exit(1);
  }
}

// 직접 실행 시
if (require.main === module) {
  main();
}

module.exports = BatchArtistCollector;
