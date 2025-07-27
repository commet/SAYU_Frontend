// 종합 분류기 실행 - 대규모 작가 분류

require('dotenv').config();

const ComprehensiveClassifier = require('./src/services/comprehensiveClassifier');
const { pool } = require('./src/config/database');

async function runComprehensiveClassification() {
  console.log('🚀 종합 APT 분류 시스템 실행');
  console.log('=====================================');
  console.log('목표: SRMC 15% 이하, 16가지 유형 균형 분포\n');
  
  const classifier = new ComprehensiveClassifier();
  const stats = {
    total: 0,
    processed: 0,
    successful: 0,
    failed: 0,
    apiUsed: 0,
    fallbackUsed: 0,
    adjusted: 0,
    aptDistribution: {},
    dataQuality: { rich: 0, moderate: 0, poor: 0 },
    typeDistribution: {}
  };
  
  try {
    // 전체 미분류 또는 SRMC 작가 수 확인
    const totalCount = await pool.query(`
      SELECT COUNT(*) as count
      FROM artists
      WHERE apt_profile IS NULL 
         OR apt_profile->'primary_types'->0->>'type' = 'SRMC'
    `);
    
    console.log(`📊 분류 대상 전체: ${totalCount.rows[0].count}명\n`);
    
    // 200명 샘플 (다양한 품질)
    const artists = await pool.query(`
      SELECT *
      FROM artists
      WHERE apt_profile IS NULL 
         OR apt_profile->'primary_types'->0->>'type' = 'SRMC'
      ORDER BY 
        CASE 
          WHEN bio IS NOT NULL AND LENGTH(bio) > 1000 THEN 1
          WHEN bio IS NOT NULL AND LENGTH(bio) > 500 THEN 2
          WHEN nationality IS NOT NULL AND era IS NOT NULL AND birth_year IS NOT NULL THEN 3
          WHEN nationality IS NOT NULL AND era IS NOT NULL THEN 4
          WHEN birth_year IS NOT NULL THEN 5
          ELSE 6
        END,
        RANDOM()
      LIMIT 200
    `);
    
    stats.total = artists.rows.length;
    console.log(`🎯 이번 세션 목표: ${stats.total}명 분류\n`);
    
    // 진행 상황 표시를 위한 구간
    const progressIntervals = [25, 50, 75, 100, 150, 200];
    let nextInterval = 0;
    
    // 각 작가 처리
    for (const artist of artists.rows) {
      stats.processed++;
      
      // 간단한 진행 표시
      if (stats.processed === progressIntervals[nextInterval]) {
        console.log(`\n📈 진행률: ${stats.processed}/${stats.total} (${Math.round(stats.processed * 100 / stats.total)}%)`);
        displayCurrentDistribution(stats);
        nextInterval++;
      }
      
      try {
        const result = await classifier.classifyArtist(artist);
        
        // 통계 업데이트
        stats.successful++;
        stats.aptDistribution[result.aptType] = (stats.aptDistribution[result.aptType] || 0) + 1;
        
        if (result.analysis.adjusted) stats.adjusted++;
        if (result.analysis.strategy.includes('gemini')) stats.apiUsed++;
        else stats.fallbackUsed++;
        
        // 작가 유형 통계
        const artistType = classifier.categorizeArtist(artist);
        stats.typeDistribution[artistType] = (stats.typeDistribution[artistType] || 0) + 1;
        
        // 데이터 품질 통계
        const quality = classifier.assessDataQuality(artist);
        stats.dataQuality[quality]++;
        
        // DB 업데이트
        await updateArtist(artist, result);
        
        // 진행 중 샘플 출력 (매 20번째)
        if (stats.processed % 20 === 0) {
          console.log(`   [${stats.processed}] ${artist.name} → ${result.aptType} (${result.confidence}%)`);
        }
        
      } catch (error) {
        console.error(`   ❌ [${stats.processed}] ${artist.name}: ${error.message}`);
        stats.failed++;
      }
      
      // API 제한 (매 10개마다 짧은 대기)
      if (stats.processed % 10 === 0 && stats.processed < stats.total) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // 최종 결과
    displayFinalResults(stats);
    
    // 전체 DB 통계 업데이트
    await updateGlobalStatistics();
    
  } catch (error) {
    console.error('실행 오류:', error);
  } finally {
    await pool.end();
  }
}

function displayCurrentDistribution(stats) {
  const total = stats.successful;
  if (total === 0) return;
  
  console.log('현재 APT 분포 (상위 6개):');
  
  const sorted = Object.entries(stats.aptDistribution)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 6);
  
  sorted.forEach(([type, count]) => {
    const percentage = Math.round(count * 100 / total);
    const bar = '█'.repeat(Math.max(1, Math.round(percentage / 3)));
    console.log(`   ${type}: ${bar} ${count}명 (${percentage}%)`);
  });
}

function displayFinalResults(stats) {
  console.log('\n\n' + '='.repeat(60));
  console.log('📊 종합 분류 최종 결과');
  console.log('='.repeat(60));
  
  console.log(`\n📋 처리 통계:`);
  console.log(`   총 처리: ${stats.processed}명`);
  console.log(`   성공: ${stats.successful}명`);
  console.log(`   실패: ${stats.failed}명`);
  console.log(`   API 사용: ${stats.apiUsed}회`);
  console.log(`   추론 사용: ${stats.fallbackUsed}회`);
  console.log(`   SRMC 조정: ${stats.adjusted}회`);
  
  console.log(`\n📊 데이터 품질:`);
  console.log(`   풍부: ${stats.dataQuality.rich}명`);
  console.log(`   보통: ${stats.dataQuality.moderate}명`);
  console.log(`   부족: ${stats.dataQuality.poor}명`);
  
  console.log(`\n🎭 APT 분포 (전체 ${Object.keys(stats.aptDistribution).length}개 유형):`);
  
  const sortedAPT = Object.entries(stats.aptDistribution)
    .sort(([,a], [,b]) => b - a);
  
  sortedAPT.forEach(([type, count]) => {
    const percentage = Math.round(count * 100 / stats.successful);
    const bar = '█'.repeat(Math.max(1, Math.round(percentage / 2)));
    console.log(`   ${type}: ${bar} ${count}명 (${percentage}%)`);
  });
  
  // 다양성 지수 계산
  const total = stats.successful;
  const entropy = -sortedAPT.reduce((sum, [_, count]) => {
    const p = count / total;
    return sum + (p > 0 ? p * Math.log2(p) : 0);
  }, 0);
  
  const maxEntropy = Math.log2(16);
  const diversityIndex = (entropy / maxEntropy * 100).toFixed(1);
  
  console.log(`\n📈 다양성 지수: ${diversityIndex}% (목표: >70%)`);
  
  // SRMC 비율
  const srmcCount = stats.aptDistribution['SRMC'] || 0;
  const srmcPercentage = stats.successful > 0 ? 
    Math.round(srmcCount * 100 / stats.successful) : 0;
  
  console.log(`📉 SRMC 비율: ${srmcPercentage}% (목표: <15%)`);
  
  // 목표 달성 여부
  console.log(`\n🎯 목표 달성:`);
  console.log(`   다양성: ${diversityIndex > 70 ? '✅' : '❌'} ${diversityIndex}% / 70%`);
  console.log(`   SRMC 억제: ${srmcPercentage < 15 ? '✅' : '❌'} ${srmcPercentage}% / 15%`);
  console.log(`   유형 다양성: ${Object.keys(stats.aptDistribution).length >= 12 ? '✅' : '❌'} ${Object.keys(stats.aptDistribution).length}개 / 12개`);
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

async function updateGlobalStatistics() {
  console.log('\n📊 전체 데이터베이스 통계 업데이트...');
  
  const globalStats = await pool.query(`
    SELECT 
      apt_profile->'primary_types'->0->>'type' as apt_type,
      COUNT(*) as count
    FROM artists
    WHERE apt_profile IS NOT NULL
    GROUP BY apt_profile->'primary_types'->0->>'type'
    ORDER BY count DESC
  `);
  
  console.log('\n🌍 전체 DB APT 분포:');
  const total = globalStats.rows.reduce((sum, row) => sum + parseInt(row.count), 0);
  
  globalStats.rows.slice(0, 10).forEach(row => {
    const percentage = Math.round(row.count * 100 / total);
    console.log(`   ${row.apt_type}: ${row.count}명 (${percentage}%)`);
  });
  
  const srmcRow = globalStats.rows.find(r => r.apt_type === 'SRMC');
  const srmcPercentage = srmcRow ? Math.round(srmcRow.count * 100 / total) : 0;
  
  console.log(`\n🎯 전체 SRMC 비율: ${srmcPercentage}%`);
}

// 실행
runComprehensiveClassification().catch(console.error);