// 예술사적 중요도 기반 티어 시스템
// Wikipedia 조회수가 아닌 실제 예술사적 중요성을 반영

require('dotenv').config();
const { pool } = require('./src/config/database');

// 예술사적으로 중요한 작가들의 티어 매핑
const ART_HISTORICAL_TIERS = {
  // 티어 1: 예술사의 거장들 (역사를 바꾼 작가들)
  tier1: [
    // 르네상스 거장
    'Leonardo da Vinci', 'Michelangelo', 'Raphael', 'Donatello',
    // 바로크 거장
    'Rembrandt van Rijn', 'Caravaggio', 'Vermeer', 'Velázquez',
    // 인상주의 창시자
    'Claude Monet', 'Pierre-Auguste Renoir', 'Edgar Degas',
    // 후기인상주의 거장
    'Vincent van Gogh', 'Paul Cézanne', 'Paul Gauguin',
    // 20세기 혁명가
    'Pablo Picasso', 'Henri Matisse', 'Wassily Kandinsky', 'Marcel Duchamp',
    // 현대미술 거장
    'Andy Warhol', 'Jackson Pollock', 'Mark Rothko'
  ],

  // 티어 2: 매우 중요한 작가들 (각 시대/운동의 핵심 인물)
  tier2: [
    // 르네상스
    'Sandro Botticelli', 'Titian', 'Giorgione', 'Jan van Eyck', 'Albrecht Dürer',
    // 바로크/로코코
    'Peter Paul Rubens', 'Nicolas Poussin', 'Georges de La Tour', 'Artemisia Gentileschi',
    // 낭만주의/사실주의
    'Francisco Goya', 'Eugène Delacroix', 'Théodore Géricault', 'Gustave Courbet',
    // 인상주의/후기인상주의
    'Édouard Manet', 'Camille Pissarro', 'Mary Cassatt', 'Berthe Morisot',
    'Georges Seurat', 'Henri de Toulouse-Lautrec',
    // 표현주의/야수파
    'Edvard Munch', 'Egon Schiele', 'Ernst Ludwig Kirchner', 'Emil Nolde',
    // 추상/구성주의
    'Piet Mondrian', 'Paul Klee', 'Joan Miró', 'Kazimir Malevich',
    // 초현실주의
    'Salvador Dalí', 'René Magritte', 'Max Ernst', 'Frida Kahlo',
    // 추상표현주의
    'Willem de Kooning', 'Robert Motherwell', 'Helen Frankenthaler',
    // 팝아트/현대
    'Roy Lichtenstein', 'David Hockney', 'Jean-Michel Basquiat', 'Keith Haring',
    // 한국 거장
    'Nam June Paik', '김환기', '이중섭', '박수근'
  ],

  // 티어 3: 중요한 작가들 (영향력 있는 작가들)
  tier3: [
    // 르네상스/매너리즘
    'Masaccio', 'Fra Angelico', 'Piero della Francesca', 'Andrea Mantegna',
    'Giovanni Bellini', 'Tintoretto', 'Paolo Veronese', 'El Greco',
    // 바로크
    'Annibale Carracci', 'Guido Reni', 'Claude Lorrain', 'Jacob van Ruisdael',
    // 18-19세기
    'William Blake', 'J.M.W. Turner', 'John Constable', 'Caspar David Friedrich',
    'Jean-Auguste-Dominique Ingres', 'Théodore Rousseau', 'Jean-François Millet',
    // 인상주의 주변
    'Gustave Caillebotte', 'Alfred Sisley', 'Armand Guillaumin',
    // 상징주의
    'Gustav Klimt', 'Odilon Redon', 'Gustave Moreau', 'Pierre Puvis de Chavannes',
    // 20세기
    'Marc Chagall', 'Amedeo Modigliani', 'Chaïm Soutine', 'Giorgio de Chirico',
    'Francis Bacon', 'Lucian Freud', 'David Smith', 'Louise Bourgeois',
    // 현대
    'Gerhard Richter', 'Anselm Kiefer', 'Cindy Sherman', 'Jeff Koons',
    'Damien Hirst', 'Banksy', 'Yayoi Kusama', 'Ai Weiwei',
    // 한국
    '이우환', '박서보', '정상화', '김창열'
  ]
};

// 예술 운동별 중요도 가중치
const MOVEMENT_WEIGHTS = {
  'Renaissance': 1.0,
  'Baroque': 0.95,
  'Impressionism': 0.95,
  'Post-Impressionism': 1.0,
  'Cubism': 1.0,
  'Abstract Expressionism': 0.9,
  'Pop Art': 0.85,
  'Contemporary': 0.8
};

// 작가 역할별 가중치
const ROLE_WEIGHTS = {
  'founder': 1.0,      // 운동 창시자
  'pioneer': 0.9,      // 선구자
  'master': 0.85,      // 거장
  'important': 0.7,    // 중요 작가
  'notable': 0.5       // 주목할 만한 작가
};

async function updateArtHistoricalImportance() {
  console.log('🎨 예술사적 중요도 기반 티어 시스템 적용');
  console.log('='.repeat(70));

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    let updateCount = 0;
    const updateLog = [];

    // 티어 1 작가들 업데이트
    console.log('\n📌 티어 1 (예술사의 거장) 업데이트...');
    for (const artistName of ART_HISTORICAL_TIERS.tier1) {
      const result = await updateArtistTier(client, artistName, 1, 85, 100);
      if (result) {
        updateCount++;
        updateLog.push(result);
      }
    }

    // 티어 2 작가들 업데이트
    console.log('\n📌 티어 2 (매우 중요한 작가) 업데이트...');
    for (const artistName of ART_HISTORICAL_TIERS.tier2) {
      const result = await updateArtistTier(client, artistName, 2, 70, 84);
      if (result) {
        updateCount++;
        updateLog.push(result);
      }
    }

    // 티어 3 작가들 업데이트
    console.log('\n📌 티어 3 (중요한 작가) 업데이트...');
    for (const artistName of ART_HISTORICAL_TIERS.tier3) {
      const result = await updateArtistTier(client, artistName, 3, 50, 69);
      if (result) {
        updateCount++;
        updateLog.push(result);
      }
    }

    await client.query('COMMIT');

    // 결과 요약
    console.log(`\n\n${'='.repeat(70)}`);
    console.log('✅ 예술사적 중요도 업데이트 완료!');
    console.log(`   총 ${updateCount}명의 작가 티어 조정`);

    // 변경 내역 출력
    console.log('\n📋 주요 변경 사항:');
    updateLog.filter(log => log.previousTier !== log.newTier).forEach(log => {
      console.log(`   ${log.name}: 티어 ${log.previousTier} → ${log.newTier} (${log.previousScore}점 → ${log.newScore}점)`);
    });

    // 최종 통계
    const statsQuery = await client.query(`
      SELECT 
        importance_tier,
        COUNT(*) as count,
        AVG(importance_score) as avg_score,
        MIN(importance_score) as min_score,
        MAX(importance_score) as max_score
      FROM artists
      WHERE importance_tier IS NOT NULL
      GROUP BY importance_tier
      ORDER BY importance_tier
    `);

    console.log('\n📊 최종 티어 분포:');
    console.log('─'.repeat(50));
    statsQuery.rows.forEach(row => {
      console.log(`티어 ${row.importance_tier}: ${row.count}명 (평균 ${Math.round(row.avg_score)}점, 범위 ${row.min_score}-${row.max_score}점)`);
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('오류 발생:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

async function updateArtistTier(client, artistName, targetTier, minScore, maxScore) {
  try {
    // 작가 검색
    const searchQuery = await client.query(`
      SELECT id, name, importance_tier, importance_score,
             (external_data->'wikipedia'->>'pageViews')::int as wiki_views
      FROM artists
      WHERE LOWER(name) LIKE LOWER($1)
         OR LOWER(name) LIKE LOWER($2)
         OR LOWER(name) LIKE LOWER($3)
      LIMIT 1
    `, [
      `%${artistName}%`,
      `%${artistName.replace(/'/g, '')}%`,
      artistName
    ]);

    if (searchQuery.rows.length === 0) {
      console.log(`   ⚠️ 찾을 수 없음: ${artistName}`);
      return null;
    }

    const artist = searchQuery.rows[0];

    // 점수 계산 (Wikipedia 데이터와 예술사적 중요도 혼합)
    let newScore = minScore;

    // Wikipedia 조회수가 있으면 범위 내에서 조정
    if (artist.wiki_views) {
      const tierRange = maxScore - minScore;
      const viewBonus = Math.min(tierRange * 0.3, Math.log10(artist.wiki_views + 1) * 5);
      newScore = Math.round(Math.min(maxScore, minScore + viewBonus));
    } else {
      // Wikipedia 데이터가 없으면 중간값
      newScore = Math.round((minScore + maxScore) / 2);
    }

    // 업데이트
    await client.query(`
      UPDATE artists
      SET importance_tier = $1,
          importance_score = $2,
          updated_by_system = true,
          external_data = jsonb_set(
            COALESCE(external_data, '{}'::jsonb),
            '{artHistorical}',
            $3::jsonb
          ),
          updated_at = NOW()
      WHERE id = $4
    `, [
      targetTier,
      newScore,
      JSON.stringify({
        tier: targetTier,
        reasoning: 'Art historical importance',
        lastUpdated: new Date().toISOString()
      }),
      artist.id
    ]);

    console.log(`   ✅ ${artist.name}: 티어 ${targetTier} (${newScore}점)`);

    return {
      name: artist.name,
      previousTier: artist.importance_tier,
      newTier: targetTier,
      previousScore: artist.importance_score,
      newScore
    };

  } catch (error) {
    console.error(`   ❌ 오류 - ${artistName}:`, error.message);
    return null;
  }
}

// 실행
updateArtHistoricalImportance().catch(console.error);
