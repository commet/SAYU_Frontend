/**
 * SAYU 성격 유형별 작가 매칭 시스템 (2024)
 * Cloudinary에 실제 작품이 존재하는 작가들로만 구성
 * 각 성격 유형의 특성을 깊이 분석하여 매칭
 */

// 실제 사용 가능한 작가와 작품 수
export const AVAILABLE_ARTISTS = {
  'Winslow Homer': 90,           // 미국 현실주의, 자연과 바다
  'Paul Cézanne': 21,            // 프랑스 후기인상주의, 구조적 접근
  'Alfred Stieglitz': 19,        // 미국 모던 사진, 추상적 접근
  'Auguste Rodin': 16,           // 프랑스 조각, 역동적 감정 표현
  'Odilon Redon': 11,           // 프랑스 상징주의, 꿈과 환상
  'John Ruskin': 8,             // 영국 미술비평가, 자연 관찰
  'Eugène Delacroix': 8,        // 프랑스 낭만주의, 열정적 표현
  'Francisco Goya': 6,          // 스페인, 어두운 주제와 사회 비판
  'Giovanni di Paolo': 6,       // 이탈리아 르네상스, 종교적 의미
  'Edvard Munch': 5,           // 노르웨이 표현주의, 심리적 고독
  'Gustave Courbet': 5,        // 프랑스 현실주의, 사회적 진실
  'Giovanni Battista Tiepolo': 5, // 이탈리아 바로크, 화려한 장식
  'Berthe Morisot': 4,         // 프랑스 인상주의, 여성적 시선
  'Edouard Vuillard': 4,       // 프랑스 나비파, 일상의 친밀함
  'Marsden Hartley': 3,        // 미국 모더니즘, 신비주의적 추상
  'Henri Fantin-Latour': 3,    // 프랑스, 섬세한 정물과 초상
  'Amedeo Modigliani': 3,      // 이탈리아 모더니즘, 감정적 왜곡
  'Piet Mondrian': 3,          // 네덜란드 추상, 기하학적 순수성
  'Frederic Remington': 3,     // 미국 서부화가, 역동적 행동
  'El Greco': 3                // 그리스-스페인, 신비주의적 종교화
};

/**
 * 16가지 성격 유형별 최적 작가 매칭
 * 각 유형의 4가지 특성을 모두 고려한 심층 분석
 */
export const PERSONALITY_ARTIST_MATCHING = {
  // ===== L (LONE) 계열 =====
  
  // LAEF: Lone + Abstract + Emotional + Flow
  // 특성: 고독한 내면세계, 추상적 감정표현, 자유로운 흐름
  LAEF: {
    primary: 'Odilon Redon',        // 상징주의, 꿈과 환상의 세계
    secondary: 'Edvard Munch',      // 심리적 고독과 불안의 표현
    tertiary: 'Marsden Hartley',    // 미국식 신비주의적 추상
    reasoning: '내면의 꿈과 환상을 자유롭게 표현하는 작가들'
  },

  // LAEC: Lone + Abstract + Emotional + Constructive  
  // 특성: 고독하지만 구조적인 감정표현
  LAEC: {
    primary: 'Alfred Stieglitz',    // 모던 사진의 구조적 감정표현
    secondary: 'Paul Cézanne',      // 감정을 기하학으로 구조화
    tertiary: 'Piet Mondrian',      // 순수 추상의 감정적 구조
    reasoning: '감정을 체계적이고 구조적으로 표현하는 작가들'
  },

  // LAMF: Lone + Abstract + Meaning-driven + Flow
  // 특성: 고독한 철학적 탐구, 의미 추구의 자유로운 흐름  
  LAMF: {
    primary: 'Odilon Redon',        // 상징주의적 의미 탐구
    secondary: 'John Ruskin',       // 자연에서 찾는 철학적 의미
    tertiary: 'El Greco',           // 신비주의적 종교 철학
    reasoning: '깊은 철학적 의미를 추상적으로 탐구하는 작가들'
  },

  // LAMC: Lone + Abstract + Meaning-driven + Constructive
  // 특성: 체계적인 철학적 추상화
  LAMC: {
    primary: 'Piet Mondrian',       // 순수 추상의 철학적 체계
    secondary: 'Paul Cézanne',      // 자연의 기하학적 본질 탐구
    tertiary: 'Alfred Stieglitz',  // 모던 사진의 철학적 접근
    reasoning: '철학적 개념을 체계적으로 추상화하는 작가들'
  },

  // LREF: Lone + Representational + Emotional + Flow
  // 특성: 고독한 현실 묘사, 감정적 자유로움
  LREF: {
    primary: 'Winslow Homer',       // 자연 속 고독한 인간의 감정
    secondary: 'Edvard Munch',      // 현실적 형태 속 감정 표출
    tertiary: 'Berthe Morisot',     // 일상 속 섬세한 감정 표현
    reasoning: '현실을 바탕으로 고독한 감정을 자유롭게 표현'
  },

  // LREC: Lone + Representational + Emotional + Constructive
  // 특성: 구조적인 현실 묘사 속 감정 절제
  LREC: {
    primary: 'Paul Cézanne',        // 현실의 구조적 감정 표현
    secondary: 'Henri Fantin-Latour', // 정물 속 절제된 감정
    tertiary: 'Winslow Homer',      // 현실적 구도 속 감정 절제
    reasoning: '현실을 구조적으로 묘사하며 감정을 절제해서 표현'
  },

  // LRMF: Lone + Representational + Meaning-driven + Flow
  // 특성: 현실 속 철학적 의미의 자유로운 탐구
  LRMF: {
    primary: 'Francisco Goya',      // 현실 비판과 사회적 의미
    secondary: 'Gustave Courbet',   // 현실주의적 사회 메시지
    tertiary: 'El Greco',           // 현실적 형태 속 종교적 의미
    reasoning: '현실을 통해 깊은 철학적 메시지를 자유롭게 전달'
  },

  // LRMC: Lone + Representational + Meaning-driven + Constructive
  // 특성: 체계적인 현실 묘사를 통한 의미 전달
  LRMC: {
    primary: 'Giovanni di Paolo',   // 종교적 의미의 체계적 표현
    secondary: 'John Ruskin',       // 자연 관찰의 체계적 기록
    tertiary: 'Paul Cézanne',       // 현실의 본질적 구조 탐구
    reasoning: '현실을 체계적으로 분석하여 깊은 의미를 전달'
  },

  // ===== S (SOCIAL) 계열 =====

  // SAEF: Social + Abstract + Emotional + Flow  
  // 특성: 사회적 관계 속 추상적 감정의 자유로운 표현
  SAEF: {
    primary: 'Auguste Rodin',       // 인간관계의 역동적 감정 표현
    secondary: 'Amedeo Modigliani', // 사회적 초상의 감정적 왜곡
    tertiary: 'Edouard Vuillard',   // 사회적 공간 속 추상적 감정
    reasoning: '사회적 관계에서 느끼는 감정을 추상적으로 자유롭게 표현'
  },

  // SAEC: Social + Abstract + Emotional + Constructive
  // 특성: 사회적 감정의 구조적 추상화
  SAEC: {
    primary: 'Alfred Stieglitz',    // 사회적 모더니즘의 구조적 접근
    secondary: 'Piet Mondrian',     // 사회 조화의 기하학적 표현
    tertiary: 'Marsden Hartley',    // 사회적 경험의 구조적 추상
    reasoning: '사회적 감정과 경험을 체계적으로 추상화'
  },

  // SAMF: Social + Abstract + Meaning-driven + Flow
  // 특성: 사회적 의미의 추상적 자유 표현
  SAMF: {
    primary: 'Francisco Goya',      // 사회 비판의 추상적 메시지
    secondary: 'Odilon Redon',      // 사회적 상징의 자유로운 표현
    tertiary: 'Auguste Rodin',      // 인간 관계의 철학적 탐구
    reasoning: '사회적 이슈와 의미를 추상적으로 자유롭게 탐구'
  },

  // SAMC: Social + Abstract + Meaning-driven + Constructive
  // 특성: 사회적 의미의 체계적 추상화
  SAMC: {
    primary: 'Piet Mondrian',       // 사회 조화의 체계적 추상
    secondary: 'Alfred Stieglitz',  // 사회 변화의 구조적 기록
    tertiary: 'Paul Cézanne',       // 사회적 관찰의 기하학적 분석
    reasoning: '사회적 의미와 가치를 체계적으로 추상화'
  },

  // SREF: Social + Representational + Emotional + Flow
  // 특성: 사회적 현실의 감정적 자유 표현
  SREF: {
    primary: 'Berthe Morisot',      // 사회적 일상의 감정적 표현
    secondary: 'Auguste Rodin',     // 인간관계의 감정적 조각
    tertiary: 'Edouard Vuillard',   // 사회적 공간의 친밀한 감정
    reasoning: '사회적 현실 속에서 감정을 자유롭게 표현'
  },

  // SREC: Social + Representational + Emotional + Constructive
  // 특성: 사회적 현실의 절제된 감정 표현
  SREC: {
    primary: 'Henri Fantin-Latour', // 사회적 초상의 절제된 감정
    secondary: 'Berthe Morisot',    // 사회적 역할의 구조적 표현
    tertiary: 'Winslow Homer',      // 사회적 상황의 절제된 묘사
    reasoning: '사회적 현실을 구조적으로 묘사하며 감정을 절제'
  },

  // SRMF: Social + Representational + Meaning-driven + Flow
  // 특성: 사회적 현실을 통한 의미의 자유로운 탐구
  SRMF: {
    primary: 'Giovanni Battista Tiepolo', // 사회적 장면의 화려한 의미
    secondary: 'Eugène Delacroix',  // 사회적 사건의 열정적 의미
    tertiary: 'Frederic Remington', // 사회적 역동성의 의미 탐구
    reasoning: '사회적 현실을 통해 자유롭게 의미를 탐구'
  },

  // SRMC: Social + Representational + Meaning-driven + Constructive  
  // 특성: 사회적 현실의 체계적 의미 전달
  SRMC: {
    primary: 'Giovanni di Paolo',   // 사회적 종교화의 체계적 의미
    secondary: 'Gustave Courbet',   // 사회 현실의 체계적 기록
    tertiary: 'John Ruskin',        // 사회적 자연 관찰의 체계적 분석
    reasoning: '사회적 현실을 체계적으로 분석하여 명확한 의미 전달'
  }
};

/**
 * 성격 유형에 맞는 작가 정보 반환
 */
export function getArtistsForPersonality(personalityType: string) {
  const matching = PERSONALITY_ARTIST_MATCHING[personalityType as keyof typeof PERSONALITY_ARTIST_MATCHING];
  
  if (!matching) {
    // 기본값 (SREF)
    return {
      artists: ['Berthe Morisot', 'Auguste Rodin', 'Edouard Vuillard'],
      reasoning: '기본 추천 작가들'
    };
  }
  
  return {
    artists: [matching.primary, matching.secondary, matching.tertiary],
    reasoning: matching.reasoning
  };
}

/**
 * 작가별 상세 정보
 */
export const ARTIST_DETAILS = {
  'Winslow Homer': {
    period: '1836-1910',
    nationality: 'American',
    style: 'Realism',
    keyThemes: ['Nature', 'Solitude', 'Maritime', 'Human vs Nature'],
    description: '미국 현실주의의 거장으로 자연과 바다, 고독한 인간의 모습을 강렬하게 그렸습니다.'
  },
  'Paul Cézanne': {
    period: '1839-1906', 
    nationality: 'French',
    style: 'Post-Impressionism',
    keyThemes: ['Structure', 'Geometry', 'Nature', 'Color Theory'],
    description: '후기인상주의의 아버지로 자연을 기하학적으로 분석하여 현대미술의 토대를 마련했습니다.'
  },
  'Alfred Stieglitz': {
    period: '1864-1946',
    nationality: 'American', 
    style: 'Modern Photography',
    keyThemes: ['Modernism', 'Abstract Photography', 'Urban Life'],
    description: '모던 사진의 선구자로 사진을 예술의 영역으로 끌어올렸습니다.'
  },
  'Auguste Rodin': {
    period: '1840-1917',
    nationality: 'French',
    style: 'Modern Sculpture', 
    keyThemes: ['Human Form', 'Emotion', 'Movement', 'Passion'],
    description: '현대 조각의 아버지로 인간의 감정과 움직임을 역동적으로 표현했습니다.'
  },
  'Odilon Redon': {
    period: '1840-1916',
    nationality: 'French',
    style: 'Symbolism',
    keyThemes: ['Dreams', 'Fantasy', 'Symbolism', 'Inner World'],
    description: '상징주의의 대표 작가로 꿈과 환상의 세계를 신비롭게 그려냈습니다.'
  },
  'Edvard Munch': {
    period: '1863-1944',
    nationality: 'Norwegian',
    style: 'Expressionism',
    keyThemes: ['Anxiety', 'Death', 'Isolation', 'Human Condition'],
    description: '표현주의의 선구자로 인간의 고독과 불안을 강렬하게 표현했습니다.'
  },
  'Francisco Goya': {
    period: '1746-1828',
    nationality: 'Spanish',
    style: 'Romanticism',
    keyThemes: ['Social Criticism', 'War', 'Human Nature', 'Darkness'],
    description: '스페인의 거장으로 사회 비판과 인간 본성의 어두운 면을 날카롭게 그려냈습니다.'
  },
  'Berthe Morisot': {
    period: '1841-1895',
    nationality: 'French',
    style: 'Impressionism',
    keyThemes: ['Daily Life', 'Family', 'Feminine Perspective', 'Light'],
    description: '인상주의의 여성 화가로 일상과 가족의 삶을 섬세한 시선으로 담아냈습니다.'
  },
  'Giovanni di Paolo': {
    period: '1398-1482',
    nationality: 'Italian',
    style: 'Renaissance',
    keyThemes: ['Religious', 'Medieval', 'Spiritual', 'Narrative'],
    description: '이탈리아 르네상스의 화가로 종교적 주제를 서정적으로 표현했습니다.'
  },
  'Piet Mondrian': {
    period: '1872-1944',
    nationality: 'Dutch',
    style: 'Abstract',
    keyThemes: ['Pure Abstraction', 'Geometry', 'Harmony', 'Spirituality'],
    description: '추상미술의 거장으로 순수한 기하학적 형태로 우주의 조화를 표현했습니다.'
  }
};