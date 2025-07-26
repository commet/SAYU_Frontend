/**
 * SAYU APT → 16가지 동물 유형 변환 시스템
 * LAREMFC 4글자 코드를 16가지 동물로 매핑
 */

// 16가지 동물 유형 정의
const ANIMAL_TYPES = {
  // 논리형 (L) + 감정적 (A)
  'LAEF': {
    animal: 'owl',
    name: '지혜로운 올빼미',
    name_ko: '올빼미',
    traits: ['직관적', '감정적', '외향적', '유연한'],
    description: '깊은 통찰력과 감성을 가진 창조적 리더',
    art_preference: ['초현실주의', '상징주의', '추상표현주의'],
    famous_artists: ['Salvador Dalí', 'René Magritte', 'Giorgio de Chirico']
  },
  'LAEC': {
    animal: 'eagle',
    name: '예리한 독수리',
    name_ko: '독수리',
    traits: ['논리적', '감정적', '외향적', '체계적'],
    description: '날카로운 분석력과 표현력을 겸비한 혁신가',
    art_preference: ['르네상스', '신고전주의', '사실주의'],
    famous_artists: ['Leonardo da Vinci', 'Michelangelo', 'Jacques-Louis David']
  },
  'LAIF': {
    animal: 'dolphin',
    name: '영리한 돌고래',
    name_ko: '돌고래',
    traits: ['논리적', '감정적', '내향적', '유연한'],
    description: '섬세한 감성과 지성을 조화시키는 예술가',
    art_preference: ['인상주의', '후기인상주의', '표현주의'],
    famous_artists: ['Claude Monet', 'Paul Cézanne', 'Wassily Kandinsky']
  },
  'LAIC': {
    animal: 'whale',
    name: '지적인 고래',
    name_ko: '고래',
    traits: ['논리적', '감정적', '내향적', '체계적'],
    description: '깊은 사색과 체계적 접근의 대가',
    art_preference: ['동양화', '미니멀리즘', '개념미술'],
    famous_artists: ['Utagawa Hiroshige', 'Donald Judd', 'Sol LeWitt']
  },

  // 논리형 (L) + 이성적 (R)
  'LREF': {
    animal: 'fox',
    name: '영리한 여우',
    name_ko: '여우',
    traits: ['논리적', '이성적', '외향적', '유연한'],
    description: '기발한 아이디어와 논리적 사고의 결합',
    art_preference: ['큐비즘', '구성주의', '팝아트'],
    famous_artists: ['Pablo Picasso', 'Andy Warhol', 'Roy Lichtenstein']
  },
  'LREC': {
    animal: 'hawk',
    name: '날카로운 매',
    name_ko: '매',
    traits: ['논리적', '이성적', '외향적', '체계적'],
    description: '정밀한 분석과 체계적 실행의 전문가',
    art_preference: ['기하학적 추상', '바우하우스', '미니멀리즘'],
    famous_artists: ['Piet Mondrian', 'Paul Klee', 'Kazimir Malevich']
  },
  'LRIF': {
    animal: 'cat',
    name: '독립적인 고양이',
    name_ko: '고양이',
    traits: ['논리적', '이성적', '내향적', '유연한'],
    description: '독창적이고 자유로운 예술적 탐구자',
    art_preference: ['다다이즘', '개념미술', '설치미술'],
    famous_artists: ['Marcel Duchamp', 'Joseph Beuys', 'Yves Klein']
  },
  'LRIC': {
    animal: 'snow_leopard',
    name: '신비로운 눈표범',
    name_ko: '눈표범',
    traits: ['논리적', '이성적', '내향적', '체계적'],
    description: '은밀하고 정교한 예술적 완성도 추구',
    art_preference: ['고전주의', '세밀화', '정밀사실주의'],
    famous_artists: ['Johannes Vermeer', 'Jan van Eyck', 'Hans Holbein']
  },

  // 감각형 (S) + 감정적 (A)
  'SAEF': {
    animal: 'butterfly',
    name: '아름다운 나비',
    name_ko: '나비',
    traits: ['감각적', '감정적', '외향적', '유연한'],
    description: '자유롭고 감성적인 색채와 형태의 탐험가',
    art_preference: ['인상주의', '야수파', '추상표현주의'],
    famous_artists: ['Vincent van Gogh', 'Henri Matisse', 'Jackson Pollock']
  },
  'SAEC': {
    animal: 'peacock',
    name: '화려한 공작',
    name_ko: '공작',
    traits: ['감각적', '감정적', '외향적', '체계적'],
    description: '아름다움과 기교를 통한 감동 전달자',
    art_preference: ['로코코', '장식미술', '아르누보'],
    famous_artists: ['Mary Cassatt', 'Gustav Klimt', 'Alphonse Mucha']
  },
  'SAIF': {
    animal: 'deer',
    name: '우아한 사슴',
    name_ko: '사슴',
    traits: ['감각적', '감정적', '내향적', '유연한'],
    description: '섬세하고 우아한 감성의 시각적 시인',
    art_preference: ['낭만주의', '상징주의', '아르데코'],
    famous_artists: ['Caspar David Friedrich', 'Pierre-Auguste Renoir', 'Edgar Degas']
  },
  'SAIC': {
    animal: 'swan',
    name: '우아한 백조',
    name_ko: '백조',
    traits: ['감각적', '감정적', '내향적', '체계적'],
    description: '완벽한 조화와 균형미를 추구하는 고전파',
    art_preference: ['고전주의', '신고전주의', '아카데미즘'],
    famous_artists: ['El Greco', 'Jean-Auguste-Dominique Ingres', 'William-Adolphe Bouguereau']
  },

  // 감각형 (S) + 이성적 (R)
  'SREF': {
    animal: 'tiger',
    name: '역동적인 호랑이',
    name_ko: '호랑이',
    traits: ['감각적', '이성적', '외향적', '유연한'],
    description: '강렬하고 역동적인 에너지의 표현자',
    art_preference: ['표현주의', '액션 페인팅', '거대한 조각'],
    famous_artists: ['Willem de Kooning', 'Franz Kline', 'Henry Moore']
  },
  'SREC': {
    animal: 'lion',
    name: '당당한 사자',
    name_ko: '사자',
    traits: ['감각적', '이성적', '외향적', '체계적'],
    description: '강인한 의지와 명확한 비전의 리더',
    art_preference: ['바로크', '리얼리즘', '사회적 사실주의'],
    famous_artists: ['Caravaggio', 'Peter Paul Rubens', 'Diego Velázquez']
  },
  'SRIF': {
    animal: 'panther',
    name: '신비로운 팬더',
    name_ko: '팬더',
    traits: ['감각적', '이성적', '내향적', '유연한'],
    description: '신중하고 깊이 있는 감각적 탐구자',
    art_preference: ['몽환적 사실주의', '마술적 사실주의', '하이퍼리얼리즘'],
    famous_artists: ['René Magritte', 'Giorgio de Chirico', 'Chuck Close']
  },
  'SRIC': {
    animal: 'wolf',
    name: '충실한 늑대',
    name_ko: '늑대',
    traits: ['감각적', '이성적', '내향적', '체계적'],
    description: '충실하고 꾸준한 기법 연마의 장인',
    art_preference: ['사실주의', '자연주의', '세밀화'],
    famous_artists: ['Gustave Courbet', 'Jean-François Millet', 'Andrew Wyeth']
  }
};

// APT 코드에서 동물 유형 추출
function getAnimalFromAPT(aptCode) {
  if (!aptCode || aptCode.length !== 4) {
    return null;
  }
  
  return ANIMAL_TYPES[aptCode] || null;
}

// 동물 유형에서 APT 코드 추출
function getAPTFromAnimal(animalName) {
  const entry = Object.entries(ANIMAL_TYPES).find(([code, data]) => 
    data.animal === animalName || data.name_ko === animalName
  );
  
  return entry ? entry[0] : null;
}

// 성격 차원별 동물 분류
function getAnimalsByDimension(dimension) {
  const results = {};
  
  Object.entries(ANIMAL_TYPES).forEach(([code, data]) => {
    const key = code[dimension] || 'unknown';
    if (!results[key]) results[key] = [];
    results[key].push({
      code,
      animal: data.animal,
      name: data.name,
      name_ko: data.name_ko
    });
  });
  
  return results;
}

// 유사한 동물 유형 찾기
function findSimilarAnimals(aptCode, maxResults = 3) {
  if (!aptCode || !ANIMAL_TYPES[aptCode]) return [];
  
  const targetTraits = ANIMAL_TYPES[aptCode].traits;
  const similarities = [];
  
  Object.entries(ANIMAL_TYPES).forEach(([code, data]) => {
    if (code === aptCode) return;
    
    const commonTraits = data.traits.filter(trait => 
      targetTraits.includes(trait)
    ).length;
    
    similarities.push({
      code,
      animal: data.animal,
      name: data.name,
      name_ko: data.name_ko,
      similarity: commonTraits / targetTraits.length
    });
  });
  
  return similarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, maxResults);
}

// 아티스트의 동물 유형 상세 분석
function analyzeArtistAnimalType(aptProfile) {
  if (!aptProfile || !aptProfile.primary_types || !aptProfile.primary_types[0]) {
    return null;
  }
  
  const primaryType = aptProfile.primary_types[0].type;
  const animalData = ANIMAL_TYPES[primaryType];
  
  if (!animalData) return null;
  
  const dimensions = aptProfile.dimensions || {};
  
  return {
    primary: {
      code: primaryType,
      animal: animalData.animal,
      name: animalData.name,
      name_ko: animalData.name_ko,
      traits: animalData.traits,
      description: animalData.description
    },
    art_affinity: {
      preferred_styles: animalData.art_preference,
      famous_artists: animalData.famous_artists,
      compatibility_score: calculateCompatibilityScore(dimensions, primaryType)
    },
    similar_types: findSimilarAnimals(primaryType),
    dimension_analysis: {
      intuition_vs_sensing: primaryType[0] === 'L' ? 'intuitive' : 'sensing',
      emotion_vs_reason: primaryType[1] === 'A' ? 'emotional' : 'rational',
      extrovert_vs_introvert: primaryType[2] === 'E' ? 'extroverted' : 'introverted',
      flexible_vs_systematic: primaryType[3] === 'F' ? 'flexible' : 'systematic'
    }
  };
}

// 호환성 점수 계산
function calculateCompatibilityScore(dimensions, aptCode) {
  const expected = {
    'L': aptCode[0] === 'L' ? 0.7 : 0.3,
    'A': aptCode[1] === 'A' ? 0.7 : 0.3,
    'R': aptCode[1] === 'R' ? 0.7 : 0.3,
    'E': aptCode[2] === 'E' ? 0.7 : 0.3,
    'M': aptCode[2] === 'M' ? 0.7 : 0.3,
    'F': aptCode[3] === 'F' ? 0.7 : 0.3,
    'C': aptCode[3] === 'C' ? 0.7 : 0.3
  };
  
  let totalDiff = 0;
  let count = 0;
  
  Object.entries(expected).forEach(([dim, expectedValue]) => {
    if (dimensions[dim] !== undefined) {
      totalDiff += Math.abs(dimensions[dim] - expectedValue);
      count++;
    }
  });
  
  return count > 0 ? Math.max(0, 1 - (totalDiff / count)) : 0.5;
}

// 동물 유형별 추천 전시 스타일
function getRecommendedExhibitionStyles(animalType) {
  const animal = ANIMAL_TYPES[animalType];
  if (!animal) return [];
  
  return {
    primary_styles: animal.art_preference,
    atmosphere: getAtmosphereRecommendations(animalType),
    interaction_level: getInteractionRecommendations(animalType),
    group_size: getGroupSizeRecommendations(animalType)
  };
}

function getAtmosphereRecommendations(animalType) {
  const isExtroverted = animalType[2] === 'E';
  const isEmotional = animalType[1] === 'A';
  
  if (isExtroverted && isEmotional) return ['lively', 'interactive', 'social'];
  if (isExtroverted && !isEmotional) return ['sophisticated', 'structured', 'educational'];
  if (!isExtroverted && isEmotional) return ['intimate', 'contemplative', 'immersive'];
  return ['quiet', 'focused', 'scholarly'];
}

function getInteractionRecommendations(animalType) {
  const isFlexible = animalType[3] === 'F';
  const isExtroverted = animalType[2] === 'E';
  
  if (isFlexible && isExtroverted) return ['hands-on', 'discussion', 'collaborative'];
  if (isFlexible && !isExtroverted) return ['self-guided', 'multimedia', 'reflective'];
  if (!isFlexible && isExtroverted) return ['guided_tour', 'lecture', 'structured'];
  return ['audio_guide', 'individual', 'systematic'];
}

function getGroupSizeRecommendations(animalType) {
  const isExtroverted = animalType[2] === 'E';
  return isExtroverted ? ['medium', 'large'] : ['small', 'individual'];
}

// 전체 분포 균형 체크
function checkDistributionBalance(distribution) {
  const totalCount = Object.values(distribution).reduce((sum, count) => sum + count, 0);
  const idealPerType = totalCount / 16;
  const tolerance = 0.2; // 20% 허용 오차
  
  const unbalanced = Object.entries(distribution).filter(([type, count]) => {
    const deviation = Math.abs(count - idealPerType) / idealPerType;
    return deviation > tolerance;
  });
  
  return {
    is_balanced: unbalanced.length === 0,
    ideal_per_type: Math.ceil(idealPerType),
    unbalanced_types: unbalanced.map(([type, count]) => ({
      type,
      animal: ANIMAL_TYPES[type]?.name_ko || type,
      current_count: count,
      ideal_count: Math.ceil(idealPerType),
      status: count < idealPerType ? 'underrepresented' : 'overrepresented'
    }))
  };
}

module.exports = {
  ANIMAL_TYPES,
  getAnimalFromAPT,
  getAPTFromAnimal,
  getAnimalsByDimension,
  findSimilarAnimals,
  analyzeArtistAnimalType,
  calculateCompatibilityScore,
  getRecommendedExhibitionStyles,
  checkDistributionBalance
};