const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function showExhibitionsByCategory() {
  try {
    console.log('\n📊 SAYU 전시 데이터베이스 카테고리별 요약\n');
    console.log('=' .repeat(80));

    // 1. 국가별 분포
    console.log('\n🌍 국가별 전시 분포:\n');
    const countryStats = await pool.query(`
      SELECT 
        venue_country,
        COUNT(*) as count,
        STRING_AGG(DISTINCT venue_city, ', ') as cities
      FROM exhibitions
      GROUP BY venue_country
      ORDER BY count DESC
    `);

    countryStats.rows.forEach(stat => {
      console.log(`${stat.venue_country}: ${stat.count}개 전시`);
      console.log(`  도시: ${stat.cities}`);
    });

    // 2. 주요 미술관별
    console.log('\n🏛️  주요 기관별 전시 (3개 이상):\n');
    const venueStats = await pool.query(`
      SELECT venue_name, venue_city, COUNT(*) as count
      FROM exhibitions
      GROUP BY venue_name, venue_city
      HAVING COUNT(*) >= 3
      ORDER BY count DESC
    `);

    venueStats.rows.forEach(stat => {
      console.log(`${stat.venue_name} (${stat.venue_city}): ${stat.count}개`);
    });

    // 3. 전시 유형별
    console.log('\n🎨 전시 유형별 분포:\n');
    const typeStats = await pool.query(`
      SELECT exhibition_type, COUNT(*) as count
      FROM exhibitions
      WHERE exhibition_type IS NOT NULL
      GROUP BY exhibition_type
      ORDER BY count DESC
    `);

    typeStats.rows.forEach(stat => {
      console.log(`${stat.exhibition_type}: ${stat.count}개`);
    });

    // 4. 2025년 주요 비엔날레/특별전
    console.log('\n🌟 2025년 주요 비엔날레 및 특별전:\n');
    const biennales = await pool.query(`
      SELECT title_local, venue_name, venue_city, start_date
      FROM exhibitions
      WHERE exhibition_type IN ('biennale', 'triennale', 'art fair')
      AND start_date >= '2025-01-01'
      ORDER BY start_date
    `);

    biennales.rows.forEach(ex => {
      const date = new Date(ex.start_date).toLocaleDateString('ko-KR');
      console.log(`• ${ex.title_local}`);
      console.log(`  @ ${ex.venue_name}, ${ex.venue_city} (${date})`);
    });

    // 5. 블록버스터 전시 (유명 작가)
    console.log('\n⭐ 주요 작가 전시:\n');
    const famousArtists = await pool.query(`
      SELECT title_local, venue_name, venue_city, start_date, status
      FROM exhibitions
      WHERE 
        title_local LIKE '%쿠사마%' OR title_local LIKE '%Kusama%' OR
        title_local LIKE '%호크니%' OR title_local LIKE '%Hockney%' OR
        title_local LIKE '%이우환%' OR title_local LIKE '%Lee Ufan%' OR
        title_local LIKE '%뱅크시%' OR title_local LIKE '%Banksy%' OR
        title_local LIKE '%팀랩%' OR title_local LIKE '%teamLab%' OR
        title_local LIKE '%반 고흐%' OR title_local LIKE '%Van Gogh%' OR
        title_local LIKE '%모네%' OR title_local LIKE '%Monet%'
      ORDER BY start_date
    `);

    famousArtists.rows.forEach(ex => {
      const date = ex.start_date ? new Date(ex.start_date).toLocaleDateString('ko-KR') : 'N/A';
      console.log(`• ${ex.title_local} [${ex.status}]`);
      console.log(`  @ ${ex.venue_name}, ${ex.venue_city} (${date})`);
    });

    // 6. 한국 주요 미술관 전시
    console.log('\n🇰🇷 한국 주요 미술관 현재/예정 전시:\n');
    const koreanMajorVenues = await pool.query(`
      SELECT title_local, venue_name, start_date, end_date, status
      FROM exhibitions
      WHERE venue_country = 'KR'
      AND venue_name IN (
        '국립현대미술관', '국립현대미술관 서울', '서울시립미술관', 
        '리움미술관', '아모레퍼시픽미술관', '대림미술관',
        '부산시립미술관', '광주시립미술관', '대구미술관',
        '국제갤러리', '갤러리현대', 'PKM갤러리'
      )
      AND status IN ('ongoing', 'upcoming')
      ORDER BY venue_name, start_date
    `);

    let currentVenue = '';
    koreanMajorVenues.rows.forEach(ex => {
      if (currentVenue !== ex.venue_name) {
        console.log(`\n[${ex.venue_name}]`);
        currentVenue = ex.venue_name;
      }
      const start = ex.start_date ? new Date(ex.start_date).toLocaleDateString('ko-KR') : 'N/A';
      const end = ex.end_date ? new Date(ex.end_date).toLocaleDateString('ko-KR') : 'N/A';
      console.log(`• ${ex.title_local} (${start} ~ ${end})`);
    });

    // 7. 해외 주요 미술관 전시
    console.log('\n\n🌐 해외 주요 미술관 현재/예정 전시:\n');
    const internationalMajorVenues = await pool.query(`
      SELECT title_en, venue_name, venue_city, start_date, status
      FROM exhibitions
      WHERE venue_country != 'KR'
      AND venue_name IN (
        'Museum of Modern Art', 'Tate Modern', 'Centre Pompidou',
        'The Metropolitan Museum of Art', 'Solomon R. Guggenheim Museum',
        'National Gallery', 'Gagosian Gallery', 'David Zwirner'
      )
      AND status IN ('ongoing', 'upcoming')
      ORDER BY venue_name, start_date
      LIMIT 20
    `);

    currentVenue = '';
    internationalMajorVenues.rows.forEach(ex => {
      if (currentVenue !== ex.venue_name) {
        console.log(`\n[${ex.venue_name}, ${ex.venue_city}]`);
        currentVenue = ex.venue_name;
      }
      const date = ex.start_date ? new Date(ex.start_date).toLocaleDateString('ko-KR') : 'N/A';
      console.log(`• ${ex.title_en} (${date})`);
    });

    console.log(`\n${'=' .repeat(80)}\n`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

showExhibitionsByCategory();
