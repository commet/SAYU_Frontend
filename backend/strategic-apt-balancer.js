const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// 부족한 4개 유형에 적합한 아티스트 프로필
const TARGET_TYPE_PROFILES = {
  'LAEC': {
    title: '감성 큐레이터 (고양이 🐱)',
    characteristics: '섬세하고 예술적, 개인적 감성, 구체적 표현, 직관적 큐레이션',
    ideal_artists: [
      { keywords: ['georgia okeefe', '조지아 오키프'], reason: '자연의 세밀한 관찰과 감성적 표현' },
      { keywords: ['mary cassatt', '메리 카사트'], reason: '모성애와 일상의 섬세한 감정 포착' },
      { keywords: ['berthe morisot', '베르트 모리조'], reason: '인상파 여성화가, 섬세한 감성' },
      { keywords: ['louise bourgeois', '루이즈 부르주아'], reason: '개인적 트라우마를 예술로 승화' },
      { keywords: ['frida kahlo', '프리다 칼로'], reason: '개인적 고통을 강렬한 감정으로 표현' },
      { keywords: ['yves klein', '이브 클라인'], reason: '색채에 대한 순수한 감성적 접근' },
      { keywords: ['agnes martin', '아그네스 마틴'], reason: '명상적이고 섬세한 추상 표현' }
    ]
  },
  
  'LREC': {
    title: '섬세한 감정가 (고슴도치 🦔)',
    characteristics: '내향적, 현실적 관찰, 섬세한 감정, 체계적 표현',
    ideal_artists: [
      { keywords: ['andrew wyeth', '앤드류 와이어스'], reason: '고독하고 세밀한 현실주의' },
      { keywords: ['edward hopper', '에드워드 호퍼'], reason: '도시의 고독과 소외감 표현' },
      { keywords: ['giorgio morandi', '조르조 모란디'], reason: '단순한 정물의 깊은 명상적 표현' },
      { keywords: ['박수근'], reason: '서민의 삶을 따뜻한 시선으로 관찰' },
      { keywords: ['변관식'], reason: '한국의 자연을 세밀하게 관찰한 동양화' },
      { keywords: ['vermeer', '베르메르'], reason: '일상의 조용한 순간들을 섬세하게 포착' },
      { keywords: ['chardin', '샤르댕'], reason: '정물화의 대가, 소박한 아름다움' }
    ]
  },
  
  'SREC': {
    title: '따뜻한 안내자 (오리 🦆)',
    characteristics: '사회적, 현실적, 감정적, 체계적 소통',
    ideal_artists: [
      { keywords: ['norman rockwell', '노먼 록웰'], reason: '미국의 일상을 따뜻하게 그린 대중적 화가' },
      { keywords: ['david hockney', '데이비드 호크니'], reason: '밝고 친근한 현대적 표현' },
      { keywords: ['kehinde wiley', '케힌데 와일리'], reason: '사회적 메시지를 아름답게 표현' },
      { keywords: ['kerry james marshall', '케리 제임스 마샬'], reason: '흑인 문화를 따뜻하게 기념' },
      { keywords: ['grant wood', '그랜트 우드'], reason: '아메리칸 고딕으로 유명한 서민적 화가' },
      { keywords: ['thomas kinkade', '토마스 킨케이드'], reason: '따뜻하고 감성적인 풍경화' },
      { keywords: ['애니메이션 작가'], reason: '대중과 소통하는 친근한 예술' }
    ]
  },
  
  'SRMF': {
    title: '지식 멘토 (코끼리 🐘)',
    characteristics: '사회적, 현실적, 의미 추구, 자유로운 탐구',
    ideal_artists: [
      { keywords: ['leonardo da vinci', '다빈치'], reason: '과학과 예술의 융합, 지식 탐구' },
      { keywords: ['albrecht durer', '뒤러'], reason: '정밀한 관찰과 기술적 완성도' },
      { keywords: ['mc escher', '에셔'], reason: '수학적 사고와 예술의 결합' },
      { keywords: ['josef albers', '요제프 알베르스'], reason: '색채 이론의 교육자 겸 작가' },
      { keywords: ['ai weiwei', '아이웨이웨이'], reason: '사회적 메시지와 교육적 활동' },
      { keywords: ['christo', '크리스토'], reason: '대규모 프로젝트의 기획자' },
      { keywords: ['olafur eliasson', '올라퍼 엘리아슨'], reason: '과학과 예술의 교육적 융합' },
      { keywords: ['james turrell', '제임스 터렐'], reason: '빛과 공간에 대한 지식 기반 작업' }
    ]
  }
};

// 16가지 SAYU 동물 타입 정의
const SAYU_ANIMALS = {
  'LAEF': 'Fox',      'LAEC': 'Cat',      'LAMF': 'Owl',      'LAMC': 'Turtle',
  'LREF': 'Chameleon', 'LREC': 'Hedgehog', 'LRMF': 'Octopus',  'LRMC': 'Beaver',
  'SAEF': 'Butterfly', 'SAEC': 'Penguin',  'SAMF': 'Parrot',   'SAMC': 'Deer',
  'SREF': 'Dog',       'SREC': 'Duck',     'SRMF': 'Elephant', 'SRMC': 'Eagle'
};

async function strategicAPTBalancing() {
  try {
    console.log('🎯 전략적 APT 밸런싱 시작');
    console.log('목표: LAEC, LREC, SREC, SRMF 타입에 적합한 아티스트 발굴\n');
    
    // 1. 현재 APT 분포 확인
    const currentDistribution = await pool.query(`
      SELECT 
        (apt_profile->'primary_types'->0->>'type') as apt_type,
        COUNT(*) as count
      FROM artist_apt_mappings 
      WHERE apt_profile IS NOT NULL
      GROUP BY (apt_profile->'primary_types'->0->>'type')
      ORDER BY count DESC
    `);
    
    console.log('📊 현재 APT 분포:');
    currentDistribution.rows.forEach(row => {
      const animal = SAYU_ANIMALS[row.apt_type] || '?';
      console.log(`  ${row.apt_type} (${animal}): ${row.count}명`);
    });
    
    // 2. 각 타겟 유형별로 후보 아티스트 검색
    const allCandidates = [];
    
    for (const [targetType, profile] of Object.entries(TARGET_TYPE_PROFILES)) {
      console.log(`\n🔍 ${targetType} (${profile.title}) 후보 검색:`);
      
      // 각 이상적 아티스트 키워드로 검색
      for (const artist of profile.ideal_artists) {
        const searchQueries = artist.keywords.map(keyword => 
          `(name ILIKE '%${keyword}%' OR name_ko ILIKE '%${keyword}%')`
        ).join(' OR ');
        
        const candidates = await pool.query(`
          SELECT 
            id, name, name_ko, nationality, nationality_ko,
            birth_year, death_year, era, bio, bio_ko
          FROM artists 
          WHERE 
            (${searchQueries})
            AND name NOT ILIKE '%after %' 
            AND name NOT ILIKE '%attributed%'
            AND name NOT ILIKE '%imitator%'
            AND name NOT ILIKE '%workshop%'
            AND name NOT ILIKE '%circle of%'
            AND name NOT ILIKE '%school of%'
            AND id NOT IN (
              SELECT artist_id FROM artist_apt_mappings 
              WHERE apt_profile IS NOT NULL
            )
          ORDER BY 
            CASE 
              WHEN name_ko IS NOT NULL THEN 1
              WHEN birth_year IS NOT NULL THEN 2
              ELSE 3
            END
          LIMIT 3
        `);
        
        candidates.rows.forEach(candidate => {
          console.log(`  ✅ ${candidate.name || candidate.name_ko} (${candidate.nationality || candidate.nationality_ko}, ${candidate.birth_year || '?'}-${candidate.death_year || 'present'})`);
          console.log(`     → ${artist.reason}`);
          
          allCandidates.push({
            ...candidate,
            target_type: targetType,
            reasoning: artist.reason,
            profile: profile
          });
        });
      }
    }
    
    console.log(`\n📋 총 ${allCandidates.length}명의 후보 아티스트 발견`);
    
    // 3. 각 후보에 대해 APT 프로필 생성
    const aptMappings = [];
    
    for (const candidate of allCandidates) {
      const aptProfile = generateTargetedAPTProfile(candidate);
      
      aptMappings.push({
        artist_id: candidate.id,
        name: candidate.name || candidate.name_ko,
        nationality: candidate.nationality || candidate.nationality_ko,
        target_type: candidate.target_type,
        apt_profile: aptProfile,
        reasoning: candidate.reasoning
      });
    }
    
    // 4. 타입별 분포 균형 맞추기
    console.log('\n⚖️ 타입별 균형 조정:');
    const balancedMappings = balanceTypeDistribution(aptMappings);
    
    // 5. 데이터베이스 적용 준비
    const dbInsertData = balancedMappings.map(mapping => ({
      artist_id: mapping.artist_id,
      apt_profile: JSON.stringify(mapping.apt_profile),
      mapping_method: 'strategic_balancing_v1',
      confidence_score: mapping.apt_profile.meta.confidence,
      mapped_by: 'sayu_strategic_balancer',
      mapping_notes: `Target: ${mapping.target_type} - ${mapping.reasoning}`
    }));
    
    // 6. 결과 저장
    require('fs').writeFileSync(
      'strategic-apt-balance-results.json',
      JSON.stringify(balancedMappings, null, 2)
    );
    
    require('fs').writeFileSync(
      'strategic-apt-db-insert.json',
      JSON.stringify(dbInsertData, null, 2)
    );
    
    console.log('\n💾 결과 저장 완료:');
    console.log('- strategic-apt-balance-results.json: 상세 분석 결과');
    console.log('- strategic-apt-db-insert.json: DB 삽입용 데이터');
    
    // 7. 최종 분포 예상
    console.log('\n🎯 예상 최종 분포:');
    const finalDistribution = {};
    balancedMappings.forEach(mapping => {
      const type = mapping.apt_profile.primary_types[0].type;
      finalDistribution[type] = (finalDistribution[type] || 0) + 1;
    });
    
    Object.entries(finalDistribution)
      .sort(([,a], [,b]) => b - a)
      .forEach(([type, count]) => {
        const animal = SAYU_ANIMALS[type] || '?';
        console.log(`  ${type} (${animal}): +${count}명`);
      });
    
    return balancedMappings;
    
  } catch (error) {
    console.error('❌ 오류:', error.message);
  } finally {
    await pool.end();
  }
}

function generateTargetedAPTProfile(candidate) {
  const targetType = candidate.target_type;
  const profile = candidate.profile;
  
  // 타겟 타입에 맞는 차원 점수 생성
  let dimensions = { L: 50, S: 50, A: 50, R: 50, E: 50, M: 50, F: 50, C: 50 };
  
  // 타겟 타입별 강한 경향 설정
  switch (targetType) {
    case 'LAEC': // 고양이 - 감성 큐레이터
      dimensions = { L: 75, S: 25, A: 60, R: 40, E: 80, M: 20, F: 65, C: 35 };
      break;
    case 'LREC': // 고슴도치 - 섬세한 감정가  
      dimensions = { L: 80, S: 20, A: 35, R: 65, E: 75, M: 25, F: 45, C: 55 };
      break;
    case 'SREC': // 오리 - 따뜻한 안내자
      dimensions = { L: 25, S: 75, A: 40, R: 60, E: 70, M: 30, F: 50, C: 50 };
      break;
    case 'SRMF': // 코끼리 - 지식 멘토
      dimensions = { L: 30, S: 70, A: 45, R: 55, E: 25, M: 75, F: 65, C: 35 };
      break;
  }
  
  // 작가별 미세 조정
  const name = (candidate.name || candidate.name_ko || '').toLowerCase();
  const nationality = candidate.nationality || candidate.nationality_ko || '';
  
  // 국가별 조정
  if (nationality.includes('Korean') || nationality.includes('한국')) {
    dimensions.E += 10; // 한국적 정서
    dimensions.L += 5;  // 내성적 성향
  } else if (nationality.includes('American') || nationality.includes('미국')) {
    dimensions.S += 10; // 사회적 성향
    dimensions.F += 5;  // 자유로운 표현
  } else if (nationality.includes('French') || nationality.includes('프랑스')) {
    dimensions.A += 10; // 추상적 성향
    dimensions.E += 5;  // 감성적 접근
  }
  
  // 시대별 조정
  if (candidate.birth_year) {
    if (candidate.birth_year < 1800) {
      dimensions.R += 15; dimensions.A -= 15; // 고전적 현실주의
      dimensions.C += 10; dimensions.F -= 10; // 체계적 접근
    } else if (candidate.birth_year > 1950) {
      dimensions.A += 10; dimensions.R -= 10; // 현대적 추상
      dimensions.S += 5;  dimensions.L -= 5;  // 사회적 참여
    }
  }
  
  // 경계값 조정
  Object.keys(dimensions).forEach(dim => {
    dimensions[dim] = Math.max(10, Math.min(90, dimensions[dim]));
  });
  
  // 대립 차원 균형
  dimensions.S = 100 - dimensions.L;
  dimensions.R = 100 - dimensions.A;
  dimensions.M = 100 - dimensions.E;
  dimensions.C = 100 - dimensions.F;
  
  return {
    dimensions,
    primary_types: [
      { type: targetType, weight: 0.85 }
    ],
    meta: {
      confidence: 0.8,
      source: 'strategic_targeting',
      keywords: [targetType, profile.title, nationality].filter(Boolean),
      reasoning: [candidate.reasoning, `타겟 타입: ${targetType}`]
    }
  };
}

function balanceTypeDistribution(mappings) {
  // 각 타입별로 최대 10명까지만 선택하여 균형 유지
  const typeGroups = {};
  
  mappings.forEach(mapping => {
    const type = mapping.target_type;
    if (!typeGroups[type]) typeGroups[type] = [];
    typeGroups[type].push(mapping);
  });
  
  const balanced = [];
  Object.entries(typeGroups).forEach(([type, group]) => {
    // 신뢰도와 유명도 기준으로 정렬하여 상위 선택
    const sorted = group.sort((a, b) => {
      const scoreA = (a.apt_profile.meta.confidence || 0) + (a.name.length > 10 ? 0.1 : 0);
      const scoreB = (b.apt_profile.meta.confidence || 0) + (b.name.length > 10 ? 0.1 : 0);
      return scoreB - scoreA;
    });
    
    // 각 타입당 최대 8명 선택
    balanced.push(...sorted.slice(0, 8));
    console.log(`${type}: ${Math.min(8, sorted.length)}명 선택`);
  });
  
  return balanced;
}

strategicAPTBalancing();