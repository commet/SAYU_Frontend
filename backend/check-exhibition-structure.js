const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkExhibitionData() {
  try {
    // 테이블 확인
    console.log('🔍 테이블 구조 확인 중...\n');
    
    // exhibitions 테이블이 있는지 확인
    const exhibitionTable = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'exhibitions'
      )
    `);
    
    if (!exhibitionTable.rows[0].exists) {
      console.log('❌ exhibitions 테이블이 존재하지 않습니다.');
      
      // 대신 다른 관련 테이블 찾기
      const allTables = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND (table_name LIKE '%exhibit%' OR table_name LIKE '%event%' OR table_name LIKE '%show%')
      `);
      
      console.log('\n관련 테이블:', allTables.rows.map(r => r.table_name));
    } else {
      // exhibitions 테이블 구조 확인
      const columns = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'exhibitions'
        ORDER BY ordinal_position
      `);
      
      console.log('exhibitions 테이블 컬럼:');
      columns.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type}`);
      });
      
      // 샘플 데이터 확인
      const sampleData = await pool.query(`
        SELECT * FROM exhibitions LIMIT 3
      `);
      
      console.log('\n샘플 데이터:');
      console.log(sampleData.rows);
    }
    
    // venues 테이블 확인
    const venueTable = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'venues'
      )
    `);
    
    if (venueTable.rows[0].exists) {
      const venueCount = await pool.query(`SELECT COUNT(*) FROM venues`);
      console.log(`\n✅ venues 테이블 존재: ${venueCount.rows[0].count}개 장소`);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkExhibitionData();