#!/usr/bin/env node
require('dotenv').config();

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function showAllMuseumsAndExhibitions() {
  const client = await pool.connect();
  
  try {
    // 1. 전체 통계
    const overallStats = await client.query(`
      SELECT 
        COUNT(DISTINCT venue_name) as total_venues,
        COUNT(DISTINCT venue_country) as total_countries,
        COUNT(*) as total_exhibitions,
        COUNT(CASE WHEN status = 'current' THEN 1 END) as current,
        COUNT(CASE WHEN status = 'upcoming' THEN 1 END) as upcoming,
        COUNT(CASE WHEN status = 'past' THEN 1 END) as past
      FROM exhibitions
    `);

    console.log('🌍 SAYU 전시 데이터베이스 전체 현황');
    console.log('='.repeat(80));
    console.log(`\n📊 전체 통계:`);
    console.log(`   총 미술관/갤러리: ${overallStats.rows[0].total_venues}개`);
    console.log(`   총 국가: ${overallStats.rows[0].total_countries}개`);
    console.log(`   총 전시: ${overallStats.rows[0].total_exhibitions}개`);
    console.log(`   - 진행중: ${overallStats.rows[0].current}개`);
    console.log(`   - 예정: ${overallStats.rows[0].upcoming}개`);
    console.log(`   - 종료: ${overallStats.rows[0].past}개\n`);

    // 2. 국가별 미술관 목록
    const venuesByCountry = await client.query(`
      SELECT 
        venue_country,
        venue_name,
        venue_city,
        COUNT(*) as exhibition_count
      FROM exhibitions
      GROUP BY venue_country, venue_name, venue_city
      ORDER BY venue_country, venue_name
    `);

    console.log('\n🏛️ 국가별 미술관/갤러리 목록');
    console.log('='.repeat(80));

    let currentCountry = '';
    let countryVenueCount = 0;
    let countryExhibitionCount = 0;
    const countryNames = {
      'KR': '🇰🇷 한국',
      'US': '🇺🇸 미국',
      'GB': '🇬🇧 영국',
      'FR': '🇫🇷 프랑스',
      'DE': '🇩🇪 독일',
      'IT': '🇮🇹 이탈리아',
      'ES': '🇪🇸 스페인',
      'JP': '🇯🇵 일본',
      'CN': '🇨🇳 중국',
      'HK': '🇭🇰 홍콩',
      'SG': '🇸🇬 싱가포르',
      'IN': '🇮🇳 인도',
      'TH': '🇹🇭 태국',
      'CA': '🇨🇦 캐나다',
      'AU': '🇦🇺 호주',
      'NZ': '🇳🇿 뉴질랜드',
      'BR': '🇧🇷 브라질',
      'AR': '🇦🇷 아르헨티나',
      'MX': '🇲🇽 멕시코',
      'NL': '🇳🇱 네덜란드',
      'RU': '🇷🇺 러시아',
      'AE': '🇦🇪 UAE',
      'EG': '🇪🇬 이집트',
      'ZA': '🇿🇦 남아프리카',
      'AT': '🇦🇹 오스트리아'
    };

    venuesByCountry.rows.forEach(venue => {
      if (venue.venue_country !== currentCountry) {
        if (currentCountry !== '') {
          console.log(`   └─ 소계: ${countryVenueCount}개 기관, ${countryExhibitionCount}개 전시\n`);
        }
        currentCountry = venue.venue_country;
        countryVenueCount = 0;
        countryExhibitionCount = 0;
        console.log(`\n${countryNames[venue.venue_country] || venue.venue_country}`);
      }
      console.log(`   • ${venue.venue_name} (${venue.venue_city}) - ${venue.exhibition_count}개 전시`);
      countryVenueCount++;
      countryExhibitionCount += parseInt(venue.exhibition_count);
    });
    if (currentCountry !== '') {
      console.log(`   └─ 소계: ${countryVenueCount}개 기관, ${countryExhibitionCount}개 전시`);
    }

    // 3. 현재 진행중인 전시 목록
    const currentExhibitions = await client.query(`
      SELECT 
        title_en,
        title_local,
        venue_name,
        venue_city,
        venue_country,
        start_date,
        end_date,
        description
      FROM exhibitions
      WHERE status = 'current'
      ORDER BY venue_country, start_date DESC
    `);

    console.log('\n\n🎨 현재 진행중인 전시 목록');
    console.log('='.repeat(80));

    currentCountry = '';
    currentExhibitions.rows.forEach((exhibition, index) => {
      if (exhibition.venue_country !== currentCountry) {
        currentCountry = exhibition.venue_country;
        console.log(`\n${countryNames[exhibition.venue_country] || exhibition.venue_country}`);
        console.log('-'.repeat(40));
      }
      
      console.log(`\n${index + 1}. ${exhibition.title_en}`);
      if (exhibition.title_local && exhibition.title_local !== exhibition.title_en) {
        console.log(`   (${exhibition.title_local})`);
      }
      console.log(`   📍 ${exhibition.venue_name}, ${exhibition.venue_city}`);
      console.log(`   📅 ${new Date(exhibition.start_date).toLocaleDateString('ko-KR')} ~ ${new Date(exhibition.end_date).toLocaleDateString('ko-KR')}`);
      if (exhibition.description) {
        console.log(`   📝 ${exhibition.description.substring(0, 100)}...`);
      }
    });

    // 4. 예정된 전시 목록 (2025년)
    const upcomingExhibitions = await client.query(`
      SELECT 
        title_en,
        title_local,
        venue_name,
        venue_city,
        venue_country,
        start_date,
        end_date,
        description
      FROM exhibitions
      WHERE status = 'upcoming'
      ORDER BY start_date, venue_country
      LIMIT 20
    `);

    console.log('\n\n🔮 예정된 전시 목록 (상위 20개)');
    console.log('='.repeat(80));

    upcomingExhibitions.rows.forEach((exhibition, index) => {
      console.log(`\n${index + 1}. ${exhibition.title_en}`);
      if (exhibition.title_local && exhibition.title_local !== exhibition.title_en) {
        console.log(`   (${exhibition.title_local})`);
      }
      console.log(`   📍 ${exhibition.venue_name}, ${exhibition.venue_city}, ${countryNames[exhibition.venue_country] || exhibition.venue_country}`);
      console.log(`   📅 ${new Date(exhibition.start_date).toLocaleDateString('ko-KR')} ~ ${new Date(exhibition.end_date).toLocaleDateString('ko-KR')}`);
    });

    // 5. 소스별 통계
    const sourceStats = await client.query(`
      SELECT 
        source,
        COUNT(*) as count
      FROM exhibitions
      GROUP BY source
      ORDER BY count DESC
    `);

    console.log('\n\n📡 데이터 소스별 통계');
    console.log('='.repeat(80));
    sourceStats.rows.forEach(source => {
      console.log(`   ${source.source}: ${source.count}개`);
    });

    // 6. 주요 도시별 전시 수
    const cityStats = await client.query(`
      SELECT 
        venue_city,
        venue_country,
        COUNT(DISTINCT venue_name) as venue_count,
        COUNT(*) as exhibition_count
      FROM exhibitions
      GROUP BY venue_city, venue_country
      HAVING COUNT(*) >= 3
      ORDER BY exhibition_count DESC
      LIMIT 15
    `);

    console.log('\n\n🏙️ 주요 도시별 전시 현황 (전시 3개 이상)');
    console.log('='.repeat(80));
    cityStats.rows.forEach((city, index) => {
      console.log(`${index + 1}. ${city.venue_city}, ${countryNames[city.venue_country] || city.venue_country}`);
      console.log(`   - ${city.venue_count}개 기관, ${city.exhibition_count}개 전시`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  showAllMuseumsAndExhibitions();
}