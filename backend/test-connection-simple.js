require('dotenv').config();

console.log('🔍 연결 테스트 시작...\n');

// 1. 환경 변수 확인
console.log('1. 환경 변수 확인:');
console.log('   DATABASE_URL:', process.env.DATABASE_URL ? '✅ 설정됨' : '❌ 없음');
console.log('   SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ 설정됨' : '❌ 없음');
console.log('   ENABLE_SUPABASE:', process.env.ENABLE_SUPABASE);

// 2. Railway 데이터베이스 직접 연결 테스트
console.log('\n2. Railway 데이터베이스 테스트:');
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function testRailway() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('   ✅ Railway 연결 성공!', result.rows[0].now);
  } catch (err) {
    console.log('   ❌ Railway 연결 실패:', err.message);
  }
}

// 3. Supabase 직접 연결 테스트
console.log('\n3. Supabase 테스트:');
const { createClient } = require('@supabase/supabase-js');

async function testSupabase() {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );
    
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error) {
      console.log('   ❌ Supabase 쿼리 오류:', error.message);
    } else {
      console.log('   ✅ Supabase 연결 성공!');
    }
  } catch (err) {
    console.log('   ❌ Supabase 연결 실패:', err.message);
  }
}

// 4. HybridDB 로드 테스트
console.log('\n4. HybridDB 로드 테스트:');
try {
  const { hybridDB } = require('./src/config/hybridDatabase');
  console.log('   ✅ HybridDB 모듈 로드 성공');
  console.log('   - railway 속성:', !!hybridDB.railway);
  console.log('   - supabase 속성:', !!hybridDB.supabase);
  console.log('   - getStatus 메서드:', typeof hybridDB.getStatus);
} catch (err) {
  console.log('   ❌ HybridDB 로드 실패:', err.message);
}

// 테스트 실행
async function runTests() {
  await testRailway();
  await testSupabase();
  await pool.end();
  console.log('\n✨ 테스트 완료!');
}

runTests();