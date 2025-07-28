const { Pool } = require('pg');
require('dotenv').config();

async function showWebsearchExhibitions() {
  console.log('🔍 WebSearch로 수집된 전시 정보 검증');
  console.log('====================================\n');

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
        v.city,
        v.country,
        e.start_date,
        e.end_date,
        e.description,
        e.art_medium,
        v.website
      FROM global_exhibitions e
      JOIN global_venues v ON e.venue_id = v.id
      WHERE e.data_source = 'websearch_verified'
      ORDER BY v.city, v.name, e.start_date
    `);

    console.log(`📊 총 ${exhibitions.rows.length}개 전시 발견\n`);

    let currentCity = '';
    exhibitions.rows.forEach((ex, i) => {
      if (ex.city !== currentCity) {
        currentCity = ex.city;
        console.log(`\n🌍 ${ex.city.toUpperCase()}, ${ex.country}`);
        console.log('='.repeat(50));
      }

      console.log(`\n${i + 1}. "${ex.title}"`);
      console.log(`   🏛️  ${ex.venue_name}`);
      console.log(`   📅 ${ex.start_date} ~ ${ex.end_date}`);
      console.log(`   🎨 ${ex.art_medium}`);
      console.log(`   🔗 ${ex.website}`);
      console.log(`   📝 ${ex.description.substring(0, 120)}...`);
    });

    // 의심스러운 전시들 체크
    console.log('\n\n🚨 검증 필요한 전시들:');
    console.log('========================');

    const suspiciousExhibitions = exhibitions.rows.filter(ex => {
      // 미래 날짜가 너무 먼 경우
      const endDate = new Date(ex.end_date);
      const now = new Date();
      const yearsDiff = (endDate - now) / (1000 * 60 * 60 * 24 * 365);

      // 제목이 너무 긴 경우
      const titleTooLong = ex.title.length > 80;

      // 날짜가 이상한 경우
      const dateTooFuture = yearsDiff > 2;

      return titleTooLong || dateTooFuture;
    });

    if (suspiciousExhibitions.length > 0) {
      suspiciousExhibitions.forEach(ex => {
        console.log(`❗ "${ex.title}" - ${ex.venue_name}`);
        console.log(`   이유: ${ex.title.length > 80 ? '제목 너무 김 ' : ''}${new Date(ex.end_date).getFullYear() > 2026 ? '날짜 의심스러움' : ''}`);
      });
    } else {
      console.log('✅ 의심스러운 전시 없음');
    }

    // 날짜별 분포 확인
    console.log('\n📅 전시 기간 분포:');
    console.log('==================');

    const now = new Date();
    const activeNow = exhibitions.rows.filter(ex =>
      new Date(ex.start_date) <= now && new Date(ex.end_date) >= now
    ).length;

    const future = exhibitions.rows.filter(ex =>
      new Date(ex.start_date) > now
    ).length;

    const past = exhibitions.rows.filter(ex =>
      new Date(ex.end_date) < now
    ).length;

    console.log(`현재 진행중: ${activeNow}개`);
    console.log(`향후 예정: ${future}개`);
    console.log(`이미 종료: ${past}개`);

  } catch (error) {
    console.error('❌ 오류:', error.message);
  } finally {
    await pool.end();
  }
}

showWebsearchExhibitions();
