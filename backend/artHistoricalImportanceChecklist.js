// 예술사적 중요 작가 누락 방지 체크리스트 시스템

require('dotenv').config();
const { pool } = require('./src/config/database');

// 예술사적으로 중요한 작가 마스터 리스트
const ART_HISTORICAL_MASTERS = {
  // 르네상스 (1400-1600)
  renaissance: {
    tier1: [
      'Leonardo da Vinci', 'Michelangelo', 'Raphael', 'Sandro Botticelli',
      'Titian', 'Albrecht Dürer', 'Hieronymus Bosch', 'Jan van Eyck'
    ],
    tier2: [
      'Giorgione', 'Piero della Francesca', 'Andrea Mantegna', 'Giovanni Bellini',
      'Donatello', 'Masaccio', 'Fra Angelico', 'Filippo Brunelleschi'
    ]
  },

  // 바로크 (1600-1750)
  baroque: {
    tier1: [
      'Caravaggio', 'Rembrandt', 'Johannes Vermeer', 'Peter Paul Rubens',
      'Diego Velázquez', 'Nicolas Poussin'
    ],
    tier2: [
      'Georges de La Tour', 'Artemisia Gentileschi', 'Frans Hals',
      'Bartolomé Esteban Murillo', 'Jusepe de Ribera'
    ]
  },

  // 낭만주의 (1770-1850)
  romanticism: {
    tier1: [
      'Francisco Goya', 'Eugène Delacroix', 'Théodore Géricault',
      'J.M.W. Turner', 'Caspar David Friedrich', 'William Blake'
    ],
    tier2: [
      'John Constable', 'Henry Fuseli', 'Jean-Auguste-Dominique Ingres'
    ]
  },

  // 인상주의 (1860-1890)
  impressionism: {
    tier1: [
      'Claude Monet', 'Pierre-Auguste Renoir', 'Edgar Degas',
      'Camille Pissarro', 'Édouard Manet', 'Paul Cézanne'
    ],
    tier2: [
      'Mary Cassatt', 'Berthe Morisot', 'Alfred Sisley',
      'Gustave Caillebotte', 'Frédéric Bazille'
    ]
  },

  // 후기인상주의 (1880-1915)
  postImpressionism: {
    tier1: [
      'Vincent van Gogh', 'Paul Gauguin', 'Georges Seurat',
      'Henri de Toulouse-Lautrec'
    ],
    tier2: [
      'Paul Signac', 'Henri Rousseau', 'Pierre Bonnard',
      'Édouard Vuillard'
    ]
  },

  // 표현주의 (1905-1925)
  expressionism: {
    tier1: [
      'Edvard Munch', 'Wassily Kandinsky', 'Franz Marc',
      'Ernst Ludwig Kirchner', 'Egon Schiele'
    ],
    tier2: [
      'Emil Nolde', 'Otto Dix', 'Max Beckmann', 'Oskar Kokoschka',
      'Amedeo Modigliani'
    ]
  },

  // 입체파 (1907-1920)
  cubism: {
    tier1: [
      'Pablo Picasso', 'Georges Braque', 'Juan Gris'
    ],
    tier2: [
      'Fernand Léger', 'Robert Delaunay', 'Marcel Duchamp'
    ]
  },

  // 초현실주의 (1920-1950)
  surrealism: {
    tier1: [
      'Salvador Dalí', 'René Magritte', 'Joan Miró', 'Max Ernst',
      'Frida Kahlo', 'Giorgio de Chirico'
    ],
    tier2: [
      'Yves Tanguy', 'Paul Delvaux', 'Leonora Carrington',
      'Kay Sage', 'Remedios Varo'
    ]
  },

  // 추상표현주의 (1940-1960)
  abstractExpressionism: {
    tier1: [
      'Jackson Pollock', 'Mark Rothko', 'Willem de Kooning',
      'Barnett Newman', 'Clyfford Still'
    ],
    tier2: [
      'Helen Frankenthaler', 'Robert Motherwell', 'Franz Kline',
      'Lee Krasner', 'Joan Mitchell', 'Philip Guston'
    ]
  },

  // 팝아트 (1950-1970)
  popArt: {
    tier1: [
      'Andy Warhol', 'Roy Lichtenstein', 'David Hockney',
      'Jasper Johns', 'Robert Rauschenberg'
    ],
    tier2: [
      'James Rosenquist', 'Claes Oldenburg', 'Tom Wesselmann',
      'Ed Ruscha', 'Richard Hamilton'
    ]
  },

  // 현대미술 (1960-현재)
  contemporary: {
    tier1: [
      'Jean-Michel Basquiat', 'Banksy', 'Yayoi Kusama', 'Jeff Koons',
      'Damien Hirst', 'Gerhard Richter', 'Anselm Kiefer'
    ],
    tier2: [
      'Marina Abramović', 'Ai Weiwei', 'Cindy Sherman', 'Takashi Murakami',
      'Kehinde Wiley', 'KAWS', 'Jenny Saville', 'David Hume'
    ]
  },

  // 조각가
  sculpture: {
    tier1: [
      'Auguste Rodin', 'Alberto Giacometti', 'Henry Moore',
      'Alexander Calder', 'Constantin Brâncuși', 'Louise Bourgeois'
    ],
    tier2: [
      'Barbara Hepworth', 'Anthony Gormley', 'Richard Serra',
      'Isamu Noguchi', 'David Smith'
    ]
  },

  // 사진가
  photography: {
    tier1: [
      'Ansel Adams', 'Henri Cartier-Bresson', 'Man Ray',
      'Diane Arbus', 'Robert Mapplethorpe'
    ],
    tier2: [
      'Dorothea Lange', 'Walker Evans', 'Edward Weston',
      'Cindy Sherman', 'Andreas Gursky'
    ]
  },

  // 한국 미술
  korean: {
    tier1: [
      '김환기', '이중섭', '박수근', '백남준 (Nam June Paik)',
      '이우환', '박서보'
    ],
    tier2: [
      '정상화', '김창열', '천경자', '오지호', '이인성',
      '유영국', '권진규', '문신'
    ],
    contemporary: [
      '이불', '서도호', '김수자', '양혜규', '최정화',
      '안규철', '함경아', '김범'
    ]
  }
};

// 예술사적 중요도 계산
function calculateHistoricalImportance(movement, tier) {
  const baseScores = {
    tier1: 90,
    tier2: 75,
    contemporary: 70
  };

  const movementMultipliers = {
    renaissance: 1.1,
    baroque: 1.05,
    impressionism: 1.05,
    postImpressionism: 1.05,
    surrealism: 1.0,
    abstractExpressionism: 1.0,
    contemporary: 0.95,
    korean: 0.9
  };

  const baseScore = baseScores[tier] || 60;
  const multiplier = movementMultipliers[movement] || 1.0;

  return Math.round(baseScore * multiplier);
}

async function performComprehensiveCheck() {
  try {
    console.log('🎨 예술사적 중요 작가 종합 체크리스트');
    console.log(`=${'='.repeat(70)}`);

    let totalMissing = 0;
    let totalFound = 0;
    const missingByMovement = {};

    // 각 운동별로 체크
    for (const [movement, tiers] of Object.entries(ART_HISTORICAL_MASTERS)) {
      console.log(`\n\n📌 ${movement.toUpperCase()}`);
      console.log('-'.repeat(50));

      missingByMovement[movement] = [];

      for (const [tier, artists] of Object.entries(tiers)) {
        console.log(`\n  [${tier.toUpperCase()}]`);

        // 데이터베이스에서 확인
        const result = await pool.query(
          'SELECT name, importance_score, apt_profile IS NOT NULL as has_apt FROM artists WHERE name = ANY($1)',
          [artists]
        );

        const foundNames = result.rows.map(r => r.name);
        const missing = artists.filter(name => !foundNames.includes(name));

        // 결과 출력
        console.log(`  ✅ 등록됨: ${result.rows.length}/${artists.length}`);
        result.rows.forEach(artist => {
          const aptStatus = artist.has_apt ? '✓' : '✗';
          console.log(`     - ${artist.name} (점수: ${artist.importance_score}, APT: ${aptStatus})`);
        });

        if (missing.length > 0) {
          console.log(`  ❌ 누락됨: ${missing.length}명`);
          missing.forEach(name => {
            console.log(`     - ${name}`);
            missingByMovement[movement].push({ name, tier });
          });
        }

        totalFound += result.rows.length;
        totalMissing += missing.length;
      }
    }

    // 종합 통계
    console.log(`\n\n${'='.repeat(70)}`);
    console.log('📊 종합 통계');
    console.log('='.repeat(70));
    console.log(`✅ 등록된 핵심 작가: ${totalFound}명`);
    console.log(`❌ 누락된 핵심 작가: ${totalMissing}명`);
    console.log(`📈 등록률: ${((totalFound / (totalFound + totalMissing)) * 100).toFixed(1)}%`);

    // 누락 작가 SQL 생성
    if (totalMissing > 0) {
      console.log('\n\n💾 누락 작가 추가용 SQL 생성');
      console.log(`=${'='.repeat(70)}`);

      const insertStatements = [];

      for (const [movement, artists] of Object.entries(missingByMovement)) {
        if (artists.length === 0) continue;

        console.log(`\n-- ${movement} 누락 작가 추가`);
        artists.forEach(({ name, tier }) => {
          const importance = calculateHistoricalImportance(movement, tier);
          const sql = `INSERT INTO artists (name, importance_score, era) VALUES ('${name}', ${importance}, '${movement}');`;
          console.log(sql);
          insertStatements.push({ name, importance, movement });
        });
      }

      // 파일로 저장
      const fs = require('fs');
      const sqlContent = insertStatements.map(({ name, importance, movement }) =>
        `INSERT INTO artists (name, importance_score, era) VALUES ('${name}', ${importance}, '${movement}');`
      ).join('\n');

      fs.writeFileSync('missing_artists_insert.sql', sqlContent);
      console.log('\n✅ missing_artists_insert.sql 파일 생성 완료');
    }

    // APT 분석이 필요한 작가들
    const needsAPT = await pool.query(`
      SELECT name, importance_score, era
      FROM artists
      WHERE importance_score >= 70
        AND apt_profile IS NULL
      ORDER BY importance_score DESC
      LIMIT 20
    `);

    console.log('\n\n🔬 APT 분석이 필요한 상위 작가');
    console.log(`=${'='.repeat(70)}`);
    needsAPT.rows.forEach(artist => {
      console.log(`- ${artist.name} (${artist.importance_score}점, ${artist.era || '시대 미상'})`);
    });

  } catch (error) {
    console.error('오류:', error);
  } finally {
    await pool.end();
  }
}

// 실행
performComprehensiveCheck();
