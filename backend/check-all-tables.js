const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkAllTables() {
  try {
    console.log('🔍 SAYU 데이터베이스 전체 테이블 확인\n');
    console.log('====================================\n');
    
    // 1. 모든 테이블 목록 확인
    const tables = await pool.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `);
    
    console.log('📋 전체 테이블 목록:');
    console.log('==================');
    tables.rows.forEach((table, index) => {
      console.log(`${index + 1}. ${table.tablename}`);
    });
    
    // 2. 각 테이블별 레코드 수 확인
    console.log('\n\n📊 테이블별 데이터 수:');
    console.log('====================');
    
    for (const table of tables.rows) {
      try {
        const countResult = await pool.query(`SELECT COUNT(*) as count FROM ${table.tablename}`);
        const count = countResult.rows[0].count;
        console.log(`${table.tablename.padEnd(30)} : ${count.toString().padStart(10)} 레코드`);
      } catch (err) {
        console.log(`${table.tablename.padEnd(30)} : 에러 - ${err.message}`);
      }
    }
    
    // 3. 핵심 테이블 상세 분석
    console.log('\n\n🎯 핵심 테이블 상세 분석:');
    console.log('========================\n');
    
    // 3-1. Artists 테이블
    console.log('1️⃣ Artists 테이블');
    console.log('-----------------');
    const artistStats = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN copyright_status = 'contemporary' THEN 1 END) as contemporary,
        COUNT(CASE WHEN copyright_status = 'public_domain' THEN 1 END) as public_domain,
        COUNT(CASE WHEN birth_year IS NOT NULL THEN 1 END) as has_birth_year,
        COUNT(CASE WHEN name_ko IS NOT NULL THEN 1 END) as has_korean_name
      FROM artists
    `);
    
    const as = artistStats.rows[0];
    console.log(`총 아티스트: ${as.total}명`);
    console.log(`- 현대 작가: ${as.contemporary}명`);
    console.log(`- 퍼블릭 도메인: ${as.public_domain}명`);
    console.log(`- 생년 정보 보유: ${as.has_birth_year}명`);
    console.log(`- 한국어 이름 보유: ${as.has_korean_name}명`);
    
    // 3-2. Exhibitions 테이블
    console.log('\n2️⃣ Exhibitions 테이블');
    console.log('--------------------');
    const exhibitionExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'exhibitions'
      );
    `);
    
    if (exhibitionExists.rows[0].exists) {
      const exhibitionStats = await pool.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN end_date >= CURRENT_DATE THEN 1 END) as ongoing,
          COUNT(CASE WHEN start_date > CURRENT_DATE THEN 1 END) as upcoming,
          COUNT(CASE WHEN end_date < CURRENT_DATE THEN 1 END) as past
        FROM exhibitions
      `);
      
      const es = exhibitionStats.rows[0];
      console.log(`총 전시: ${es.total}개`);
      console.log(`- 진행 중: ${es.ongoing}개`);
      console.log(`- 예정: ${es.upcoming}개`);
      console.log(`- 종료: ${es.past}개`);
    } else {
      console.log('❌ exhibitions 테이블이 존재하지 않습니다.');
    }
    
    // 3-3. Users 테이블
    console.log('\n3️⃣ Users 테이블');
    console.log('----------------');
    const userStats = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(animal_type) as has_animal_type,
        COUNT(profile_image_url) as has_profile_image,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as new_users_week
      FROM users
    `);
    
    const us = userStats.rows[0];
    console.log(`총 사용자: ${us.total}명`);
    console.log(`- 성격 테스트 완료: ${us.has_animal_type}명`);
    console.log(`- 프로필 이미지 보유: ${us.has_profile_image}명`);
    console.log(`- 최근 일주일 신규: ${us.new_users_week}명`);
    
    // 3-4. 기타 중요 테이블 확인
    console.log('\n4️⃣ 기타 테이블 상태');
    console.log('------------------');
    
    const importantTables = [
      'artworks',
      'user_quiz_answers',
      'user_art_preferences',
      'follows',
      'waitlist',
      'daily_art_habits',
      'gamification_points',
      'venues'
    ];
    
    for (const tableName of importantTables) {
      const exists = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = '${tableName}'
        );
      `);
      
      if (exists.rows[0].exists) {
        const count = await pool.query(`SELECT COUNT(*) as count FROM ${tableName}`);
        console.log(`✅ ${tableName}: ${count.rows[0].count} 레코드`);
      } else {
        console.log(`❌ ${tableName}: 테이블 없음`);
      }
    }
    
    // 4. 최근 활동 요약
    console.log('\n\n📈 최근 24시간 활동 요약:');
    console.log('========================');
    
    // 새 사용자
    const newUsers = await pool.query(`
      SELECT COUNT(*) as count 
      FROM users 
      WHERE created_at >= NOW() - INTERVAL '24 hours'
    `);
    console.log(`새 사용자: ${newUsers.rows[0].count}명`);
    
    // 새 아티스트
    const newArtists = await pool.query(`
      SELECT COUNT(*) as count 
      FROM artists 
      WHERE created_at >= NOW() - INTERVAL '24 hours'
    `);
    console.log(`새 아티스트: ${newArtists.rows[0].count}명`);
    
    // 퀴즈 응답
    const quizAnswers = await pool.query(`
      SELECT COUNT(DISTINCT user_id) as count 
      FROM user_quiz_answers 
      WHERE created_at >= NOW() - INTERVAL '24 hours'
    `);
    console.log(`퀴즈 참여: ${quizAnswers.rows[0].count}명`);
    
    // 5. 데이터베이스 크기 정보
    console.log('\n\n💾 데이터베이스 크기 정보:');
    console.log('========================');
    
    const dbSize = await pool.query(`
      SELECT 
        pg_database_size(current_database()) as db_size,
        pg_size_pretty(pg_database_size(current_database())) as db_size_pretty
    `);
    
    console.log(`전체 DB 크기: ${dbSize.rows[0].db_size_pretty}`);
    
    // 테이블별 크기 (상위 10개)
    const tableSizes = await pool.query(`
      SELECT 
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
        pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
      LIMIT 10
    `);
    
    console.log('\n상위 10개 테이블 크기:');
    tableSizes.rows.forEach((table, index) => {
      console.log(`${index + 1}. ${table.tablename.padEnd(25)} : ${table.size}`);
    });
    
  } catch (error) {
    console.error('❌ 데이터베이스 확인 중 오류:', error);
  } finally {
    await pool.end();
  }
}

checkAllTables();