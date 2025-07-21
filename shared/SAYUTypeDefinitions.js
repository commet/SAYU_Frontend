/**
 * SAYU Type System Central Definitions
 * This is the SINGLE SOURCE OF TRUTH for all SAYU personality types
 * 
 * DO NOT CREATE NEW TYPE DEFINITIONS ELSEWHERE!
 * Always import and use these definitions.
 */

// 16 SAYU Personality Types - IMMUTABLE
const SAYU_TYPES = Object.freeze({
  LAEF: {
    code: 'LAEF',
    name: '몽환적 방랑자',
    nameEn: 'Dreamy Wanderer',
    animal: '여우',
    animalEn: 'Fox',
    emoji: '🦊',
    description: '혼자서 추상 작품을 감정적으로 자유롭게 감상',
    characteristics: ['독립적', '감성적', '자유로운', '직관적'],
    dominantFunction: 'Le',
    inferiorFunction: 'Ci',
    consciousFunctions: ['Le', 'Ai', 'Ee', 'Ci'],
    unconsciousFunctions: ['Li', 'Ae', 'Ei', 'Fe']
  },
  LAEC: {
    code: 'LAEC',
    name: '감성 큐레이터',
    nameEn: 'Emotional Curator',
    animal: '고양이',
    animalEn: 'Cat',
    emoji: '🐱',
    description: '혼자서 추상 작품을 감정적으로 체계적으로 감상',
    characteristics: ['섬세한', '체계적', '감성적', '분석적'],
    dominantFunction: 'Le',
    inferiorFunction: 'Fi',
    consciousFunctions: ['Le', 'Ai', 'Ee', 'Fi'],
    unconsciousFunctions: ['Li', 'Ae', 'Ei', 'Ce']
  },
  LAMF: {
    code: 'LAMF',
    name: '직관적 탐구자',
    nameEn: 'Intuitive Explorer',
    animal: '올빼미',
    animalEn: 'Owl',
    emoji: '🦉',
    description: '혼자서 추상 작품의 의미를 자유롭게 탐구',
    characteristics: ['탐구적', '자유로운', '철학적', '개방적'],
    dominantFunction: 'Le',
    inferiorFunction: 'Ci',
    consciousFunctions: ['Le', 'Ai', 'Me', 'Ci'],
    unconsciousFunctions: ['Li', 'Ae', 'Mi', 'Fe']
  },
  LAMC: {
    code: 'LAMC',
    name: '철학적 수집가',
    nameEn: 'Philosophical Collector',
    animal: '거북이',
    animalEn: 'Turtle',
    emoji: '🐢',
    description: '혼자서 추상 작품의 의미를 체계적으로 정리',
    characteristics: ['체계적', '철학적', '수집가', '분석적'],
    dominantFunction: 'Le',
    inferiorFunction: 'Fi',
    consciousFunctions: ['Le', 'Ai', 'Me', 'Fi'],
    unconsciousFunctions: ['Li', 'Ae', 'Mi', 'Ce']
  },
  LREF: {
    code: 'LREF',
    name: '고독한 관찰자',
    nameEn: 'Solitary Observer',
    animal: '카멜레온',
    animalEn: 'Chameleon',
    emoji: '🦎',
    description: '혼자서 구상 작품을 감정적으로 자유롭게 관찰',
    characteristics: ['관찰력', '감성적', '독립적', '자유로운'],
    dominantFunction: 'Le',
    inferiorFunction: 'Ci',
    consciousFunctions: ['Le', 'Ri', 'Ee', 'Ci'],
    unconsciousFunctions: ['Li', 'Re', 'Ei', 'Fe']
  },
  LREC: {
    code: 'LREC',
    name: '섬세한 감정가',
    nameEn: 'Delicate Connoisseur',
    animal: '고슴도치',
    animalEn: 'Hedgehog',
    emoji: '🦔',
    description: '혼자서 구상 작품을 감정적으로 체계적으로 음미',
    characteristics: ['섬세한', '체계적', '감상적', '깊이있는'],
    dominantFunction: 'Le',
    inferiorFunction: 'Fi',
    consciousFunctions: ['Le', 'Ri', 'Ee', 'Fi'],
    unconsciousFunctions: ['Li', 'Re', 'Ei', 'Ce']
  },
  LRMF: {
    code: 'LRMF',
    name: '디지털 탐험가',
    nameEn: 'Digital Explorer',
    animal: '문어',
    animalEn: 'Octopus',
    emoji: '🐙',
    description: '혼자서 구상 작품의 의미를 자유롭게 분석',
    characteristics: ['분석적', '탐험적', '기술적', '자유로운'],
    dominantFunction: 'Le',
    inferiorFunction: 'Ci',
    consciousFunctions: ['Le', 'Ri', 'Me', 'Ci'],
    unconsciousFunctions: ['Li', 'Re', 'Mi', 'Fe']
  },
  LRMC: {
    code: 'LRMC',
    name: '학구적 연구자',
    nameEn: 'Academic Researcher',
    animal: '비버',
    animalEn: 'Beaver',
    emoji: '🦫',
    description: '혼자서 구상 작품의 의미를 체계적으로 연구',
    characteristics: ['학구적', '체계적', '연구적', '정밀한'],
    dominantFunction: 'Le',
    inferiorFunction: 'Fi',
    consciousFunctions: ['Le', 'Ri', 'Me', 'Fi'],
    unconsciousFunctions: ['Li', 'Re', 'Mi', 'Ce']
  },
  SAEF: {
    code: 'SAEF',
    name: '감성 나눔이',
    nameEn: 'Emotional Sharer',
    animal: '나비',
    animalEn: 'Butterfly',
    emoji: '🦋',
    description: '함께 추상 작품의 감정을 자유롭게 나눔',
    characteristics: ['사교적', '감성적', '나눔', '자유로운'],
    dominantFunction: 'Se',
    inferiorFunction: 'Ci',
    consciousFunctions: ['Se', 'Ai', 'Ee', 'Ci'],
    unconsciousFunctions: ['Si', 'Ae', 'Ei', 'Fe']
  },
  SAEC: {
    code: 'SAEC',
    name: '예술 네트워커',
    nameEn: 'Art Networker',
    animal: '펭귄',
    animalEn: 'Penguin',
    emoji: '🐧',
    description: '함께 추상 작품의 감정을 체계적으로 공유',
    characteristics: ['네트워킹', '체계적', '감성적', '연결'],
    dominantFunction: 'Se',
    inferiorFunction: 'Fi',
    consciousFunctions: ['Se', 'Ai', 'Ee', 'Fi'],
    unconsciousFunctions: ['Si', 'Ae', 'Ei', 'Ce']
  },
  SAMF: {
    code: 'SAMF',
    name: '영감 전도사',
    nameEn: 'Inspiration Evangelist',
    animal: '앵무새',
    animalEn: 'Parrot',
    emoji: '🦜',
    description: '함께 추상 작품의 의미를 자유롭게 전파',
    characteristics: ['전파력', '영감적', '자유로운', '열정적'],
    dominantFunction: 'Se',
    inferiorFunction: 'Ci',
    consciousFunctions: ['Se', 'Ai', 'Me', 'Ci'],
    unconsciousFunctions: ['Si', 'Ae', 'Mi', 'Fe']
  },
  SAMC: {
    code: 'SAMC',
    name: '문화 기획자',
    nameEn: 'Cultural Planner',
    animal: '사슴',
    animalEn: 'Deer',
    emoji: '🦌',
    description: '함께 추상 작품의 의미를 체계적으로 기획',
    characteristics: ['기획력', '체계적', '문화적', '조직적'],
    dominantFunction: 'Se',
    inferiorFunction: 'Fi',
    consciousFunctions: ['Se', 'Ai', 'Me', 'Fi'],
    unconsciousFunctions: ['Si', 'Ae', 'Mi', 'Ce']
  },
  SREF: {
    code: 'SREF',
    name: '열정적 관람자',
    nameEn: 'Passionate Viewer',
    animal: '강아지',
    animalEn: 'Dog',
    emoji: '🐕',
    description: '함께 구상 작품을 감정적으로 자유롭게 즐김',
    characteristics: ['열정적', '사교적', '즐거운', '자유로운'],
    dominantFunction: 'Se',
    inferiorFunction: 'Ci',
    consciousFunctions: ['Se', 'Ri', 'Ee', 'Ci'],
    unconsciousFunctions: ['Si', 'Re', 'Ei', 'Fe']
  },
  SREC: {
    code: 'SREC',
    name: '따뜻한 안내자',
    nameEn: 'Warm Guide',
    animal: '오리',
    animalEn: 'Duck',
    emoji: '🦆',
    description: '함께 구상 작품을 감정적으로 체계적으로 안내',
    characteristics: ['안내력', '따뜻한', '체계적', '배려'],
    dominantFunction: 'Se',
    inferiorFunction: 'Fi',
    consciousFunctions: ['Se', 'Ri', 'Ee', 'Fi'],
    unconsciousFunctions: ['Si', 'Re', 'Ei', 'Ce']
  },
  SRMF: {
    code: 'SRMF',
    name: '지식 멘토',
    nameEn: 'Knowledge Mentor',
    animal: '코끼리',
    animalEn: 'Elephant',
    emoji: '🐘',
    description: '함께 구상 작품의 의미를 자유롭게 가르침',
    characteristics: ['가르침', '지식', '자유로운', '멘토링'],
    dominantFunction: 'Se',
    inferiorFunction: 'Ci',
    consciousFunctions: ['Se', 'Ri', 'Me', 'Ci'],
    unconsciousFunctions: ['Si', 'Re', 'Mi', 'Fe']
  },
  SRMC: {
    code: 'SRMC',
    name: '체계적 교육자',
    nameEn: 'Systematic Educator',
    animal: '독수리',
    animalEn: 'Eagle',
    emoji: '🦅',
    description: '함께 구상 작품의 의미를 체계적으로 교육',
    characteristics: ['교육적', '체계적', '조직적', '전문적'],
    dominantFunction: 'Se',
    inferiorFunction: 'Fi',
    consciousFunctions: ['Se', 'Ri', 'Me', 'Fi'],
    unconsciousFunctions: ['Si', 'Re', 'Mi', 'Ce']
  }
});

// 8 Cognitive Functions - IMMUTABLE
const SAYU_FUNCTIONS = Object.freeze({
  Le: { code: 'Le', name: '혼자 외부관찰 (Individual, introspective observation)', axis: 'L/S', description: '작품을 개인적으로 관찰하며 객관적 특성 파악' },
  Li: { code: 'Li', name: '혼자 내면탐구 (Individual, inner exploration)', axis: 'L/S', description: '작품과의 내적 대화를 통한 성찰' },
  Se: { code: 'Se', name: '함께 외부교류 (Social, interactive sharing)', axis: 'L/S', description: '타인과 작품에 대한 의견 교환' },
  Si: { code: 'Si', name: '함께 내면공유 (Social, collaborative feeling)', axis: 'L/S', description: '타인과 감정적 공명 추구' },
  Ae: { code: 'Ae', name: '추상 추구 (Abstract, atmospheric seeking)', axis: 'A/R', description: '추상적 작품을 적극적으로 찾고 선호' },
  Ai: { code: 'Ai', name: '추상 음미 (Abstract, impressionistic appreciation)', axis: 'A/R', description: '추상적 작품의 모호함 속에서 개인적 의미 발견' },
  Re: { code: 'Re', name: '구상 추구 (Representational, realistic seeking)', axis: 'A/R', description: '명확한 형태의 작품을 적극 탐색' },
  Ri: { code: 'Ri', name: '구상 음미 (Representational, concrete appreciation)', axis: 'A/R', description: '세밀한 묘사와 구상적 표현을 조용히 감상' },
  Ee: { code: 'Ee', name: '감정 표현 (Emotional, affective expression)', axis: 'E/M', description: '즉각적 감정의 외부 표출' },
  Ei: { code: 'Ei', name: '감정 수용 (Emotional, feeling-based reception)', axis: 'E/M', description: '작품의 감정을 내면으로 흡수' },
  Me: { code: 'Me', name: '의미 전달 (Meaning-driven, analytical sharing)', axis: 'E/M', description: '해석과 의미를 타인에게 설명' },
  Mi: { code: 'Mi', name: '의미 탐구 (Meaning-driven, rational exploration)', axis: 'E/M', description: '심층적 의미를 내적으로 탐색' },
  Fe: { code: 'Fe', name: '경로 창조 (Flow, fluid creation)', axis: 'F/C', description: '즉흥적으로 동선을 만들며 자유롭게 관람' },
  Fi: { code: 'Fi', name: '흐름 따르기 (Flow, spontaneous following)', axis: 'F/C', description: '전시의 자연스러운 흐름이나 직관을 따라 관람' },
  Ce: { code: 'Ce', name: '체계 설계 (Constructive, structured planning)', axis: 'F/C', description: '효율적 관람 순서를 미리 계획하고 실행' },
  Ci: { code: 'Ci', name: '순서 준수 (Constructive, systematic following)', axis: 'F/C', description: '정해진 순서나 추천 경로를 충실히 따라 관람' }
});

// Valid type codes only
const VALID_TYPE_CODES = Object.freeze(Object.keys(SAYU_TYPES));

// Validation functions
function isValidSAYUType(typeCode) {
  return VALID_TYPE_CODES.includes(typeCode);
}

function validateSAYUType(typeCode) {
  if (!isValidSAYUType(typeCode)) {
    throw new Error(`Invalid SAYU type code: ${typeCode}. Valid codes are: ${VALID_TYPE_CODES.join(', ')}`);
  }
  return true;
}

function getSAYUType(typeCode) {
  validateSAYUType(typeCode);
  return SAYU_TYPES[typeCode];
}

function getSAYUFunction(functionCode) {
  if (!SAYU_FUNCTIONS[functionCode]) {
    throw new Error(`Invalid SAYU function code: ${functionCode}`);
  }
  return SAYU_FUNCTIONS[functionCode];
}

function getAllSAYUTypes() {
  return Object.values(SAYU_TYPES);
}

function getAllSAYUFunctions() {
  return Object.values(SAYU_FUNCTIONS);
}

// Type code parsing
function parseSAYUTypeCode(typeCode) {
  validateSAYUType(typeCode);
  return {
    social: typeCode[0], // L or S
    style: typeCode[1],  // A or R
    response: typeCode[2], // E or M
    approach: typeCode[3], // F or C
    fullType: SAYU_TYPES[typeCode]
  };
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SAYU_TYPES,
    SAYU_FUNCTIONS,
    VALID_TYPE_CODES,
    isValidSAYUType,
    validateSAYUType,
    getSAYUType,
    getSAYUFunction,
    getAllSAYUTypes,
    getAllSAYUFunctions,
    parseSAYUTypeCode
  };
}

// Export for ES6
if (typeof exports !== 'undefined') {
  exports.SAYU_TYPES = SAYU_TYPES;
  exports.SAYU_FUNCTIONS = SAYU_FUNCTIONS;
  exports.VALID_TYPE_CODES = VALID_TYPE_CODES;
  exports.isValidSAYUType = isValidSAYUType;
  exports.validateSAYUType = validateSAYUType;
  exports.getSAYUType = getSAYUType;
  exports.getSAYUFunction = getSAYUFunction;
  exports.getAllSAYUTypes = getAllSAYUTypes;
  exports.getAllSAYUFunctions = getAllSAYUFunctions;
  exports.parseSAYUTypeCode = parseSAYUTypeCode;
}