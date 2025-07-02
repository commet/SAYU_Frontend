// 🎨 SAYU Art Chemistry Guide
// 예술 성격 유형 간 케미스트리 데이터

export interface ChemistryData {
  type1: string;
  type2: string;
  compatibility: 'perfect' | 'good' | 'challenging' | 'learning';
  title: string;
  title_ko: string;
  synergy: {
    description: string;
    description_ko: string;
  };
  recommendedExhibitions: string[];
  recommendedExhibitions_ko: string[];
  conversationExamples: Array<{
    person1: string;
    person1_ko: string;
    person2: string;
    person2_ko: string;
  }>;
  tips: {
    for_type1: string;
    for_type1_ko: string;
    for_type2: string;
    for_type2_ko: string;
  };
}

export const chemistryData: ChemistryData[] = [
  // 💕 Perfect Chemistry (95%+)
  {
    type1: 'LAEF',
    type2: 'SAEF',
    compatibility: 'perfect',
    title: 'Emotional Resonance Duo',
    title_ko: '감성 공유의 환상 듀오',
    synergy: {
      description: "Fox's deep inner world + Butterfly's emotional expression",
      description_ko: '여우의 깊은 내면 세계 + 나비의 감정 표현력'
    },
    recommendedExhibitions: [
      'Immersive media art',
      'Interactive installations',
      'Light art exhibitions',
      'Emotional abstract art'
    ],
    recommendedExhibitions_ko: [
      '몰입형 미디어 아트',
      '인터랙티브 설치 전시',
      '라이트 아트 전시',
      '감정적 추상 예술'
    ],
    conversationExamples: [
      {
        person1: "I feel a deep loneliness in this piece...",
        person1_ko: "이 작품에서 느껴지는 쓸쓸함이...",
        person2: "Yes! But there's also hope hidden within, don't you think?",
        person2_ko: "맞아! 근데 그 속에 희망도 있지 않아?"
      }
    ],
    tips: {
      for_type1: "Share your deep feelings - Butterfly will help express them beautifully",
      for_type1_ko: "깊은 감정을 나누세요 - 나비가 아름답게 표현해줄 거예요",
      for_type2: "Give Fox time to open up - their insights will amaze you",
      for_type2_ko: "여우가 마음을 열 시간을 주세요 - 놀라운 통찰을 얻을 거예요"
    }
  },
  {
    type1: 'LRMC',
    type2: 'SRMF',
    compatibility: 'perfect',
    title: 'Knowledge Sharing Power Duo',
    title_ko: '지식 나눔의 완벽 콤비',
    synergy: {
      description: "Beaver's deep research + Elephant's excellent delivery",
      description_ko: '비버의 깊은 연구 + 코끼리의 뛰어난 전달력'
    },
    recommendedExhibitions: [
      'Retrospective exhibitions',
      'Archive exhibitions',
      'Art history specials',
      'Documentary exhibitions'
    ],
    recommendedExhibitions_ko: [
      '회고전',
      '아카이브 전시',
      '미술사 특별전',
      '다큐멘터리 전시'
    ],
    conversationExamples: [
      {
        person1: "During the artist's blue period, the use of...",
        person1_ko: "이 화가가 청색 시대에...",
        person2: "Ah! So that's why it feels this way!",
        person2_ko: "아하! 그래서 이런 느낌이 나는구나!"
      }
    ],
    tips: {
      for_type1: "Share your discoveries - Elephant will spread them wonderfully",
      for_type1_ko: "발견한 것을 공유하세요 - 코끼리가 멋지게 전파해줄 거예요",
      for_type2: "Ask Beaver for deeper context - they love to share knowledge",
      for_type2_ko: "비버에게 깊은 맥락을 물어보세요 - 지식 나누기를 좋아해요"
    }
  },
  {
    type1: 'LAMC',
    type2: 'LAMF',
    compatibility: 'perfect',
    title: 'Silent Philosophers Meeting',
    title_ko: '사색가들의 조용한 만남',
    synergy: {
      description: "Turtle's systematic collection + Owl's intuitive insights",
      description_ko: '거북이의 체계적 수집 + 올빼미의 직관적 통찰'
    },
    recommendedExhibitions: [
      'Contemporary art',
      'Conceptual art',
      'Philosophical themed exhibitions',
      'Minimalist art'
    ],
    recommendedExhibitions_ko: [
      '컨템포러리 아트',
      '개념미술',
      '철학적 주제전',
      '미니멀리즘 아트'
    ],
    conversationExamples: [
      {
        person1: "...",
        person1_ko: "...",
        person2: "What did you feel just now?",
        person2_ko: "지금 뭘 느꼈어?"
      }
    ],
    tips: {
      for_type1: "Comfortable silence is okay - Owl understands",
      for_type1_ko: "편안한 침묵도 괜찮아요 - 올빼미는 이해해요",
      for_type2: "Give Turtle time to process - their insights are worth waiting for",
      for_type2_ko: "거북이가 생각할 시간을 주세요 - 기다릴 가치가 있어요"
    }
  },
  {
    type1: 'SAEC',
    type2: 'SREC',
    compatibility: 'perfect',
    title: 'Perfect Exhibition Companions',
    title_ko: '완벽한 전시 동행자',
    synergy: {
      description: "Penguin's networking + Duck's guiding ability",
      description_ko: '펭귄의 네트워킹 + 오리의 가이드 능력'
    },
    recommendedExhibitions: [
      'Large art fairs',
      'Biennales',
      'Group exhibitions',
      'Opening events'
    ],
    recommendedExhibitions_ko: [
      '대규모 아트 페어',
      '비엔날레',
      '그룹전',
      '오프닝 행사'
    ],
    conversationExamples: [
      {
        person1: "Should we check out the emerging artists section on the 2nd floor?",
        person1_ko: "2층 신진 작가 섹션 가볼까?",
        person2: "Great! I've mapped out the optimal route!",
        person2_ko: "좋아! 내가 최적 동선 짜놨어!"
      }
    ],
    tips: {
      for_type1: "Trust Duck's guidance - they know how to enhance experiences",
      for_type1_ko: "오리의 안내를 믿으세요 - 경험을 풍부하게 만들어요",
      for_type2: "Let Penguin introduce you to people - expand your art network",
      for_type2_ko: "펭귄이 사람들을 소개하게 하세요 - 예술 네트워크가 넓어져요"
    }
  },
  {
    type1: 'LREF',
    type2: 'LAEF',
    compatibility: 'perfect',
    title: 'Delicate Sensitivity Harmony',
    title_ko: '섬세한 감성의 하모니',
    synergy: {
      description: "Chameleon's color sense + Fox's emotional depth",
      description_ko: '카멜레온의 색채 감각 + 여우의 감정 깊이'
    },
    recommendedExhibitions: [
      'Impressionist exhibitions',
      'Color-focused exhibitions',
      'Light art',
      'Nature-inspired art'
    ],
    recommendedExhibitions_ko: [
      '인상주의전',
      '색채 중심 전시',
      '라이트 아트',
      '자연 영감 예술'
    ],
    conversationExamples: [
      {
        person1: "That purple feels like sadness",
        person1_ko: "저 보라색이 슬픔 같아",
        person2: "Yes, but it's a warm sadness",
        person2_ko: "응, 근데 따뜻한 슬픔이야"
      }
    ],
    tips: {
      for_type1: "Share your color perceptions - Fox will add emotional layers",
      for_type1_ko: "색채 인식을 공유하세요 - 여우가 감정의 층을 더해줄 거예요",
      for_type2: "Notice Chameleon's subtle reactions - they see what others miss",
      for_type2_ko: "카멜레온의 미묘한 반응을 주목하세요 - 남들이 놓치는 것을 봐요"
    }
  },

  // 😊 Good Chemistry (70-85%)
  {
    type1: 'LAMF',
    type2: 'SAMF',
    compatibility: 'good',
    title: 'Intuition Amplifiers',
    title_ko: '직관의 증폭기',
    synergy: {
      description: "Owl's deep insights + Parrot's enthusiastic sharing",
      description_ko: '올빼미의 깊은 통찰 + 앵무새의 열정적 공유'
    },
    recommendedExhibitions: [
      'Experimental art',
      'New media exhibitions',
      'Conceptual installations'
    ],
    recommendedExhibitions_ko: [
      '실험 예술',
      '뉴미디어 전시',
      '개념적 설치 작품'
    ],
    conversationExamples: [
      {
        person1: "I sense a hidden pattern here...",
        person1_ko: "여기 숨겨진 패턴이 있는 것 같아...",
        person2: "Oh wow! Let me share this discovery with everyone!",
        person2_ko: "와! 이 발견을 모두와 나눠야겠어!"
      }
    ],
    tips: {
      for_type1: "Your insights are valuable - let Parrot help spread them",
      for_type1_ko: "당신의 통찰은 가치있어요 - 앵무새가 퍼뜨리도록 하세요",
      for_type2: "Give Owl quiet moments - their discoveries are worth sharing",
      for_type2_ko: "올빼미에게 조용한 순간을 주세요 - 그들의 발견은 나눌 가치가 있어요"
    }
  },

  // 😅 Challenging Chemistry (40-60%)
  {
    type1: 'LAEF',
    type2: 'SRMC',
    compatibility: 'challenging',
    title: 'Dreams vs Reality Contrast',
    title_ko: '꿈과 현실의 대조',
    synergy: {
      description: "Fox wants to feel while Eagle wants to explain",
      description_ko: '여우는 느끼고 싶은데 독수리는 설명하려 해요'
    },
    recommendedExhibitions: [
      'Balanced exhibitions with both emotional and educational elements',
      'Audio guide optional exhibitions'
    ],
    recommendedExhibitions_ko: [
      '감성과 교육 요소가 균형잡힌 전시',
      '오디오 가이드 선택형 전시'
    ],
    conversationExamples: [
      {
        person1: "I just want to feel this moment...",
        person1_ko: "그냥 이 순간을 느끼고 싶어...",
        person2: "But did you know the artist used this technique because...",
        person2_ko: "그런데 작가가 이 기법을 쓴 이유가..."
      }
    ],
    tips: {
      for_type1: "It's okay to ask for quiet time - Eagle will understand",
      for_type1_ko: "조용한 시간을 요청해도 괜찮아요 - 독수리는 이해할 거예요",
      for_type2: "Sometimes silence speaks louder - let Fox dream",
      for_type2_ko: "때로는 침묵이 더 많은 것을 말해요 - 여우가 꿈꾸게 하세요"
    }
  },
  {
    type1: 'SREF',
    type2: 'LAMC',
    compatibility: 'challenging',
    title: 'Speed Mismatch',
    title_ko: '속도의 불일치',
    synergy: {
      description: "Dog wants to see everything quickly while Turtle savors slowly",
      description_ko: '강아지는 빨리 많이 보고 싶은데 거북이는 천천히 음미해요'
    },
    recommendedExhibitions: [
      'Medium-sized exhibitions',
      'Exhibitions with clear sections'
    ],
    recommendedExhibitions_ko: [
      '중간 규모 전시',
      '섹션이 명확한 전시'
    ],
    conversationExamples: [
      {
        person1: "Let's quickly check the next room!",
        person1_ko: "빨리 다음 방 보러 가자!",
        person2: "Wait, I haven't finished understanding this piece...",
        person2_ko: "잠깐, 아직 이 작품을 다 이해 못했는데..."
      }
    ],
    tips: {
      for_type1: "Practice patience - Turtle's insights are worth the wait",
      for_type1_ko: "인내심을 연습하세요 - 거북이의 통찰은 기다릴 가치가 있어요",
      for_type2: "It's okay to let Dog scout ahead and return",
      for_type2_ko: "강아지가 먼저 둘러보고 돌아오게 해도 괜찮아요"
    }
  },

  // 🌱 Learning Chemistry (50-70%)
  {
    type1: 'LREC',
    type2: 'SAMF',
    compatibility: 'learning',
    title: 'Quiet Depth Meets Loud Joy',
    title_ko: '조용한 깊이와 시끄러운 기쁨의 만남',
    synergy: {
      description: "Deer's delicate emotions + Parrot's expressive energy",
      description_ko: '사슴의 섬세한 감정 + 앵무새의 표현적 에너지'
    },
    recommendedExhibitions: [
      'Exhibitions with quiet and social spaces',
      'Diverse art collections'
    ],
    recommendedExhibitions_ko: [
      '조용한 공간과 소셜 공간이 있는 전시',
      '다양한 예술 컬렉션'
    ],
    conversationExamples: [
      {
        person1: "This subtle texture reminds me of...",
        person1_ko: "이 미묘한 질감이 떠올리는 건...",
        person2: "Amazing! Everyone needs to hear about this!",
        person2_ko: "대박! 모두가 이걸 들어야 해!"
      }
    ],
    tips: {
      for_type1: "Your sensitivity is a gift - help Parrot understand nuance",
      for_type1_ko: "당신의 민감함은 선물이에요 - 앵무새가 뉘앙스를 이해하도록 도와주세요",
      for_type2: "Lower your volume sometimes - Deer hears everything",
      for_type2_ko: "가끔 볼륨을 낮추세요 - 사슴은 모든 것을 들어요"
    }
  }
];

// Helper functions
export const getChemistry = (type1: string, type2: string): ChemistryData | null => {
  return chemistryData.find(
    (chem) => 
      (chem.type1 === type1 && chem.type2 === type2) ||
      (chem.type1 === type2 && chem.type2 === type1)
  ) || null;
};

export const getChemistryScore = (compatibility: string): number => {
  const scores = {
    perfect: 95,
    good: 80,
    challenging: 50,
    learning: 65
  };
  return scores[compatibility as keyof typeof scores] || 50;
};

export const getAllChemistriesForType = (type: string): ChemistryData[] => {
  return chemistryData.filter(
    (chem) => chem.type1 === type || chem.type2 === type
  );
};