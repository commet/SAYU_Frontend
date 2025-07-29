// 🎨 SAYU Gamification System Types

export interface UserPoints {
  userId: string;
  totalPoints: number;
  level: number;
  levelName: string;
  levelName_ko: string;
  nextLevelPoints: number;
  achievements: Achievement[];
  missions: Mission[];
  exhibitionHistory: ExhibitionVisit[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Achievement {
  id: string;
  name: string;
  name_ko: string;
  description: string;
  description_ko: string;
  icon: string;
  points: number;
  unlockedAt?: Date;
  category: 'exploration' | 'social' | 'knowledge' | 'special';
}

export interface Mission {
  id: string;
  type: 'daily' | 'weekly' | 'special';
  title: string;
  title_ko: string;
  description: string;
  description_ko: string;
  points: number;
  xpReward: number; // For compatibility with DailyQuest
  progress: number;
  target: number;
  completed: boolean;
  expiresAt?: Date;
  category: MissionCategory;
}

export type MissionCategory = 
  | 'exhibition_visit'
  | 'personality_exploration'
  | 'social_interaction'
  | 'knowledge_sharing'
  | 'art_discovery';

export interface ExhibitionVisit {
  id: string;
  exhibitionId: string;
  exhibitionName: string;
  visitDate: Date;
  companionType?: string; // 함께 간 사람의 성격 유형
  compatibilityLevel?: 'platinum' | 'gold' | 'silver' | 'bronze';
  rating?: number; // 1-5
  review?: string;
  pointsEarned: number;
}

export interface LevelSystem {
  level: number;
  name: string;
  name_ko: string;
  minPoints: number;
  maxPoints: number;
  perks: string[];
  perks_ko: string[];
}

export interface PointActivity {
  id: string;
  userId: string;
  type: PointActivityType;
  points: number;
  description: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export type PointActivityType = 
  | 'quiz_completion'
  | 'first_quiz'
  | 'exhibition_visit'
  | 'exhibition_review'
  | 'compatibility_check'
  | 'profile_complete'
  | 'achievement_unlock'
  | 'mission_complete'
  | 'daily_login'
  | 'invite_friend'
  | 'share_result';

// Additional types for gamification hooks
export type XPEventType = 
  | 'DAILY_LOGIN'
  | 'VIEW_ARTWORK'
  | 'QUIZ_COMPLETE'
  | 'FOLLOW_USER'
  | 'SHARE_ARTWORK'
  | 'AI_PROFILE_CREATE'
  | 'EXHIBITION_VISIT'
  | 'REVIEW_WRITE';

export type LeaderboardType = 'daily' | 'weekly' | 'monthly' | 'all';

export interface UserStats {
  userId: string;
  totalXP: number;
  level: number;
  levelName: string;
  levelColor?: string;
  levelIcon?: string;
  nextLevelXP: number;
  currentLevelXP: number;
  progress: number;
  weeklyRank?: number;
  achievements: Achievement[];
  recentActivity: PointActivity[];
  lastActivityDate?: string;
}

export interface DailyQuest {
  id: string;
  name?: string; // Backward compatibility
  title: string;
  description: string;
  xp?: number; // Backward compatibility
  xpReward: number;
  progress: number;
  target: number;
  required?: number; // Backward compatibility
  completed: boolean;
  type: 'daily' | 'weekly' | 'special';
}

export interface XPResult {
  xpGained: number;
  leveledUp?: boolean;
  level?: {
    name: string;
    number: number;
  };
  newAchievements?: Achievement[];
  userId?: string;
}

export interface GamificationApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

// Dashboard specific types
export interface DashboardStats {
  level: number;
  levelName: string;
  levelName_ko?: string;
  currentPoints: number;
  totalPoints: number;
  nextLevelPoints: number;
  weeklyStreak: number;
  totalExhibitions: number;
  averageDuration: number;
  mainTitle: string;
  recentAchievements?: Achievement[];
  achievements?: Achievement[];
  upcomingChallenges?: Mission[];
  challenges?: Mission[];
  leaderboardRank?: number;
  friendsActivity?: FriendActivity[];
  recentActivities?: PointActivity[];
  recentExhibitions?: ExhibitionVisit[];
  evaluationStats?: {
    totalEvaluations: number;
    averageRating: number;
  };
  stats?: {
    totalVisits: number;
    totalTime: number;
    favoriteArtist?: string;
  };
}

export interface FriendActivity {
  userId: string;
  userName: string;
  action: string;
  timestamp: Date;
}

// Leaderboard entry type
export interface LeaderboardEntry {
  userId: string;
  user_id?: string; // Backward compatibility
  userName: string;
  username?: string; // Backward compatibility
  aptType?: string;
  totalXP: number;
  total_xp?: number; // Backward compatibility
  weekly_xp?: number; // For weekly leaderboard
  level: number;
  rank: number;
  avatar?: string;
  avatar_url?: string; // Backward compatibility
  isCurrentUser?: boolean;
}