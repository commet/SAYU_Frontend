// 중요 작가 확인 및 우선순위 시스템 구축

require('dotenv').config();
const { pool } = require('./src/config/database');

// 미술사적으로 가장 중요한 작가들 (티어 1)
const tier1Artists = [
  // 르네상스 거장
  'Leonardo da Vinci', 'Michelangelo', 'Raphael', 'Botticelli',
  // 바로크
  'Caravaggio', 'Rembrandt van Rijn', 'Johannes Vermeer', 'Peter Paul Rubens',
  // 고전주의/낭만주의
  'Jacques-Louis David', 'Eugène Delacroix', 'Francisco Goya', 'J.M.W. Turner',
  // 인상주의
  'Claude Monet', 'Pierre-Auguste Renoir', 'Edgar Degas', 'Paul Cézanne',
  // 후기인상주의
  'Vincent van Gogh', 'Paul Gauguin', 'Georges Seurat', 'Henri de Toulouse-Lautrec',
  // 20세기 거장
  'Pablo Picasso', 'Henri Matisse', 'Wassily Kandinsky', 'Salvador Dalí',
  'Frida Kahlo', 'Jackson Pollock', 'Andy Warhol', 'Jean-Michel Basquiat',
  // 현대
  'David Hockney', 'Gerhard Richter', 'Jeff Koons', 'Banksy', 'Damien Hirst',
  'Yayoi Kusama', 'Ai Weiwei', 'Marina Abramović'
];

// 매우 중요한 작가들 (티어 2)
const tier2Artists = [
  // 초기 거장
  'Giotto', 'Jan van Eyck', 'Hieronymus Bosch', 'Pieter Bruegel the Elder',
  'Albrecht Dürer', 'Titian', 'El Greco', 'Diego Velázquez',
  // 17-18세기
  'Nicolas Poussin', 'Claude Lorrain', 'Antoine Watteau', 'William Hogarth',
  'Thomas Gainsborough', 'Joshua Reynolds', 'Francisco de Zurbarán',
  // 19세기
  'Caspar David Friedrich', 'Théodore Géricault', 'Jean-Auguste-Dominique Ingres',
  'Gustave Courbet', 'Édouard Manet', 'James McNeill Whistler',
  'John Singer Sargent', 'Gustav Klimt', 'Egon Schiele',
  // 20세기
  'Amedeo Modigliani', 'Marc Chagall', 'Joan Miró', 'René Magritte',
  'Max Ernst', 'Paul Klee', 'Piet Mondrian', 'Marcel Duchamp',
  'Mark Rothko', 'Willem de Kooning', 'Francis Bacon', 'Lucian Freud',
  'Joseph Beuys', 'Anselm Kiefer', 'Cindy Sherman', 'Kara Walker'
];

// 중요한 여성 작가들 (역사적으로 저평가됨)
const importantWomenArtists = [
  'Artemisia Gentileschi', 'Judith Leyster', 'Angelica Kauffman',
  'Rosa Bonheur', 'Berthe Morisot', 'Mary Cassatt', 'Suzanne Valadon',
  'Georgia O\'Keeffe', 'Louise Bourgeois', 'Helen Frankenthaler',
  'Joan Mitchell', 'Lee Krasner', 'Agnes Martin', 'Eva Hesse',
  'Bridget Riley', 'Yayoi Kusama', 'Louise Nevelson', 'Barbara Hepworth'
];

// 한국 중요 작가들
const koreanMasters = [
  '김환기', '박수근', '이중섭', '천경자', '김기창', '박래현',
  '유영국', '이우환', '백남준', '박서보', '정상화', '하종현',
  '김창열', '이불', '서도호', '김수자'
];

async function checkImportantArtists() {
  try {
    console.log('🎨 SAYU 중요 작가 DB 점검 시작');
    console.log('=' + '='.repeat(70));
    
    // 전체 작가 목록 가져오기
    const allArtists = await pool.query(`
      SELECT name, nationality, era, birth_year, death_year,
             apt_profile IS NOT NULL as has_apt,
             CASE 
               WHEN bio IS NOT NULL AND LENGTH(bio) > 500 THEN 'rich'
               WHEN bio IS NOT NULL AND LENGTH(bio) > 200 THEN 'moderate'
               WHEN bio IS NOT NULL THEN 'poor'
               ELSE 'none'
             END as bio_quality
      FROM artists
      ORDER BY name
    `);
    
    const dbArtistNames = allArtists.rows.map(a => a.name.toLowerCase());
    
    // 누락된 중요 작가 찾기
    console.log('\n❌ 누락된 티어 1 작가들:');
    const missingTier1 = [];
    tier1Artists.forEach(artist => {
      const found = dbArtistNames.some(dbName => 
        dbName.includes(artist.toLowerCase()) || 
        artist.toLowerCase().includes(dbName)
      );
      if (!found) {
        missingTier1.push(artist);
        console.log(`   - ${artist}`);
      }
    });
    
    console.log('\n❌ 누락된 티어 2 작가들:');
    const missingTier2 = [];
    tier2Artists.forEach(artist => {
      const found = dbArtistNames.some(dbName => 
        dbName.includes(artist.toLowerCase()) || 
        artist.toLowerCase().includes(dbName)
      );
      if (!found) {
        missingTier2.push(artist);
        console.log(`   - ${artist}`);
      }
    });
    
    console.log('\n❌ 누락된 중요 여성 작가들:');
    const missingWomen = [];
    importantWomenArtists.forEach(artist => {
      const found = dbArtistNames.some(dbName => 
        dbName.includes(artist.toLowerCase()) || 
        artist.toLowerCase().includes(dbName)
      );
      if (!found) {
        missingWomen.push(artist);
        console.log(`   - ${artist}`);
      }
    });
    
    // 통계
    console.log('\n\n📊 DB 현황:');
    console.log(`   전체 작가 수: ${allArtists.rows.length}명`);
    console.log(`   APT 분류 완료: ${allArtists.rows.filter(a => a.has_apt).length}명`);
    console.log(`   풍부한 bio: ${allArtists.rows.filter(a => a.bio_quality === 'rich').length}명`);
    
    console.log('\n📊 누락 현황:');
    console.log(`   티어 1 누락: ${missingTier1.length}/${tier1Artists.length}명`);
    console.log(`   티어 2 누락: ${missingTier2.length}/${tier2Artists.length}명`);
    console.log(`   여성 작가 누락: ${missingWomen.length}/${importantWomenArtists.length}명`);
    
    // 우선순위 필드 추가 제안
    console.log('\n\n💡 우선순위 시스템 구현 제안:');
    console.log('1. artists 테이블에 importance_score 필드 추가 (0-100)');
    console.log('2. 점수 체계:');
    console.log('   - 티어 1 (거장): 90-100점');
    console.log('   - 티어 2 (매우 중요): 70-89점');
    console.log('   - 티어 3 (중요): 50-69점');
    console.log('   - 기타: 0-49점');
    console.log('3. 추가 가중치:');
    console.log('   - 여성 작가: +10점 (역사적 저평가 보정)');
    console.log('   - 한국 작가: +10점 (로컬 중요도)');
    console.log('   - 현대 작가 (1950년 이후 출생): +5점 (현재 활동성)');
    
    // SQL 생성
    console.log('\n\n🔧 구현을 위한 SQL:');
    console.log(`
-- 1. importance_score 필드 추가
ALTER TABLE artists 
ADD COLUMN IF NOT EXISTS importance_score INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS importance_tier INTEGER DEFAULT 4,
ADD COLUMN IF NOT EXISTS updated_by_system BOOLEAN DEFAULT FALSE;

-- 2. 인덱스 추가 (빠른 조회를 위해)
CREATE INDEX IF NOT EXISTS idx_artists_importance 
ON artists(importance_score DESC, name);

-- 3. 티어 1 작가들 업데이트 예시
UPDATE artists 
SET importance_score = 95, 
    importance_tier = 1,
    updated_by_system = TRUE
WHERE LOWER(name) LIKE '%picasso%' 
   OR LOWER(name) LIKE '%van gogh%'
   OR LOWER(name) LIKE '%monet%';
    `);
    
    return {
      total: allArtists.rows.length,
      missingTier1,
      missingTier2,
      missingWomen
    };
    
  } catch (error) {
    console.error('오류:', error);
  } finally {
    await pool.end();
  }
}

// 실행
checkImportantArtists().then(result => {
  console.log('\n\n✅ 점검 완료');
});