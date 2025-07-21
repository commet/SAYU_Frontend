#!/usr/bin/env node
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkProgress() {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(google_place_id) as with_place_id,
        COUNT(latitude) as with_coords,
        COUNT(address) as with_address,
        COUNT(rating) as with_rating,
        AVG(rating)::numeric(3,2) as avg_rating
      FROM venues 
      WHERE country != 'KR'
    `);
    
    const stats = result.rows[0];
    console.log('🌍 해외 미술관/갤러리 데이터 수집 현황:\n');
    console.log(`📊 총 ${stats.total}개 기관`);
    console.log(`✅ Google Place ID: ${stats.with_place_id}개 (${Math.round(stats.with_place_id/stats.total*100)}%)`);
    console.log(`📍 좌표 정보: ${stats.with_coords}개 (${Math.round(stats.with_coords/stats.total*100)}%)`);
    console.log(`🏠 주소 정보: ${stats.with_address}개 (${Math.round(stats.with_address/stats.total*100)}%)`);
    console.log(`⭐ 평점 정보: ${stats.with_rating}개 (${Math.round(stats.with_rating/stats.total*100)}%)`);
    console.log(`📊 평균 평점: ${stats.avg_rating || 'N/A'}`);
    
    // 아직 수집되지 않은 기관들 확인
    const remaining = await pool.query(`
      SELECT name, city, country
      FROM venues
      WHERE country != 'KR' 
      AND (google_place_id IS NULL OR google_place_id = '')
      ORDER BY name
      LIMIT 10
    `);
    
    if (remaining.rows.length > 0) {
      console.log(`\n⏳ 아직 수집되지 않은 기관: ${stats.total - stats.with_place_id}개`);
      console.log('샘플:');
      remaining.rows.forEach(v => {
        console.log(`  - ${v.name} (${v.city}, ${v.country})`);
      });
    } else {
      console.log('\n✅ 모든 해외 기관 데이터 수집 완료!');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkProgress();