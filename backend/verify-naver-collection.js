#!/usr/bin/env node
require('dotenv').config();

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function verifyNaverCollection() {
  console.log('🔍 네이버 API 수집 데이터 검증\n');
  
  const client = await pool.connect();
  
  try {
    // 1. 네이버 수집 전시 목록
    const naverExhibitions = await client.query(`
      SELECT 
        venue_name,
        venue_city,
        title_local,
        start_date,
        end_date,
        status,
        source_url
      FROM exhibitions 
      WHERE source LIKE 'naver%'
      ORDER BY start_date DESC
      LIMIT 20
    `);
    
    console.log('📋 네이버 API로 수집된 전시 목록:');
    console.log('='.repeat(80));
    
    naverExhibitions.rows.forEach((exhibition, index) => {
      console.log(`\n${index + 1}. ${exhibition.title_local}`);
      console.log(`   장소: ${exhibition.venue_name} (${exhibition.venue_city})`);
      console.log(`   기간: ${new Date(exhibition.start_date).toLocaleDateString('ko-KR')} ~ ${new Date(exhibition.end_date).toLocaleDateString('ko-KR')}`);
      console.log(`   상태: ${exhibition.status}`);
      console.log(`   출처: ${exhibition.source_url}`);
    });
    
    // 2. 수집 통계
    const collectionStats = await client.query(`
      SELECT 
        source,
        COUNT(*) as count,
        COUNT(CASE WHEN status = 'current' THEN 1 END) as current,
        COUNT(CASE WHEN status = 'upcoming' THEN 1 END) as upcoming,
        COUNT(CASE WHEN status = 'past' THEN 1 END) as past
      FROM exhibitions
      GROUP BY source
      ORDER BY count DESC
    `);
    
    console.log('\n\n📊 소스별 수집 통계:');
    console.log('='.repeat(50));
    collectionStats.rows.forEach(stat => {
      console.log(`\n${stat.source}:`);
      console.log(`   총 ${stat.count}개 (진행중: ${stat.current}, 예정: ${stat.upcoming}, 종료: ${stat.past})`);
    });
    
    // 3. 장소별 전시 개수
    const venueStats = await client.query(`
      SELECT 
        venue_name,
        venue_city,
        COUNT(*) as exhibition_count,
        COUNT(CASE WHEN source LIKE 'naver%' THEN 1 END) as naver_count
      FROM exhibitions
      GROUP BY venue_name, venue_city
      HAVING COUNT(CASE WHEN source LIKE 'naver%' THEN 1 END) > 0
      ORDER BY naver_count DESC, exhibition_count DESC
      LIMIT 10
    `);
    
    console.log('\n\n🏛️ 네이버 수집 상위 미술관:');
    console.log('='.repeat(50));
    venueStats.rows.forEach((venue, index) => {
      console.log(`${index + 1}. ${venue.venue_name} (${venue.venue_city})`);
      console.log(`   네이버 수집: ${venue.naver_count}개 / 전체: ${venue.exhibition_count}개`);
    });
    
    // 4. 날짜 분포
    const dateDistribution = await client.query(`
      SELECT 
        EXTRACT(MONTH FROM start_date) as month,
        COUNT(*) as count
      FROM exhibitions
      WHERE source LIKE 'naver%' 
        AND EXTRACT(YEAR FROM start_date) = 2025
      GROUP BY month
      ORDER BY month
    `);
    
    console.log('\n\n📅 2025년 월별 전시 분포 (네이버 수집):');
    console.log('='.repeat(50));
    const months = ['', '1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
    dateDistribution.rows.forEach(row => {
      console.log(`${months[row.month]}: ${'■'.repeat(row.count)} (${row.count}개)`);
    });
    
    // 5. 데이터 품질 체크
    const qualityCheck = await client.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN title_local IS NULL OR title_local = '' THEN 1 END) as missing_title,
        COUNT(CASE WHEN venue_name IS NULL THEN 1 END) as missing_venue,
        COUNT(CASE WHEN start_date > end_date THEN 1 END) as invalid_dates,
        COUNT(CASE WHEN source_url IS NULL THEN 1 END) as missing_source
      FROM exhibitions
      WHERE source LIKE 'naver%'
    `);
    
    console.log('\n\n✅ 데이터 품질 체크:');
    console.log('='.repeat(50));
    const quality = qualityCheck.rows[0];
    console.log(`총 네이버 수집 전시: ${quality.total}개`);
    console.log(`제목 누락: ${quality.missing_title}개`);
    console.log(`장소 누락: ${quality.missing_venue}개`);
    console.log(`날짜 오류: ${quality.invalid_dates}개`);
    console.log(`출처 URL 누락: ${quality.missing_source}개`);
    
    if (quality.missing_title === 0 && quality.missing_venue === 0 && 
        quality.invalid_dates === 0 && quality.missing_source === 0) {
      console.log('\n🎉 모든 데이터가 정상적으로 수집되었습니다!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  verifyNaverCollection();
}