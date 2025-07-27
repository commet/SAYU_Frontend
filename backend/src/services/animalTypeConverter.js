/**
 * SAYU APT → 16가지 동물 유형 변환 시스템
 * CORRECT SAYU SYSTEM: L/S A/R E/M F/C 4글자 코드를 16가지 동물로 매핑
 * 
 * CORRECTED AXIS DEFINITIONS:
 * L/S: Lone (Individual, introspective) vs Social (Interactive, collaborative)
 * A/R: Abstract (Atmospheric, symbolic) vs Representational (Realistic, concrete)
 * E/M: Emotional (Affective, feeling-based) vs Meaning-driven (Analytical, rational)
 * F/C: Flow (Fluid, spontaneous) vs Constructive (Structured, systematic)
 */

// Import central SAYU definitions
const { SAYU_TYPES, VALID_TYPE_CODES, getSAYUType } = require('../../../shared/SAYUTypeDefinitions');

// APT 코드에서 동물 유형 추출
function getAnimalFromAPT(aptCode) {
  if (!aptCode || aptCode.length !== 4) {
    return null;
  }
  
  if (!VALID_TYPE_CODES.includes(aptCode)) {
    return null;
  }
  
  return getSAYUType(aptCode);
}

// 동물 유형에서 APT 코드 추출
function getAPTFromAnimal(animalName) {
  const entry = Object.entries(SAYU_TYPES).find(([code, data]) => 
    data.animal === animalName || data.animalEn === animalName
  );
  
  return entry ? entry[0] : null;
}

// 성격 차원별 동물 분류
function getAnimalsByDimension(dimension) {
  const results = {};
  
  Object.entries(SAYU_TYPES).forEach(([code, data]) => {
    const key = code[dimension] || 'unknown';
    if (!results[key]) results[key] = [];
    results[key].push({
      code,
      animal: data.animal,
      animalEn: data.animalEn,
      name: data.name,
      nameEn: data.nameEn
    });
  });
  
  return results;
}

// 유사한 동물 유형 찾기
function findSimilarAnimals(aptCode, maxResults = 3) {
  if (!aptCode || !SAYU_TYPES[aptCode]) return [];
  
  const targetType = SAYU_TYPES[aptCode];
  const targetTraits = targetType.characteristics;
  const similarities = [];
  
  Object.entries(SAYU_TYPES).forEach(([code, data]) => {
    if (code === aptCode) return;
    
    const commonTraits = data.characteristics.filter(trait => 
      targetTraits.includes(trait)
    ).length;
    
    similarities.push({
      code,
      animal: data.animal,
      animalEn: data.animalEn,
      name: data.name,
      nameEn: data.nameEn,
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
  const sayuType = SAYU_TYPES[primaryType];
  
  if (!sayuType) return null;
  
  const dimensions = aptProfile.dimensions || {};
  
  return {
    primary: {
      code: primaryType,
      animal: sayuType.animal,
      animalEn: sayuType.animalEn,
      name: sayuType.name,
      nameEn: sayuType.nameEn,
      characteristics: sayuType.characteristics,
      description: sayuType.description,
      emoji: sayuType.emoji
    },
    cognitive_functions: {
      dominant: sayuType.dominantFunction,
      inferior: sayuType.inferiorFunction,
      conscious: sayuType.consciousFunctions,
      unconscious: sayuType.unconsciousFunctions
    },
    similar_types: findSimilarAnimals(primaryType),
    dimension_analysis: {
      social_preference: primaryType[0] === 'L' ? 'lone' : 'social',
      art_style: primaryType[1] === 'A' ? 'abstract' : 'representational',
      response_mode: primaryType[2] === 'E' ? 'emotional' : 'meaning-driven',
      approach_style: primaryType[3] === 'F' ? 'flow' : 'constructive'
    },
    compatibility_score: calculateCompatibilityScore(dimensions, primaryType)
  };
}

// 호환성 점수 계산
function calculateCompatibilityScore(dimensions, aptCode) {
  const expected = {
    'L': aptCode[0] === 'L' ? 0.7 : 0.3,
    'S': aptCode[0] === 'S' ? 0.7 : 0.3,
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
  const sayuType = SAYU_TYPES[animalType];
  if (!sayuType) return [];
  
  return {
    type_info: {
      code: animalType,
      name: sayuType.name,
      animal: sayuType.animal,
      characteristics: sayuType.characteristics
    },
    atmosphere: getAtmosphereRecommendations(animalType),
    interaction_level: getInteractionRecommendations(animalType),
    group_size: getGroupSizeRecommendations(animalType),
    exhibition_flow: getFlowRecommendations(animalType)
  };
}

function getAtmosphereRecommendations(animalType) {
  const isSocial = animalType[0] === 'S';
  const isEmotional = animalType[2] === 'E';
  
  if (isSocial && isEmotional) return ['lively', 'interactive', 'social', 'expressive'];
  if (isSocial && !isEmotional) return ['sophisticated', 'structured', 'educational', 'analytical'];
  if (!isSocial && isEmotional) return ['intimate', 'contemplative', 'immersive', 'personal'];
  return ['quiet', 'focused', 'scholarly', 'reflective'];
}

function getInteractionRecommendations(animalType) {
  const isFlow = animalType[3] === 'F';
  const isSocial = animalType[0] === 'S';
  
  if (isFlow && isSocial) return ['hands-on', 'discussion', 'collaborative', 'spontaneous'];
  if (isFlow && !isSocial) return ['self-guided', 'multimedia', 'exploratory', 'flexible'];
  if (!isFlow && isSocial) return ['guided_tour', 'lecture', 'structured', 'systematic'];
  return ['audio_guide', 'individual', 'methodical', 'organized'];
}

function getGroupSizeRecommendations(animalType) {
  const isSocial = animalType[0] === 'S';
  return isSocial ? ['medium', 'large'] : ['small', 'individual'];
}

function getFlowRecommendations(animalType) {
  const isFlow = animalType[3] === 'F';
  const isAbstract = animalType[1] === 'A';
  
  if (isFlow && isAbstract) return ['wandering', 'intuitive', 'atmosphere-driven'];
  if (isFlow && !isAbstract) return ['story-driven', 'narrative', 'thematic'];
  if (!isFlow && isAbstract) return ['conceptual-sequence', 'theoretical', 'systematic-abstract'];
  return ['chronological', 'structured', 'educational-sequence'];
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
      animal: SAYU_TYPES[type]?.animal || type,
      animal_ko: SAYU_TYPES[type]?.animal || type,
      current_count: count,
      ideal_count: Math.ceil(idealPerType),
      status: count < idealPerType ? 'underrepresented' : 'overrepresented'
    }))
  };
}

// SAYU 타입별 예술 스타일 선호도 (추가 기능)
function getArtStylePreferences(animalType) {
  const sayuType = SAYU_TYPES[animalType];
  if (!sayuType) return null;
  
  const isAbstract = animalType[1] === 'A';
  const isEmotional = animalType[2] === 'E';
  const isFlow = animalType[3] === 'F';
  
  let styles = [];
  
  if (isAbstract && isEmotional && isFlow) {
    styles = ['Abstract Expressionism', 'Surrealism', 'Color Field'];
  } else if (isAbstract && isEmotional && !isFlow) {
    styles = ['Symbolism', 'Art Nouveau', 'Expressionism'];
  } else if (isAbstract && !isEmotional && isFlow) {
    styles = ['Conceptual Art', 'Minimalism', 'Installation'];
  } else if (isAbstract && !isEmotional && !isFlow) {
    styles = ['Constructivism', 'Geometric Abstraction', 'Op Art'];
  } else if (!isAbstract && isEmotional && isFlow) {
    styles = ['Romanticism', 'Impressionism', 'Post-Impressionism'];
  } else if (!isAbstract && isEmotional && !isFlow) {
    styles = ['Academic Art', 'Pre-Raphaelite', 'Orientalism'];
  } else if (!isAbstract && !isEmotional && isFlow) {
    styles = ['Street Art', 'Pop Art', 'Photorealism'];
  } else {
    styles = ['Realism', 'Classical', 'Neoclassicism'];
  }
  
  return {
    primary_styles: styles,
    characteristics: sayuType.characteristics,
    description: sayuType.description
  };
}

module.exports = {
  SAYU_TYPES, // Export central types
  getAnimalFromAPT,
  getAPTFromAnimal,
  getAnimalsByDimension,
  findSimilarAnimals,
  analyzeArtistAnimalType,
  calculateCompatibilityScore,
  getRecommendedExhibitionStyles,
  getArtStylePreferences,
  checkDistributionBalance
};