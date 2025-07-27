// Balanced Classification Runner - SRMC 과다 분류 해결

require('dotenv').config();

const BalancedGeminiClassifier = require('./src/services/balancedGeminiClassifier');
const { pool } = require('./src/config/database');

async function runBalancedClassification() {
  console.log('🚀 균형잡힌 APT 분류 시작');
  console.log('=====================================');
  console.log('SRMC 과다 분류 문제 해결\n');
  
  const classifier = new BalancedGeminiClassifier();
  const stats = {
    total: 0,
    processed: 0,
    successful: 0,
    failed: 0,
    aptDistribution: {}
  };
  
  try {
    // SRMC로 과다 분류된 작가들 우선 재분류
    const artists = await pool.query(`
      SELECT * FROM artists
      WHERE apt_profile->'primary_types'->0->>'type' = 'SRMC'
        AND (
          name LIKE '%Attributed%' 
          OR name LIKE '%Follower%'
          OR name LIKE '%Workshop%'
          OR name LIKE '%After%'
          OR LENGTH(COALESCE(bio, '')) < 100
        )
      ORDER BY RANDOM()
      LIMIT 50
    `);
    
    stats.total = artists.rows.length;
    console.log(`📊 재분류 대상: ${stats.total}명 (SRMC로 분류된 귀속작품/데이터부족 작가)\n`);
    
    for (const artist of artists.rows) {
      stats.processed++;
      
      console.log(`\n${'='.repeat(60)}`);
      console.log(`[${stats.processed}/${stats.total}] ${artist.name}`);
      
      try {
        const result = await classifier.classifyArtist(artist);
        
        console.log(`✅ 새 APT: ${result.aptType} (이전: SRMC)`);
        console.log(`   신뢰도: ${result.confidence}%`);
        console.log(`   근거: ${result.analysis.reasoning}`);
        
        // APT 분포 통계
        stats.aptDistribution[result.aptType] = (stats.aptDistribution[result.aptType] || 0) + 1;
        
        // DB 업데이트
        await updateResult(artist, result);
        stats.successful++;
        
      } catch (error) {
        console.error(`❌ 실패: ${error.message}`);
        stats.failed++;
      }
      
      // API 제한
      if (stats.processed % 10 === 0 && stats.processed < stats.total) {
        console.log('\n⏸️  API 제한 대기 (2초)...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    // 결과 요약
    console.log('\n\n' + '='.repeat(60));
    console.log('📊 재분류 결과');
    console.log('='.repeat(60));
    console.log(`처리: ${stats.successful}/${stats.total} 성공\n`);
    
    console.log('🎭 새로운 APT 분포:');
    const sortedDist = Object.entries(stats.aptDistribution)
      .sort(([,a], [,b]) => b - a);
    
    sortedDist.forEach(([type, count]) => {
      const percentage = Math.round(count * 100 / stats.successful);
      console.log(`   ${type}: ${count}명 (${percentage}%)`);
    });
    
    // 전체 APT 분포 확인
    const overallDist = await pool.query(`
      SELECT 
        apt_profile->'primary_types'->0->>'type' as apt_type,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM artists WHERE apt_profile IS NOT NULL)) as percentage
      FROM artists
      WHERE apt_profile IS NOT NULL
      GROUP BY apt_type
      ORDER BY count DESC
    `);
    
    console.log('\n📈 전체 APT 분포 (업데이트 후):');
    overallDist.rows.forEach(row => {
      console.log(`   ${row.apt_type}: ${row.count}명 (${row.percentage}%)`);
    });
    
  } catch (error) {
    console.error('실행 오류:', error);
  } finally {
    await pool.end();
  }
}

async function updateResult(artist, result) {
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
  
  const typeInfo = typeMap[result.aptType] || { title: 'Unknown', animal: 'unknown', name_ko: '알 수 없음' };
  
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
      title: typeInfo.title,
      animal: typeInfo.animal,
      name_ko: typeInfo.name_ko,
      confidence: result.confidence,
      weight: 0.9
    }],
    meta: {
      analysis_date: new Date().toISOString(),
      analysis_method: result.analysis.strategy,
      actual_artist_name: result.analysis.actualArtistName,
      reasoning: result.analysis.reasoning,
      previous_type: 'SRMC' // 이전 분류 기록
    }
  };
  
  await pool.query(
    'UPDATE artists SET apt_profile = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
    [artist.id, JSON.stringify(aptProfile)]
  );
}

// 실행
runBalancedClassification().catch(console.error);