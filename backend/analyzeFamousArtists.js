// 유명 작가 분석 - APT 분류된 작가 중 유명한 작가들 분석

require('dotenv').config();
const { pool } = require('./src/config/database');

async function analyzeFamousArtists() {
  try {
    console.log('\n🌟 유명 작가 APT 분석');
    console.log('=' + '='.repeat(70));
    
    // 1. 전체적으로 유명한 작가들 (이름 기반)
    const famousNames = [
      'Pablo Picasso', 'Vincent van Gogh', 'Claude Monet', 'Leonardo da Vinci',
      'Michelangelo', 'Rembrandt', 'Salvador Dalí', 'Andy Warhol',
      'Frida Kahlo', 'Jackson Pollock', 'Wassily Kandinsky', 'Paul Cézanne',
      'Henri Matisse', 'Edgar Degas', 'Paul Gauguin', 'Francisco Goya',
      'Johannes Vermeer', 'Caravaggio', 'Peter Paul Rubens', 'Diego Velázquez',
      'Édouard Manet', 'Auguste Renoir', 'Georges Seurat', 'Henri de Toulouse-Lautrec',
      'Gustav Klimt', 'Egon Schiele', 'Edward Hopper', 'Georgia O\'Keeffe',
      'Mark Rothko', 'Jean-Michel Basquiat', 'Banksy', 'David Hockney',
      'Yayoi Kusama', 'Jeff Koons', 'Damien Hirst', 'Ai Weiwei',
      'Marcel Duchamp', 'René Magritte', 'Joan Miró', 'Piet Mondrian',
      'Kazimir Malevich', 'Marc Chagall', 'Paul Klee', 'Francis Bacon',
      'Lucian Freud', 'Alberto Giacometti', 'Alexander Calder', 'Roy Lichtenstein',
      'Jean-Baptiste-Camille Corot', 'Gustave Courbet', 'William Blake',
      'J.M.W. Turner', 'John Constable', 'Caspar David Friedrich',
      'Hieronymus Bosch', 'Pieter Bruegel', 'Jan van Eyck', 'Sandro Botticelli',
      'Raphael', 'Titian', 'El Greco', 'Artemisia Gentileschi',
      'Georges Braque', 'Amedeo Modigliani', 'Henri Rousseau', 'Édouard Vuillard'
    ];

    // 유명 작가 검색 조건 생성
    const nameConditions = famousNames.map(name => 
      `LOWER(name) LIKE LOWER('%${name.replace(/'/g, "''")}%')`
    ).join(' OR ');

    // 분류된 유명 작가들 조회
    const famousArtistsQuery = await pool.query(`
      SELECT 
        name,
        apt_profile->'primary_types'->0->>'type' as apt_type,
        apt_profile->'primary_types'->0->>'title' as title,
        apt_profile->'primary_types'->0->>'animal' as animal,
        apt_profile->'primary_types'->0->>'confidence' as confidence,
        nationality,
        era,
        birth_year,
        death_year,
        CASE 
          WHEN bio IS NOT NULL AND LENGTH(bio) > 1000 THEN 'Rich'
          WHEN bio IS NOT NULL AND LENGTH(bio) > 500 THEN 'Good'
          WHEN bio IS NOT NULL AND LENGTH(bio) > 200 THEN 'Fair'
          WHEN bio IS NOT NULL THEN 'Poor'
          ELSE 'None'
        END as bio_quality
      FROM artists
      WHERE apt_profile IS NOT NULL
        AND apt_profile->'primary_types'->0->>'type' IS NOT NULL
        AND (${nameConditions})
      ORDER BY 
        CASE 
          WHEN name LIKE '%Picasso%' THEN 1
          WHEN name LIKE '%Van Gogh%' THEN 2
          WHEN name LIKE '%Monet%' THEN 3
          WHEN name LIKE '%Leonardo%' THEN 4
          WHEN name LIKE '%Michelangelo%' THEN 5
          WHEN name LIKE '%Rembrandt%' THEN 6
          WHEN name LIKE '%Warhol%' THEN 7
          ELSE 8
        END,
        name
    `);

    console.log(`\n📊 분류된 유명 작가: ${famousArtistsQuery.rows.length}명 발견\n`);

    // APT별 유명 작가 분포
    const aptDistribution = {};
    
    famousArtistsQuery.rows.forEach(artist => {
      if (!aptDistribution[artist.apt_type]) {
        aptDistribution[artist.apt_type] = {
          title: artist.title,
          animal: artist.animal,
          artists: []
        };
      }
      aptDistribution[artist.apt_type].artists.push(artist);
    });

    // APT별 유명 작가 출력
    console.log('🎨 APT 유형별 유명 작가 분포:');
    console.log('-'.repeat(70));
    
    Object.entries(aptDistribution)
      .sort(([,a], [,b]) => b.artists.length - a.artists.length)
      .forEach(([aptType, data]) => {
        console.log(`\n${aptType} - ${data.title} (${data.animal}): ${data.artists.length}명`);
        console.log('─'.repeat(50));
        
        data.artists.forEach((artist, idx) => {
          const info = `${artist.name} (${artist.nationality || '?'}, ${artist.birth_year || '?'}-${artist.death_year || '?'})`;
          const quality = `Bio: ${artist.bio_quality}, 신뢰도: ${artist.confidence || '?'}%`;
          console.log(`  ${(idx + 1).toString().padStart(2)}. ${info}`);
          console.log(`      ${quality}`);
        });
      });

    // 2. 추가 분석: 높은 신뢰도로 분류된 작가들
    console.log('\n\n📈 높은 신뢰도(70%+) 작가들:');
    console.log('-'.repeat(70));
    
    const highConfidenceQuery = await pool.query(`
      SELECT 
        name,
        apt_profile->'primary_types'->0->>'type' as apt_type,
        apt_profile->'primary_types'->0->>'title' as title,
        CAST(apt_profile->'primary_types'->0->>'confidence' AS FLOAT) as confidence,
        nationality,
        era
      FROM artists
      WHERE apt_profile IS NOT NULL
        AND CAST(apt_profile->'primary_types'->0->>'confidence' AS FLOAT) >= 70
      ORDER BY confidence DESC
      LIMIT 20
    `);

    highConfidenceQuery.rows.forEach((artist, idx) => {
      console.log(`${(idx + 1).toString().padStart(2)}. ${artist.name} → ${artist.apt_type} (${artist.title}) - ${artist.confidence}%`);
    });

    // 3. 시대별 유명 작가 분석
    console.log('\n\n🕰️ 시대별 유명 작가 APT 분포:');
    console.log('-'.repeat(70));
    
    const eraDistribution = {};
    
    famousArtistsQuery.rows.forEach(artist => {
      const era = artist.era || 'Unknown';
      if (!eraDistribution[era]) {
        eraDistribution[era] = {};
      }
      if (!eraDistribution[era][artist.apt_type]) {
        eraDistribution[era][artist.apt_type] = 0;
      }
      eraDistribution[era][artist.apt_type]++;
    });

    Object.entries(eraDistribution)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([era, distribution]) => {
        const total = Object.values(distribution).reduce((a, b) => a + b, 0);
        console.log(`\n${era} (${total}명):`);
        
        Object.entries(distribution)
          .sort(([,a], [,b]) => b - a)
          .forEach(([apt, count]) => {
            const percentage = ((count / total) * 100).toFixed(1);
            console.log(`  ${apt}: ${count}명 (${percentage}%)`);
          });
      });

    // 4. 데이터 품질 분석
    console.log('\n\n📊 유명 작가 데이터 품질:');
    console.log('-'.repeat(70));
    
    const qualityStats = {
      Rich: 0,
      Good: 0,
      Fair: 0,
      Poor: 0,
      None: 0
    };
    
    famousArtistsQuery.rows.forEach(artist => {
      qualityStats[artist.bio_quality]++;
    });
    
    Object.entries(qualityStats).forEach(([quality, count]) => {
      const percentage = ((count / famousArtistsQuery.rows.length) * 100).toFixed(1);
      console.log(`  ${quality}: ${count}명 (${percentage}%)`);
    });

    // 5. 미분류 유명 작가들
    console.log('\n\n❓ 아직 분류되지 않은 유명 작가들:');
    console.log('-'.repeat(70));
    
    const unclassifiedFamous = await pool.query(`
      SELECT name, nationality, era, birth_year, death_year
      FROM artists
      WHERE (apt_profile IS NULL OR apt_profile->'primary_types'->0->>'type' IS NULL)
        AND (${nameConditions})
      ORDER BY name
      LIMIT 20
    `);
    
    if (unclassifiedFamous.rows.length > 0) {
      unclassifiedFamous.rows.forEach((artist, idx) => {
        console.log(`${(idx + 1).toString().padStart(2)}. ${artist.name} (${artist.nationality || '?'}, ${artist.birth_year || '?'}-${artist.death_year || '?'})`);
      });
      console.log(`\n... 외 ${unclassifiedFamous.rows.length > 20 ? unclassifiedFamous.rows.length - 20 : 0}명`);
    } else {
      console.log('  모든 유명 작가가 분류되었습니다!');
    }

  } catch (error) {
    console.error('오류:', error);
  } finally {
    await pool.end();
  }
}

analyzeFamousArtists();