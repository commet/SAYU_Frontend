// 실제 유명 작가들의 티어 배치 확인

require('dotenv').config();
const { pool } = require('./src/config/database');

async function checkFamousArtistsTiers() {
  console.log('🎨 유명 작가들의 실제 티어 배치 확인');
  console.log('='.repeat(70));

  try {
    // Wikipedia 데이터를 기반으로 업데이트된 작가들만 확인
    const famousArtistsQuery = await pool.query(`
      SELECT 
        name,
        importance_tier,
        importance_score,
        (external_data->'wikipedia'->>'pageViews')::int as daily_views,
        (external_data->'wikipedia'->>'languages')::int as languages
      FROM artists
      WHERE external_data->'wikipedia' IS NOT NULL
      ORDER BY (external_data->'wikipedia'->>'pageViews')::int DESC NULLS LAST
    `);

    console.log(`\n📊 Wikipedia 데이터로 업데이트된 작가: ${famousArtistsQuery.rows.length}명\n`);

    // 티어별 집계
    const tierGroups = {
      1: [],
      2: [],
      3: [],
      4: [],
      5: []
    };

    famousArtistsQuery.rows.forEach(artist => {
      tierGroups[artist.importance_tier].push(artist);
    });

    // 티어별 상세 출력
    Object.entries(tierGroups).forEach(([tier, artists]) => {
      if (artists.length > 0) {
        console.log(`\n📌 티어 ${tier} (${getTierName(tier)}): ${artists.length}명`);
        console.log('─'.repeat(70));

        artists.slice(0, 15).forEach((artist, idx) => {
          console.log(`${(idx + 1).toString().padStart(2)}. ${artist.name.padEnd(40)} - ${artist.importance_score}점 (조회수: ${(artist.daily_views || 0).toLocaleString()}회/일)`);
        });

        if (artists.length > 15) {
          console.log(`    ... 외 ${artists.length - 15}명`);
        }
      }
    });

    // 특별히 유명한 작가들의 실제 배치 확인
    console.log('\n\n🌟 특별 확인: 초유명 작가들의 실제 티어');
    console.log('='.repeat(70));

    const superFamousNames = [
      'Leonardo da Vinci',
      'Vincent van Gogh',
      'Pablo Picasso',
      'Michelangelo',
      'Claude Monet',
      'Frida Kahlo',
      'Andy Warhol',
      'Salvador Dalí',
      'Rembrandt',
      'Banksy'
    ];

    for (const artistName of superFamousNames) {
      const result = await pool.query(`
        SELECT name, importance_tier, importance_score,
               (external_data->'wikipedia'->>'pageViews')::int as daily_views
        FROM artists
        WHERE name ILIKE $1
        LIMIT 1
      `, [`%${artistName}%`]);

      if (result.rows.length > 0) {
        const artist = result.rows[0];
        console.log(`${artistName.padEnd(25)} → 티어 ${artist.importance_tier} (${artist.importance_score}점, ${(artist.daily_views || 0).toLocaleString()}회/일)`);
      } else {
        console.log(`${artistName.padEnd(25)} → 데이터베이스에 없음`);
      }
    }

    // 요약 통계
    console.log('\n\n📈 요약: Wikipedia 데이터가 있는 작가들의 티어 분포');
    console.log('─'.repeat(50));
    Object.entries(tierGroups).forEach(([tier, artists]) => {
      const percentage = ((artists.length / famousArtistsQuery.rows.length) * 100).toFixed(1);
      console.log(`티어 ${tier}: ${artists.length}명 (${percentage}%)`);
    });

  } catch (error) {
    console.error('오류 발생:', error);
  } finally {
    await pool.end();
  }
}

function getTierName(tier) {
  const names = {
    1: '거장',
    2: '매우 중요',
    3: '중요',
    4: '일반',
    5: '기타'
  };
  return names[tier] || '미분류';
}

// 실행
checkFamousArtistsTiers().catch(console.error);
