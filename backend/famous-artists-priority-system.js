const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// 세계적으로 유명한 아티스트 리스트 (우선순위별)
const FAMOUS_ARTISTS = {
  tier1: [
    'Leonardo da Vinci', 'Vincent van Gogh', 'Pablo Picasso', 'Michelangelo',
    'Claude Monet', 'Salvador Dalí', 'Frida Kahlo', 'Andy Warhol',
    'Henri Matisse', 'Jackson Pollock'
  ],
  tier2: [
    'Mary Cassatt', 'El Greco', 'Utagawa Hiroshige', 'Pierre-Auguste Renoir',
    'Georgia O\'Keeffe', 'Edgar Degas', 'Paul Cézanne', 'Wassily Kandinsky',
    'Johannes Vermeer', 'Rembrandt van Rijn'
  ],
  tier3: [
    'Gustav Klimt', 'Édouard Manet', 'Paul Gauguin', 'Caravaggio',
    'Henri de Toulouse-Lautrec', 'Marc Chagall', 'Jean-Michel Basquiat',
    'Francis Bacon', 'David Hockney', 'Yves Klein'
  ]
};

// 16가지 동물 유형 매핑 시스템
const ANIMAL_TYPE_MAPPING = {
  // 논리형 (L)
  'LAEF': 'owl',      // 지혜로운 올빼미 - 논리적, 감정적, 외향적, 유연
  'LAEC': 'eagle',    // 예리한 독수리 - 논리적, 감정적, 외향적, 체계적
  'LAIF': 'dolphin',  // 영리한 돌고래 - 논리적, 감정적, 내향적, 유연
  'LAIC': 'whale',    // 지적인 고래 - 논리적, 감정적, 내향적, 체계적
  
  'LREF': 'fox',      // 영리한 여우 - 논리적, 이성적, 외향적, 유연
  'LREC': 'hawk',     // 날카로운 매 - 논리적, 이성적, 외향적, 체계적
  'LRIF': 'cat',      // 독립적인 고양이 - 논리적, 이성적, 내향적, 유연
  'LRIC': 'snow_leopard', // 신비로운 눈표범 - 논리적, 이성적, 내향적, 체계적

  // 감각형 (S)
  'SAEF': 'butterfly', // 아름다운 나비 - 감각적, 감정적, 외향적, 유연
  'SAEC': 'peacock',   // 화려한 공작 - 감각적, 감정적, 외향적, 체계적
  'SAIF': 'deer',      // 우아한 사슴 - 감각적, 감정적, 내향적, 유연
  'SAIC': 'swan',      // 우아한 백조 - 감각적, 감정적, 내향적, 체계적
  
  'SREF': 'tiger',     // 역동적인 호랑이 - 감각적, 이성적, 외향적, 유연
  'SREC': 'lion',      // 당당한 사자 - 감각적, 이성적, 외향적, 체계적
  'SRIF': 'panther',   // 신비로운 팬더 - 감각적, 이성적, 내향적, 유연
  'SRIC': 'wolf'       // 충실한 늑대 - 감각적, 이성적, 내향적, 체계적
};

// 현재 동물 유형별 분포 조회
async function getCurrentDistribution() {
  const result = await pool.query(`
    SELECT 
      apt_profile->'primary_types'->0->>'type' as apt_code,
      COUNT(*) as count
    FROM artists 
    WHERE apt_profile IS NOT NULL 
      AND apt_profile->'primary_types'->0->>'type' IS NOT NULL
    GROUP BY apt_profile->'primary_types'->0->>'type'
    ORDER BY count DESC
  `);
  
  return result.rows.reduce((acc, row) => {
    acc[row.apt_code] = parseInt(row.count);
    return acc;
  }, {});
}

// 유명도 점수 계산
function calculateFameScore(artistName) {
  if (FAMOUS_ARTISTS.tier1.some(name => artistName.includes(name) || name.includes(artistName))) {
    return 100;
  }
  if (FAMOUS_ARTISTS.tier2.some(name => artistName.includes(name) || name.includes(artistName))) {
    return 80;
  }
  if (FAMOUS_ARTISTS.tier3.some(name => artistName.includes(name) || name.includes(artistName))) {
    return 60;
  }
  return 20; // 기본 점수
}

// 유명 아티스트 우선 검색
async function findFamousArtists() {
  console.log('🎨 유명 아티스트 우선 검색 중...\n');
  
  const famousInDB = [];
  
  for (const tier in FAMOUS_ARTISTS) {
    console.log(`\n📊 ${tier.toUpperCase()} 아티스트 검색:`);
    
    for (const artistName of FAMOUS_ARTISTS[tier]) {
      const result = await pool.query(`
        SELECT id, name, name_ko, apt_profile, follow_count
        FROM artists 
        WHERE LOWER(name) LIKE LOWER($1) 
           OR LOWER(name_ko) LIKE LOWER($1)
        ORDER BY 
          CASE WHEN LOWER(name) = LOWER($2) THEN 1
               WHEN LOWER(name_ko) = LOWER($2) THEN 1
               ELSE 2 END,
          follow_count DESC NULLS LAST
        LIMIT 3
      `, [`%${artistName}%`, artistName]);
      
      if (result.rows.length > 0) {
        const artist = result.rows[0];
        const hasAPT = artist.apt_profile !== null;
        const fameScore = calculateFameScore(artist.name);
        
        console.log(`  ✅ ${artist.name} (${artist.name_ko || 'N/A'}) - APT: ${hasAPT ? '있음' : '없음'}, 유명도: ${fameScore}`);
        
        famousInDB.push({
          ...artist,
          tier,
          fameScore,
          hasAPT
        });
      } else {
        console.log(`  ❌ ${artistName} - DB에 없음`);
      }
    }
  }
  
  return famousInDB;
}

// 균형 잡힌 APT 분포 계산
function calculateBalancedDistribution(famousArtists, currentDistribution) {
  const totalAnimals = 16;
  const targetPerAnimal = Math.ceil(famousArtists.length / totalAnimals);
  
  // 현재 부족한 동물 유형들 식별
  const animalCodes = Object.keys(ANIMAL_TYPE_MAPPING);
  const underrepresented = animalCodes.filter(code => 
    (currentDistribution[code] || 0) < targetPerAnimal
  );
  
  console.log('\n⚖️ 균형 분포 분석:');
  console.log(`목표: 각 동물별 ${targetPerAnimal}명`);
  console.log('부족한 유형:', underrepresented.map(code => 
    `${code}(${ANIMAL_TYPE_MAPPING[code]}): ${currentDistribution[code] || 0}명`
  ).join(', '));
  
  return { targetPerAnimal, underrepresented };
}

// 아티스트 스타일 기반 APT 추론
function inferAPTFromArtist(artistName, artistBio = '') {
  const name = artistName.toLowerCase();
  const bio = artistBio.toLowerCase();
  
  // 간단한 휴리스틱 기반 추론
  if (name.includes('van gogh') || name.includes('고흐')) {
    return 'SAEF'; // 감정적이고 유연한 나비
  }
  if (name.includes('picasso') || name.includes('피카소')) {
    return 'LREF'; // 논리적이고 유연한 여우
  }
  if (name.includes('monet') || name.includes('모네')) {
    return 'SAIF'; // 감각적이고 내향적인 사슴
  }
  if (name.includes('da vinci') || name.includes('다빈치')) {
    return 'LAEC'; // 논리적이고 체계적인 독수리
  }
  if (name.includes('mary cassatt') || name.includes('cassatt')) {
    return 'SAEC'; // 감각적이고 감정적인 공작
  }
  if (name.includes('el greco') || name.includes('그레코')) {
    return 'SAIC'; // 감각적이고 내향적인 백조
  }
  if (name.includes('hiroshige') || name.includes('히로시게')) {
    return 'LAIC'; // 논리적이고 내향적인 고래
  }
  if (name.includes('frida kahlo') || name.includes('프리다')) {
    return 'SAEF'; // 감정적이고 표현적인 나비
  }
  if (name.includes('salvador dali') || name.includes('달리')) {
    return 'LAEF'; // 논리적이면서 상상력이 풍부한 올빼미
  }
  if (name.includes('andy warhol') || name.includes('워홀')) {
    return 'LREC'; // 논리적이고 체계적인 매
  }
  
  // 기본값 - 부족한 유형 중 하나 랜덤 선택
  const underrepresented = ['LAMF', 'LRIF', 'SRIF', 'SREF'];
  return underrepresented[Math.floor(Math.random() * underrepresented.length)];
}

// 유명도 가중치 업데이트
async function updateFameWeights() {
  console.log('\n⭐ 유명도 가중치 업데이트 중...');
  
  const allArtists = await pool.query(`
    SELECT id, name, name_ko, follow_count
    FROM artists
  `);
  
  let updated = 0;
  
  for (const artist of allArtists.rows) {
    const fameScore = calculateFameScore(artist.name);
    const newFollowCount = Math.max(artist.follow_count || 0, fameScore);
    
    if (newFollowCount !== (artist.follow_count || 0)) {
      await pool.query(`
        UPDATE artists 
        SET follow_count = $1, updated_at = NOW()
        WHERE id = $2
      `, [newFollowCount, artist.id]);
      updated++;
    }
  }
  
  console.log(`✅ ${updated}명의 아티스트 가중치 업데이트 완료`);
}

// 메인 실행 함수
async function main() {
  try {
    console.log('🚀 유명 아티스트 우선 APT 매핑 시스템 시작\n');
    
    // 1. 현재 분포 확인
    const currentDistribution = await getCurrentDistribution();
    console.log('📊 현재 APT 분포:', currentDistribution);
    
    // 2. 유명 아티스트 검색
    const famousArtists = await findFamousArtists();
    console.log(`\n🎯 발견된 유명 아티스트: ${famousArtists.length}명`);
    
    // 3. 균형 분포 계산
    const { targetPerAnimal, underrepresented } = calculateBalancedDistribution(
      famousArtists, 
      currentDistribution
    );
    
    // 4. APT가 없는 유명 아티스트들에게 APT 할당
    const needsAPT = famousArtists.filter(artist => !artist.hasAPT);
    console.log(`\n🔄 APT 할당 필요한 유명 아티스트: ${needsAPT.length}명`);
    
    for (const artist of needsAPT.slice(0, 10)) { // 처음 10명만
      const inferredAPT = inferAPTFromArtist(artist.name);
      const animalType = ANIMAL_TYPE_MAPPING[inferredAPT];
      
      const aptProfile = {
        primary_types: [{
          type: inferredAPT,
          animal: animalType,
          confidence: 85,
          source: 'famous_artist_inference'
        }],
        dimensions: {
          L: inferredAPT[0] === 'L' ? 0.7 : 0.3,
          A: inferredAPT[1] === 'A' ? 0.7 : 0.3,
          R: inferredAPT[1] === 'R' ? 0.7 : 0.3,
          E: inferredAPT[2] === 'E' ? 0.7 : 0.3,
          M: inferredAPT[2] === 'M' ? 0.7 : 0.3,
          F: inferredAPT[3] === 'F' ? 0.7 : 0.3,
          C: inferredAPT[3] === 'C' ? 0.7 : 0.3
        },
        meta: {
          analysis_date: new Date().toISOString(),
          method: 'famous_artist_priority',
          fame_score: artist.fameScore
        }
      };
      
      await pool.query(`
        UPDATE artists 
        SET apt_profile = $1, 
            is_featured = true,
            updated_at = NOW()
        WHERE id = $2
      `, [JSON.stringify(aptProfile), artist.id]);
      
      console.log(`  ✅ ${artist.name} → ${inferredAPT} (${animalType})`);
    }
    
    // 5. 유명도 가중치 업데이트
    await updateFameWeights();
    
    // 6. 최종 결과 출력
    console.log('\n📋 최종 결과 요약:');
    const finalDistribution = await getCurrentDistribution();
    
    Object.entries(ANIMAL_TYPE_MAPPING).forEach(([code, animal]) => {
      const count = finalDistribution[code] || 0;
      const status = count >= targetPerAnimal ? '✅' : '⚠️';
      console.log(`  ${status} ${animal.padEnd(12)} (${code}): ${count}명`);
    });
    
    console.log('\n🎉 유명 아티스트 우선 매핑 완료!');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  FAMOUS_ARTISTS,
  ANIMAL_TYPE_MAPPING,
  calculateFameScore,
  inferAPTFromArtist
};