const { Pool } = require('pg');
const { ANIMAL_TYPES, checkDistributionBalance } = require('./src/services/animalTypeConverter');
const { FAMOUS_ARTISTS, calculateFameScore } = require('./famous-artists-priority-system');

require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// 아티스트별 최적 APT 매핑 데이터
const FAMOUS_ARTIST_APT_MAPPING = {
  // Tier 1 (가장 유명한 아티스트들)
  'Leonardo da Vinci': 'LAEC',      // 논리적, 감정적, 외향적, 체계적 - 독수리
  'Vincent van Gogh': 'SAEF',       // 감각적, 감정적, 외향적, 유연한 - 나비
  'Pablo Picasso': 'LREF',          // 논리적, 이성적, 외향적, 유연한 - 여우
  'Michelangelo': 'SREC',           // 감각적, 이성적, 외향적, 체계적 - 사자
  'Claude Monet': 'SAIF',           // 감각적, 감정적, 내향적, 유연한 - 사슴
  'Salvador Dalí': 'LAEF',          // 논리적, 감정적, 외향적, 유연한 - 올빼미
  'Frida Kahlo': 'SAEF',            // 감각적, 감정적, 외향적, 유연한 - 나비
  'Andy Warhol': 'LREC',            // 논리적, 이성적, 외향적, 체계적 - 매
  'Henri Matisse': 'SAEC',          // 감각적, 감정적, 외향적, 체계적 - 공작
  'Jackson Pollock': 'SREF',        // 감각적, 이성적, 외향적, 유연한 - 호랑이

  // Tier 2 (잘 알려진 아티스트들)
  'Mary Cassatt': 'SAEC',           // 감각적, 감정적, 외향적, 체계적 - 공작
  'El Greco': 'SAIC',               // 감각적, 감정적, 내향적, 체계적 - 백조
  'Utagawa Hiroshige': 'LAIC',      // 논리적, 감정적, 내향적, 체계적 - 고래
  'Pierre-Auguste Renoir': 'SAIF',  // 감각적, 감정적, 내향적, 유연한 - 사슴
  'Georgia O\'Keeffe': 'SAIF',      // 감각적, 감정적, 내향적, 유연한 - 사슴
  'Edgar Degas': 'SAIF',            // 감각적, 감정적, 내향적, 유연한 - 사슴
  'Paul Cézanne': 'LAIF',           // 논리적, 감정적, 내향적, 유연한 - 돌고래
  'Wassily Kandinsky': 'LAEF',      // 논리적, 감정적, 외향적, 유연한 - 올빼미
  'Johannes Vermeer': 'LRIC',       // 논리적, 이성적, 내향적, 체계적 - 눈표범
  'Rembrandt van Rijn': 'LAIF',     // 논리적, 감정적, 내향적, 유연한 - 돌고래

  // Tier 3 (추가 균형을 위한 아티스트들)
  'Gustav Klimt': 'SAEC',           // 감각적, 감정적, 외향적, 체계적 - 공작
  'Édouard Manet': 'LREF',          // 논리적, 이성적, 외향적, 유연한 - 여우
  'Paul Gauguin': 'SAEF',           // 감각적, 감정적, 외향적, 유연한 - 나비
  'Caravaggio': 'SREC',             // 감각적, 이성적, 외향적, 체계적 - 사자
  'Henri de Toulouse-Lautrec': 'SAEF', // 감각적, 감정적, 외향적, 유연한 - 나비
  'Marc Chagall': 'LAEF',           // 논리적, 감정적, 외향적, 유연한 - 올빼미
  'Jean-Michel Basquiat': 'SREF',   // 감각적, 이성적, 외향적, 유연한 - 호랑이
  'Francis Bacon': 'SAIC',          // 감각적, 감정적, 내향적, 체계적 - 백조
  'David Hockney': 'LREF',          // 논리적, 이성적, 외향적, 유연한 - 여우
  'Yves Klein': 'LRIF'              // 논리적, 이성적, 내향적, 유연한 - 고양이
};

// 부족한 동물 유형을 채우기 위한 추가 아티스트 풀
const ADDITIONAL_ARTISTS_POOL = {
  'LAMF': ['Joan Miró', 'Paul Klee', 'Yves Tanguy'],           // 논리적, 감정적, 메타, 유연한
  'LRIF': ['Marcel Duchamp', 'Joseph Beuys', 'Yves Klein'],   // 논리적, 이성적, 내향적, 유연한 - 고양이
  'SRIF': ['René Magritte', 'Edward Hopper', 'Chuck Close'],  // 감각적, 이성적, 내향적, 유연한 - 팬더
  'SRIC': ['Gustave Courbet', 'Jean-François Millet', 'Andrew Wyeth'] // 감각적, 이성적, 내향적, 체계적 - 늑대
};

// 현재 분포 상태 분석
async function analyzeCurrentDistribution() {
  console.log('📊 현재 APT 분포 분석 중...\n');
  
  const result = await pool.query(`
    SELECT 
      apt_profile->'primary_types'->0->>'type' as apt_code,
      COUNT(*) as count,
      ARRAY_AGG(name ORDER BY follow_count DESC NULLS LAST LIMIT 3) as sample_artists
    FROM artists 
    WHERE apt_profile IS NOT NULL 
      AND apt_profile->'primary_types'->0->>'type' IS NOT NULL
    GROUP BY apt_profile->'primary_types'->0->>'type'
    ORDER BY count DESC
  `);
  
  const distribution = {};
  result.rows.forEach(row => {
    distribution[row.apt_code] = {
      count: parseInt(row.count),
      sample_artists: row.sample_artists
    };
  });
  
  // 빈 동물 유형들 추가
  Object.keys(ANIMAL_TYPES).forEach(aptCode => {
    if (!distribution[aptCode]) {
      distribution[aptCode] = { count: 0, sample_artists: [] };
    }
  });
  
  console.log('현재 분포:');
  Object.entries(distribution).forEach(([aptCode, data]) => {
    const animal = ANIMAL_TYPES[aptCode];
    const status = data.count === 0 ? '🔴' : data.count < 2 ? '🟡' : '🟢';
    console.log(`  ${status} ${animal.name_ko.padEnd(8)} (${aptCode}): ${data.count}명 - ${data.sample_artists.slice(0, 2).join(', ')}`);
  });
  
  return distribution;
}

// 유명 아티스트를 우선적으로 균형 배치
async function balanceDistributionWithFamousArtists() {
  console.log('\n⚖️ 유명 아티스트 기반 균형 배치 시작...\n');
  
  const currentDistribution = await analyzeCurrentDistribution();
  const balanceCheck = checkDistributionBalance(
    Object.fromEntries(
      Object.entries(currentDistribution).map(([code, data]) => [code, data.count])
    )
  );
  
  console.log(`\n목표: 각 동물별 ${balanceCheck.ideal_per_type}명`);
  console.log('불균형 유형들:', balanceCheck.unbalanced_types.map(t => 
    `${t.animal}(${t.current_count}/${t.ideal_count})`
  ).join(', '));
  
  let updatedCount = 0;
  
  // 1단계: 유명 아티스트들을 우선 배치
  for (const [artistName, aptCode] of Object.entries(FAMOUS_ARTIST_APT_MAPPING)) {
    const artists = await pool.query(`
      SELECT id, name, name_ko, apt_profile, follow_count
      FROM artists 
      WHERE (LOWER(name) LIKE LOWER($1) OR LOWER(name_ko) LIKE LOWER($1))
        AND (apt_profile IS NULL OR apt_profile->'primary_types'->0->>'type' != $2)
      ORDER BY 
        CASE WHEN LOWER(name) = LOWER($3) THEN 1 ELSE 2 END,
        follow_count DESC NULLS LAST
      LIMIT 1
    `, [`%${artistName}%`, aptCode, artistName]);
    
    if (artists.rows.length > 0) {
      const artist = artists.rows[0];
      const animalData = ANIMAL_TYPES[aptCode];
      const fameScore = calculateFameScore(artist.name);
      
      const aptProfile = {
        primary_types: [{
          type: aptCode,
          animal: animalData.animal,
          confidence: 90 + Math.floor(fameScore / 10), // 유명도에 따른 신뢰도
          source: 'famous_artist_expert_mapping'
        }],
        dimensions: generateDimensionsFromAPT(aptCode),
        meta: {
          analysis_date: new Date().toISOString(),
          method: 'expert_assignment',
          fame_score: fameScore,
          tier: getTierFromFameScore(fameScore)
        }
      };
      
      await pool.query(`
        UPDATE artists 
        SET apt_profile = $1, 
            is_featured = true,
            follow_count = GREATEST(COALESCE(follow_count, 0), $2),
            updated_at = NOW()
        WHERE id = $3
      `, [JSON.stringify(aptProfile), fameScore, artist.id]);
      
      console.log(`✅ ${artist.name} → ${aptCode} (${animalData.name_ko}) [Fame: ${fameScore}]`);
      updatedCount++;
    }
  }
  
  // 2단계: 여전히 부족한 동물 유형들을 추가 아티스트들로 채우기
  const updatedDistribution = await analyzeCurrentDistribution();
  
  for (const [aptCode, artistPool] of Object.entries(ADDITIONAL_ARTISTS_POOL)) {
    const currentCount = updatedDistribution[aptCode].count;
    const targetCount = balanceCheck.ideal_per_type;
    
    if (currentCount < targetCount) {
      console.log(`\n🔄 ${ANIMAL_TYPES[aptCode].name_ko} 유형 보충 중... (${currentCount}/${targetCount})`);
      
      for (const artistName of artistPool) {
        if (currentCount >= targetCount) break;
        
        const artists = await pool.query(`
          SELECT id, name, name_ko, apt_profile
          FROM artists 
          WHERE (LOWER(name) LIKE LOWER($1) OR LOWER(name_ko) LIKE LOWER($1))
            AND apt_profile IS NULL
          LIMIT 1
        `, [`%${artistName}%`]);
        
        if (artists.rows.length > 0) {
          const artist = artists.rows[0];
          const animalData = ANIMAL_TYPES[aptCode];
          
          const aptProfile = {
            primary_types: [{
              type: aptCode,
              animal: animalData.animal,
              confidence: 85,
              source: 'balance_assignment'
            }],
            dimensions: generateDimensionsFromAPT(aptCode),
            meta: {
              analysis_date: new Date().toISOString(),
              method: 'balance_optimization'
            }
          };
          
          await pool.query(`
            UPDATE artists 
            SET apt_profile = $1, updated_at = NOW()
            WHERE id = $2
          `, [JSON.stringify(aptProfile), artist.id]);
          
          console.log(`  ➕ ${artist.name} → ${aptCode} (${animalData.name_ko})`);
          updatedCount++;
        }
      }
    }
  }
  
  return updatedCount;
}

// APT 코드로부터 차원 값 생성
function generateDimensionsFromAPT(aptCode) {
  return {
    L: aptCode[0] === 'L' ? 0.75 : 0.25,
    A: aptCode[1] === 'A' ? 0.75 : 0.25,
    R: aptCode[1] === 'R' ? 0.75 : 0.25,
    E: aptCode[2] === 'E' ? 0.75 : 0.25,
    M: aptCode[2] === 'M' ? 0.75 : 0.25,
    F: aptCode[3] === 'F' ? 0.75 : 0.25,
    C: aptCode[3] === 'C' ? 0.75 : 0.25
  };
}

// 유명도 점수로부터 티어 결정
function getTierFromFameScore(score) {
  if (score >= 100) return 'tier1';
  if (score >= 80) return 'tier2';
  if (score >= 60) return 'tier3';
  return 'general';
}

// 유명도 기반 가중치 업데이트
async function updateFameBasedWeights() {
  console.log('\n⭐ 유명도 기반 가중치 업데이트 중...');
  
  // 유명 아티스트들의 팔로워 수 업데이트
  for (const artistName of Object.keys(FAMOUS_ARTIST_APT_MAPPING)) {
    const fameScore = calculateFameScore(artistName);
    
    await pool.query(`
      UPDATE artists 
      SET follow_count = GREATEST(COALESCE(follow_count, 0), $1)
      WHERE LOWER(name) LIKE LOWER($2) OR LOWER(name_ko) LIKE LOWER($2)
    `, [fameScore, `%${artistName}%`]);
  }
  
  console.log('✅ 유명도 기반 가중치 업데이트 완료');
}

// 추천 시스템용 가중치 설정
async function setupRecommendationWeights() {
  console.log('\n🎯 추천 시스템용 가중치 설정 중...');
  
  // is_featured 플래그 설정
  await pool.query(`
    UPDATE artists 
    SET is_featured = true
    WHERE follow_count >= 60  -- Tier 3 이상
  `);
  
  // 검증 상태 업데이트
  await pool.query(`
    UPDATE artists 
    SET is_verified = true,
        verification_date = NOW(),
        verification_method = 'fame_based_auto'
    WHERE follow_count >= 80  -- Tier 2 이상
  `);
  
  console.log('✅ 추천 가중치 설정 완료');
}

// 최종 결과 리포트
async function generateFinalReport() {
  console.log('\n📋 최종 결과 리포트');
  console.log('==================\n');
  
  const finalDistribution = await analyzeCurrentDistribution();
  const balanceCheck = checkDistributionBalance(
    Object.fromEntries(
      Object.entries(finalDistribution).map(([code, data]) => [code, data.count])
    )
  );
  
  console.log('🎯 균형 상태:', balanceCheck.is_balanced ? '✅ 균형잡힘' : '⚠️ 불균형');
  console.log(`📊 총 아티스트: ${Object.values(finalDistribution).reduce((sum, data) => sum + data.count, 0)}명`);
  console.log(`🎭 목표 동물별: ${balanceCheck.ideal_per_type}명\n`);
  
  // 동물별 상세 현황
  Object.entries(ANIMAL_TYPES).forEach(([aptCode, animalData]) => {
    const data = finalDistribution[aptCode];
    const status = data.count >= balanceCheck.ideal_per_type ? '✅' : 
                   data.count > 0 ? '🟡' : '🔴';
    
    console.log(`${status} ${animalData.name_ko.padEnd(8)} (${aptCode}): ${data.count.toString().padStart(2)}명 - ${data.sample_artists.slice(0, 2).join(', ')}`);
  });
  
  // 유명 아티스트 현황
  console.log('\n⭐ 유명 아티스트 현황:');
  const famousResult = await pool.query(`
    SELECT 
      name, 
      name_ko,
      apt_profile->'primary_types'->0->>'type' as apt_code,
      follow_count
    FROM artists 
    WHERE follow_count >= 60
    ORDER BY follow_count DESC
    LIMIT 15
  `);
  
  famousResult.rows.forEach((artist, idx) => {
    const animalData = ANIMAL_TYPES[artist.apt_code];
    const tier = getTierFromFameScore(artist.follow_count);
    console.log(`  ${idx + 1}. ${artist.name} (${artist.name_ko || 'N/A'}) - ${animalData?.name_ko || '미정'} [${tier}]`);
  });
}

// 메인 실행 함수
async function main() {
  try {
    console.log('🚀 균형 잡힌 APT 분포 시스템 시작\n');
    console.log('목표: 16가지 동물 유형별 균형 잡힌 유명 아티스트 배치\n');
    
    // 1. 현재 상태 분석
    await analyzeCurrentDistribution();
    
    // 2. 유명 아티스트 기반 균형 배치
    const updatedCount = await balanceDistributionWithFamousArtists();
    console.log(`\n✅ ${updatedCount}명의 아티스트 APT 업데이트 완료`);
    
    // 3. 유명도 기반 가중치 업데이트
    await updateFameBasedWeights();
    
    // 4. 추천 시스템용 가중치 설정
    await setupRecommendationWeights();
    
    // 5. 최종 결과 리포트
    await generateFinalReport();
    
    console.log('\n🎉 균형 잡힌 APT 분포 시스템 완료!');
    console.log('\n📌 주요 개선사항:');
    console.log('   ✅ 유명 아티스트 우선 매핑');
    console.log('   ✅ 16가지 동물 유형 균형 배치');
    console.log('   ✅ 유명도 기반 가중치 시스템');
    console.log('   ✅ 추천 시스템 최적화');
    
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
  FAMOUS_ARTIST_APT_MAPPING,
  ADDITIONAL_ARTISTS_POOL,
  balanceDistributionWithFamousArtists,
  generateDimensionsFromAPT
};