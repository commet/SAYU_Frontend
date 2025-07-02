// 🎨 SAYU Points Calculator
// 포인트 계산 및 관리 시스템

import { PointActivityType } from '@/types/gamification';

// 활동별 포인트 설정
export const pointValues: Record<PointActivityType, number> = {
  quiz_completion: 50,
  first_quiz: 100,
  exhibition_visit: 30,
  exhibition_review: 50,
  compatibility_check: 10,
  profile_complete: 150,
  achievement_unlock: 0, // 업적마다 다른 포인트
  mission_complete: 0, // 미션마다 다른 포인트
  daily_login: 10,
  invite_friend: 100,
  share_result: 20
};

// 전시 방문 보너스 계산
export function calculateExhibitionBonus(
  basePoints: number,
  compatibilityLevel?: 'platinum' | 'gold' | 'silver' | 'bronze',
  withCompanion?: boolean
): number {
  let totalPoints = basePoints;
  
  // 동반자와 함께 방문 시 보너스
  if (withCompanion) {
    totalPoints += 20;
    
    // 궁합 레벨에 따른 추가 보너스
    if (compatibilityLevel) {
      const compatibilityBonus = {
        platinum: 50,
        gold: 30,
        silver: 20,
        bronze: 10
      };
      totalPoints += compatibilityBonus[compatibilityLevel];
    }
  }
  
  return totalPoints;
}

// 리뷰 작성 보너스 계산
export function calculateReviewBonus(
  basePoints: number,
  reviewLength: number,
  rating?: number
): number {
  let totalPoints = basePoints;
  
  // 리뷰 길이에 따른 보너스 (100자 이상)
  if (reviewLength >= 100) {
    totalPoints += 10;
  }
  if (reviewLength >= 300) {
    totalPoints += 20;
  }
  
  // 평점 제공 시 보너스
  if (rating) {
    totalPoints += 5;
  }
  
  return totalPoints;
}

// 연속 로그인 보너스 계산
export function calculateStreakBonus(streakDays: number): number {
  const bonuses = [
    { days: 7, points: 50 },
    { days: 14, points: 100 },
    { days: 30, points: 200 },
    { days: 60, points: 400 },
    { days: 100, points: 700 },
    { days: 365, points: 2000 }
  ];
  
  let totalBonus = 0;
  for (const bonus of bonuses) {
    if (streakDays >= bonus.days) {
      totalBonus = bonus.points;
    }
  }
  
  return totalBonus;
}

// 친구 초대 보너스 계산
export function calculateInviteBonus(
  basePoints: number,
  inviteCount: number
): number {
  let totalPoints = basePoints * inviteCount;
  
  // 마일스톤 보너스
  if (inviteCount >= 5) {
    totalPoints += 200;
  }
  if (inviteCount >= 10) {
    totalPoints += 500;
  }
  
  return totalPoints;
}

// 주간 활동 보너스 계산
export function calculateWeeklyActivityBonus(
  exhibitionVisits: number,
  compatibilityChecks: number,
  reviewsWritten: number
): number {
  let bonus = 0;
  
  // 균형잡힌 활동 보너스
  if (exhibitionVisits >= 2 && compatibilityChecks >= 5 && reviewsWritten >= 1) {
    bonus += 100; // 올라운더 보너스
  }
  
  // 집중 활동 보너스
  if (exhibitionVisits >= 5) {
    bonus += 150; // 전시 마니아
  }
  if (compatibilityChecks >= 15) {
    bonus += 100; // 소셜 탐험가
  }
  if (reviewsWritten >= 5) {
    bonus += 200; // 프로 리뷰어
  }
  
  return bonus;
}

// 레벨업 보상 계산
export function calculateLevelUpReward(newLevel: number): {
  points: number;
  perks: string[];
} {
  const rewards = {
    2: { points: 50, perks: ['explorer_badge'] },
    3: { points: 100, perks: ['enthusiast_badge'] },
    4: { points: 200, perks: ['connoisseur_badge', 'early_access'] },
    5: { points: 500, perks: ['maestro_badge', 'community_leader'] },
    6: { points: 1000, perks: ['legend_badge', 'custom_themes', 'beta_access'] }
  };
  
  return rewards[newLevel as keyof typeof rewards] || { points: 0, perks: [] };
}