// 작가 데이터 품질 분석

require('dotenv').config();
const { pool } = require('./src/config/database');

async function analyzeDataQuality() {
  try {
    // 전체 통계
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN bio IS NOT NULL AND LENGTH(bio) > 100 THEN 1 END) as with_bio,
        COUNT(CASE WHEN nationality IS NOT NULL THEN 1 END) as with_nationality,
        COUNT(CASE WHEN era IS NOT NULL THEN 1 END) as with_era,
        COUNT(CASE WHEN birth_year IS NOT NULL THEN 1 END) as with_birth,
        COUNT(CASE WHEN apt_profile IS NOT NULL THEN 1 END) as classified
      FROM artists
    `);
    
    console.log('📊 전체 작가 데이터 통계:');
    console.log('=======================');
    console.log(`전체 작가: ${stats.rows[0].total}명`);
    console.log(`Bio 있음 (100자+): ${stats.rows[0].with_bio}명`);
    console.log(`국적 있음: ${stats.rows[0].with_nationality}명`);
    console.log(`시대 있음: ${stats.rows[0].with_era}명`);
    console.log(`생년 있음: ${stats.rows[0].with_birth}명`);
    console.log(`분류됨: ${stats.rows[0].classified}명`);
    
    // 데이터 품질별 작가 예시
    const examples = await pool.query(`
      SELECT 
        name,
        nationality,
        era,
        birth_year,
        death_year,
        LENGTH(COALESCE(bio, '')) as bio_length,
        apt_profile->'primary_types'->0->>'type' as current_type
      FROM artists
      WHERE nationality IS NOT NULL 
        AND era IS NOT NULL
        AND birth_year IS NOT NULL
        AND (apt_profile IS NULL OR apt_profile->'primary_types'->0->>'type' = 'SRMC')
      ORDER BY 
        CASE 
          WHEN bio IS NOT NULL AND LENGTH(bio) > 500 THEN 3
          WHEN bio IS NOT NULL AND LENGTH(bio) > 100 THEN 2
          ELSE 1
        END DESC,
        birth_year DESC
      LIMIT 20
    `);
    
    console.log('\n🎨 데이터가 있는 작가 예시:');
    console.log('=======================');
    examples.rows.forEach((artist, idx) => {
      console.log(`\n${idx + 1}. ${artist.name}`);
      console.log(`   ${artist.nationality} | ${artist.era} | ${artist.birth_year}-${artist.death_year || '?'}`);
      console.log(`   Bio: ${artist.bio_length}자 | 현재: ${artist.current_type || '미분류'}`);
    });
    
  } catch (error) {
    console.error('오류:', error);
  } finally {
    await pool.end();
  }
}

analyzeDataQuality();