require('dotenv').config();
const { hybridDB } = require('./src/config/hybridDatabase');

console.log('=== SAYU 하이브리드 시스템 작동 테스트 ===');

async function testHybridSystem() {
  try {
    console.log('\n1. 하이브리드 시스템 초기화...');
    await hybridDB.initialize();

    console.log('\n2. 헬스 체크...');
    const health = await hybridDB.healthCheck();
    console.log('   Railway 상태:', health.railway ? '✅ 정상' : '❌ 실패');
    console.log('   Supabase 상태:', health.supabase ? '✅ 정상' : '❌ 실패');
    console.log('   하이브리드 상태:', health.hybrid ? '✅ 정상' : '❌ 실패');

    console.log('\n3. 연결 상태 및 지연시간...');
    const status = await hybridDB.getStatus();
    console.log('   Railway 연결:', status.railway.connected ? '✅' : '❌',
                status.railway.latency ? `(${status.railway.latency}ms)` : '');
    console.log('   Supabase 연결:', status.supabase.connected ? '✅' : '❌',
                status.supabase.latency ? `(${status.supabase.latency}ms)` : '');

    console.log('\n4. 서비스 라우팅 테스트...');
    const testTables = ['users', 'gamification_points', 'exhibitions', 'institutions'];

    for (const table of testTables) {
      const { type } = hybridDB.getClientForTable(table);
      console.log(`   ${table} → ${type.toUpperCase()}`);
    }

    console.log('\n5. 마이그레이션 진행 상황...');
    const progress = await hybridDB.getMigrationProgress();

    let supabaseCount = 0;
    let railwayCount = 0;
    let hybridCount = 0;

    Object.entries(progress).forEach(([table, info]) => {
      if (info.database === 'supabase') supabaseCount++;
      else if (info.database === 'railway') railwayCount++;
      else if (info.database === 'hybrid') hybridCount++;
    });

    console.log(`   Supabase 서비스: ${supabaseCount}개`);
    console.log(`   Railway 서비스: ${railwayCount}개`);
    console.log(`   하이브리드 서비스: ${hybridCount}개`);
    console.log(`   전체 서비스: ${Object.keys(progress).length}개`);

    const migrationPercentage = Math.round((supabaseCount + hybridCount) / Object.keys(progress).length * 100);
    console.log(`   마이그레이션 진행률: ${migrationPercentage}%`);

    console.log('\n6. 실제 데이터 쿼리 테스트...');

    // Users 테이블 (Supabase)
    try {
      const usersResult = await hybridDB.query('users', 'select', { limit: 1 });
      console.log(`   ✅ users 쿼리 성공 (${usersResult.rowCount}행)`);
    } catch (error) {
      console.log(`   ❌ users 쿼리 실패: ${error.message}`);
    }

    // Gamification 테이블 (Railway)
    try {
      const gamificationResult = await hybridDB.query('gamification_points', 'select', { limit: 1 });
      console.log(`   ✅ gamification_points 쿼리 성공 (${gamificationResult.rowCount}행)`);
    } catch (error) {
      console.log(`   ❌ gamification_points 쿼리 실패: ${error.message}`);
    }

    console.log('\n=== 하이브리드 시스템 테스트 완료 ===');

  } catch (error) {
    console.log('❌ 하이브리드 시스템 테스트 실패:', error.message);
  } finally {
    process.exit(0);
  }
}

testHybridSystem();
