// 챗봇 컨텍스트 및 페이지별 설정

export interface PageContext {
  type: 'home' | 'quiz' | 'gallery' | 'artwork' | 'profile' | 'exhibition' | 'results' | 'community' | 'discover' | 'daily' | 'unknown';
  metadata?: {
    artworkId?: string;
    artworkTitle?: string;
    artistName?: string;
    exhibitionName?: string;
    quizStep?: number;
    personalityType?: string;
  };
}

// 페이지별 인사말 및 제안
export const PAGE_GREETINGS = {
  home: {
    initial: [
      "안녕하세요! SAYU의 AI 큐레이터 미유예요 ✨ 오늘 어떤 기분이신가요?",
      "반가워요! 당신만의 예술 여행을 시작해볼까요? 🎨",
      "SAYU에 오신 걸 환영해요! 어떤 예술 세계를 탐험하고 싶으신가요?"
    ],
    suggestions: [
      "SAYU가 뭔가요?",
      "성격 테스트는 어떻게 하나요?",
      "어떤 서비스인지 알려주세요"
    ],
    idlePrompts: [
      "무엇을 도와드릴까요?",
      "예술 여행을 시작해볼까요?",
      "궁금한 것이 있으면 언제든 물어보세요!"
    ]
  },
  
  quiz: {
    initial: [
      "성격 유형 테스트를 시작하시는군요! 🎨",
      "당신만의 예술 성향을 찾아드릴게요",
      "편안한 마음으로 질문에 답해주세요"
    ],
    suggestions: [
      "테스트는 얼마나 걸리나요?",
      "다시 할 수 있나요?",
      "어떤 결과가 나올 수 있나요?"
    ],
    idlePrompts: [
      "질문이 어려우신가요? 도와드릴게요",
      "천천히 생각해보세요. 정답은 없어요",
      "막히는 부분이 있으면 알려주세요"
    ]
  },
  
  gallery: {
    initial: [
      "어떤 작품을 찾고 계신가요? 도와드릴게요! 🖼️",
      "멋진 작품들이 가득하네요! 마음에 드는 작품이 있나요?",
      "갤러리 탐험을 함께 해봐요! 어떤 스타일을 좋아하시나요?"
    ],
    suggestions: [
      "인상주의 작품 보기",
      "오늘의 추천 작품은?",
      "내 취향에 맞는 작품 찾기"
    ],
    idlePrompts: [
      "어떤 분위기의 작품을 찾고 계신가요?",
      "작품 추천을 받아보실까요?",
      "특정 작가나 시대가 궁금하신가요?"
    ]
  },
  
  artwork: {
    initial: [
      "{artworkTitle}을(를) 감상하고 계시네요",
      "정말 멋진 선택이에요! 이 작품에 대해 이야기해볼까요?",
      "{artistName}의 작품을 보고 계시는군요"
    ],
    suggestions: [
      "이 작품에 대해 더 알려주세요",
      "작가는 어떤 사람인가요?",
      "비슷한 작품 추천해주세요"
    ],
    idlePrompts: [
      "이 작품에서 어떤 감정이 느껴지시나요?",
      "특별히 눈에 띄는 부분이 있나요?",
      "작품의 어떤 점이 마음에 드시나요?"
    ]
  },
  
  profile: {
    initial: [
      "프로필을 멋지게 꾸며보실래요? 도와드릴게요! 📊",
      "{personalityType} 유형의 특별한 예술 여정이네요!",
      "당신의 예술 취향을 더 깊이 알아볼까요?"
    ],
    suggestions: [
      "내 취향 분석해주세요",
      "추천 작품 보여주세요",
      "프로필 꾸미기 도움"
    ],
    idlePrompts: [
      "프로필 설정에 도움이 필요하신가요?",
      "새로운 기능을 시도해보실래요?",
      "궁금한 것이 있으면 물어보세요!"
    ]
  },
  
  exhibition: {
    initial: [
      "특별한 전시를 둘러보고 계시네요! 🎭",
      "{exhibitionName} 전시에 오신 걸 환영해요",
      "어떤 작품부터 보실래요?"
    ],
    suggestions: [
      "전시 하이라이트 보여주세요",
      "큐레이터 노트가 있나요?",
      "관람 순서 추천해주세요"
    ],
    idlePrompts: [
      "전시가 마음에 드시나요?",
      "특별히 인상적인 작품이 있었나요?",
      "다른 전시도 추천해드릴까요?"
    ]
  },
  
  results: {
    initial: [
      "축하해요! 당신은 {personalityType} 유형이시네요! 🎉",
      "드디어 당신만의 예술 성향을 발견했어요!",
      "이제 진짜 예술 여행이 시작됩니다"
    ],
    suggestions: [
      "내 유형에 대해 자세히 알려주세요",
      "추천 작품 보여주세요",
      "다른 유형은 어떤가요?"
    ],
    idlePrompts: [
      "결과가 마음에 드시나요?",
      "궁금한 점이 있으신가요?",
      "이제 어떤 것부터 해볼까요?"
    ]
  },
  
  community: {
    initial: [
      "커뮤니티에 오신 것을 환영해요! 🤝",
      "다른 사용자들과 예술 이야기를 나눠보세요!",
      "어떤 아트 클럽에 관심이 있으신가요?"
    ],
    suggestions: [
      "아트 클럽이 뭔가요?",
      "다른 사용자들과 연결하기",
      "커뮤니티 둘러보기"
    ],
    idlePrompts: [
      "새로운 친구를 만나보실래요?",
      "흥미로운 토론에 참여해보세요",
      "커뮤니티 활동이 궁금하신가요?"
    ]
  },
  
  discover: {
    initial: [
      "새로운 발견의 시간이에요! ✨",
      "어떤 예술적 경험을 해보고 싶으신가요?",
      "탐험할 준비가 되셨나요?"
    ],
    suggestions: [
      "새로운 작품 탐색하기",
      "추천 받기",
      "트렌드 작품 보기"
    ],
    idlePrompts: [
      "새로운 스타일을 탐험해보세요",
      "흥미로운 작가를 발견해보실래요?",
      "모험을 떠날 준비가 되셨나요?"
    ]
  },
  
  daily: {
    initial: [
      "오늘의 예술 습관을 함께 만들어봐요! 📅",
      "일상 속 예술이 어떤 변화를 가져다줄까요?",
      "매일매일 성장하는 예술 감성!"
    ],
    suggestions: [
      "오늘의 추천은?",
      "습관 만들기 도움",
      "일일 챌린지 참여하기"
    ],
    idlePrompts: [
      "오늘 어떤 예술을 만나볼까요?",
      "새로운 습관을 시작해보실래요?",
      "일상에 예술을 더해보세요"
    ]
  }
};

// 미판정 유저를 위한 특별 메시지
export const UNIDENTIFIED_USER_MESSAGES = {
  initial: [
    "안녕하세요! 저는 아직 형태가 정해지지 않은 AI 큐레이터예요 ✨",
    "당신을 알아가면서 제 모습도 함께 만들어져요",
    "함께 예술 여행을 떠나며 서로를 발견해봐요"
  ],
  
  prompts: [
    "제 진짜 모습이 궁금하신가요? 성격 테스트를 해보세요!",
    "당신의 예술 성향을 알면 저도 완전한 모습이 될 거예요",
    "어떤 동물이 될지 저도 궁금해요!"
  ],
  
  hints: [
    "💭 아직은 구름 같은 존재...",
    "🌟 당신의 선택이 저를 만들어가요",
    "🎭 16가지 모습 중 하나로 변신할 거예요"
  ]
};

// 시간별 노출 전략
export const EXPOSURE_STRATEGY = {
  phases: [
    {
      name: 'subtle',
      startTime: 0,
      endTime: 5000, // 5초
      actions: ['show_button', 'gentle_pulse']
    },
    {
      name: 'notice',
      startTime: 5000,
      endTime: 15000, // 15초
      actions: ['bounce_animation', 'small_bubble']
    },
    {
      name: 'engage',
      startTime: 15000,
      endTime: 30000, // 30초
      actions: ['wave_animation', 'greeting_bubble']
    },
    {
      name: 'active',
      startTime: 30000,
      endTime: null,
      actions: ['persistent_hint', 'contextual_help']
    }
  ]
};

// 페이지 타입 감지
export function detectPageType(pathname: string): PageContext {
  if (pathname === '/' || pathname === '/home') {
    return { type: 'home' };
  } else if (pathname.includes('/quiz')) {
    return { type: 'quiz' };
  } else if (pathname.includes('/gallery') || pathname.includes('/artworks')) {
    return { type: 'gallery' };
  } else if (pathname.includes('/artwork/')) {
    return { type: 'artwork' };
  } else if (pathname.includes('/profile')) {
    return { type: 'profile' };
  } else if (pathname.includes('/exhibition')) {
    return { type: 'exhibition' };
  } else if (pathname.includes('/results')) {
    return { type: 'results' };
  } else if (pathname.includes('/community')) {
    return { type: 'community' };
  } else if (pathname.includes('/discover')) {
    return { type: 'discover' };
  } else if (pathname.includes('/daily')) {
    return { type: 'daily' };
  }
  
  return { type: 'unknown' };
}

// 컨텍스트 기반 메시지 선택
export function getContextualMessage(
  context: PageContext,
  messageType: 'initial' | 'suggestions' | 'idlePrompts',
  index = 0
): string {
  const pageMessages = PAGE_GREETINGS[context.type] || PAGE_GREETINGS.home;
  const messages = pageMessages[messageType];
  const message = messages[index % messages.length];
  
  // 메타데이터로 템플릿 치환
  if (context.metadata) {
    return message
      .replace('{artworkTitle}', context.metadata.artworkTitle || '')
      .replace('{artistName}', context.metadata.artistName || '')
      .replace('{exhibitionName}', context.metadata.exhibitionName || '')
      .replace('{personalityType}', context.metadata.personalityType || '');
  }
  
  return message;
}