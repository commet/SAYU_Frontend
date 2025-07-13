require('dotenv').config();
const { Pool } = require('pg');

async function checkRailwayInfo() {
  console.log('🚂 Railway 데이터베이스 정보 확인\n');
  
  // DATABASE_URL 파싱
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ DATABASE_URL이 설정되지 않았습니다.');
    return;
  }
  
  // URL 분석
  const urlParts = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
  if (urlParts) {
    console.log('📊 연결 정보:');
    console.log(`   👤 사용자: ${urlParts[1]}`);
    console.log(`   🔑 비밀번호: ${urlParts[2].substring(0, 4)}...${urlParts[2].substring(urlParts[2].length - 4)}`);
    console.log(`   🌐 호스트: ${urlParts[3]}`);
    console.log(`   🔌 포트: ${urlParts[4]}`);
    console.log(`   💾 데이터베이스: ${urlParts[5]}`);
  }
  
  const pool = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    // 연결 테스트
    console.log('\n🔗 연결 테스트 중...');
    const connectResult = await pool.query('SELECT NOW() as current_time, current_database() as db_name');
    console.log('✅ 연결 성공!');
    console.log(`   ⏰ 서버 시간: ${connectResult.rows[0].current_time}`);
    console.log(`   📁 데이터베이스: ${connectResult.rows[0].db_name}`);
    
    // 데이터베이스 크기
    const sizeResult = await pool.query(`
      SELECT pg_size_pretty(pg_database_size(current_database())) as db_size
    `);
    console.log(`   📏 DB 크기: ${sizeResult.rows[0].db_size}`);
    
    // 테이블 수
    const tableCountResult = await pool.query(`
      SELECT COUNT(*) as table_count 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    `);
    console.log(`   📋 테이블 수: ${tableCountResult.rows[0].table_count}개`);
    
    // 사용자 수
    const userCountResult = await pool.query('SELECT COUNT(*) as user_count FROM users');
    console.log(`   👥 등록된 사용자: ${userCountResult.rows[0].user_count}명`);
    
    // 최근 활동
    const recentActivity = await pool.query(`
      SELECT MAX(created_at) as last_activity 
      FROM users 
      WHERE created_at IS NOT NULL
    `);
    console.log(`   📅 최근 가입: ${recentActivity.rows[0].last_activity || '없음'}`);
    
    // Railway 프로젝트 정보 추측
    console.log('\n🚂 Railway 프로젝트 정보:');
    if (urlParts[3].includes('railway') || urlParts[3].includes('rlwy')) {
      console.log('   ✅ Railway 호스팅 데이터베이스로 보입니다.');
      console.log('   💡 프로젝트 확인 방법:');
      console.log('      1. https://railway.app/dashboard 접속');
      console.log('      2. 프로젝트 목록에서 PostgreSQL 서비스 찾기');
      console.log(`      3. 호스트명 "${urlParts[3]}"와 일치하는 프로젝트 확인`);
    }
    
  } catch (error) {
    console.error('\n❌ 오류:', error.message);
  } finally {
    await pool.end();
  }
}

checkRailwayInfo();