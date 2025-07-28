const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function checkArtistStats() {
  try {
    // 전체 작가 수
    const totalResult = await pool.query('SELECT COUNT(*) as total FROM artists');
    console.log('=== 작가 데이터베이스 통계 ===\n');
    console.log('전체 작가 수:', totalResult.rows[0].total);

    // Wikipedia 정보가 있는 작가
    const withBioResult = await pool.query(`
      SELECT COUNT(*) as count 
      FROM artists 
      WHERE bio IS NOT NULL AND bio != '' 
        AND LENGTH(bio) > 100
    `);
    console.log('전기 정보 있는 작가 (100자+):', withBioResult.rows[0].count);

    // 풍부한 정보를 가진 작가
    const richBioResult = await pool.query(`
      SELECT COUNT(*) as count 
      FROM artists 
      WHERE bio IS NOT NULL 
        AND LENGTH(bio) > 1000
    `);
    console.log('풍부한 전기 정보 (1000자+):', richBioResult.rows[0].count);

    // 매우 풍부한 정보
    const veryRichBioResult = await pool.query(`
      SELECT COUNT(*) as count 
      FROM artists 
      WHERE bio IS NOT NULL 
        AND LENGTH(bio) > 5000
    `);
    console.log('매우 풍부한 전기 정보 (5000자+):', veryRichBioResult.rows[0].count);

    // 생몰년 정보가 있는 작가
    const withDatesResult = await pool.query(`
      SELECT COUNT(*) as count 
      FROM artists 
      WHERE birth_year IS NOT NULL
    `);
    console.log('생년 정보 있는 작가:', withDatesResult.rows[0].count);

    // 국적 정보가 있는 작가
    const withNationalityResult = await pool.query(`
      SELECT COUNT(*) as count 
      FROM artists 
      WHERE nationality IS NOT NULL AND nationality != ''
    `);
    console.log('국적 정보 있는 작가:', withNationalityResult.rows[0].count);

    // 작품이 있는 작가
    const withArtworksResult = await pool.query(`
      SELECT COUNT(DISTINCT a.id) as count
      FROM artists a
      WHERE EXISTS (
        SELECT 1 FROM artworks aw WHERE aw.artist_id = a.id
      )
    `);
    console.log('작품 정보 있는 작가:', withArtworksResult.rows[0].count);

    // Wikipedia 수집 상태
    const wikipediaStatus = await pool.query(`
      SELECT 
        COUNT(CASE WHEN sources::text LIKE '%wikipedia%' THEN 1 END) as wikipedia_collected,
        COUNT(CASE WHEN sources IS NULL OR sources = '{}' THEN 1 END) as no_sources
      FROM artists
    `);
    console.log('\nWikipedia 수집 상태:');
    console.log('- Wikipedia 수집됨:', wikipediaStatus.rows[0].wikipedia_collected);
    console.log('- 소스 정보 없음:', wikipediaStatus.rows[0].no_sources);

    // 상위 작가 샘플
    const topArtistsResult = await pool.query(`
      SELECT 
        name, 
        LENGTH(bio) as bio_length,
        birth_year,
        death_year,
        nationality,
        era
      FROM artists 
      WHERE bio IS NOT NULL AND bio != ''
      ORDER BY LENGTH(bio) DESC
      LIMIT 20
    `);

    console.log('\n=== 상위 20명 작가 (bio 길이순) ===');
    topArtistsResult.rows.forEach((artist, idx) => {
      console.log(`${idx + 1}. ${artist.name}`);
      console.log(`   - 전기: ${artist.bio_length}자`);
      console.log(`   - 생몰: ${artist.birth_year || '?'}-${artist.death_year || '?'}`);
      console.log(`   - 국적: ${artist.nationality || '?'}`);
      console.log(`   - 시대: ${artist.era || '?'}\n`);
    });

    // 국적별 분포
    const nationalityDist = await pool.query(`
      SELECT nationality, COUNT(*) as count
      FROM artists
      WHERE nationality IS NOT NULL AND nationality != ''
      GROUP BY nationality
      ORDER BY count DESC
      LIMIT 10
    `);

    console.log('=== 국적별 분포 (상위 10개) ===');
    nationalityDist.rows.forEach(row => {
      console.log(`${row.nationality}: ${row.count}명`);
    });

    // 시대별 분포
    const eraDist = await pool.query(`
      SELECT era, COUNT(*) as count
      FROM artists
      WHERE era IS NOT NULL AND era != ''
      GROUP BY era
      ORDER BY count DESC
    `);

    console.log('\n=== 시대별 분포 ===');
    eraDist.rows.forEach(row => {
      console.log(`${row.era}: ${row.count}명`);
    });

    await pool.end();

  } catch (error) {
    console.error('Error:', error);
    await pool.end();
    process.exit(1);
  }
}

checkArtistStats();
