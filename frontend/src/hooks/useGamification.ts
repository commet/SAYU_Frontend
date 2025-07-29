import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as gamificationApi from '@/lib/gamification-api';
import type { XPEventType, LeaderboardType } from '@/types/gamification';

// 쿼리 키
const QUERY_KEYS = {
  userStats: ['gamification', 'userStats'],
  dailyQuests: ['gamification', 'dailyQuests'],
  leaderboard: (type: LeaderboardType) => ['gamification', 'leaderboard', type],
  userProfile: (userId: number) => ['gamification', 'userProfile', userId],
};

// 사용자 통계 훅
export function useUserStats() {
  return useQuery({
    queryKey: QUERY_KEYS.userStats,
    queryFn: gamificationApi.getUserStats,
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });
}

// 일일 퀘스트 훅
export function useDailyQuests() {
  return useQuery({
    queryKey: QUERY_KEYS.dailyQuests,
    queryFn: gamificationApi.getDailyQuests,
    staleTime: 60 * 60 * 1000, // 1시간
    gcTime: 2 * 60 * 60 * 1000, // 2시간
  });
}

// 리더보드 훅
export function useLeaderboard(type: LeaderboardType = 'weekly', limit: number = 100) {
  return useQuery({
    queryKey: QUERY_KEYS.leaderboard(type),
    queryFn: () => gamificationApi.getLeaderboard(type, limit),
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });
}

// 사용자 프로필 훅
export function useUserProfile(userId: number) {
  return useQuery({
    queryKey: QUERY_KEYS.userProfile(userId),
    queryFn: () => gamificationApi.getUserProfile(userId),
    staleTime: 10 * 60 * 1000, // 10분
    gcTime: 30 * 60 * 1000, // 30분
    enabled: !!userId,
  });
}

// XP 획득 훅
export function useEarnXP() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventType, metadata }: { 
      eventType: XPEventType; 
      metadata?: Record<string, any> 
    }) => gamificationApi.earnXP(eventType, metadata),
    onSuccess: (data) => {
      if (data) {
        // 사용자 통계 업데이트
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userStats });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dailyQuests });

        // 레벨업 시 특별 알림
        if (data.leveledUp && data.level) {
          toast.success(`🎉 레벨업! ${data.level.name}에 도달했습니다!`, {
            duration: 5000,
            position: 'top-center',
          });
        } else {
          toast.success(`+${data.xpGained} XP 획득!`, {
            duration: 2000,
            position: 'bottom-right',
          });
        }
      }
    },
    onError: (error) => {
      toast.error('XP 획득에 실패했습니다.');
      console.error('XP earn error:', error);
    },
  });
}

// 일일 로그인 훅
export function useDailyLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: gamificationApi.processDailyLogin,
    onSuccess: (data) => {
      if (data.alreadyCompleted) {
        toast(data.message || '오늘은 이미 로그인 보상을 받았습니다.', {
          icon: '✅',
        });
      } else {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userStats });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dailyQuests });
        toast.success(data.message || '일일 로그인 보상을 받았습니다!');
      }
    },
    onError: (error) => {
      toast.error('로그인 처리에 실패했습니다.');
      console.error('Daily login error:', error);
    },
  });
}

// 작품 감상 훅
export function useRecordArtworkView() {
  const earnXP = useEarnXP();

  return useMutation({
    mutationFn: (artworkId: string) => gamificationApi.recordArtworkView(artworkId),
    onSuccess: (data, variables) => {
      if (data) {
        earnXP.mutate({ 
          eventType: 'VIEW_ARTWORK' as XPEventType, 
          metadata: { artworkId: variables } 
        });
      }
    },
  });
}

// 퀴즈 완료 훅
export function useRecordQuizCompletion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ quizType, score }: { quizType: string; score?: number }) => 
      gamificationApi.recordQuizCompletion(quizType, score),
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userStats });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dailyQuests });
        toast.success('퀴즈 완료! XP를 획득했습니다.');
      }
    },
    onError: (error) => {
      toast.error('퀴즈 기록에 실패했습니다.');
      console.error('Quiz completion error:', error);
    },
  });
}

// 팔로우 훅
export function useRecordFollow() {
  const earnXP = useEarnXP();

  return useMutation({
    mutationFn: (targetUserId: number) => gamificationApi.recordFollowUser(targetUserId),
    onSuccess: (data, variables) => {
      if (data) {
        earnXP.mutate({ 
          eventType: 'FOLLOW_USER' as XPEventType, 
          metadata: { targetUserId: variables } 
        });
      }
    },
  });
}

// 작품 공유 훅
export function useRecordShare() {
  const earnXP = useEarnXP();

  return useMutation({
    mutationFn: ({ artworkId, platform }: { 
      artworkId: string; 
      platform: 'twitter' | 'facebook' | 'instagram' | 'kakao' 
    }) => gamificationApi.recordArtworkShare(artworkId, platform),
    onSuccess: (data) => {
      if (data) {
        earnXP.mutate({ 
          eventType: 'SHARE_ARTWORK' as XPEventType, 
          metadata: { artworkId: data.xpGained } 
        });
        toast.success('공유 완료! XP를 획득했습니다.');
      }
    },
  });
}

// AI 프로필 생성 훅
export function useRecordAIProfileCreation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: gamificationApi.recordAIProfileCreation,
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userStats });
        toast.success('AI 프로필 생성! 특별 XP를 획득했습니다.');
      }
    },
  });
}

// 전시 방문 훅
export function useRecordExhibitionVisit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ exhibitionId, exhibitionName }: { 
      exhibitionId: string; 
      exhibitionName: string 
    }) => gamificationApi.recordExhibitionVisit(exhibitionId, exhibitionName),
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userStats });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dailyQuests });
        toast.success('전시 방문! XP를 획득했습니다.');
      }
    },
  });
}

// 리뷰 작성 훅
export function useRecordReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ targetId, targetType, reviewLength }: { 
      targetId: string; 
      targetType: 'artwork' | 'exhibition' | 'artist';
      reviewLength?: number;
    }) => gamificationApi.recordReviewWrite(targetId, targetType, reviewLength),
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userStats });
        toast.success('리뷰 작성! XP를 획득했습니다.');
      }
    },
  });
}

// 사용자 초기화 훅
export function useInitializeUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: gamificationApi.initializeUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userStats });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dailyQuests });
    },
  });
}

