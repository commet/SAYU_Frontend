// APT 유형별 분포 분석

require('dotenv').config();
const { pool } = require('./src/config/database');

async function analyzeAPTDistribution() {
  try {
    // 전체 APT 분포 조회
    const result = await pool.query(`
      SELECT 
        apt_profile->'primary_types'->0->>'type' as apt_type,
        apt_profile->'primary_types'->0->>'title' as title,
        apt_profile->'primary_types'->0->>'animal' as animal,
        apt_profile->'primary_types'->0->>'name_ko' as animal_ko,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
      FROM artists
      WHERE apt_profile IS NOT NULL
        AND apt_profile->'primary_types'->0->>'type' IS NOT NULL
      GROUP BY 
        apt_profile->'primary_types'->0->>'type',
        apt_profile->'primary_types'->0->>'title',
        apt_profile->'primary_types'->0->>'animal',
        apt_profile->'primary_types'->0->>'name_ko'
      ORDER BY count DESC
    `);

    console.log('\n🎭 SAYU APT 유형별 분포 (전체 데이터베이스)');
    console.log('=' + '='.repeat(70));
    console.log('');
    
    const total = result.rows.reduce((sum, row) => sum + parseInt(row.count), 0);
    console.log(`📊 총 분류된 작가: ${total}명\n`);

    // 막대 그래프 표시
    result.rows.forEach((row, idx) => {
      const barLength = Math.round(row.percentage / 2);
      const bar = '█'.repeat(barLength);
      const spaces = ' '.repeat(35 - barLength);
      
      const typeInfo = `${(idx + 1).toString().padStart(2)}. ${row.apt_type} | ${row.title.padEnd(12)} | ${row.animal_ko}(${row.animal})`;
      const stats = `${bar}${spaces} ${row.count.toString().padStart(4)}명 (${row.percentage}%)`;
      
      console.log(typeInfo.padEnd(50) + stats);
    });

    // 통계 요약
    console.log('\n📈 통계 요약:');
    console.log('-'.repeat(70));
    
    // 가장 많은/적은 유형
    const mostCommon = result.rows[0];
    const leastCommon = result.rows[result.rows.length - 1];
    
    console.log(`   🥇 가장 많은 유형: ${mostCommon.apt_type} - ${mostCommon.title} (${mostCommon.count}명, ${mostCommon.percentage}%)`);
    console.log(`   🥉 가장 적은 유형: ${leastCommon.apt_type} - ${leastCommon.title} (${leastCommon.count}명, ${leastCommon.percentage}%)`);
    
    // 균형 지수 계산
    const idealPercentage = 100 / 16;
    const variance = result.rows.reduce((sum, row) => {
      return sum + Math.pow(row.percentage - idealPercentage, 2);
    }, 0) / 16;
    const balanceScore = Math.max(0, 100 - Math.sqrt(variance) * 10);
    
    console.log(`\n   📊 균형 지수: ${balanceScore.toFixed(1)}% (100% = 완전 균등 분포)`);
    
    // SRMC 현황
    const srmcRow = result.rows.find(r => r.apt_type === 'SRMC');
    if (srmcRow) {
      console.log(`   🦅 SRMC (체계적 교육자): ${srmcRow.count}명 (${srmcRow.percentage}%)`);
    }

    // 카테고리별 분석
    console.log('\n📂 카테고리별 분석:');
    console.log('-'.repeat(70));
    
    const categories = {
      L: { name: '개인적(Lone)', types: [], total: 0 },
      S: { name: '사회적(Social)', types: [], total: 0 },
      A: { name: '추상적(Abstract)', types: [], total: 0 },
      R: { name: '구체적(Representational)', types: [], total: 0 },
      E: { name: '감정적(Emotional)', types: [], total: 0 },
      M: { name: '의미중심(Meaning)', types: [], total: 0 },
      F: { name: '자유로운(Free)', types: [], total: 0 },
      C: { name: '체계적(Constructive)', types: [], total: 0 }
    };

    result.rows.forEach(row => {
      const type = row.apt_type;
      if (type && type.length === 4) {
        categories[type[0]].types.push(row);
        categories[type[0]].total += parseInt(row.count);
        categories[type[1]].types.push(row);
        categories[type[1]].total += parseInt(row.count);
        categories[type[2]].types.push(row);
        categories[type[2]].total += parseInt(row.count);
        categories[type[3]].types.push(row);
        categories[type[3]].total += parseInt(row.count);
      }
    });

    // L/S 축
    console.log(`\n   [L/S 축] 개인적 vs 사회적`);
    console.log(`     L (개인적): ${categories.L.total}명 (${(categories.L.total * 100 / total).toFixed(1)}%)`);
    console.log(`     S (사회적): ${categories.S.total}명 (${(categories.S.total * 100 / total).toFixed(1)}%)`);

    // A/R 축
    console.log(`\n   [A/R 축] 추상적 vs 구체적`);
    console.log(`     A (추상적): ${categories.A.total}명 (${(categories.A.total * 100 / total).toFixed(1)}%)`);
    console.log(`     R (구체적): ${categories.R.total}명 (${(categories.R.total * 100 / total).toFixed(1)}%)`);

    // E/M 축
    console.log(`\n   [E/M 축] 감정적 vs 의미중심`);
    console.log(`     E (감정적): ${categories.E.total}명 (${(categories.E.total * 100 / total).toFixed(1)}%)`);
    console.log(`     M (의미중심): ${categories.M.total}명 (${(categories.M.total * 100 / total).toFixed(1)}%)`);

    // F/C 축
    console.log(`\n   [F/C 축] 자유로운 vs 체계적`);
    console.log(`     F (자유로운): ${categories.F.total}명 (${(categories.F.total * 100 / total).toFixed(1)}%)`);
    console.log(`     C (체계적): ${categories.C.total}명 (${(categories.C.total * 100 / total).toFixed(1)}%)`);

    // 미분류 작가 통계
    console.log('\n\n📊 미분류 작가 현황:');
    console.log('-'.repeat(70));
    
    const unclassified = await pool.query(`
      SELECT COUNT(*) as count
      FROM artists
      WHERE apt_profile IS NULL 
         OR apt_profile->'primary_types'->0->>'type' IS NULL
    `);
    
    const totalArtists = await pool.query(`SELECT COUNT(*) as count FROM artists`);
    const unclassifiedCount = unclassified.rows[0].count;
    const totalCount = totalArtists.rows[0].count;
    const classificationRate = ((totalCount - unclassifiedCount) * 100 / totalCount).toFixed(1);
    
    console.log(`   전체 작가: ${totalCount}명`);
    console.log(`   분류 완료: ${total}명 (${classificationRate}%)`);
    console.log(`   미분류: ${unclassifiedCount}명 (${(100 - classificationRate).toFixed(1)}%)`);

  } catch (error) {
    console.error('오류:', error);
  } finally {
    await pool.end();
  }
}

analyzeAPTDistribution();