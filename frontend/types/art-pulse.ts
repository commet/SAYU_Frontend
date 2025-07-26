<<<<<<< HEAD
// Art Pulse 실시간 공동 감상 타입 정의

export interface ArtPulseSession {
  id: string;
  artwork: Artwork;
  startTime: string;
  endTime: string;
  status: 'active' | 'completed' | 'cancelled';
  phase: 'contemplation' | 'sharing' | 'voting';
  participantCount: number;
  emotionDistribution: EmotionDistribution;
  reflections: ArtPulseReflection[];
  results?: SessionResults;
}

export interface Artwork {
  id: string;
  title: string;
  artist: string;
  image_url: string;
  description?: string;
  year?: number;
  medium?: string;
  dimensions?: string;
  museum?: string;
  culture?: string;
  period?: string;
}

export interface EmotionDistribution {
  [emotion: string]: {
    count: number;
    intensity: number;
  };
}

export interface ArtPulseEmotion {
  userId: string;
  emotion: EmotionType;
  intensity: number;
  timestamp: string;
}

export type EmotionType = 
  | 'wonder'
  | 'melancholy' 
  | 'joy'
  | 'contemplation'
  | 'nostalgia'
  | 'awe'
  | 'serenity'
  | 'passion'
  | 'mystery'
  | 'hope';

export interface EmotionConfig {
  name: string;
  color: string;
  bgColor: string;
  description: string;
  icon: string;
}

export const EMOTION_CONFIGS: Record<EmotionType, EmotionConfig> = {
  wonder: {
    name: '경이',
    color: '#FFD700',
    bgColor: 'rgba(255, 215, 0, 0.1)',
    description: '놀라움과 신비로움',
    icon: '✨'
  },
  melancholy: {
    name: '우울',
    color: '#6B73FF',
    bgColor: 'rgba(107, 115, 255, 0.1)',
    description: '깊은 사색과 그리움',
    icon: '🌧️'
  },
  joy: {
    name: '기쁨',
    color: '#FF6B6B',
    bgColor: 'rgba(255, 107, 107, 0.1)',
    description: '밝음과 활력',
    icon: '☀️'
  },
  contemplation: {
    name: '사색',
    color: '#4ECDC4',
    bgColor: 'rgba(78, 205, 196, 0.1)',
    description: '깊은 생각과 명상',
    icon: '🤔'
  },
  nostalgia: {
    name: '향수',
    color: '#95A5A6',
    bgColor: 'rgba(149, 165, 166, 0.1)',
    description: '추억과 그리움',
    icon: '🕰️'
  },
  awe: {
    name: '경외',
    color: '#9B59B6',
    bgColor: 'rgba(155, 89, 182, 0.1)',
    description: '압도적인 감동',
    icon: '🙏'
  },
  serenity: {
    name: '평온',
    color: '#2ECC71',
    bgColor: 'rgba(46, 204, 113, 0.1)',
    description: '고요함과 평화',
    icon: '🕊️'
  },
  passion: {
    name: '열정',
    color: '#E74C3C',
    bgColor: 'rgba(231, 76, 60, 0.1)',
    description: '강렬한 감정',
    icon: '🔥'
  },
  mystery: {
    name: '신비',
    color: '#34495E',
    bgColor: 'rgba(52, 73, 94, 0.1)',
    description: '알 수 없는 깊이',
    icon: '🌙'
  },
  hope: {
    name: '희망',
    color: '#F39C12',
    bgColor: 'rgba(243, 156, 18, 0.1)',
    description: '미래에 대한 기대',
    icon: '🌅'
  }
};

export interface ArtPulseReflection {
  id: string;
  userId?: string;
  username?: string;
  sayuType?: string;
  profileImage?: string;
  reflection: string;
  timestamp: string;
  likes: number;
  likedBy: string[];
  isAnonymous: boolean;
}

export interface SessionResults {
  totalParticipants: number;
  topEmotions: Array<{
    emotion: EmotionType;
    count: number;
  }>;
  topReflections: ArtPulseReflection[];
  sayuDistribution: Record<string, number>;
  totalReflections: number;
  emotionDiversity: number;
  averageEngagement: number;
}

export interface ArtPulseStats {
  totalSessions: number;
  totalParticipations: number;
  totalReflections: number;
  topEmotionsThisWeek: Array<{
    emotion: EmotionType;
    count: number;
  }>;
  averageParticipantsPerSession: number;
}

export interface UserProfile {
  id: string;
  username: string;
  sayu_type: string;
  emotion_preferences: EmotionType[];
  art_preferences: string[];
}

export interface TypingIndicator {
  userId: string;
  username: string;
  isTyping: boolean;
  timestamp: string;
}

// Socket 이벤트 타입
export interface ArtPulseSocketEvents {
  // Outgoing events
  art_pulse_join: { sessionId?: string };
  art_pulse_leave: {};
  art_pulse_emotion: { 
    sessionId: string; 
    emotion: EmotionType; 
    intensity: number; 
  };
  art_pulse_reflection: { 
    sessionId: string; 
    reflection: string; 
    isAnonymous: boolean; 
  };
  art_pulse_like: { 
    sessionId: string; 
    reflectionId: string; 
  };
  art_pulse_typing: { 
    sessionId: string; 
    isTyping: boolean; 
  };

  // Incoming events
  art_pulse_joined: {
    session: ArtPulseSession;
    userProfile: UserProfile;
    participantCount: number;
  };
  art_pulse_participant_joined: {
    userId: string;
    username: string;
    sayuType: string;
    participantCount: number;
  };
  art_pulse_participant_left: {
    userId: string;
    username: string;
  };
  art_pulse_state_update: {
    emotions: EmotionDistribution;
    reflections: ArtPulseReflection[];
    participantCount: number;
  };
  art_pulse_emotion_update: {
    userId: string;
    username: string;
    emotion: EmotionType;
    intensity: number;
    distribution: EmotionDistribution;
    timestamp: string;
  };
  art_pulse_new_reflection: ArtPulseReflection;
  art_pulse_reflection_liked: {
    reflectionId: string;
    likes: number;
    likedBy: string[];
    userId: string;
  };
  art_pulse_user_typing: TypingIndicator;
  art_pulse_phase_change: {
    sessionId: string;
    phase: ArtPulseSession['phase'];
    timestamp: string;
  };
  art_pulse_session_ended: {
    sessionId: string;
    results: SessionResults;
    timestamp: string;
  };
  art_pulse_session_started: {
    session: ArtPulseSession;
    timestamp: string;
  };
  art_pulse_error: {
    message: string;
  };
}

// 감정 버블 애니메이션을 위한 타입
export interface EmotionBubble {
  id: string;
  emotion: EmotionType;
  intensity: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  userId: string;
  timestamp: number;
}

// 위클리 리그 타입
export interface WeeklyLeague {
  rank: number;
  userId: string;
  username: string;
  sayuType: string;
  profileImage?: string;
  totalLikes: number;
  topReflection: {
    reflection: string;
    artwork: string;
    likes: number;
  };
}

// Art Pulse 알림 타입
export interface ArtPulseNotification {
  type: 'session_starting' | 'phase_change' | 'reflection_liked' | 'top_reflection';
  title: string;
  message: string;
  sessionId?: string;
  timestamp: string;
  read: boolean;
=======
export interface ArtPulseSession {
  id: string;
  dailyChallengeId: string;
  startTime: Date;
  endTime: Date;
  status: 'scheduled' | 'active' | 'completed';
  participantCount: number;
  createdAt: Date;
}

export interface ArtPulseParticipation {
  id: string;
  sessionId: string;
  userId: string;
  aptType: string;
  joinedAt: Date;
  leftAt?: Date;
  touchData: TouchData[];
  resonanceData: ResonanceData;
}

export interface TouchData {
  x: number; // 0-1 normalized
  y: number; // 0-1 normalized
  timestamp: number;
  pressure?: number; // 0-1 for devices that support it
}

export interface ResonanceData {
  type: 'sensory' | 'emotional' | 'cognitive' | null;
  intensity: number; // 1-10
  focusAreas: FocusArea[];
  dwellTime: number; // milliseconds
}

export interface FocusArea {
  x: number;
  y: number;
  radius: number;
  duration: number;
  intensity: number;
}

export interface ArtPulseAnalytics {
  sessionId: string;
  heatmapData: HeatmapPoint[];
  resonanceDistribution: {
    sensory: number;
    emotional: number;
    cognitive: number;
  };
  aptTypeDistribution: Record<string, number>;
  averageDwellTime: number;
  peakConcurrentUsers: number;
  engagementScore: number;
}

export interface HeatmapPoint {
  x: number;
  y: number;
  value: number;
}

export interface RealtimeArtPulseData {
  activeUsers: number;
  recentTouches: TouchData[];
  resonanceWave: {
    timestamp: number;
    sensory: number;
    emotional: number;
    cognitive: number;
  }[];
>>>>>>> 387884c5e2dc7dc27995f48a8e33a2a1e7032884
}