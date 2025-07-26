require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkChineseVenues() {
  try {
    const result = await pool.query(`
      SELECT id, name_en, name_ko, city, address_en, address_ko 
      FROM global_venues 
      WHERE country = 'China' 
      ORDER BY city, name_en
      LIMIT 20
    `);
    
    console.log('중국 미술관 현황 (상위 20개):');
    console.log('='.repeat(80));
    result.rows.forEach(venue => {
      console.log(`ID: ${venue.id}`);
      console.log(`영문명: ${venue.name_en}`);
      console.log(`한글명: ${venue.name_ko || '없음'}`);
      console.log(`도시: ${venue.city}`);
      console.log(`영문주소: ${venue.address_en || '없음'}`);
      console.log(`한글주소: ${venue.address_ko || '없음'}`);
      console.log('-'.repeat(40));
    });
    
    const total = await pool.query('SELECT COUNT(*) FROM global_venues WHERE country = \'China\'');
    console.log(`\n총 중국 미술관 수: ${total.rows[0].count}개`);
    
    const noKorean = await pool.query('SELECT COUNT(*) FROM global_venues WHERE country = \'China\' AND name_ko IS NULL');
    console.log(`한글명 없는 미술관: ${noKorean.rows[0].count}개`);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkChineseVenues();