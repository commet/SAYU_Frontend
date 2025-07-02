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