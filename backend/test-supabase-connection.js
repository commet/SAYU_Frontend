require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function testConnection() {
  console.log('🔍 Supabase 연결 테스트 시작...\n');
  
  // 환경 변수 확인
  console.log('1. 환경 변수 확인:');
  console.log('   SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ 설정됨' : '❌ 없음');
  console.log('   SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '✅ 설정됨' : '❌ 없음');
  console.log('   SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? '✅ 설정됨' : '❌ 없음');
  
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.error('\n❌ 필수 환경 변수가 설정되지 않았습니다!');
    console.log('\n📝 .env 파일에 다음 내용을 추가하세요:');
    console.log('SUPABASE_URL=https://your-project-ref.supabase.co');
    console.log('SUPABASE_ANON_KEY=your-anon-key-here');
    console.log('SUPABASE_SERVICE_KEY=your-service-key-here\n');
    process.exit(1);
  }
  
  // Supabase 클라이언트 생성
  console.log('\n2. Supabase 클라이언트 생성 중...');
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );
  
  // 연결 테스트
  console.log('\n3. 데이터베이스 연결 테스트:');
  try {
    const { data, error } = await supabase
      .from('_test_connection')
      .select('*')
      .limit(1);
    
    if (error && error.code !== 'PGRST116') {
      console.error('   ❌ 연결 실패:', error.message);
    } else {
      console.log('   ✅ Supabase 연결 성공!');
    }
  } catch (err) {
    console.error('   ❌ 연결 오류:', err.message);
  }
  
  // 서비스 키 테스트 (옵션)
  if (process.env.SUPABASE_SERVICE_KEY) {
    console.log('\n4. 서비스 키 테스트:');
    const adminClient = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );
    
    try {
      const { data, error } = await adminClient.auth.admin.listUsers();
      if (error) {
        console.error('   ❌ 서비스 키 인증 실패:', error.message);
      } else {
        console.log('   ✅ 서비스 키 인증 성공!');
        console.log('   현재 사용자 수:', data.users.length);
      }
    } catch (err) {
      console.error('   ❌ 서비스 키 오류:', err.message);
    }
  }
  
  // 하이브리드 설정 확인
  console.log('\n5. 하이브리드 데이터베이스 설정:');
  console.log('   ENABLE_SUPABASE:', process.env.ENABLE_SUPABASE || 'false');
  console.log('   MIGRATE_TO_SUPABASE:', process.env.MIGRATE_TO_SUPABASE || 'false');
  console.log('   SUPABASE_SERVICES:', process.env.SUPABASE_SERVICES || '(없음)');
  
  // Railway 데이터베이스 확인
  console.log('\n6. Railway 데이터베이스 상태:');
  if (process.env.DATABASE_URL) {
    console.log('   ✅ DATABASE_URL 설정됨');
    
    // 하이브리드 DB 테스트
    try {
      const { hybridDB } = require('./src/config/hybridDatabase');
      const status = await hybridDB.getStatus();
      
      console.log('\n7. 하이브리드 데이터베이스 상태:');
      console.log('   Railway:', status.railway.connected ? '✅ 연결됨' : '❌ 연결 안됨');
      console.log('   Supabase:', status.supabase.connected ? '✅ 연결됨' : '❌ 연결 안됨');
    } catch (err) {
      console.log('   ⚠️  하이브리드 DB 테스트 스킵 (서버 실행 중이 아님)');
    }
  } else {
    console.log('   ❌ DATABASE_URL 설정 안됨');
  }
  
  console.log('\n✨ 테스트 완료!\n');
  
  // 다음 단계 안내
  if (process.env.ENABLE_SUPABASE !== 'true') {
    console.log('📌 다음 단계:');
    console.log('1. Supabase 대시보드에서 SQL Editor로 스키마 마이그레이션 실행');
    console.log('2. .env 파일에서 ENABLE_SUPABASE=true 설정');
    console.log('3. 서버 재시작 후 하이브리드 모드 테스트\n');
  }
}

// 테스트 실행
testConnection().catch(console.error);