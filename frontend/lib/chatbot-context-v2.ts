// 고급 챗봇 컨텍스트 시스템 V2
'use client';

interface UserBehaviorData {
  pageVisitCount: number;
  timeOnPage: number;
  scrollDepth: number;
  clickedElements: string[];
  recentArtworks: any[];
  lastActivity: number;
  engagementLevel: 'new' | 'casual' | 'engaged' | 'power';
  currentMood: 'exploring' | 'focused' | 'overwhelmed' | 'excited';
}

export interface PageContextV2 {
  page: string;
  section?: string;
  currentArtwork?: any;
  currentExhibition?: any;
  userBehavior: UserBehaviorData;
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

export class AdvancedContextTracker {
  private static instance: AdvancedContextTracker;
  private behaviorData: UserBehaviorData;
  private sessionStartTime: number;
  private currentPage: string = '';
  private interactionHistory: any[] = [];

  constructor() {
    this.sessionStartTime = Date.now();
    this.behaviorData = {
      pageVisitCount: 0,
      timeOnPage: 0,
      scrollDepth: 0,
      clickedElements: [],
      recentArtworks: [],
      lastActivity: Date.now(),
      engagementLevel: 'new',
      currentMood: 'exploring'
    };
    this.initializeTracking();
  }

  static getInstance(): AdvancedContextTracker {
    if (!AdvancedContextTracker.instance) {
      AdvancedContextTracker.instance = new AdvancedContextTracker();
    }
    return AdvancedContextTracker.instance;
  }

  private initializeTracking() {
    // 스크롤 깊이 추적
    if (typeof window !== 'undefined') {
      let maxScroll = 0;
      window.addEventListener('scroll', () => {
        const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        maxScroll = Math.max(maxScroll, scrolled);
        this.behaviorData.scrollDepth = Math.min(100, maxScroll);
        this.updateActivity();
      });

      // 클릭 추적
      document.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const elementInfo = {
          tag: target.tagName,
          className: target.className,
          id: target.id,
          timestamp: Date.now()
        };
        this.behaviorData.clickedElements.push(`${elementInfo.tag}.${elementInfo.className}`);
        this.updateActivity();
      });

      // 페이지 가시성 변경 추적
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          this.updateActivity();
        }
      });
    }
  }

  updatePageContext(pathname: string, additionalData?: any) {
    this.currentPage = pathname;
    this.behaviorData.pageVisitCount++;
    this.behaviorData.timeOnPage = Date.now() - this.sessionStartTime;
    
    // 현재 작품 정보 업데이트
    if (additionalData?.artwork) {
      this.behaviorData.recentArtworks.unshift(additionalData.artwork);
      if (this.behaviorData.recentArtworks.length > 10) {
        this.behaviorData.recentArtworks = this.behaviorData.recentArtworks.slice(0, 10);
      }
    }

    this.updateEngagementLevel();
    this.updateCurrentMood();
  }

  private updateActivity() {
    this.behaviorData.lastActivity = Date.now();
  }

  private updateEngagementLevel() {
    const { pageVisitCount, timeOnPage, clickedElements } = this.behaviorData;
    const totalInteractions = clickedElements.length;
    const avgTimePerPage = timeOnPage / Math.max(pageVisitCount, 1);

    if (pageVisitCount >= 10 && totalInteractions >= 20) {
      this.behaviorData.engagementLevel = 'power';
    } else if (pageVisitCount >= 5 && avgTimePerPage > 60000) {
      this.behaviorData.engagementLevel = 'engaged';
    } else if (pageVisitCount >= 2) {
      this.behaviorData.engagementLevel = 'casual';
    } else {
      this.behaviorData.engagementLevel = 'new';
    }
  }

  private updateCurrentMood() {
    const { scrollDepth, timeOnPage, clickedElements } = this.behaviorData;
    const recentClickCount = clickedElements.filter(click => 
      Date.now() - this.behaviorData.lastActivity < 30000
    ).length;

    if (recentClickCount > 5 && timeOnPage < 60000) {
      this.behaviorData.currentMood = 'overwhelmed';
    } else if (scrollDepth > 80 && recentClickCount > 3) {
      this.behaviorData.currentMood = 'excited';
    } else if (scrollDepth > 50 && timeOnPage > 120000) {
      this.behaviorData.currentMood = 'focused';
    } else {
      this.behaviorData.currentMood = 'exploring';
    }
  }

  getCurrentContext(): PageContextV2 {
    const now = new Date();
    const hour = now.getHours();
    let timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night' = 'morning';
    
    if (hour >= 6 && hour < 12) timeOfDay = 'morning';
    else if (hour >= 12 && hour < 18) timeOfDay = 'afternoon';
    else if (hour >= 18 && hour < 22) timeOfDay = 'evening';
    else timeOfDay = 'night';

    const dayOfWeek = [0, 6].includes(now.getDay()) ? 'weekend' : 'weekday';
    const deviceType = typeof window !== 'undefined' && window.innerWidth <= 768 ? 'mobile' : 'desktop';

    return {
      page: this.currentPage,
      userBehavior: { ...this.behaviorData },
      sessionContext: {
        visitedPages: [this.currentPage], // 간소화
        totalTime: this.behaviorData.timeOnPage,
        actionsCount: this.behaviorData.clickedElements.length,
        preferences: this.extractPreferences()
      },
      realTimeContext: {
        timeOfDay,
        dayOfWeek,
        deviceType
      }
    };
  }

  private extractPreferences(): string[] {
    const preferences: string[] = [];
    const { recentArtworks, clickedElements } = this.behaviorData;
    
    // 최근 본 작품에서 선호도 추출
    if (recentArtworks.length > 0) {
      const styles = recentArtworks.map(a => a.style || a.medium).filter(Boolean);
      const uniqueStyles = [...new Set(styles)];
      preferences.push(...uniqueStyles.slice(0, 3));
    }
    
    // 클릭 패턴에서 선호도 추출
    const galleryClicks = clickedElements.filter(el => el.includes('gallery')).length;
    const exhibitionClicks = clickedElements.filter(el => el.includes('exhibition')).length;
    
    if (galleryClicks > exhibitionClicks) {
      preferences.push('gallery_focus');
    } else if (exhibitionClicks > galleryClicks) {
      preferences.push('exhibition_focus');
    }

    return preferences;
  }

  // 챗봇을 위한 상황 설명 텍스트 생성
  getContextualDescription(): string {
    const context = this.getCurrentContext();
    const { userBehavior, realTimeContext } = context;
    
    const descriptions: string[] = [];
    
    // 시간대별 맞춤 설명
    const timeContexts = {
      morning: "아침 시간대에 차분하게 예술을 감상하고 있는",
      afternoon: "오후에 여유롭게 작품을 탐색하고 있는",
      evening: "저녁 시간에 하루를 정리하며 예술을 만나는",
      night: "밤늦게 깊이 있는 예술 감상을 하고 있는"
    };
    descriptions.push(timeContexts[realTimeContext.timeOfDay]);
    
    // 참여도별 설명
    const engagementContexts = {
      new: "SAYU를 처음 경험하는 호기심 많은",
      casual: "가끔 예술을 즐기는 여유로운",
      engaged: "예술에 깊은 관심을 보이는 열정적인",
      power: "예술 전문가 수준의 깊이 있는"
    };
    descriptions.push(engagementContexts[userBehavior.engagementLevel]);
    
    // 현재 기분별 설명
    const moodContexts = {
      exploring: "다양한 작품을 탐색하며 새로운 발견을 원하는",
      focused: "특정 작품이나 주제에 깊이 몰입한",
      overwhelmed: "많은 정보 속에서 방향을 찾고 있는",
      excited: "예술적 영감으로 가득 찬 활기찬"
    };
    descriptions.push(moodContexts[userBehavior.currentMood]);
    
    return descriptions.join(' ');
  }

  // 즉시 활용 가능한 추천 액션 생성
  getActionableRecommendations(): string[] {
    const context = this.getCurrentContext();
    const { userBehavior, realTimeContext } = context;
    const recommendations: string[] = [];
    
    // 사용자 상태별 추천
    if (userBehavior.currentMood === 'overwhelmed') {
      recommendations.push("3점 이하로 엄선된 추천 작품 보기");
      recommendations.push("5분 컨텐플레이티브 워크 시작하기");
    } else if (userBehavior.currentMood === 'excited') {
      recommendations.push("비슷한 감동의 작품 더 찾기");
      recommendations.push("이 작품 SNS 공유하기");
    } else if (userBehavior.currentMood === 'focused') {
      recommendations.push("작가의 다른 작품 탐색하기");
      recommendations.push("관련 전시 정보 확인하기");
    }
    
    // 시간대별 추천
    if (realTimeContext.timeOfDay === 'evening') {
      recommendations.push("오늘의 감상 기록 작성하기");
    } else if (realTimeContext.timeOfDay === 'morning') {
      recommendations.push("오늘의 추천 작품 미리보기");
    }
    
    return recommendations.slice(0, 3); // 최대 3개
  }
}

// 전역 인스턴스 생성 (클라이언트사이드에서만)
export const contextTracker = typeof window !== 'undefined' ? AdvancedContextTracker.getInstance() : null;

// APT별 맞춤 컨텍스트 해석 (서버사이드에서도 사용 가능하도록)
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
  
  // 다른 APT 유형들도 추가...
  default: (context: PageContextV2) => ({
    approach: "균형잡힌",
    focusAreas: ["작품 정보", "감상 가이드"],
    interactionStyle: "친근하고 도움이 되는 대화",
    recommendations: ["추천 작품", "감상 팁"]
  })
};