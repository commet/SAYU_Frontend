require('dotenv').config();
const { Pool } = require('pg');

async function checkTables() {
  console.log('🔍 Railway 데이터베이스 테이블 확인...\n');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    // 모든 테이블 조회
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    
    console.log('📋 현재 데이터베이스 테이블:');
    tablesResult.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    
    // users 테이블 컬럼 확인
    const usersColumns = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `);
    
    if (usersColumns.rows.length > 0) {
      console.log('\n📊 users 테이블 구조:');
      usersColumns.rows.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type}`);
      });
    }
    
    // profiles 또는 유사한 테이블 찾기
    const profileTables = tablesResult.rows.filter(row => 
      row.table_name.includes('profile') || 
      row.table_name.includes('user')
    );
    
    if (profileTables.length > 0) {
      console.log('\n🔎 프로필 관련 테이블:');
      profileTables.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
    }
    
  } catch (error) {
    console.error('❌ 오류:', error.message);
  } finally {
    await pool.end();
  }
}

checkTables();