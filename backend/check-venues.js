const { Pool } = require('pg');
require('dotenv').config();

async function checkExistingVenues() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    const venueNames = [
      'Tate Modern',
      'Tate Britain', 
      'British Museum',
      'National Gallery',
      'V&A Museum',
      'Royal Academy of Arts'
    ];

    console.log('🔍 중복 venue 확인...\n');

    for (const venueName of venueNames) {
      const result = await pool.query(`
        SELECT id, name, city, data_source
        FROM global_venues 
        WHERE name ILIKE $1
      `, [venueName]);

      if (result.rows.length > 0) {
        console.log(`❗ 중복: ${venueName}`);
      } else {
        console.log(`✅ 신규: ${venueName}`);
      }
    }

  } catch (error) {
    console.error('❌ 오류:', error.message);
  } finally {
    await pool.end();
  }
}

checkExistingVenues();