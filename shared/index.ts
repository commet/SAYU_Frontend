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
  createdAt: Date | string;  // Allow both Date and string
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
  artwork?: any;  // Full artwork data
  phase: 'contemplation' | 'sharing' | 'voting';
  participants: string[];
  startTime: Date;
  endTime?: Date;
  status: 'active' | 'completed' | 'cancelled';
  results?: SessionResults;
}

export type EmotionType = 'joy' | 'sadness' | 'anger' | 'fear' | 'love' | 'surprise' | 'calm' | 'excitement' | 'wonder' | 'melancholy' | 'contemplation' | 'nostalgia' | 'awe' | 'serenity' | 'passion' | 'mystery' | 'hope';

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
  username?: string;
  isAnonymous?: boolean;
  sayuType?: string;
  timestamp?: Date | string;
  reflection?: string;
  likedBy?: string[];
  likes?: number;
}

export interface TypingIndicator {
  userId: string;
  isTyping: boolean;
  username?: string;
}

export interface ArtPulseSocketEvents {
  emotionSelected: { emotion: EmotionType; userId: string };
  reflectionSubmitted: ArtPulseReflection;
  typingStatus: TypingIndicator;
  phaseChanged: { phase: ArtPulseSession['phase'] };
  art_pulse_joined: { sessionId: string; participantCount: number };
  art_pulse_state_update: { session: ArtPulseSession };
  art_pulse_participant_joined: { userId: string; nickname: string };
  art_pulse_participant_left: { userId: string };
  art_pulse_emotion_update: { emotions: EmotionDistribution };
  art_pulse_new_reflection: ArtPulseReflection;
  art_pulse_reflection_liked: { reflectionId: string; likes: number };
  art_pulse_user_typing: { userId: string; isTyping: boolean };
  art_pulse_phase_change: { phase: ArtPulseSession['phase'] };
  art_pulse_session_ended: { sessionId: string; results?: SessionResults };
  art_pulse_session_started: { sessionId: string; artwork: any };
  art_pulse_error: { message: string; code?: string };
}

export interface SessionResults {
  sessionId: string;
  topEmotions: EmotionDistribution[];
  reflections: ArtPulseReflection[];
  participantCount: number;
  totalParticipants?: number;
  emotionDiversity?: number;
  averageEngagement?: number;
}

export interface EmotionBubble {
  id?: string;
  emotion: EmotionType;
  x: number;
  y: number;
  size: number;
  radius?: number;  // Alternative to size
  velocity: { x: number; y: number };
  vx?: number;  // Alternative velocity x
  vy?: number;  // Alternative velocity y
  intensity?: number;
  opacity?: number;
  userId?: string;
  timestamp?: number;
}

export interface EmotionConfig {
  color: string;
  label: string;
  icon?: string;
  name?: string;
  description?: string;
  bgColor?: string;
  ringColor?: string;
}

export const EMOTION_CONFIGS: Record<EmotionType, EmotionConfig> = {
  joy: { color: '#FFD93D', label: 'Joy', icon: '😊', name: 'Joy', description: 'Feeling of happiness and delight' },
  sadness: { color: '#6C5CE7', label: 'Sadness', icon: '😢', name: 'Sadness', description: 'Feeling of sorrow or unhappiness' },
  anger: { color: '#FF6B6B', label: 'Anger', icon: '😠', name: 'Anger', description: 'Feeling of strong displeasure' },
  fear: { color: '#A8E6CF', label: 'Fear', icon: '😰', name: 'Fear', description: 'Feeling of anxiety or apprehension' },
  love: { color: '#FF8B94', label: 'Love', icon: '❤️', name: 'Love', description: 'Feeling of deep affection' },
  surprise: { color: '#4ECDC4', label: 'Surprise', icon: '😮', name: 'Surprise', description: 'Feeling of unexpected wonder' },
  calm: { color: '#95E1D3', label: 'Calm', icon: '😌', name: 'Calm', description: 'Feeling of peace and tranquility' },
  excitement: { color: '#F38181', label: 'Excitement', icon: '🤩', name: 'Excitement', description: 'Feeling of enthusiasm and energy' },
  wonder: { color: '#B794F4', label: 'Wonder', icon: '🤔', name: 'Wonder', description: 'Feeling of curiosity and amazement' },
  melancholy: { color: '#718096', label: 'Melancholy', icon: '😔', name: 'Melancholy', description: 'Feeling of pensive sadness' },
  contemplation: { color: '#4FD1C5', label: 'Contemplation', icon: '🧐', name: 'Contemplation', description: 'Deep reflective thought' },
  nostalgia: { color: '#F6AD55', label: 'Nostalgia', icon: '🥺', name: 'Nostalgia', description: 'Sentimental longing for the past' },
  awe: { color: '#FC8181', label: 'Awe', icon: '😲', name: 'Awe', description: 'Feeling of reverent wonder' },
  serenity: { color: '#9F7AEA', label: 'Serenity', icon: '😇', name: 'Serenity', description: 'State of being calm and peaceful' },
  passion: { color: '#F687B3', label: 'Passion', icon: '🔥', name: 'Passion', description: 'Intense enthusiasm or desire' },
  mystery: { color: '#667EEA', label: 'Mystery', icon: '🎭', name: 'Mystery', description: 'Feeling of intrigue and curiosity' },
  hope: { color: '#48BB78', label: 'Hope', icon: '🌟', name: 'Hope', description: 'Feeling of expectation and desire' }
};

// Artist types
export interface Artist {
  id: string;
  name: string;
  nameKo?: string;
  bio?: string;
  bioKo?: string;
  birthYear?: number;
  deathYear?: number;
  nationality?: string;
  nationalityKo?: string;
  artMovements?: string[];
  notableWorks?: string[];
  imageUrl?: string;
  images?: string[];
  followCount?: number;
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

// Daily Challenge types
export interface DailyChallenge {
  id: string;
  date: string;
  theme: string;
  description: string;
  emotion: EmotionType;
  artwork?: any;
  completedBy?: string[];
}

export interface ChallengeMatch {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  emotion: EmotionType;
  reflection: string;
  createdAt: Date;
  similarity?: number;
}

export interface DailyChallengeStats {
  totalChallenges: number;
  completedChallenges: number;
  streak: number;
  longestStreak: number;
}

// Exhibition Companion types
export interface CompanionRequest {
  id: string;
  userId: string;
  exhibitionId: string;
  preferredDate: Date;
  timeSlot: string;
  message?: string;
  status: 'pending' | 'matched' | 'cancelled';
}

export interface Exhibition {
  id: string;
  title: string;
  venueId: string;
  startDate: Date;
  endDate: Date;
  description?: string;
  imageUrl?: string;
  artists?: string[];
}

// Constants
export const TIME_SLOT_OPTIONS = [
  'morning',
  'afternoon', 
  'evening'
] as const;

export const VIEWING_PACE_OPTIONS = [
  'slow',
  'moderate',
  'fast'
] as const;

export const INTERACTION_STYLE_OPTIONS = [
  'quiet',
  'discussion',
  'guided'
] as const;

// Color types
export interface HSLColor {
  h: number;
  s: number;
  l: number;
}