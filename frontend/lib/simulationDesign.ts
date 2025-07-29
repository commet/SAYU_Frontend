// SAYU Museum Visit Simulation Design
// 미술관 방문 시뮬레이션 설계

export const simulationFlow = {
  title: "당신의 미술관 여행",
  title_en: "Your Museum Journey",
  description: "미술관을 방문하는 당신의 모습을 통해 예술 취향을 발견합니다",
  description_en: "Discover your art preferences through your museum visit experience",
  
  stages: [
    {
      id: "city",
      name: "출발",
      name_en: "Departure",
      narrative: "주말 오후, 당신은 미술관을 방문하기로 결정했습니다.",
      narrative_en: "On a weekend afternoon, you've decided to visit an art museum.",
      question: "어떤 미술관을 방문하시겠습니까?",
      question_en: "Which museum would you like to visit?",
      choices: [
        {
          id: "modern",
          label: "현대미술관",
          label_en: "Modern Art Museum",
          description: "실험적이고 혁신적인 작품들",
          description_en: "Experimental and innovative artworks",
          image: "/images/simulation/modern-museum.jpg",
          weights: { A: 2, R: -1 }
        },
        {
          id: "classical",
          label: "국립미술관",
          label_en: "National Museum",
          description: "전통적이고 역사적인 작품들",
          description_en: "Traditional and historical artworks",
          image: "/images/simulation/classical-museum.jpg",
          weights: { A: -1, R: 2 }
        }
      ]
    },
    
    {
      id: "entrance",
      name: "도착",
      name_en: "Arrival",
      narrative: "미술관에 도착했습니다. 입구에서 오늘의 전시를 확인합니다.",
      narrative_en: "You've arrived at the museum. At the entrance, you check today's exhibitions.",
      question: "어떻게 관람을 시작하시겠습니까?",
      question_en: "How would you like to start your visit?",
      backgroundImage: "/images/simulation/museum-entrance.jpg",
      choices: [
        {
          id: "alone",
          label: "혼자서 자유롭게",
          label_en: "Explore alone freely",
          description: "나만의 속도로 천천히",
          description_en: "At my own pace, slowly",
          image: "/images/simulation/alone-viewing.jpg",
          weights: { L: 2, S: -1 }
        },
        {
          id: "docent",
          label: "도슨트 투어 참여",
          label_en: "Join a docent tour",
          description: "전문가의 설명과 함께",
          description_en: "With expert explanations",
          image: "/images/simulation/docent-tour.jpg",
          weights: { L: -1, S: 2 }
        }
      ]
    },
    
    {
      id: "exhibition",
      name: "첫 작품",
      name_en: "First Artwork",
      narrative: "전시장에 들어서자 거대한 작품이 당신을 맞이합니다.",
      narrative_en: "As you enter the exhibition hall, a massive artwork greets you.",
      question: "이 작품을 보고 가장 먼저 드는 생각은?",
      question_en: "What's your first thought upon seeing this artwork?",
      backgroundImage: "/images/simulation/gallery-space.jpg",
      choices: [
        {
          id: "emotion",
          label: "와, 정말 아름답다",
          label_en: "Wow, it's truly beautiful",
          description: "감정이 먼저 반응한다",
          description_en: "Emotions respond first",
          image: "/images/simulation/emotional-response.jpg",
          weights: { E: 2, M: -1 }
        },
        {
          id: "meaning",
          label: "무엇을 표현한 걸까?",
          label_en: "What is it trying to express?",
          description: "의미를 찾으려 한다",
          description_en: "Trying to find meaning",
          image: "/images/simulation/analytical-response.jpg",
          weights: { E: -1, M: 2 }
        }
      ]
    },
    
    {
      id: "viewing",
      name: "감상 방식",
      name_en: "Viewing Style",
      narrative: "전시를 둘러보며 여러 작품을 만납니다.",
      narrative_en: "As you browse the exhibition, you encounter various artworks.",
      question: "작품을 감상하는 당신의 스타일은?",
      question_en: "What's your style of appreciating art?",
      backgroundImage: "/images/simulation/viewing-art.jpg",
      choices: [
        {
          id: "flow",
          label: "흐름따라 자유롭게",
          label_en: "Freely following the flow",
          description: "마음이 이끄는 대로",
          description_en: "As my heart leads",
          image: "/images/simulation/flow-viewing.jpg",
          weights: { F: 2, C: -1 }
        },
        {
          id: "systematic",
          label: "작품 설명 꼼꼼히",
          label_en: "Reading descriptions carefully",
          description: "정보를 차근차근 읽으며",
          description_en: "Reading information step by step",
          image: "/images/simulation/reading-labels.jpg",
          weights: { F: -1, C: 2 }
        }
      ]
    },
    
    {
      id: "moment",
      name: "인상적인 작품",
      name_en: "Impressive Artwork",
      narrative: "한 작품 앞에서 발걸음이 멈춥니다.",
      narrative_en: "Your steps pause in front of one artwork.",
      question: "어떤 작품이 당신의 마음을 사로잡았나요?",
      question_en: "What kind of artwork captivated your heart?",
      backgroundImage: "/images/simulation/special-moment.jpg",
      choices: [
        {
          id: "abstract",
          label: "추상적인 색채 작품",
          label_en: "Abstract color artwork",
          description: "형태보다는 느낌이 중요한",
          description_en: "Where feeling matters more than form",
          image: "/images/simulation/abstract-art.jpg",
          weights: { A: 2, E: 1 }
        },
        {
          id: "realistic",
          label: "정교한 인물화",
          label_en: "Detailed portrait",
          description: "섬세한 표현이 돋보이는",
          description_en: "With outstanding delicate expression",
          image: "/images/simulation/portrait-art.jpg",
          weights: { R: 2, M: 1 }
        }
      ]
    },
    
    {
      id: "rest",
      name: "휴식",
      name_en: "Break",
      narrative: "잠시 미술관 카페에서 휴식을 취합니다.",
      narrative_en: "You take a break at the museum cafe.",
      question: "누구와 오늘의 경험을 나누고 싶나요?",
      question_en: "Who would you like to share today's experience with?",
      backgroundImage: "/images/simulation/museum-cafe.jpg",
      choices: [
        {
          id: "journal",
          label: "일기에 기록하기",
          label_en: "Write in my journal",
          description: "혼자만의 생각 정리",
          description_en: "Organizing my thoughts alone",
          image: "/images/simulation/writing-journal.jpg",
          weights: { L: 2, C: 1 }
        },
        {
          id: "share",
          label: "SNS에 공유하기",
          label_en: "Share on social media",
          description: "친구들과 감상 나누기",
          description_en: "Sharing impressions with friends",
          image: "/images/simulation/sharing-phone.jpg",
          weights: { S: 2, F: 1 }
        }
      ]
    },
    
    {
      id: "shop",
      name: "기념품",
      name_en: "Souvenir",
      narrative: "미술관을 나서기 전, 아트샵에 들렀습니다.",
      narrative_en: "Before leaving the museum, you stop by the art shop.",
      question: "어떤 기념품에 끌리나요?",
      question_en: "What kind of souvenir attracts you?",
      backgroundImage: "/images/simulation/museum-shop.jpg",
      choices: [
        {
          id: "postcard",
          label: "감동적인 작품 엽서",
          label_en: "Moving artwork postcard",
          description: "오늘 본 그 작품을 간직",
          description_en: "To keep that artwork seen today",
          image: "/images/simulation/art-postcard.jpg",
          weights: { E: 2, R: 1 }
        },
        {
          id: "book",
          label: "전시 도록",
          label_en: "Exhibition catalog",
          description: "작품에 대한 깊은 이해",
          description_en: "Deep understanding of the artworks",
          image: "/images/simulation/art-book.jpg",
          weights: { M: 2, C: 1 }
        }
      ]
    },
    
    {
      id: "reflection",
      name: "마무리",
      name_en: "Conclusion",
      narrative: "집으로 돌아가는 길, 오늘의 경험을 되돌아봅니다.",
      narrative_en: "On your way home, you reflect on today's experience.",
      question: "가장 기억에 남는 것은?",
      question_en: "What's the most memorable thing?",
      backgroundImage: "/images/simulation/sunset-street.jpg",
      choices: [
        {
          id: "feeling",
          label: "작품이 준 감동",
          label_en: "The emotion from the artwork",
          description: "마음속에 남은 여운",
          description_en: "The lingering feeling in my heart",
          image: "/images/simulation/emotional-memory.jpg",
          weights: { E: 2, A: 1 }
        },
        {
          id: "insight",
          label: "새로운 관점",
          label_en: "New perspective",
          description: "예술에 대한 깨달음",
          description_en: "Enlightenment about art",
          image: "/images/simulation/new-perspective.jpg",
          weights: { M: 2, R: 1 }
        }
      ]
    }
  ]
};

// Image requirements for implementation
export const imageRequirements = {
  backgrounds: [
    "city-view.jpg - 도시 전경, 미술관으로 향하는 느낌",
    "museum-entrance.jpg - 미술관 입구, 웅장하고 초대하는 느낌",
    "gallery-space.jpg - 갤러리 내부, 작품이 걸린 공간",
    "viewing-art.jpg - 사람들이 작품을 감상하는 모습",
    "special-moment.jpg - 특별한 작품 앞에서의 순간",
    "museum-cafe.jpg - 아늑한 미술관 카페",
    "museum-shop.jpg - 다양한 굿즈가 있는 아트샵",
    "sunset-street.jpg - 노을 지는 거리, 귀가하는 느낌"
  ],
  choices: [
    "modern-museum.jpg - 현대적인 미술관 외관",
    "classical-museum.jpg - 고전적인 미술관 외관",
    "alone-viewing.jpg - 혼자 작품을 보는 실루엣",
    "docent-tour.jpg - 도슨트와 관람객들",
    "emotional-response.jpg - 감정적 반응을 보이는 관람객",
    "analytical-response.jpg - 생각에 잠긴 관람객",
    "flow-viewing.jpg - 자유롭게 둘러보는 모습",
    "reading-labels.jpg - 작품 설명을 읽는 모습",
    "abstract-art.jpg - 추상 미술 작품",
    "portrait-art.jpg - 정교한 인물화",
    "writing-journal.jpg - 노트에 기록하는 손",
    "sharing-phone.jpg - 휴대폰으로 공유하는 모습",
    "art-postcard.jpg - 예술 엽서들",
    "art-book.jpg - 전시 도록",
    "emotional-memory.jpg - 감동적인 순간의 추상적 표현",
    "new-perspective.jpg - 새로운 시각의 추상적 표현"
  ]
};

// Personality calculation remains the same but with narrative context
export const calculatePersonalityFromSimulation = (responses: any[]) => {
  // Same calculation logic as before
  const scores = { L: 0, S: 0, A: 0, R: 0, E: 0, M: 0, F: 0, C: 0 };
  
  responses.forEach(response => {
    if (response.weights) {
      Object.entries(response.weights).forEach(([axis, value]) => {
        if (axis in scores && typeof value === 'number') {
          scores[axis as keyof typeof scores] = (scores[axis as keyof typeof scores] || 0) + value;
        }
      });
    }
  });
  
  const type = [
    scores.L > scores.S ? 'L' : 'S',
    scores.A > scores.R ? 'A' : 'R', 
    scores.E > scores.M ? 'E' : 'M',
    scores.F > scores.C ? 'F' : 'C'
  ].join('');
  
  return { type, scores };
};