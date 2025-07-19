const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function deleteFakeExhibitions() {
  try {
    console.log('🗑️  가짜 전시 데이터 삭제 시작...\n');
    
    // 삭제 전 백업을 위한 카운트
    const beforeCount = await pool.query('SELECT COUNT(*) FROM exhibitions');
    console.log(`현재 전시 수: ${beforeCount.rows[0].count}개`);
    
    // 실제 API 데이터만 보존
    const deleteResult = await pool.query(`
      DELETE FROM exhibitions
      WHERE source NOT IN ('chicago_art_api', 'met_museum_verified')
      AND source NOT LIKE '%API%'
      RETURNING id, title_local, source
    `);
    
    console.log(`\n❌ ${deleteResult.rows.length}개의 가짜 데이터 삭제됨`);
    
    // 삭제 후 카운트
    const afterCount = await pool.query('SELECT COUNT(*) FROM exhibitions');
    console.log(`\n✅ 남은 실제 전시 수: ${afterCount.rows[0].count}개`);
    
    // 남은 데이터 확인
    const remaining = await pool.query(`
      SELECT source, COUNT(*) as count
      FROM exhibitions
      GROUP BY source
    `);
    
    console.log('\n📊 남은 데이터 출처:');
    remaining.rows.forEach(r => {
      console.log(`  ${r.source}: ${r.count}개`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

// 실행 전 확인
console.log('⚠️  이 작업은 되돌릴 수 없습니다!');
console.log('가짜 데이터를 삭제하려면 5초 후 시작됩니다...\n');

setTimeout(() => {
  deleteFakeExhibitions();
}, 5000);