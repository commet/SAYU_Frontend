const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkDuplicatesAndQuality() {
  try {
    console.log('🔍 전시 데이터 중복 및 품질 검사 시작...\n');
    console.log('=' .repeat(60));
    
    // 1. 중복 검사 - 같은 제목과 장소
    console.log('\n📌 중복 가능성 검사:');
    const duplicates = await pool.query(`
      SELECT 
        title_local, 
        venue_name, 
        COUNT(*) as count,
        array_agg(id) as ids,
        array_agg(start_date) as dates
      FROM exhibitions
      GROUP BY title_local, venue_name
      HAVING COUNT(*) > 1
      ORDER BY count DESC
    `);
    
    if (duplicates.rows.length > 0) {
      console.log('\n❌ 중복 발견:');
      duplicates.rows.forEach(dup => {
        console.log(`  - "${dup.title_local}" @ ${dup.venue_name}: ${dup.count}개`);
        console.log(`    IDs: ${dup.ids.join(', ')}`);
        console.log(`    날짜: ${dup.dates.map(d => d ? new Date(d).toLocaleDateString() : 'null').join(', ')}`);
      });
    } else {
      console.log('✅ 중복 없음 - 모든 전시가 고유합니다!');
    }
    
    // 2. 데이터 품질 검사
    console.log('\n📊 데이터 품질 검사:');
    
    // 필수 필드 누락 검사
    const missingFields = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE title_local IS NULL OR title_local = '') as no_title,
        COUNT(*) FILTER (WHERE venue_name IS NULL OR venue_name = '') as no_venue,
        COUNT(*) FILTER (WHERE start_date IS NULL) as no_start_date,
        COUNT(*) FILTER (WHERE venue_city IS NULL OR venue_city = '') as no_city,
        COUNT(*) FILTER (WHERE venue_country IS NULL OR venue_country = '') as no_country,
        COUNT(*) FILTER (WHERE description IS NULL OR description = '') as no_description,
        COUNT(*) FILTER (WHERE exhibition_type IS NULL) as no_type,
        COUNT(*) FILTER (WHERE status IS NULL) as no_status
      FROM exhibitions
    `);
    
    const quality = missingFields.rows[0];
    console.log('\n필수 필드 완성도:');
    console.log(`  ✅ 제목: ${185 - quality.no_title}/185 (${Math.round((185 - quality.no_title)/185*100)}%)`);
    console.log(`  ✅ 장소명: ${185 - quality.no_venue}/185 (${Math.round((185 - quality.no_venue)/185*100)}%)`);
    console.log(`  ✅ 시작일: ${185 - quality.no_start_date}/185 (${Math.round((185 - quality.no_start_date)/185*100)}%)`);
    console.log(`  ✅ 도시: ${185 - quality.no_city}/185 (${Math.round((185 - quality.no_city)/185*100)}%)`);
    console.log(`  ✅ 국가: ${185 - quality.no_country}/185 (${Math.round((185 - quality.no_country)/185*100)}%)`);
    console.log(`  📝 설명: ${185 - quality.no_description}/185 (${Math.round((185 - quality.no_description)/185*100)}%)`);
    console.log(`  📋 타입: ${185 - quality.no_type}/185 (${Math.round((185 - quality.no_type)/185*100)}%)`);
    console.log(`  🚦 상태: ${185 - quality.no_status}/185 (${Math.round((185 - quality.no_status)/185*100)}%)`);
    
    // 3. 데이터 일관성 검사
    console.log('\n🔧 데이터 일관성:');
    
    // 국가 코드 일관성
    const countryStats = await pool.query(`
      SELECT venue_country, COUNT(*) as count
      FROM exhibitions
      GROUP BY venue_country
      ORDER BY count DESC
    `);
    
    console.log('\n국가 코드 분포:');
    countryStats.rows.forEach(stat => {
      console.log(`  ${stat.venue_country}: ${stat.count}개`);
    });
    
    // 전시 상태 일관성
    const statusStats = await pool.query(`
      SELECT status, COUNT(*) as count
      FROM exhibitions
      WHERE status IS NOT NULL
      GROUP BY status
      ORDER BY count DESC
    `);
    
    console.log('\n전시 상태 분포:');
    statusStats.rows.forEach(stat => {
      console.log(`  ${stat.status}: ${stat.count}개`);
    });
    
    // 4. 날짜 유효성 검사
    const dateIssues = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE end_date < start_date) as invalid_range,
        COUNT(*) FILTER (WHERE start_date < '2020-01-01') as too_old,
        COUNT(*) FILTER (WHERE start_date > '2027-12-31') as too_future
      FROM exhibitions
      WHERE start_date IS NOT NULL
    `);
    
    console.log('\n📅 날짜 유효성:');
    console.log(`  종료일이 시작일보다 빠른 경우: ${dateIssues.rows[0].invalid_range}개`);
    console.log(`  2020년 이전 전시: ${dateIssues.rows[0].too_old}개`);
    console.log(`  2027년 이후 전시: ${dateIssues.rows[0].too_future}개`);
    
    // 5. 샘플 데이터 확인
    console.log('\n📋 최근 추가된 전시 샘플 (구조 확인):');
    const samples = await pool.query(`
      SELECT 
        id,
        title_local,
        venue_name,
        venue_city,
        venue_country,
        start_date,
        end_date,
        exhibition_type,
        status,
        source,
        created_at
      FROM exhibitions
      ORDER BY created_at DESC
      LIMIT 3
    `);
    
    samples.rows.forEach((ex, i) => {
      console.log(`\n[샘플 ${i+1}]`);
      console.log(`  ID: ${ex.id}`);
      console.log(`  제목: ${ex.title_local}`);
      console.log(`  장소: ${ex.venue_name} (${ex.venue_city}, ${ex.venue_country})`);
      console.log(`  기간: ${ex.start_date ? new Date(ex.start_date).toLocaleDateString() : 'null'} ~ ${ex.end_date ? new Date(ex.end_date).toLocaleDateString() : 'null'}`);
      console.log(`  타입: ${ex.exhibition_type}`);
      console.log(`  상태: ${ex.status}`);
      console.log(`  출처: ${ex.source}`);
      console.log(`  생성일: ${new Date(ex.created_at).toLocaleString()}`);
    });
    
    console.log('\n' + '=' .repeat(60));
    console.log('✅ 데이터 품질 검사 완료!');
    console.log('=' .repeat(60));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkDuplicatesAndQuality();