// 🎨 SAYU Mission Templates
// 일일, 주간, 특별 미션 템플릿

import { Mission, MissionCategory } from '@/types/gamification';

export interface MissionTemplate {
  id: string;
  type: Mission['type'];
  title: string;
  title_ko: string;
  description: string;
  description_ko: string;
  points: number;
  target: number;
  category: MissionCategory;
  recurring?: boolean;
}

export const missionTemplates: MissionTemplate[] = [
  // Daily Missions
  {
    id: 'daily_login',
    type: 'daily',
    title: 'Daily Check-in',
    title_ko: '일일 체크인',
    description: 'Log in to SAYU today',
    description_ko: '오늘 SAYU에 로그인하기',
    points: 10,
    target: 1,
    category: 'personality_exploration',
    recurring: true
  },
  {
    id: 'daily_compatibility',
    type: 'daily',
    title: 'Chemistry Check',
    title_ko: '궁합 체크',
    description: 'Check compatibility with one personality type',
    description_ko: '하나의 성격 유형과 궁합 확인하기',
    points: 20,
    target: 1,
    category: 'social_interaction',
    recurring: true
  },
  {
    id: 'daily_explore',
    type: 'daily',
    title: 'Type Explorer',
    title_ko: '유형 탐험가',
    description: 'Read about a new personality type',
    description_ko: '새로운 성격 유형에 대해 읽기',
    points: 15,
    target: 1,
    category: 'personality_exploration',
    recurring: true
  },
  
  // Weekly Missions
  {
    id: 'weekly_exhibition',
    type: 'weekly',
    title: 'Exhibition Week',
    title_ko: '전시 주간',
    description: 'Visit 2 exhibitions this week',
    description_ko: '이번 주에 2개의 전시 방문하기',
    points: 100,
    target: 2,
    category: 'exhibition_visit',
    recurring: true
  },
  {
    id: 'weekly_social',
    type: 'weekly',
    title: 'Social Explorer',
    title_ko: '소셜 탐험가',
    description: 'Check compatibility with 5 different types',
    description_ko: '5개의 다른 유형과 궁합 확인하기',
    points: 80,
    target: 5,
    category: 'social_interaction',
    recurring: true
  },
  {
    id: 'weekly_review',
    type: 'weekly',
    title: 'Art Critic',
    title_ko: '예술 평론가',
    description: 'Write 2 exhibition reviews',
    description_ko: '2개의 전시 리뷰 작성하기',
    points: 120,
    target: 2,
    category: 'knowledge_sharing',
    recurring: true
  },
  {
    id: 'weekly_discovery',
    type: 'weekly',
    title: 'Discovery Journey',
    title_ko: '발견의 여정',
    description: 'Explore 7 different personality types',
    description_ko: '7개의 다른 성격 유형 탐구하기',
    points: 70,
    target: 7,
    category: 'personality_exploration',
    recurring: true
  },
  
  // Special Missions
  {
    id: 'special_platinum',
    type: 'special',
    title: 'Platinum Seeker',
    title_ko: '플래티넘 시커',
    description: 'Find your first platinum compatibility match',
    description_ko: '첫 플래티넘 궁합 매치 찾기',
    points: 200,
    target: 1,
    category: 'social_interaction',
    recurring: false
  },
  {
    id: 'special_profile',
    type: 'special',
    title: 'Profile Perfectionist',
    title_ko: '프로필 완성자',
    description: 'Complete your profile 100%',
    description_ko: '프로필 100% 완성하기',
    points: 150,
    target: 1,
    category: 'personality_exploration',
    recurring: false
  },
  {
    id: 'special_invite',
    type: 'special',
    title: 'Art Ambassador',
    title_ko: '예술 대사',
    description: 'Invite 3 friends to join SAYU',
    description_ko: '3명의 친구를 SAYU에 초대하기',
    points: 300,
    target: 3,
    category: 'social_interaction',
    recurring: false
  },
  {
    id: 'special_marathon',
    type: 'special',
    title: 'Exhibition Marathon',
    title_ko: '전시 마라톤',
    description: 'Visit 5 exhibitions with different personality types',
    description_ko: '다른 성격 유형과 5개 전시 방문하기',
    points: 400,
    target: 5,
    category: 'exhibition_visit',
    recurring: false
  }
];

export function getMissionsByType(type: Mission['type']): MissionTemplate[] {
  return missionTemplates.filter(mission => mission.type === type);
}

export function getDailyMissions(): MissionTemplate[] {
  return getMissionsByType('daily');
}

export function getWeeklyMissions(): MissionTemplate[] {
  return getMissionsByType('weekly');
}

export function getSpecialMissions(): MissionTemplate[] {
  return getMissionsByType('special');
}

// 미션 생성 함수 (실제 사용자 미션 인스턴스 생성)
export function createMissionFromTemplate(
  template: MissionTemplate,
  userId: string
): Mission {
  const now = new Date();
  let expiresAt: Date | undefined;
  
  if (template.type === 'daily') {
    expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + 1);
    expiresAt.setHours(0, 0, 0, 0);
  } else if (template.type === 'weekly') {
    expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + (7 - expiresAt.getDay()));
    expiresAt.setHours(23, 59, 59, 999);
  }
  
  return {
    id: `${userId}_${template.id}_${now.getTime()}`,
    type: template.type,
    title: template.title,
    title_ko: template.title_ko,
    description: template.description,
    description_ko: template.description_ko,
    points: template.points,
    progress: 0,
    target: template.target,
    completed: false,
    expiresAt,
    category: template.category
  };
}