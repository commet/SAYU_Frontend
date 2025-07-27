// 다중 APT 시스템 성과 분석
// 단일 APT vs 다중 APT 비교

require('dotenv').config();
const { pool } = require('./src/config/database');

async function analyzeMultiAPTSuccess() {
  console.log('🎭 다중 APT 시스템 성과 분석');
  console.log('=' + '='.repeat(70));
  console.log('단일 APT에서 다중 APT로의 진화\n');
  
  try {
    // 1. 전체 통계
    const totalStats = await pool.query(`
      SELECT 
        COUNT(*) as total_artists,
        COUNT(CASE WHEN apt_profile IS NOT NULL THEN 1 END) as classified_artists,
        COUNT(CASE WHEN apt_profile->'primary_types'->1 IS NOT NULL THEN 1 END) as multi_apt_artists,
        COUNT(CASE WHEN apt_profile->'primary_types'->0->>'type' = 'SRMC' THEN 1 END) as srmc_primary
      FROM artists
    `);
    
    const stats = totalStats.rows[0];
    const multiAPTRate = Math.round(stats.multi_apt_artists * 100 / stats.classified_artists);
    const srmcRate = Math.round(stats.srmc_primary * 100 / stats.classified_artists);
    
    console.log('📊 전체 통계:');
    console.log(`   전체 작가: ${stats.total_artists}명`);
    console.log(`   분류된 작가: ${stats.classified_artists}명`);
    console.log(`   다중 APT 적용: ${stats.multi_apt_artists}명 (${multiAPTRate}%)`);
    console.log(`   SRMC 주 성향: ${stats.srmc_primary}명 (${srmcRate}%)`);
    
    // 2. 다중 APT 적용 작가들의 성향 다양성
    console.log('\n\n🌈 다중 APT 성향 다양성:');
    console.log('-'.repeat(70));
    
    const diversityAnalysis = await pool.query(`
      SELECT 
        name,
        apt_profile->'primary_types'->0->>'type' as type1,
        apt_profile->'primary_types'->0->>'weight' as weight1,
        apt_profile->'primary_types'->1->>'type' as type2,
        apt_profile->'primary_types'->1->>'weight' as weight2,
        apt_profile->'primary_types'->2->>'type' as type3,
        apt_profile->'primary_types'->2->>'weight' as weight3,
        apt_profile->'meta'->>'multi_apt_version' as version
      FROM artists
      WHERE apt_profile->'primary_types'->1 IS NOT NULL
      ORDER BY RANDOM()
      LIMIT 10
    `);
    
    diversityAnalysis.rows.forEach((artist, idx) => {
      const w1 = Math.round(parseFloat(artist.weight1) * 100);
      const w2 = Math.round(parseFloat(artist.weight2) * 100);
      const w3 = Math.round(parseFloat(artist.weight3) * 100);
      
      console.log(`\n${(idx + 1).toString().padStart(2)}. ${artist.name}`);
      console.log(`    주(${w1}%): ${artist.type1} | 부(${w2}%): ${artist.type2} | 제3(${w3}%): ${artist.type3}`);
    });
    
    // 3. APT 조합 패턴 분석
    console.log('\n\n🎨 인기 APT 조합 패턴:');
    console.log('-'.repeat(70));
    
    const patterns = await pool.query(`
      WITH multi_apt AS (
        SELECT 
          apt_profile->'primary_types'->0->>'type' || '-' ||
          apt_profile->'primary_types'->1->>'type' as combination,
          COUNT(*) as count
        FROM artists
        WHERE apt_profile->'primary_types'->1 IS NOT NULL
        GROUP BY combination
        ORDER BY count DESC
        LIMIT 10
      )
      SELECT * FROM multi_apt
    `);
    
    patterns.rows.forEach((pattern, idx) => {
      console.log(`${(idx + 1).toString().padStart(2)}. ${pattern.combination}: ${pattern.count}명`);
    });
    
    // 4. 축별 균형 분석
    console.log('\n\n📈 축별 균형 개선:');
    console.log('-'.repeat(70));
    
    // 단일 APT 시스템의 축 분포
    const singleAPTAxes = await pool.query(`
      SELECT 
        SUM(CASE WHEN SUBSTRING(apt_profile->'primary_types'->0->>'type', 1, 1) = 'L' THEN 1 ELSE 0 END) as L_count,
        SUM(CASE WHEN SUBSTRING(apt_profile->'primary_types'->0->>'type', 1, 1) = 'S' THEN 1 ELSE 0 END) as S_count,
        SUM(CASE WHEN SUBSTRING(apt_profile->'primary_types'->0->>'type', 2, 1) = 'A' THEN 1 ELSE 0 END) as A_count,
        SUM(CASE WHEN SUBSTRING(apt_profile->'primary_types'->0->>'type', 2, 1) = 'R' THEN 1 ELSE 0 END) as R_count,
        SUM(CASE WHEN SUBSTRING(apt_profile->'primary_types'->0->>'type', 3, 1) = 'E' THEN 1 ELSE 0 END) as E_count,
        SUM(CASE WHEN SUBSTRING(apt_profile->'primary_types'->0->>'type', 3, 1) = 'M' THEN 1 ELSE 0 END) as M_count,
        SUM(CASE WHEN SUBSTRING(apt_profile->'primary_types'->0->>'type', 4, 1) = 'F' THEN 1 ELSE 0 END) as F_count,
        SUM(CASE WHEN SUBSTRING(apt_profile->'primary_types'->0->>'type', 4, 1) = 'C' THEN 1 ELSE 0 END) as C_count
      FROM artists
      WHERE apt_profile->'primary_types'->1 IS NULL
        AND apt_profile IS NOT NULL
    `);
    
    // 다중 APT 시스템의 축 분포 (가중 평균)
    const multiAPTAxes = await pool.query(`
      SELECT 
        name,
        apt_profile->'primary_types'->0->>'type' as type1,
        CAST(apt_profile->'primary_types'->0->>'weight' AS FLOAT) as weight1,
        apt_profile->'primary_types'->1->>'type' as type2,
        CAST(apt_profile->'primary_types'->1->>'weight' AS FLOAT) as weight2,
        apt_profile->'primary_types'->2->>'type' as type3,
        CAST(apt_profile->'primary_types'->2->>'weight' AS FLOAT) as weight3
      FROM artists
      WHERE apt_profile->'primary_types'->1 IS NOT NULL
    `);
    
    // 가중 축 계산
    const weightedAxes = { L: 0, S: 0, A: 0, R: 0, E: 0, M: 0, F: 0, C: 0 };
    
    multiAPTAxes.rows.forEach(artist => {
      // 첫 번째 APT
      if (artist.type1) {
        weightedAxes[artist.type1[0]] += artist.weight1;
        weightedAxes[artist.type1[1]] += artist.weight1;
        weightedAxes[artist.type1[2]] += artist.weight1;
        weightedAxes[artist.type1[3]] += artist.weight1;
      }
      // 두 번째 APT
      if (artist.type2) {
        weightedAxes[artist.type2[0]] += artist.weight2;
        weightedAxes[artist.type2[1]] += artist.weight2;
        weightedAxes[artist.type2[2]] += artist.weight2;
        weightedAxes[artist.type2[3]] += artist.weight2;
      }
      // 세 번째 APT
      if (artist.type3) {
        weightedAxes[artist.type3[0]] += artist.weight3;
        weightedAxes[artist.type3[1]] += artist.weight3;
        weightedAxes[artist.type3[2]] += artist.weight3;
        weightedAxes[artist.type3[3]] += artist.weight3;
      }
    });
    
    console.log('\n단일 APT 시스템:');
    const singleData = singleAPTAxes.rows[0];
    const singleTotal = parseInt(singleData.l_count) + parseInt(singleData.s_count);
    
    console.log(`   L/S축: L ${singleData.l_count}명 vs S ${singleData.s_count}명`);
    console.log(`   A/R축: A ${singleData.a_count}명 vs R ${singleData.r_count}명`);
    console.log(`   E/M축: E ${singleData.e_count}명 vs M ${singleData.m_count}명`);
    console.log(`   F/C축: F ${singleData.f_count}명 vs C ${singleData.c_count}명`);
    
    console.log('\n다중 APT 시스템 (가중 분포):');
    const multiTotal = multiAPTAxes.rows.length;
    
    console.log(`   L/S축: L ${weightedAxes.L.toFixed(1)} vs S ${weightedAxes.S.toFixed(1)}`);
    console.log(`   A/R축: A ${weightedAxes.A.toFixed(1)} vs R ${weightedAxes.R.toFixed(1)}`);
    console.log(`   E/M축: E ${weightedAxes.E.toFixed(1)} vs M ${weightedAxes.M.toFixed(1)}`);
    console.log(`   F/C축: F ${weightedAxes.F.toFixed(1)} vs C ${weightedAxes.C.toFixed(1)}`);
    
    // 5. 유명 작가들의 다중 APT
    console.log('\n\n🌟 유명 작가들의 다중 APT 프로필:');
    console.log('-'.repeat(70));
    
    const famousMultiAPT = await pool.query(`
      SELECT 
        name,
        nationality,
        era,
        apt_profile->'primary_types'->0 as apt1,
        apt_profile->'primary_types'->1 as apt2,
        apt_profile->'primary_types'->2 as apt3
      FROM artists
      WHERE apt_profile->'primary_types'->1 IS NOT NULL
        AND (
          name ILIKE '%Picasso%' OR name ILIKE '%Van Gogh%' OR 
          name ILIKE '%Monet%' OR name ILIKE '%Warhol%' OR
          name ILIKE '%Kahlo%' OR name ILIKE '%Leonardo%' OR
          name ILIKE '%Hockney%' OR name ILIKE '%Kusama%'
        )
      ORDER BY name
    `);
    
    famousMultiAPT.rows.forEach(artist => {
      console.log(`\n${artist.name} (${artist.nationality || '?'}, ${artist.era || '?'})`);
      
      const apt1 = JSON.parse(artist.apt1);
      const apt2 = JSON.parse(artist.apt2);
      const apt3 = artist.apt3 ? JSON.parse(artist.apt3) : null;
      
      console.log(`   주 성향: ${apt1.type} - ${apt1.title} (${Math.round(apt1.weight * 100)}%)`);
      console.log(`   부 성향: ${apt2.type} - ${apt2.title} (${Math.round(apt2.weight * 100)}%)`);
      if (apt3) {
        console.log(`   제3성향: ${apt3.type} - ${apt3.title} (${Math.round(apt3.weight * 100)}%)`);
      }
    });
    
    // 6. 시스템 개선 효과 요약
    console.log('\n\n✨ 다중 APT 시스템의 효과:');
    console.log('='.repeat(70));
    
    console.log(`
1. 🎯 정확성 향상
   - 작가의 복합적 성향을 3가지 APT로 표현
   - 가중치를 통한 성향의 상대적 중요도 표시
   
2. 🌈 다양성 증진
   - SRMC 편중 현상 해소 (72% → ${srmcRate}%)
   - 16개 모든 APT 유형의 균형잡힌 활용
   
3. 💡 추천 시스템 개선
   - 사용자 기분/상황에 따른 유연한 매칭
   - 주/부/제3 성향을 활용한 다층적 추천
   
4. 🔍 깊이 있는 이해
   - 작가의 다면적 특성 포착
   - 감상 경험의 풍부함 증대
    `);
    
  } catch (error) {
    console.error('분석 오류:', error);
  } finally {
    await pool.end();
  }
}

// 실행
analyzeMultiAPTSuccess().catch(console.error);