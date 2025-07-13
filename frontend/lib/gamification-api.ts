import { apiClient } from '@/lib/api-client';

// Types
export interface UserGamificationStats {
  level: number;
  levelName: string;
  currentPoints: number;
  totalPoints: number;
  nextLevelPoints: number;
  weeklyStreak: number;
  totalExhibitions: number;
  averageDuration: number;
  mainTitle: string | null;
  rank?: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  earnedAt: Date;
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  progress: number;
  target: number;
  reward: number;
  expiresAt: Date;
  status: 'active' | 'completed' | 'expired';
}

export interface ExhibitionSession {
  id: string;
  exhibitionId: string;
  exhibitionName: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
}

export interface Title {
  id: string;
  name: string;
  nameKo: string;
  description: string;
  icon: string;
  rarity: string;
  earned: boolean;
  earnedAt?: Date;
  progress?: number;
  requirement?: number;
  isMain?: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  profileImage?: string;
  level: number;
  points: number;
  isCurrentUser?: boolean;
}

export interface ActivityLog {
  id: string;
  activityType: string;
  pointsEarned: number;
  metadata: any;
  createdAt: Date;
}

// API Client
class GamificationAPI {
  private basePath = '/gamification';

  // Dashboard
  async getDashboard() {
    return apiClient.get(`${this.basePath}/dashboard`);
  }

  // Points
  async earnPoints(activity: string, metadata?: any) {
    return apiClient.post(`${this.basePath}/earn-points`, {
      activity,
      metadata
    });
  }

  // Exhibition Sessions
  async startExhibition(data: {
    exhibitionId: string;
    exhibitionName: string;
    location?: { lat: number; lng: number; venue?: string };
  }) {
    return apiClient.post(`${this.basePath}/exhibition/start`, data);
  }

  async endExhibition(sessionId: string) {
    return apiClient.post(`${this.basePath}/exhibition/end`, { sessionId });
  }

  async getCurrentSession() {
    return apiClient.get(`${this.basePath}/exhibition/current`);
  }

  // Titles
  async getTitles() {
    return apiClient.get(`${this.basePath}/titles`);
  }

  async setMainTitle(titleId: string) {
    return apiClient.put(`${this.basePath}/titles/main`, { titleId });
  }

  // Challenges
  async getChallenges(status: 'active' | 'completed' | 'all' = 'active') {
    return apiClient.get(`${this.basePath}/challenges?status=${status}`);
  }

  // Leaderboard
  async getLeaderboard(type: 'weekly' | 'monthly' | 'all-time' = 'weekly', limit = 50) {
    return apiClient.get(`${this.basePath}/leaderboard?type=${type}&limit=${limit}`);
  }

  async getFriendsLeaderboard() {
    return apiClient.get(`${this.basePath}/leaderboard/friends`);
  }

  // Stats
  async getUserStats(userId?: string) {
    const path = userId 
      ? `${this.basePath}/stats/${userId}`
      : `${this.basePath}/stats`;
    return apiClient.get(path);
  }

  // Activity History
  async getActivityHistory(options: {
    limit?: number;
    offset?: number;
    type?: string;
  } = {}) {
    const params = new URLSearchParams();
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.offset) params.append('offset', options.offset.toString());
    if (options.type) params.append('type', options.type);
    
    return apiClient.get(`${this.basePath}/activities?${params}`);
  }

  // Weekly Progress
  async getWeeklyProgress() {
    return apiClient.get(`${this.basePath}/weekly-progress`);
  }

  // Level Info
  async getLevelInfo() {
    return apiClient.get(`${this.basePath}/levels`);
  }

  // Events
  async getActiveEvents() {
    return apiClient.get(`${this.basePath}/events`);
  }

  // Share Card
  async generateShareCard(type: 'monthly' | 'achievement' | 'level-up', data?: any) {
    return apiClient.post(`${this.basePath}/share-card`, { type, data });
  }

  // SSE Stream
  subscribeToUpdates(onMessage: (data: any) => void) {
    try {
      const eventSource = new EventSource(
        `${process.env.NEXT_PUBLIC_API_URL}${this.basePath}/stream`,
        { withCredentials: true }
      );

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage(data);
        } catch (error) {
          console.error('Failed to parse SSE message:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.warn('SSE connection failed - real-time updates disabled');
        eventSource.close();
      };

      return () => eventSource.close();
    } catch (error) {
      console.warn('SSE not supported or connection failed');
      return () => {}; // Return empty cleanup function
    }
  }
}

export const gamificationAPI = new GamificationAPI();