import { API_CONFIG } from '@/config/api';

export interface DashboardStats {
  level: number;
  levelName: string;
  currentPoints: number;
  totalPoints: number;
  nextLevelPoints: number;
  weeklyStreak: number;
  totalExhibitions: number;
  averageDuration: number;
  mainTitle: string;
  recentAchievements: Achievement[];
  upcomingChallenges: Challenge[];
  leaderboardRank?: number;
  friendsActivity?: FriendActivity[];
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
  title: string;
  description: string;
  progress: number;
  target: number;
  reward: number;
  expiresAt: Date;
}

export interface FriendActivity {
  userId: string;
  userName: string;
  action: string;
  timestamp: Date;
}

class GamificationAPI {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const response = await fetch(`${API_CONFIG.baseUrl}/api/gamification/dashboard`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch dashboard stats');
    }

    const data = await response.json();
    
    // Convert date strings to Date objects
    return {
      ...data,
      recentAchievements: data.recentAchievements.map((a: any) => ({
        ...a,
        earnedAt: new Date(a.earnedAt)
      })),
      upcomingChallenges: data.upcomingChallenges.map((c: any) => ({
        ...c,
        expiresAt: new Date(c.expiresAt)
      })),
      friendsActivity: data.friendsActivity?.map((f: any) => ({
        ...f,
        timestamp: new Date(f.timestamp)
      }))
    };
  }

  async getUserAchievements(): Promise<Achievement[]> {
    const response = await fetch(`${API_CONFIG.baseUrl}/api/gamification/achievements`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch achievements');
    }

    const data = await response.json();
    return data.map((a: any) => ({
      ...a,
      earnedAt: new Date(a.earnedAt)
    }));
  }

  async getChallenges(): Promise<Challenge[]> {
    const response = await fetch(`${API_CONFIG.baseUrl}/api/gamification/challenges`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch challenges');
    }

    const data = await response.json();
    return data.map((c: any) => ({
      ...c,
      expiresAt: new Date(c.expiresAt)
    }));
  }

  async getLeaderboard(timeframe: 'daily' | 'weekly' | 'monthly' | 'all'): Promise<{
    rank: number;
    total: number;
    topUsers: Array<{
      rank: number;
      userId: string;
      userName: string;
      points: number;
      level: number;
    }>;
  }> {
    const response = await fetch(
      `${API_CONFIG.baseUrl}/api/gamification/leaderboard?timeframe=${timeframe}`,
      {
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch leaderboard');
    }

    return response.json();
  }

  async claimChallenge(challengeId: string): Promise<{
    success: boolean;
    pointsEarned: number;
    newAchievements?: Achievement[];
  }> {
    const response = await fetch(
      `${API_CONFIG.baseUrl}/api/gamification/challenges/${challengeId}/claim`,
      {
        method: 'POST',
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to claim challenge');
    }

    return response.json();
  }

  async updateExhibitionProgress(exhibitionId: string, duration: number): Promise<{
    pointsEarned: number;
    newLevel?: number;
    newAchievements?: Achievement[];
  }> {
    const response = await fetch(
      `${API_CONFIG.baseUrl}/api/gamification/exhibitions/${exhibitionId}/progress`,
      {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ duration }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update exhibition progress');
    }

    return response.json();
  }
}

export const gamificationAPI = new GamificationAPI();