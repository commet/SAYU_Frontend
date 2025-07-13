require('dotenv').config();
const { hybridDB } = require('./src/config/hybridDatabase');

async function testHybridDatabase() {
  console.log('🔍 하이브리드 데이터베이스 테스트 시작...\n');

  try {
    // 1. 상태 확인
    console.log('1. 데이터베이스 연결 상태:');
    const status = await hybridDB.getStatus();
    console.log('   Railway:', status.railway.connected ? '✅ 연결됨' : '❌ 연결 안됨');
    console.log('   Supabase:', status.supabase.connected ? '✅ 연결됨' : '❌ 연결 안됨');
    
    // 2. Railway 데이터베이스 테스트
    console.log('\n2. Railway 데이터베이스 쿼리 테스트:');
    try {
      const railwayResult = await hybridDB.query(
        'SELECT COUNT(*) as count FROM users',
        []
      );
      console.log('   ✅ Railway 쿼리 성공! 사용자 수:', railwayResult.rows[0].count);
    } catch (err) {
      console.log('   ❌ Railway 쿼리 실패:', err.message);
    }
    
    // 3. Supabase 테스트 (직접 접근)
    console.log('\n3. Supabase 직접 접근 테스트:');
    try {
      const { data, error } = await hybridDB.supabase
        .from('users')
        .select('count', { count: 'exact' });
      
      if (error) {
        console.log('   ❌ Supabase 쿼리 실패:', error.message);
      } else {
        console.log('   ✅ Supabase 쿼리 성공! 테이블 존재 확인');
      }
    } catch (err) {
      console.log('   ❌ Supabase 접근 오류:', err.message);
    }
    
    // 4. 서비스 매핑 확인
    console.log('\n4. 서비스 매핑 상태:');
    console.log('   현재 매핑:', hybridDB.serviceMapping);
    console.log('   Supabase 서비스:', process.env.SUPABASE_SERVICES || '(없음)');
    
    // 5. 간단한 데이터 삽입 테스트 (Supabase)
    console.log('\n5. Supabase 데이터 삽입 테스트:');
    try {
      const testUser = {
        id: 'test-' + Date.now(),
        email: 'test@example.com',
        name: 'Test User'
      };
      
      const { data, error } = await hybridDB.supabase
        .from('users')
        .insert([testUser])
        .select();
      
      if (error) {
        console.log('   ❌ 삽입 실패:', error.message);
      } else {
        console.log('   ✅ 테스트 사용자 삽입 성공!');
        
        // 삭제
        await hybridDB.supabase
          .from('users')
          .delete()
          .eq('id', testUser.id);
        console.log('   ✅ 테스트 사용자 삭제 완료');
      }
    } catch (err) {
      console.log('   ❌ 데이터 작업 오류:', err.message);
    }
    
    console.log('\n✨ 하이브리드 데이터베이스 테스트 완료!');
    console.log('\n📌 다음 단계:');
    console.log('1. 특정 서비스를 Supabase로 마이그레이션하려면:');
    console.log('   SUPABASE_SERVICES=gamification,artProfiles');
    console.log('2. 완전히 Supabase로 전환하려면:');
    console.log('   MIGRATE_TO_SUPABASE=true');
    
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error.message);
  } finally {
    // 연결 종료
    await hybridDB.close();
    process.exit(0);
  }
}

// 테스트 실행
testHybridDatabase();