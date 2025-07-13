require('dotenv').config();
const { Pool } = require('pg');

async function findRailwayProject() {
  console.log('🔍 Railway 프로젝트 찾기 도우미\n');
  
  const dbUrl = process.env.DATABASE_URL;
  const urlParts = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
  
  console.log('📌 이 정보로 Railway 대시보드에서 찾으세요:\n');
  
  console.log('1️⃣ Connection String에서 확인할 내용:');
  console.log(`   🌐 호스트: ${urlParts[3]}`);
  console.log(`   🔌 포트: ${urlParts[4]}`);
  console.log(`   💾 DB 이름: ${urlParts[5]}`);
  
  console.log('\n2️⃣ 비밀번호 일부 (처음 8자 + 마지막 8자):');
  const password = urlParts[2];
  console.log(`   🔑 ${password.substring(0, 8)}...${password.substring(password.length - 8)}`);
  
  const pool = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    // 데이터베이스 생성 시간 추정 (첫 테이블 생성 시간)
    const oldestTable = await pool.query(`
      SELECT 
        MIN(create_date) as created_at
      FROM pg_stat_user_tables
    `);
    
    // 특별한 테이블이나 데이터 찾기
    const uniqueTables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      AND table_name IN ('art_profiles', 'gamification_events', 'artvee_artworks', 'exhibition_sessions')
      ORDER BY table_name
    `);
    
    console.log('\n3️⃣ SAYU 프로젝트 특징:');
    console.log('   📋 특별한 테이블들:');
    uniqueTables.rows.forEach(row => {
      console.log(`      ✅ ${row.table_name}`);
    });
    
    // 최근 생성된 테이블
    const recentTables = await pool.query(`
      SELECT 
        schemaname,
        tablename,
        tableowner
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename DESC
      LIMIT 5
    `);
    
    console.log('\n4️⃣ Railway 대시보드에서 확인 방법:');
    console.log('   1. 각 PostgreSQL 서비스 클릭');
    console.log('   2. "Connect" 탭 클릭');
    console.log('   3. "Connection String" 확인');
    console.log(`   4. 다음을 포함하는지 확인: tramway.proxy.rlwy.net:26410`);
    
    console.log('\n5️⃣ 추가 힌트:');
    console.log('   - 프로젝트 이름에 "SAYU", "art", "gallery" 등이 포함되어 있을 수 있음');
    console.log('   - 최근 활동이 있는 프로젝트일 가능성 높음');
    console.log('   - PostgreSQL 외에 Redis도 있을 수 있음');
    
    // 데이터베이스 설정 정보
    const configInfo = await pool.query(`
      SELECT name, setting 
      FROM pg_settings 
      WHERE name IN ('server_version', 'TimeZone', 'shared_buffers')
    `);
    
    console.log('\n6️⃣ 데이터베이스 버전:');
    configInfo.rows.forEach(row => {
      if (row.name === 'server_version') {
        console.log(`   📊 PostgreSQL ${row.setting}`);
      }
    });
    
  } catch (error) {
    console.error('\n❌ 오류:', error.message);
  } finally {
    await pool.end();
  }
  
  console.log('\n💡 찾는 방법:');
  console.log('1. Railway 대시보드에서 PostgreSQL이 있는 모든 프로젝트 열기');
  console.log('2. 각 프로젝트의 PostgreSQL → Connect 탭 확인');
  console.log('3. Connection String에 "tramway.proxy.rlwy.net:26410" 포함된 프로젝트 찾기');
  console.log('\n그게 바로 현재 연결된 SAYU 프로젝트입니다! 🎯');
}

findRailwayProject();