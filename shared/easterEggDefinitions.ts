/**
 * SAYU Easter Egg System Definitions
 * Rewards curious and creative users with hidden features and badges
 */

export interface EasterEgg {
  id: string;
  name: string;
  nameKo: string;
  description: string;
  descriptionKo: string;
  trigger: 'action' | 'time' | 'sequence' | 'command' | 'random';
  condition: EasterEggCondition;
  reward: EasterEggReward;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  icon: string;
  discoveredCount?: number;
  firstDiscoveredBy?: string;
  hints?: string[];
}

export interface EasterEggCondition {
  type: string;
  value: any;
  checkFunction?: (context: any) => boolean;
}

export interface EasterEggReward {
  type: 'badge' | 'title' | 'feature' | 'experience';
  id: string;
  data?: any;
}

export interface Badge {
  id: string;
  name: string;
  nameKo: string;
  description: string;
  descriptionKo: string;
  icon: string;
  category: 'knowledge' | 'exploration' | 'emotion' | 'special';
  tier: 1 | 2 | 3; // Bronze, Silver, Gold
  points: number;
}

export interface UserEasterEggProgress {
  userId: string;
  discoveredEggs: string[];
  badges: string[];
  titles: string[];
  totalPoints: number;
  lastDiscoveryAt?: Date;
  statistics: {
    totalDiscoveries: number;
    commonDiscoveries: number;
    rareDiscoveries: number;
    epicDiscoveries: number;
    legendaryDiscoveries: number;
  };
}

// Action-based Easter Eggs
export const ACTION_EASTER_EGGS: EasterEgg[] = [
  {
    id: 'perfectionist',
    name: 'Perfectionist',
    nameKo: '완벽주의자',
    description: 'Retook the personality quiz 3 or more times',
    descriptionKo: '성격 퀴즈를 3번 이상 다시 응시',
    trigger: 'action',
    condition: {
      type: 'quiz_retakes',
      value: 3
    },
    reward: {
      type: 'badge',
      id: 'badge_perfectionist'
    },
    rarity: 'common',
    icon: '🏆',
    hints: ['Not satisfied with your first result?', 'Try, try again...']
  },
  {
    id: 'explorer',
    name: 'Type Explorer',
    nameKo: '유형 탐험가',
    description: 'Visited all 16 personality type pages',
    descriptionKo: '16가지 성격 유형 페이지를 모두 방문',
    trigger: 'action',
    condition: {
      type: 'pages_visited',
      value: 16
    },
    reward: {
      type: 'badge',
      id: 'badge_explorer'
    },
    rarity: 'rare',
    icon: '🌟',
    hints: ['Curious about other types?', 'Every personality has its charm']
  },
  {
    id: 'butterfly_effect',
    name: 'Butterfly Effect',
    nameKo: '나비 효과',
    description: 'Clicked the animal cursor 100 times',
    descriptionKo: '동물 커서를 100번 이상 클릭',
    trigger: 'action',
    condition: {
      type: 'cursor_clicks',
      value: 100
    },
    reward: {
      type: 'badge',
      id: 'badge_butterfly'
    },
    rarity: 'common',
    icon: '🦋'
  },
  {
    id: 'art_lover',
    name: 'Art Lover',
    nameKo: '예술 애호가',
    description: 'Favorited the same artwork 3 times',
    descriptionKo: '같은 작품을 3번 이상 즐겨찾기',
    trigger: 'action',
    condition: {
      type: 'repeated_favorite',
      value: 3
    },
    reward: {
      type: 'badge',
      id: 'badge_art_lover'
    },
    rarity: 'rare',
    icon: '💝'
  },
  {
    id: 'theme_switcher',
    name: 'Theme Magician',
    nameKo: '테마 마법사',
    description: 'Switched between dark/light mode 10 times',
    descriptionKo: '다크모드/라이트모드 10번 전환',
    trigger: 'action',
    condition: {
      type: 'theme_switches',
      value: 10
    },
    reward: {
      type: 'experience',
      id: 'rainbow_theme'
    },
    rarity: 'common',
    icon: '🎨'
  }
];

// Time-based Easter Eggs (uses user's local time)
export const TIME_EASTER_EGGS: EasterEgg[] = [
  {
    id: 'night_owl',
    name: 'Night Owl',
    nameKo: '올빼미족',
    description: 'Accessed the site between 2-4 AM local time',
    descriptionKo: '현지 시간 새벽 2-4시 사이에 접속',
    trigger: 'time',
    condition: {
      type: 'time_range',
      value: { start: 2, end: 4 },
      checkFunction: (context: { localHour: number }) => {
        return context.localHour >= 2 && context.localHour < 4;
      }
    },
    reward: {
      type: 'badge',
      id: 'badge_night_owl'
    },
    rarity: 'rare',
    icon: '🦉'
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    nameKo: '얼리버드',
    description: 'First login between 5-6 AM local time',
    descriptionKo: '현지 시간 새벽 5-6시 사이 첫 로그인',
    trigger: 'time',
    condition: {
      type: 'time_range',
      value: { start: 5, end: 6 },
      checkFunction: (context: { localHour: number }) => {
        return context.localHour >= 5 && context.localHour < 6;
      }
    },
    reward: {
      type: 'badge',
      id: 'badge_early_bird'
    },
    rarity: 'rare',
    icon: '🌅'
  },
  {
    id: 'halloween_spirit',
    name: 'Halloween Spirit',
    nameKo: '할로윈 정신',
    description: 'Visited on Halloween (October 31)',
    descriptionKo: '할로윈(10월 31일)에 방문',
    trigger: 'time',
    condition: {
      type: 'specific_date',
      value: { month: 10, day: 31 },
      checkFunction: (context: { month: number; day: number }) => {
        return context.month === 10 && context.day === 31;
      }
    },
    reward: {
      type: 'experience',
      id: 'gothic_theme'
    },
    rarity: 'epic',
    icon: '🎃'
  },
  {
    id: 'full_moon',
    name: 'Lunar Observer',
    nameKo: '달빛 관찰자',
    description: 'Visited during a full moon',
    descriptionKo: '보름달 기간에 방문',
    trigger: 'time',
    condition: {
      type: 'lunar_phase',
      value: 'full',
      checkFunction: (context: { lunarPhase: string }) => {
        return context.lunarPhase === 'full';
      }
    },
    reward: {
      type: 'feature',
      id: 'lunar_gallery'
    },
    rarity: 'epic',
    icon: '🌙'
  }
];

// Command-based Easter Eggs (for AI chatbot)
export const COMMAND_EASTER_EGGS: EasterEgg[] = [
  {
    id: 'secret_gallery',
    name: 'Secret Keeper',
    nameKo: '비밀의 수호자',
    description: 'Discovered the secret gallery command',
    descriptionKo: '비밀 갤러리 명령어 발견',
    trigger: 'command',
    condition: {
      type: 'chat_command',
      value: '/secret gallery'
    },
    reward: {
      type: 'feature',
      id: 'secret_gallery_access'
    },
    rarity: 'legendary',
    icon: '🗝️',
    hints: ['Ask the AI about hidden spaces', 'Some galleries are not on the map']
  },
  {
    id: 'konami_code',
    name: 'Retro Gamer',
    nameKo: '레트로 게이머',
    description: 'Entered the Konami code',
    descriptionKo: '코나미 코드 입력',
    trigger: 'sequence',
    condition: {
      type: 'key_sequence',
      value: ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']
    },
    reward: {
      type: 'badge',
      id: 'badge_retro_gamer'
    },
    rarity: 'epic',
    icon: '🎮'
  },
  {
    id: 'art_detective',
    name: 'Art Detective',
    nameKo: '예술 탐정',
    description: 'Started the art mystery game',
    descriptionKo: '예술 미스터리 게임 시작',
    trigger: 'command',
    condition: {
      type: 'chat_command',
      value: '/art detective'
    },
    reward: {
      type: 'experience',
      id: 'mystery_game'
    },
    rarity: 'rare',
    icon: '🔍'
  }
];

// Badge Definitions
export const BADGES: Record<string, Badge> = {
  badge_perfectionist: {
    id: 'badge_perfectionist',
    name: 'Perfectionist',
    nameKo: '완벽주의자',
    description: 'Always seeking the perfect match',
    descriptionKo: '항상 완벽한 매치를 추구하는 사람',
    icon: '🏆',
    category: 'special',
    tier: 1,
    points: 10
  },
  badge_explorer: {
    id: 'badge_explorer',
    name: 'Type Explorer',
    nameKo: '유형 탐험가',
    description: 'Explored all personality types',
    descriptionKo: '모든 성격 유형을 탐험한 사람',
    icon: '🌟',
    category: 'exploration',
    tier: 2,
    points: 25
  },
  badge_butterfly: {
    id: 'badge_butterfly',
    name: 'Butterfly Whisperer',
    nameKo: '나비와 대화하는 자',
    description: 'Made friends with the cursor',
    descriptionKo: '커서와 친구가 된 사람',
    icon: '🦋',
    category: 'special',
    tier: 1,
    points: 15
  },
  badge_night_owl: {
    id: 'badge_night_owl',
    name: 'Night Owl',
    nameKo: '올빼미족',
    description: 'Art knows no bedtime',
    descriptionKo: '예술에는 취침 시간이 없다',
    icon: '🦉',
    category: 'special',
    tier: 2,
    points: 20
  },
  badge_early_bird: {
    id: 'badge_early_bird',
    name: 'Early Bird',
    nameKo: '얼리버드',
    description: 'Catches the artistic worm',
    descriptionKo: '예술의 벌레를 잡는 새',
    icon: '🌅',
    category: 'special',
    tier: 2,
    points: 20
  },
  badge_art_lover: {
    id: 'badge_art_lover',
    name: 'Devoted Art Lover',
    nameKo: '헌신적인 예술 애호가',
    description: 'When you love something, you keep coming back',
    descriptionKo: '사랑하는 것에는 계속 돌아오게 마련',
    icon: '💝',
    category: 'emotion',
    tier: 2,
    points: 30
  },
  badge_retro_gamer: {
    id: 'badge_retro_gamer',
    name: 'Retro Art Gamer',
    nameKo: '레트로 아트 게이머',
    description: 'Up, Up, Down, Down, Art, Art',
    descriptionKo: '위, 위, 아래, 아래, 예술, 예술',
    icon: '🎮',
    category: 'special',
    tier: 3,
    points: 50
  }
};

// Helper functions
export function checkEasterEgg(
  easterEgg: EasterEgg,
  context: any
): boolean {
  if (easterEgg.condition.checkFunction) {
    return easterEgg.condition.checkFunction(context);
  }
  
  // Default checking logic based on type
  switch (easterEgg.condition.type) {
    case 'quiz_retakes':
    case 'pages_visited':
    case 'cursor_clicks':
    case 'repeated_favorite':
    case 'theme_switches':
      return context.count >= easterEgg.condition.value;
    
    case 'chat_command':
      return context.command === easterEgg.condition.value;
    
    case 'key_sequence':
      return JSON.stringify(context.sequence) === JSON.stringify(easterEgg.condition.value);
    
    default:
      return false;
  }
}

export function getAllEasterEggs(): EasterEgg[] {
  return [...ACTION_EASTER_EGGS, ...TIME_EASTER_EGGS, ...COMMAND_EASTER_EGGS];
}

export function getEasterEggById(id: string): EasterEgg | undefined {
  return getAllEasterEggs().find(egg => egg.id === id);
}

export function getBadgeById(id: string): Badge | undefined {
  return BADGES[id];
}

// Calculate user's total badge points
export function calculateUserPoints(badgeIds: string[]): number {
  return badgeIds.reduce((total, badgeId) => {
    const badge = getBadgeById(badgeId);
    return total + (badge?.points || 0);
  }, 0);
}

// Get user's title based on points
export function getUserTitle(points: number): { title: string; titleKo: string } {
  if (points >= 500) return { title: 'SAYU Master', titleKo: 'SAYU 마스터' };
  if (points >= 300) return { title: 'Art Guardian', titleKo: '예술의 수호자' };
  if (points >= 200) return { title: 'Gallery Curator', titleKo: '갤러리 큐레이터' };
  if (points >= 100) return { title: 'Art Explorer', titleKo: '예술 탐험가' };
  if (points >= 50) return { title: 'Art Enthusiast', titleKo: '예술 애호가' };
  return { title: 'Art Beginner', titleKo: '예술 입문자' };
}