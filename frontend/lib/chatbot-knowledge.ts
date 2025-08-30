// SAYU 플랫폼 Knowledge Base
// 챗봇이 참조할 실제 앱 정보

export const SAYUKnowledge = {
  // 플랫폼 기본 정보
  platform: {
    name: 'SAYU',
    description: '예술 MBTI(APT) 기반 맞춤형 예술 큐레이션 플랫폼',
    mainFeatures: [
      'APT(Art Personality Type) 테스트',
      '맞춤형 작품 추천',
      '전시 정보 및 예약',
      '예술 커뮤니티',
      'AI 큐레이터 챗봇'
    ]
  },

  // APT 테스트 정보
  quiz: {
    totalQuestions: 15,
    estimatedTime: '5-7분',
    structure: {
      act1: {
        name: 'Curiosity - 입구 홀',
        questions: [1, 2, 3, 4, 5],
        theme: '미술관 입장, 첫인상과 탐색 방식'
      },
      act2: {
        name: 'Exploration - 메인 갤러리',
        questions: [6, 7, 8, 9],
        theme: '작품 감상 스타일과 선호도'
      },
      act3: {
        name: 'Shop & Cafe',
        questions: [10, 11],
        theme: '아트샵과 카페에서의 행동'
      },
      act4: {
        name: 'Daily Life - 일상',
        questions: [12, 13, 14, 15],
        theme: '일상 속 예술적 선택과 취향'
      }
    },
    resultTypes: {
      totalTypes: 16,
      axes: [
        { code: 'L/S', meaning: 'Lone(혼자)/Social(함께)' },
        { code: 'A/R', meaning: 'Abstract(추상)/Representational(구상)' },
        { code: 'E/M', meaning: 'Emotional(감성)/Meaning(의미)' },
        { code: 'F/C', meaning: 'Flow(흐름)/Constructive(구조)' }
      ]
    },
    navigation: {
      backButton: '이전 질문으로 돌아갈 수 있음',
      progressBar: '상단에 진행률 표시',
      exitOption: '언제든 나가기 가능 (진행사항 저장 안됨)'
    }
  },

  // 16가지 APT 유형
  aptTypes: {
    'LAEF': { animal: '여우', trait: '몽환적이고 시적인' },
    'LAEC': { animal: '고양이', trait: '우아하고 선택적인' },
    'LAMF': { animal: '올빼미', trait: '직관적이고 통찰력 있는' },
    'LAMC': { animal: '거북이', trait: '차분하고 학구적인' },
    'LREF': { animal: '카멜레온', trait: '섬세하고 관찰적인' },
    'LREC': { animal: '고슴도치', trait: '조심스럽고 정확한' },
    'LRMF': { animal: '문어', trait: '혁신적이고 실험적인' },
    'LRMC': { animal: '비버', trait: '체계적이고 건설적인' },
    'SAEF': { animal: '나비', trait: '밝고 활기찬' },
    'SAEC': { animal: '펭귄', trait: '사교적이고 품격있는' },
    'SAMF': { animal: '앵무새', trait: '표현적이고 소통적인' },
    'SAMC': { animal: '사슴', trait: '우아하고 조직적인' },
    'SREF': { animal: '강아지', trait: '친근하고 열정적인' },
    'SREC': { animal: '오리', trait: '따뜻하고 안내적인' },
    'SRMF': { animal: '코끼리', trait: '지혜롭고 교육적인' },
    'SRMC': { animal: '독수리', trait: '전문적이고 체계적인' }
  },

  // 페이지별 기능
  pages: {
    home: {
      path: '/',
      features: ['서비스 소개', 'APT 테스트 시작', '주요 기능 안내'],
      chatbotRole: 'SAYU 서비스 소개와 안내'
    },
    quiz: {
      path: '/quiz',
      features: ['테스트 방식 선택', '클래식/내러티브 모드'],
      chatbotRole: 'APT 테스트 안내와 설명'
    },
    'quiz/narrative': {
      path: '/quiz/narrative',
      features: ['15개 질문', '오디오 가이드 형식', '미술관 여정 시뮬레이션'],
      chatbotRole: '테스트 진행 도움과 질문 설명'
    },
    results: {
      path: '/results',
      features: ['APT 유형 결과', '동물 캐릭터', '예술 취향 분석', '맞춤 추천'],
      chatbotRole: 'APT 유형 해석과 상세 설명'
    },
    exhibitions: {
      path: '/exhibitions',
      features: ['실시간 전시 정보', '지역별 필터', '예약 기능', '교통 안내'],
      chatbotRole: '전시 추천과 예약 도움'
    },
    gallery: {
      path: '/gallery',
      features: ['작품 컬렉션', '맞춤 큐레이션', '작품 저장', '감상 기록'],
      chatbotRole: '작품 해설과 감상 가이드'
    },
    profile: {
      path: '/profile',
      features: ['개인 APT 프로필', '활동 기록', '성장 추적', '배지 시스템'],
      chatbotRole: '개인 예술 여정 코칭'
    },
    community: {
      path: '/community',
      features: ['동행자 매칭', '리뷰 공유', '예술 토론', '이벤트'],
      chatbotRole: '커뮤니티 활동 지원'
    }
  },

  // 자주 묻는 질문과 답변
  faq: {
    'APT가 뭔가요?': 'Art Personality Type의 약자로, MBTI처럼 16가지 예술 성격 유형을 분류하는 SAYU만의 시스템입니다.',
    '테스트는 얼마나 걸리나요?': '총 15개 질문으로 5-7분 정도 소요됩니다.',
    '테스트를 다시 할 수 있나요?': '네, 언제든지 프로필 페이지에서 재테스트가 가능합니다.',
    '결과를 공유할 수 있나요?': '네, 결과 페이지에서 SNS 공유 기능을 제공합니다.',
    '전시 예약은 어떻게 하나요?': '전시 페이지에서 원하는 전시를 선택하고 예약 버튼을 누르면 됩니다.',
    '회원가입이 필요한가요?': 'APT 테스트는 비회원도 가능하지만, 결과 저장과 맞춤 추천을 위해서는 가입을 권장합니다.',
    '작품 저장은 어떻게 하나요?': '갤러리에서 마음에 드는 작품의 하트 버튼을 누르면 프로필에 저장됩니다.',
    '동행자 매칭이 뭔가요?': '같은 전시를 함께 관람할 사람을 APT 유형 기반으로 매칭해주는 기능입니다.'
  },

  // 현재 이벤트/프로모션
  currentEvents: {
    onboarding: '신규 가입시 APT 배지 증정',
    exhibition: '이달의 추천 전시 할인 쿠폰',
    community: '리뷰 3개 작성시 프리미엄 1개월 무료'
  },

  // 기술적 정보
  technical: {
    supportedDevices: ['데스크톱', '태블릿', '모바일'],
    browsers: ['Chrome', 'Safari', 'Firefox', 'Edge'],
    languages: ['한국어', '영어'],
    darkMode: '지원',
    offlineMode: '일부 기능 지원 (PWA)'
  }
}

// 페이지별 컨텍스트 정보 가져오기
export function getPageKnowledge(page: string) {
  const pageData = SAYUKnowledge.pages[page as keyof typeof SAYUKnowledge.pages]
  const quizData = page.includes('quiz') ? SAYUKnowledge.quiz : null
  
  return {
    pageInfo: pageData,
    quizInfo: quizData,
    platform: SAYUKnowledge.platform,
    aptTypes: SAYUKnowledge.aptTypes,
    faq: SAYUKnowledge.faq
  }
}

// 특정 APT 유형 정보 가져오기
export function getAPTTypeInfo(type: string) {
  return SAYUKnowledge.aptTypes[type as keyof typeof SAYUKnowledge.aptTypes] || null
}

// 퀴즈 진행 상황 정보
export function getQuizProgressInfo(currentQuestion: number) {
  const totalQuestions = SAYUKnowledge.quiz.totalQuestions
  const progress = Math.round((currentQuestion / totalQuestions) * 100)
  const remainingQuestions = totalQuestions - currentQuestion
  const estimatedTimeLeft = Math.ceil((remainingQuestions / totalQuestions) * 7) // 최대 7분 기준
  
  // 현재 Act 찾기
  let currentAct = ''
  Object.entries(SAYUKnowledge.quiz.structure).forEach(([act, data]) => {
    if (data.questions.includes(currentQuestion)) {
      currentAct = data.name
    }
  })
  
  return {
    currentQuestion,
    totalQuestions,
    progress,
    remainingQuestions,
    estimatedTimeLeft,
    currentAct
  }
}