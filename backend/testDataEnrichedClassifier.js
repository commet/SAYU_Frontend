// 데이터 보강 분류기 테스트 - 다양한 작가 유형으로 테스트

require('dotenv').config();

const DataEnrichedClassifier = require('./src/services/dataEnrichedClassifier');
const { pool } = require('./src/config/database');

async function testDataEnrichedClassifier() {
  console.log('🧪 데이터 보강 분류기 테스트');
  console.log('=====================================');
  console.log('외부 데이터 소스 참조 및 지능적 추론 테스트\n');
  
  const classifier = new DataEnrichedClassifier();
  const stats = {
    total: 0,
    processed: 0,
    successful: 0,
    failed: 0,
    aptDistribution: {},
    typeDistribution: {
      ancient_greek: { count: 0, apts: {} },
      renaissance: { count: 0, apts: {} },
      baroque: { count: 0, apts: {} },
      impressionist: { count: 0, apts: {} },
      modern: { count: 0, apts: {} },
      attribution: { count: 0, apts: {} },
      unknown: { count: 0, apts: {} }
    }
  };
  
  try {
    // 다양한 유형의 작가들 선택
    const testArtists = await pool.query(`
      WITH categorized_artists AS (
        SELECT *,
          CASE 
            WHEN name LIKE '%Greek%' OR name LIKE '%Athens%' THEN 'ancient_greek'
            WHEN name LIKE '%Attributed%' OR name LIKE '%Workshop%' THEN 'attribution'
            WHEN era LIKE '%Renaissance%' THEN 'renaissance'
            WHEN era LIKE '%Baroque%' THEN 'baroque'
            WHEN era LIKE '%Impressionis%' THEN 'impressionist'
            WHEN birth_year > 1900 THEN 'modern'
            ELSE 'other'
          END as category
        FROM artists
        WHERE apt_profile IS NULL OR apt_profile->'primary_types'->0->>'type' = 'SRMC'
      )
      (SELECT * FROM categorized_artists WHERE category = 'ancient_greek' ORDER BY name LIMIT 5)
      UNION ALL
      (SELECT * FROM categorized_artists WHERE category = 'attribution' ORDER BY name LIMIT 5)
      UNION ALL
      (SELECT * FROM categorized_artists WHERE category = 'renaissance' ORDER BY name LIMIT 5)
      UNION ALL
      (SELECT * FROM categorized_artists WHERE category = 'baroque' ORDER BY name LIMIT 5)
      UNION ALL
      (SELECT * FROM categorized_artists WHERE category = 'impressionist' ORDER BY name LIMIT 5)
      UNION ALL
      (SELECT * FROM categorized_artists WHERE category = 'modern' ORDER BY name LIMIT 5)
      UNION ALL
      (SELECT * FROM categorized_artists WHERE category = 'other' AND bio IS NOT NULL ORDER BY name LIMIT 5)
      ORDER BY category, name
    `);
    
    stats.total = testArtists.rows.length;
    console.log(`📊 테스트 대상: ${stats.total}명의 다양한 유형 작가\n`);
    
    // 각 작가 처리
    for (const artist of testArtists.rows) {
      stats.processed++;
      
      console.log(`\n${'='.repeat(60)}`);
      console.log(`[${stats.processed}/${stats.total}] ${artist.name}`);
      console.log(`카테고리: ${artist.category} | 국적: ${artist.nationality || '불명'} | 시대: ${artist.era || '불명'}`);
      console.log(`생몰: ${artist.birth_year || '?'} - ${artist.death_year || '?'}`);
      console.log(`Bio: ${artist.bio ? artist.bio.length + '자' : '없음'}`);
      
      try {
        const result = await classifier.classifyArtist(artist);
        
        console.log(`✅ APT: ${result.aptType} (신뢰도: ${result.confidence}%)`);
        console.log(`   축: L/S=${result.axisScores.L_S}, A/R=${result.axisScores.A_R}, E/M=${result.axisScores.E_M}, F/C=${result.axisScores.F_C}`);
        console.log(`   전략: ${result.analysis.strategy}`);
        console.log(`   근거: ${result.analysis.reasoning?.substring(0, 150)}...`);
        
        stats.successful++;
        stats.aptDistribution[result.aptType] = (stats.aptDistribution[result.aptType] || 0) + 1;
        
        // 유형별 APT 분포 기록
        const artistType = classifier.categorizeArtist(artist);
        if (stats.typeDistribution[artistType]) {
          stats.typeDistribution[artistType].count++;
          stats.typeDistribution[artistType].apts[result.aptType] = 
            (stats.typeDistribution[artistType].apts[result.aptType] || 0) + 1;
        }
        
        // DB 업데이트
        await updateArtist(artist, result);
        
      } catch (error) {
        console.error(`❌ 오류: ${error.message}`);
        stats.failed++;
      }
      
      // API 제한
      if (stats.processed % 5 === 0 && stats.processed < stats.total) {
        console.log('\n⏸️  API 제한 대기 (2초)...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    // 결과 요약
    console.log('\n\n' + '='.repeat(60));
    console.log('📊 데이터 보강 분류기 테스트 결과');
    console.log('='.repeat(60));
    console.log(`총 처리: ${stats.processed}명`);
    console.log(`성공: ${stats.successful}명`);
    console.log(`실패: ${stats.failed}명`);
    
    if (stats.successful > 0) {
      console.log('\n🎭 전체 APT 분포:');
      const sortedDist = Object.entries(stats.aptDistribution)
        .sort(([,a], [,b]) => b - a);
      
      sortedDist.forEach(([type, count]) => {
        const percentage = Math.round(count * 100 / stats.successful);
        console.log(`   ${type}: ${count}명 (${percentage}%)`);
      });
      
      console.log('\n📚 유형별 APT 분포:');
      for (const [type, data] of Object.entries(stats.typeDistribution)) {
        if (data.count > 0) {
          console.log(`\n   ${type} (${data.count}명):`);
          const sortedApts = Object.entries(data.apts)
            .sort(([,a], [,b]) => b - a);
          sortedApts.forEach(([apt, count]) => {
            const percentage = Math.round(count * 100 / data.count);
            console.log(`      ${apt}: ${count}명 (${percentage}%)`);
          });
        }
      }
    }
    
    // SRMC 변화 확인
    const srmcBefore = await pool.query(`
      SELECT COUNT(*) as count
      FROM artists
      WHERE apt_profile->'primary_types'->0->>'type' = 'SRMC'
    `);
    
    console.log(`\n📉 SRMC 분포:`);
    console.log(`   전체 SRMC: ${srmcBefore.rows[0].count}명`);
    
    const srmcInTest = stats.aptDistribution['SRMC'] || 0;
    const srmcPercentage = stats.successful > 0 ? 
      Math.round(srmcInTest * 100 / stats.successful) : 0;
    console.log(`   테스트 샘플 중 SRMC: ${srmcInTest}명 (${srmcPercentage}%)`);
    
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
      reasoning: result.analysis.reasoning
    }
  };
  
  await pool.query(
    'UPDATE artists SET apt_profile = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
    [artist.id, JSON.stringify(aptProfile)]
  );
}

// 실행
testDataEnrichedClassifier().catch(console.error);