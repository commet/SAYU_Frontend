require('dotenv').config();
const { Pool } = require('pg');

// Test database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function testConnection() {
  try {
    console.log('🔍 환경 변수 확인:');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ 설정됨' : '❌ 없음');
    console.log('REPLICATE_API_TOKEN:', process.env.REPLICATE_API_TOKEN ? '✅ 설정됨' : '❌ 없음');
    console.log('\n🔍 DATABASE_URL 내용:');
    console.log(process.env.DATABASE_URL);
    
    console.log('\n🔄 데이터베이스 연결 테스트...');
    const result = await pool.query('SELECT NOW()');
    console.log('✅ 데이터베이스 연결 성공!');
    
    // Check if tables exist
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('art_profiles', 'art_profile_likes', 'users')
    `);
    
    console.log('\n📊 확인된 테이블:');
    if (tables.rows.length === 0) {
      console.log('  (테이블이 없습니다)');
    } else {
      tables.rows.forEach(row => {
        console.log('  - ' + row.table_name);
      });
    }
    
    // 모든 테이블 확인
    const allTables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('\n📊 전체 테이블 목록:');
    allTables.rows.forEach(row => {
      console.log('  - ' + row.table_name);
    });
    
  } catch (error) {
    console.error('❌ 오류:', error.message);
  } finally {
    await pool.end();
  }
}

testConnection();