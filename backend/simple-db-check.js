const { pool } = require('./src/config/database');

async function simpleCheck() {
  try {
    console.log('🔍 데이터베이스 연결 확인...');

    // 테이블 목록
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log('📋 현재 테이블들:');
    result.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });

    // pgvector 확장 확인
    const extResult = await pool.query(`
      SELECT extname, extversion 
      FROM pg_extension 
      WHERE extname = 'vector'
    `);

    console.log('\n🧩 pgvector 상태:');
    if (extResult.rows.length > 0) {
      console.log(`   ✅ 설치됨 (v${extResult.rows[0].extversion})`);
    } else {
      console.log('   ❌ 미설치');
    }

  } catch (error) {
    console.error('❌ 오류:', error.message);
  } finally {
    await pool.end();
  }
}

simpleCheck();
