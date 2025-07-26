const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// 기존 분석된 작가들의 패턴 데이터 (improved-artist-apt-results.json 에서 추출)
const REFERENCE_PATTERNS = {
  // 시대별 APT 분포
  era_patterns: {
    'Impressionism': { 'LAEF': 0.6, 'SAEF': 0.4 },
    'Postmodern': { 'SAMF': 0.4, 'SAEF': 0.3, 'SRMC': 0.3 },
    'Contemporary': { 'SAMC': 0.4, 'LAMF': 0.3, 'SRMC': 0.3 },
    'Renaissance': { 'LRMC': 0.8, 'SRMC': 0.2 },
    'Modern': { 'LAEF': 0.5, 'SAEF': 0.3, 'SRMC': 0.2 }
  },
  
  // 국적별 APT 경향
  nationality_patterns: {
    'France': { 'LAEF': 0.3, 'SAEF': 0.4, 'SRMC': 0.3 },
    'Spain': { 'SAMF': 0.5, 'SAEF': 0.3, 'SRMC': 0.2 },
    'Italian': { 'LRMC': 0.4, 'SRMC': 0.4, 'SAEF': 0.2 },
    'United States': { 'SAMC': 0.4, 'LAEF': 0.3, 'LAMF': 0.3 },
    'United Kingdom': { 'LAMF': 0.4, 'SAMC': 0.3, 'SRMC': 0.3 },
    'Korean': { 'LAEF': 0.6, 'LREC': 0.3, 'LAEC': 0.1 }
  },
  
  // 저작권 상태별 경향 (현대성 지표)
  copyright_patterns: {
    'contemporary': { 'SAMC': 0.3, 'SAMF': 0.2, 'LAMF': 0.2, 'SAEF': 0.3 },
    'public_domain': { 'LRMC': 0.3, 'SRMC': 0.3, 'LAEF': 0.2, 'SAEF': 0.2 },
    'licensed': { 'SAMC': 0.4, 'SAMF': 0.3, 'SRMC': 0.3 }
  }
};

// 바이오그래피 키워드 기반 APT 매핑
const BIO_KEYWORDS_APT = {
  // L/S 차원 키워드
  lone_keywords: ['solitary', 'reclusive', 'isolated', 'hermit', 'alone', 'private', 'withdrawn', 
                  '고독', '은둔', '내성적', '개인적', '혼자', '조용한'],
  shared_keywords: ['social', 'public', 'collaborative', 'teacher', 'group', 'movement', 'collective',
                   '사회적', '공동', '협력', '그룹', '운동', '교류', '활동적'],
  
  // A/R 차원 키워드  
  abstract_keywords: ['abstract', 'symbolic', 'expressionist', 'surreal', 'conceptual', 'non-figurative',
                     '추상', '상징적', '표현주의', '개념적', '초현실'],
  representational_keywords: ['realistic', 'figurative', 'portrait', 'landscape', 'still life', 'naturalistic',
                             '사실적', '구상', '초상화', '풍경화', '정물화', '자연주의'],
  
  // E/M 차원 키워드
  emotional_keywords: ['passionate', 'expressive', 'emotional', 'romantic', 'dramatic', 'intense', 'feeling',
                      '열정적', '감정적', '표현적', '로맨틱', '극적', '강렬한', '정서적'],
  meaning_keywords: ['intellectual', 'conceptual', 'philosophical', 'analytical', 'theoretical', 'critical',
                    '지적', '개념적', '철학적', '분석적', '이론적', '비판적'],
  
  // F/C 차원 키워드
  flow_keywords: ['spontaneous', 'intuitive', 'free', 'experimental', 'improvised', 'organic', 'fluid',
                 '자발적', '직관적', '자유로운', '실험적', '즉흥적', '유기적'],
  constructive_keywords: ['systematic', 'structured', 'planned', 'methodical', 'organized', 'disciplined',
                         '체계적', '구조적', '계획적', '조직적', '규율적', '정교한']
};

// 시대별 가중치 (birth_year 기반)
const ERA_WEIGHTS = {
  ancient: { years: [0, 1400], weights: { R: +30, M: +20, C: +25, L: +10 } },
  renaissance: { years: [1400, 1600], weights: { R: +25, M: +15, C: +20 } },
  baroque: { years: [1600, 1750], weights: { R: +15, E: +10, C: +15 } },
  romantic: { years: [1750, 1850], weights: { E: +25, F: +15, A: +10 } },
  modern: { years: [1850, 1950], weights: { A: +15, E: +10, F: +10 } },
  contemporary: { years: [1950, 2030], weights: { A: +20, S: +15, M: +10 } }
};

async function buildAIAPTInferenceSystem() {
  try {
    console.log('🤖 AI 기반 APT 추론 시스템 구축 시작\n');
    
    // 1. 분석 대상 아티스트 조회 (아직 APT가 없는 작가들)
    const unanalyzedQuery = `
      SELECT 
        id, name, name_ko, nationality, nationality_ko,
        birth_year, death_year, copyright_status, era,
        bio, bio_ko,
        CASE 
          WHEN name_ko IS NOT NULL THEN 'Korean'
          WHEN nationality LIKE '%Korea%' OR nationality_ko LIKE '%한국%' THEN 'Korean'
          ELSE 'International'
        END as artist_type
      FROM artists 
      WHERE apt_profile IS NULL
        AND name NOT ILIKE '%after %' 
        AND name NOT ILIKE '%attributed%'
        AND name NOT ILIKE '%imitator%'
        AND name NOT ILIKE '%workshop%'
        AND name NOT ILIKE '%circle of%'
      ORDER BY 
        CASE 
          WHEN name_ko IS NOT NULL THEN 1  -- 한국 작가 우선
          WHEN copyright_status = 'contemporary' THEN 2  -- 현대 작가
          WHEN birth_year > 1800 THEN 3  -- 근현대 작가
          ELSE 4
        END,
        RANDOM()
      LIMIT 200  -- 우선 200명만 처리
    `;
    
    const result = await pool.query(unanalyzedQuery);
    console.log(`🎯 분석 대상: ${result.rows.length}명의 아티스트\n`);
    
    // 2. 각 아티스트별 APT 추론 실행
    const inferenceResults = [];
    let processed = 0;
    
    for (const artist of result.rows) {
      const aptInference = await inferArtistAPT(artist);
      
      inferenceResults.push({
        artist_id: artist.id,
        name: artist.name || artist.name_ko,
        nationality: artist.nationality || artist.nationality_ko,
        artist_type: artist.artist_type,
        apt_inference: aptInference
      });
      
      processed++;
      if (processed % 20 === 0) {
        console.log(`⚡ ${processed}/${result.rows.length} 처리 완료...`);
      }
    }
    
    // 3. 추론 결과 분석
    console.log('\n📊 APT 추론 결과 분석:');
    console.log('======================');
    
    const inferredTypeDistribution = {};
    const confidenceStats = { high: 0, medium: 0, low: 0 };
    
    inferenceResults.forEach(result => {
      const primaryType = result.apt_inference.primary_types[0].type;
      inferredTypeDistribution[primaryType] = (inferredTypeDistribution[primaryType] || 0) + 1;
      
      const confidence = result.apt_inference.meta.confidence;
      if (confidence >= 0.8) confidenceStats.high++;
      else if (confidence >= 0.6) confidenceStats.medium++;
      else confidenceStats.low++;
    });
    
    console.log('\n📈 추론된 APT 분포:');
    Object.entries(inferredTypeDistribution)
      .sort(([,a], [,b]) => b - a)
      .forEach(([type, count]) => {
        console.log(`${type}: ${count}명`);
      });
    
    console.log('\n🎯 신뢰도 분포:');
    console.log(`높음 (80%+): ${confidenceStats.high}명`);
    console.log(`중간 (60-80%): ${confidenceStats.medium}명`);
    console.log(`낮음 (60% 미만): ${confidenceStats.low}명`);
    
    // 4. 데이터베이스 적용 준비
    const dbApplyData = inferenceResults
      .filter(result => result.apt_inference.meta.confidence >= 0.5) // 신뢰도 50% 이상만
      .map(result => ({
        artist_id: result.artist_id,
        apt_profile: JSON.stringify(result.apt_inference),
        mapping_method: 'ai_inference_v1',
        confidence_score: result.apt_inference.meta.confidence,
        mapped_by: 'sayu_ai_apt_inference',
        mapping_notes: `AI inference - ${result.apt_inference.meta.inference_methods.join(', ')}`
      }));
    
    console.log(`\n💾 DB 적용 대상: ${dbApplyData.length}명 (신뢰도 50% 이상)`);
    
    // 5. 결과 저장
    require('fs').writeFileSync(
      'ai-apt-inference-results.json',
      JSON.stringify(inferenceResults, null, 2)
    );
    
    require('fs').writeFileSync(
      'ai-apt-db-apply-data.json', 
      JSON.stringify(dbApplyData, null, 2)
    );
    
    console.log('\n✅ AI APT 추론 시스템 구축 완료!');
    console.log('- ai-apt-inference-results.json: 전체 추론 결과');
    console.log('- ai-apt-db-apply-data.json: DB 적용용 데이터');
    
    return inferenceResults;
    
  } catch (error) {
    console.error('❌ 오류:', error.message);
  } finally {
    await pool.end();
  }
}

async function inferArtistAPT(artist) {
  const inferenceMethods = [];
  let dimensions = { L: 50, S: 50, A: 50, R: 50, E: 50, M: 50, F: 50, C: 50 };
  let confidence = 0.4; // 기본 신뢰도
  let reasoning = [];
  
  // 1. 패턴 매칭 기반 추론
  if (artist.era && REFERENCE_PATTERNS.era_patterns[artist.era]) {
    const eraPattern = REFERENCE_PATTERNS.era_patterns[artist.era];
    const dominantType = Object.keys(eraPattern).sort((a, b) => eraPattern[b] - eraPattern[a])[0];
    
    // 지배적 타입의 차원을 강화
    applyAPTTypeToScores(dimensions, dominantType, 20);
    confidence += 0.2;
    reasoning.push(`${artist.era} 시대의 ${dominantType} 패턴 적용`);
    inferenceMethods.push('era_pattern_matching');
  }
  
  // 2. 국적별 패턴 적용
  const nationality = artist.nationality || artist.nationality_ko || '';
  for (const [nat, pattern] of Object.entries(REFERENCE_PATTERNS.nationality_patterns)) {
    if (nationality.includes(nat)) {
      const dominantType = Object.keys(pattern).sort((a, b) => pattern[b] - pattern[a])[0];
      applyAPTTypeToScores(dimensions, dominantType, 15);
      confidence += 0.15;
      reasoning.push(`${nat} 문화권의 ${dominantType} 경향 적용`);
      inferenceMethods.push('nationality_pattern_matching');
      break;
    }
  }
  
  // 3. 저작권 상태 기반 추론 (현대성 지표)
  if (artist.copyright_status && REFERENCE_PATTERNS.copyright_patterns[artist.copyright_status]) {
    const copyrightPattern = REFERENCE_PATTERNS.copyright_patterns[artist.copyright_status];
    const dominantType = Object.keys(copyrightPattern).sort((a, b) => copyrightPattern[b] - copyrightPattern[a])[0];
    applyAPTTypeToScores(dimensions, dominantType, 10);
    confidence += 0.1;
    reasoning.push(`${artist.copyright_status} 저작권 상태의 ${dominantType} 성향 적용`);
    inferenceMethods.push('copyright_status_inference');
  }
  
  // 4. 시대별 가중치 적용 (birth_year 기반)
  if (artist.birth_year) {
    for (const [eraName, eraData] of Object.entries(ERA_WEIGHTS)) {
      if (artist.birth_year >= eraData.years[0] && artist.birth_year <= eraData.years[1]) {
        Object.entries(eraData.weights).forEach(([dim, weight]) => {
          dimensions[dim] += weight;
        });
        confidence += 0.1;
        reasoning.push(`${artist.birth_year}년 출생 - ${eraName} 시대 특성 반영`);
        inferenceMethods.push('birth_year_era_weighting');
        break;
      }
    }
  }
  
  // 5. 바이오그래피 텍스트 분석
  const bioText = (artist.bio || artist.bio_ko || '').toLowerCase();
  if (bioText.length > 50) {
    const bioScores = analyzeBiographyText(bioText);
    Object.entries(bioScores).forEach(([dim, score]) => {
      dimensions[dim] += score;
    });
    confidence += 0.15;
    reasoning.push('바이오그래피 텍스트 키워드 분석 적용');
    inferenceMethods.push('biography_text_analysis');
  }
  
  // 6. 한국 작가 특별 처리
  if (artist.artist_type === 'Korean') {
    dimensions.E += 15; dimensions.M -= 15;  // 더 감정적
    dimensions.L += 10; dimensions.S -= 10;  // 더 내성적
    confidence += 0.1;
    reasoning.push('한국 작가 특성 - 감정적, 내성적 성향 강화');
    inferenceMethods.push('korean_artist_adjustment');
  }
  
  // 7. 점수 정규화 및 경계값 조정
  Object.keys(dimensions).forEach(dim => {
    dimensions[dim] = Math.max(10, Math.min(90, dimensions[dim]));
  });
  
  // 대립 차원 합계 맞추기
  dimensions.S = 100 - dimensions.L;
  dimensions.R = 100 - dimensions.A;
  dimensions.M = 100 - dimensions.E;
  dimensions.C = 100 - dimensions.F;
  
  // 8. 주요 APT 타입 결정
  const primaryType = 
    (dimensions.L > dimensions.S ? 'L' : 'S') +
    (dimensions.A > dimensions.R ? 'A' : 'R') +
    (dimensions.E > dimensions.M ? 'E' : 'M') +
    (dimensions.F > dimensions.C ? 'F' : 'C');
  
  // 9. 보조 타입 계산 (애매한 차원 처리)
  const secondaryTypes = [];
  const dimensionStrengths = [
    { name: 'LS', strength: Math.abs(dimensions.L - dimensions.S) },
    { name: 'AR', strength: Math.abs(dimensions.A - dimensions.R) },
    { name: 'EM', strength: Math.abs(dimensions.E - dimensions.M) },
    { name: 'FC', strength: Math.abs(dimensions.F - dimensions.C) }
  ];
  
  const weakestDimension = dimensionStrengths.sort((a, b) => a.strength - b.strength)[0];
  if (weakestDimension.strength < 25) {
    // 가장 애매한 차원을 뒤집어서 보조 타입 생성
    let secondaryType = primaryType;
    if (weakestDimension.name === 'LS') {
      secondaryType = primaryType.replace(/^[LS]/, primaryType[0] === 'L' ? 'S' : 'L');
    } else if (weakestDimension.name === 'AR') {
      secondaryType = primaryType.replace(/[AR]/, primaryType[1] === 'A' ? 'R' : 'A');
    } else if (weakestDimension.name === 'EM') {
      secondaryType = primaryType.replace(/[EM]/, primaryType[2] === 'E' ? 'M' : 'E');
    } else if (weakestDimension.name === 'FC') {
      secondaryType = primaryType.replace(/[FC]$/, primaryType[3] === 'F' ? 'C' : 'F');
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
      source: 'ai_inference_system_v1',
      keywords: [artist.era, artist.nationality, `${artist.birth_year}s`].filter(Boolean),
      reasoning,
      inference_methods: inferenceMethods,
      artist_type: artist.artist_type
    }
  };
}

function applyAPTTypeToScores(dimensions, aptType, strength) {
  const typeMap = {
    'L': dimensions, 'S': dimensions,
    'A': dimensions, 'R': dimensions, 
    'E': dimensions, 'M': dimensions,
    'F': dimensions, 'C': dimensions
  };
  
  if (aptType.length === 4) {
    aptType[0] === 'L' ? dimensions.L += strength : dimensions.S += strength;
    aptType[1] === 'A' ? dimensions.A += strength : dimensions.R += strength;
    aptType[2] === 'E' ? dimensions.E += strength : dimensions.M += strength;
    aptType[3] === 'F' ? dimensions.F += strength : dimensions.C += strength;
  }
}

function analyzeBiographyText(bioText) {
  const scores = { L: 0, S: 0, A: 0, R: 0, E: 0, M: 0, F: 0, C: 0 };
  
  // 각 차원별 키워드 점수 계산
  BIO_KEYWORDS_APT.lone_keywords.forEach(keyword => {
    if (bioText.includes(keyword)) scores.L += 5;
  });
  BIO_KEYWORDS_APT.shared_keywords.forEach(keyword => {
    if (bioText.includes(keyword)) scores.S += 5;
  });
  BIO_KEYWORDS_APT.abstract_keywords.forEach(keyword => {
    if (bioText.includes(keyword)) scores.A += 5;
  });
  BIO_KEYWORDS_APT.representational_keywords.forEach(keyword => {
    if (bioText.includes(keyword)) scores.R += 5;
  });
  BIO_KEYWORDS_APT.emotional_keywords.forEach(keyword => {
    if (bioText.includes(keyword)) scores.E += 5;
  });
  BIO_KEYWORDS_APT.meaning_keywords.forEach(keyword => {
    if (bioText.includes(keyword)) scores.M += 5;
  });
  BIO_KEYWORDS_APT.flow_keywords.forEach(keyword => {
    if (bioText.includes(keyword)) scores.F += 5;
  });
  BIO_KEYWORDS_APT.constructive_keywords.forEach(keyword => {
    if (bioText.includes(keyword)) scores.C += 5;
  });
  
  return scores;
}

buildAIAPTInferenceSystem();