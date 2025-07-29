import type { 
  UserStats, 
  DailyQuest, 
  XPEventType, 
  XPResult, 
  LeaderboardEntry, 
  LeaderboardType,
  GamificationApiResponse 
} from '@/types/gamification';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// API 헬퍼 함수
async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<GamificationApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/gamification${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API request failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Gamification API error:', error);
    return {
      success: false,
      data: undefined as any,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// 사용자 통계 가져오기
export async function getUserStats(): Promise<UserStats | null> {
  const result = await fetchAPI<UserStats>('/stats');
  return result.success ? result.data || null : null;
}

// 일일 퀘스트 가져오기
export async function getDailyQuests(): Promise<DailyQuest[]> {
  const result = await fetchAPI<DailyQuest[]>('/quests/daily');
  return result.success ? result.data || [] : [];
}

// XP 획득
export async function earnXP(
  eventType: XPEventType,
  metadata?: Record<string, any>
): Promise<XPResult | null> {
  const result = await fetchAPI<XPResult>('/earn-xp', {
    method: 'POST',
    body: JSON.stringify({ eventType, metadata }),
  });
  return result.success ? result.data || null : null;
}

// 리더보드 가져오기
export async function getLeaderboard(
  type: LeaderboardType = 'weekly',
  limit: number = 100
): Promise<{ type: string; leaderboard: LeaderboardEntry[] }> {
  const result = await fetchAPI<{ type: string; leaderboard: LeaderboardEntry[] }>(
    `/leaderboard?type=${type}&limit=${limit}`
  );
  return result.success 
    ? result.data || { type, leaderboard: [] } 
    : { type, leaderboard: [] };
}

// 특정 사용자 프로필 가져오기
export async function getUserProfile(userId: number): Promise<UserStats | null> {
  const result = await fetchAPI<UserStats>(`/profile/${userId}`);
  return result.success ? result.data || null : null;
}

// 일일 로그인 처리
export async function processDailyLogin(): Promise<{
  alreadyCompleted?: boolean;
  message: string;
} & Partial<XPResult>> {
  const result = await fetchAPI<any>('/daily-login', {
    method: 'POST',
  });
  return result.success ? result.data : { message: 'Failed to process login' };
}

// 작품 감상 기록
export async function recordArtworkView(artworkId: string): Promise<XPResult | null> {
  const result = await fetchAPI<XPResult>('/view-artwork', {
    method: 'POST',
    body: JSON.stringify({ artworkId }),
  });
  return result.success ? result.data || null : null;
}

// 퀴즈 완료 기록
export async function recordQuizCompletion(
  quizType: string,
  score?: number
): Promise<XPResult | null> {
  const result = await fetchAPI<XPResult>('/complete-quiz', {
    method: 'POST',
    body: JSON.stringify({ quizType, score }),
  });
  return result.success ? result.data || null : null;
}

// 팔로우 기록
export async function recordFollowUser(targetUserId: number): Promise<XPResult | null> {
  const result = await fetchAPI<XPResult>('/follow-user', {
    method: 'POST',
    body: JSON.stringify({ targetUserId }),
  });
  return result.success ? result.data || null : null;
}

// 작품 공유 기록
export async function recordArtworkShare(
  artworkId: string,
  platform: 'twitter' | 'facebook' | 'instagram' | 'kakao'
): Promise<XPResult | null> {
  const result = await fetchAPI<XPResult>('/share-artwork', {
    method: 'POST',
    body: JSON.stringify({ artworkId, platform }),
  });
  return result.success ? result.data || null : null;
}

// AI 프로필 생성 기록
export async function recordAIProfileCreation(): Promise<XPResult | null> {
  const result = await fetchAPI<XPResult>('/create-ai-profile', {
    method: 'POST',
  });
  return result.success ? result.data || null : null;
}

// 전시 방문 기록
export async function recordExhibitionVisit(
  exhibitionId: string,
  exhibitionName: string
): Promise<XPResult | null> {
  const result = await fetchAPI<XPResult>('/visit-exhibition', {
    method: 'POST',
    body: JSON.stringify({ exhibitionId, exhibitionName }),
  });
  return result.success ? result.data || null : null;
}

// 리뷰 작성 기록
export async function recordReviewWrite(
  targetId: string,
  targetType: 'artwork' | 'exhibition' | 'artist',
  reviewLength?: number
): Promise<XPResult | null> {
  const result = await fetchAPI<XPResult>('/write-review', {
    method: 'POST',
    body: JSON.stringify({ targetId, targetType, reviewLength }),
  });
  return result.success ? result.data || null : null;
}

// 사용자 초기화
export async function initializeUser(): Promise<boolean> {
  const result = await fetchAPI<{ message: string }>('/initialize', {
    method: 'POST',
  });
  return result.success;
}