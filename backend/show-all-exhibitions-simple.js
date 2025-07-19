const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function showAllExhibitionsSimple() {
  try {
    // 모든 전시 가져오기 (간단한 형식)
    const allExhibitions = await pool.query(`
      SELECT 
        title_local,
        venue_name,
        venue_city,
        venue_country,
        start_date,
        status
      FROM exhibitions
      ORDER BY start_date DESC
    `);
    
    console.log(`\n전체 ${allExhibitions.rows.length}개 전시 목록:\n`);
    
    allExhibitions.rows.forEach((ex, i) => {
      const date = ex.start_date ? new Date(ex.start_date).toISOString().split('T')[0] : 'N/A';
      console.log(`${i + 1}. ${ex.title_local} | ${ex.venue_name}, ${ex.venue_city}(${ex.venue_country}) | ${date} | ${ex.status}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

showAllExhibitionsSimple();