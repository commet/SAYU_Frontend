// Gemini Classification Runner
// Gemini API만 사용하는 작가 분류

require('dotenv').config();

const GeminiOnlyClassifier = require('./src/services/geminiOnlyClassifier');
const { pool } = require('./src/config/database');

class GeminiClassificationRunner {
  constructor() {
    this.classifier = new GeminiOnlyClassifier();
    this.stats = {
      total: 0,
      processed: 0,
      successful: 0,
      failed: 0,
      updated: 0,
      created: 0
    };
  }

  async run() {
    console.log('🚀 Gemini APT Classification 시작');
    console.log('===================================');
    console.log('추론 엔진 + Gemini API 결합\n');
    
    const startTime = new Date();
    
    try {
      // 1. 분류가 필요한 작가들 선택
      const artists = await this.loadArtistsForClassification();
      this.stats.total = artists.length;
      
      console.log(`📊 분류 대상: ${this.stats.total}명\n`);
      
      // 2. 각 작가 처리
      for (const artist of artists) {
        await this.processArtist(artist);
        
        // Gemini API 제한 고려 (분당 60회)
        if (this.stats.processed % 10 === 0 && this.stats.processed < this.stats.total) {
          console.log('\n⏸️  API 제한 고려하여 1초 대기...\n');
          await this.sleep(1000);
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
    // 다양한 조건의 작가 선택
    const result = await pool.query(`
      WITH artist_data AS (
        SELECT 
          a.*,
          LENGTH(COALESCE(a.bio, '')) as bio_length,
          COUNT(DISTINCT aa.artwork_id) as artwork_count,
          CASE 
            WHEN a.apt_profile IS NULL THEN 'no_profile'
            WHEN (a.apt_profile->'primary_types'->0->>'confidence')::INT < 70 THEN 'low_confidence'
            ELSE 'skip'
          END as status
        FROM artists a
        LEFT JOIN artwork_artists aa ON a.id = aa.artist_id
        GROUP BY a.id
      )
      SELECT * FROM artist_data
      WHERE status != 'skip'
      ORDER BY 
        CASE status
          WHEN 'no_profile' THEN 1
          WHEN 'low_confidence' THEN 2
        END,
        bio_length DESC
      LIMIT 100
    `);
    
    return result.rows;
  }

  async processArtist(artist) {
    this.stats.processed++;
    
    console.log(`\n${'='.repeat(50)}`);
    console.log(`🎨 [${this.stats.processed}/${this.stats.total}] ${artist.name}`);
    console.log(`${'='.repeat(50)}`);
    
    try {
      // 기존 프로필 확인
      if (artist.apt_profile) {
        const existing = artist.apt_profile.primary_types?.[0];
        console.log(`📋 기존: ${existing?.type} (${existing?.confidence}%)`);
      }
      
      // 작가 정보
      console.log(`📍 ${artist.nationality || '?'} | ${artist.era || '?'} | ${artist.birth_year || '?'}-${artist.death_year || '?'}`);
      console.log(`📝 Bio: ${artist.bio_length}자 | 작품: ${artist.artwork_count}개`);
      
      // Gemini 분류 실행
      const result = await this.classifier.classifyArtist(artist);
      
      // 결과 표시
      console.log(`\n✅ 결과: ${result.aptType} (신뢰도: ${result.confidence}%)`);
      console.log(`📊 L/S: ${result.axisScores.L_S > 0 ? `S+${result.axisScores.L_S}` : `L${-result.axisScores.L_S}`} | A/R: ${result.axisScores.A_R > 0 ? `R+${result.axisScores.A_R}` : `A${-result.axisScores.A_R}`} | E/M: ${result.axisScores.E_M > 0 ? `M+${result.axisScores.E_M}` : `E${-result.axisScores.E_M}`} | F/C: ${result.axisScores.F_C > 0 ? `C+${result.axisScores.F_C}` : `F${-result.axisScores.F_C}`}`);
      
      if (result.secondaryAPT?.length > 0) {
        console.log(`🔄 대안: ${result.secondaryAPT.join(', ')}`);
      }
      
      // 데이터베이스 저장
      await this.saveResult(artist, result);
      
      this.stats.successful++;
      if (artist.apt_profile) {
        this.stats.updated++;
      } else {
        this.stats.created++;
      }
      
    } catch (error) {
      console.error(`❌ 실패: ${error.message}`);
      this.stats.failed++;
    }
  }

  async saveResult(artist, result) {
    // apt_profile 형식으로 변환
    const aptProfile = {
      dimensions: {
        L: Math.round(50 - result.axisScores.L_S / 2),
        S: Math.round(50 + result.axisScores.L_S / 2),
        A: Math.round(50 - result.axisScores.A_R / 2),
        R: Math.round(50 + result.axisScores.A_R / 2),
        E: Math.round(50 - result.axisScores.E_M / 2),
        M: Math.round(50 + result.axisScores.E_M / 2),
        F: Math.round(50 - result.axisScores.F_C / 2),
        C: Math.round(50 + result.axisScores.F_C / 2)
      },
      primary_types: [{
        type: result.aptType,
        title: this.getAPTTitle(result.aptType),
        animal: this.getAPTAnimal(result.aptType),
        name_ko: this.getAPTAnimalKo(result.aptType),
        weight: 0.9,
        confidence: result.confidence
      }],
      meta: {
        analysis_date: new Date().toISOString(),
        analysis_method: result.analysis.strategy,
        artist_name: artist.name,
        source: 'gemini_classifier_v1',
        reasoning: Array.isArray(result.analysis.reasoning) 
          ? result.analysis.reasoning.join(' | ') 
          : 'Gemini AI 분석'
      }
    };
    
    // 업데이트
    await pool.query(`
      UPDATE artists 
      SET 
        apt_profile = $2,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [artist.id, JSON.stringify(aptProfile)]);
  }

  getAPTTitle(type) {
    const titles = {
      'LAEF': '몽환적 방랑자', 'LAEC': '감성 큐레이터', 'LAMF': '직관적 탐구자', 'LAMC': '철학적 수집가',
      'LREF': '고독한 관찰자', 'LREC': '섬세한 감정가', 'LRMF': '디지털 탐험가', 'LRMC': '학구적 연구자',
      'SAEF': '감성 나눔이', 'SAEC': '예술 네트워커', 'SAMF': '영감 전도사', 'SAMC': '문화 기획자',
      'SREF': '열정적 관람자', 'SREC': '따뜻한 안내자', 'SRMF': '지식 멘토', 'SRMC': '체계적 교육자'
    };
    return titles[type] || 'Unknown';
  }

  getAPTAnimal(type) {
    const animals = {
      'LAEF': 'fox', 'LAEC': 'cat', 'LAMF': 'owl', 'LAMC': 'turtle',
      'LREF': 'chameleon', 'LREC': 'hedgehog', 'LRMF': 'octopus', 'LRMC': 'beaver',
      'SAEF': 'butterfly', 'SAEC': 'penguin', 'SAMF': 'parrot', 'SAMC': 'deer',
      'SREF': 'dog', 'SREC': 'duck', 'SRMF': 'elephant', 'SRMC': 'eagle'
    };
    return animals[type] || 'unknown';
  }

  getAPTAnimalKo(type) {
    const animals = {
      'LAEF': '여우', 'LAEC': '고양이', 'LAMF': '올빼미', 'LAMC': '거북이',
      'LREF': '카멜레온', 'LREC': '고슴도치', 'LRMF': '문어', 'LRMC': '비버',
      'SAEF': '나비', 'SAEC': '펭귄', 'SAMF': '앵무새', 'SAMC': '사슴',
      'SREF': '강아지', 'SREC': '오리', 'SRMF': '코끼리', 'SRMC': '독수리'
    };
    return animals[type] || '알 수 없음';
  }

  async showSummary(startTime) {
    const duration = (new Date() - startTime) / 1000;
    
    console.log('\n\n' + '='.repeat(50));
    console.log('📊 Gemini 분류 완료');
    console.log('='.repeat(50));
    
    console.log(`\n📈 처리 통계:`);
    console.log(`   전체: ${this.stats.total}명`);
    console.log(`   성공: ${this.stats.successful}명 (신규: ${this.stats.created}, 업데이트: ${this.stats.updated})`);
    console.log(`   실패: ${this.stats.failed}명`);
    console.log(`   시간: ${Math.round(duration)}초 (${(duration/this.stats.processed).toFixed(1)}초/명)`);
    
    // APT 분포
    const distribution = await pool.query(`
      SELECT 
        apt_profile->'primary_types'->0->>'type' as apt_type,
        apt_profile->'primary_types'->0->>'title' as title,
        COUNT(*) as count,
        AVG((apt_profile->'primary_types'->0->>'confidence')::INT) as avg_confidence
      FROM artists
      WHERE apt_profile IS NOT NULL
        AND apt_profile->'meta'->>'analysis_date' > $1
      GROUP BY apt_type, title
      ORDER BY count DESC
    `, [startTime.toISOString()]);
    
    if (distribution.rows.length > 0) {
      console.log('\n🎭 새로 분류된 APT 분포:');
      distribution.rows.forEach(row => {
        console.log(`   ${row.apt_type} (${row.title}): ${row.count}명 (평균 ${Math.round(row.avg_confidence)}%)`);
      });
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 실행
const runner = new GeminiClassificationRunner();
runner.run().catch(console.error);