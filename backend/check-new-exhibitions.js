#!/usr/bin/env node
require('dotenv').config();

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkNewExhibitions() {
  const client = await pool.connect();
  
  try {
    const result = await client.query(`
      SELECT title_local, title_en, venue_name, start_date, end_date, admission_fee 
      FROM exhibitions 
      WHERE source = 'manual' 
      AND created_at > NOW() - INTERVAL '10 minutes' 
      ORDER BY created_at DESC
    `);
    
    console.log('\n🎨 방금 추가된 전시들:\n');
    result.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.title_local}`);
      if (row.title_en && row.title_en !== row.title_local) {
        console.log(`   (${row.title_en})`);
      }
      console.log(`   📍 ${row.venue_name}`);
      console.log(`   📅 ${row.start_date.toLocaleDateString()} ~ ${row.end_date.toLocaleDateString()}`);
      console.log(`   💰 ${row.admission_fee}`);
      console.log('');
    });
    
    console.log(`총 ${result.rows.length}개의 전시가 추가되었습니다.`);
    
  } catch (error) {
    console.error('오류:', error);
  } finally {
    client.release();
    pool.end();
  }
}

checkNewExhibitions();