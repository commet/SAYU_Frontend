// 🎨 SAYU Companion Titles
// 동반자 평가를 통해 획득하는 타이틀 시스템

import { CompanionTitle } from '@/types/companion-evaluation';

export const companionTitles: Omit<CompanionTitle, 'earnedAt'>[] = [
  // 긍정적 타이틀
  {
    id: 'insight_provider',
    name: 'Insight Provider',
    name_ko: '인사이트 제공자',
    description: 'Consistently provides new perspectives on art',
    description_ko: '지속적으로 예술에 대한 새로운 관점을 제공',
    icon: '💡',
    requirement: 'Average newPerspectives rating > 4.5 (min 10 evaluations)'
  },
  {
    id: 'perfect_pace',
    name: 'Perfect Pace Partner',
    name_ko: '완벽한 페이스 파트너',
    description: 'Excellent at matching exhibition viewing pace',
    description_ko: '전시 관람 속도를 완벽하게 맞춤',
    icon: '🚶',
    requirement: 'Average paceMatching rating > 4.5 (min 10 evaluations)'
  },
  {
    id: 'art_communicator',
    name: 'Art Communicator',
    name_ko: '예술 소통가',
    description: 'Master of art-related conversations',
    description_ko: '예술 관련 대화의 달인',
    icon: '💬',
    requirement: 'Average communication rating > 4.5 (min 10 evaluations)'
  },
  {
    id: 'focused_observer',
    name: 'Focused Observer',
    name_ko: '집중하는 관찰자',
    description: 'Deeply engages with exhibitions',
    description_ko: '전시에 깊이 몰입하는 사람',
    icon: '🔍',
    requirement: 'Average exhibitionEngagement rating > 4.5 (min 10 evaluations)'
  },
  {
    id: 'ideal_companion',
    name: 'Ideal Art Companion',
    name_ko: '이상적인 예술 동반자',
    description: 'Highly sought after exhibition partner',
    description_ko: '함께 가고 싶은 전시 파트너',
    icon: '⭐',
    requirement: 'wouldGoAgain percentage > 90% (min 20 evaluations)'
  },
  {
    id: 'chemistry_master',
    name: 'Chemistry Master',
    name_ko: '케미 마스터',
    description: 'Creates great synergy with all personality types',
    description_ko: '모든 성격 유형과 좋은 시너지 창출',
    icon: '🤝',
    requirement: 'Average rating > 4.0 with at least 8 different personality types'
  },
  
  // 성장 관련 타이틀
  {
    id: 'rising_star',
    name: 'Rising Star',
    name_ko: '떠오르는 별',
    description: 'Showing consistent improvement in companion ratings',
    description_ko: '동반자 평가가 지속적으로 향상 중',
    icon: '📈',
    requirement: 'Rating improvement of 1+ point over last 10 evaluations'
  },
  {
    id: 'feedback_embracer',
    name: 'Feedback Embracer',
    name_ko: '피드백 수용자',
    description: 'Actively improves based on companion feedback',
    description_ko: '동반자 피드백을 적극적으로 수용하여 개선',
    icon: '🌱',
    requirement: 'Addressed 5+ improvement suggestions successfully'
  },
  
  // 특별 타이틀
  {
    id: 'platinum_magnet',
    name: 'Platinum Magnet',
    name_ko: '플래티넘 자석',
    description: 'Exceptional experiences with platinum compatibility partners',
    description_ko: '플래티넘 궁합 파트너와의 특별한 경험',
    icon: '💎',
    requirement: 'Average rating > 4.8 with platinum compatibility partners (min 5)'
  },
  {
    id: 'exhibition_marathon',
    name: 'Exhibition Marathon Champion',
    name_ko: '전시 마라톤 챔피언',
    description: 'Successfully visited 5+ exhibitions in one day with companions',
    description_ko: '하루에 5개 이상 전시를 동반자와 성공적으로 관람',
    icon: '🏃‍♂️',
    requirement: 'Visit 5+ exhibitions in one day with average rating > 4.0'
  },
  {
    id: 'culture_ambassador',
    name: 'Culture Ambassador',
    name_ko: '문화 대사',
    description: 'Introduced many people to their first art exhibition',
    description_ko: '많은 사람들에게 첫 예술 전시 경험 제공',
    icon: '🎭',
    requirement: 'Accompanied 10+ people to their first exhibition'
  },
  {
    id: 'diverse_explorer',
    name: 'Diverse Explorer',
    name_ko: '다양성 탐험가',
    description: 'Visited diverse exhibition genres with various companions',
    description_ko: '다양한 동반자와 다양한 장르의 전시 관람',
    icon: '🌈',
    requirement: 'Visit 10+ different exhibition types with 10+ different companions'
  }
];

export function getTitleById(id: string): typeof companionTitles[0] | undefined {
  return companionTitles.find(title => title.id === id);
}

export function checkTitleRequirements(
  summary: any, // EvaluationSummary
  titleId: string
): boolean {
  const title = getTitleById(titleId);
  if (!title) return false;
  
  // 각 타이틀별 요구사항 체크 로직
  switch (titleId) {
    case 'insight_provider':
      return summary.totalEvaluations >= 10 && 
             summary.averageRatings.newPerspectives > 4.5;
    
    case 'perfect_pace':
      return summary.totalEvaluations >= 10 && 
             summary.averageRatings.paceMatching > 4.5;
    
    case 'art_communicator':
      return summary.totalEvaluations >= 10 && 
             summary.averageRatings.communication > 4.5;
    
    case 'focused_observer':
      return summary.totalEvaluations >= 10 && 
             summary.averageRatings.exhibitionEngagement > 4.5;
    
    case 'ideal_companion':
      return summary.totalEvaluations >= 20 && 
             summary.wouldGoAgainPercentage > 90;
    
    case 'chemistry_master':
      const typesWithGoodRating = Object.values(summary.chemistryStats)
        .filter((stat: any) => stat.count >= 1 && (stat.averageRating / stat.count) > 4)
        .length;
      return typesWithGoodRating >= 8;
    
    // ... 다른 타이틀들도 구현
    
    default:
      return false;
  }
}