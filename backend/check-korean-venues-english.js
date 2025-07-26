require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkKoreanVenuesEnglish() {
  try {
    const result = await pool.query(`
      SELECT id, name_ko, name_en, description_ko, description, city, venue_type
      FROM global_venues 
      WHERE country IN ('South Korea', 'KR')
      AND tier <= 2
      ORDER BY 
        CASE WHEN description IS NULL OR description = '' THEN 1 ELSE 0 END DESC,
        tier, city, name_ko
      LIMIT 15
    `);
    
    console.log('한국 주요 미술관 영문 설명 현황 (Tier 1-2, 상위 15개):');
    console.log('='.repeat(80));
    
    result.rows.forEach((venue, index) => {
      console.log(`${index + 1}. ID: ${venue.id}`);
      console.log(`   한글명: ${venue.name_ko}`);
      console.log(`   영문명: ${venue.name_en || '❌ 미번역'}`);
      console.log(`   도시: ${venue.city} | 유형: ${venue.venue_type}`);
      console.log(`   한글설명: ${venue.description_ko?.substring(0, 50) || '없음'}...`);
      console.log(`   영문설명: ${venue.description?.substring(0, 50) || '❌ 미번역'}...`);
      console.log('-'.repeat(60));
    });
    
    // 통계
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN description IS NOT NULL AND description != '' THEN 1 END) as has_english_desc,
        COUNT(CASE WHEN name_en IS NOT NULL AND name_en != '' THEN 1 END) as has_english_name
      FROM global_venues 
      WHERE country IN ('South Korea', 'KR')
      AND tier <= 2
    `);
    
    const stat = stats.rows[0];
    console.log(`\n📊 Tier 1-2 한국 미술관 영문 번역 현황:`);
    console.log(`총 ${stat.total}개 기관`);
    console.log(`영문명: ${stat.has_english_name}/${stat.total} (${Math.round(stat.has_english_name/stat.total*100)}%)`);
    console.log(`영문설명: ${stat.has_english_desc}/${stat.total} (${Math.round(stat.has_english_desc/stat.total*100)}%)`);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkKoreanVenuesEnglish();