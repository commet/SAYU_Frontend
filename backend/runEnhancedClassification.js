// Enhanced Classification Runner
// 모든 작가에게 AI 추론을 적용하는 개선된 버전

require('dotenv').config();

const EnhancedGeminiClassifier = require('./src/services/enhancedGeminiClassifier');
const { pool } = require('./src/config/database');

async function runEnhancedClassification() {
  console.log('🚀 Enhanced Gemini Classification 시작');
  console.log('=====================================');
  console.log('모든 작가에게 AI 추론 적용 (Bio 없어도 OK)\n');
  
  const classifier = new EnhancedGeminiClassifier();
  const stats = {
    total: 0,
    processed: 0,
    successful: 0,
    failed: 0,
    strategies: {
      enhanced_gemini: 0,
      rule_based_only: 0,
      fallback: 0
    }
  };
  
  try {
    // 다양한 데이터 품질의 작가 50명 선택
    const artists = await pool.query(`
      WITH artist_stats AS (
        SELECT 
          a.*,
          LENGTH(COALESCE(a.bio, '')) as bio_length,
          CASE 
            WHEN LENGTH(COALESCE(a.bio, '')) > 500 THEN 'rich'
            WHEN LENGTH(COALESCE(a.bio, '')) > 0 THEN 'basic'
            WHEN a.era IS NOT NULL OR a.nationality IS NOT NULL THEN 'metadata_only'
            ELSE 'minimal'
          END as data_quality
        FROM artists a
        WHERE a.apt_profile IS NULL
           OR (a.apt_profile->'primary_types'->0->>'confidence')::INT < 70
      )
      SELECT * FROM (
        -- 각 데이터 품질별로 균형있게 선택
        (SELECT * FROM artist_stats WHERE data_quality = 'rich' ORDER BY RANDOM() LIMIT 10)
        UNION ALL
        (SELECT * FROM artist_stats WHERE data_quality = 'basic' ORDER BY RANDOM() LIMIT 10)
        UNION ALL
        (SELECT * FROM artist_stats WHERE data_quality = 'metadata_only' ORDER BY RANDOM() LIMIT 15)
        UNION ALL
        (SELECT * FROM artist_stats WHERE data_quality = 'minimal' ORDER BY RANDOM() LIMIT 15)
      ) AS diverse_artists
      ORDER BY data_quality, bio_length DESC
      LIMIT 50
    `);
    
    stats.total = artists.rows.length;
    console.log(`📊 분류 대상: ${stats.total}명\n`);
    
    // 데이터 품질 분포 표시
    const qualityDist = {};
    artists.rows.forEach(a => {
      qualityDist[a.data_quality] = (qualityDist[a.data_quality] || 0) + 1;
    });
    
    console.log('📈 데이터 품질 분포:');
    Object.entries(qualityDist).forEach(([quality, count]) => {
      const qualityDesc = {
        'rich': '풍부한 전기 (500자+)',
        'basic': '기본 전기 (1-500자)',
        'metadata_only': '메타데이터만',
        'minimal': '최소 정보'
      };
      console.log(`   - ${qualityDesc[quality]}: ${count}명`);
    });
    console.log('');
    
    // 각 작가 처리
    for (const artist of artists.rows) {
      stats.processed++;
      
      console.log(`\n${'='.repeat(60)}`);
      console.log(`[${stats.processed}/${stats.total}] ${artist.name}`);
      console.log(`데이터: ${artist.data_quality} | Bio: ${artist.bio_length}자 | ${artist.nationality || '?'} | ${artist.era || '?'}`);
      
      try {
        const result = await classifier.classifyArtist(artist);
        
        console.log(`✅ ${result.aptType} (신뢰도: ${result.confidence}%)`);
        console.log(`전략: ${result.analysis.strategy}`);
        
        if (result.analysis.sources) {
          console.log(`규칙→${result.analysis.sources.rule_based} | AI→${result.analysis.sources.gemini} | 최종→${result.analysis.sources.final}`);
        }
        
        // 통계 업데이트
        stats.successful++;
        stats.strategies[result.analysis.strategy]++;
        
        // DB 저장
        await saveResult(artist, result);
        
      } catch (error) {
        console.error(`❌ 실패: ${error.message}`);
        stats.failed++;
      }
      
      // API 제한 관리
      if (stats.processed % 10 === 0 && stats.processed < stats.total) {
        console.log('\n⏸️  API 제한 대기 (1초)...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // 최종 통계
    console.log('\n\n' + '='.repeat(60));
    console.log('📊 최종 결과');
    console.log('='.repeat(60));
    console.log(`처리: ${stats.processed}/${stats.total}`);
    console.log(`성공: ${stats.successful} | 실패: ${stats.failed}`);
    console.log('\n전략 사용:');
    Object.entries(stats.strategies).forEach(([strategy, count]) => {
      if (count > 0) {
        console.log(`- ${strategy}: ${count}회`);
      }
    });
    
  } catch (error) {
    console.error('실행 오류:', error);
  } finally {
    await pool.end();
  }
}

async function saveResult(artist, result) {
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
      confidence: result.confidence,
      weight: 0.9
    }],
    meta: {
      analysis_date: new Date().toISOString(),
      analysis_method: 'enhanced_gemini_v2',
      strategy: result.analysis.strategy,
      data_weights: result.analysis.weights
    }
  };
  
  await pool.query(
    'UPDATE artists SET apt_profile = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
    [artist.id, JSON.stringify(aptProfile)]
  );
}

// 실행
runEnhancedClassification().catch(console.error);