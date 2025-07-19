// Evolution API Client

import { apiClient } from './api-client';
import type {
  EvolutionState,
  ActionResult,
  ActionContext,
  DailyCheckInResult,
  LeaderboardData,
  Milestone,
  EvolutionAnimation
} from '@/types/evolution';

export const evolutionApi = {
  // 사용자 진화 상태 조회
  async getEvolutionState(): Promise<EvolutionState> {
    const response = await apiClient.get('/evolution/state');
    return response.data;
  },

  // 행동 기록 (포인트 적립)
  async recordAction(action: string, context?: ActionContext): Promise<ActionResult> {
    const response = await apiClient.post('/evolution/action', {
      action,
      context
    });
    return response.data;
  },

  // 일일 체크인
  async dailyCheckIn(): Promise<DailyCheckInResult> {
    const response = await apiClient.post('/evolution/daily-checkin');
    return response.data;
  },

  // 리더보드 조회
  async getLeaderboard(aptType?: string, period: 'weekly' | 'monthly' = 'weekly'): Promise<LeaderboardData> {
    const params = new URLSearchParams();
    if (aptType) params.append('aptType', aptType);
    params.append('period', period);
    
    const response = await apiClient.get(`/evolution/leaderboard?${params.toString()}`);
    return response.data;
  },

  // 마일스톤 목록 조회
  async getMilestones(): Promise<{
    milestones: Milestone[];
    totalAchieved: number;
    totalAvailable: number;
  }> {
    const response = await apiClient.get('/evolution/milestones');
    return response.data;
  },

  // 진화 애니메이션 데이터
  async getEvolutionAnimation(fromStage: number, toStage: number): Promise<EvolutionAnimation> {
    const response = await apiClient.get('/evolution/animation', {
      params: { fromStage, toStage }
    });
    return response.data;
  },

  // 특정 행동 헬퍼 함수들
  async viewArtwork(
    artworkId: number,
    duration: number,
    metadata?: {
      style?: string;
      artist?: string;
      isNewStyle?: boolean;
      isNewArtist?: boolean;
    }
  ): Promise<ActionResult> {
    const response = await apiClient.post('/evolution/artwork/view', {
      artworkId,
      duration,
      ...metadata
    });
    return response.data;
  },

  async completeExhibition(
    exhibitionId: number,
    artworksViewed: number,
    totalDuration: number
  ): Promise<ActionResult> {
    const response = await apiClient.post('/evolution/exhibition/complete', {
      exhibitionId,
      artworksViewed,
      totalDuration
    });
    return response.data;
  },

  // 기타 행동들
  async likeArtwork(artworkId: number): Promise<ActionResult> {
    return this.recordAction('artwork_like', { targetId: artworkId, targetType: 'artwork' });
  },

  async saveArtwork(artworkId: number): Promise<ActionResult> {
    return this.recordAction('artwork_save', { targetId: artworkId, targetType: 'artwork' });
  },

  async shareArtwork(artworkId: number, platform: string): Promise<ActionResult> {
    return this.recordAction('artwork_share', { 
      targetId: artworkId, 
      targetType: 'artwork',
      sharedWith: platform 
    });
  },

  async followUser(userId: number): Promise<ActionResult> {
    return this.recordAction('follow_user', { targetId: userId, targetType: 'user' });
  },

  async createCollection(collectionName: string): Promise<ActionResult> {
    return this.recordAction('create_collection', { targetType: 'collection' });
  },

  async writeReview(targetId: number, targetType: 'artwork' | 'exhibition'): Promise<ActionResult> {
    return this.recordAction('write_review', { targetId, targetType });
  },

  async completeQuiz(quizId: number, isRetake: boolean = false): Promise<ActionResult> {
    return this.recordAction(isRetake ? 'quiz_retake' : 'quiz_complete', { 
      targetId: quizId, 
      targetType: 'quiz' 
    });
  }
};

// React Query hooks (optional)
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useEvolutionState() {
  return useQuery({
    queryKey: ['evolution', 'state'],
    queryFn: evolutionApi.getEvolutionState,
    staleTime: 5 * 60 * 1000, // 5분
  });
}

export function useRecordAction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ action, context }: { action: string; context?: ActionContext }) => 
      evolutionApi.recordAction(action, context),
    onSuccess: (data) => {
      // 진화 상태 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['evolution', 'state'] });
      
      // 진화했다면 추가 처리
      if (data.evolved) {
        queryClient.invalidateQueries({ queryKey: ['evolution', 'milestones'] });
      }
    },
  });
}

export function useDailyCheckIn() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: evolutionApi.dailyCheckIn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evolution', 'state'] });
    },
  });
}

export function useLeaderboard(aptType?: string, period: 'weekly' | 'monthly' = 'weekly') {
  return useQuery({
    queryKey: ['evolution', 'leaderboard', aptType, period],
    queryFn: () => evolutionApi.getLeaderboard(aptType, period),
    staleTime: 60 * 60 * 1000, // 1시간
  });
}

export function useMilestones() {
  return useQuery({
    queryKey: ['evolution', 'milestones'],
    queryFn: evolutionApi.getMilestones,
    staleTime: 10 * 60 * 1000, // 10분
  });
}