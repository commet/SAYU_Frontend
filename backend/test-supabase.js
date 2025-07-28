require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

console.log('=== Supabase 연결 진단 시작 ===');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

console.log('1. 환경 변수 검증...');
console.log('   SUPABASE_URL:', supabaseUrl ? 'EXISTS' : 'MISSING');
console.log('   SERVICE_KEY:', supabaseServiceKey ? 'EXISTS' : 'MISSING');

if (!supabaseUrl || !supabaseServiceKey) {
  console.log('❌ Supabase 환경 변수 누락');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

(async () => {
  try {
    console.log('\n2. 기본 연결 테스트...');
    const { data, error } = await supabase.from('users').select('id').limit(1);

    if (error) {
      console.log('   ❌ 연결 실패:', error.message);
      console.log('   오류 코드:', error.code);

      // 테이블이 없는 경우
      if (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('does not exist')) {
        console.log('   → users 테이블이 존재하지 않음');

        console.log('\n3. 스키마 정보 확인...');
        const { data: tables, error: schemaError } = await supabase.rpc('get_schema_info');
        if (schemaError) {
          console.log('   스키마 정보 조회 실패:', schemaError.message);
        }
      }
      return;
    }

    console.log('   ✅ Supabase 연결 성공');

    // 사용자 수 확인
    const { count } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    console.log('   사용자 수:', count);

    console.log('\n3. 핵심 테이블 확인...');
    const tables = ['apt_profiles', 'quiz_sessions', 'art_profiles'];
    for (const table of tables) {
      try {
        const { count } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        console.log('   ✅', `${table}:`, count, '행');
      } catch (e) {
        console.log('   ❌', `${table}:`, e.message);
      }
    }

  } catch (error) {
    console.log('❌ 전체 진단 실패:', error.message);
  } finally {
    process.exit(0);
  }
})();
