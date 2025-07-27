// APT 분류 진행 상황 확인

require('dotenv').config();
const { pool } = require('./src/config/database');

async function checkProgress() {
  try {
    // 전체 작가 수
    const totalArtists = await pool.query('SELECT COUNT(*) as count FROM artists');
    console.log(`\n📊 전체 작가 수: ${totalArtists.rows[0].count}명`);
    
    // APT 분류된 작가 수
    const classifiedArtists = await pool.query(`
      SELECT COUNT(*) as count 
      FROM artists 
      WHERE apt_profile IS NOT NULL
    `);
    console.log(`✅ APT 분류 완료: ${classifiedArtists.rows[0].count}명`);
    
    // 높은 신뢰도 (60% 이상)
    const highConfidence = await pool.query(`
      SELECT COUNT(*) as count 
      FROM artists 
      WHERE apt_profile IS NOT NULL
        AND CAST(apt_profile->'primary_types'->0->>'confidence' AS FLOAT) >= 60
    `);
    console.log(`⭐ 높은 신뢰도 (60%+): ${highConfidence.rows[0].count}명`);
    
    // 분류 방법별 통계
    const methodStats = await pool.query(`
      SELECT 
        apt_profile->'meta'->>'analysis_method' as method,
        COUNT(*) as count
      FROM artists
      WHERE apt_profile IS NOT NULL
      GROUP BY method
      ORDER BY count DESC
    `);
    
    console.log(`\n📈 분류 방법별 통계:`);
    methodStats.rows.forEach(row => {
      console.log(`   - ${row.method || 'unknown'}: ${row.count}명`);
    });
    
    // APT 유형 분포
    const aptDist = await pool.query(`
      SELECT 
        apt_profile->'primary_types'->0->>'type' as apt_type,
        COUNT(*) as count,
        ROUND(AVG(CAST(apt_profile->'primary_types'->0->>'confidence' AS FLOAT))) as avg_confidence
      FROM artists
      WHERE apt_profile IS NOT NULL
      GROUP BY apt_type
      ORDER BY count DESC
    `);
    
    console.log(`\n🎭 APT 유형 분포 (상위 10개):`);
    aptDist.rows.slice(0, 10).forEach(row => {
      console.log(`   ${row.apt_type}: ${row.count}명 (평균 신뢰도: ${row.avg_confidence}%)`);
    });
    
    // 검색 사용 통계
    const searchUsed = await pool.query(`
      SELECT COUNT(*) as count
      FROM artists
      WHERE apt_profile->'meta'->>'search_info' IS NOT NULL
    `);
    console.log(`\n🔍 검색 기능 사용: ${searchUsed.rows[0].count}명`);
    
    // 미분류 작가 샘플
    const unclassified = await pool.query(`
      SELECT name, nationality, era, birth_year
      FROM artists
      WHERE apt_profile IS NULL
         OR CAST(apt_profile->'primary_types'->0->>'confidence' AS FLOAT) < 60
      LIMIT 5
    `);
    
    console.log(`\n📝 미분류 작가 예시:`);
    unclassified.rows.forEach(artist => {
      console.log(`   - ${artist.name} (${artist.nationality || '?'}, ${artist.era || '?'})`);
    });
    
    const remainingCount = await pool.query(`
      SELECT COUNT(*) as count
      FROM artists
      WHERE apt_profile IS NULL
         OR CAST(apt_profile->'primary_types'->0->>'confidence' AS FLOAT) < 60
    `);
    console.log(`\n🎯 남은 작가: ${remainingCount.rows[0].count}명`);
    
  } catch (error) {
    console.error('오류:', error);
  } finally {
    await pool.end();
  }
}

checkProgress();