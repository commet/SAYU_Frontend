#!/usr/bin/env node
require('dotenv').config();

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function showExpandedStats() {
  const client = await pool.connect();
  
  try {
    console.log('🌍 SAYU 확장된 미술관 데이터베이스 현황');
    console.log('='.repeat(80));
    
    // 전체 통계
    const overallStats = await client.query(`
      SELECT 
        COUNT(*) as total_venues,
        COUNT(DISTINCT country) as total_countries,
        COUNT(DISTINCT city) as total_cities,
        COUNT(CASE WHEN tier = 1 THEN 1 END) as tier1,
        COUNT(CASE WHEN tier = 2 THEN 1 END) as tier2,
        COUNT(CASE WHEN tier = 3 THEN 1 END) as tier3
      FROM venues
    `);
    
    console.log('\n📊 전체 통계:');
    console.log(`   총 미술관/갤러리: ${overallStats.rows[0].total_venues}개`);
    console.log(`   총 국가: ${overallStats.rows[0].total_countries}개`);
    console.log(`   총 도시: ${overallStats.rows[0].total_cities}개`);
    console.log(`   Tier 1 (대형): ${overallStats.rows[0].tier1}개`);
    console.log(`   Tier 2 (중형): ${overallStats.rows[0].tier2}개`);
    console.log(`   Tier 3 (소형): ${overallStats.rows[0].tier3}개`);
    
    // 국가별 상세
    const countryDetails = await client.query(`
      SELECT 
        country,
        COUNT(*) as venue_count,
        COUNT(DISTINCT city) as city_count,
        STRING_AGG(DISTINCT city, ', ' ORDER BY city) as cities
      FROM venues
      GROUP BY country
      ORDER BY venue_count DESC
    `);
    
    console.log('\n\n🌏 국가별 상세 현황:');
    console.log('='.repeat(80));
    
    const countryEmojis = {
      'KR': '🇰🇷', 'US': '🇺🇸', 'GB': '🇬🇧', 'JP': '🇯🇵', 'HK': '🇭🇰',
      'CN': '🇨🇳', 'FR': '🇫🇷', 'DE': '🇩🇪', 'SG': '🇸🇬', 'IT': '🇮🇹',
      'ES': '🇪🇸', 'BR': '🇧🇷', 'CA': '🇨🇦', 'AU': '🇦🇺', 'NL': '🇳🇱',
      'MX': '🇲🇽', 'AE': '🇦🇪', 'IN': '🇮🇳', 'NZ': '🇳🇿', 'RU': '🇷🇺',
      'AT': '🇦🇹', 'AR': '🇦🇷', 'ZA': '🇿🇦', 'TH': '🇹🇭', 'EG': '🇪🇬'
    };
    
    countryDetails.rows.forEach((country, index) => {
      const emoji = countryEmojis[country.country] || '';
      console.log(`\n${index + 1}. ${emoji} ${country.country}: ${country.venue_count}개 기관, ${country.city_count}개 도시`);
      console.log(`   도시: ${country.cities}`);
    });
    
    // 한국 도시별 상세
    const koreaDetails = await client.query(`
      SELECT 
        city,
        COUNT(*) as venue_count,
        STRING_AGG(name, ', ' ORDER BY name) as venues
      FROM venues
      WHERE country = 'KR'
      GROUP BY city
      ORDER BY venue_count DESC
    `);
    
    console.log('\n\n🇰🇷 한국 도시별 상세:');
    console.log('='.repeat(80));
    
    koreaDetails.rows.forEach((city, index) => {
      console.log(`\n${index + 1}. ${city.city}: ${city.venue_count}개`);
      if (city.venue_count <= 5) {
        console.log(`   ${city.venues}`);
      } else {
        const venueList = city.venues.split(', ');
        console.log(`   ${venueList.slice(0, 5).join(', ')} ... 외 ${city.venue_count - 5}개`);
      }
    });
    
    // 주요 갤러리 체인
    const galleryChains = await client.query(`
      SELECT 
        CASE 
          WHEN name LIKE '%Gagosian%' THEN 'Gagosian'
          WHEN name LIKE '%Pace%' THEN 'Pace Gallery'
          WHEN name LIKE '%Perrotin%' THEN 'Perrotin'
          WHEN name LIKE '%White Cube%' THEN 'White Cube'
          WHEN name LIKE '%Hauser%Wirth%' THEN 'Hauser & Wirth'
          WHEN name LIKE '%갤러리현대%' THEN '갤러리현대'
          WHEN name LIKE '%국제갤러리%' THEN '국제갤러리'
          WHEN name LIKE '%페이스%' THEN '페이스갤러리'
        END as chain,
        COUNT(*) as locations,
        STRING_AGG(city || ' (' || country || ')', ', ' ORDER BY city) as cities
      FROM venues
      WHERE name LIKE ANY(ARRAY['%Gagosian%', '%Pace%', '%Perrotin%', '%White Cube%', 
                                '%Hauser%Wirth%', '%갤러리현대%', '%국제갤러리%', '%페이스%'])
      GROUP BY chain
      ORDER BY locations DESC
    `);
    
    console.log('\n\n🏢 주요 갤러리 체인:');
    console.log('='.repeat(80));
    
    galleryChains.rows.forEach(chain => {
      if (chain.chain) {
        console.log(`\n${chain.chain}: ${chain.locations}개 지점`);
        console.log(`   위치: ${chain.cities}`);
      }
    });
    
    // 전시 현황
    const exhibitionStats = await client.query(`
      SELECT 
        COUNT(*) as total_exhibitions,
        COUNT(DISTINCT venue_id) as venues_with_exhibitions,
        (SELECT COUNT(*) FROM venues) - COUNT(DISTINCT venue_id) as venues_without_exhibitions
      FROM exhibitions
    `);
    
    console.log('\n\n🎨 전시 현황:');
    console.log('='.repeat(80));
    console.log(`   총 전시: ${exhibitionStats.rows[0].total_exhibitions}개`);
    console.log(`   전시 있는 기관: ${exhibitionStats.rows[0].venues_with_exhibitions}개`);
    console.log(`   전시 없는 기관: ${exhibitionStats.rows[0].venues_without_exhibitions}개`);
    
    // 신규 추가된 주요 갤러리
    const newMajorGalleries = await client.query(`
      SELECT name, city, country, tier
      FROM venues
      WHERE created_at::date = CURRENT_DATE
        AND tier = 1
      ORDER BY name
      LIMIT 20
    `);
    
    if (newMajorGalleries.rows.length > 0) {
      console.log('\n\n✨ 오늘 추가된 주요 갤러리 (Tier 1):');
      console.log('='.repeat(80));
      
      newMajorGalleries.rows.forEach(gallery => {
        const emoji = countryEmojis[gallery.country] || '';
        console.log(`   • ${gallery.name} - ${gallery.city}, ${emoji} ${gallery.country}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  showExpandedStats();
}