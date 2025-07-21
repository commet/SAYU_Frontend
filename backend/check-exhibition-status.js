#!/usr/bin/env node
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkStatus() {
  try {
    // 국가별 통계
    const countryStats = await pool.query(`
      SELECT 
        COALESCE(venue_country, 'Unknown') as country,
        COUNT(*) as count
      FROM exhibitions
      GROUP BY venue_country
      ORDER BY count DESC
    `);
    
    console.log('📊 전시 데이터 국가별 현황:');
    countryStats.rows.forEach(row => {
      const flag = row.country === 'KR' ? '🇰🇷' : row.country === 'US' ? '🇺🇸' : '🌍';
      console.log(`   ${flag} ${row.country}: ${row.count}개`);
    });
    
    // 전체 통계
    const totalStats = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'ongoing' THEN 1 END) as ongoing,
        COUNT(CASE WHEN status = 'upcoming' THEN 1 END) as upcoming,
        COUNT(CASE WHEN venue_id IS NOT NULL THEN 1 END) as linked_to_venue
      FROM exhibitions
    `);
    
    const stats = totalStats.rows[0];
    console.log('\n📈 전체 전시 통계:');
    console.log(`   총 전시: ${stats.total}개`);
    console.log(`   ├─ 진행중: ${stats.ongoing}개`);
    console.log(`   ├─ 예정: ${stats.upcoming}개`);
    console.log(`   └─ 장소 연결: ${stats.linked_to_venue}개`);
    
    // 최근 추가된 전시
    const recent = await pool.query(`
      SELECT title_en, venue_name, venue_country, created_at
      FROM exhibitions
      ORDER BY created_at DESC
      LIMIT 5
    `);
    
    console.log('\n🆕 최근 추가된 전시:');
    recent.rows.forEach(ex => {
      console.log(`   • ${ex.title_en || ex.title_local} @ ${ex.venue_name} (${ex.venue_country})`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkStatus();