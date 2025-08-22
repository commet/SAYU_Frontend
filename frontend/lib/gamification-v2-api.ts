import { createClient } from './supabase/client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3007';

export interface UserGameProfile {
  id: string;
  user_id: string;
  level: number;
  current_exp: number;
  total_points: number;
  created_at: string;
  updated_at: string;
}

export interface UserGameStats extends UserGameProfile {
  level_title_ko?: string;
  level_title_en?: string;
  nextLevelExp: number;
  levelProgress: number;
  todayActivities: DailyActivity[];
  recentTransactions: PointTransaction[];
  followerCount: number;
  followingCount: number;
}

export interface PointTransaction {
  id: string;
  user_id: string;
  action_type: string;
  points: number;
  description?: string;
  metadata?: any;
  created_at: string;
}

export interface DailyActivity {
  id: string;
  user_id: string;
  activity_type: string;
  activity_date: string;
  count: number;
  points_earned: number;
}

export interface PointResult {
  success: boolean;
  pointsAdded?: number;
  newTotalPoints?: number;
  newLevel?: number;
  leveledUp?: boolean;
  message: string;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  level: number;
  total_points: number;
  periodPoints?: number;
  auth?: {
    email: string;
    raw_user_meta_data?: {
      nickname?: string;
      avatar_url?: string;
    };
  };
}

export interface WeeklyProgress {
  daily: Array<{
    date: string;
    points: number;
    dayName: string;
  }>;
  totalPoints: number;
  activeDays: number;
  weeklyGoal: number;
  goalProgress: number;
}

export interface DailyLimitInfo {
  canEarn: boolean;
  remaining: number | null;
  currentCount?: number;
}

class GamificationV2API {
  private async getAuthHeaders(): Promise<HeadersInit> {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // 사용자 게임 프로필 및 통계 조회
  async getUserStats(): Promise<UserGameStats> {
    const response = await fetch(`${API_URL}/api/gamification-v2/profile`, {
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user stats');
    }

    const result = await response.json();
    return result.data;
  }

  // 포인트 추가 (범용)
  async addPoints(actionType: string, metadata?: any): Promise<PointResult> {
    const response = await fetch(`${API_URL}/api/gamification-v2/points/add`, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify({ actionType, metadata }),
    });

    if (!response.ok) {
      throw new Error('Failed to add points');
    }

    return response.json();
  }

  // 일일 로그인
  async dailyLogin(): Promise<PointResult> {
    const response = await fetch(`${API_URL}/api/gamification-v2/daily-login`, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to process daily login');
    }

    return response.json();
  }

  // APT 테스트 완료
  async aptTestComplete(): Promise<PointResult> {
    const response = await fetch(`${API_URL}/api/gamification-v2/apt-test-complete`, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to process APT test completion');
    }

    return response.json();
  }

  // AI 프로필 생성
  async aiProfileCreate(): Promise<PointResult> {
    const response = await fetch(`${API_URL}/api/gamification-v2/ai-profile-create`, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to process AI profile creation');
    }

    return response.json();
  }

  // 프로필 완성
  async profileComplete(): Promise<PointResult> {
    const response = await fetch(`${API_URL}/api/gamification-v2/profile-complete`, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to process profile completion');
    }

    return response.json();
  }

  // 작품 좋아요
  async likeArtwork(artworkId: string): Promise<PointResult> {
    const response = await fetch(`${API_URL}/api/gamification-v2/like-artwork`, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify({ artworkId }),
    });

    if (!response.ok) {
      throw new Error('Failed to process artwork like');
    }

    return response.json();
  }

  // 작품 저장
  async saveArtwork(artworkId: string): Promise<PointResult> {
    const response = await fetch(`${API_URL}/api/gamification-v2/save-artwork`, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify({ artworkId }),
    });

    if (!response.ok) {
      throw new Error('Failed to process artwork save');
    }

    return response.json();
  }

  // 전시 기록 작성
  async createExhibitionRecord(exhibitionId: string): Promise<PointResult> {
    const response = await fetch(`${API_URL}/api/gamification-v2/exhibition-record`, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify({ exhibitionId }),
    });

    if (!response.ok) {
      throw new Error('Failed to process exhibition record');
    }

    return response.json();
  }

  // 상세 리뷰 작성
  async writeDetailedReview(reviewId: string, reviewLength: number): Promise<PointResult> {
    const response = await fetch(`${API_URL}/api/gamification-v2/detailed-review`, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify({ reviewId, reviewLength }),
    });

    if (!response.ok) {
      throw new Error('Failed to process detailed review');
    }

    return response.json();
  }

  // 전시 사진 업로드
  async uploadExhibitionPhoto(photoId: string): Promise<PointResult> {
    const response = await fetch(`${API_URL}/api/gamification-v2/upload-photo`, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify({ photoId }),
    });

    if (!response.ok) {
      throw new Error('Failed to process photo upload');
    }

    return response.json();
  }

  // 전시 평가
  async rateExhibition(exhibitionId: string, rating: number): Promise<PointResult> {
    const response = await fetch(`${API_URL}/api/gamification-v2/rate-exhibition`, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify({ exhibitionId, rating }),
    });

    if (!response.ok) {
      throw new Error('Failed to process exhibition rating');
    }

    return response.json();
  }

  // 사용자 팔로우
  async followUser(followedUserId: string): Promise<PointResult> {
    const response = await fetch(`${API_URL}/api/gamification-v2/follow-user`, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify({ followedUserId }),
    });

    if (!response.ok) {
      throw new Error('Failed to process user follow');
    }

    return response.json();
  }

  // 프로필 공유
  async shareProfile(): Promise<PointResult> {
    const response = await fetch(`${API_URL}/api/gamification-v2/share-profile`, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to process profile share');
    }

    return response.json();
  }

  // 리더보드 조회
  async getLeaderboard(type: 'weekly' | 'monthly' | 'all-time' = 'weekly', limit = 50): Promise<LeaderboardEntry[]> {
    const response = await fetch(`${API_URL}/api/gamification-v2/leaderboard?type=${type}&limit=${limit}`, {
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch leaderboard');
    }

    const result = await response.json();
    return result.data;
  }

  // 포인트 히스토리 조회
  async getPointHistory(limit = 20): Promise<PointTransaction[]> {
    const response = await fetch(`${API_URL}/api/gamification-v2/point-history?limit=${limit}`, {
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch point history');
    }

    const result = await response.json();
    return result.data;
  }

  // 주간 진행도 조회
  async getWeeklyProgress(): Promise<WeeklyProgress> {
    const response = await fetch(`${API_URL}/api/gamification-v2/weekly-progress`, {
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch weekly progress');
    }

    const result = await response.json();
    return result.data;
  }

  // 일일 활동 제한 확인
  async checkDailyLimit(activityType: string): Promise<DailyLimitInfo> {
    const response = await fetch(`${API_URL}/api/gamification-v2/daily-limit/${activityType}`, {
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to check daily limit');
    }

    const result = await response.json();
    return result.data;
  }

  // 모든 레벨 정보 조회
  async getAllLevels(): Promise<any[]> {
    const response = await fetch(`${API_URL}/api/gamification-v2/levels`, {
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch levels');
    }

    const result = await response.json();
    return result.data;
  }

  // 포인트 규칙 조회
  async getPointRules(): Promise<any[]> {
    const response = await fetch(`${API_URL}/api/gamification-v2/point-rules`, {
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch point rules');
    }

    const result = await response.json();
    return result.data;
  }
}

// 싱글톤 인스턴스
export const gamificationV2API = new GamificationV2API();
export default gamificationV2API;