require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  console.log('🔄 프리미엄 필드 마이그레이션 시작...\n');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    // SQL 파일 읽기
    const sqlPath = path.join(__dirname, 'migrations', 'add-premium-fields.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📋 실행할 SQL:');
    console.log(sql);
    console.log('\n🚀 실행 중...');
    
    // SQL 실행
    await pool.query(sql);
    
    // 결과 확인
    const checkResult = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('subscription_type', 'subscription_start_date', 'subscription_end_date', 'subscription_status')
    `);
    
    console.log('\n✅ 마이그레이션 완료!');
    console.log('📊 추가된 컬럼들:');
    checkResult.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type}`);
    });
    
  } catch (error) {
    console.error('\n❌ 마이그레이션 실패:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// 실행
runMigration();