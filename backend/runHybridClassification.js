// Hybrid Classification Runner
// 추론 엔진 + AI API를 활용한 작가 분류

require('dotenv').config(); // 먼저 환경변수 로드

const HybridAPTClassifier = require('./src/services/hybridAPTClassifier');
const { pool } = require('./src/config/database');

class HybridClassificationRunner {
  constructor() {
    this.classifier = new HybridAPTClassifier();
    this.stats = {
      total: 0,
      processed: 0,
      successful: 0,
      failed: 0,
      strategies: {
        full_ai_analysis: 0,
        hybrid_analysis: 0,
        inference_with_ai: 0,
        pure_inference: 0
      }
    };
  }

  async run() {
    console.log('🚀 Hybrid APT Classification 시작');
    console.log('================================');
    console.log('전략: 추론 엔진 + AI API (OpenAI/Gemini) 결합\n');
    
    const startTime = new Date();
    
    try {
      // 1. 테스트를 위해 다양한 데이터 품질의 작가 선택
      const artists = await this.loadDiverseArtists();
      this.stats.total = artists.length;
      
      console.log(`📊 ${this.stats.total}명의 작가 분석 예정\n`);
      
      // 2. 각 작가 처리
      for (const artist of artists) {
        await this.processArtist(artist);
        
        // API 제한 고려하여 대기
        if (this.stats.processed % 5 === 0) {
          console.log('\n⏸️  API 제한 고려하여 3초 대기...\n');
          await this.sleep(3000);
        }
      }
      
      // 3. 결과 요약
      await this.showSummary(startTime);
      
    } catch (error) {
      console.error('❌ 실행 중 오류:', error);
    } finally {
      await pool.end();
    }
  }

  async loadDiverseArtists() {
    // 다양한 데이터 품질의 작가들을 선택
    const result = await pool.query(`
      WITH categorized_artists AS (
        SELECT 
          a.*,
          LENGTH(COALESCE(a.bio, '')) as bio_length,
          COUNT(DISTINCT aw.id) as artwork_count,
          CASE 
            WHEN LENGTH(COALESCE(a.bio, '')) >= 1000 THEN 'rich'
            WHEN LENGTH(COALESCE(a.bio, '')) >= 100 THEN 'medium'
            WHEN LENGTH(COALESCE(a.bio, '')) > 0 THEN 'limited'
            ELSE 'none'
          END as data_category
        FROM artists a
        LEFT JOIN artworks aw ON a.id = aw.artist_id
        WHERE a.apt_type IS NULL 
           OR a.apt_analyzed_at < NOW() - INTERVAL '7 days'
        GROUP BY a.id
      )
      SELECT * FROM (
        (SELECT * FROM categorized_artists WHERE data_category = 'rich' ORDER BY RANDOM() LIMIT 3)
        UNION ALL
        (SELECT * FROM categorized_artists WHERE data_category = 'medium' ORDER BY RANDOM() LIMIT 4)
        UNION ALL
        (SELECT * FROM categorized_artists WHERE data_category = 'limited' ORDER BY RANDOM() LIMIT 4)
        UNION ALL
        (SELECT * FROM categorized_artists WHERE data_category = 'none' ORDER BY RANDOM() LIMIT 4)
      ) diverse_set
      ORDER BY bio_length DESC
    `);
    
    return result.rows;
  }

  async processArtist(artist) {
    this.stats.processed++;
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🎨 [${this.stats.processed}/${this.stats.total}] ${artist.name}`);
    console.log(`${'='.repeat(60)}`);
    
    try {
      // 작가 정보 표시
      console.log('📋 작가 정보:');
      console.log(`   - 국적: ${artist.nationality || '알 수 없음'}`);
      console.log(`   - 시대: ${artist.era || '알 수 없음'}`);
      console.log(`   - 생몰: ${artist.birth_year || '?'} - ${artist.death_year || '현재'}`);
      console.log(`   - Bio: ${artist.bio_length}자`);
      console.log(`   - 작품: ${artist.artwork_count}개`);
      console.log(`   - 데이터 카테고리: ${artist.data_category}`);
      
      // 하이브리드 분류 실행
      const result = await this.classifier.classifyArtist(artist);
      
      // 전략 통계 업데이트
      if (result.analysis?.strategy) {
        this.stats.strategies[result.analysis.strategy]++;
      }
      
      // 결과 표시
      console.log('\n📊 분석 결과:');
      console.log(`   ✅ APT: ${result.aptType} (신뢰도: ${result.confidence}%)`);
      console.log(`   📍 축 점수:`);
      console.log(`      - L/S: ${result.axisScores.L_S} (${result.axisScores.L_S < 0 ? '혼자' : '함께'})`);
      console.log(`      - A/R: ${result.axisScores.A_R} (${result.axisScores.A_R < 0 ? '추상' : '구상'})`);
      console.log(`      - E/M: ${result.axisScores.E_M} (${result.axisScores.E_M < 0 ? '감정' : '의미'})`);
      console.log(`      - F/C: ${result.axisScores.F_C} (${result.axisScores.F_C < 0 ? '자유' : '체계'})`);
      
      if (result.secondaryAPT?.length > 0) {
        console.log(`   🔄 대안 APT: ${result.secondaryAPT.join(', ')}`);
      }
      
      if (result.analysis?.sources) {
        console.log(`   🤖 AI 분석 소스:`);
        for (const [source, value] of Object.entries(result.analysis.sources)) {
          if (value) console.log(`      - ${source}: ${value}`);
        }
      }
      
      // 데이터베이스 저장
      await this.saveResult(artist, result);
      
      this.stats.successful++;
      console.log('\n✅ 분류 완료 및 저장됨');
      
    } catch (error) {
      console.error(`\n❌ 처리 실패: ${error.message}`);
      this.stats.failed++;
    }
  }

  async saveResult(artist, result) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // artists 테이블 업데이트
      await client.query(`
        UPDATE artists 
        SET 
          apt_type = $2,
          apt_scores = $3,
          apt_analysis = $4,
          apt_confidence = $5,
          apt_analyzed_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [
        artist.id,
        result.aptType,
        JSON.stringify(result.axisScores),
        JSON.stringify({
          summary: `하이브리드 분석: ${result.aptType}`,
          strategy: result.analysis?.strategy,
          sources: result.analysis?.sources,
          reasoning: result.analysis?.reasoning,
          viewingExperience: result.viewingExperience,
          secondaryAPT: result.secondaryAPT,
          aiValidation: result.aiValidation
        }),
        result.confidence
      ]);
      
      // 분석 이력 저장
      await client.query(`
        INSERT INTO artist_apt_analysis_history 
        (artist_id, apt_type, axis_scores, confidence, analysis)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        artist.id,
        result.aptType,
        JSON.stringify(result.axisScores),
        result.confidence,
        JSON.stringify({
          method: 'hybrid_classifier',
          version: '2.0',
          strategy: result.analysis?.strategy,
          sources: result.analysis?.sources,
          timestamp: new Date().toISOString()
        })
      ]);
      
      await client.query('COMMIT');
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async showSummary(startTime) {
    const endTime = new Date();
    const duration = (endTime - startTime) / 1000;
    
    console.log('\n\n' + '='.repeat(60));
    console.log('📊 하이브리드 분류 완료');
    console.log('='.repeat(60));
    
    console.log('\n📈 처리 통계:');
    console.log(`   - 전체: ${this.stats.total}명`);
    console.log(`   - 성공: ${this.stats.successful}명`);
    console.log(`   - 실패: ${this.stats.failed}명`);
    console.log(`   - 처리 시간: ${Math.round(duration)}초`);
    console.log(`   - 평균 처리 시간: ${(duration / this.stats.processed).toFixed(1)}초/명`);
    
    console.log('\n🎯 전략별 사용 빈도:');
    for (const [strategy, count] of Object.entries(this.stats.strategies)) {
      const percentage = ((count / this.stats.processed) * 100).toFixed(1);
      console.log(`   - ${strategy}: ${count}회 (${percentage}%)`);
    }
    
    // APT 분포
    const distribution = await pool.query(`
      SELECT 
        apt_type,
        COUNT(*) as count,
        AVG(apt_confidence) as avg_confidence,
        MIN(apt_confidence) as min_confidence,
        MAX(apt_confidence) as max_confidence
      FROM artists
      WHERE apt_type IS NOT NULL
        AND apt_analyzed_at > $1
      GROUP BY apt_type
      ORDER BY count DESC
    `, [startTime]);
    
    console.log('\n🎭 APT 유형별 분포:');
    distribution.rows.forEach(row => {
      console.log(`   - ${row.apt_type}: ${row.count}명`);
      console.log(`     신뢰도: 평균 ${parseFloat(row.avg_confidence).toFixed(1)}% (${row.min_confidence}-${row.max_confidence}%)`);
    });
    
    // 신뢰도 분포
    const confidenceDist = await pool.query(`
      SELECT 
        CASE 
          WHEN apt_confidence >= 80 THEN '높음 (80%+)'
          WHEN apt_confidence >= 60 THEN '중간 (60-79%)'
          WHEN apt_confidence >= 40 THEN '낮음 (40-59%)'
          ELSE '매우 낮음 (<40%)'
        END as level,
        COUNT(*) as count
      FROM artists
      WHERE apt_analyzed_at > $1
      GROUP BY level
      ORDER BY 
        CASE level
          WHEN '높음 (80%+)' THEN 1
          WHEN '중간 (60-79%)' THEN 2
          WHEN '낮음 (40-59%)' THEN 3
          ELSE 4
        END
    `, [startTime]);
    
    console.log('\n🔍 신뢰도 분포:');
    confidenceDist.rows.forEach(row => {
      console.log(`   - ${row.level}: ${row.count}명`);
    });
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 실행
const runner = new HybridClassificationRunner();
runner.run().catch(console.error);