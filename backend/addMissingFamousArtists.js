const { Pool } = require('pg');
const ThreeAPTGenerator = require('./generateThreeAPTProfiles');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// 누락된 유명 작가들 데이터
const missingFamousArtists = [
  {
    name: 'Grant Wood',
    nationality: 'American',
    birth_year: 1891,
    death_year: 1942,
    importance_score: 91,
    primaryAPT: 'LREC'
  },
  {
    name: 'Andrew Wyeth',
    nationality: 'American',
    birth_year: 1917,
    death_year: 2009,
    importance_score: 92,
    primaryAPT: 'LREF'
  },
  {
    name: 'Norman Rockwell',
    nationality: 'American',
    birth_year: 1894,
    death_year: 1978,
    importance_score: 90,
    primaryAPT: 'SREC'
  },
  {
    name: 'Cy Twombly',
    nationality: 'American',
    birth_year: 1928,
    death_year: 2011,
    importance_score: 93,
    primaryAPT: 'LAEF'
  },
  {
    name: 'Constantin Brâncuși',
    nationality: 'Romanian',
    birth_year: 1876,
    death_year: 1957,
    importance_score: 94,
    primaryAPT: 'LRMC'
  },
  {
    name: 'Alexander Calder',
    nationality: 'American',
    birth_year: 1898,
    death_year: 1976,
    importance_score: 92,
    primaryAPT: 'SAEF'
  },
  {
    name: 'Barbara Hepworth',
    nationality: 'British',
    birth_year: 1903,
    death_year: 1975,
    importance_score: 91,
    primaryAPT: 'LRMF'
  },
  {
    name: 'Isamu Noguchi',
    nationality: 'Japanese-American',
    birth_year: 1904,
    death_year: 1988,
    importance_score: 91,
    primaryAPT: 'SRMC'
  },
  {
    name: 'Richard Serra',
    nationality: 'American',
    birth_year: 1938,
    death_year: null,
    importance_score: 92,
    primaryAPT: 'LRMC'
  },
  {
    name: 'Ansel Adams',
    nationality: 'American',
    birth_year: 1902,
    death_year: 1984,
    importance_score: 93,
    primaryAPT: 'LREF'
  },
  {
    name: 'Diane Arbus',
    nationality: 'American',
    birth_year: 1923,
    death_year: 1971,
    importance_score: 91,
    primaryAPT: 'LAEF'
  },
  {
    name: 'Robert Mapplethorpe',
    nationality: 'American',
    birth_year: 1946,
    death_year: 1989,
    importance_score: 90,
    primaryAPT: 'LREC'
  },
  {
    name: 'Bill Viola',
    nationality: 'American',
    birth_year: 1951,
    death_year: null,
    importance_score: 91,
    primaryAPT: 'SAMF'
  },
  {
    name: 'Kim Whanki',
    nationality: 'Korean',
    birth_year: 1913,
    death_year: 1974,
    importance_score: 92,
    primaryAPT: 'LAEF'
  },
  {
    name: 'Park Seo-bo',
    nationality: 'Korean',
    birth_year: 1931,
    death_year: null,
    importance_score: 91,
    primaryAPT: 'LRMC'
  },
  {
    name: 'Lee Bul',
    nationality: 'Korean',
    birth_year: 1964,
    death_year: null,
    importance_score: 90,
    primaryAPT: 'SAMF'
  },
  {
    name: 'Shepard Fairey',
    nationality: 'American',
    birth_year: 1970,
    death_year: null,
    importance_score: 90,
    primaryAPT: 'SAMC'
  },
  {
    name: 'Tracey Emin',
    nationality: 'British',
    birth_year: 1963,
    death_year: null,
    importance_score: 90,
    primaryAPT: 'LAEF'
  },
  {
    name: 'Antony Gormley',
    nationality: 'British',
    birth_year: 1950,
    death_year: null,
    importance_score: 91,
    primaryAPT: 'LRMC'
  }
];

// 중요도 재평가 대상
const importanceUpdates = [
  { name: 'Sandro Botticelli', newScore: 95 },
  { name: 'El Greco', newScore: 95 },
  { name: 'Jean-Auguste-Dominique Ingres', newScore: 94 },
  { name: 'Théodore Géricault', newScore: 92 },
  { name: 'Jacques-Louis David', newScore: 94 },
  { name: 'Giovanni Bellini', newScore: 92 },
  { name: 'Berthe Morisot', newScore: 91 },
  { name: 'Mary Cassatt', newScore: 91 },
  { name: 'Gustave Caillebotte', newScore: 90 },
  { name: 'Alfred Sisley', newScore: 90 },
  { name: 'Paul Signac', newScore: 90 },
  { name: 'Jean-Michel Basquiat', newScore: 93 },
  { name: 'Frida Kahlo', newScore: 94 },
  { name: 'Georgia O\'Keeffe', newScore: 92 },
  { name: 'Lucian Freud', newScore: 92 },
  { name: 'David Hockney', newScore: 93 },
  { name: 'Gerhard Richter', newScore: 93 },
  { name: 'Anselm Kiefer', newScore: 91 },
  { name: 'Louise Bourgeois', newScore: 92 },
  { name: 'Jeff Koons', newScore: 90 },
  { name: 'Cindy Sherman', newScore: 92 },
  { name: 'Andreas Gursky', newScore: 90 },
  { name: 'Nam June Paik', newScore: 93 },
  { name: 'Katsushika Hokusai', newScore: 95 },
  { name: 'Utagawa Hiroshige', newScore: 92 },
  { name: 'Yayoi Kusama', newScore: 94 },
  { name: 'Takashi Murakami', newScore: 91 },
  { name: 'Lee Ufan', newScore: 90 },
  { name: 'Keith Haring', newScore: 92 },
  { name: 'KAWS', newScore: 90 },
  { name: 'Damien Hirst', newScore: 91 }
];

async function addMissingFamousArtists() {
  const generator = new ThreeAPTGenerator();

  try {
    console.log('🎨 누락된 유명 작가 추가 시작!\n');

    let added = 0;
    let failed = 0;

    // 1. 누락된 작가들 추가
    for (const artist of missingFamousArtists) {
      try {
        // 이미 존재하는지 확인
        const existsResult = await pool.query(
          'SELECT id FROM artists WHERE LOWER(name) LIKE LOWER($1)',
          [`%${artist.name}%`]
        );

        if (existsResult.rows.length > 0) {
          console.log(`⏭️ ${artist.name}: 이미 존재함`);
          continue;
        }

        // 3개 APT 생성
        const basicInfo = {
          name: artist.name,
          nationality: artist.nationality,
          birthYear: artist.birth_year,
          movements: [],
          period: artist.birth_year > 1950 ? 'Contemporary' :
                 (artist.birth_year > 1900 ? 'Modern' : 'Classical')
        };

        const threeAPTs = generator.generateThreeAPTs(basicInfo, artist.primaryAPT);

        // dimensions 생성 (기본 APT에 기반)
        const dimensions = {
          L: artist.primaryAPT.includes('L') ? 70 : 30,
          S: artist.primaryAPT.includes('S') ? 70 : 30,
          A: artist.primaryAPT.includes('A') ? 70 : 30,
          R: artist.primaryAPT.includes('R') ? 70 : 30,
          E: artist.primaryAPT.includes('E') ? 70 : 30,
          M: artist.primaryAPT.includes('M') ? 70 : 30,
          F: artist.primaryAPT.includes('F') ? 70 : 30,
          C: artist.primaryAPT.includes('C') ? 70 : 30
        };

        // APT 프로필 구성
        const aptProfile = {
          primary_types: threeAPTs,
          dimensions,
          meta: {
            analysis_method: 'famous_artist_addition',
            confidence: 'high',
            generated_date: new Date().toISOString(),
            updated_to_three_apt: true,
            sources: ['wikipedia', 'artnet'],
            reasoning: '유명 작가 수동 추가 및 APT 분석'
          }
        };

        // DB에 추가
        const insertResult = await pool.query(`
          INSERT INTO artists (
            name, 
            nationality, 
            birth_year, 
            death_year,
            importance_score,
            apt_profile
          ) VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING id
        `, [
          artist.name,
          artist.nationality,
          artist.birth_year,
          artist.death_year,
          artist.importance_score,
          JSON.stringify(aptProfile)
        ]);

        console.log(`✅ ${artist.name}: 추가됨 (ID: ${insertResult.rows[0].id})`);
        console.log(`   APT: ${threeAPTs.map(t => t.type).join(' → ')}`);
        added++;

      } catch (error) {
        console.error(`❌ ${artist.name}: ${error.message}`);
        failed++;
      }
    }

    console.log('\n📊 추가 결과:');
    console.log(`  ✅ 성공: ${added}명`);
    console.log(`  ❌ 실패: ${failed}명`);

    // 2. 중요도 점수 업데이트
    console.log('\n🔄 중요도 점수 업데이트 중...\n');

    let updated = 0;
    let notFound = 0;

    for (const update of importanceUpdates) {
      try {
        const updateResult = await pool.query(`
          UPDATE artists 
          SET importance_score = $1 
          WHERE name ILIKE '%' || $2 || '%'
          AND importance_score < $1
        `, [update.newScore, update.name]);

        if (updateResult.rowCount > 0) {
          console.log(`📈 ${update.name}: 중요도 ${update.newScore}로 업데이트`);
          updated++;
        } else {
          console.log(`⏭️ ${update.name}: 이미 높은 점수 또는 미발견`);
          notFound++;
        }

      } catch (error) {
        console.error(`❌ ${update.name}: ${error.message}`);
      }
    }

    console.log('\n📊 중요도 업데이트 결과:');
    console.log(`  📈 업데이트: ${updated}명`);
    console.log(`  ⏭️ 변경 없음: ${notFound}명`);

    // 3. 최종 통계
    const finalStats = await pool.query(`
      SELECT 
        COUNT(*) as total_artists,
        COUNT(CASE WHEN importance_score >= 90 THEN 1 END) as high_importance,
        COUNT(CASE WHEN apt_profile IS NOT NULL THEN 1 END) as with_apt,
        COUNT(CASE WHEN jsonb_array_length(apt_profile->'primary_types') = 3 THEN 1 END) as three_apt
      FROM artists
    `);

    const stats = finalStats.rows[0];
    console.log('\n📈 최종 통계:');
    console.log(`  전체 아티스트: ${stats.total_artists}명`);
    console.log(`  중요도 90+: ${stats.high_importance}명`);
    console.log(`  APT 설정: ${stats.with_apt}명`);
    console.log(`  3개 APT: ${stats.three_apt}명`);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

// 실행
if (require.main === module) {
  addMissingFamousArtists();
}

module.exports = { addMissingFamousArtists };
