// Evolution System Type Definitions

export interface EvolutionState {
  animalType: string;
  animalEmoji: string;
  animalName: string;
  stage: number;
  stageData: StageData;
  progress: number;
  visual: VisualState;
  animation: AnimationState;
  achievements: AchievementState;
  user: UserInfo;
  stats: UserStats;
}

export interface StageData {
  name: string;
  sizeScale: number;
  features: StageFeatures;
  requiredPoints: number;
}

export interface StageFeatures {
  eyes: string;
  posture: string;
  accessory: string | null;
  aura: string | null;
  environment: string;
}

export interface VisualState {
  baseImage: string;
  containerStyles: {
    filter: string;
    opacity: number;
    transform: string;
  };
  overlayStyles: {
    background: string;
    animation: string;
  };
  decorations: Decoration[];
  cssClasses: string[];
}

export interface Decoration {
  type: 'badge' | 'accessory' | 'aura';
  data: {
    svg?: string;
    position?: Record<string, string>;
    animation?: string;
    defs?: string;
  };
}

export interface AnimationState {
  idle: string;
  interaction: string | null;
  mood: string;
}

export interface AchievementState {
  badges: Badge[];
  titles: Titles;
}

export interface Badge {
  icon: string;
  position: string;
}

export interface Titles {
  stage: string;
  apt: string;
  special: string | null;
}

export interface UserInfo {
  id: number;
  name: string;
  aptType: string;
}

export interface UserStats {
  totalPoints: number;
  weeklyPoints: number;
  monthlyPoints: number;
  lastActive: string | null;
}

export interface ActionResult {
  success: boolean;
  pointsEarned: number;
  totalPoints: number;
  evolved: boolean;
  newStage: number;
  achievedMilestones: AchievedMilestone[];
}

export interface AchievedMilestone {
  id: string;
  name: string;
  rewards: MilestoneRewards;
}

export interface MilestoneRewards {
  badge?: string;
  title?: string;
  bonusPoints?: number;
  unlocks?: string[];
  animalReaction?: string;
  animalAccessory?: string;
  animalEffect?: string;
  specialEffect?: string;
  celebration?: {
    message: string;
    effect: string;
  };
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  achieved: boolean;
  progress: number;
  requiredPoints?: number;
  requiredAction?: string;
  requiredCount?: number;
  requiredStreak?: number;
  requiredDiversity?: number;
  requiredStage?: number;
  requiredEvolution?: boolean;
  rewards: MilestoneRewards;
}

export interface DailyCheckInResult {
  success: boolean;
  alreadyVisited?: boolean;
  streak?: number;
  reward?: {
    points: number;
    item: string | null;
    bonus?: string;
  };
  perfectWeek?: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  userId: number;
  name: string;
  aptType: string;
  evolutionStage: number;
  points: number;
  badges: number;
}

export interface LeaderboardData {
  period: 'weekly' | 'monthly';
  aptType: string | 'all';
  rankings: LeaderboardEntry[];
}

export interface EvolutionAnimation {
  type: string;
  duration: number;
  effects: AnimationPhase[];
  sounds?: string[];
}

export interface AnimationPhase {
  phase: string;
  duration: number;
  effect: string;
}

export interface ActionContext {
  targetId?: number;
  targetType?: string;
  duration?: number;
  isNewStyle?: boolean;
  isNewArtist?: boolean;
  sharedWith?: string;
  weekStreak?: number;
  bonusReason?: string;
  multiplier?: number;
}

export interface SpecialEffect {
  type: string;
  opacity: number;
  color: string | null;
}