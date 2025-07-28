// SAYU 예술 성격 유형 - 16가지 리브랜딩

const enhancedPersonalityTypes = {
  // Group + Active + Methodical + Free
  GAMF: {
    code: 'GAMF',
    name: '트렌드세터 큐레이터',
    emoji: '🚀',
    color: '#FF6B6B',
    description: '새로운 예술 트렌드를 발굴하고 공유하는 것을 즐기는 당신! 전시회를 기획하듯 체계적으로 접근하면서도 자유로운 해석을 추구합니다.',
    traits: ['혁신적', '사교적', '체계적', '열정적'],
    famousExample: '앤디 워홀처럼 예술과 대중을 연결하는 타입',
    matchingArtists: ['앤디 워홀', '뱅크시', '쿠사마 야요이'],
    communitySize: '전체의 8%',
    rarityBadge: '💎 레어'
  },

  // Group + Active + Methodical + Conventional
  GAMC: {
    code: 'GAMC',
    name: '미술관 인플루언서',
    emoji: '📸',
    color: '#4ECDC4',
    description: '예술을 체계적으로 기록하고 많은 사람들과 나누는 것을 좋아합니다. 전통적 가치를 존중하면서도 활발하게 소통합니다.',
    traits: ['기록적', '소통적', '전통존중', '활동적'],
    famousExample: '미술 평론가나 도슨트처럼 지식을 나누는 타입',
    matchingArtists: ['모네', '반 고흐', '피카소'],
    communitySize: '전체의 12%',
    rarityBadge: '⭐ 일반'
  },

  // Group + Active + Emotional + Free
  GAEF: {
    code: 'GAEF',
    name: '감성 파티 아티스트',
    emoji: '🎭',
    color: '#F7B731',
    description: '예술을 통해 감정을 자유롭게 표현하고 다른 사람들과 그 경험을 나누는 것을 좋아합니다. 전시 오프닝 파티의 주인공!',
    traits: ['표현적', '감성적', '자유로운', '사교적'],
    famousExample: '프리다 칼로처럼 감정을 예술로 승화시키는 타입',
    matchingArtists: ['프리다 칼로', '바스키아', '키스 해링'],
    communitySize: '전체의 10%',
    rarityBadge: '✨ 특별'
  },

  // Solo + Reflective + Emotional + Free
  SREF: {
    code: 'SREF',
    name: '고독한 몽상가',
    emoji: '🌙',
    color: '#5F27CD',
    description: '혼자만의 시간에 작품과 깊이 교감하며 자유로운 상상의 나래를 펼칩니다. 예술을 통한 내면 여행을 즐기는 타입.',
    traits: ['내향적', '상상력풍부', '감성적', '독립적'],
    famousExample: '반 고흐처럼 고독 속에서 예술을 찾는 타입',
    matchingArtists: ['에드워드 호퍼', '르네 마그리트', '오딜롱 르동'],
    communitySize: '전체의 6%',
    rarityBadge: '🌟 유니크'
  },

  // Solo + Reflective + Methodical + Conventional
  SRMC: {
    code: 'SRMC',
    name: '미술 연구가',
    emoji: '📚',
    color: '#00D2D3',
    description: '조용히 작품을 분석하고 역사적 맥락을 파악하는 것을 좋아합니다. 미술사의 깊이를 탐구하는 학구적 감상자.',
    traits: ['분석적', '신중한', '전통적', '깊이있는'],
    famousExample: '미술사학자처럼 체계적으로 접근하는 타입',
    matchingArtists: ['레오나르도 다빈치', '렘브란트', '베르메르'],
    communitySize: '전체의 5%',
    rarityBadge: '💠 희귀'
  },

  // Group + Reflective + Emotional + Conventional
  GREC: {
    code: 'GREC',
    name: '감성 토론가',
    emoji: '☕',
    color: '#FF9FF3',
    description: '카페에서 예술에 대해 깊이 있는 대화를 나누는 것을 좋아합니다. 전통적 가치를 존중하면서도 감성적 교류를 추구.',
    traits: ['대화중심', '감성적', '사려깊은', '전통존중'],
    famousExample: '살롱 문화를 즐기던 19세기 파리지앵 타입',
    matchingArtists: ['모리스', '클림트', '뭉크'],
    communitySize: '전체의 7%',
    rarityBadge: '🎨 아티스틱'
  }

  // ... 나머지 10개 타입도 동일한 형식으로 정의
};

// 타입별 매칭 점수 계산
const calculateTypeMatch = (responses) => {
  const scores = {};

  Object.entries(enhancedPersonalityTypes).forEach(([code, type]) => {
    const matchScore = 0;

    // 응답과 타입 특성 비교
    // ... 매칭 로직

    scores[code] = {
      score: matchScore,
      percentage: Math.round(matchScore * 100),
      type
    };
  });

  return scores;
};

// 희귀도 계산
const getRarityInfo = (typeCode) => {
  const type = enhancedPersonalityTypes[typeCode];
  const percentage = parseFloat(type.communitySize);

  if (percentage < 5) return { level: 'LEGENDARY', color: '#FFD700', bonus: '전설적인 취향!' };
  if (percentage < 8) return { level: 'EPIC', color: '#9B59B6', bonus: '독특한 감성!' };
  if (percentage < 12) return { level: 'RARE', color: '#3498DB', bonus: '특별한 시각!' };
  return { level: 'COMMON', color: '#2ECC71', bonus: '대중적 매력!' };
};

// 타입간 궁합 계산
const calculateCompatibility = (type1, type2) => {
  const t1 = enhancedPersonalityTypes[type1];
  const t2 = enhancedPersonalityTypes[type2];

  let compatibility = 50; // 기본 궁합

  // 같은 차원 비교
  if (type1[0] === type2[0]) compatibility += 10; // Group/Solo
  if (type1[1] === type2[1]) compatibility += 10; // Active/Reflective

  // 보완적 차원
  if (type1[2] !== type2[2]) compatibility += 15; // Methodical/Emotional
  if (type1[3] !== type2[3]) compatibility += 15; // Free/Conventional

  return {
    score: compatibility,
    message: compatibility > 80 ? '환상의 궁합!' :
             compatibility > 60 ? '좋은 시너지!' :
             '서로 다른 매력!'
  };
};

module.exports = {
  enhancedPersonalityTypes,
  calculateTypeMatch,
  getRarityInfo,
  calculateCompatibility
};
