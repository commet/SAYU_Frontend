#!/usr/bin/env node
require('dotenv').config();

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function cleanNaverData() {
  console.log('🧹 네이버 블로그 쓰레기 데이터 정리');
  
  const client = await pool.connect();
  
  try {
    // 1. 네이버 블로그 데이터 확인
    const naverData = await client.query(`
      SELECT COUNT(*) as count 
      FROM exhibitions 
      WHERE source = '네이버 블로그'
    `);
    
    console.log(`📊 네이버 블로그 데이터: ${naverData.rows[0].count}개`);
    
    // 2. 샘플 확인
    const samples = await client.query(`
      SELECT title_en, venue_name, artists
      FROM exhibitions 
      WHERE source = '네이버 블로그'
      LIMIT 5
    `);
    
    console.log('\n🔍 샘플 데이터:');
    samples.rows.forEach(row => {
      console.log(`   - "${row.title_en}" @ ${row.venue_name}`);
    });
    
    // 3. 삭제 실행
    console.log('\n🗑️  네이버 블로그 데이터 삭제 중...');
    const deleteResult = await client.query(`
      DELETE FROM exhibitions 
      WHERE source = '네이버 블로그'
    `);
    
    console.log(`✅ ${deleteResult.rowCount}개 삭제 완료`);
    
    // 4. 남은 고품질 데이터 확인
    const goodData = await client.query(`
      SELECT source, COUNT(*) as count, 
             COUNT(CASE WHEN artists IS NOT NULL AND array_length(artists, 1) > 0 THEN 1 END) as with_artists
      FROM exhibitions 
      WHERE source IN ('design_plus_verified', 'manual_curated', 'open_data_verified', 'met_museum_verified')
      GROUP BY source
      ORDER BY count DESC
    `);
    
    console.log('\n📊 남은 고품질 데이터:');
    goodData.rows.forEach(row => {
      console.log(`   - ${row.source}: ${row.count}개 (작가정보: ${row.with_artists}개)`);
    });
    
    // 5. 전체 현황
    const total = await client.query('SELECT COUNT(*) as count FROM exhibitions');
    console.log(`\n✨ 정리 후 총 전시: ${total.rows[0].count}개`);
    
  } catch (error) {
    console.error('❌ 오류:', error.message);
  } finally {
    client.release();
    process.exit(0);
  }
}

cleanNaverData();