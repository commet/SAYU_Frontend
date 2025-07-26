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
}