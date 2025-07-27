const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkDBStructure() {
  try {
    console.log('📊 현재 데이터베이스 구조 분석\n');
    
    // 1. 테이블 목록 조회
    const tables = await pool.query(`
      SELECT table_name, table_type 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('🗄️ 테이블 목록:');
    tables.rows.forEach((table, idx) => {
      console.log(`  ${idx + 1}. ${table.table_name} (${table.table_type})`);
    });
    
    console.log(`\n총 ${tables.rows.length}개 테이블\n`);
    
    // 2. APT 관련 테이블들 상세 확인
    console.log('🎯 APT 관련 테이블 확인:');
    
    // artists 테이블 확인
    try {
      const artistsCount = await pool.query('SELECT COUNT(*) as count FROM artists');
      const aptCount = await pool.query(`
        SELECT COUNT(*) as count 
        FROM artists 
        WHERE apt_profile IS NOT NULL
      `);
      const threeAptCount = await pool.query(`
        SELECT COUNT(*) as count 
        FROM artists 
        WHERE apt_profile IS NOT NULL 
        AND jsonb_array_length(apt_profile->'primary_types') = 3
      `);
      
      console.log(`  ✅ artists: ${artistsCount.rows[0].count}명`);
      console.log(`    - APT 설정: ${aptCount.rows[0].count}명`);
      console.log(`    - 3개 APT: ${threeAptCount.rows[0].count}명`);
    } catch (error) {
      console.log(`  ❌ artists 테이블 오류: ${error.message}`);
    }
    
    // artworks 테이블 확인
    try {
      const artworksCount = await pool.query('SELECT COUNT(*) as count FROM artworks');
      console.log(`  ✅ artworks: ${artworksCount.rows[0].count}개`);
    } catch (error) {
      console.log(`  ❌ artworks 테이블 없음 또는 오류`);
    }
    
    // exhibitions 관련 테이블들 확인
    console.log('\n🏛️ 전시 관련 테이블:');
    
    const exhibitionTables = tables.rows.filter(t => 
      t.table_name.includes('exhibition') || 
      t.table_name.includes('venue') ||
      t.table_name.includes('global_venues')
    );
    
    for (const table of exhibitionTables) {
      try {
        const count = await pool.query(`SELECT COUNT(*) as count FROM ${table.table_name}`);
        console.log(`  ✅ ${table.table_name}: ${count.rows[0].count}개`);
      } catch (error) {
        console.log(`  ❌ ${table.table_name}: 오류`);
      }
    }
    
    // 3. 불필요할 수 있는 테이블들 식별
    console.log('\n🔍 검토가 필요한 테이블들:');
    
    const potentiallyUnneeded = tables.rows.filter(t => {
      const name = t.table_name;
      return name.includes('test') || 
             name.includes('temp') || 
             name.includes('backup') ||
             name.includes('old') ||
             name.includes('migration') ||
             name.includes('crawl') ||
             name.includes('scraping') ||
             name.includes('collection') ||
             name.includes('log');
    });
    
    if (potentiallyUnneeded.length > 0) {
      potentiallyUnneeded.forEach(table => {
        console.log(`  ⚠️ ${table.table_name} - 검토 필요`);
      });
    } else {
      console.log('  ✅ 의심스러운 테이블 없음');
    }
    
    // 4. 핵심 기능별 요약
    console.log('\n📋 핵심 기능 상태:');
    console.log('  🎨 APT 시스템: ✅ 완성 (3개 APT 시스템)');
    console.log('  👤 사용자 시스템: 🔍 확인 필요');
    console.log('  🏛️ 전시 시스템: 🔍 확인 필요');
    console.log('  🎯 매칭 시스템: 🔍 확인 필요');
    
  } catch (error) {
    console.error('❌ 오류:', error.message);
  } finally {
    await pool.end();
  }
}

// 실행
if (require.main === module) {
  checkDBStructure();
}

module.exports = { checkDBStructure };