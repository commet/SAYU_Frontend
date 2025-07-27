// Artist APT Classification Batch Runner
// 데이터베이스의 모든 작가를 APT 유형으로 분류하는 배치 스크립트

// const ArtistAPTMatcher = require('./src/services/artistAPTMatcher');
const ArtistAPTInferenceEngine = require('./src/services/artistAPTInferenceEngine');
const db = require('./src/config/database');
require('dotenv').config();

class ArtistAPTClassificationRunner {
  constructor() {
    this.matcher = new ArtistAPTMatcher();
    this.inferenceEngine = new ArtistAPTInferenceEngine();
    this.stats = {
      total: 0,
      processed: 0,
      successful: 0,
      failed: 0,
      skipped: 0,
      startTime: null,
      endTime: null
    };
  }

  async run() {
    console.log('🚀 Artist APT Classification 시작');
    console.log('================================\n');
    
    this.stats.startTime = new Date();
    
    try {
      // 1. 작가 데이터 로드
      const artists = await this.loadArtists();
      this.stats.total = artists.length;
      
      console.log(`📊 총 ${this.stats.total}명의 작가 발견`);
      console.log(`- Bio 있는 작가: ${artists.filter(a => a.bio).length}명`);
      console.log(`- 이미 분류된 작가: ${artists.filter(a => a.apt_type).length}명\n`);
      
      // 2. 우선순위별로 정렬
      const prioritizedArtists = this.prioritizeArtists(artists);
      
      // 3. 배치 처리
      await this.processBatch(prioritizedArtists);
      
      // 4. 결과 요약
      await this.summarizeResults();
      
    } catch (error) {
      console.error('❌ 배치 처리 중 오류:', error);
    } finally {
      await db.end();
    }
  }

  async loadArtists() {
    const result = await db.query(`
      SELECT 
        a.*,
        COUNT(DISTINCT aw.id) as artwork_count,
        COUNT(DISTINCT f.id) as follower_count,
        LENGTH(a.bio) as bio_length,
        CASE 
          WHEN COUNT(DISTINCT aw.id) > 0 THEN COUNT(DISTINCT aw.id)
          ELSE 100 -- 기본값
        END as productivity_estimate
      FROM artists a
      LEFT JOIN artworks aw ON a.id = aw.artist_id
      LEFT JOIN follows f ON a.id = f.artist_id
      GROUP BY a.id
      ORDER BY 
        CASE WHEN a.apt_type IS NULL THEN 0 ELSE 1 END,
        LENGTH(a.bio) DESC NULLS LAST,
        COUNT(DISTINCT f.id) DESC,
        COUNT(DISTINCT aw.id) DESC
    `);
    
    return result.rows;
  }

  prioritizeArtists(artists) {
    // 우선순위:
    // 1. APT 미분류 + 풍부한 bio (1000자+)
    // 2. APT 미분류 + 중간 bio (100-1000자)
    // 3. APT 미분류 + 짧은 bio (1-100자)
    // 4. APT 미분류 + bio 없음 (추론 엔진 사용)
    // 5. 이미 분류됨 (6개월 이상 지난 경우만 재분류)
    
    const groups = {
      richBio: [],
      mediumBio: [],
      shortBio: [],
      noBio: [],
      alreadyClassified: []
    };
    
    artists.forEach(artist => {
      if (artist.apt_type) {
        // 6개월 이상 지난 경우만 재분류 대상
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        if (artist.apt_analyzed_at && new Date(artist.apt_analyzed_at) > sixMonthsAgo) {
          return; // 최근 분류는 건너뛰기
        }
        groups.alreadyClassified.push(artist);
      } else if (artist.bio_length >= 1000) {
        groups.richBio.push(artist);
      } else if (artist.bio_length >= 100) {
        groups.mediumBio.push(artist);
      } else if (artist.bio_length > 0) {
        groups.shortBio.push(artist);
      } else {
        groups.noBio.push(artist);
      }
    });
    
    console.log('📋 우선순위별 그룹:');
    console.log(`- 풍부한 bio (1000자+): ${groups.richBio.length}명`);
    console.log(`- 중간 bio (100-1000자): ${groups.mediumBio.length}명`);
    console.log(`- 짧은 bio (1-100자): ${groups.shortBio.length}명`);
    console.log(`- bio 없음: ${groups.noBio.length}명`);
    console.log(`- 재분류 대상: ${groups.alreadyClassified.length}명\n`);
    
    return [
      ...groups.richBio,
      ...groups.mediumBio,
      ...groups.shortBio,
      ...groups.noBio,
      ...groups.alreadyClassified
    ];
  }

  async processBatch(artists) {
    console.log('🔄 배치 처리 시작...\n');
    
    for (let i = 0; i < artists.length; i++) {
      const artist = artists[i];
      this.stats.processed++;
      
      try {
        // 진행 상황 표시
        if (this.stats.processed % 10 === 0) {
          const progress = ((this.stats.processed / this.stats.total) * 100).toFixed(1);
          console.log(`\n📊 진행률: ${progress}% (${this.stats.processed}/${this.stats.total})`);
          const elapsed = (new Date() - this.stats.startTime) / 1000;
          const rate = this.stats.processed / elapsed;
          const remaining = (this.stats.total - this.stats.processed) / rate;
          console.log(`⏱️  예상 잔여 시간: ${Math.round(remaining / 60)}분\n`);
        }
        
        // bio가 매우 짧거나 없는 경우 추론 엔진 사용
        if (!artist.bio || artist.bio_length < 100) {
          await this.classifyWithInference(artist);
        } else {
          // 일반 분류
          await this.classifyArtist(artist);
        }
        
        // API 제한 고려
        await this.sleep(500);
        
      } catch (error) {
        console.error(`❌ ${artist.name} 처리 실패:`, error.message);
        this.stats.failed++;
      }
    }
  }

  async classifyArtist(artist) {
    try {
      console.log(`🎨 분석 중: ${artist.name} (bio: ${artist.bio_length}자)`);
      
      const result = await this.matcher.analyzeArtist(artist);
      await this.matcher.saveAnalysisResult(result);
      
      console.log(`✅ ${artist.name} → ${result.aptType} (신뢰도: ${result.confidence}%)`);
      this.stats.successful++;
      
    } catch (error) {
      throw error;
    }
  }

  async classifyWithInference(artist) {
    try {
      console.log(`🔮 추론 중: ${artist.name} (데이터 제한적)`);
      
      // 추론 엔진 사용
      const inference = this.inferenceEngine.inferAPTFromLimitedData(artist);
      
      // 추론 결과를 일반 분석 결과 형식으로 변환
      const result = {
        artistId: artist.id,
        artistName: artist.name,
        aptType: inference.primaryAPT[0] || 'UNKNOWN',
        axisScores: inference.axisScores,
        confidence: inference.confidence,
        analysis: {
          summary: `추론 기반 분류: ${inference.primaryAPT[0]}`,
          reasoning: inference.reasoning,
          viewingExperience: inference.viewingExperience,
          inferenceNote: '제한된 데이터로 인한 추론 기반 분류'
        },
        timestamp: new Date().toISOString()
      };
      
      await this.matcher.saveAnalysisResult(result);
      
      console.log(`✅ ${artist.name} → ${result.aptType} (추론, 신뢰도: ${result.confidence}%)`);
      this.stats.successful++;
      
    } catch (error) {
      throw error;
    }
  }

  async summarizeResults() {
    this.stats.endTime = new Date();
    const duration = (this.stats.endTime - this.stats.startTime) / 1000;
    
    console.log('\n\n=================================');
    console.log('📊 Artist APT Classification 완료');
    console.log('=================================\n');
    
    console.log('📈 처리 통계:');
    console.log(`- 전체 작가: ${this.stats.total}명`);
    console.log(`- 처리 완료: ${this.stats.processed}명`);
    console.log(`- 성공: ${this.stats.successful}명`);
    console.log(`- 실패: ${this.stats.failed}명`);
    console.log(`- 건너뜀: ${this.stats.skipped}명`);
    console.log(`- 처리 시간: ${Math.round(duration / 60)}분 ${Math.round(duration % 60)}초`);
    console.log(`- 평균 처리 속도: ${(this.stats.processed / duration).toFixed(2)}명/초\n`);
    
    // APT 유형별 분포
    const distribution = await this.getAPTDistribution();
    console.log('🎯 APT 유형별 분포:');
    distribution.forEach(row => {
      const percentage = ((row.count / this.stats.total) * 100).toFixed(1);
      console.log(`- ${row.apt_type}: ${row.count}명 (${percentage}%) - 평균 신뢰도: ${row.avg_confidence.toFixed(1)}%`);
    });
    
    // 신뢰도별 분포
    const confidenceDistribution = await this.getConfidenceDistribution();
    console.log('\n🔍 신뢰도별 분포:');
    confidenceDistribution.forEach(row => {
      console.log(`- ${row.range}: ${row.count}명`);
    });
  }

  async getAPTDistribution() {
    const result = await db.query(`
      SELECT 
        apt_type,
        COUNT(*) as count,
        AVG(apt_confidence) as avg_confidence
      FROM artists
      WHERE apt_type IS NOT NULL
      GROUP BY apt_type
      ORDER BY count DESC
    `);
    
    return result.rows;
  }

  async getConfidenceDistribution() {
    const result = await db.query(`
      SELECT 
        CASE 
          WHEN apt_confidence >= 80 THEN '높음 (80%+)'
          WHEN apt_confidence >= 60 THEN '중간 (60-79%)'
          WHEN apt_confidence >= 40 THEN '낮음 (40-59%)'
          ELSE '매우 낮음 (<40%)'
        END as range,
        COUNT(*) as count
      FROM artists
      WHERE apt_confidence IS NOT NULL
      GROUP BY range
      ORDER BY 
        CASE range
          WHEN '높음 (80%+)' THEN 1
          WHEN '중간 (60-79%)' THEN 2
          WHEN '낮음 (40-59%)' THEN 3
          ELSE 4
        END
    `);
    
    return result.rows;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 실행
const runner = new ArtistAPTClassificationRunner();
runner.run().catch(console.error);