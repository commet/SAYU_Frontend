const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// 정말 유명한데 누락되었을 수 있는 작가들
const famousArtists = [
  // 고전 거장
  'Caravaggio', 'Raphael', 'Botticelli', 'El Greco', 'Diego Velázquez',
  'Jean-Auguste-Dominique Ingres', 'Eugène Delacroix', 'Théodore Géricault',
  'Jacques-Louis David', 'Nicolas Poussin', 'Giovanni Bellini',

  // 인상주의/후기인상주의
  'Édouard Manet', 'Berthe Morisot', 'Mary Cassatt', 'Gustave Caillebotte',
  'Alfred Sisley', 'Camille Pissarro', 'Paul Signac', 'Henri de Toulouse-Lautrec',

  // 현대 거장
  'Jean-Michel Basquiat', 'Frida Kahlo', 'Georgia O\'Keeffe', 'Edward Hopper',
  'Grant Wood', 'Andrew Wyeth', 'Norman Rockwell', 'Lucian Freud',
  'David Hockney', 'Gerhard Richter', 'Anselm Kiefer', 'Cy Twombly',

  // 조각가
  'Auguste Rodin', 'Constantin Brâncuși', 'Alexander Calder', 'Louise Bourgeois',
  'Barbara Hepworth', 'Isamu Noguchi', 'Richard Serra', 'Jeff Koons',

  // 사진/뉴미디어
  'Ansel Adams', 'Diane Arbus', 'Robert Mapplethorpe', 'Cindy Sherman',
  'Andreas Gursky', 'Bill Viola', 'Nam June Paik',

  // 아시아 거장
  'Hokusai', 'Hiroshige', 'Yayoi Kusama', 'Takashi Murakami',
  'Lee Ufan', 'Kim Whanki', 'Park Seo-bo', 'Lee Bul',

  // 거리 예술/현대
  'Jean-Michel Basquiat', 'Keith Haring', 'KAWS', 'Shepard Fairey',
  'Damien Hirst', 'Tracey Emin', 'Antony Gormley'
];

async function checkMissingFamousArtists() {
  try {
    console.log('🔍 유명 작가 누락 확인\n');

    const missing = [];
    const found = [];
    const lowImportance = [];

    for (const artistName of famousArtists) {
      // 여러 변형으로 검색
      const result = await pool.query(`
        SELECT 
          name, 
          importance_score,
          apt_profile IS NOT NULL as has_apt,
          apt_profile->'primary_types' as primary_types
        FROM artists 
        WHERE 
          LOWER(name) LIKE LOWER($1) OR
          LOWER(name) LIKE LOWER($2) OR
          LOWER(name) LIKE LOWER($3)
        LIMIT 1
      `, [`%${artistName}%`, `${artistName}%`, `%${artistName}`]);

      if (result.rows.length === 0) {
        missing.push(artistName);
      } else {
        const artist = result.rows[0];
        const aptCount = artist.primary_types ?
          (Array.isArray(artist.primary_types) ? artist.primary_types.length : 1) : 0;

        found.push({
          searchName: artistName,
          dbName: artist.name,
          importance: artist.importance_score,
          hasAPT: artist.has_apt,
          aptCount
        });

        if (artist.importance_score < 90) {
          lowImportance.push(artist);
        }
      }
    }

    // 결과 출력
    console.log(`📊 검색 결과: ${famousArtists.length}명 중\n`);
    console.log(`✅ DB에 있음: ${found.length}명`);
    console.log(`❌ 누락: ${missing.length}명`);
    console.log(`⚠️ 중요도 90 미만: ${lowImportance.length}명\n`);

    if (missing.length > 0) {
      console.log('❌ 누락된 유명 작가들:');
      missing.forEach((name, idx) => {
        console.log(`  ${idx + 1}. ${name}`);
      });
    }

    // APT 개수 확인
    console.log('\n📈 APT 설정 현황:');
    const aptStats = {
      0: 0,
      1: 0,
      2: 0,
      3: 0,
      'more': 0
    };

    found.forEach(artist => {
      if (artist.aptCount === 0) aptStats[0]++;
      else if (artist.aptCount === 1) aptStats[1]++;
      else if (artist.aptCount === 2) aptStats[2]++;
      else if (artist.aptCount === 3) aptStats[3]++;
      else aptStats['more']++;
    });

    console.log(`  APT 없음: ${aptStats[0]}명`);
    console.log(`  APT 1개: ${aptStats[1]}명`);
    console.log(`  APT 2개: ${aptStats[2]}명`);
    console.log(`  APT 3개: ${aptStats[3]}명`);
    if (aptStats['more'] > 0) {
      console.log(`  APT 3개 이상: ${aptStats['more']}명`);
    }

    // 중요도 낮은 유명 작가들
    if (lowImportance.length > 0) {
      console.log('\n⚠️ 중요도 재평가 필요 (90점 미만):');
      lowImportance.forEach((artist, idx) => {
        console.log(`  ${idx + 1}. ${artist.name} (현재: ${artist.importance_score})`);
      });
    }

    // 실제 APT 구조 샘플
    const sampleResult = await pool.query(`
      SELECT name, apt_profile
      FROM artists
      WHERE apt_profile IS NOT NULL
      AND apt_profile->'primary_types' IS NOT NULL
      LIMIT 3
    `);

    console.log('\n📋 APT 구조 샘플:');
    sampleResult.rows.forEach(artist => {
      const types = artist.apt_profile.primary_types;
      console.log(`\n${artist.name}:`);
      console.log(`  primary_types 개수: ${types.length}`);
      types.forEach((type, idx) => {
        console.log(`  ${idx + 1}. ${type.type} - ${type.title_ko} (${type.animal})`);
      });
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkMissingFamousArtists();
