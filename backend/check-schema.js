require('dotenv').config();
const { Pool } = require('pg');
const { createClient } = require('@supabase/supabase-js');

console.log('=== 테이블 구조 비교 ===');

// Railway 설정
const railwayPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Supabase 설정
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function compareSchemas() {
  try {
    console.log('\n1. users 테이블 구조 비교...');

    // Railway users 테이블 구조
    console.log('   Railway users 컬럼:');
    const railwayColumns = await railwayPool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND table_schema = 'public'
      ORDER BY ordinal_position
    `);

    railwayColumns.rows.forEach(col => {
      console.log(`     - ${col.column_name} (${col.data_type})`);
    });

    // Supabase users 테이블 구조 (RPC로 확인)
    console.log('\n   Supabase users 컬럼 확인...');

    // 실제 데이터 샘플로 컬럼 확인
    const { data: sampleUser } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (sampleUser && sampleUser.length > 0) {
      console.log('   Supabase users 컬럼:');
      Object.keys(sampleUser[0]).forEach(key => {
        console.log(`     - ${key}`);
      });
    }

    console.log('\n2. 현재 백엔드 코드가 사용하는 데이터베이스 확인...');

    // 현재 서버가 실제로 사용하는 DB 확인
    const testQuery = await railwayPool.query('SELECT current_database(), current_user');
    console.log('   현재 연결된 DB:', testQuery.rows[0].current_database);
    console.log('   현재 사용자:', testQuery.rows[0].current_user);

    // 환경 변수 확인
    console.log('\n3. 환경 변수 설정 확인...');
    console.log('   MIGRATE_TO_SUPABASE:', process.env.MIGRATE_TO_SUPABASE);
    console.log('   ENABLE_SUPABASE:', process.env.ENABLE_SUPABASE);
    console.log('   SUPABASE_SERVICES:', process.env.SUPABASE_SERVICES);

  } catch (error) {
    console.log('❌ 스키마 비교 실패:', error.message);
  } finally {
    await railwayPool.end();
    process.exit(0);
  }
}

compareSchemas();
