// 다중 APT 분류 대규모 실행
// 기존 단일 APT를 다중 APT로 업그레이드

require('dotenv').config();
const { pool } = require('./src/config/database');
const MultiAPTClassifier = require('./src/services/multiAPTClassifier');

async function runMultiAPTClassification() {
  console.log('🚀 다중 APT 분류 시스템 대규모 실행');
  console.log('=====================================');
  console.log('주/부/제3 성향 분석으로 업그레이드\n');
  
  const classifier = new MultiAPTClassifier();
  const stats = {
    total: 0,
    processed: 0,
    successful: 0,
    failed: 0,
    singleToMulti: 0,
    diversityImproved: 0,
    processingTime: Date.now()
  };
  
  try {
    // 기존에 분류된 작가들 중 우선순위 대상 선정
    const artists = await pool.query(`
      SELECT *
      FROM artists
      WHERE apt_profile IS NOT NULL
        AND apt_profile->'primary_types'->0->>'type' IS NOT NULL
      ORDER BY 
        -- 1순위: 유명 작가
        CASE 
          WHEN name ILIKE ANY(ARRAY['%Picasso%', '%Van Gogh%', '%Monet%', 
            '%Warhol%', '%Leonardo%', '%Rembrandt%', '%Kahlo%']) THEN 1
          ELSE 2
        END,
        -- 2순위: 데이터가 풍부한 작가
        CASE 
          WHEN bio IS NOT NULL AND LENGTH(bio) > 500 THEN 1
          WHEN bio IS NOT NULL AND LENGTH(bio) > 200 THEN 2
          ELSE 3
        END,
        -- 3순위: SRMC 유형 (다양성 개선 필요)
        CASE 
          WHEN apt_profile->'primary_types'->0->>'type' = 'SRMC' THEN 1
          ELSE 2
        END,
        RANDOM()
      LIMIT 30
    `);
    
    stats.total = artists.rows.length;
    console.log(`📊 업그레이드 대상: ${stats.total}명\n`);
    
    // 배치 처리 (3명씩)
    const batchSize = 3;
    
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
            const currentAPT = artist.apt_profile.primary_types[0].type;
            const result = await classifier.classifyArtist(artist);
            
            // 다중 APT로 업데이트
            await updateToMultiAPT(artist, result);
            
            // 다양성 개선 확인
            const newPrimaryAPT = result.primaryTypes[0].type;
            const diversityImproved = currentAPT === 'SRMC' && newPrimaryAPT !== 'SRMC';
            
            return { 
              success: true, 
              artist: artist.name,
              oldAPT: currentAPT,
              newAPTs: result.primaryTypes.map(t => t.type),
              diversityImproved
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
          const { artist, oldAPT, newAPTs, diversityImproved } = batchResult.value;
          
          stats.successful++;
          stats.singleToMulti++;
          if (diversityImproved) stats.diversityImproved++;
          
          console.log(`✅ ${artist}`);
          console.log(`   기존: ${oldAPT} → 신규: ${newAPTs.join(' + ')}`);
        } else {
          stats.failed++;
          const artist = batchResult.value?.artist || 'Unknown';
          const error = batchResult.value?.error || batchResult.reason;
          console.log(`❌ ${artist}: ${error}`);
        }
      }
      
      // API 제한 대기
      if (i + batchSize < artists.rows.length) {
        console.log('\n⏸️  다음 배치 대기 (2초)...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    // 최종 통계
    displayFinalStats(stats);
    
    // 전체 APT 분포 분석
    await analyzeMultiAPTDistribution();
    
  } catch (error) {
    console.error('실행 오류:', error);
  } finally {
    await pool.end();
  }
}

async function updateToMultiAPT(artist, result) {
  // 기존 apt_profile 구조 유지하면서 확장
  const updatedProfile = {
    ...artist.apt_profile,
    primary_types: result.primaryTypes.map(apt => ({
      type: apt.type,
      title: apt.title,
      animal: apt.animal,
      name_ko: apt.name_ko,
      confidence: apt.confidence,
      weight: apt.weight,
      rank: apt.rank,
      description: apt.description
    })),
    dimensions: result.dimensions,
    detailed_scores: result.detailedScores,
    meta: {
      ...artist.apt_profile.meta,
      multi_apt_version: '1.0',
      upgrade_date: new Date().toISOString(),
      analysis_type: 'multi_apt',
      reasoning: result.analysis.reasoning
    }
  };
  
  await pool.query(
    'UPDATE artists SET apt_profile = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
    [artist.id, JSON.stringify(updatedProfile)]
  );
}

function displayFinalStats(stats) {
  const processingTime = Math.round((Date.now() - stats.processingTime) / 1000);
  
  console.log('\n\n' + '='.repeat(60));
  console.log('📊 다중 APT 업그레이드 최종 결과');
  console.log('='.repeat(60));
  
  console.log(`\n⏱️  처리 시간: ${processingTime}초`);
  console.log(`📋 처리 통계:`);
  console.log(`   총 처리: ${stats.processed}명`);
  console.log(`   성공: ${stats.successful}명`);
  console.log(`   실패: ${stats.failed}명`);
  
  console.log(`\n🔄 변환 결과:`);
  console.log(`   단일→다중 변환: ${stats.singleToMulti}명`);
  console.log(`   SRMC 다양성 개선: ${stats.diversityImproved}명`);
  
  const successRate = stats.processed > 0 ? 
    Math.round(stats.successful * 100 / stats.processed) : 0;
  const diversityRate = stats.successful > 0 ? 
    Math.round(stats.diversityImproved * 100 / stats.successful) : 0;
  
  console.log(`\n📈 성과 지표:`);
  console.log(`   성공률: ${successRate}%`);
  console.log(`   다양성 개선율: ${diversityRate}%`);
}

async function analyzeMultiAPTDistribution() {
  console.log('\n\n🎭 다중 APT 분포 분석');
  console.log('='.repeat(60));
  
  // 전체 APT 분포 (주 성향 기준)
  const primaryDistribution = await pool.query(`
    SELECT 
      apt_profile->'primary_types'->0->>'type' as primary_apt,
      COUNT(*) as count
    FROM artists
    WHERE apt_profile->'primary_types'->1 IS NOT NULL
    GROUP BY primary_apt
    ORDER BY count DESC
  `);
  
  console.log('\n📊 주 성향 분포 (다중 APT 적용 작가):');
  primaryDistribution.rows.forEach((row, idx) => {
    console.log(`${(idx + 1).toString().padStart(2)}. ${row.primary_apt}: ${row.count}명`);
  });
  
  // 성향 조합 분석
  const combinationAnalysis = await pool.query(`
    SELECT 
      apt_profile->'primary_types'->0->>'type' || ' + ' ||
      apt_profile->'primary_types'->1->>'type' || ' + ' ||
      COALESCE(apt_profile->'primary_types'->2->>'type', '') as combination,
      COUNT(*) as count
    FROM artists
    WHERE apt_profile->'primary_types'->1 IS NOT NULL
    GROUP BY combination
    ORDER BY count DESC
    LIMIT 10
  `);
  
  console.log('\n🎨 인기 성향 조합 TOP 10:');
  combinationAnalysis.rows.forEach((row, idx) => {
    const combo = row.combination.replace(' + ', '').trim();
    console.log(`${(idx + 1).toString().padStart(2)}. ${combo}: ${row.count}명`);
  });
  
  // APT 다양성 지수
  const uniqueAPTs = await pool.query(`
    SELECT COUNT(DISTINCT jsonb_array_elements_text(
      apt_profile->'primary_types'->jsonb_path_query_array('$[*].type')
    )) as unique_count
    FROM artists
    WHERE apt_profile->'primary_types'->1 IS NOT NULL
  `);
  
  console.log(`\n📈 APT 활용도:`);
  console.log(`   다중 APT 시스템에서 활용된 고유 APT: ${uniqueAPTs.rows[0]?.unique_count || 0}/16개`);
}

// 실행
runMultiAPTClassification().catch(console.error);