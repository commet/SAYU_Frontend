const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// 정교한 아티스트 APT 프로필 데이터베이스
const ARTIST_APT_PROFILES = {
  // 후기 인상파 / 표현주의
  'van gogh': {
    dimensions: { L: 85, S: 15, A: 90, R: 10, E: 95, M: 5, F: 80, C: 20 },
    types: [{ type: 'LAEF', weight: 0.8 }, { type: 'LAEC', weight: 0.2 }],
    keywords: ['고독', '열정', '감정폭발', '색채마술사'],
    reasoning: '극도로 개인적이고 감정적인 예술 세계, 자유로운 붓터치로 내면 표현',
    confidence: 0.95
  },
  
  'picasso': {
    dimensions: { L: 25, S: 75, A: 85, R: 15, E: 40, M: 60, F: 70, C: 30 },
    types: [{ type: 'SAMF', weight: 0.6 }, { type: 'SAEF', weight: 0.3 }, { type: 'SAMC', weight: 0.1 }],
    keywords: ['혁신', '사교적', '다작', '실험정신'],
    reasoning: '매우 사교적이며 지속적인 스타일 혁신, 개념적 접근',
    confidence: 0.95
  },
  
  'monet': {
    dimensions: { L: 60, S: 40, A: 85, R: 15, E: 75, M: 25, F: 90, C: 10 },
    types: [{ type: 'LAEF', weight: 0.7 }, { type: 'SAEF', weight: 0.3 }],
    keywords: ['빛', '순간포착', '자연주의', '감성'],
    reasoning: '빛과 색채의 순간적 변화를 감성적으로 포착하는 자유로운 스타일',
    confidence: 0.9
  },
  
  'leonardo': {
    dimensions: { L: 70, S: 30, A: 30, R: 70, E: 20, M: 80, F: 15, C: 85 },
    types: [{ type: 'LRMC', weight: 0.8 }, { type: 'LRMF', weight: 0.2 }],
    keywords: ['과학', '완벽주의', '해부학', '체계적'],
    reasoning: '과학적 관찰과 체계적 연구에 기반한 정밀한 예술',
    confidence: 0.95
  },
  
  'michelangelo': {
    dimensions: { L: 75, S: 25, A: 20, R: 80, E: 30, M: 70, F: 25, C: 75 },
    types: [{ type: 'LRMC', weight: 0.7 }, { type: 'LREC', weight: 0.3 }],
    keywords: ['조각적', '영웅적', '고독한천재', '완벽추구'],
    reasoning: '고독한 완벽주의자, 인체의 이상적 표현 추구',
    confidence: 0.9
  },
  
  'warhol': {
    dimensions: { L: 20, S: 80, A: 60, R: 40, E: 30, M: 70, F: 40, C: 60 },
    types: [{ type: 'SAMC', weight: 0.7 }, { type: 'SAMF', weight: 0.3 }],
    keywords: ['팝아트', '대중문화', '상업적', '반복'],
    reasoning: '대중문화와 상업 예술의 의미를 탐구하는 사회적 아티스트',
    confidence: 0.85
  },
  
  'rothko': {
    dimensions: { L: 80, S: 20, A: 95, R: 5, E: 90, M: 10, F: 85, C: 15 },
    types: [{ type: 'LAEF', weight: 0.9 }, { type: 'LAEC', weight: 0.1 }],
    keywords: ['명상적', '색면', '영성', '순수감정'],
    reasoning: '순수한 색채를 통한 깊은 영적 경험 추구',
    confidence: 0.95
  },
  
  'pollock': {
    dimensions: { L: 70, S: 30, A: 95, R: 5, E: 85, M: 15, F: 95, C: 5 },
    types: [{ type: 'LAEF', weight: 0.8 }, { type: 'LAMF', weight: 0.2 }],
    keywords: ['액션페인팅', '무의식', '자동기법', '역동성'],
    reasoning: '무의식과 신체 움직임의 자유로운 표현',
    confidence: 0.9
  },
  
  'basquiat': {
    dimensions: { L: 60, S: 40, A: 80, R: 20, E: 85, M: 15, F: 85, C: 15 },
    types: [{ type: 'LAEF', weight: 0.7 }, { type: 'SAEF', weight: 0.3 }],
    keywords: ['원시성', '거리예술', '즉흥성', '사회비판'],
    reasoning: '원시적 에너지와 즉흥적 표현, 사회 현실에 대한 감정적 반응',
    confidence: 0.85
  },
  
  'banksy': {
    dimensions: { L: 85, S: 15, A: 70, R: 30, E: 40, M: 60, F: 60, C: 40 },
    types: [{ type: 'LAMF', weight: 0.6 }, { type: 'LAMC', weight: 0.4 }],
    keywords: ['익명성', '사회비판', '정치적', '게릴라'],
    reasoning: '익명성을 통한 사회 비판, 개념적이면서도 감각적',
    confidence: 0.8
  },
  
  // 한국 작가들
  '이중섭': {
    dimensions: { L: 85, S: 15, A: 75, R: 25, E: 95, M: 5, F: 80, C: 20 },
    types: [{ type: 'LAEF', weight: 0.8 }, { type: 'LAEC', weight: 0.2 }],
    keywords: ['향수', '가족사랑', '서정성', '민족혼'],
    reasoning: '극도로 개인적이고 서정적인 감정 표현, 한국적 정서',
    confidence: 0.9
  },
  
  '박수근': {
    dimensions: { L: 70, S: 30, A: 40, R: 60, E: 80, M: 20, F: 60, C: 40 },
    types: [{ type: 'LREC', weight: 0.6 }, { type: 'LREF', weight: 0.4 }],
    keywords: ['서민적', '소박함', '토속성', '인간미'],
    reasoning: '서민의 삶을 따뜻한 시선으로 그린 서정적 리얼리즘',
    confidence: 0.85
  },
  
  '김환기': {
    dimensions: { L: 65, S: 35, A: 85, R: 15, E: 75, M: 25, F: 80, C: 20 },
    types: [{ type: 'LAEF', weight: 0.7 }, { type: 'LAEC', weight: 0.3 }],
    keywords: ['서정추상', '달항아리', '점화', '정신성'],
    reasoning: '한국적 정서를 추상화한 서정적 표현',
    confidence: 0.85
  }
};

// 스타일/운동별 APT 경향
const ART_MOVEMENT_TENDENCIES = {
  'Impressionism': { A: +20, E: +15, F: +20 },
  'Expressionism': { L: +15, A: +25, E: +30, F: +15 },
  'Cubism': { A: +30, M: +20, C: +10 },
  'Surrealism': { A: +35, E: +20, F: +25 },
  'Abstract Expressionism': { L: +20, A: +40, E: +25, F: +30 },
  'Pop Art': { S: +25, M: +15, C: +10 },
  'Minimalism': { L: +20, M: +25, C: +30 },
  'Renaissance': { R: +30, M: +20, C: +25 },
  'Baroque': { R: +20, E: +15, C: +20 },
  'Romanticism': { E: +30, F: +20 },
  'Realism': { R: +35, M: +10, C: +15 }
};

// 국가/문화별 APT 경향  
const CULTURAL_TENDENCIES = {
  'Korean': { L: +15, E: +20, F: +10 },
  'Japanese': { L: +20, A: +15, C: +15 },
  'Chinese': { M: +15, C: +20 },
  'French': { A: +15, E: +10, F: +15 },
  'German': { M: +20, C: +20 },
  'Italian': { E: +15, R: +10 },
  'American': { S: +10, F: +15 },
  'British': { M: +10, C: +10 },
  'Russian': { E: +20, A: +10 }
};

async function improvedArtistAPTAnalysis() {
  try {
    console.log('🎨 개선된 아티스트 APT 분석 시작\n');
    
    // 1. 핵심 유명 작가들 선별 (중복/모방작 제외)
    const coreArtists = await pool.query(`
      SELECT 
        id, name, name_ko, nationality, nationality_ko,
        birth_year, death_year, copyright_status, era, bio, bio_ko
      FROM artists 
      WHERE 
        -- 메인 작가만 (after, attributed, imitator 제외)
        name NOT ILIKE '%after %' 
        AND name NOT ILIKE '%attributed%'
        AND name NOT ILIKE '%imitator%'
        AND name NOT ILIKE '%workshop%'
        AND name NOT ILIKE '%circle of%'
        AND name NOT ILIKE '%school of%'
        -- 유명 작가 키워드 매칭
        AND (
          name ILIKE '%van gogh%' OR name_ko ILIKE '%고흐%' OR
          name ILIKE '%picasso%' OR name_ko ILIKE '%피카소%' OR
          name ILIKE '%monet%' OR name_ko ILIKE '%모네%' OR
          name ILIKE '%leonardo%' OR name_ko ILIKE '%다빈치%' OR
          name ILIKE '%michelangelo%' OR name_ko ILIKE '%미켈란젤로%' OR
          name ILIKE '%warhol%' OR name_ko ILIKE '%워홀%' OR
          name ILIKE '%rothko%' OR name_ko ILIKE '%로스코%' OR
          name ILIKE '%pollock%' OR name_ko ILIKE '%폴록%' OR
          name ILIKE '%basquiat%' OR name_ko ILIKE '%바스키아%' OR
          name ILIKE '%banksy%' OR name_ko ILIKE '%뱅크시%' OR
          name ILIKE '%이중섭%' OR
          name ILIKE '%박수근%' OR  
          name ILIKE '%김환기%' OR
          name ILIKE '%renoir%' OR name_ko ILIKE '%르누아르%' OR
          name ILIKE '%degas%' OR name_ko ILIKE '%드가%' OR
          name ILIKE '%cezanne%' OR name_ko ILIKE '%세잔%' OR
          name ILIKE '%matisse%' OR name_ko ILIKE '%마티스%' OR
          name ILIKE '%kandinsky%' OR name_ko ILIKE '%칸딘스키%'
        )
      ORDER BY 
        CASE 
          WHEN name ILIKE '%van gogh%' OR name_ko ILIKE '%고흐%' THEN 1
          WHEN name ILIKE '%picasso%' OR name_ko ILIKE '%피카소%' THEN 2  
          WHEN name ILIKE '%monet%' OR name_ko ILIKE '%모네%' THEN 3
          WHEN name ILIKE '%leonardo%' OR name_ko ILIKE '%다빈치%' THEN 4
          WHEN name ILIKE '%이중섭%' THEN 5
          ELSE 10
        END
      LIMIT 50
    `);
    
    console.log(`✅ ${coreArtists.rows.length}명의 핵심 작가 선별\n`);
    
    // 2. 각 작가 APT 분석
    const analysisResults = [];
    
    for (const artist of coreArtists.rows) {
      const aptProfile = analyzeArtistAPTImproved(artist);
      
      analysisResults.push({
        artist_id: artist.id,
        name: artist.name || artist.name_ko,
        nationality: artist.nationality || artist.nationality_ko,
        era: artist.era,
        years: `${artist.birth_year || '?'} - ${artist.death_year || 'present'}`,
        apt_profile: aptProfile
      });
      
      console.log(`✅ ${artist.name || artist.name_ko}: ${aptProfile.primary_types[0].type} (${Math.round(aptProfile.meta.confidence * 100)}% 신뢰도)`);
    }
    
    // 3. 결과 분석 및 저장
    console.log('\n📊 APT 분포 분석:');
    console.log('=================');
    
    const typeDistribution = {};
    analysisResults.forEach(result => {
      const type = result.apt_profile.primary_types[0].type;
      typeDistribution[type] = (typeDistribution[type] || 0) + 1;
    });
    
    Object.entries(typeDistribution)
      .sort(([,a], [,b]) => b - a)
      .forEach(([type, count]) => {
        console.log(`${type}: ${count}명`);
      });
    
    // 4. 데이터베이스 적용 준비
    const dbInsertData = analysisResults.map(result => ({
      artist_id: result.artist_id,
      apt_profile: JSON.stringify(result.apt_profile),
      mapping_method: 'expert_analysis_v2',
      confidence_score: result.apt_profile.meta.confidence,
      mapped_by: 'sayu_apt_analyzer_v2',
      mapping_notes: `Analyzed: ${result.apt_profile.meta.reasoning.join('; ')}`
    }));
    
    // 5. 상세 결과 저장
    require('fs').writeFileSync(
      'improved-artist-apt-results.json',
      JSON.stringify(analysisResults, null, 2)
    );
    
    require('fs').writeFileSync(
      'apt-db-insert-data.json',
      JSON.stringify(dbInsertData, null, 2)
    );
    
    console.log('\n💾 결과 저장 완료:');
    console.log('- improved-artist-apt-results.json: 상세 분석 결과');
    console.log('- apt-db-insert-data.json: DB 삽입용 데이터');
    
    return analysisResults;
    
  } catch (error) {
    console.error('❌ 오류:', error.message);
  } finally {
    await pool.end();
  }
}

function analyzeArtistAPTImproved(artist) {
  const name = (artist.name || artist.name_ko || '').toLowerCase();
  const nationality = artist.nationality || artist.nationality_ko || '';
  const era = artist.era || '';
  
  // 1. 프리셋 프로필 확인
  for (const [key, profile] of Object.entries(ARTIST_APT_PROFILES)) {
    if (name.includes(key)) {
      return {
        dimensions: profile.dimensions,
        primary_types: profile.types,
        meta: {
          confidence: profile.confidence,
          source: 'expert_preset',
          keywords: profile.keywords,
          reasoning: [profile.reasoning]
        }
      };
    }
  }
  
  // 2. 규칙 기반 분석 (개선된 버전)
  let dimensions = { L: 50, S: 50, A: 50, R: 50, E: 50, M: 50, F: 50, C: 50 };
  let reasoning = [];
  let confidence = 0.6; // 기본 신뢰도
  
  // 시대별 경향 적용
  if (era && ART_MOVEMENT_TENDENCIES[era]) {
    const tendency = ART_MOVEMENT_TENDENCIES[era];
    Object.entries(tendency).forEach(([dim, adj]) => {
      dimensions[dim] += adj;
    });
    reasoning.push(`${era} 화풍의 특성 반영`);
    confidence += 0.1;
  }
  
  // 문화/국적별 경향 적용
  for (const [culture, tendency] of Object.entries(CULTURAL_TENDENCIES)) {
    if (nationality.includes(culture)) {
      Object.entries(tendency).forEach(([dim, adj]) => {
        dimensions[dim] += adj;
      });
      reasoning.push(`${culture} 문화권의 예술 특성 반영`);
      confidence += 0.1;
      break;
    }
  }
  
  // 시대별 추가 조정
  if (artist.birth_year) {
    if (artist.birth_year < 1500) { // 중세/르네상스
      dimensions.R += 25; dimensions.A -= 25;
      dimensions.M += 15; dimensions.E -= 15;
      dimensions.C += 20; dimensions.F -= 20;
      reasoning.push('고전주의 전통 - 사실적, 체계적 접근');
    } else if (artist.birth_year > 1900) { // 현대
      dimensions.A += 20; dimensions.R -= 20;
      dimensions.S += 10; dimensions.L -= 10;
      reasoning.push('현대 예술 - 추상적, 실험적 성향');
    }
  }
  
  // 점수 정규화 및 경계값 조정
  Object.keys(dimensions).forEach(dim => {
    dimensions[dim] = Math.max(5, Math.min(95, dimensions[dim]));
  });
  
  // 대립 차원 합계 맞추기
  dimensions.S = 100 - dimensions.L;
  dimensions.R = 100 - dimensions.A; 
  dimensions.M = 100 - dimensions.E;
  dimensions.C = 100 - dimensions.F;
  
  // 주요 타입들 계산
  const primaryType = 
    (dimensions.L > dimensions.S ? 'L' : 'S') +
    (dimensions.A > dimensions.R ? 'A' : 'R') +
    (dimensions.E > dimensions.M ? 'E' : 'M') +
    (dimensions.F > dimensions.C ? 'F' : 'C');
  
  // 보조 타입들 계산 (차이가 적은 차원들로)
  const secondaryTypes = [];
  const axes = [
    { primary: 'L', secondary: 'S', score: Math.abs(dimensions.L - dimensions.S) },
    { primary: 'A', secondary: 'R', score: Math.abs(dimensions.A - dimensions.R) },
    { primary: 'E', secondary: 'M', score: Math.abs(dimensions.E - dimensions.M) },
    { primary: 'F', secondary: 'C', score: Math.abs(dimensions.F - dimensions.C) }
  ];
  
  // 애매한 차원이 있으면 보조 타입 생성
  const ambiguousAxes = axes.filter(axis => axis.score < 30);
  if (ambiguousAxes.length > 0) {
    // 가장 애매한 차원을 뒤집어서 보조 타입 생성
    const mostAmbiguous = ambiguousAxes.sort((a, b) => a.score - b.score)[0];
    let secondaryType = primaryType;
    
    if (mostAmbiguous.primary === 'L') {
      secondaryType = secondaryType.replace('L', 'S').replace('S', 'L');
    } else if (mostAmbiguous.primary === 'A') {
      secondaryType = secondaryType.replace('A', 'R').replace('R', 'A');
    } else if (mostAmbiguous.primary === 'E') {
      secondaryType = secondaryType.replace('E', 'M').replace('M', 'E');
    } else if (mostAmbiguous.primary === 'F') {
      secondaryType = secondaryType.replace('F', 'C').replace('C', 'F');
    }
    
    secondaryTypes.push({ type: secondaryType, weight: 0.3 });
  }
  
  return {
    dimensions,
    primary_types: [
      { type: primaryType, weight: 0.7 },
      ...secondaryTypes
    ],
    meta: {
      confidence: Math.min(0.95, confidence),
      source: 'rule_based_analysis_v2',
      keywords: [era, nationality, `${artist.birth_year}년대`].filter(Boolean),
      reasoning
    }
  };
}

improvedArtistAPTAnalysis();