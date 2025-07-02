// 🎨 SAYU Companion Evaluation System Types
// 전시 관람 후 동반자 상호 평가 시스템

export interface CompanionEvaluation {
  id: string;
  exhibitionVisitId: string;
  evaluatorId: string;
  evaluatorType: string;
  evaluatedId: string;
  evaluatedType: string;
  
  // 평가 항목들
  ratings: {
    // 전시 감상 태도
    exhibitionEngagement: number; // 1-5: 전시에 얼마나 집중했는지
    exhibitionEngagement_comment?: string;
    
    // 소통과 공유
    communication: number; // 1-5: 의견 공유와 대화의 질
    communication_comment?: string;
    
    // 페이스 맞추기
    paceMatching: number; // 1-5: 서로의 관람 속도 배려
    paceMatching_comment?: string;
    
    // 새로운 시각 제공
    newPerspectives: number; // 1-5: 새로운 관점이나 인사이트 제공
    newPerspectives_comment?: string;
    
    // 전반적 만족도
    overallSatisfaction: number; // 1-5: 함께한 전시 경험 만족도
    overallSatisfaction_comment?: string;
  };
  
  // 추가 피드백
  highlights?: string; // 좋았던 점
  highlights_ko?: string;
  improvements?: string; // 개선할 점
  improvements_ko?: string;
  
  // 다시 함께 가고 싶은지
  wouldGoAgain: boolean;
  
  // 익명 평가 여부
  isAnonymous: boolean;
  
  // 평가 완료 시간
  createdAt: Date;
}

export interface EvaluationSummary {
  userId: string;
  personalityType: string;
  
  // 평균 평점들
  averageRatings: {
    exhibitionEngagement: number;
    communication: number;
    paceMatching: number;
    newPerspectives: number;
    overallSatisfaction: number;
  };
  
  // 총 평가 수
  totalEvaluations: number;
  
  // 함께 가고 싶다고 한 비율
  wouldGoAgainPercentage: number;
  
  // 유형별 궁합 통계
  chemistryStats: {
    [personalityType: string]: {
      count: number;
      averageRating: number;
      wouldGoAgainCount: number;
    };
  };
  
  // 받은 하이라이트들
  receivedHighlights: string[];
  
  // 개선 제안들
  receivedImprovements: string[];
  
  // 배지나 타이틀
  earnedTitles: CompanionTitle[];
}

export interface CompanionTitle {
  id: string;
  name: string;
  name_ko: string;
  description: string;
  description_ko: string;
  icon: string;
  requirement: string; // 획득 조건
  earnedAt: Date;
}

// 평가 기반 포인트 보정
export interface EvaluationPointModifier {
  basePoints: number;
  
  // 평가 점수에 따른 배율 (0.5x ~ 2.0x)
  ratingMultiplier: number;
  
  // 상호 평가 완료 보너스
  mutualEvaluationBonus: number;
  
  // 상세 피드백 작성 보너스
  detailedFeedbackBonus: number;
  
  // 최종 포인트
  finalPoints: number;
  
  // 계산 내역
  breakdown: {
    reason: string;
    points: number;
  }[];
}