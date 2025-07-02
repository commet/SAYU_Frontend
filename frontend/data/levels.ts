// 🎨 SAYU Level System
// 예술 감상 여정의 단계별 성장 시스템

import { LevelSystem } from '@/types/gamification';

export const levels: LevelSystem[] = [
  {
    level: 1,
    name: 'Art Curious',
    name_ko: '예술 입문자',
    minPoints: 0,
    maxPoints: 99,
    perks: [
      'Access to basic personality insights',
      'Compatibility checking feature'
    ],
    perks_ko: [
      '기본 성격 인사이트 이용',
      '궁합 확인 기능'
    ]
  },
  {
    level: 2,
    name: 'Gallery Explorer',
    name_ko: '갤러리 탐험가',
    minPoints: 100,
    maxPoints: 299,
    perks: [
      'Detailed compatibility analysis',
      'Exhibition recommendations',
      'Profile badge: Explorer'
    ],
    perks_ko: [
      '상세 궁합 분석',
      '전시 추천',
      '프로필 뱃지: 탐험가'
    ]
  },
  {
    level: 3,
    name: 'Art Enthusiast',
    name_ko: '예술 애호가',
    minPoints: 300,
    maxPoints: 599,
    perks: [
      'Exclusive exhibition insights',
      'Advanced personality comparisons',
      'Profile badge: Enthusiast'
    ],
    perks_ko: [
      '독점 전시 인사이트',
      '고급 성격 비교 분석',
      '프로필 뱃지: 애호가'
    ]
  },
  {
    level: 4,
    name: 'Culture Connoisseur',
    name_ko: '문화 감식가',
    minPoints: 600,
    maxPoints: 999,
    perks: [
      'Curator-level insights',
      'Exhibition history analytics',
      'Profile badge: Connoisseur',
      'Early access to new features'
    ],
    perks_ko: [
      '큐레이터급 인사이트',
      '전시 이력 분석',
      '프로필 뱃지: 감식가',
      '신규 기능 우선 체험'
    ]
  },
  {
    level: 5,
    name: 'Art Maestro',
    name_ko: '예술 마에스트로',
    minPoints: 1000,
    maxPoints: 1999,
    perks: [
      'Complete platform mastery',
      'Influence exhibition recommendations',
      'Profile badge: Maestro',
      'Community leader status'
    ],
    perks_ko: [
      '플랫폼 완전 마스터',
      '전시 추천 영향력',
      '프로필 뱃지: 마에스트로',
      '커뮤니티 리더 지위'
    ]
  },
  {
    level: 6,
    name: 'Legendary Aesthete',
    name_ko: '전설의 미학자',
    minPoints: 2000,
    maxPoints: 999999,
    perks: [
      'Legendary status achieved',
      'Custom profile themes',
      'Profile badge: Legend',
      'Exclusive curator consultations',
      'Beta feature access'
    ],
    perks_ko: [
      '전설적 지위 달성',
      '커스텀 프로필 테마',
      '프로필 뱃지: 전설',
      '독점 큐레이터 상담',
      '베타 기능 이용권'
    ]
  }
];

export function getLevelByPoints(points: number): LevelSystem {
  return levels.find(level => 
    points >= level.minPoints && points <= level.maxPoints
  ) || levels[0];
}

export function getNextLevel(currentLevel: number): LevelSystem | null {
  return levels.find(level => level.level === currentLevel + 1) || null;
}

export function calculateProgress(points: number): {
  currentLevel: LevelSystem;
  nextLevel: LevelSystem | null;
  progress: number;
  pointsToNext: number;
} {
  const currentLevel = getLevelByPoints(points);
  const nextLevel = getNextLevel(currentLevel.level);
  
  const levelPoints = points - currentLevel.minPoints;
  const levelRange = currentLevel.maxPoints - currentLevel.minPoints + 1;
  const progress = Math.min(100, (levelPoints / levelRange) * 100);
  const pointsToNext = nextLevel ? nextLevel.minPoints - points : 0;
  
  return {
    currentLevel,
    nextLevel,
    progress,
    pointsToNext
  };
}