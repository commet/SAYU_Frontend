// 🎨 SAYU Evaluation-based Points Calculator
// 동반자 평가에 따른 포인트 가중치 계산 시스템

import { CompanionEvaluation, EvaluationPointModifier } from '@/types/companion-evaluation';

// 평가 점수에 따른 배율 계산
export function calculateRatingMultiplier(evaluation: CompanionEvaluation): number {
  const ratings = evaluation.ratings;
  
  // 모든 평가 항목의 평균 계산
  const averageRating = (
    ratings.exhibitionEngagement +
    ratings.communication +
    ratings.paceMatching +
    ratings.newPerspectives +
    ratings.overallSatisfaction
  ) / 5;
  
  // 평균 점수에 따른 배율 (0.5x ~ 2.0x)
  if (averageRating >= 4.5) return 2.0;      // 매우 우수
  if (averageRating >= 4.0) return 1.5;      // 우수
  if (averageRating >= 3.5) return 1.2;      // 양호
  if (averageRating >= 3.0) return 1.0;      // 보통
  if (averageRating >= 2.5) return 0.8;      // 미흡
  return 0.5;                                 // 매우 미흡
}

// 상호 평가 완료 보너스
export function calculateMutualEvaluationBonus(
  bothEvaluated: boolean,
  evaluationCount: number
): number {
  if (!bothEvaluated) return 0;
  
  // 기본 보너스 20점
  let bonus = 20;
  
  // 평가 횟수에 따른 추가 보너스
  if (evaluationCount >= 10) bonus += 10;
  if (evaluationCount >= 20) bonus += 10;
  if (evaluationCount >= 50) bonus += 20;
  
  return bonus;
}

// 상세 피드백 보너스
export function calculateDetailedFeedbackBonus(evaluation: CompanionEvaluation): number {
  let bonus = 0;
  
  // 각 항목별 코멘트 작성 시 보너스
  if (evaluation.ratings.exhibitionEngagement_comment) bonus += 2;
  if (evaluation.ratings.communication_comment) bonus += 2;
  if (evaluation.ratings.paceMatching_comment) bonus += 2;
  if (evaluation.ratings.newPerspectives_comment) bonus += 2;
  if (evaluation.ratings.overallSatisfaction_comment) bonus += 2;
  
  // 하이라이트 작성 (최소 20자)
  if (evaluation.highlights && evaluation.highlights.length >= 20) bonus += 5;
  
  // 개선사항 작성 (건설적 피드백)
  if (evaluation.improvements && evaluation.improvements.length >= 20) bonus += 5;
  
  return bonus;
}

// 전시 관람 포인트 계산 (평가 반영)
export function calculateExhibitionPointsWithEvaluation(
  basePoints: number,
  evaluation?: CompanionEvaluation,
  mutualEvaluation?: boolean,
  evaluationCount: number = 0
): EvaluationPointModifier {
  const breakdown: { reason: string; points: number }[] = [
    { reason: 'Base exhibition visit', points: basePoints }
  ];
  
  let ratingMultiplier = 1.0;
  let mutualEvaluationBonus = 0;
  let detailedFeedbackBonus = 0;
  
  if (evaluation) {
    // 평가 점수에 따른 배율
    ratingMultiplier = calculateRatingMultiplier(evaluation);
    
    // 상호 평가 보너스
    mutualEvaluationBonus = calculateMutualEvaluationBonus(
      mutualEvaluation || false,
      evaluationCount
    );
    if (mutualEvaluationBonus > 0) {
      breakdown.push({
        reason: 'Mutual evaluation bonus',
        points: mutualEvaluationBonus
      });
    }
    
    // 상세 피드백 보너스
    detailedFeedbackBonus = calculateDetailedFeedbackBonus(evaluation);
    if (detailedFeedbackBonus > 0) {
      breakdown.push({
        reason: 'Detailed feedback bonus',
        points: detailedFeedbackBonus
      });
    }
  }
  
  // 최종 포인트 계산
  const modifiedBasePoints = Math.round(basePoints * ratingMultiplier);
  const finalPoints = modifiedBasePoints + mutualEvaluationBonus + detailedFeedbackBonus;
  
  breakdown.push({
    reason: `Rating multiplier (${ratingMultiplier}x)`,
    points: modifiedBasePoints - basePoints
  });
  
  return {
    basePoints,
    ratingMultiplier,
    mutualEvaluationBonus,
    detailedFeedbackBonus,
    finalPoints,
    breakdown
  };
}

// 평가자에게 주는 포인트
export function calculateEvaluatorPoints(evaluation: CompanionEvaluation): number {
  let points = 10; // 기본 평가 포인트
  
  // 상세 피드백 보너스
  const feedbackBonus = calculateDetailedFeedbackBonus(evaluation);
  points += Math.floor(feedbackBonus / 2); // 피평가자가 받는 보너스의 절반
  
  // 건설적 피드백 보너스
  if (evaluation.improvements && evaluation.improvements.length >= 50) {
    points += 5;
  }
  
  return points;
}

// 평가 품질 점수 계산 (0-100)
export function calculateEvaluationQuality(evaluation: CompanionEvaluation): number {
  let score = 0;
  
  // 모든 항목 평가 완료 (25점)
  score += 25;
  
  // 코멘트 작성 여부 (각 5점, 최대 25점)
  if (evaluation.ratings.exhibitionEngagement_comment) score += 5;
  if (evaluation.ratings.communication_comment) score += 5;
  if (evaluation.ratings.paceMatching_comment) score += 5;
  if (evaluation.ratings.newPerspectives_comment) score += 5;
  if (evaluation.ratings.overallSatisfaction_comment) score += 5;
  
  // 하이라이트 작성 (15점)
  if (evaluation.highlights && evaluation.highlights.length >= 20) {
    score += 15;
  }
  
  // 개선사항 작성 (15점)
  if (evaluation.improvements && evaluation.improvements.length >= 20) {
    score += 15;
  }
  
  // 평가의 균형성 (극단적 평가 회피) (20점)
  const ratings = [
    evaluation.ratings.exhibitionEngagement,
    evaluation.ratings.communication,
    evaluation.ratings.paceMatching,
    evaluation.ratings.newPerspectives,
    evaluation.ratings.overallSatisfaction
  ];
  
  const allSame = ratings.every(r => r === ratings[0]);
  const hasVariation = new Set(ratings).size >= 2;
  
  if (!allSame && hasVariation) {
    score += 20;
  }
  
  return Math.min(100, score);
}