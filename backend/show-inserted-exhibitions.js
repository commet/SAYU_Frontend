const { Pool } = require('pg');
require('dotenv').config();

async function showInsertedExhibitions() {
  console.log('🎨 삽입된 30개 전시 정보');
  console.log('======================\n');

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    const exhibitions = await pool.query(`
      SELECT 
        e.id,
        e.title,
        v.name as venue_name,
        e.start_date,
        e.end_date,
        e.official_url,
        e.data_quality_score,
        e.description
      FROM global_exhibitions e
      JOIN global_venues v ON e.venue_id = v.id
      WHERE e.data_source = 'timeout_crawled'
      ORDER BY e.data_quality_score DESC, e.id ASC
    `);

    exhibitions.rows.forEach((ex, i) => {
      console.log(`${i + 1}. "${ex.title}"`);
      console.log(`   🏛️  Venue: ${ex.venue_name}`);
      console.log(`   📅 Period: ${ex.start_date} ~ ${ex.end_date}`);
      console.log(`   📊 Quality: ${ex.data_quality_score}/100`);
      if (ex.official_url) {
        console.log(`   🔗 URL: ${ex.official_url}`);
      }
      if (ex.description && ex.description.length > 50) {
        console.log(`   📝 Description: ${ex.description.substring(0, 100)}...`);
      }
      console.log('');
    });

    console.log(`📊 총 ${exhibitions.rows.length}개 전시 확인됨`);

  } catch (error) {
    console.error('❌ 오류:', error.message);
  } finally {
    await pool.end();
  }
}

showInsertedExhibitions();
