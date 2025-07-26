const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// 남은 5개 타입에 대한 타겟 아티스트
const REMAINING_TYPES = {
  'LAMC': [ // 거북이 - 철학적 수집가
    { keywords: ['marcel duchamp', 'duchamp'], type: 'LAMC' },
    { keywords: ['rene magritte', 'magritte'], type: 'LAMC' },
    { keywords: ['joseph beuys', 'beuys'], type: 'LAMC' },
    { keywords: ['joseph kosuth', 'kosuth'], type: 'LAMC' },
    { keywords: ['john cage', 'cage'], type: 'LAMC' },
    { keywords: ['sol lewitt', 'lewitt'], type: 'LAMC' }
  ],
  
  'LREF': [ // 카멜레온 - 고독한 관찰자
    { keywords: ['edward hopper', 'hopper'], type: 'LREF' },
    { keywords: ['andrew wyeth', 'wyeth'], type: 'LREF' },
    { keywords: ['giorgio morandi', 'morandi'], type: 'LREF' },
    { keywords: ['vilhelm hammershoi', 'hammershoi'], type: 'LREF' },
    { keywords: ['balthus'], type: 'LREF' },
    { keywords: ['lucian freud', 'freud'], type: 'LREF' }
  ],
  
  'LRMF': [ // 문어 - 디지털 탐험가
    { keywords: ['andreas gursky', 'gursky'], type: 'LRMF' },
    { keywords: ['cindy sherman', 'sherman'], type: 'LRMF' },
    { keywords: ['thomas demand', 'demand'], type: 'LRMF' },
    { keywords: ['hiroshi sugimoto', 'sugimoto'], type: 'LRMF' },
    { keywords: ['jeff wall', 'wall'], type: 'LRMF' },
    { keywords: ['wolfgang tillmans', 'tillmans'], type: 'LRMF' }
  ],
  
  'SAEC': [ // 펭귄 - 예술 네트워커
    { keywords: ['andy warhol', 'warhol'], type: 'SAEC' },
    { keywords: ['roy lichtenstein', 'lichtenstein'], type: 'SAEC' },
    { keywords: ['keith haring', 'haring'], type: 'SAEC' },
    { keywords: ['jean-michel basquiat', 'basquiat'], type: 'SAEC' },
    { keywords: ['takashi murakami', 'murakami'], type: 'SAEC' },
    { keywords: ['kaws'], type: 'SAEC' }
  ],
  
  'SREF': [ // 강아지 - 열정적 관람자
    { keywords: ['francisco goya', 'goya'], type: 'SREF' },
    { keywords: ['eugene delacroix', 'delacroix'], type: 'SREF' },
    { keywords: ['gustave courbet', 'courbet'], type: 'SREF' },
    { keywords: ['edvard munch', 'munch'], type: 'SREF' },
    { keywords: ['egon schiele', 'schiele'], type: 'SREF' },
    { keywords: ['chaim soutine', 'soutine'], type: 'SREF' },
    { keywords: ['이중섭'], type: 'SREF' }
  ]
};

// 추가로 많이 알려진 아티스트들 (50명 목표 달성용)
const GENERAL_FAMOUS_ARTISTS = {
  'LAEF': ['wassily kandinsky', 'paul klee', 'marc chagall', 'salvador dali', 'joan miro'],
  'LAEC': ['agnes martin', 'helen frankenthaler', 'eva hesse', 'kara walker'],
  'LAMF': ['francis bacon', 'willem de kooning', 'robert rauschenberg', 'jasper johns'],
  'LAMC': ['donald judd', 'dan flavin', 'carl andre', 'robert morris'],
  'LREF': ['jacques-louis david', 'jean-baptiste-camille corot', 'gustave caillebotte'],
  'LREC': ['pierre bonnard', 'maurice utrillo', 'amadeo modigliani'],
  'LRMF': ['richard prince', 'sherrie levine', 'thomas struth'],
  'LRMC': ['albrecht durer', 'hans holbein', 'jan van eyck'],
  'SAEF': ['claude monet', 'pierre-auguste renoir', 'camille pissarro', 'edgar degas'],
  'SAEC': ['damien hirst', 'tracey emin', 'banksy', 'shepard fairey'],
  'SAMF': ['pablo picasso', 'henri matisse', 'georges braque', 'fernand leger'],
  'SAMC': ['marina abramovic', 'chris burden', 'bruce nauman', 'vito acconci'],
  'SREF': ['theodore gericault', 'caspar david friedrich', 'william turner'],
  'SREC': ['grant wood', 'thomas hart benton', 'john singer sargent'],
  'SRMF': ['anish kapoor', 'richard serra', 'maya lin', 'christo'],
  'SRMC': ['raphael', 'caravaggio', 'peter paul rubens', 'diego velazquez', 'rembrandt']
};

// 16가지 동물 타입 정의
const SAYU_ANIMALS = {
  'LAEF': { name: 'Fox', name_ko: '여우', title: '몽환적 방랑자' },
  'LAEC': { name: 'Cat', name_ko: '고양이', title: '감성 큐레이터' },
  'LAMF': { name: 'Owl', name_ko: '올빼미', title: '직관적 탐구자' },
  'LAMC': { name: 'Turtle', name_ko: '거북이', title: '철학적 수집가' },
  'LREF': { name: 'Chameleon', name_ko: '카멜레온', title: '고독한 관찰자' },
  'LREC': { name: 'Hedgehog', name_ko: '고슴도치', title: '섬세한 감정가' },
  'LRMF': { name: 'Octopus', name_ko: '문어', title: '디지털 탐험가' },
  'LRMC': { name: 'Beaver', name_ko: '비버', title: '학구적 연구자' },
  'SAEF': { name: 'Butterfly', name_ko: '나비', title: '감성 나눔이' },
  'SAEC': { name: 'Penguin', name_ko: '펭귄', title: '예술 네트워커' },
  'SAMF': { name: 'Parrot', name_ko: '앵무새', title: '영감 전도사' },
  'SAMC': { name: 'Deer', name_ko: '사슴', title: '문화 기획자' },
  'SREF': { name: 'Dog', name_ko: '강아지', title: '열정적 관람자' },
  'SREC': { name: 'Duck', name_ko: '오리', title: '따뜻한 안내자' },
  'SRMF': { name: 'Elephant', name_ko: '코끼리', title: '지식 멘토' },
  'SRMC': { name: 'Eagle', name_ko: '독수리', title: '체계적 교육자' }
};

async function finalAPTCompletion() {
  try {
    console.log('🏁 최종 APT 완성 프로젝트 시작');
    console.log('목표: 모든 16가지 타입 완성 + 50명 이상 달성\n');
    
    let successCount = 0;
    let skipCount = 0;
    
    // 1. 먼저 비어있는 5개 타입 채우기
    console.log('🎯 Phase 1: 비어있는 5개 타입 채우기');
    for (const [targetType, mappings] of Object.entries(REMAINING_TYPES)) {
      console.log(`\n${targetType} (${SAYU_ANIMALS[targetType].title}) 처리 중:`);
      
      let foundForType = 0;
      for (const mapping of mappings) {
        if (foundForType >= 3) break; // 각 타입당 최대 3명
        
        for (const keyword of mapping.keywords) {
          const artists = await pool.query(`
            SELECT id, name, name_ko, nationality, nationality_ko, birth_year, death_year
            FROM artists 
            WHERE (name ILIKE $1 OR name_ko ILIKE $1)
              AND name NOT ILIKE '%after %'
              AND name NOT ILIKE '%attributed%'
              AND name NOT ILIKE '%imitator%'
              AND name NOT ILIKE '%workshop%'
              AND name NOT ILIKE '%circle of%'
              AND name NOT ILIKE '%school of%'
            LIMIT 1
          `, [`%${keyword}%`]);
          
          if (artists.rows.length > 0) {
            const artist = artists.rows[0];
            
            const existing = await pool.query(`
              SELECT id FROM artist_apt_mappings WHERE artist_id = $1
            `, [artist.id]);
            
            if (existing.rows.length === 0) {
              const aptProfile = generateSAYUProfile(artist, targetType);
              
              try {
                await pool.query(`
                  INSERT INTO artist_apt_mappings 
                  (artist_id, apt_profile, mapping_method, confidence_score, mapped_by, mapping_notes)
                  VALUES ($1, $2, $3, $4, $5, $6)
                `, [
                  artist.id,
                  JSON.stringify(aptProfile),
                  'final_completion_v1',
                  aptProfile.primary_types[0].confidence / 100,
                  'sayu_final_completer',
                  `Final completion: ${keyword} → ${targetType}`
                ]);
                
                console.log(`  ✅ ${artist.name || artist.name_ko} → ${targetType}`);
                successCount++;
                foundForType++;
                break;
                
              } catch (err) {
                console.log(`  ❌ 삽입 실패: ${err.message}`);
              }
            } else {
              skipCount++;
            }
          }
        }
      }
    }
    
    // 2. 50명 목표 달성을 위한 추가 매핑
    console.log('\n🎯 Phase 2: 50명 목표 달성을 위한 확장');
    
    const currentTotal = await pool.query(`
      SELECT COUNT(*) as total FROM artist_apt_mappings WHERE apt_profile IS NOT NULL
    `);
    
    const currentCount = parseInt(currentTotal.rows[0].total);
    console.log(`현재 총 ${currentCount}명 매핑됨`);
    
    if (currentCount < 50) {
      const needed = 50 - currentCount;
      console.log(`추가로 ${needed}명 필요\n`);
      
      // 각 타입별로 균등하게 추가
      const typesNeedingMore = Object.keys(GENERAL_FAMOUS_ARTISTS);
      let addedForExpansion = 0;
      
      for (const targetType of typesNeedingMore) {
        if (addedForExpansion >= needed) break;
        
        const currentForType = await pool.query(`
          SELECT COUNT(*) as count 
          FROM artist_apt_mappings 
          WHERE apt_profile IS NOT NULL 
            AND (apt_profile->'primary_types'->0->>'type') = $1
        `, [targetType]);
        
        const typeCount = parseInt(currentForType.rows[0].count);
        
        if (typeCount < 4) { // 각 타입당 최소 4명 목표
          const keywords = GENERAL_FAMOUS_ARTISTS[targetType];
          
          for (const keyword of keywords) {
            if (addedForExpansion >= needed) break;
            
            const artists = await pool.query(`
              SELECT id, name, name_ko, nationality, nationality_ko, birth_year, death_year
              FROM artists 
              WHERE (name ILIKE $1 OR name_ko ILIKE $1)
                AND name NOT ILIKE '%after %'
                AND name NOT ILIKE '%attributed%'
                AND name NOT ILIKE '%imitator%'
                AND name NOT ILIKE '%workshop%'
                AND name NOT ILIKE '%circle of%'
                AND name NOT ILIKE '%school of%'
              LIMIT 1
            `, [`%${keyword}%`]);
            
            if (artists.rows.length > 0) {
              const artist = artists.rows[0];
              
              const existing = await pool.query(`
                SELECT id FROM artist_apt_mappings WHERE artist_id = $1
              `, [artist.id]);
              
              if (existing.rows.length === 0) {
                const aptProfile = generateSAYUProfile(artist, targetType);
                
                try {
                  await pool.query(`
                    INSERT INTO artist_apt_mappings 
                    (artist_id, apt_profile, mapping_method, confidence_score, mapped_by, mapping_notes)
                    VALUES ($1, $2, $3, $4, $5, $6)
                  `, [
                    artist.id,
                    JSON.stringify(aptProfile),
                    'expansion_to_50',
                    aptProfile.primary_types[0].confidence / 100,
                    'sayu_expander',
                    `Expansion: ${keyword} → ${targetType}`
                  ]);
                  
                  console.log(`  ✅ ${artist.name || artist.name_ko} → ${targetType}`);
                  successCount++;
                  addedForExpansion++;
                  
                } catch (err) {
                  console.log(`  ❌ 삽입 실패: ${err.message}`);
                }
              }
            }
          }
        }
      }
    }
    
    // 3. 최종 결과 확인
    const final = await pool.query(`
      SELECT 
        (apt_profile->'primary_types'->0->>'type') as apt_type,
        COUNT(*) as count
      FROM artist_apt_mappings 
      WHERE apt_profile IS NOT NULL
      GROUP BY (apt_profile->'primary_types'->0->>'type')
      ORDER BY count DESC
    `);
    
    console.log('\n🏆 최종 APT 분포:');
    let totalMapped = 0;
    final.rows.forEach(row => {
      if (row.apt_type) {
        const animal = SAYU_ANIMALS[row.apt_type];
        console.log(`  ${row.apt_type} (${animal.name_ko} ${animal.title}): ${row.count}명`);
        totalMapped += parseInt(row.count);
      }
    });
    
    console.log(`\n🎊 최종 결과:`);
    console.log(`📈 총 매핑된 아티스트: ${totalMapped}명`);
    console.log(`✅ 새로 추가: ${successCount}명`);
    console.log(`⚠️ 스킵: ${skipCount}명`);
    console.log(`🎯 50명 목표: ${totalMapped >= 50 ? '✅ 달성!' : '❌ 미달성'}`);
    
    // 4. 모든 타입 커버 확인
    const allTypes = Object.keys(SAYU_ANIMALS);
    const mappedTypes = final.rows.map(row => row.apt_type).filter(Boolean);
    const emptyTypes = allTypes.filter(type => !mappedTypes.includes(type));
    
    if (emptyTypes.length === 0) {
      console.log('🌟 모든 16가지 타입에 아티스트 매핑 완료!');
    } else {
      console.log(`⚠️ 여전히 비어있는 타입: ${emptyTypes.join(', ')}`);
    }
    
    // 5. 균형 분석
    const avgPerType = totalMapped / 16;
    console.log(`\n⚖️ 균형 분석:`);
    console.log(`평균 타입당: ${avgPerType.toFixed(1)}명`);
    
    const imbalanced = final.rows.filter(row => {
      const count = parseInt(row.count);
      return count < avgPerType * 0.5 || count > avgPerType * 2;
    });
    
    if (imbalanced.length === 0) {
      console.log('✅ 모든 타입이 균형잡힌 분포를 가집니다!');
    } else {
      console.log('⚠️ 불균형한 타입들:');
      imbalanced.forEach(row => {
        const animal = SAYU_ANIMALS[row.apt_type];
        console.log(`  ${row.apt_type} (${animal.name_ko}): ${row.count}명`);
      });
    }
    
    return {
      totalMapped,
      successCount,
      emptyTypes: emptyTypes.length,
      targetAchieved: totalMapped >= 50,
      allTypesCovered: emptyTypes.length === 0
    };
    
  } catch (error) {
    console.error('❌ 오류:', error.message);
  } finally {
    await pool.end();
  }
}

function generateSAYUProfile(artist, targetType) {
  const animalInfo = SAYU_ANIMALS[targetType];
  
  // 타입별 정밀한 차원 설정
  const typeProfiles = {
    'LAEF': { L: 75, S: 25, A: 85, R: 15, E: 80, M: 20, F: 85, C: 15 },
    'LAEC': { L: 75, S: 25, A: 60, R: 40, E: 80, M: 20, F: 65, C: 35 },
    'LAMF': { L: 70, S: 30, A: 75, R: 25, E: 25, M: 75, F: 80, C: 20 },
    'LAMC': { L: 70, S: 30, A: 70, R: 30, E: 20, M: 80, F: 20, C: 80 },
    'LREF': { L: 80, S: 20, A: 30, R: 70, E: 70, M: 30, F: 75, C: 25 },
    'LREC': { L: 80, S: 20, A: 35, R: 65, E: 75, M: 25, F: 45, C: 55 },
    'LRMF': { L: 75, S: 25, A: 40, R: 60, E: 30, M: 70, F: 70, C: 30 },
    'LRMC': { L: 75, S: 25, A: 30, R: 70, E: 20, M: 80, F: 15, C: 85 },
    'SAEF': { L: 30, S: 70, A: 80, R: 20, E: 75, M: 25, F: 80, C: 20 },
    'SAEC': { L: 25, S: 75, A: 65, R: 35, E: 70, M: 30, F: 55, C: 45 },
    'SAMF': { L: 25, S: 75, A: 85, R: 15, E: 30, M: 70, F: 75, C: 25 },
    'SAMC': { L: 20, S: 80, A: 70, R: 30, E: 25, M: 75, F: 30, C: 70 },
    'SREF': { L: 30, S: 70, A: 35, R: 65, E: 80, M: 20, F: 70, C: 30 },
    'SREC': { L: 25, S: 75, A: 40, R: 60, E: 70, M: 30, F: 50, C: 50 },
    'SRMF': { L: 30, S: 70, A: 45, R: 55, E: 25, M: 75, F: 65, C: 35 },
    'SRMC': { L: 25, S: 75, A: 20, R: 80, E: 20, M: 80, F: 25, C: 75 }
  };
  
  let dimensions = { ...typeProfiles[targetType] };
  
  // 국가/문화별 미세 조정
  const nationality = artist.nationality || artist.nationality_ko || '';
  if (nationality.includes('Korean') || nationality.includes('한국')) {
    dimensions.E += 10; dimensions.M -= 10;
    dimensions.L += 5; dimensions.S -= 5;
  } else if (nationality.includes('American') || nationality.includes('미국')) {
    dimensions.S += 10; dimensions.L -= 10;
    dimensions.F += 5; dimensions.C -= 5;
  } else if (nationality.includes('French') || nationality.includes('프랑스')) {
    dimensions.A += 10; dimensions.R -= 10;
    dimensions.E += 5; dimensions.M -= 5;
  } else if (nationality.includes('German') || nationality.includes('독일')) {
    dimensions.M += 10; dimensions.E -= 10;
    dimensions.C += 10; dimensions.F -= 10;
  }
  
  // 시대별 조정
  if (artist.birth_year) {
    if (artist.birth_year < 1600) { // 르네상스/바로크
      dimensions.R += 15; dimensions.A -= 15;
      dimensions.C += 15; dimensions.F -= 15;
    } else if (artist.birth_year >= 1600 && artist.birth_year < 1800) { // 고전주의
      dimensions.R += 10; dimensions.A -= 10;
      dimensions.M += 10; dimensions.E -= 10;
    } else if (artist.birth_year >= 1800 && artist.birth_year < 1900) { // 근대
      dimensions.E += 10; dimensions.M -= 10;
    } else if (artist.birth_year >= 1950) { // 현대
      dimensions.A += 15; dimensions.R -= 15;
      dimensions.S += 10; dimensions.L -= 10;
    }
  }
  
  // 경계값 조정
  Object.keys(dimensions).forEach(dim => {
    dimensions[dim] = Math.max(5, Math.min(95, dimensions[dim]));
  });
  
  return {
    meta: {
      method: 'final_completion_mapping',
      source: 'sayu_system_v3',
      artist_name: artist.name || artist.name_ko,
      analysis_date: new Date().toISOString()
    },
    dimensions: dimensions,
    primary_types: [
      {
        type: targetType,
        title: animalInfo.title,
        animal: animalInfo.name.toLowerCase(),
        name_ko: animalInfo.name_ko,
        weight: 0.85,
        confidence: 88
      }
    ]
  };
}

finalAPTCompletion();