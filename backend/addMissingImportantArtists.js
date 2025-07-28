// 누락된 중요 작가들 추가
require('dotenv').config();
const { pool } = require('./src/config/database');

async function addMissingArtists() {
  try {
    // 누락된 주요 작가들 리스트
    const missingArtists = [
      // 르네상스 거장들
      { name: 'Titian', nationality: 'Italian', era: 'Renaissance', bio: 'Venetian master of color and portraiture', importance: 95 },
      { name: 'Jan van Eyck', nationality: 'Flemish', era: 'Northern Renaissance', bio: 'Pioneer of oil painting and detailed realism', importance: 93 },
      { name: 'Pieter Bruegel the Elder', nationality: 'Flemish', era: 'Northern Renaissance', bio: 'Master of peasant scenes and landscapes', importance: 92 },
      { name: 'Masaccio', nationality: 'Italian', era: 'Early Renaissance', bio: 'Pioneer of perspective in painting', importance: 91 },
      { name: 'Piero della Francesca', nationality: 'Italian', era: 'Renaissance', bio: 'Master of mathematical perspective', importance: 90 },

      // 바로크 거장들
      { name: 'Peter Paul Rubens', nationality: 'Flemish', era: 'Baroque', bio: 'Master of Baroque movement and color', importance: 94 },
      { name: 'Anthony van Dyck', nationality: 'Flemish', era: 'Baroque', bio: 'Portrait painter to royalty', importance: 88 },
      { name: 'Frans Hals', nationality: 'Dutch', era: 'Baroque', bio: 'Master of lively portraiture', importance: 89 },

      // 낭만주의/현실주의
      { name: 'Theodore Géricault', nationality: 'French', era: 'Romanticism', bio: 'Pioneer of French Romantic painting', importance: 88 },
      { name: 'Jean-Auguste-Dominique Ingres', nationality: 'French', era: 'Neoclassicism', bio: 'Master of line and form', importance: 89 },
      { name: 'Jean-François Millet', nationality: 'French', era: 'Realism', bio: 'Painter of peasant life', importance: 87 },

      // 인상파/후기인상파
      { name: 'Berthe Morisot', nationality: 'French', era: 'Impressionism', bio: 'Leading female Impressionist', importance: 86 },
      { name: 'Mary Cassatt', nationality: 'American', era: 'Impressionism', bio: 'American Impressionist master', importance: 85 },
      { name: 'Georges Seurat', nationality: 'French', era: 'Post-Impressionism', bio: 'Pioneer of Pointillism', importance: 90 },

      // 20세기 거장들
      { name: 'Edward Hopper', nationality: 'American', era: 'Modern', bio: 'Master of American urban solitude', importance: 92 },
      { name: 'Alberto Giacometti', nationality: 'Swiss', era: 'Modern', bio: 'Sculptor of elongated human forms', importance: 91 },
      { name: 'Henry Moore', nationality: 'British', era: 'Modern', bio: 'Leading modernist sculptor', importance: 90 },
      { name: 'Lucian Freud', nationality: 'British', era: 'Contemporary', bio: 'Master of psychological portraiture', importance: 89 },
      { name: 'Francis Bacon', nationality: 'British', era: 'Modern', bio: 'Painter of human anguish', importance: 91 },
      { name: 'Willem de Kooning', nationality: 'Dutch-American', era: 'Abstract Expressionism', bio: 'Leading Abstract Expressionist', importance: 92 },
      { name: 'Mark Rothko', nationality: 'American', era: 'Abstract Expressionism', bio: 'Master of color field painting', importance: 93 },

      // 한국 현대미술
      { name: '백남준', nationality: 'Korean', era: 'Contemporary', bio: '비디오 아트의 선구자', importance: 94 },
      { name: '김환기', nationality: 'Korean', era: 'Modern', bio: '한국 추상미술의 선구자', importance: 88 },
      { name: '이우환', nationality: 'Korean', era: 'Contemporary', bio: '모노하 운동의 대표 작가', importance: 87 },
      { name: '박서보', nationality: 'Korean', era: 'Contemporary', bio: '단색화의 대가', importance: 86 },
      { name: '김창열', nationality: 'Korean', era: 'Contemporary', bio: '물방울 화가', importance: 85 },
      { name: '정상화', nationality: 'Korean', era: 'Contemporary', bio: '단색화 운동의 핵심 작가', importance: 84 }
    ];

    for (const artist of missingArtists) {
      try {
        // 먼저 작가가 이미 존재하는지 확인
        const existing = await pool.query(
          'SELECT id FROM artists WHERE LOWER(name) = LOWER($1)',
          [artist.name]
        );

        if (existing.rows.length === 0) {
          const _result = await pool.query(
            `INSERT INTO artists (name, nationality, era, bio, importance_score, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
             RETURNING id, name`,
            [artist.name, artist.nationality, artist.era, artist.bio, artist.importance]
          );
          console.log(`✅ 추가됨: ${artist.name} (중요도: ${artist.importance})`);
        } else {
          // 중요도 점수 업데이트
          await pool.query(
            'UPDATE artists SET importance_score = $1 WHERE id = $2',
            [artist.importance, existing.rows[0].id]
          );
          console.log(`📝 업데이트됨: ${artist.name} (중요도: ${artist.importance})`);
        }
      } catch (err) {
        console.error(`❌ 오류 (${artist.name}):`, err.message);
      }
    }

    // Salvador Dalí 중요도 점수 조정
    await pool.query(
      "UPDATE artists SET importance_score = 95 WHERE LOWER(name) = LOWER('Salvador Dalí')"
    );
    console.log('📝 Salvador Dalí 중요도 점수 조정: 95');

    console.log('\n✅ 누락된 작가 추가 완료!');

  } catch (error) {
    console.error('오류:', error);
  } finally {
    await pool.end();
  }
}

addMissingArtists();
