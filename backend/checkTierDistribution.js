// 티어별 APT 분포 확인
require('dotenv').config();
const { pool } = require('./src/config/database');

async function checkTierDistribution() {
  try {
    console.log('🎯 티어별 APT 분포 분석');
    console.log('='.repeat(80));

    // 티어 정의
    const tiers = [
      { name: 'Tier 1 (95-100)', min: 95, max: 100 },
      { name: 'Tier 2 (90-94)', min: 90, max: 94 },
      { name: 'Tier 3 (85-89)', min: 85, max: 89 },
      { name: 'Tier 4 (80-84)', min: 80, max: 84 },
      { name: 'Tier 5 (75-79)', min: 75, max: 79 }
    ];

    for (const tier of tiers) {
      console.log(`\n${tier.name}:`);
      console.log('-'.repeat(60));

      // 해당 티어의 APT 분포
      const result = await pool.query(`
        SELECT 
          apt_profile->>'primary_apt' as apt_type,
          COUNT(*) as count,
          STRING_AGG(name, ', ' ORDER BY importance_score DESC) as artists
        FROM artists
        WHERE importance_score >= $1 AND importance_score <= $2
          AND apt_profile IS NOT NULL
          AND apt_profile->>'primary_apt' IS NOT NULL
        GROUP BY apt_profile->>'primary_apt'
        ORDER BY count DESC
      `, [tier.min, tier.max]);

      if (result.rows.length === 0) {
        console.log('APT 프로필이 있는 작가가 없습니다.');
      } else {
        let tierTotal = 0;
        result.rows.forEach(row => {
          console.log(`${row.apt_type}: ${row.count}명`);
          console.log(`  작가: ${row.artists.substring(0, 100)}${row.artists.length > 100 ? '...' : ''}`);
          tierTotal += parseInt(row.count);
        });
        console.log(`\n티어 총계: ${tierTotal}명`);
      }

      // 해당 티어의 총 작가 수
      const totalResult = await pool.query(`
        SELECT COUNT(*) as total
        FROM artists
        WHERE importance_score >= $1 AND importance_score <= $2
      `, [tier.min, tier.max]);

      console.log(`전체 작가 수: ${totalResult.rows[0].total}명`);

      // APT 프로필이 없는 작가
      const noAptResult = await pool.query(`
        SELECT name, importance_score
        FROM artists
        WHERE importance_score >= $1 AND importance_score <= $2
          AND (apt_profile IS NULL OR apt_profile->>'primary_apt' IS NULL)
        ORDER BY importance_score DESC
        LIMIT 10
      `, [tier.min, tier.max]);

      if (noAptResult.rows.length > 0) {
        console.log('\nAPT 프로필이 없는 작가:');
        noAptResult.rows.forEach(row => {
          console.log(`  - ${row.name} (${row.importance_score})`);
        });
      }
    }

    // 전체 APT 분포
    console.log(`\n${'='.repeat(80)}`);
    console.log('전체 APT 유형 분포:');
    console.log('-'.repeat(60));

    const overallResult = await pool.query(`
      SELECT 
        apt_profile->>'primary_apt' as apt_type,
        COUNT(*) as count,
        ROUND(AVG(importance_score), 1) as avg_importance
      FROM artists
      WHERE apt_profile IS NOT NULL
        AND apt_profile->>'primary_apt' IS NOT NULL
        AND importance_score >= 75
      GROUP BY apt_profile->>'primary_apt'
      ORDER BY count DESC
    `);

    overallResult.rows.forEach(row => {
      console.log(`${row.apt_type}: ${row.count}명 (평균 중요도: ${row.avg_importance})`);
    });

    // 목표 분포와 비교
    const targetDistribution = {
      'SREF': 12, 'LAEF': 10, 'SRMC': 8, 'LRMC': 8,
      'LRUC': 7, 'LRUF': 7, 'SAUC': 6, 'SAUF': 6,
      'SAEF': 6, 'SRUC': 6, 'SRUF': 6, 'LREF': 5,
      'SAMC': 5, 'LAMC': 4, 'LAUC': 2, 'LAUF': 2
    };

    console.log(`\n${'='.repeat(80)}`);
    console.log('목표 분포와의 차이:');
    console.log('-'.repeat(60));

    const currentDistribution = {};
    overallResult.rows.forEach(row => {
      currentDistribution[row.apt_type] = parseInt(row.count);
    });

    Object.keys(targetDistribution).forEach(type => {
      const current = currentDistribution[type] || 0;
      const target = targetDistribution[type];
      const diff = current - target;
      const status = diff > 0 ? '과다' : (diff < 0 ? '부족' : '적정');
      console.log(`${type}: 현재 ${current}명 / 목표 ${target}% / 차이 ${diff > 0 ? '+' : ''}${diff} (${status})`);
    });

  } catch (error) {
    console.error('오류:', error);
  } finally {
    await pool.end();
  }
}

checkTierDistribution();
