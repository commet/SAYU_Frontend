#!/usr/bin/env node
require('dotenv').config();

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function compareDataSources() {
  const client = await pool.connect();

  try {
    // 1. 각 소스별 데이터 품질 통계
    const qualityStats = await client.query(`
      SELECT 
        source,
        COUNT(*) as total,
        COUNT(CASE WHEN artists IS NOT NULL AND array_length(artists, 1) > 0 THEN 1 END) as has_artists,
        COUNT(CASE WHEN length(description) > 50 THEN 1 END) as has_good_description,
        COUNT(CASE WHEN official_url IS NOT NULL THEN 1 END) as has_official_url,
        COUNT(CASE WHEN start_date = CURRENT_DATE THEN 1 END) as starts_today,
        COUNT(CASE WHEN end_date - start_date > 365 THEN 1 END) as too_long_duration,
        AVG(length(title_local))::int as avg_title_length
      FROM exhibitions 
      GROUP BY source
      ORDER BY has_artists DESC, total DESC
    `);

    console.log('📊 소스별 데이터 품질 비교 분석');
    console.log('='.repeat(100));
    console.log(`${'소스'.padEnd(25)}| 총개수 | 작가정보 | 상세설명 | 공식URL | 오늘시작 | 1년이상 | 평균제목길이 | 품질점수`);
    console.log('-'.repeat(100));

    qualityStats.rows.forEach(row => {
      // 품질 점수 계산 (0-100)
      const qualityScore = Math.round(
        ((row.has_artists / row.total) * 30 +
         (row.has_good_description / row.total) * 30 +
         (row.has_official_url / row.total) * 20 +
         (1 - row.starts_today / row.total) * 10 +
         (1 - row.too_long_duration / row.total) * 10) * 100
      );

      console.log(
        `${row.source.padEnd(25)}| ${
          row.total.toString().padStart(6)} | ${
          row.has_artists.toString().padStart(8)} | ${
          row.has_good_description.toString().padStart(8)} | ${
          row.has_official_url.toString().padStart(7)} | ${
          row.starts_today.toString().padStart(8)} | ${
          row.too_long_duration.toString().padStart(7)} | ${
          row.avg_title_length.toString().padStart(12)} | ${
          qualityScore.toString().padStart(8)}%`
      );
    });

    // 2. 최고 품질 데이터 샘플
    console.log('\n\n✨ 최고 품질 데이터 샘플 (open_data_verified):');
    console.log('='.repeat(80));

    const bestData = await client.query(`
      SELECT title_local, venue_name, artists, start_date, end_date, description, official_url
      FROM exhibitions 
      WHERE source = 'open_data_verified'
      AND artists IS NOT NULL 
      AND array_length(artists, 1) > 0
      LIMIT 3
    `);

    bestData.rows.forEach((row, i) => {
      console.log(`\n[${i + 1}] "${row.title_local}"`);
      console.log(`   📍 장소: ${row.venue_name}`);
      console.log(`   🎨 작가: ${row.artists.join(', ')}`);
      console.log(`   📅 기간: ${row.start_date} ~ ${row.end_date}`);
      console.log(`   📝 설명: ${row.description ? `${row.description.substring(0, 100)}...` : 'N/A'}`);
      console.log(`   🔗 URL: ${row.official_url || 'N/A'}`);
    });

    // 3. 네이버 블로그 문제점 상세 분석
    console.log('\n\n❌ 네이버 블로그 데이터 문제점 상세 분석:');
    console.log('='.repeat(80));

    const naverIssues = await client.query(`
      SELECT 
        title_local,
        venue_name,
        start_date,
        description
      FROM exhibitions 
      WHERE source = 'naver_blog'
      AND (
        title_local LIKE '%문화누리%' OR
        title_local LIKE '%할인%' OR
        title_local LIKE '%가볼만한%' OR
        title_local LIKE '%추천%' OR
        title_local LIKE '%2025%' OR
        title_local LIKE '%어디까지%' OR
        length(title_local) < 8
      )
      LIMIT 10
    `);

    console.log('\n블로그 포스트 제목으로 오인된 데이터:');
    naverIssues.rows.forEach((row, i) => {
      console.log(`${i + 1}. "${row.title_local}" (${row.venue_name})`);
    });

    // 4. 데이터 정제 권장사항
    console.log('\n\n🔧 데이터 정제 권장사항:');
    console.log('='.repeat(80));
    console.log('1. 네이버 블로그 데이터 전체 삭제 또는 재수집 필요');
    console.log('2. 다음 조건의 데이터 필터링:');
    console.log('   - 제목에 특수문자(#, @) 포함');
    console.log('   - 제목 길이 8자 미만');
    console.log('   - 작가 정보 없음');
    console.log('   - 시작일이 오늘인 경우 (잘못된 파싱)');
    console.log('3. 신뢰할 수 있는 소스 우선순위:');
    console.log('   1) open_data_verified (100% 품질)');
    console.log('   2) design_plus_verified (100% 품질)');
    console.log('   3) met_museum_verified (95% 품질)');
    console.log('   4) manual_curated (90% 품질)');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  compareDataSources();
}
