const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkColumns() {
  try {
    // artists 테이블의 모든 컬럼 확인
    const columnsResult = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'artists'
      ORDER BY ordinal_position
    `);
    
    console.log('Artists 테이블 구조:');
    columnsResult.rows.forEach(row => {
      console.log(`  - ${row.column_name} (${row.data_type})`);
    });
    
    // APT 관련 컬럼 찾기
    const aptColumns = columnsResult.rows.filter(row => 
      row.column_name.toLowerCase().includes('apt') || 
      row.column_name.toLowerCase().includes('type') ||
      row.column_name.toLowerCase().includes('personality')
    );
    
    console.log('\nAPT/Type 관련 컬럼:');
    aptColumns.forEach(row => {
      console.log(`  - ${row.column_name} (${row.data_type})`);
    });
    
    // 전체 아티스트 수
    const totalResult = await pool.query('SELECT COUNT(*) FROM artists');
    console.log(`\n전체 아티스트 수: ${totalResult.rows[0].count}명`);
    
    // 샘플 데이터 확인
    const sampleResult = await pool.query(`
      SELECT name, created_at 
      FROM artists 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    console.log('\n최근 추가된 아티스트 샘플:');
    sampleResult.rows.forEach(row => {
      console.log(`  - ${row.name} (${row.created_at.toLocaleDateString()})`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkColumns();