import { API_CONFIG } from '@/config/api';
import {
  UserStats,
  DailyQuest,
  XPEventType,
  XPResult,
  LeaderboardEntry,
  LeaderboardType,
  GamificationApiResponse,
  DashboardStats,
  Achievement,
  Mission as Challenge,
  FriendActivity
} from '@/types/gamification';

export interface UserGamificationStats {
  level: number;
  points: number;
  totalExhibitions: number;
  streak: number;
}

export interface ExhibitionSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  pointsEarned: number;
}

export interface Title {
  id: string;
  name: string;
  description: string;
  isEarned: boolean;
  earnedAt?: Date;
  isMain: boolean;
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
      recentAchievements: data.recentAchievements?.map((a: any) => ({
        ...a,
        unlockedAt: a.unlockedAt ? new Date(a.unlockedAt) : undefined
      })) || [],
      challenges: data.challenges?.map((c: any) => ({
        ...c,
        expiresAt: c.expiresAt ? new Date(c.expiresAt) : undefined
      })) || [],
      recentActivities: data.recentActivities?.map((a: any) => ({
        ...a,
        createdAt: new Date(a.createdAt)
      })) || [],
      recentExhibitions: data.recentExhibitions?.map((e: any) => ({
        ...e,
        visitDate: new Date(e.visitDate)
      })) || []
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
      unlockedAt: a.unlockedAt ? new Date(a.unlockedAt) : undefined
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
      expiresAt: c.expiresAt ? new Date(c.expiresAt) : undefined
    }));
  }

  async getLeaderboard(timeframe: LeaderboardType): Promise<{
    rank: number;
    total: number;
    topUsers: LeaderboardEntry[];
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

  // 대시보드 데이터 조회
  async getDashboard(): Promise<{ data: DashboardStats }> {
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}/api/gamification/dashboard`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard');
      }

      return response.json();
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      // 개발 환경에서는 모킹 데이터 반환
      return {
        data: {
          level: 1,
          levelName: '첫 발걸음',
          levelName_ko: '첫 발걸음',
          currentPoints: 0,
          totalPoints: 0,
          nextLevelPoints: 100,
          weeklyStreak: 0,
          totalExhibitions: 0,
          averageDuration: 0,
          mainTitle: '새로운 탐험가',
          recentAchievements: [],
          challenges: [],
          leaderboardRank: 0,
          friendsActivity: [],
          recentActivities: [],
          recentExhibitions: [],
          evaluationStats: {
            totalEvaluations: 0,
            averageRating: 0
          },
          stats: {
            totalVisits: 0,
            totalTime: 0,
            favoriteArtist: undefined
          }
        }
      };
    }
  }

  // 현재 세션 조회
  async getCurrentSession(): Promise<{ data: ExhibitionSession | null }> {
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}/api/gamification/session`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        return { data: null };
      }

      return response.json();
    } catch (error) {
      console.error('Session fetch error:', error);
      return { data: null };
    }
  }

  // 전시 시작
  async startExhibition(exhibitionId: string): Promise<{ data: ExhibitionSession }> {
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}/api/gamification/exhibitions/start`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ exhibitionId }),
      });

      if (!response.ok) {
        throw new Error('Failed to start exhibition');
      }

      return response.json();
    } catch (error) {
      console.error('Start exhibition error:', error);
      // 모킹 데이터 반환
      return {
        data: {
          id: 'mock-session',
          startTime: new Date(),
          duration: 0,
          pointsEarned: 0
        }
      };
    }
  }

  // 전시 종료
  async endExhibition(sessionId: string): Promise<{ data: { duration: number; pointsEarned: number } }> {
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}/api/gamification/exhibitions/end`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ sessionId }),
      });

      if (!response.ok) {
        throw new Error('Failed to end exhibition');
      }

      return response.json();
    } catch (error) {
      console.error('End exhibition error:', error);
      return {
        data: {
          duration: 30,
          pointsEarned: 50
        }
      };
    }
  }

  // 칭호 조회
  async getTitles(): Promise<{ data: Title[] }> {
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}/api/gamification/titles`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch titles');
      }

      return response.json();
    } catch (error) {
      console.error('Titles fetch error:', error);
      return { data: [] };
    }
  }

  // 메인 칭호 설정
  async setMainTitle(titleId: string): Promise<void> {
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}/api/gamification/titles/main`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ titleId }),
      });

      if (!response.ok) {
        throw new Error('Failed to set main title');
      }
    } catch (error) {
      console.error('Set main title error:', error);
    }
  }

  // 도전 과제 조회
  async getChallenges(status: string): Promise<{ data: Challenge[] }> {
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}/api/gamification/challenges?status=${status}`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch challenges');
      }

      return response.json();
    } catch (error) {
      console.error('Challenges fetch error:', error);
      return { data: [] };
    }
  }

  // 리더보드 조회
  async getLeaderboard(type: string): Promise<{ data: { leaderboard: LeaderboardEntry[]; userRank: number } }> {
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}/api/gamification/leaderboard?type=${type}`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }

      return response.json();
    } catch (error) {
      console.error('Leaderboard fetch error:', error);
      return { data: { leaderboard: [], userRank: 0 } };
    }
  }

  // 포인트 획득
  async earnPoints(activity: string, metadata?: any): Promise<{ data: { pointsEarned: number } }> {
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}/api/gamification/points`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ activity, metadata }),
      });

      if (!response.ok) {
        throw new Error('Failed to earn points');
      }

      return response.json();
    } catch (error) {
      console.error('Earn points error:', error);
      return { data: { pointsEarned: 0 } };
    }
  }

  // 공유 카드 생성
  async generateShareCard(type: string, data?: any): Promise<{ data: { imageUrl: string; shareData: any } }> {
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}/api/gamification/share-card`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ type, data }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate share card');
      }

      return response.json();
    } catch (error) {
      console.error('Generate share card error:', error);
      return { 
        data: { 
          imageUrl: '', 
          shareData: { title: '', description: '' } 
        } 
      };
    }
  }

  // 주간 진행도 조회
  async getWeeklyProgress(): Promise<{ data: any }> {
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}/api/gamification/weekly-progress`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch weekly progress');
      }

      return response.json();
    } catch (error) {
      console.error('Weekly progress fetch error:', error);
      return { data: null };
    }
  }

  // SSE 실시간 업데이트 구독 (개발용 모킹)
  subscribeToUpdates(callback: (update: any) => void): () => void {
    // 개발 환경에서는 실제 SSE 대신 모킹
    if (process.env.NODE_ENV === 'development') {
      return () => {}; // 빈 cleanup 함수 반환
    }

    // 프로덕션 환경에서는 실제 SSE 구현
    const eventSource = new EventSource(`${API_CONFIG.baseUrl}/api/gamification/updates`, {
      withCredentials: true,
    });

    eventSource.onmessage = (event) => {
      try {
        const update = JSON.parse(event.data);
        callback(update);
      } catch (error) {
        console.error('Failed to parse SSE update:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
    };

    // cleanup 함수 반환
    return () => {
      eventSource.close();
    };
  }

  // Additional methods for hooks
  async getUserStats(): Promise<UserStats> {
    const response = await fetch(`${API_CONFIG.baseUrl}/api/gamification/stats`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user stats');
    }

    return response.json();
  }

  async getDailyQuests(): Promise<DailyQuest[]> {
    const response = await fetch(`${API_CONFIG.baseUrl}/api/gamification/quests/daily`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch daily quests');
    }

    return response.json();
  }

  async earnXP(eventType: XPEventType, metadata?: any): Promise<XPResult> {
    const response = await fetch(`${API_CONFIG.baseUrl}/api/gamification/xp`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ eventType, metadata }),
    });

    if (!response.ok) {
      throw new Error('Failed to earn XP');
    }

    return response.json();
  }

  async getUserProfile(userId: string): Promise<UserStats> {
    const response = await fetch(`${API_CONFIG.baseUrl}/api/gamification/profile/${userId}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }

    return response.json();
  }

  async processDailyLogin(): Promise<{ data: XPResult }> {
    const response = await fetch(`${API_CONFIG.baseUrl}/api/gamification/daily-login`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to process daily login');
    }

    return response.json();
  }

  async recordArtworkView(artworkId: string): Promise<XPResult> {
    const response = await fetch(`${API_CONFIG.baseUrl}/api/gamification/artwork-view`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ artworkId }),
    });

    if (!response.ok) {
      throw new Error('Failed to record artwork view');
    }

    return response.json();
  }

  async recordQuizCompletion(quizId: string, score: number): Promise<XPResult> {
    const response = await fetch(`${API_CONFIG.baseUrl}/api/gamification/quiz-complete`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ quizId, score }),
    });

    if (!response.ok) {
      throw new Error('Failed to record quiz completion');
    }

    return response.json();
  }

  async recordFollowUser(followedUserId: string): Promise<XPResult> {
    const response = await fetch(`${API_CONFIG.baseUrl}/api/gamification/follow-user`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ followedUserId }),
    });

    if (!response.ok) {
      throw new Error('Failed to record follow user');
    }

    return response.json();
  }

  async recordArtworkShare(artworkId: string, platform: string): Promise<XPResult> {
    const response = await fetch(`${API_CONFIG.baseUrl}/api/gamification/share-artwork`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ artworkId, platform }),
    });

    if (!response.ok) {
      throw new Error('Failed to record artwork share');
    }

    return response.json();
  }

  async recordAIProfileCreation(): Promise<XPResult> {
    const response = await fetch(`${API_CONFIG.baseUrl}/api/gamification/ai-profile-create`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to record AI profile creation');
    }

    return response.json();
  }

  async recordExhibitionVisit(exhibitionId: string, duration: number): Promise<XPResult> {
    const response = await fetch(`${API_CONFIG.baseUrl}/api/gamification/exhibition-visit`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ exhibitionId, duration }),
    });

    if (!response.ok) {
      throw new Error('Failed to record exhibition visit');
    }

    return response.json();
  }

  async recordReviewWrite(exhibitionId: string, rating: number): Promise<XPResult> {
    const response = await fetch(`${API_CONFIG.baseUrl}/api/gamification/review-write`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ exhibitionId, rating }),
    });

    if (!response.ok) {
      throw new Error('Failed to record review write');
    }

    return response.json();
  }

  async initializeUser(userId: string): Promise<UserStats> {
    const response = await fetch(`${API_CONFIG.baseUrl}/api/gamification/initialize`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error('Failed to initialize user');
    }

    return response.json();
  }
}

export const gamificationAPI = new GamificationAPI();