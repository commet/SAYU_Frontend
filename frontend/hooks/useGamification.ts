import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gamificationAPI } from '@/lib/gamification-api';
import type { 
  UserGamificationStats, 
  ExhibitionSession,
  Title,
  Challenge,
  LeaderboardEntry
} from '@/lib/gamification-api';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

// Query Keys
const QUERY_KEYS = {
  dashboard: ['gamification', 'dashboard'],
  titles: ['gamification', 'titles'],
  challenges: (status: string) => ['gamification', 'challenges', status],
  leaderboard: (type: string) => ['gamification', 'leaderboard', type],
  currentSession: ['gamification', 'currentSession'],
  userStats: (userId?: string) => ['gamification', 'stats', userId],
  weeklyProgress: ['gamification', 'weeklyProgress'],
  activities: ['gamification', 'activities']
};

// Hook: 대시보드 데이터
export function useGamificationDashboard() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.dashboard,
    queryFn: () => gamificationAPI.getDashboard(),
    staleTime: 30000, // 30초
    refetchInterval: 60000 // 1분마다 갱신
  });

  // SSE 구독 (프로덕션 환경에서만 활성화)
  useEffect(() => {
    // 개발 환경에서는 SSE 비활성화
    if (process.env.NODE_ENV === 'development') {
      return;
    }

    const unsubscribe = gamificationAPI.subscribeToUpdates((update) => {
      // 실시간 업데이트 처리
      if (update.type === 'pointsEarned') {
        queryClient.setQueryData(QUERY_KEYS.dashboard, (old: any) => ({
          ...old,
          data: {
            ...old?.data,
            currentPoints: old?.data?.currentPoints + update.points,
            totalPoints: old?.data?.totalPoints + update.points
          }
        }));
      } else if (update.type === 'levelUp') {
        // 레벨업 축하
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        toast.success(`🎉 레벨업! 이제 Lv.${update.newLevel}입니다!`);
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard });
      } else if (update.type === 'titleEarned') {
        toast.success(`🏆 새로운 칭호 획득: ${update.titleName}`);
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.titles });
      }
    });

    return unsubscribe;
  }, [queryClient]);

  return {
    dashboard: data?.data,
    isLoading,
    error
  };
}

// Hook: 전시 세션 관리
export function useExhibitionSession() {
  const queryClient = useQueryClient();
  const [elapsedTime, setElapsedTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 현재 세션 조회
  const { data: currentSession } = useQuery({
    queryKey: QUERY_KEYS.currentSession,
    queryFn: () => gamificationAPI.getCurrentSession(),
    refetchInterval: 10000 // 10초마다 확인
  });

  // 세션 시작
  const startSession = useMutation({
    mutationFn: gamificationAPI.startExhibition,
    onSuccess: (data) => {
      toast.success('전시 관람을 시작합니다! 🎨');
      queryClient.setQueryData(QUERY_KEYS.currentSession, data);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard });
      
      // 로컬 스토리지 백업
      localStorage.setItem('activeSession', JSON.stringify(data.data));
    },
    onError: () => {
      toast.error('관람 시작에 실패했습니다');
    }
  });

  // 세션 종료
  const endSession = useMutation({
    mutationFn: gamificationAPI.endExhibition,
    onSuccess: (data) => {
      const duration = data.data.duration;
      const points = data.data.pointsEarned;
      
      toast.success(`관람을 완료했습니다! 🎉\n관람 시간: ${duration}분\n+${points} 포인트 획득!`);
      
      queryClient.setQueryData(QUERY_KEYS.currentSession, null);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard });
      
      // 로컬 스토리지 정리
      localStorage.removeItem('activeSession');
    },
    onError: () => {
      toast.error('관람 종료 처리에 실패했습니다');
    }
  });

  // 타이머 업데이트
  useEffect(() => {
    if (currentSession?.data) {
      const startTime = new Date(currentSession.data.startTime).getTime();
      
      const updateElapsed = () => {
        setElapsedTime(Date.now() - startTime);
      };
      
      updateElapsed();
      intervalRef.current = setInterval(updateElapsed, 1000);
      
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    } else {
      setElapsedTime(0);
    }
  }, [currentSession]);

  // 앱 재시작 시 세션 복구
  useEffect(() => {
    const savedSession = localStorage.getItem('activeSession');
    if (savedSession && !currentSession?.data) {
      try {
        const session = JSON.parse(savedSession);
        queryClient.setQueryData(QUERY_KEYS.currentSession, { data: session });
      } catch (error) {
        localStorage.removeItem('activeSession');
      }
    }
  }, []);

  return {
    currentSession: currentSession?.data,
    isActive: !!currentSession?.data,
    elapsedTime,
    startSession: startSession.mutate,
    endSession: endSession.mutate,
    isStarting: startSession.isPending,
    isEnding: endSession.isPending
  };
}

// Hook: 칭호 관리
export function useTitles() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.titles,
    queryFn: () => gamificationAPI.getTitles()
  });

  const setMainTitle = useMutation({
    mutationFn: gamificationAPI.setMainTitle,
    onSuccess: (_, titleId) => {
      toast.success('메인 칭호가 변경되었습니다');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.titles });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard });
    },
    onError: () => {
      toast.error('칭호 변경에 실패했습니다');
    }
  });

  return {
    titles: data?.data as Title[],
    isLoading,
    setMainTitle: setMainTitle.mutate,
    isSettingTitle: setMainTitle.isPending
  };
}

// Hook: 도전 과제
export function useChallenges(status: 'active' | 'completed' | 'all' = 'active') {
  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.challenges(status),
    queryFn: () => gamificationAPI.getChallenges(status),
    staleTime: 60000 // 1분
  });

  return {
    challenges: data?.data as Challenge[],
    isLoading
  };
}

// Hook: 리더보드
export function useLeaderboard(type: 'weekly' | 'monthly' | 'all-time' = 'weekly') {
  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.leaderboard(type),
    queryFn: () => gamificationAPI.getLeaderboard(type),
    staleTime: 300000 // 5분
  });

  return {
    leaderboard: data?.data?.leaderboard as LeaderboardEntry[],
    userRank: data?.data?.userRank,
    isLoading
  };
}

// Hook: 포인트 획득
export function useEarnPoints() {
  const queryClient = useQueryClient();

  const earnPoints = useMutation({
    mutationFn: ({ activity, metadata }: { activity: string; metadata?: any }) =>
      gamificationAPI.earnPoints(activity, metadata),
    onSuccess: (data) => {
      const points = data.data.pointsEarned;
      
      // 포인트 획득 애니메이션
      if (points > 0) {
        toast.success(`+${points} 포인트 획득!`, {
          icon: '✨',
          duration: 2000
        });
      }
      
      // 캐시 업데이트
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activities });
    }
  });

  return {
    earnPoints: earnPoints.mutate,
    isEarning: earnPoints.isPending
  };
}

// Hook: 공유 카드 생성
export function useShareCard() {
  const [shareData, setShareData] = useState<{
    imageUrl: string;
    shareData: any;
  } | null>(null);

  const generateCard = useMutation({
    mutationFn: ({ type, data }: { type: 'monthly' | 'achievement' | 'level-up'; data?: any }) =>
      gamificationAPI.generateShareCard(type, data),
    onSuccess: (data) => {
      setShareData(data.data);
    },
    onError: () => {
      toast.error('공유 카드 생성에 실패했습니다');
    }
  });

  const share = useCallback(async () => {
    if (!shareData) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareData.shareData.title,
          text: shareData.shareData.description,
          url: shareData.imageUrl
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // 클립보드에 복사
      navigator.clipboard.writeText(shareData.imageUrl);
      toast.success('링크가 복사되었습니다');
    }
  }, [shareData]);

  return {
    generateCard: generateCard.mutate,
    isGenerating: generateCard.isPending,
    shareData,
    share
  };
}

// Hook: 주간 진행도
export function useWeeklyProgress() {
  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.weeklyProgress,
    queryFn: () => gamificationAPI.getWeeklyProgress(),
    staleTime: 3600000 // 1시간
  });

  return {
    weeklyProgress: data?.data,
    isLoading
  };
}

// Utility: 시간 포맷팅
export function formatDuration(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}시간 ${minutes}분`;
  } else if (minutes > 0) {
    return `${minutes}분 ${seconds}초`;
  } else {
    return `${seconds}초`;
  }
}

// Utility: 레벨 정보 가져오기
export function getLevelInfo(level: number) {
  if (level <= 10) return { name: '첫 발걸음', icon: '🌱', color: '#E8E8E8' };
  if (level <= 25) return { name: '호기심 가득', icon: '👀', color: '#A8D8EA' };
  if (level <= 50) return { name: '눈뜨는 중', icon: '✨', color: '#AA96DA' };
  if (level <= 75) return { name: '감성 충만', icon: '🌸', color: '#FCBAD3' };
  return { name: '예술혼', icon: '🎨', color: '#FFFFD2' };
}

// Additional hooks for compatibility
export function useUserStats(userId?: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.userStats(userId),
    queryFn: ({ queryKey }) => {
      const id = queryKey[2] as string | undefined;
      return gamificationAPI.getUserStats(id);
    },
    staleTime: 60000 // 1분
  });

  return {
    stats: data?.data,
    isLoading,
    error
  };
}

export function useDailyQuests() {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.challenges('daily'),
    queryFn: () => gamificationAPI.getChallenges('available'),
    staleTime: 300000 // 5분
  });

  return {
    quests: data?.data?.filter((c: Challenge) => c.type === 'daily') || [],
    isLoading,
    error
  };
}

export function useDailyLogin() {
  const queryClient = useQueryClient();
  
  const checkIn = useMutation({
    mutationFn: () => gamificationAPI.dailyCheckIn(),
    onSuccess: (response) => {
      if (response.success) {
        toast.success(`출석 체크 완료! +${response.data.xpGained} XP`);
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard });
      }
    },
    onError: () => {
      toast.error('이미 오늘 출석 체크를 하셨습니다');
    }
  });

  return {
    checkIn: checkIn.mutate,
    isCheckingIn: checkIn.isPending
  };
}

// Default export for backward compatibility
export { useGamificationDashboard as useGamification };