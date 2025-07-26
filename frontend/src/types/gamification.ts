// 레벨 정의
export interface Level {
  level: number;
  name: string;
  minXP: number;
  maxXP: number;
  color: string;
  icon: string;
}

// 사용자 게이미피케이션 통계
export interface UserStats {
  userId: number;
  level: number;
  levelName: string;
  levelColor: string;
  levelIcon: string;
  currentXP: number;
  totalXP: number;
  nextLevelXP: number;
  progressToNextLevel: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  dailyQuestsCompleted: number;
  totalDailyQuests: number;
  totalRewards: number;
  weeklyRank: number | null;
}

// 일일 퀘스트
export interface DailyQuest {
  id: string;
  name: string;
  xp: number;
  required: number;
  progress: number;
  completed: boolean;
}

// XP 이벤트 타입
export type XPEventType = 
  | 'DAILY_LOGIN'
  | 'VIEW_ARTWORK'
  | 'COMPLETE_QUIZ'
  | 'FOLLOW_USER'
  | 'SHARE_ARTWORK'
  | 'CREATE_AI_PROFILE'
  | 'VISIT_EXHIBITION'
  | 'WRITE_REVIEW'
  | 'RECEIVE_LIKE'
  | 'STREAK_BONUS';

// XP 획득 결과
export interface XPResult {
  type: 'XP_GAINED' | 'LEVEL_UP';
  userId: number;
  xpGained: number;
  totalXP: number;
  level: Level;
  leveledUp: boolean;
}

// 리더보드 항목
export interface LeaderboardEntry {
  rank: number;
  user_id: number;
  username: string;
  avatar_url?: string;
  level: number;
  weekly_xp?: number;
  total_xp?: number;
  isCurrentUser?: boolean;
}

// 리더보드 타입
export type LeaderboardType = 'weekly' | 'monthly' | 'all-time';

// API 응답 타입
export interface GamificationApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// 리그 티어
export type LeagueTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

// 보상 정의
export interface Reward {
  id: number;
  type: string;
  name: string;
  description: string;
  icon_url?: string;
  unlocked?: boolean;
  unlocked_at?: string;
}