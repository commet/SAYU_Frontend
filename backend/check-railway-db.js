const { Pool } = require('pg');
require('dotenv').config();

console.log('DATABASE_URL 존재 여부:', !!process.env.DATABASE_URL);
console.log('DATABASE_URL 시작 부분:', process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 30) + '...' : 'undefined');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkRailwayDB() {
  try {
    console.log('\n🔍 Railway PostgreSQL 연결 확인 중...');
    
    const result = await pool.query('SELECT NOW()');
    console.log('\n✅ DB 연결 성공!');
    console.log('현재 시간:', result.rows[0].now);
    
    // 테이블 존재 확인
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('\n📋 테이블 목록:');
    tables.rows.forEach(t => console.log(`  - ${t.table_name}`));
    
    // exhibitions 테이블 데이터 수
    try {
      const count = await pool.query('SELECT COUNT(*) FROM exhibitions');
      console.log(`\n📊 exhibitions 테이블: ${count.rows[0].count}개 데이터`);
      
      // 최근 데이터 확인
      const recent = await pool.query(`
        SELECT title_local, created_at 
        FROM exhibitions 
        ORDER BY created_at DESC 
        LIMIT 3
      `);
      
      console.log('\n최근 추가된 전시:');
      recent.rows.forEach(r => {
        console.log(`  - ${r.title_local} (${new Date(r.created_at).toLocaleString()})`);
      });
      
    } catch (err) {
      console.log('\n⚠️  exhibitions 테이블이 없거나 접근할 수 없습니다.');
    }
    
    // DB 정보
    const dbInfo = await pool.query(`
      SELECT 
        current_database() as database,
        current_user as user,
        version() as version
    `);
    
    console.log('\n🗄️  데이터베이스 정보:');
    console.log(`  DB명: ${dbInfo.rows[0].database}`);
    console.log(`  사용자: ${dbInfo.rows[0].user}`);
    console.log(`  버전: ${dbInfo.rows[0].version.split(',')[0]}`);
    
  } catch (error) {
    console.error('\n❌ DB 연결 실패:', error.message);
    
    console.log('\n💡 해결 방법:');
    console.log('1. Railway 대시보드에서 PostgreSQL 서비스 상태 확인');
    console.log('2. Railway CLI로 재시작: railway restart');
    console.log('3. .env 파일의 DATABASE_URL 확인');
    console.log('4. Railway 플랜 확인 (Free tier는 3일 후 일시정지)');
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n⚠️  연결 거부됨 - DB가 중지되었을 가능성이 높습니다.');
    }
  } finally {
    await pool.end();
  }
}

checkRailwayDB();