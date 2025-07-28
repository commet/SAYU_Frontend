#!/usr/bin/env node
require('dotenv').config();

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function analyzeDataQuality() {
  const client = await pool.connect();

  try {
    // 1. 전체 데이터 현황
    const totalStats = await client.query(`
      SELECT 
        COUNT(*) as total_exhibitions,
        COUNT(DISTINCT source) as total_sources,
        COUNT(DISTINCT venue_name) as total_venues
      FROM exhibitions
    `);

    console.log('🎨 SAYU 전시 데이터베이스 품질 분석 보고서');
    console.log('='.repeat(80));
    console.log(`📊 전체 현황: ${totalStats.rows[0].total_exhibitions}개 전시, ${totalStats.rows[0].total_sources}개 소스, ${totalStats.rows[0].total_venues}개 장소\n`);

    // 2. 소스별 데이터 품질
    const sourceStats = await client.query(`
      SELECT 
        source,
        COUNT(*) as count,
        COUNT(CASE WHEN title_local IS NOT NULL AND length(title_local) > 3 THEN 1 END) as valid_title,
        COUNT(CASE WHEN venue_name IS NOT NULL THEN 1 END) as has_venue,
        COUNT(CASE WHEN start_date IS NOT NULL THEN 1 END) as has_start_date,
        COUNT(CASE WHEN end_date IS NOT NULL THEN 1 END) as has_end_date,
        COUNT(CASE WHEN artists IS NOT NULL AND array_length(artists, 1) > 0 THEN 1 END) as has_artists,
        COUNT(CASE WHEN description IS NOT NULL AND length(description) > 10 THEN 1 END) as has_description,
        COUNT(CASE WHEN source_url IS NOT NULL THEN 1 END) as has_source_url
      FROM exhibitions 
      GROUP BY source
      ORDER BY count DESC
    `);

    console.log('📋 소스별 데이터 품질 분석:');
    console.log(`${'소스명'.padEnd(25)}| 개수 | 제목 | 장소 | 시작일 | 종료일 | 작가 | 설명 | URL | 완성도`);
    console.log('-'.repeat(95));

    sourceStats.rows.forEach(row => {
      const fields = [row.valid_title, row.has_venue, row.has_start_date, row.has_end_date, row.has_artists, row.has_description, row.has_source_url];
      const completeness = Math.round((fields.reduce((a, b) => a + b, 0) / (row.count * 7)) * 100);

      const line = [
        row.source.padEnd(25),
        row.count.toString().padStart(4),
        row.valid_title.toString().padStart(4),
        row.has_venue.toString().padStart(4),
        row.has_start_date.toString().padStart(6),
        row.has_end_date.toString().padStart(6),
        row.has_artists.toString().padStart(4),
        row.has_description.toString().padStart(4),
        row.has_source_url.toString().padStart(3),
        `${completeness}%`.padStart(6)
      ].join(' | ');

      console.log(line);
    });

    // 3. 품질별 샘플 데이터
    console.log('\n\n🏆 최고 품질 데이터 샘플 (design_plus_verified):');
    const bestQuality = await client.query(`
      SELECT title_local, venue_name, start_date, end_date, artists, description
      FROM exhibitions 
      WHERE source = 'design_plus_verified'
      ORDER BY start_date
      LIMIT 3
    `);

    bestQuality.rows.forEach((ex, i) => {
      console.log(`${i + 1}. "${ex.title_local}" - ${ex.venue_name}`);
      console.log(`   📅 ${ex.start_date} ~ ${ex.end_date}`);
      console.log(`   🎨 ${ex.artists ? ex.artists.join(', ') : 'N/A'}`);
      console.log(`   📝 ${ex.description ? `${ex.description.substring(0, 60)}...` : 'N/A'}`);
      console.log();
    });

    // 4. 최악 품질 데이터 샘플
    console.log('💩 최악 품질 데이터 샘플 (naver_blog):');
    const worstQuality = await client.query(`
      SELECT title_local, venue_name, start_date, description
      FROM exhibitions 
      WHERE source = 'naver_blog'
      ORDER BY length(title_local)
      LIMIT 3
    `);

    worstQuality.rows.forEach((ex, i) => {
      console.log(`${i + 1}. "${ex.title_local}" - ${ex.venue_name}`);
      console.log(`   📅 ${ex.start_date}`);
      console.log(`   📝 ${ex.description ? `${ex.description.substring(0, 60)}...` : 'N/A'}`);
      console.log();
    });

    // 5. 표준화 문제점 분석
    console.log('\n⚠️  표준화 문제점 분석:');

    // 날짜 형식 문제
    const dateIssues = await client.query(`
      SELECT COUNT(*) as count
      FROM exhibitions 
      WHERE start_date = end_date AND source != 'design_plus_verified'
    `);
    console.log(`   📅 동일한 시작/종료일: ${dateIssues.rows[0].count}개 (날짜 파싱 실패)`);

    // 제목 품질 문제
    const titleIssues = await client.query(`
      SELECT COUNT(*) as count
      FROM exhibitions 
      WHERE title_local LIKE '%블로그%' OR title_local LIKE '%#%' OR length(title_local) < 5
    `);
    console.log(`   📝 부적절한 제목: ${titleIssues.rows[0].count}개 (블로그 제목 등)`);

    // 작가 정보 누락
    const artistIssues = await client.query(`
      SELECT COUNT(*) as count
      FROM exhibitions 
      WHERE artists IS NULL OR array_length(artists, 1) = 0
    `);
    console.log(`   🎨 작가 정보 누락: ${artistIssues.rows[0].count}개`);

    // 6. 권장사항
    console.log('\n\n💡 데이터 품질 개선 권장사항:');
    console.log('='.repeat(60));
    console.log('✅ 유지할 데이터: design_plus_verified, manual_curated');
    console.log('🔄 개선 필요: naver_blog (정확도 7%)');
    console.log('❌ 삭제 권장: 블로그 제목 형태의 더미 데이터');
    console.log('\n📈 표준화 우선순위:');
    console.log('1. 날짜 형식 통일 (YYYY-MM-DD)');
    console.log('2. 작가명 배열 표준화');
    console.log('3. 전시 타입 enum 정의 (solo/group/collection/special)');
    console.log('4. 설명 최소 길이 기준 (50자 이상)');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  analyzeDataQuality();
}
