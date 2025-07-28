const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkArtists() {
  try {
    // 전체 아티스트 수
    const totalResult = await pool.query('SELECT COUNT(*) FROM artists');
    console.log(`\n📊 전체 아티스트 수: ${totalResult.rows[0].count}명`);

    // APT 프로필이 있는 아티스트
    const aptResult = await pool.query(`
      SELECT COUNT(*) FROM artists 
      WHERE apt_primary_type IS NOT NULL
    `);
    console.log(`🎯 APT 프로필 보유: ${aptResult.rows[0].count}명`);

    // 데이터 소스별 통계
    const sourceResult = await pool.query(`
      SELECT 
        CASE 
          WHEN wikipedia_data IS NOT NULL THEN 'Wikipedia'
          WHEN external_data IS NOT NULL THEN 'External'
          ELSE 'Manual'
        END as data_source,
        COUNT(*) as count
      FROM artists
      GROUP BY data_source
      ORDER BY count DESC
    `);
    console.log(`\n📚 데이터 소스별 분포:`);
    sourceResult.rows.forEach(row => {
      console.log(`  ${row.data_source}: ${row.count}명`);
    });

    // 최근 추가된 아티스트
    const recentResult = await pool.query(`
      SELECT name, apt_primary_type, created_at 
      FROM artists 
      WHERE created_at > NOW() - INTERVAL '7 days'
      ORDER BY created_at DESC
      LIMIT 10
    `);
    console.log(`\n📅 최근 7일간 추가된 아티스트:`);
    if (recentResult.rows.length === 0) {
      console.log('  (최근 추가된 아티스트 없음)');
    } else {
      recentResult.rows.forEach(row => {
        console.log(`  - ${row.name}: ${row.apt_primary_type || 'APT 미설정'} (${row.created_at.toLocaleDateString()})`);
      });
    }

    // APT 타입 분포
    const distributionResult = await pool.query(`
      SELECT apt_primary_type, COUNT(*) as count
      FROM artists 
      WHERE apt_primary_type IS NOT NULL
      GROUP BY apt_primary_type
      ORDER BY count DESC
    `);
    console.log(`\n📈 APT 타입 분포:`);
    if (distributionResult.rows.length === 0) {
      console.log('  (APT 설정된 아티스트 없음)');
    } else {
      distributionResult.rows.forEach(row => {
        console.log(`  ${row.apt_primary_type}: ${row.count}명`);
      });
    }

    // importance_score가 있는 아티스트
    const importanceResult = await pool.query(`
      SELECT COUNT(*) FROM artists 
      WHERE importance_score IS NOT NULL
    `);
    console.log(`\n⭐ 중요도 점수 보유: ${importanceResult.rows[0].count}명`);

    // 상위 중요 아티스트
    const topArtistsResult = await pool.query(`
      SELECT name, importance_score, apt_primary_type
      FROM artists 
      WHERE importance_score IS NOT NULL
      ORDER BY importance_score DESC
      LIMIT 10
    `);
    console.log(`\n🏆 상위 10명 중요 아티스트:`);
    topArtistsResult.rows.forEach((row, idx) => {
      console.log(`  ${idx + 1}. ${row.name} (점수: ${row.importance_score}, APT: ${row.apt_primary_type || '미설정'})`);
    });

  } catch (error) {
    console.error('❌ DB 조회 오류:', error.message);
  } finally {
    await pool.end();
  }
}

checkArtists();
