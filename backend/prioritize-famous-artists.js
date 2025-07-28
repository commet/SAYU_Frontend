const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function prioritizeFamousArtists() {
  try {
    console.log('⭐ 유명 아티스트 우선 매핑 전략\n');

    // 1. 이미 매핑된 유명 아티스트들
    const mappedFamous = await pool.query(`
      SELECT name, apt_profile->'primary_types'->0->>'type' as apt_type, follow_count
      FROM artists 
      WHERE apt_profile IS NOT NULL
        AND (name ILIKE '%van gogh%' OR name ILIKE '%picasso%' OR name ILIKE '%monet%' OR 
             name ILIKE '%da vinci%' OR name ILIKE '%raphael%' OR name ILIKE '%michelangelo%' OR
             name ILIKE '%rembrandt%' OR name ILIKE '%cezanne%' OR name ILIKE '%renoir%')
      ORDER BY follow_count DESC
    `);

    console.log('✅ 이미 매핑된 유명 아티스트:');
    mappedFamous.rows.forEach(artist => {
      console.log(`  ${artist.name}: ${artist.apt_type} (팔로워: ${artist.follow_count})`);
    });

    // 2. 매핑이 안된 유명 아티스트들 찾기
    const unmappedFamous = await pool.query(`
      SELECT name, name_ko, nationality, birth_year, death_year, follow_count, bio
      FROM artists 
      WHERE apt_profile IS NULL
        AND (name ILIKE '%van gogh%' OR name ILIKE '%picasso%' OR name ILIKE '%monet%' OR 
             name ILIKE '%da vinci%' OR name ILIKE '%raphael%' OR name ILIKE '%michelangelo%' OR
             name ILIKE '%rembrandt%' OR name ILIKE '%cezanne%' OR name ILIKE '%renoir%' OR
             name ILIKE '%matisse%' OR name ILIKE '%degas%' OR name ILIKE '%manet%' OR
             name ILIKE '%gaugin%' OR name ILIKE '%pollock%' OR name ILIKE '%warhol%' OR
             follow_count > 100)
      ORDER BY follow_count DESC NULLS LAST
      LIMIT 20
    `);

    console.log('\n🎯 우선 매핑 필요한 유명 아티스트:');
    unmappedFamous.rows.forEach((artist, idx) => {
      console.log(`  [${idx + 1}] ${artist.name} (팔로워: ${artist.follow_count || 0}, ${artist.nationality || '?'}, ${artist.birth_year || '?'})`);
    });

    // 3. 16가지 동물 유형별 대표 아티스트 필요
    const animalTypes = [
      'wolf', 'fox', 'bear', 'deer', 'rabbit', 'cat', 'dog', 'horse',
      'eagle', 'owl', 'dove', 'peacock', 'lion', 'tiger', 'elephant', 'whale'
    ];

    console.log('\n🐾 16가지 동물 유형별 대표 아티스트 전략:');
    console.log('각 유형별로 최소 2-3명의 유명 아티스트 배정 필요');
    console.log('예시:');
    console.log('  Wolf (독립적 리더): Van Gogh, Picasso');
    console.log('  Eagle (집중형 완벽주의): Leonardo da Vinci, Michelangelo');
    console.log('  Fox (영리한 적응형): Matisse, Warhol');
    console.log('  Bear (신중한 보호형): Rembrandt, Cezanne');

    // 4. 현재 분포의 편중 문제
    const currentTypes = await pool.query(`
      SELECT 
        apt_profile->'primary_types'->0->>'type' as apt_code,
        COUNT(*) as count,
        STRING_AGG(name, ', ') as artists
      FROM artists 
      WHERE apt_profile IS NOT NULL
      GROUP BY apt_profile->'primary_types'->0->>'type'
      ORDER BY count DESC
    `);

    console.log('\n⚖️ 현재 분포의 편중 상황:');
    currentTypes.rows.forEach(type => {
      console.log(`  ${type.apt_code}: ${type.count}명`);
      console.log(`    ${type.artists.substring(0, 100)}${type.artists.length > 100 ? '...' : ''}`);
    });

    console.log('\n📋 다음 단계 추천:');
    console.log('1. 유명 아티스트 20명 우선 매핑');
    console.log('2. 16가지 동물 유형 변환 로직 구현');
    console.log('3. 각 동물 유형별 균형 맞추기');
    console.log('4. 사용자 노출 시 유명도 가중치 적용');

    return {
      mappedFamous: mappedFamous.rows,
      unmappedFamous: unmappedFamous.rows,
      currentDistribution: currentTypes.rows
    };

  } catch (error) {
    console.error('❌ 오류:', error.message);
  } finally {
    await pool.end();
  }
}

prioritizeFamousArtists();
