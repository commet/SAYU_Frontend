import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { gamificationV2API, UserGameStats, PointResult, WeeklyProgress, LeaderboardEntry } from '@/lib/gamification-v2-api';

export function useGamificationV2() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserGameStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 사용자 통계 조회
  const fetchStats = useCallback(async () => {
    if (!user?.auth?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const userStats = await gamificationV2API.getUserStats();
      setStats(userStats);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch user stats:', err);
      setError(err.message || 'Failed to load game stats');
      
      // 개발 환경에서만 mock 데이터 사용 (실제 에러 확인용)
      if (process.env.NODE_ENV === 'development') {
        console.warn('API Error - NOT using mock data to debug issue:', err);
        // Mock 데이터를 사용하지 않고 null로 설정하여 실제 문제를 확인
        setStats(null);
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // 포인트 추가 헬퍼 함수들
  const handleDailyLogin = async (): Promise<PointResult> => {
    try {
      const result = await gamificationV2API.dailyLogin();
      if (result.success) {
        await fetchStats(); // 통계 새로고침
      }
      return result;
    } catch (err) {
      console.error('Failed to process daily login:', err);
      return { success: false, message: 'Failed to process daily login' };
    }
  };

  const handleAptTestComplete = async (): Promise<PointResult> => {
    try {
      const result = await gamificationV2API.aptTestComplete();
      if (result.success) {
        await fetchStats();
      }
      return result;
    } catch (err) {
      console.error('Failed to process APT test:', err);
      return { success: false, message: 'Failed to process APT test' };
    }
  };

  const handleAiProfileCreate = async (): Promise<PointResult> => {
    try {
      const result = await gamificationV2API.aiProfileCreate();
      if (result.success) {
        await fetchStats();
      }
      return result;
    } catch (err) {
      console.error('Failed to process AI profile creation:', err);
      return { success: false, message: 'Failed to process AI profile creation' };
    }
  };

  const handleProfileComplete = async (): Promise<PointResult> => {
    try {
      const result = await gamificationV2API.profileComplete();
      if (result.success) {
        await fetchStats();
      }
      return result;
    } catch (err) {
      console.error('Failed to process profile completion:', err);
      return { success: false, message: 'Failed to process profile completion' };
    }
  };

  const handleLikeArtwork = async (artworkId: string): Promise<PointResult> => {
    try {
      const result = await gamificationV2API.likeArtwork(artworkId);
      if (result.success) {
        await fetchStats();
      }
      return result;
    } catch (err) {
      console.error('Failed to process artwork like:', err);
      return { success: false, message: 'Failed to process artwork like' };
    }
  };

  const handleSaveArtwork = async (artworkId: string): Promise<PointResult> => {
    try {
      const result = await gamificationV2API.saveArtwork(artworkId);
      if (result.success) {
        await fetchStats();
      }
      return result;
    } catch (err) {
      console.error('Failed to process artwork save:', err);
      return { success: false, message: 'Failed to process artwork save' };
    }
  };

  const handleCreateExhibitionRecord = async (exhibitionId: string): Promise<PointResult> => {
    try {
      const result = await gamificationV2API.createExhibitionRecord(exhibitionId);
      if (result.success) {
        await fetchStats();
      }
      return result;
    } catch (err) {
      console.error('Failed to process exhibition record:', err);
      return { success: false, message: 'Failed to process exhibition record' };
    }
  };

  const handleWriteDetailedReview = async (reviewId: string, reviewLength: number): Promise<PointResult> => {
    try {
      const result = await gamificationV2API.writeDetailedReview(reviewId, reviewLength);
      if (result.success) {
        await fetchStats();
      }
      return result;
    } catch (err) {
      console.error('Failed to process review:', err);
      return { success: false, message: 'Failed to process review' };
    }
  };

  const handleRateExhibition = async (exhibitionId: string, rating: number): Promise<PointResult> => {
    try {
      const result = await gamificationV2API.rateExhibition(exhibitionId, rating);
      if (result.success) {
        await fetchStats();
      }
      return result;
    } catch (err) {
      console.error('Failed to process exhibition rating:', err);
      return { success: false, message: 'Failed to process exhibition rating' };
    }
  };

  const handleFollowUser = async (followedUserId: string): Promise<PointResult> => {
    try {
      const result = await gamificationV2API.followUser(followedUserId);
      if (result.success) {
        await fetchStats();
      }
      return result;
    } catch (err) {
      console.error('Failed to process user follow:', err);
      return { success: false, message: 'Failed to process user follow' };
    }
  };

  const handleShareProfile = async (): Promise<PointResult> => {
    try {
      const result = await gamificationV2API.shareProfile();
      if (result.success) {
        await fetchStats();
      }
      return result;
    } catch (err) {
      console.error('Failed to process profile share:', err);
      return { success: false, message: 'Failed to process profile share' };
    }
  };

  // 주간 진행도 조회
  const getWeeklyProgress = async (): Promise<WeeklyProgress | null> => {
    try {
      return await gamificationV2API.getWeeklyProgress();
    } catch (err) {
      console.error('Failed to fetch weekly progress:', err);
      return null;
    }
  };

  // 리더보드 조회
  const getLeaderboard = async (type: 'weekly' | 'monthly' | 'all-time' = 'weekly'): Promise<LeaderboardEntry[]> => {
    try {
      return await gamificationV2API.getLeaderboard(type);
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
      return [];
    }
  };

  return {
    stats,
    loading,
    error,
    refreshStats: fetchStats,
    
    // 포인트 획득 함수들
    handleDailyLogin,
    handleAptTestComplete,
    handleAiProfileCreate,
    handleProfileComplete,
    handleLikeArtwork,
    handleSaveArtwork,
    handleCreateExhibitionRecord,
    handleWriteDetailedReview,
    handleRateExhibition,
    handleFollowUser,
    handleShareProfile,
    
    // 조회 함수들
    getWeeklyProgress,
    getLeaderboard,
  };
}

export default useGamificationV2;