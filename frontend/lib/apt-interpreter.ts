// APT Context Interpreter - Universal (client & server)
export interface PageContextV2 {
  page: string;
  section?: string;
  currentArtwork?: any;
  currentExhibition?: any;
  userBehavior: {
    pageVisitCount: number;
    timeOnPage: number;
    scrollDepth: number;
    clickedElements: string[];
    recentArtworks: any[];
    lastActivity: number;
    engagementLevel: 'new' | 'casual' | 'engaged' | 'power';
    currentMood: 'exploring' | 'focused' | 'overwhelmed' | 'excited';
  };
  sessionContext: {
    visitedPages: string[];
    totalTime: number;
    actionsCount: number;
    preferences: string[];
  };
  realTimeContext: {
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
    dayOfWeek: 'weekday' | 'weekend';
    deviceType: 'mobile' | 'desktop';
  };
}

export const APTContextInterpreter = {
  LAEF: (context: PageContextV2) => ({
    approach: "감성적이고 직관적인",
    focusAreas: ["색채", "분위기", "감정적 공명"],
    interactionStyle: "부드럽고 시적인 대화",
    recommendations: context.userBehavior.currentMood === 'focused' 
      ? ["이 느낌과 비슷한 작품들", "색채 중심 감상 가이드"]
      : ["마음을 편안하게 하는 작품들", "즉흥적 감상 여행"]
  }),
  
  SAEF: (context: PageContextV2) => ({
    approach: "활발하고 공유 중심의",
    focusAreas: ["트렌드", "인기작", "소통"],
    interactionStyle: "친근하고 활기찬 대화",
    recommendations: context.userBehavior.currentMood === 'excited'
      ? ["지금 핫한 작품들", "친구들과 함께 볼 전시"]
      : ["재미있는 아트 스토리", "소셜 미디어용 작품들"]
  }),
  
  LAMC: (context: PageContextV2) => ({
    approach: "분석적이고 체계적인",
    focusAreas: ["작품 배경", "기법 분석", "역사적 맥락"],
    interactionStyle: "정확하고 교육적인 대화",
    recommendations: context.userBehavior.engagementLevel === 'power'
      ? ["심화 연구 자료", "작가 연보 분석"]
      : ["체계적 감상 가이드", "기초 미술사 정보"]
  }),
  
  default: (context: PageContextV2) => ({
    approach: "균형잡힌",
    focusAreas: ["작품 정보", "감상 가이드"],
    interactionStyle: "친근하고 도움이 되는 대화",
    recommendations: ["추천 작품", "감상 팁"]
  })
};