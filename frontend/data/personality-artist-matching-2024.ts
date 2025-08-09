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
    artists: [
      {
        name: 'Vincent van Gogh',
        artwork: 'The Starry Night (1889)',
        type: 'famous',
        reasoning: '소용돌이치는 밤하늘 - 고독한 내면의 감정이 추상적 붓터치로 자유롭게 흐름'
      },
      {
        name: 'Wassily Kandinsky',
        artwork: 'Composition VII (1913)',
        type: 'famous',
        reasoning: '순수 추상으로 폭발하는 감정 - 내면의 음악을 색채로 자유롭게 해방'
      },
      {
        name: 'Odilon Redon',
        artwork: 'The Cyclops (1914)',
        type: 'perfect-match',
        reasoning: '꿈과 환상의 세계 - 고독한 상상력이 만든 신비로운 감정의 흐름'
      }
    ],
    overall_reasoning: '내면의 감정적 폭풍을 추상적이고 자유롭게 표현하는 작가들'
  },

  // LAEC: Lone + Abstract + Emotional + Constructive  
  // 특성: 고독하지만 구조적인 감정표현
  LAEC: {
    artists: [
      {
        name: 'Piet Mondrian',
        artwork: 'Composition with Red Blue and Yellow (1930)',
        type: 'famous',
        reasoning: '감정을 기하학적 균형으로 승화 - 절제된 구조 속 깊은 정서'
      },
      {
        name: 'Paul Klee',
        artwork: 'Senecio (1922)',
        type: 'famous',
        reasoning: '기하학적 얼굴에 담긴 감정 - 체계적 구성 속 따뜻한 정서'
      },
      {
        name: 'Alfred Stieglitz',
        artwork: 'Equivalent (1925)',
        type: 'perfect-match',
        reasoning: '구름 사진의 추상적 감정 - 자연을 통한 구조적 감정 표현'
      }
    ],
    overall_reasoning: '감정을 체계적인 추상 구조로 정제하여 표현하는 작가들'
  },

  // LAMF: Lone + Abstract + Meaning-driven + Flow
  // 특성: 고독한 철학적 탐구, 의미 추구의 자유로운 흐름  
  LAMF: {
    artists: [
      {
        name: 'William Blake',
        artwork: 'The Ancient of Days (1794)',
        type: 'famous',
        reasoning: '우주적 창조의 의미 - 신비주의 철학을 환상적 이미지로 자유롭게 표현'
      },
      {
        name: 'Salvador Dalí',
        artwork: 'The Persistence of Memory (1931)',
        type: 'famous',
        reasoning: '시간의 본질 탐구 - 철학적 개념을 초현실적으로 자유롭게 시각화'
      },
      {
        name: 'El Greco',
        artwork: 'View of Toledo (1596)',
        type: 'perfect-match',
        reasoning: '영적 도시의 비전 - 종교적 의미를 왜곡된 추상으로 표현'
      }
    ],
    overall_reasoning: '존재의 깊은 의미를 추상적이고 자유로운 상상력으로 탐구하는 작가들'
  },

  // LAMC: Lone + Abstract + Meaning-driven + Constructive
  // 특성: 체계적인 철학적 추상화
  LAMC: {
    artists: [
      {
        name: 'Kazimir Malevich',
        artwork: 'Black Square (1915)',
        type: 'famous',
        reasoning: '절대주의의 제로 포인트 - 순수 의미를 극도로 체계화된 추상으로'
      },
      {
        name: 'Paul Cézanne',
        artwork: 'Mont Sainte-Victoire (1904)',
        type: 'famous',
        reasoning: '자연의 기하학적 본질 - 산을 통한 구조적 진리 탐구'
      },
      {
        name: 'Agnes Martin',
        artwork: 'The Tree (1964)',
        type: 'perfect-match',
        reasoning: '격자 속 명상 - 극도로 절제된 체계로 정신적 의미 추구'
      }
    ],
    overall_reasoning: '철학적 본질을 엄격한 추상 체계로 구축하는 작가들'
  },

  // LREF: Lone + Representational + Emotional + Flow
  // 특성: 고독한 현실 묘사, 감정적 자유로움
  LREF: {
    artists: [
      {
        name: 'Edward Hopper',
        artwork: 'Nighthawks (1942)',
        type: 'famous',
        reasoning: '도시의 고독한 영혼들 - 현실적 장면 속 깊은 정서적 고립'
      },
      {
        name: 'Caspar David Friedrich',
        artwork: 'Wanderer above the Sea of Fog (1818)',
        type: 'famous',
        reasoning: '자연 앞의 고독한 인간 - 숭고한 감정의 자유로운 표출'
      },
      {
        name: 'Winslow Homer',
        artwork: 'The Gulf Stream (1899)',
        type: 'perfect-match',
        reasoning: '바다 위 표류하는 인간 - 자연 속 고독과 생존의 감정'
      }
    ],
    overall_reasoning: '현실 속 고독한 순간의 깊은 감정을 자유롭게 포착하는 작가들'
  },

  // LREC: Lone + Representational + Emotional + Constructive
  // 특성: 구조적인 현실 묘사 속 감정 절제
  LREC: {
    artists: [
      {
        name: 'Johannes Vermeer',
        artwork: 'Girl with a Pearl Earring (1665)',
        type: 'famous',
        reasoning: '절제된 감정의 완벽한 구성 - 고요한 순간 속 깊은 정서'
      },
      {
        name: 'Jean-Baptiste-Siméon Chardin',
        artwork: 'Still Life with Glass Flask (1750)',
        type: 'famous',
        reasoning: '정물의 조용한 존재감 - 일상 사물에 담긴 절제된 감성'
      },
      {
        name: 'Henri Fantin-Latour',
        artwork: 'Still Life with Flowers (1866)',
        type: 'perfect-match',
        reasoning: '꽃의 고요한 아름다움 - 섬세하고 절제된 감정의 구조적 배치'
      }
    ],
    overall_reasoning: '현실을 정제된 구조로 담아내며 감정을 절제하여 표현하는 작가들'
  },

  // LRMF: Lone + Representational + Meaning-driven + Flow
  // 특성: 현실 속 철학적 의미의 자유로운 탐구
  LRMF: {
    artists: [
      {
        name: 'Francisco Goya',
        artwork: 'The Third of May 1808 (1814)',
        type: 'famous',
        reasoning: '역사적 비극의 의미 - 전쟁의 참상을 통한 인간성 고발'
      },
      {
        name: 'Hieronymus Bosch',
        artwork: 'The Garden of Earthly Delights (1490-1510)',
        type: 'famous',
        reasoning: '도덕적 알레고리 - 현실과 환상을 넘나들며 인간 본성 탐구'
      },
      {
        name: 'Gustave Courbet',
        artwork: 'The Stone Breakers (1849)',
        type: 'perfect-match',
        reasoning: '노동의 진실 - 사회적 현실을 통한 계급 의식 각성'
      }
    ],
    overall_reasoning: '현실 속 숨겨진 의미와 진실을 자유로운 시선으로 탐구하는 작가들'
  },

  // LRMC: Lone + Representational + Meaning-driven + Constructive
  // 특성: 체계적인 현실 묘사를 통한 의미 전달
  LRMC: {
    artists: [
      {
        name: 'Jan van Eyck',
        artwork: 'The Arnolfini Portrait (1434)',
        type: 'famous',
        reasoning: '숨겨진 상징의 체계 - 모든 디테일이 의미를 담은 완벽한 구성'
      },
      {
        name: 'Diego Velázquez',
        artwork: 'Las Meninas (1656)',
        type: 'famous',
        reasoning: '현실과 환영의 구조 - 복잡한 시점으로 진실 탐구'
      },
      {
        name: 'Giovanni di Paolo',
        artwork: 'The Creation and the Expulsion from Paradise (1445)',
        type: 'perfect-match',
        reasoning: '종교적 서사의 체계화 - 신학적 의미를 시각적 구조로 전달'
      }
    ],
    overall_reasoning: '현실을 치밀한 체계로 구성하여 깊은 의미를 전달하는 작가들'
  },

  // ===== S (SOCIAL) 계열 =====

  // SAEF: Social + Abstract + Emotional + Flow  
  // 특성: 사회적 관계 속 추상적 감정의 자유로운 표현
  SAEF: {
    artists: [
      {
        name: 'Marc Chagall',
        artwork: 'I and the Village (1911)',
        type: 'famous',
        reasoning: '공동체의 기억과 감정 - 고향 사람들과의 따뜻한 추억을 환상적으로'
      },
      {
        name: 'Henri Matisse',
        artwork: 'Dance (1909)',
        type: 'famous',
        reasoning: '함께 추는 춤의 환희 - 사회적 연결의 기쁨을 원초적 형태로'
      },
      {
        name: 'Raoul Dufy',
        artwork: 'The Regatta at Cowes (1934)',
        type: 'perfect-match',
        reasoning: '축제의 활기 - 사람들과 함께하는 즐거움을 경쾌한 색채로'
      }
    ],
    overall_reasoning: '사회적 교감의 감정을 추상적이고 자유롭게 표현하는 작가들'
  },

  // SAEC: Social + Abstract + Emotional + Constructive
  // 특성: 사회적 감정의 구조적 추상화
  SAEC: {
    artists: [
      {
        name: 'Pablo Picasso',
        artwork: 'Les Demoiselles d\'Avignon (1907)',
        type: 'famous',
        reasoning: '사회적 금기의 혁명 - 여성성을 구조적 추상으로 해체하고 재구성'
      },
      {
        name: 'Fernand Léger',
        artwork: 'The City (1919)',
        type: 'famous',
        reasoning: '도시 삶의 리듬 - 현대 사회의 역동성을 기하학적으로 구조화'
      },
      {
        name: 'Stuart Davis',
        artwork: 'Swing Landscape (1938)',
        type: 'perfect-match',
        reasoning: '재즈의 시각화 - 사회적 에너지를 체계적 추상으로'
      }
    ],
    overall_reasoning: '사회적 감정과 에너지를 체계적인 추상 구조로 변환하는 작가들'
  },

  // SAMF: Social + Abstract + Meaning-driven + Flow
  // 특성: 사회적 의미의 추상적 자유 표현
  SAMF: {
    artists: [
      {
        name: 'Pablo Picasso',
        artwork: 'Guernica (1937)',
        type: 'famous',
        reasoning: '전쟁의 비극을 추상으로 - 사회적 메시지를 자유로운 형태로 고발'
      },
      {
        name: 'Joan Miró',
        artwork: 'Harlequin\'s Carnival (1924)',
        type: 'famous',
        reasoning: '사회적 축제의 의미 - 집단 무의식을 자유로운 기호로'
      },
      {
        name: 'Jean-Michel Basquiat',
        artwork: 'Untitled (Skull) (1981)',
        type: 'perfect-match',
        reasoning: '거리 예술의 외침 - 사회적 불평등을 자유로운 추상으로'
      }
    ],
    overall_reasoning: '사회적 의미와 메시지를 추상적이고 자유롭게 탐구하는 작가들'
  },

  // SAMC: Social + Abstract + Meaning-driven + Constructive
  // 특성: 사회적 의미의 체계적 추상화
  SAMC: {
    artists: [
      {
        name: 'Wassily Kandinsky',
        artwork: 'Several Circles (1926)',
        type: 'famous',
        reasoning: '우주적 조화의 체계 - 사회적 질서를 기하학적 법칙으로'
      },
      {
        name: 'Theo van Doesburg',
        artwork: 'Counter-Composition V (1924)',
        type: 'famous',
        reasoning: '사회적 이상의 구조 - 신조형주의로 새로운 사회 질서 추구'
      },
      {
        name: 'László Moholy-Nagy',
        artwork: 'A 19 (1927)',
        type: 'perfect-match',
        reasoning: '기술 사회의 비전 - 산업화 시대의 의미를 체계적 추상으로'
      }
    ],
    overall_reasoning: '사회적 이상과 질서를 엄격한 추상 체계로 구축하는 작가들'
  },

  // SREF: Social + Representational + Emotional + Flow
  // 특성: 사회적 현실의 감정적 자유 표현
  SREF: {
    artists: [
      {
        name: 'Pierre-Auguste Renoir',
        artwork: 'Bal du moulin de la Galette (1876)',
        type: 'famous',
        reasoning: '사회적 기쁨의 순간 - 파리 사람들의 행복한 모임을 따뜻하게'
      },
      {
        name: 'Mary Cassatt',
        artwork: 'The Child\'s Bath (1893)',
        type: 'famous',
        reasoning: '모성애의 친밀함 - 가족 간의 사랑을 부드럽게 포착'
      },
      {
        name: 'Berthe Morisot',
        artwork: 'The Cradle (1872)',
        type: 'perfect-match',
        reasoning: '일상의 정서 - 가정 속 자유로운 감정의 흐름'
      }
    ],
    overall_reasoning: '사회적 관계와 일상의 감정을 자유롭게 표현하는 작가들'
  },

  // SREC: Social + Representational + Emotional + Constructive
  // 특성: 사회적 현실의 절제된 감정 표현
  SREC: {
    artists: [
      {
        name: 'Georges Seurat',
        artwork: 'A Sunday on La Grande Jatte (1884)',
        type: 'famous',
        reasoning: '사회적 질서의 구조 - 주말의 여유를 과학적 점묘법으로 체계화'
      },
      {
        name: 'Grant Wood',
        artwork: 'American Gothic (1930)',
        type: 'famous',
        reasoning: '미국적 가치의 초상 - 사회적 역할을 엄격한 구성으로'
      },
      {
        name: 'Henri Fantin-Latour',
        artwork: 'A Studio at Les Batignolles (1870)',
        type: 'perfect-match',
        reasoning: '예술가 모임의 질서 - 사회적 관계를 절제된 구성으로'
      }
    ],
    overall_reasoning: '사회적 현실을 체계적으로 구성하며 감정을 절제하여 표현하는 작가들'
  },

  // SRMF: Social + Representational + Meaning-driven + Flow
  // 특성: 사회적 현실을 통한 의미의 자유로운 탐구
  SRMF: {
    artists: [
      {
        name: 'Eugène Delacroix',
        artwork: 'Liberty Leading the People (1830)',
        type: 'famous',
        reasoning: '혁명의 열정 - 사회적 자유의 의미를 역동적으로'
      },
      {
        name: 'Théodore Géricault',
        artwork: 'The Raft of the Medusa (1819)',
        type: 'famous',
        reasoning: '인간 연대의 비극 - 생존을 위한 사회적 협력의 의미'
      },
      {
        name: 'Giovanni Battista Tiepolo',
        artwork: 'The Banquet of Cleopatra (1743)',
        type: 'perfect-match',
        reasoning: '권력과 사치의 상징 - 사회적 계층의 의미를 화려하게'
      }
    ],
    overall_reasoning: '사회적 사건과 현실에서 깊은 의미를 자유롭게 탐구하는 작가들'
  },

  // SRMC: Social + Representational + Meaning-driven + Constructive  
  // 특성: 사회적 현실의 체계적 의미 전달
  SRMC: {
    artists: [
      {
        name: 'Jacques-Louis David',
        artwork: 'The Death of Socrates (1787)',
        type: 'famous',
        reasoning: '철학자의 희생 - 사회적 정의와 진리를 엄격한 구성으로'
      },
      {
        name: 'Raphael',
        artwork: 'The School of Athens (1509)',
        type: 'famous',
        reasoning: '지식의 전당 - 사회적 학문 체계를 완벽한 원근법으로'
      },
      {
        name: 'Norman Rockwell',
        artwork: 'Freedom from Want (1943)',
        type: 'perfect-match',
        reasoning: '미국적 이상 - 사회적 가치를 명확한 서사 구조로'
      }
    ],
    overall_reasoning: '사회적 가치와 의미를 체계적이고 명확하게 전달하는 작가들'
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
    artists: matching.artists.map(artist => artist.name),
    reasoning: matching.overall_reasoning
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