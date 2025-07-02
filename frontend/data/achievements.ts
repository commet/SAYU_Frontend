// 🎨 SAYU Achievement System
// 예술 여정의 특별한 순간들을 기념하는 업적 시스템

import { Achievement } from '@/types/gamification';

export const achievements: Achievement[] = [
  // Exploration Achievements
  {
    id: 'first_steps',
    name: 'First Steps',
    name_ko: '첫 발걸음',
    description: 'Complete your first art personality quiz',
    description_ko: '첫 예술 성격 퀴즈 완료',
    icon: '👶',
    points: 50,
    category: 'exploration'
  },
  {
    id: 'self_discovery',
    name: 'Self Discovery',
    name_ko: '자아 발견',
    description: 'Explore all aspects of your personality type',
    description_ko: '내 성격 유형의 모든 면 탐구',
    icon: '🔍',
    points: 100,
    category: 'exploration'
  },
  {
    id: 'exhibition_explorer',
    name: 'Exhibition Explorer',
    name_ko: '전시 탐험가',
    description: 'Visit 5 different exhibitions',
    description_ko: '5개의 다른 전시 방문',
    icon: '🖼️',
    points: 150,
    category: 'exploration'
  },
  {
    id: 'art_marathon',
    name: 'Art Marathon',
    name_ko: '예술 마라톤',
    description: 'Visit 3 exhibitions in one week',
    description_ko: '일주일에 3개 전시 방문',
    icon: '🏃',
    points: 200,
    category: 'exploration'
  },
  
  // Social Achievements
  {
    id: 'chemistry_checker',
    name: 'Chemistry Checker',
    name_ko: '궁합 확인자',
    description: 'Check compatibility with 10 different types',
    description_ko: '10개의 다른 유형과 궁합 확인',
    icon: '💕',
    points: 100,
    category: 'social'
  },
  {
    id: 'perfect_match',
    name: 'Perfect Match',
    name_ko: '완벽한 매치',
    description: 'Find a platinum level compatibility',
    description_ko: '플래티넘 레벨 궁합 발견',
    icon: '💎',
    points: 150,
    category: 'social'
  },
  {
    id: 'social_butterfly',
    name: 'Social Butterfly',
    name_ko: '사교적 나비',
    description: 'Visit exhibitions with 5 different personality types',
    description_ko: '5개의 다른 성격 유형과 전시 방문',
    icon: '🦋',
    points: 200,
    category: 'social'
  },
  {
    id: 'art_companion',
    name: 'Art Companion',
    name_ko: '예술 동반자',
    description: 'Visit 10 exhibitions with companions',
    description_ko: '동반자와 10개 전시 방문',
    icon: '👥',
    points: 250,
    category: 'social'
  },
  
  // Knowledge Achievements
  {
    id: 'personality_scholar',
    name: 'Personality Scholar',
    name_ko: '성격 학자',
    description: 'Read about all 16 personality types',
    description_ko: '16가지 성격 유형 모두 읽기',
    icon: '📚',
    points: 150,
    category: 'knowledge'
  },
  {
    id: 'review_writer',
    name: 'Review Writer',
    name_ko: '리뷰 작가',
    description: 'Write 5 exhibition reviews',
    description_ko: '5개의 전시 리뷰 작성',
    icon: '✍️',
    points: 100,
    category: 'knowledge'
  },
  {
    id: 'insight_provider',
    name: 'Insight Provider',
    name_ko: '인사이트 제공자',
    description: 'Write 10 detailed exhibition reviews',
    description_ko: '10개의 상세한 전시 리뷰 작성',
    icon: '💡',
    points: 200,
    category: 'knowledge'
  },
  
  // Special Achievements
  {
    id: 'early_adopter',
    name: 'Early Adopter',
    name_ko: '얼리 어답터',
    description: 'Join SAYU in its first year',
    description_ko: 'SAYU 첫 해에 가입',
    icon: '🌟',
    points: 300,
    category: 'special'
  },
  {
    id: 'streak_master',
    name: 'Streak Master',
    name_ko: '연속 마스터',
    description: 'Log in for 30 consecutive days',
    description_ko: '30일 연속 로그인',
    icon: '🔥',
    points: 250,
    category: 'special'
  },
  {
    id: 'anniversary',
    name: 'Anniversary',
    name_ko: '기념일',
    description: 'Be a member for one year',
    description_ko: '1년 회원 유지',
    icon: '🎂',
    points: 500,
    category: 'special'
  },
  {
    id: 'influencer',
    name: 'Art Influencer',
    name_ko: '예술 인플루언서',
    description: 'Invite 10 friends to SAYU',
    description_ko: '10명의 친구를 SAYU에 초대',
    icon: '📢',
    points: 400,
    category: 'special'
  }
];

export function getAchievementById(id: string): Achievement | undefined {
  return achievements.find(achievement => achievement.id === id);
}

export function getAchievementsByCategory(category: Achievement['category']): Achievement[] {
  return achievements.filter(achievement => achievement.category === category);
}

export function calculateTotalPossiblePoints(): number {
  return achievements.reduce((total, achievement) => total + achievement.points, 0);
}