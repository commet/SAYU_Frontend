const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function showExhibitionExamples() {
  try {
    // 최근 전시 예시 (국내)
    console.log('\n📍 국내 전시 예시:\n');
    const domesticExhibitions = await pool.query(`
      SELECT 
        e.title,
        e.start_date,
        e.end_date,
        v.name as venue_name,
        v.city,
        e.description
      FROM exhibitions e
      JOIN venues v ON e.venue_id = v.id
      WHERE v.country = 'South Korea'
      ORDER BY e.created_at DESC
      LIMIT 5
    `);
    
    domesticExhibitions.rows.forEach((ex, i) => {
      console.log(`${i+1}. "${ex.title}"`);
      console.log(`   장소: ${ex.venue_name} (${ex.city})`);
      console.log(`   기간: ${ex.start_date ? new Date(ex.start_date).toLocaleDateString() : 'N/A'} ~ ${ex.end_date ? new Date(ex.end_date).toLocaleDateString() : 'N/A'}`);
      if (ex.description) {
        console.log(`   설명: ${ex.description.substring(0, 100)}...`);
      }
      console.log();
    });

    // 최근 전시 예시 (해외)
    console.log('\n🌍 해외 전시 예시:\n');
    const internationalExhibitions = await pool.query(`
      SELECT 
        e.title,
        e.start_date,
        e.end_date,
        v.name as venue_name,
        v.city,
        v.country,
        e.description
      FROM exhibitions e
      JOIN venues v ON e.venue_id = v.id
      WHERE v.country != 'South Korea'
      ORDER BY e.created_at DESC
      LIMIT 5
    `);
    
    internationalExhibitions.rows.forEach((ex, i) => {
      console.log(`${i+1}. "${ex.title}"`);
      console.log(`   장소: ${ex.venue_name} (${ex.city}, ${ex.country})`);
      console.log(`   기간: ${ex.start_date ? new Date(ex.start_date).toLocaleDateString() : 'N/A'} ~ ${ex.end_date ? new Date(ex.end_date).toLocaleDateString() : 'N/A'}`);
      if (ex.description) {
        console.log(`   설명: ${ex.description.substring(0, 100)}...`);
      }
      console.log();
    });

    // 전체 통계
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN v.country = 'South Korea' THEN 1 END) as domestic,
        COUNT(CASE WHEN v.country != 'South Korea' THEN 1 END) as international,
        COUNT(DISTINCT e.venue_id) as unique_venues
      FROM exhibitions e
      JOIN venues v ON e.venue_id = v.id
    `);
    
    console.log('\n📊 현재 전시 데이터 현황:');
    console.log(`총 전시: ${stats.rows[0].total}개`);
    console.log(`- 국내: ${stats.rows[0].domestic}개`);
    console.log(`- 해외: ${stats.rows[0].international}개`);
    console.log(`참여 기관: ${stats.rows[0].unique_venues}개`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

showExhibitionExamples();