// 🎨 SAYU Gamification Hook
// 게임화 시스템 상태 관리 및 API 통신

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { 
  UserPoints, 
  Achievement, 
  Mission, 
  PointActivityType,
  ExhibitionVisit 
} from '@/types/gamification';
import { calculateProgress } from '@/data/levels';
import { achievements } from '@/data/achievements';
import { createMissionFromTemplate, getDailyMissions, getWeeklyMissions } from '@/data/missions';

interface UseGamificationReturn {
  userPoints: UserPoints | null;
  loading: boolean;
  error: string | null;
  addPoints: (activity: PointActivityType, metadata?: any) => Promise<void>;
  checkAchievement: (achievementId: string) => Promise<void>;
  updateMissionProgress: (missionId: string, progress: number) => Promise<void>;
  recordExhibitionVisit: (visit: Omit<ExhibitionVisit, 'id' | 'pointsEarned'>) => Promise<void>;
  refreshData: () => Promise<void>;
  evaluationSummary?: any; // Mock evaluation summary for demo
}

export function useGamification(): UseGamificationReturn {
  const { data: session } = useSession();
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 사용자 포인트 데이터 가져오기
  const fetchUserPoints = useCallback(async () => {
    if (!session?.user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/gamification/points', {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user points');
      }

      const data = await response.json();
      
      // 없으면 초기화
      if (!data) {
        const initialData = await initializeUserPoints(session.user.id);
        setUserPoints(initialData);
      } else {
        setUserPoints(data);
      }
    } catch (err) {
      console.error('Error fetching user points:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [session]);

  // 초기 데이터 로드
  useEffect(() => {
    fetchUserPoints();
  }, [fetchUserPoints]);

  // 포인트 추가
  const addPoints = async (activity: PointActivityType, metadata?: any) => {
    if (!session?.user?.id) {
      toast.error('Please login to earn points');
      return;
    }

    try {
      const response = await fetch('/api/gamification/points/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.accessToken}`
        },
        body: JSON.stringify({
          activity,
          metadata
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add points');
      }

      const data = await response.json();
      
      // 포인트 추가 성공 토스트
      toast.success(`+${data.pointsEarned} points!`);
      
      // 레벨업 체크
      if (data.leveledUp) {
        toast.success(`🎉 Level ${data.newLevel} reached!`, {
          duration: 5000
        });
      }
      
      // 상태 업데이트
      await fetchUserPoints();
    } catch (err) {
      console.error('Error adding points:', err);
      toast.error('Failed to add points');
    }
  };

  // 업적 달성 체크
  const checkAchievement = async (achievementId: string) => {
    if (!session?.user?.id || !userPoints) return;

    // 이미 달성한 업적인지 확인
    if (userPoints.achievements.some(a => a.id === achievementId && a.unlockedAt)) {
      return;
    }

    try {
      const response = await fetch('/api/gamification/achievements/unlock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.accessToken}`
        },
        body: JSON.stringify({ achievementId })
      });

      if (!response.ok) {
        throw new Error('Failed to unlock achievement');
      }

      const achievement = achievements.find(a => a.id === achievementId);
      if (achievement) {
        toast.success(`🏆 Achievement unlocked: ${achievement.name}!`, {
          duration: 5000
        });
      }

      await fetchUserPoints();
    } catch (err) {
      console.error('Error unlocking achievement:', err);
    }
  };

  // 미션 진행도 업데이트
  const updateMissionProgress = async (missionId: string, progress: number) => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch('/api/gamification/missions/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.accessToken}`
        },
        body: JSON.stringify({ missionId, progress })
      });

      if (!response.ok) {
        throw new Error('Failed to update mission progress');
      }

      const data = await response.json();
      
      if (data.completed) {
        toast.success(`✅ Mission completed: +${data.pointsEarned} points!`);
      }

      await fetchUserPoints();
    } catch (err) {
      console.error('Error updating mission:', err);
    }
  };

  // 전시 방문 기록
  const recordExhibitionVisit = async (
    visit: Omit<ExhibitionVisit, 'id' | 'pointsEarned'>
  ) => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch('/api/gamification/exhibitions/visit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.accessToken}`
        },
        body: JSON.stringify(visit)
      });

      if (!response.ok) {
        throw new Error('Failed to record exhibition visit');
      }

      const data = await response.json();
      toast.success(`Exhibition visited: +${data.pointsEarned} points!`);

      await fetchUserPoints();
    } catch (err) {
      console.error('Error recording visit:', err);
      toast.error('Failed to record exhibition visit');
    }
  };

  // 데이터 새로고침
  const refreshData = async () => {
    await fetchUserPoints();
  };

  // Mock evaluation summary for demo
  const evaluationSummary = {
    userId: session?.user?.id || 'mock',
    personalityType: 'LAEF',
    averageRatings: {
      exhibitionEngagement: 4.5,
      communication: 4.2,
      paceMatching: 4.0,
      newPerspectives: 4.8,
      overallSatisfaction: 4.4
    },
    totalEvaluations: 12,
    wouldGoAgainPercentage: 83,
    chemistryStats: {
      'SRMC': { count: 3, averageRating: 4.5, wouldGoAgainCount: 3 },
      'LAMC': { count: 2, averageRating: 4.2, wouldGoAgainCount: 1 },
      'SAEF': { count: 4, averageRating: 4.6, wouldGoAgainCount: 4 }
    },
    receivedHighlights: [
      '예술에 대한 깊은 통찰력을 공유해줘서 좋았어요',
      '함께 있으면 전시가 더 재미있어요',
      '새로운 관점을 많이 배웠습니다'
    ],
    receivedImprovements: [
      '조금 더 천천히 관람하면 좋을 것 같아요',
      '다른 사람 의견도 더 들어주세요'
    ],
    earnedTitles: [{
      id: 'insight_provider',
      name: 'Insight Provider',
      name_ko: '인사이트 제공자',
      description: 'Consistently provides new perspectives',
      description_ko: '지속적으로 새로운 관점 제공',
      icon: '💡',
      requirement: 'Average rating > 4.5',
      earnedAt: new Date()
    }]
  };

  return {
    userPoints,
    loading,
    error,
    addPoints,
    checkAchievement,
    updateMissionProgress,
    recordExhibitionVisit,
    refreshData,
    evaluationSummary
  };
}

// 사용자 포인트 초기화 (신규 사용자)
async function initializeUserPoints(userId: string): Promise<UserPoints> {
  const dailyMissions = getDailyMissions().slice(0, 3).map(template => 
    createMissionFromTemplate(template, userId)
  );
  
  const weeklyMissions = getWeeklyMissions().slice(0, 2).map(template => 
    createMissionFromTemplate(template, userId)
  );

  return {
    userId,
    totalPoints: 0,
    level: 1,
    levelName: 'Art Curious',
    levelName_ko: '예술 입문자',
    nextLevelPoints: 100,
    achievements: [],
    missions: [...dailyMissions, ...weeklyMissions],
    exhibitionHistory: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };
}