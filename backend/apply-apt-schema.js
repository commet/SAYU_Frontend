const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function applyAPTSchema() {
  try {
    console.log('📊 APT 프로필 스키마 적용 시작...\n');
    
    const sql = fs.readFileSync('migrations/add-artist-apt-profile.sql', 'utf8');
    
    console.log('🔧 SQL 실행 중...');
    await pool.query(sql);
    
    console.log('✅ APT 프로필 스키마 적용 완료!');
    console.log('- artists 테이블에 apt_profile 컬럼 추가');
    console.log('- artist_apt_mappings 테이블 생성');
    console.log('- 관련 뷰와 함수 생성');
    
    // 테이블 확인
    const check = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'artists' AND column_name = 'apt_profile'
    `);
    
    if (check.rows.length > 0) {
      console.log('\n✅ apt_profile 컬럼 확인됨');
    } else {
      console.log('\n❌ apt_profile 컬럼 생성 실패');
    }
    
  } catch (error) {
    console.error('❌ 오류:', error.message);
    console.error('상세:', error);
  } finally {
    await pool.end();
  }
}

applyAPTSchema();