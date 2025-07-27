// Hybrid Classification Runner V2
// 기존 apt_profile 스키마에 맞춘 버전

require('dotenv').config();

const HybridAPTClassifier = require('./src/services/hybridAPTClassifier');
const { pool } = require('./src/config/database');

class HybridClassificationRunnerV2 {
  constructor() {
    this.classifier = new HybridAPTClassifier();
    this.stats = {
      total: 0,
      processed: 0,
      successful: 0,
      failed: 0,
      updated: 0,
      skipped: 0
    };
  }

  async run() {
    console.log('🚀 Hybrid APT Classification V2 시작');
    console.log('=====================================');
    console.log('기존 apt_profile 스키마 활용 버전\n');
    
    const startTime = new Date();
    
    try {
      // 1. 분류가 필요한 작가들 선택
      const artists = await this.loadArtistsForClassification();
      this.stats.total = artists.length;
      
      console.log(`📊 분류 대상: ${this.stats.total}명\n`);
      
      // 2. 각 작가 처리
      for (const artist of artists) {
        await this.processArtist(artist);
        
        // API 제한 고려
        if (this.stats.processed % 5 === 0 && this.stats.processed < this.stats.total) {
          console.log('\n⏸️  API 제한 고려하여 2초 대기...\n');
          await this.sleep(2000);
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

  async loadArtistsForClassification() {
    // apt_profile이 없거나 confidence가 낮은 작가들을 선택
    const result = await pool.query(`
      WITH artist_data AS (
        SELECT 
          a.*,
          LENGTH(COALESCE(a.bio, '')) as bio_length,
          COUNT(DISTINCT aa.artwork_id) as artwork_count,
          CASE 
            WHEN a.apt_profile IS NULL THEN 'no_profile'
            WHEN (a.apt_profile->'primary_types'->0->>'confidence')::INT < 70 THEN 'low_confidence'
            WHEN a.apt_profile->>'meta' IS NULL THEN 'old_format'
            WHEN (a.apt_profile->'meta'->>'analysis_date')::TIMESTAMP < NOW() - INTERVAL '30 days' THEN 'outdated'
            ELSE 'skip'
          END as classification_status
        FROM artists a
        LEFT JOIN artwork_artists aa ON a.id = aa.artist_id
        GROUP BY a.id
      )
      SELECT * FROM artist_data
      WHERE classification_status != 'skip'
      ORDER BY 
        CASE classification_status
          WHEN 'no_profile' THEN 1
          WHEN 'low_confidence' THEN 2
          WHEN 'old_format' THEN 3
          WHEN 'outdated' THEN 4
        END,
        bio_length DESC
      LIMIT 5
    `);
    
    return result.rows;
  }

  async processArtist(artist) {
    this.stats.processed++;
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🎨 [${this.stats.processed}/${this.stats.total}] ${artist.name}`);
    console.log(`${'='.repeat(60)}`);
    
    try {
      // 기존 프로필 확인
      if (artist.apt_profile) {
        console.log('📋 기존 APT 프로필:');
        const existingType = artist.apt_profile.primary_types?.[0]?.type || 'UNKNOWN';
        const existingConfidence = artist.apt_profile.primary_types?.[0]?.confidence || 0;
        console.log(`   - 유형: ${existingType}`);
        console.log(`   - 신뢰도: ${existingConfidence}%`);
        console.log(`   - 상태: ${artist.classification_status}`);
      }
      
      // 작가 정보 표시
      console.log('\n📋 작가 정보:');
      console.log(`   - 국적: ${artist.nationality || '알 수 없음'}`);
      console.log(`   - 시대: ${artist.era || '알 수 없음'}`);
      console.log(`   - 생몰: ${artist.birth_year || '?'} - ${artist.death_year || '현재'}`);
      console.log(`   - Bio: ${artist.bio_length}자`);
      console.log(`   - 작품: ${artist.artwork_count}개`);
      
      // 하이브리드 분류 실행
      const result = await this.classifier.classifyArtist(artist);
      
      // apt_profile 형식으로 변환
      const aptProfile = this.convertToAPTProfile(result, artist);
      
      // 결과 표시
      console.log('\n📊 새로운 분석 결과:');
      console.log(`   ✅ APT: ${result.aptType} (신뢰도: ${result.confidence}%)`);
      console.log(`   📍 차원 점수:`);
      console.log(`      - L/S: ${Math.round(50 + result.axisScores.L_S / 2)} (${result.axisScores.L_S < 0 ? '혼자 L' : '함께 S'})`);
      console.log(`      - A/R: ${Math.round(50 + result.axisScores.A_R / 2)} (${result.axisScores.A_R < 0 ? '추상 A' : '구상 R'})`);
      console.log(`      - E/M: ${Math.round(50 + result.axisScores.E_M / 2)} (${result.axisScores.E_M < 0 ? '감정 E' : '의미 M'})`);
      console.log(`      - F/C: ${Math.round(50 + result.axisScores.F_C / 2)} (${result.axisScores.F_C < 0 ? '자유 F' : '체계 C'})`);
      
      // 데이터베이스 업데이트
      await this.updateArtistProfile(artist.id, aptProfile);
      
      // 기존 프로필이 있었다면 업데이트, 없었다면 성공
      if (artist.apt_profile) {
        this.stats.updated++;
        console.log('\n✅ APT 프로필 업데이트 완료');
      } else {
        this.stats.successful++;
        console.log('\n✅ 새 APT 프로필 생성 완료');
      }
      
    } catch (error) {
      console.error(`\n❌ 처리 실패: ${error.message}`);
      this.stats.failed++;
    }
  }

  convertToAPTProfile(result, artist) {
    // 축 점수를 0-100 범위로 변환 (기존 형식에 맞춤)
    const dimensions = {
      L: Math.round(50 - result.axisScores.L_S / 2),
      S: Math.round(50 + result.axisScores.L_S / 2),
      A: Math.round(50 - result.axisScores.A_R / 2),
      R: Math.round(50 + result.axisScores.A_R / 2),
      E: Math.round(50 - result.axisScores.E_M / 2),
      M: Math.round(50 + result.axisScores.E_M / 2),
      F: Math.round(50 - result.axisScores.F_C / 2),
      C: Math.round(50 + result.axisScores.F_C / 2)
    };
    
    // APT 타입 정보 가져오기
    const typeInfo = this.getAPTTypeInfo(result.aptType);
    
    return {
      dimensions,
      primary_types: [{
        type: result.aptType,
        title: typeInfo.title,
        animal: typeInfo.animal,
        name_ko: typeInfo.name_ko,
        weight: 0.9,
        confidence: result.confidence
      }],
      meta: {
        analysis_date: new Date().toISOString(),
        analysis_method: 'hybrid_ai_inference_v2',
        artist_name: artist.name,
        source: 'sayu_hybrid_classifier',
        strategy: result.analysis?.strategy || 'unknown',
        ai_sources: result.analysis?.sources || {},
        reasoning: Array.isArray(result.analysis?.reasoning) 
          ? result.analysis.reasoning.join(' | ') 
          : (result.analysis?.reasoning || '하이브리드 AI 분석')
      }
    };
  }

  getAPTTypeInfo(aptType) {
    const typeMap = {
      'LAEF': { title: '몽환적 방랑자', animal: 'fox', name_ko: '여우' },
      'LAEC': { title: '감성 큐레이터', animal: 'cat', name_ko: '고양이' },
      'LAMF': { title: '직관적 탐구자', animal: 'owl', name_ko: '올빼미' },
      'LAMC': { title: '철학적 수집가', animal: 'turtle', name_ko: '거북이' },
      'LREF': { title: '고독한 관찰자', animal: 'chameleon', name_ko: '카멜레온' },
      'LREC': { title: '섬세한 감정가', animal: 'hedgehog', name_ko: '고슴도치' },
      'LRMF': { title: '디지털 탐험가', animal: 'octopus', name_ko: '문어' },
      'LRMC': { title: '학구적 연구자', animal: 'beaver', name_ko: '비버' },
      'SAEF': { title: '감성 나눔이', animal: 'butterfly', name_ko: '나비' },
      'SAEC': { title: '예술 네트워커', animal: 'penguin', name_ko: '펭귄' },
      'SAMF': { title: '영감 전도사', animal: 'parrot', name_ko: '앵무새' },
      'SAMC': { title: '문화 기획자', animal: 'deer', name_ko: '사슴' },
      'SREF': { title: '열정적 관람자', animal: 'dog', name_ko: '강아지' },
      'SREC': { title: '따뜻한 안내자', animal: 'duck', name_ko: '오리' },
      'SRMF': { title: '지식 멘토', animal: 'elephant', name_ko: '코끼리' },
      'SRMC': { title: '체계적 교육자', animal: 'eagle', name_ko: '독수리' }
    };
    
    return typeMap[aptType] || { 
      title: 'Unknown Type', 
      animal: 'unknown', 
      name_ko: '알 수 없음' 
    };
  }

  async updateArtistProfile(artistId, aptProfile) {
    await pool.query(`
      UPDATE artists 
      SET 
        apt_profile = $2,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [artistId, JSON.stringify(aptProfile)]);
  }

  async showSummary(startTime) {
    const endTime = new Date();
    const duration = (endTime - startTime) / 1000;
    
    console.log('\n\n' + '='.repeat(60));
    console.log('📊 하이브리드 분류 V2 완료');
    console.log('='.repeat(60));
    
    console.log('\n📈 처리 통계:');
    console.log(`   - 전체: ${this.stats.total}명`);
    console.log(`   - 신규 생성: ${this.stats.successful}명`);
    console.log(`   - 업데이트: ${this.stats.updated}명`);
    console.log(`   - 실패: ${this.stats.failed}명`);
    console.log(`   - 처리 시간: ${Math.round(duration)}초`);
    
    // APT 유형 분포
    const distribution = await pool.query(`
      SELECT 
        apt_profile->'primary_types'->0->>'type' as apt_type,
        COUNT(*) as count,
        AVG((apt_profile->'primary_types'->0->>'confidence')::INT) as avg_confidence
      FROM artists
      WHERE apt_profile IS NOT NULL
        AND apt_profile->'primary_types'->0->>'type' IS NOT NULL
      GROUP BY apt_profile->'primary_types'->0->>'type'
      ORDER BY count DESC
      LIMIT 16
    `);
    
    console.log('\n🎭 APT 유형별 분포:');
    distribution.rows.forEach(row => {
      const typeInfo = this.getAPTTypeInfo(row.apt_type);
      console.log(`   - ${row.apt_type} (${typeInfo.title}): ${row.count}명 (평균 신뢰도: ${Math.round(row.avg_confidence)}%)`);
    });
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 실행
const runner = new HybridClassificationRunnerV2();
runner.run().catch(console.error);