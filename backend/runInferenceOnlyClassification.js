// Inference-Only Artist APT Classification
// OpenAI API 없이 추론 엔진만으로 작가 분류

const ArtistAPTInferenceEngine = require('./src/services/artistAPTInferenceEngine');
const db = require('./src/config/database');
require('dotenv').config();

class InferenceOnlyClassification {
  constructor() {
    this.inferenceEngine = new ArtistAPTInferenceEngine();
    this.stats = {
      total: 0,
      processed: 0,
      successful: 0,
      failed: 0
    };
  }

  async run() {
    console.log('🚀 Inference-Only Artist APT Classification 시작');
    console.log('===================================================\n');
    
    try {
      // 샘플 작가 20명만 처리
      const artists = await this.loadSampleArtists(20);
      this.stats.total = artists.length;
      
      console.log(`📊 ${this.stats.total}명의 샘플 작가 처리 시작\n`);
      
      for (const artist of artists) {
        await this.processArtist(artist);
      }
      
      await this.showResults();
      
    } catch (error) {
      console.error('❌ 오류:', error);
    } finally {
      await db.end();
    }
  }

  async loadSampleArtists(limit) {
    const result = await db.query(`
      SELECT 
        a.*,
        LENGTH(a.bio) as bio_length,
        COUNT(DISTINCT aw.id) as artwork_count
      FROM artists a
      LEFT JOIN artworks aw ON a.id = aw.artist_id
      WHERE a.apt_type IS NULL
      GROUP BY a.id
      ORDER BY 
        LENGTH(a.bio) DESC NULLS LAST,
        a.name
      LIMIT $1
    `, [limit]);
    
    return result.rows;
  }

  async processArtist(artist) {
    try {
      this.stats.processed++;
      console.log(`\n🎨 [${this.stats.processed}/${this.stats.total}] ${artist.name}`);
      console.log(`   - 국적: ${artist.nationality || '알 수 없음'}`);
      console.log(`   - 시대: ${artist.era || '알 수 없음'}`);
      console.log(`   - 생몰: ${artist.birth_year || '?'} - ${artist.death_year || '현재'}`);
      console.log(`   - Bio: ${artist.bio_length || 0}자`);
      
      // 추론 실행
      const inference = this.inferenceEngine.inferAPTFromLimitedData(artist);
      
      // 결과 저장
      await this.saveInferenceResult(artist, inference);
      
      console.log(`   ✅ APT: ${inference.primaryAPT[0]} (신뢰도: ${inference.confidence}%)`);
      console.log(`   📝 추론: ${inference.reasoning.join(', ')}`);
      
      this.stats.successful++;
      
    } catch (error) {
      console.log(`   ❌ 실패: ${error.message}`);
      this.stats.failed++;
    }
  }

  async saveInferenceResult(artist, inference) {
    const client = await db.getClient();
    
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
        inference.primaryAPT[0] || 'UNKNOWN',
        JSON.stringify(inference.axisScores),
        JSON.stringify({
          summary: `추론 기반 분류: ${inference.primaryAPT[0]}`,
          reasoning: inference.reasoning,
          viewingExperience: inference.viewingExperience,
          secondaryAPT: inference.secondaryAPT
        }),
        inference.confidence
      ]);
      
      // 분석 이력 저장
      await client.query(`
        INSERT INTO artist_apt_analysis_history 
        (artist_id, apt_type, axis_scores, confidence, analysis)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        artist.id,
        inference.primaryAPT[0] || 'UNKNOWN',
        JSON.stringify(inference.axisScores),
        inference.confidence,
        JSON.stringify({
          method: 'inference_engine',
          version: '1.0',
          reasoning: inference.reasoning,
          viewingExperience: inference.viewingExperience
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

  async showResults() {
    console.log('\n\n=================================');
    console.log('📊 처리 결과');
    console.log('=================================\n');
    
    console.log(`전체: ${this.stats.total}명`);
    console.log(`성공: ${this.stats.successful}명`);
    console.log(`실패: ${this.stats.failed}명`);
    
    // APT 분포
    const distribution = await db.query(`
      SELECT 
        apt_type,
        COUNT(*) as count,
        AVG(apt_confidence) as avg_confidence
      FROM artists
      WHERE apt_type IS NOT NULL
        AND apt_analyzed_at > NOW() - INTERVAL '1 hour'
      GROUP BY apt_type
      ORDER BY count DESC
    `);
    
    console.log('\n🎯 APT 유형별 분포:');
    distribution.rows.forEach(row => {
      console.log(`- ${row.apt_type}: ${row.count}명 (평균 신뢰도: ${parseFloat(row.avg_confidence).toFixed(1)}%)`);
    });
  }
}

// 실행
const runner = new InferenceOnlyClassification();
runner.run().catch(console.error);