const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkResults() {
  try {
    // 전체 통계
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN country = 'KR' THEN 1 END) as korean,
        COUNT(DISTINCT city) as cities
      FROM venues
      WHERE is_active = true
    `);
    
    console.log('📊 미술관/갤러리 데이터 현황:\n');
    console.log(`총 미술관/갤러리: ${stats.rows[0].total}개`);
    console.log(`한국: ${stats.rows[0].korean}개`);
    console.log(`도시: ${stats.rows[0].cities}개`);
    
    // 주요 도시별 통계
    const cityStats = await pool.query(`
      SELECT city, COUNT(*) as count
      FROM venues
      WHERE country = 'KR' AND is_active = true
      GROUP BY city
      ORDER BY count DESC
      LIMIT 15
    `);
    
    console.log('\n🏙️  주요 도시별 미술관:');
    cityStats.rows.forEach(stat => {
      console.log(`  ${stat.city}: ${stat.count}개`);
    });
    
    // 샘플 데이터
    const samples = await pool.query(`
      SELECT name, city, district, phone, website
      FROM venues
      WHERE country = 'KR' 
      AND latitude IS NOT NULL
      AND opening_hours IS NOT NULL
      ORDER BY created_at DESC
      LIMIT 10
    `);
    
    console.log('\n📍 최근 추가된 미술관 예시:');
    samples.rows.forEach((v, i) => {
      console.log(`${i+1}. ${v.name} (${v.city} ${v.district})`);
      if (v.phone) console.log(`   ☎️  ${v.phone}`);
      if (v.website) console.log(`   🌐 ${v.website}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkResults();