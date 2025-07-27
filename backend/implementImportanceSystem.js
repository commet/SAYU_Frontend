// 작가 중요도 시스템 구현
// 미술사적 중요도와 대중 인지도를 기반으로 점수 할당

require('dotenv').config();
const { pool } = require('./src/config/database');

// 티어별 작가 목록
const artistTiers = {
  tier1: {
    score: 95,
    artists: [
      // 르네상스 거장
      'Leonardo da Vinci', 'Michelangelo', 'Raphael', 'Sandro Botticelli',
      // 바로크
      'Caravaggio', 'Rembrandt van Rijn', 'Johannes Vermeer', 'Peter Paul Rubens',
      // 18-19세기
      'Jacques-Louis David', 'Eugène Delacroix', 'Francisco Goya', 'J.M.W. Turner',
      'William Blake', 'Caspar David Friedrich',
      // 인상주의
      'Claude Monet', 'Pierre-Auguste Renoir', 'Edgar Degas', 'Paul Cézanne',
      // 후기인상주의
      'Vincent van Gogh', 'Paul Gauguin', 'Georges Seurat', 'Henri de Toulouse-Lautrec',
      // 20세기 거장
      'Pablo Picasso', 'Henri Matisse', 'Wassily Kandinsky', 'Salvador Dalí',
      'Frida Kahlo', 'Jackson Pollock', 'Andy Warhol', 'Jean-Michel Basquiat',
      'Marcel Duchamp', 'Piet Mondrian', 'Mark Rothko',
      // 현대
      'David Hockney', 'Gerhard Richter', 'Jeff Koons', 'Banksy', 'Damien Hirst',
      'Yayoi Kusama', 'Ai Weiwei', 'Marina Abramović'
    ]
  },
  
  tier2: {
    score: 80,
    artists: [
      // 초기 거장
      'Giotto', 'Jan van Eyck', 'Hieronymus Bosch', 'Pieter Bruegel the Elder',
      'Albrecht Dürer', 'Titian', 'El Greco', 'Diego Velázquez', 'Tintoretto',
      'Paolo Veronese', 'Hans Holbein', 'Lucas Cranach',
      // 17-18세기
      'Nicolas Poussin', 'Claude Lorrain', 'Antoine Watteau', 'William Hogarth',
      'Thomas Gainsborough', 'Joshua Reynolds', 'Francisco de Zurbarán',
      'Bartolomé Esteban Murillo', 'Canaletto', 'Giovanni Battista Tiepolo',
      // 19세기
      'Théodore Géricault', 'Jean-Auguste-Dominique Ingres', 'Gustave Courbet',
      'Édouard Manet', 'James McNeill Whistler', 'John Singer Sargent',
      'Gustav Klimt', 'Egon Schiele', 'Edvard Munch', 'Auguste Rodin',
      // 20세기
      'Amedeo Modigliani', 'Marc Chagall', 'Joan Miró', 'René Magritte',
      'Max Ernst', 'Paul Klee', 'Georges Braque', 'Fernand Léger',
      'Willem de Kooning', 'Francis Bacon', 'Lucian Freud', 'David Hockney',
      'Roy Lichtenstein', 'Robert Rauschenberg', 'Jasper Johns',
      // 현대
      'Joseph Beuys', 'Anselm Kiefer', 'Cindy Sherman', 'Kara Walker',
      'William Kentridge', 'Kehinde Wiley', 'KAWS', 'Takashi Murakami'
    ]
  },
  
  tier3: {
    score: 65,
    artists: [
      // 여성 작가 (역사적 저평가 보정)
      'Artemisia Gentileschi', 'Judith Leyster', 'Angelica Kauffman',
      'Rosa Bonheur', 'Berthe Morisot', 'Mary Cassatt', 'Suzanne Valadon',
      'Georgia O\'Keeffe', 'Louise Bourgeois', 'Helen Frankenthaler',
      'Joan Mitchell', 'Lee Krasner', 'Agnes Martin', 'Eva Hesse',
      'Bridget Riley', 'Louise Nevelson', 'Barbara Hepworth',
      // 중요 현대 작가
      'Bruce Nauman', 'Richard Serra', 'Dan Flavin', 'James Turrell',
      'Bill Viola', 'Matthew Barney', 'Olafur Eliasson', 'Anish Kapoor',
      'Tracey Emin', 'Sarah Lucas', 'Rachel Whiteread', 'Marlene Dumas'
    ]
  }
};

// 한국 작가 목록 (추가 점수 부여)
const koreanArtists = [
  '김환기', '박수근', '이중섭', '천경자', '김기창', '박래현',
  '유영국', '이우환', '백남준', '박서보', '정상화', '하종현',
  '김창열', '이불', '서도호', '김수자', '양혜규', '김범',
  '최정화', '안규철', '임옥상', '홍경택', '권오상'
];

async function implementImportanceSystem() {
  try {
    console.log('🎯 작가 중요도 시스템 구현 시작');
    console.log('=' + '='.repeat(70));
    
    // 1. 스키마 업데이트
    console.log('\n📊 데이터베이스 스키마 업데이트...');
    const migrationSQL = await require('fs').promises.readFile(
      './src/migrations/add_importance_score.sql', 
      'utf8'
    );
    await pool.query(migrationSQL);
    console.log('✅ 스키마 업데이트 완료');
    
    // 2. 티어별 점수 할당
    let updatedCount = 0;
    
    // 티어 1 작가들
    console.log('\n🥇 티어 1 작가 업데이트...');
    for (const artist of artistTiers.tier1.artists) {
      const result = await pool.query(`
        UPDATE artists 
        SET importance_score = $1, 
            importance_tier = 1,
            updated_by_system = TRUE
        WHERE LOWER(name) LIKE $2
        RETURNING name
      `, [artistTiers.tier1.score, `%${artist.toLowerCase()}%`]);
      
      if (result.rowCount > 0) {
        updatedCount += result.rowCount;
        console.log(`   ✓ ${result.rows[0].name}`);
      }
    }
    
    // 티어 2 작가들
    console.log('\n🥈 티어 2 작가 업데이트...');
    for (const artist of artistTiers.tier2.artists) {
      const result = await pool.query(`
        UPDATE artists 
        SET importance_score = $1, 
            importance_tier = 2,
            updated_by_system = TRUE
        WHERE LOWER(name) LIKE $2
        AND importance_tier > 2
        RETURNING name
      `, [artistTiers.tier2.score, `%${artist.toLowerCase()}%`]);
      
      if (result.rowCount > 0) {
        updatedCount += result.rowCount;
        console.log(`   ✓ ${result.rows[0].name}`);
      }
    }
    
    // 티어 3 작가들
    console.log('\n🥉 티어 3 작가 업데이트...');
    for (const artist of artistTiers.tier3.artists) {
      const result = await pool.query(`
        UPDATE artists 
        SET importance_score = $1, 
            importance_tier = 3,
            updated_by_system = TRUE
        WHERE LOWER(name) LIKE $2
        AND importance_tier > 3
        RETURNING name
      `, [artistTiers.tier3.score, `%${artist.toLowerCase()}%`]);
      
      if (result.rowCount > 0) {
        updatedCount += result.rowCount;
        console.log(`   ✓ ${result.rows[0].name}`);
      }
    }
    
    // 3. 한국 작가 보너스 점수
    console.log('\n🇰🇷 한국 작가 보너스 점수...');
    for (const artist of koreanArtists) {
      const result = await pool.query(`
        UPDATE artists 
        SET importance_score = LEAST(importance_score + 10, 100)
        WHERE (name LIKE $1 OR name LIKE $2)
        AND nationality IN ('Korea', 'South Korea', 'Korean')
        RETURNING name, importance_score
      `, [`%${artist}%`, `%${artist.replace(/[가-힣]/g, '')}%`]);
      
      if (result.rowCount > 0) {
        console.log(`   ✓ ${result.rows[0].name} → ${result.rows[0].importance_score}점`);
      }
    }
    
    // 4. 여성 작가 보너스 점수
    console.log('\n👩‍🎨 여성 작가 보너스 점수...');
    const femaleArtists = [
      'Artemisia', 'Judith Leyster', 'Angelica Kauffman', 'Rosa Bonheur',
      'Berthe Morisot', 'Mary Cassatt', 'Suzanne Valadon', "Georgia O'Keeffe",
      'Louise Bourgeois', 'Helen Frankenthaler', 'Joan Mitchell', 'Lee Krasner',
      'Agnes Martin', 'Eva Hesse', 'Bridget Riley', 'Yayoi Kusama',
      'Cindy Sherman', 'Kara Walker', 'Marina Abramović', 'Louise Nevelson',
      'Barbara Hepworth', 'Frida Kahlo', 'Tracey Emin', 'Sarah Lucas'
    ];
    
    for (const artist of femaleArtists) {
      await pool.query(`
        UPDATE artists 
        SET importance_score = LEAST(importance_score + 10, 100)
        WHERE LOWER(name) LIKE $1
      `, [`%${artist.toLowerCase()}%`]);
    }
    
    // 5. 현대 작가 보너스 (1950년 이후 출생)
    console.log('\n🆕 현대 작가 보너스 점수...');
    await pool.query(`
      UPDATE artists 
      SET importance_score = LEAST(importance_score + 5, 100)
      WHERE birth_year >= 1950
      AND importance_score > 0
    `);
    
    // 6. 통계
    const stats = await pool.query(`
      SELECT 
        importance_tier,
        COUNT(*) as count,
        AVG(importance_score) as avg_score,
        MIN(importance_score) as min_score,
        MAX(importance_score) as max_score
      FROM artists
      WHERE importance_score > 0
      GROUP BY importance_tier
      ORDER BY importance_tier
    `);
    
    console.log('\n\n📊 최종 통계:');
    console.log('-'.repeat(70));
    stats.rows.forEach(row => {
      console.log(`티어 ${row.importance_tier}: ${row.count}명 (평균 ${Math.round(row.avg_score)}점)`);
    });
    
    console.log(`\n✅ 총 ${updatedCount}명의 작가 중요도 업데이트 완료`);
    
  } catch (error) {
    console.error('오류:', error);
  } finally {
    await pool.end();
  }
}

// 실행
implementImportanceSystem();