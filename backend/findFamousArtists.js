// 정보가 풍부한 유명 작가 찾기

require('dotenv').config();
const { pool } = require('./src/config/database');

async function findFamousArtists() {
  try {
    const result = await pool.query(`
      SELECT 
        name,
        nationality,
        era,
        birth_year,
        death_year,
        LENGTH(COALESCE(bio, '')) as bio_length,
        apt_profile->'primary_types'->0->>'type' as current_type,
        CASE 
          WHEN name LIKE '%Vincent van Gogh%' THEN 5000
          WHEN name LIKE '%Pablo Picasso%' THEN 4900
          WHEN name LIKE '%Claude Monet%' THEN 4800
          WHEN name LIKE '%Rembrandt%' THEN 4700
          WHEN name LIKE '%Leonardo da Vinci%' THEN 4600
          WHEN name LIKE '%Michelangelo%' THEN 4500
          WHEN name LIKE '%Salvador Dal%' THEN 4400
          WHEN name LIKE '%Frida Kahlo%' THEN 4300
          WHEN name LIKE '%Jackson Pollock%' THEN 4200
          WHEN name LIKE '%Wassily Kandinsky%' THEN 4100
          WHEN name LIKE '%Paul C%zanne%' THEN 4000
          WHEN name LIKE '%Henri Matisse%' THEN 3900
          WHEN name LIKE '%Edgar Degas%' THEN 3800
          WHEN name LIKE '%Paul Gauguin%' THEN 3700
          WHEN name LIKE '%Francisco Goya%' THEN 3600
          WHEN bio LIKE '%Wikipedia%' THEN 3000
          WHEN LENGTH(COALESCE(bio, '')) > 1000 THEN 2000
          ELSE LENGTH(COALESCE(bio, ''))
        END as fame_score
      FROM artists
      WHERE (apt_profile IS NULL OR apt_profile->'primary_types'->0->>'type' = 'SRMC')
        AND NOT (name LIKE '%Attributed%' OR name LIKE '%Workshop%' OR name LIKE '%After%')
      ORDER BY fame_score DESC
      LIMIT 30
    `);
    
    console.log('🌟 정보가 풍부한 유명 작가들');
    console.log('=====================================\n');
    
    let famousFound = 0;
    let bioRichFound = 0;
    let metadataFound = 0;
    
    result.rows.forEach((artist, idx) => {
      if (artist.fame_score >= 3000) famousFound++;
      else if (artist.bio_length >= 500) bioRichFound++;
      else if (artist.nationality && artist.era) metadataFound++;
      
      console.log(`${idx + 1}. ${artist.name}`);
      console.log(`   ${artist.nationality || '국적불명'} | ${artist.era || '시대불명'} | ${artist.birth_year || '?'}-${artist.death_year || '?'}`);
      console.log(`   Bio: ${artist.bio_length}자 | 현재: ${artist.current_type || '미분류'}`);
      console.log('');
    });
    
    console.log('\n📊 요약:');
    console.log(`   유명 작가: ${famousFound}명`);
    console.log(`   풍부한 전기: ${bioRichFound}명`);
    console.log(`   메타데이터 있음: ${metadataFound}명`);
    
  } catch (error) {
    console.error('오류:', error);
  } finally {
    await pool.end();
  }
}

findFamousArtists();