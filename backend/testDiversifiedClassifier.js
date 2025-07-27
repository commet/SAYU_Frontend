// 다양성 분류기 테스트 - 균형잡힌 APT 분포 확인

require('dotenv').config();

const DiversifiedClassifier = require('./src/services/diversifiedClassifier');
const { pool } = require('./src/config/database');

async function testDiversifiedClassifier() {
  console.log('🌈 다양성 분류기 테스트');
  console.log('=====================================');
  console.log('균형잡힌 APT 분포를 위한 개선된 분류기\n');
  
  const classifier = new DiversifiedClassifier();
  const stats = {
    total: 0,
    processed: 0,
    successful: 0,
    failed: 0,
    aptDistribution: {},
    adjustments: 0
  };
  
  try {
    // 100명의 작가 샘플 (SRMC 또는 미분류)
    const testArtists = await pool.query(`
      SELECT *
      FROM artists
      WHERE apt_profile IS NULL 
         OR apt_profile->'primary_types'->0->>'type' = 'SRMC'
         OR apt_profile->'primary_types'->0->>'type' IS NULL
      ORDER BY 
        CASE 
          WHEN bio IS NOT NULL AND LENGTH(bio) > 500 THEN 1
          WHEN nationality IS NOT NULL AND era IS NOT NULL THEN 2
          WHEN birth_year IS NOT NULL THEN 3
          ELSE 4
        END,
        RANDOM()
      LIMIT 100
    `);
    
    stats.total = testArtists.rows.length;
    console.log(`📊 테스트 대상: ${stats.total}명의 작가\n`);
    
    // 배치별로 처리 (10명씩)
    const batchSize = 10;
    for (let i = 0; i < testArtists.rows.length; i += batchSize) {
      const batch = testArtists.rows.slice(i, i + batchSize);
      console.log(`\n🔄 배치 ${Math.floor(i / batchSize) + 1}/${Math.ceil(stats.total / batchSize)} 처리 중...`);
      
      for (const artist of batch) {
        stats.processed++;
        
        console.log(`\n[${stats.processed}/${stats.total}] ${artist.name}`);
        
        try {
          const result = await classifier.classifyArtist(artist);
          
          console.log(`✅ APT: ${result.aptType} (신뢰도: ${result.confidence}%)`);
          
          if (result.analysis.adjusted) {
            console.log(`   📝 SRMC에서 조정됨`);
            stats.adjustments++;
          }
          
          stats.successful++;
          stats.aptDistribution[result.aptType] = (stats.aptDistribution[result.aptType] || 0) + 1;
          
          // DB 업데이트
          await updateArtist(artist, result);
          
        } catch (error) {
          console.error(`❌ 오류: ${error.message}`);
          stats.failed++;
        }
      }
      
      // 현재 분포 출력
      console.log('\n📊 현재 APT 분포:');
      const currentDist = Object.entries(stats.aptDistribution)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 8);
      
      currentDist.forEach(([type, count]) => {
        const percentage = Math.round(count * 100 / stats.successful);
        const bar = '█'.repeat(Math.round(percentage / 2));
        console.log(`   ${type}: ${bar} ${count}명 (${percentage}%)`);
      });
      
      // API 제한
      if (i + batchSize < testArtists.rows.length) {
        console.log('\n⏸️  API 제한 대기 (3초)...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    
    // 최종 결과
    console.log('\n\n' + '='.repeat(60));
    console.log('📊 다양성 분류기 최종 결과');
    console.log('='.repeat(60));
    console.log(`총 처리: ${stats.processed}명`);
    console.log(`성공: ${stats.successful}명`);
    console.log(`실패: ${stats.failed}명`);
    console.log(`SRMC 조정: ${stats.adjustments}건`);
    
    console.log('\n🎭 최종 APT 분포:');
    const finalDist = Object.entries(stats.aptDistribution)
      .sort(([,a], [,b]) => b - a);
    
    finalDist.forEach(([type, count]) => {
      const percentage = Math.round(count * 100 / stats.successful);
      const bar = '█'.repeat(Math.round(percentage / 2));
      console.log(`   ${type}: ${bar} ${count}명 (${percentage}%)`);
    });
    
    // 다양성 지수 계산 (Shannon Entropy)
    const total = stats.successful;
    const entropy = -finalDist.reduce((sum, [_, count]) => {
      const p = count / total;
      return sum + (p > 0 ? p * Math.log2(p) : 0);
    }, 0);
    
    const maxEntropy = Math.log2(16); // 16가지 APT
    const diversityIndex = (entropy / maxEntropy * 100).toFixed(1);
    
    console.log(`\n📈 다양성 지수: ${diversityIndex}% (100% = 완전 균등 분포)`);
    
    // SRMC 비율 확인
    const srmcCount = stats.aptDistribution['SRMC'] || 0;
    const srmcPercentage = stats.successful > 0 ? 
      Math.round(srmcCount * 100 / stats.successful) : 0;
    
    console.log(`\n📉 SRMC 비율: ${srmcPercentage}% (목표: <15%)`);
    
    // 전체 DB SRMC 수 확인
    const totalSRMC = await pool.query(`
      SELECT COUNT(*) as count
      FROM artists
      WHERE apt_profile->'primary_types'->0->>'type' = 'SRMC'
    `);
    
    console.log(`   전체 DB SRMC: ${totalSRMC.rows[0].count}명`);
    
  } catch (error) {
    console.error('실행 오류:', error);
  } finally {
    await pool.end();
  }
}

async function updateArtist(artist, result) {
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
      adjusted: result.analysis.adjusted || false
    }
  };
  
  await pool.query(
    'UPDATE artists SET apt_profile = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
    [artist.id, JSON.stringify(aptProfile)]
  );
}

// 실행
testDiversifiedClassifier().catch(console.error);