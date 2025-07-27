// 외부 데이터 수집 통합 분류 실행

require('dotenv').config();

const EnrichedComprehensiveClassifier = require('./src/services/enrichedComprehensiveClassifier');
const { pool } = require('./src/config/database');

async function runEnrichedClassification() {
  console.log('🚀 강화된 APT 분류 시스템 실행');
  console.log('=====================================');
  console.log('외부 데이터 수집 + AI 분석 통합\n');
  
  const classifier = new EnrichedComprehensiveClassifier();
  const stats = {
    total: 0,
    processed: 0,
    successful: 0,
    failed: 0,
    dataQuality: { excellent: 0, good: 0, moderate: 0, poor: 0 },
    aptDistribution: {},
    processingTime: Date.now()
  };
  
  try {
    // 50명 샘플로 시작 (타임아웃 방지)
    const artists = await pool.query(`
      SELECT *
      FROM artists
      WHERE apt_profile IS NULL 
         OR apt_profile->'primary_types'->0->>'type' = 'SRMC'
      ORDER BY 
        CASE 
          WHEN name LIKE '%Van Gogh%' OR name LIKE '%Picasso%' 
            OR name LIKE '%Monet%' OR name LIKE '%Rembrandt%' THEN 1
          WHEN bio IS NOT NULL AND LENGTH(bio) > 500 THEN 2
          WHEN nationality IS NOT NULL AND era IS NOT NULL THEN 3
          WHEN birth_year IS NOT NULL THEN 4
          ELSE 5
        END,
        RANDOM()
      LIMIT 50
    `);
    
    stats.total = artists.rows.length;
    console.log(`📊 분류 대상: ${stats.total}명 (유명 작가 우선)\n`);
    
    // 5명씩 배치 처리
    const batchSize = 5;
    
    for (let i = 0; i < artists.rows.length; i += batchSize) {
      const batch = artists.rows.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(stats.total / batchSize);
      
      console.log(`\n🔄 배치 ${batchNum}/${totalBatches} 처리 중...`);
      console.log('─'.repeat(50));
      
      // 배치 내 병렬 처리
      const batchResults = await Promise.allSettled(
        batch.map(async (artist) => {
          try {
            const result = await classifier.classifyArtist(artist);
            
            // DB 업데이트
            await updateArtist(artist, result);
            
            return { 
              success: true, 
              artist: artist.name, 
              result,
              quality: getDataQuality(result)
            };
          } catch (error) {
            return { 
              success: false, 
              artist: artist.name, 
              error: error.message 
            };
          }
        })
      );
      
      // 배치 결과 처리
      for (const batchResult of batchResults) {
        stats.processed++;
        
        if (batchResult.status === 'fulfilled' && batchResult.value.success) {
          const { artist, result, quality } = batchResult.value;
          
          stats.successful++;
          stats.aptDistribution[result.aptType] = 
            (stats.aptDistribution[result.aptType] || 0) + 1;
          stats.dataQuality[quality]++;
          
          console.log(`✅ ${artist} → ${result.aptType} (${result.confidence}%)`);
        } else {
          stats.failed++;
          const artist = batchResult.value?.artist || 'Unknown';
          const error = batchResult.value?.error || batchResult.reason;
          console.log(`❌ ${artist}: ${error}`);
        }
      }
      
      // 중간 통계
      if (stats.processed % 20 === 0) {
        displayProgress(stats);
      }
      
      // API 제한 대기
      if (i + batchSize < artists.rows.length) {
        console.log('\n⏸️  다음 배치 대기 (2초)...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    // 최종 결과
    displayFinalResults(stats);
    
  } catch (error) {
    console.error('실행 오류:', error);
  } finally {
    await pool.end();
  }
}

function getDataQuality(result) {
  if (result.confidence >= 75) return 'excellent';
  if (result.confidence >= 60) return 'good';
  if (result.confidence >= 45) return 'moderate';
  return 'poor';
}

function displayProgress(stats) {
  console.log('\n📈 현재 진행 상황:');
  console.log(`   처리: ${stats.processed}/${stats.total}`);
  console.log(`   성공: ${stats.successful} | 실패: ${stats.failed}`);
  
  // 상위 5개 APT
  const topAPTs = Object.entries(stats.aptDistribution)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);
  
  console.log('   APT 분포:');
  topAPTs.forEach(([type, count]) => {
    const percentage = Math.round(count * 100 / stats.successful);
    console.log(`     ${type}: ${count}명 (${percentage}%)`);
  });
}

function displayFinalResults(stats) {
  const processingTime = Math.round((Date.now() - stats.processingTime) / 1000);
  
  console.log('\n\n' + '='.repeat(60));
  console.log('📊 강화된 분류 최종 결과');
  console.log('='.repeat(60));
  
  console.log(`\n⏱️  처리 시간: ${processingTime}초`);
  console.log(`📋 처리 통계:`);
  console.log(`   총 처리: ${stats.processed}명`);
  console.log(`   성공: ${stats.successful}명`);
  console.log(`   실패: ${stats.failed}명`);
  
  console.log(`\n📊 데이터 품질:`);
  console.log(`   우수 (75%+): ${stats.dataQuality.excellent}명`);
  console.log(`   양호 (60%+): ${stats.dataQuality.good}명`);
  console.log(`   보통 (45%+): ${stats.dataQuality.moderate}명`);
  console.log(`   부족 (<45%): ${stats.dataQuality.poor}명`);
  
  console.log(`\n🎭 APT 분포:`);
  const sortedAPT = Object.entries(stats.aptDistribution)
    .sort(([,a], [,b]) => b - a);
  
  sortedAPT.forEach(([type, count]) => {
    const percentage = Math.round(count * 100 / stats.successful);
    const bar = '█'.repeat(Math.max(1, Math.round(percentage / 2)));
    console.log(`   ${type}: ${bar} ${count}명 (${percentage}%)`);
  });
  
  // 다양성 계산
  const total = stats.successful;
  const entropy = -sortedAPT.reduce((sum, [_, count]) => {
    const p = count / total;
    return sum + (p > 0 ? p * Math.log2(p) : 0);
  }, 0);
  
  const maxEntropy = Math.log2(16);
  const diversityIndex = (entropy / maxEntropy * 100).toFixed(1);
  
  console.log(`\n📈 다양성 지수: ${diversityIndex}%`);
  
  const srmcCount = stats.aptDistribution['SRMC'] || 0;
  const srmcPercentage = stats.successful > 0 ? 
    Math.round(srmcCount * 100 / stats.successful) : 0;
  
  console.log(`📉 SRMC 비율: ${srmcPercentage}%`);
  
  // 목표 달성
  console.log(`\n🎯 목표 달성:`);
  console.log(`   다양성: ${diversityIndex > 60 ? '✅' : '❌'} ${diversityIndex}% / 60%`);
  console.log(`   SRMC 억제: ${srmcPercentage < 15 ? '✅' : '❌'} ${srmcPercentage}% / 15%`);
  console.log(`   활용 유형: ${sortedAPT.length >= 10 ? '✅' : '❌'} ${sortedAPT.length}개 / 10개`);
  
  // 외부 데이터 통계
  console.log(`\n🌐 외부 데이터 활용:`);
  console.log(`   Wikipedia: ${classifier.sessionStats.enrichmentSuccess}회`);
  console.log(`   API 호출: ${classifier.sessionStats.apiCalls}회`);
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
      sources: result.analysis.sources,
      enriched_data: result.analysis.enrichedData
    }
  };
  
  await pool.query(
    'UPDATE artists SET apt_profile = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
    [artist.id, JSON.stringify(aptProfile)]
  );
}

// 실행
runEnrichedClassification().catch(console.error);