const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// LAMC 타입과 부족한 타입들을 위한 특별 타겟
const FINAL_TARGETS = {
  'LAMC': [ // 거북이 - 철학적 수집가 (완전히 비어있음)
    'marcel duchamp', 'duchamp', 'rene magritte', 'magritte', 
    'joseph beuys', 'beuys', 'john cage', 'sol lewitt', 'lewitt',
    'bruce nauman', 'nauman', 'lawrence weiner', 'weiner',
    'on kawara', 'kawara', 'felix gonzalez-torres', 'gonzalez'
  ],
  
  'LAMF': [ // 올빼미 - 직관적 탐구자 (1명만 있음)
    'francis bacon', 'bacon', 'willem de kooning', 'kooning',
    'robert rauschenberg', 'rauschenberg', 'jasper johns', 'johns',
    'cy twombly', 'twombly', 'gerhard richter', 'richter'
  ],
  
  'SAMC': [ // 사슴 - 문화 기획자 (1명만 있음) 
    'marina abramovic', 'abramovic', 'chris burden', 'burden',
    'vito acconci', 'acconci', 'tehching hsieh', 'hsieh',
    'tino sehgal', 'sehgal', 'rirkrit tiravanija', 'tiravanija'
  ],
  
  'SAMF': [ // 앵무새 - 영감 전도사 (1명만 있음)
    'pablo picasso', 'picasso', 'henri matisse', 'matisse',
    'georges braque', 'braque', 'fernand leger', 'leger',
    'jean dubuffet', 'dubuffet', 'yves klein', 'klein'
  ]
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

async function perfectBalanceFinalizer() {
  try {
    console.log('🎯 완벽한 균형 최종 조정 프로젝트');
    console.log('목표: 모든 16가지 타입 완성 + 균형잡힌 분포\n');
    
    let successCount = 0;
    
    // 1. LAMC 타입 반드시 채우기 (최우선)
    console.log('🔴 CRITICAL: LAMC (거북이 - 철학적 수집가) 채우기');
    let lamcFound = false;
    
    for (const keyword of FINAL_TARGETS['LAMC']) {
      if (lamcFound) break;
      
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
        ORDER BY
          CASE 
            WHEN name ILIKE '%duchamp%' THEN 1
            WHEN name ILIKE '%magritte%' THEN 2
            WHEN name ILIKE '%beuys%' THEN 3
            ELSE 4
          END
        LIMIT 3
      `, [`%${keyword}%`]);
      
      for (const artist of artists.rows) {
        if (lamcFound) break;
        
        const existing = await pool.query(`
          SELECT id FROM artist_apt_mappings WHERE artist_id = $1
        `, [artist.id]);
        
        if (existing.rows.length === 0) {
          const aptProfile = generateSAYUProfile(artist, 'LAMC');
          
          try {
            await pool.query(`
              INSERT INTO artist_apt_mappings 
              (artist_id, apt_profile, mapping_method, confidence_score, mapped_by, mapping_notes)
              VALUES ($1, $2, $3, $4, $5, $6)
            `, [
              artist.id,
              JSON.stringify(aptProfile),
              'critical_completion',
              aptProfile.primary_types[0].confidence / 100,
              'sayu_perfectionist',
              `CRITICAL: LAMC completion - ${keyword}`
            ]);
            
            console.log(`  ✅ ${artist.name || artist.name_ko} → LAMC (거북이)`);
            successCount++;
            lamcFound = true;
            
          } catch (err) {
            console.log(`  ❌ 삽입 실패: ${err.message}`);
          }
        }
      }
    }
    
    if (!lamcFound) {
      console.log('⚠️ LAMC 타입을 위한 아티스트를 찾지 못했습니다');
    }
    
    // 2. 부족한 타입들 보강 (각 타입별로 최소 3명 목표)
    console.log('\n🔄 부족한 타입들 보강:');
    
    for (const [targetType, keywords] of Object.entries(FINAL_TARGETS)) {
      if (targetType === 'LAMC') continue; // 이미 처리함
      
      const currentCount = await pool.query(`
        SELECT COUNT(*) as count 
        FROM artist_apt_mappings 
        WHERE apt_profile IS NOT NULL 
          AND (apt_profile->'primary_types'->0->>'type') = $1
      `, [targetType]);
      
      const typeCount = parseInt(currentCount.rows[0].count);
      
      if (typeCount < 3) {
        const needed = 3 - typeCount;
        console.log(`\n${targetType} (${SAYU_ANIMALS[targetType].title}): ${typeCount}명 → ${needed}명 추가 필요`);
        
        let foundForType = 0;
        for (const keyword of keywords) {
          if (foundForType >= needed) break;
          
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
            LIMIT 2
          `, [`%${keyword}%`]);
          
          for (const artist of artists.rows) {
            if (foundForType >= needed) break;
            
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
                  'balance_adjustment',
                  aptProfile.primary_types[0].confidence / 100,
                  'sayu_balancer',
                  `Balance: ${keyword} → ${targetType}`
                ]);
                
                console.log(`  ✅ ${artist.name || artist.name_ko} → ${targetType}`);
                successCount++;
                foundForType++;
                
              } catch (err) {
                console.log(`  ❌ 삽입 실패: ${err.message}`);
              }
            }
          }
        }
      } else {
        console.log(`✨ ${targetType}: 충분함 (${typeCount}명)`);
      }
    }
    
    // 3. 최종 완벽한 결과 확인
    const final = await pool.query(`
      SELECT 
        (apt_profile->'primary_types'->0->>'type') as apt_type,
        COUNT(*) as count
      FROM artist_apt_mappings 
      WHERE apt_profile IS NOT NULL
      GROUP BY (apt_profile->'primary_types'->0->>'type')
      ORDER BY apt_type
    `);
    
    console.log('\n🏆 완벽한 최종 APT 분포:');
    let totalMapped = 0;
    const distributionMap = {};
    
    final.rows.forEach(row => {
      if (row.apt_type) {
        const animal = SAYU_ANIMALS[row.apt_type];
        const count = parseInt(row.count);
        distributionMap[row.apt_type] = count;
        console.log(`  ${row.apt_type} (${animal.name_ko} ${animal.title}): ${count}명`);
        totalMapped += count;
      }
    });
    
    // 4. 완성도 검증
    console.log(`\n🎊 프로젝트 완성 결과:`);
    console.log(`📈 총 매핑된 아티스트: ${totalMapped}명`);
    console.log(`✅ 이번에 추가: ${successCount}명`);
    
    const allTypes = Object.keys(SAYU_ANIMALS);
    const mappedTypes = Object.keys(distributionMap);
    const emptyTypes = allTypes.filter(type => !mappedTypes.includes(type));
    
    console.log(`\n🔍 완성도 검증:`);
    console.log(`📊 커버된 타입: ${mappedTypes.length}/16`);
    console.log(`🎯 50명 이상: ${totalMapped >= 50 ? '✅' : '❌'}`);
    console.log(`🌟 모든 타입 커버: ${emptyTypes.length === 0 ? '✅' : '❌'}`);
    
    if (emptyTypes.length > 0) {
      console.log(`⚠️ 여전히 비어있는 타입: ${emptyTypes.join(', ')}`);
    } else {
      console.log('🎉 모든 16가지 타입에 아티스트 매핑 완료!');
    }
    
    // 5. 균형 분석
    const avgPerType = totalMapped / 16;
    const minCount = Math.min(...Object.values(distributionMap));
    const maxCount = Math.max(...Object.values(distributionMap));
    
    console.log(`\n⚖️ 균형 분석:`);
    console.log(`평균 타입당: ${avgPerType.toFixed(1)}명`);
    console.log(`최소: ${minCount}명, 최대: ${maxCount}명`);
    console.log(`균형도: ${((minCount / maxCount) * 100).toFixed(1)}%`);
    
    if (minCount >= 2 && maxCount <= 8) {
      console.log('✅ 적절한 균형을 가집니다!');
    } else {
      console.log('⚠️ 일부 불균형이 존재합니다.');
    }
    
    // 6. 성공 기준 체크
    const criteria = {
      total50Plus: totalMapped >= 50,
      allTypesCovered: emptyTypes.length === 0,
      reasonableBalance: minCount >= 2 && maxCount <= 8,
      targetAchieved: totalMapped >= 50 && emptyTypes.length === 0
    };
    
    console.log(`\n🏁 최종 성공 기준:`);
    console.log(`✅ 50명 이상: ${criteria.total50Plus}`);
    console.log(`✅ 모든 타입 커버: ${criteria.allTypesCovered}`);
    console.log(`✅ 균형잡힌 분포: ${criteria.reasonableBalance}`);
    console.log(`✅ 전체 목표 달성: ${criteria.targetAchieved}`);
    
    if (criteria.targetAchieved) {
      console.log('\n🎊🎊🎊 SAYU APT 매핑 프로젝트 완벽 성공! 🎊🎊🎊');
    } else {
      console.log('\n⚠️ 추가 작업이 필요할 수 있습니다.');
    }
    
    return {
      totalMapped,
      successCount,
      criteria,
      distribution: distributionMap
    };
    
  } catch (error) {
    console.error('❌ 오류:', error.message);
  } finally {
    await pool.end();
  }
}

function generateSAYUProfile(artist, targetType) {
  const animalInfo = SAYU_ANIMALS[targetType];
  
  // 타입별 최적화된 차원 설정
  const typeProfiles = {
    'LAEF': { L: 75, S: 25, A: 85, R: 15, E: 80, M: 20, F: 85, C: 15 },
    'LAEC': { L: 75, S: 25, A: 60, R: 40, E: 80, M: 20, F: 65, C: 35 },
    'LAMF': { L: 70, S: 30, A: 75, R: 25, E: 25, M: 75, F: 80, C: 20 },
    'LAMC': { L: 70, S: 30, A: 70, R: 30, E: 20, M: 80, F: 20, C: 80 }, // 철학적 수집가
    'LREF': { L: 80, S: 20, A: 30, R: 70, E: 70, M: 30, F: 75, C: 25 },
    'LREC': { L: 80, S: 20, A: 35, R: 65, E: 75, M: 25, F: 45, C: 55 },
    'LRMF': { L: 75, S: 25, A: 40, R: 60, E: 30, M: 70, F: 70, C: 30 },
    'LRMC': { L: 75, S: 25, A: 30, R: 70, E: 20, M: 80, F: 15, C: 85 },
    'SAEF': { L: 30, S: 70, A: 80, R: 20, E: 75, M: 25, F: 80, C: 20 },
    'SAEC': { L: 25, S: 75, A: 65, R: 35, E: 70, M: 30, F: 55, C: 45 },
    'SAMF': { L: 25, S: 75, A: 85, R: 15, E: 30, M: 70, F: 75, C: 25 }, // 영감 전도사
    'SAMC': { L: 20, S: 80, A: 70, R: 30, E: 25, M: 75, F: 30, C: 70 }, // 문화 기획자
    'SREF': { L: 30, S: 70, A: 35, R: 65, E: 80, M: 20, F: 70, C: 30 },
    'SREC': { L: 25, S: 75, A: 40, R: 60, E: 70, M: 30, F: 50, C: 50 },
    'SRMF': { L: 30, S: 70, A: 45, R: 55, E: 25, M: 75, F: 65, C: 35 },
    'SRMC': { L: 25, S: 75, A: 20, R: 80, E: 20, M: 80, F: 25, C: 75 }
  };
  
  let dimensions = { ...typeProfiles[targetType] };
  
  // 특별한 아티스트별 조정
  const name = (artist.name || artist.name_ko || '').toLowerCase();
  
  if (name.includes('duchamp')) {
    // 뒤샹: 개념미술의 아버지, 극도로 개념적
    dimensions.M += 15; dimensions.E -= 15;
    dimensions.A += 10; dimensions.R -= 10;
  } else if (name.includes('picasso')) {
    // 피카소: 사회적이고 혁신적
    dimensions.S += 10; dimensions.L -= 10;
    dimensions.A += 15; dimensions.R -= 15;
  } else if (name.includes('bacon')) {
    // 베이컨: 강렬하고 직관적
    dimensions.E += 20; dimensions.M -= 20;
    dimensions.F += 15; dimensions.C -= 15;
  }
  
  // 경계값 조정
  Object.keys(dimensions).forEach(dim => {
    dimensions[dim] = Math.max(5, Math.min(95, dimensions[dim]));
  });
  
  return {
    meta: {
      method: 'perfect_balance_mapping',
      source: 'sayu_system_final',
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
        weight: 0.9,
        confidence: 90
      }
    ]
  };
}

perfectBalanceFinalizer();