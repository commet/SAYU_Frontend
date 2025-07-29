/**
 * SAYU Shared Types and Utilities
 * Central export point for all shared types across frontend and backend
 */

// Re-export SAYU type definitions
export * from './SAYUTypeDefinitions';
export * from './easterEggDefinitions';

// Common API types
export interface EmotionInterpretation {
  emotionId: string;
  dimensions: {
    valence: number;
    arousal: number;
    dominance: number;
    complexity: number;
  };
  vector: number[];
  characteristics: string[];
}

export interface ArtworkMatch {
  artwork: {
    id: string;
    title: string;
    artist?: string;
    imageUrl?: string;
  };
  matching: {
    score: number;
    type: 'direct' | 'metaphorical' | 'complementary';
    reason?: string;
  };
}

export interface EmotionInput {
  primary: string;
  secondary?: string;
  intensity: number;
  context?: string;
}

// Evolution system types
export interface EvolutionProgress {
  id: string;
  userId: string;
  currentLevel: number;
  currentXP: number;
  totalXP: number;
  evolutionStage: string;
  artworkCount: number;
  connectionCount: number;
  lastActivityAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface EvolutionMilestone {
  id: string;
  level: number;
  xpRequired: number;
  stageName: string;
  stageDescription: string;
  rewards: string[];
  artworkRequirement: number;
  connectionRequirement: number;
}

export interface EvolutionActivity {
  id: string;
  userId: string;
  activityType: string;
  xpGained: number;
  description: string;
  metadata?: any;
  createdAt: Date;
}

// Follow system types
export interface FollowUser {
  id: string;
  username: string;
  profileImage?: string;
  personalityType?: string;
  bio?: string;
  artworkCount?: number;
  followerCount?: number;
  isFollowing?: boolean;
  createdAt?: Date;
}

export interface FollowListResponse {
  users: FollowUser[];
  total: number;
  page: number;
  pageSize: number;
}

export interface FollowStats {
  followersCount: number;
  followingCount: number;
  mutualCount: number;
}

// Type alias for backward compatibility
export type PersonalityType = string;

// Evolution system extended types
export interface EvolutionState {
  userId: string;
  currentStage: string;
  xp: number;
  level: number;
  nextLevelXp: number;
  streakDays: number;
  badges: string[];
  milestones: Milestone[];
  stats: {
    artworksViewed: number;
    connectionsFormed: number;
    questsCompleted: number;
    totalXpEarned: number;
  };
}

export interface ActionResult {
  success: boolean;
  xpGained?: number;
  newLevel?: number;
  newBadges?: string[];
  message?: string;
}

export interface ActionContext {
  type: string;
  metadata?: Record<string, any>;
}

export interface DailyCheckInResult {
  success: boolean;
  xpGained: number;
  streakDays: number;
  bonusXp?: number;
  newBadges?: string[];
}

export interface LeaderboardData {
  userId: string;
  username: string;
  profileImage?: string;
  level: number;
  xp: number;
  rank: number;
  personalityType?: string;
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  xpRequired: number;
  achieved: boolean;
  achievedAt?: Date;
  rewards: string[];
}

export interface EvolutionAnimation {
  type: string;
  duration: number;
  particles?: any;
  colors?: string[];
}

// Art Profile types
export interface ArtStyle {
  id: string;
  name: string;
  nameKo?: string;
  description: string;
  examples: string[];
  colorPalette: string[];
  characteristics: string[];
}

export interface ArtProfileResult {
  id: string;
  userId: string;
  primaryStyle?: ArtStyle;
  secondaryStyle?: ArtStyle;
  colorPreferences?: string[];
  themePreferences?: string[];
  generatedImage?: string;
  transformedImage?: string;
  originalImage?: string;
  styleUsed?: ArtStyle;
  createdAt: Date;
}

export interface ArtProfileGalleryItem {
  id: string;
  userId: string;
  profileId: string;
  imageUrl: string;
  style: string;
  createdAt: Date;
  isLiked?: boolean;
  likeCount?: number;
  artProfile?: ArtProfileResult;
  user?: {
    username: string;
    avatarUrl?: string;
  };
}

export const predefinedStyles: ArtStyle[] = [
  {
    id: 'impressionist',
    name: 'Impressionist',
    description: 'Soft, dreamy brushstrokes with emphasis on light and color',
    examples: ['Monet', 'Renoir'],
    colorPalette: ['#E6D5B8', '#F0A500', '#4A7C7E'],
    characteristics: ['soft edges', 'light play', 'atmospheric']
  },
  {
    id: 'abstract',
    name: 'Abstract',
    description: 'Bold shapes and colors expressing emotions',
    examples: ['Kandinsky', 'Pollock'],
    colorPalette: ['#FF6B6B', '#4ECDC4', '#45B7D1'],
    characteristics: ['geometric', 'expressive', 'non-representational']
  }
];

// Art Pulse types
export interface ArtPulseSession {
  id: string;
  artworkId: string;
  phase: 'contemplation' | 'sharing' | 'voting';
  participants: string[];
  startTime: Date;
  endTime?: Date;
}

export type EmotionType = 'joy' | 'sadness' | 'anger' | 'fear' | 'love' | 'surprise' | 'calm' | 'excitement';

export interface EmotionDistribution {
  emotion: EmotionType;
  count: number;
  percentage: number;
}

export interface ArtPulseReflection {
  id: string;
  userId: string;
  sessionId: string;
  content: string;
  emotion: EmotionType;
  createdAt: Date;
}

export interface TypingIndicator {
  userId: string;
  isTyping: boolean;
}

export interface ArtPulseSocketEvents {
  emotionSelected: { emotion: EmotionType; userId: string };
  reflectionSubmitted: ArtPulseReflection;
  typingStatus: TypingIndicator;
  phaseChanged: { phase: ArtPulseSession['phase'] };
}

export interface SessionResults {
  sessionId: string;
  topEmotions: EmotionDistribution[];
  reflections: ArtPulseReflection[];
  participantCount: number;
}

export interface EmotionBubble {
  emotion: EmotionType;
  x: number;
  y: number;
  size: number;
  velocity: { x: number; y: number };
}

export const EMOTION_CONFIGS: Record<EmotionType, { color: string; label: string }> = {
  joy: { color: '#FFD93D', label: 'Joy' },
  sadness: { color: '#6C5CE7', label: 'Sadness' },
  anger: { color: '#FF6B6B', label: 'Anger' },
  fear: { color: '#A8E6CF', label: 'Fear' },
  love: { color: '#FF8B94', label: 'Love' },
  surprise: { color: '#4ECDC4', label: 'Surprise' },
  calm: { color: '#95E1D3', label: 'Calm' },
  excitement: { color: '#F38181', label: 'Excitement' }
};

// Artist types
export interface Artist {
  id: string;
  name: string;
  bio?: string;
  birthYear?: number;
  deathYear?: number;
  nationality?: string;
  artMovements?: string[];
  notableWorks?: string[];
  imageUrl?: string;
  copyrightStatus?: CopyrightStatus;
}

export type CopyrightStatus = 'public_domain' | 'licensed' | 'contemporary' | 'verified_artist';

export interface ArtistColorPalette {
  primary: string;
  secondary: string;
  accent: string;
}

// Emotion translation types
export interface EmotionColor {
  hue: number;
  saturation: number;
  lightness: number;
  opacity?: number;
}

export interface WeatherMetaphor {
  condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'foggy' | 'snowy';
  intensity: number;
  temperature: 'cold' | 'cool' | 'warm' | 'hot';
}

export interface AbstractShape {
  form: 'circle' | 'square' | 'triangle' | 'irregular';
  edges: 'sharp' | 'rounded' | 'fluid';
  density: 'sparse' | 'moderate' | 'dense';
}

export interface SoundTexture {
  pitch: 'low' | 'medium' | 'high';
  volume: number;
  rhythm: 'regular' | 'syncopated' | 'free' | 'absent';
}