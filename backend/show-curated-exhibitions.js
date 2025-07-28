#!/usr/bin/env node
require('dotenv').config();

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function showCuratedExhibitions() {
  const client = await pool.connect();

  try {
    const result = await client.query(`
      SELECT 
        title_local, title_en, venue_name, start_date, end_date,
        description, artists, official_url,
        CASE 
          WHEN start_date <= CURRENT_DATE AND end_date >= CURRENT_DATE THEN '진행중'
          WHEN start_date > CURRENT_DATE THEN '예정'
          ELSE '종료'
        END as status
      FROM exhibitions 
      WHERE source = 'manual_curated'
      ORDER BY start_date DESC
    `);

    console.log('🎨 큐레이션된 실제 서울 전시 현황');
    console.log('='.repeat(80));
    console.log();

    result.rows.forEach((ex, index) => {
      const statusEmoji = ex.status === '진행중' ? '🟢' : ex.status === '예정' ? '🔵' : '🔴';
      console.log(`${index + 1}. ${statusEmoji} ${ex.title_local}`);
      if (ex.title_en) console.log(`   🔤 ${ex.title_en}`);
      console.log(`   🏛️  ${ex.venue_name}`);
      console.log(`   📅 ${ex.start_date} ~ ${ex.end_date} (${ex.status})`);
      if (ex.artists) console.log(`   🎨 ${ex.artists.join(', ')}`);
      console.log(`   📝 ${ex.description}`);
      console.log(`   🌐 ${ex.official_url}`);
      console.log();
    });

    console.log(`총 ${result.rows.length}개 정품 전시 데이터`);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  showCuratedExhibitions();
}
