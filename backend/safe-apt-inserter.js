const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// 부족한 타입들에 대한 타겟 아티스트 매핑
const TARGET_MAPPINGS = {
  'LAEC': [ // 고양이 - 감성 큐레이터
    { keywords: ['georgia o\'keeffe', 'okeefe'], type: 'LAEC' },
    { keywords: ['mary cassatt', 'cassatt'], type: 'LAEC' },
    { keywords: ['berthe morisot', 'morisot'], type: 'LAEC' },
    { keywords: ['louise bourgeois', 'bourgeois'], type: 'LAEC' },
    { keywords: ['frida kahlo', 'kahlo'], type: 'LAEC' }
  ],
  
  'LREC': [ // 고슴도치 - 섬세한 감정가
    { keywords: ['johannes vermeer', 'vermeer'], type: 'LREC' },
    { keywords: ['jean chardin', 'chardin'], type: 'LREC' },
    { keywords: ['andrew wyeth', 'wyeth'], type: 'LREC' },
    { keywords: ['edward hopper', 'hopper'], type: 'LREC' },
    { keywords: ['박수근'], type: 'LREC' }
  ],
  
  'SREC': [ // 오리 - 따뜻한 안내자
    { keywords: ['david hockney', 'hockney'], type: 'SREC' },
    { keywords: ['norman rockwell', 'rockwell'], type: 'SREC' },
    { keywords: ['kehinde wiley', 'wiley'], type: 'SREC' },
    { keywords: ['kerry james marshall', 'marshall'], type: 'SREC' }
  ],
  
  'SRMF': [ // 코끼리 - 지식 멘토
    { keywords: ['ai weiwei'], type: 'SRMF' },
    { keywords: ['olafur eliasson', 'eliasson'], type: 'SRMF' },
    { keywords: ['james turrell', 'turrell'], type: 'SRMF' },
    { keywords: ['yayoi kusama', 'kusama'], type: 'SRMF' },
    { keywords: ['leonardo da vinci', 'leonardo'], type: 'SRMF' }
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

async function safeAPTInsert() {
  try {
    console.log('🔒 안전한 APT 매핑 삽입 시작\n');
    
    // 1. 현재 상태 확인
    const current = await pool.query(`
      SELECT COUNT(*) as total,
             string_agg(DISTINCT (apt_profile->'primary_types'->0->>'type'), ', ' ORDER BY (apt_profile->'primary_types'->0->>'type')) as types
      FROM artist_apt_mappings 
      WHERE apt_profile IS NOT NULL
    `);
    
    console.log(`📊 현재 상태: ${current.rows[0].total}명 매핑됨`);
    console.log(`📝 매핑된 타입: ${current.rows[0].types || '없음'}\n`);
    
    let successCount = 0;
    let skipCount = 0;
    
    // 2. 각 타겟 타입별로 아티스트 찾고 매핑
    for (const [targetType, mappings] of Object.entries(TARGET_MAPPINGS)) {
      console.log(`🎯 ${targetType} (${SAYU_ANIMALS[targetType].title}) 처리 중:`);
      
      for (const mapping of mappings) {
        for (const keyword of mapping.keywords) {
          // 아티스트 검색
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
            
            // 이미 매핑된 아티스트인지 확인
            const existing = await pool.query(`
              SELECT id FROM artist_apt_mappings WHERE artist_id = $1
            `, [artist.id]);
            
            if (existing.rows.length === 0) {
              // 새로운 매핑 생성
              const aptProfile = generateSAYUProfile(artist, targetType);
              
              try {
                await pool.query(`
                  INSERT INTO artist_apt_mappings 
                  (artist_id, apt_profile, mapping_method, confidence_score, mapped_by, mapping_notes)
                  VALUES ($1, $2, $3, $4, $5, $6)
                `, [
                  artist.id,
                  JSON.stringify(aptProfile),
                  'safe_targeted_mapping',
                  aptProfile.primary_types[0].confidence / 100,
                  'sayu_safe_mapper',
                  `Targeted mapping: ${keyword} → ${targetType}`
                ]);
                
                console.log(`  ✅ ${artist.name || artist.name_ko} → ${targetType}`);
                successCount++;
                break; // 이 타입에서 하나 찾았으면 다음으로
                
              } catch (err) {
                console.log(`  ❌ 삽입 실패: ${err.message}`);
              }
            } else {
              console.log(`  ⚠️ ${artist.name || artist.name_ko} 이미 매핑됨`);
              skipCount++;
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
    
    console.log('\n🎯 최종 APT 분포:');
    let totalMapped = 0;
    final.rows.forEach(row => {
      if (row.apt_type) {
        const animal = SAYU_ANIMALS[row.apt_type];
        console.log(`  ${row.apt_type} (${animal.name_ko} ${animal.title}): ${row.count}명`);
        totalMapped += parseInt(row.count);
      }
    });
    
    console.log(`\n📈 총 매핑: ${totalMapped}명`);
    console.log(`✅ 새로 추가: ${successCount}명`);
    console.log(`⚠️ 스킵: ${skipCount}명`);
    
    // 4. 빈 타입 확인
    const allTypes = Object.keys(SAYU_ANIMALS);
    const mappedTypes = final.rows.map(row => row.apt_type).filter(Boolean);
    const emptyTypes = allTypes.filter(type => !mappedTypes.includes(type));
    
    if (emptyTypes.length > 0) {
      console.log(`\n🚨 아직 비어있는 타입: ${emptyTypes.length}개`);
      emptyTypes.forEach(type => {
        const animal = SAYU_ANIMALS[type];
        console.log(`  - ${type} (${animal.name_ko} ${animal.title})`);
      });
    } else {
      console.log('\n🌟 모든 16가지 타입에 아티스트 매핑 완료!');
    }
    
    return {
      totalMapped,
      successCount,
      skipCount,
      emptyTypes
    };
    
  } catch (error) {
    console.error('❌ 오류:', error.message);
  } finally {
    await pool.end();
  }
}

function generateSAYUProfile(artist, targetType) {
  const animalInfo = SAYU_ANIMALS[targetType];
  
  // 타입별 기본 차원 설정
  const typeProfiles = {
    'LAEC': { L: 75, S: 25, A: 60, R: 40, E: 80, M: 20, F: 65, C: 35 },
    'LREC': { L: 80, S: 20, A: 35, R: 65, E: 75, M: 25, F: 45, C: 55 },
    'SREC': { L: 25, S: 75, A: 40, R: 60, E: 70, M: 30, F: 50, C: 50 },
    'SRMF': { L: 30, S: 70, A: 45, R: 55, E: 25, M: 75, F: 65, C: 35 }
  };
  
  const dimensions = typeProfiles[targetType] || { L: 50, S: 50, A: 50, R: 50, E: 50, M: 50, F: 50, C: 50 };
  
  // 국가별 미세 조정
  const nationality = artist.nationality || artist.nationality_ko || '';
  if (nationality.includes('Korean') || nationality.includes('한국')) {
    dimensions.E += 10;
    dimensions.L += 5;
  } else if (nationality.includes('American') || nationality.includes('미국')) {
    dimensions.S += 10;
    dimensions.F += 5;
  }
  
  return {
    meta: {
      method: 'safe_targeted_mapping',
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
        confidence: 85
      }
    ]
  };
}

safeAPTInsert();