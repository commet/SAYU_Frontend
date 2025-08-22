'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { APTTypeKey } from '@/types/artist-apt';
import toast from 'react-hot-toast';

// 7일 온보딩 여정 타입 정의
interface DailyTask {
  id: string;
  title: string;
  description: string;
  action: string;
  route?: string;
  completed: boolean;
  reward?: string;
}

interface DailyJourney {
  day: number;
  title: string;
  morningNudge: string;
  mainTask: DailyTask;
  bonusTasks?: DailyTask[];
  eveningReflection?: string;
  unlocks: string[];
  completed: boolean;
  viewedAt?: Date;
  completedAt?: Date;
}

interface OnboardingProgress {
  currentDay: number;
  startedAt: Date;
  lastActiveAt: Date;
  completedDays: number[];
  unlockedDays: number; // Day 해금 상태 추가
  
  // 핵심 마일스톤
  hasCompletedQuiz: boolean;
  hasViewedGallery: boolean;
  hasExploredExhibitions: boolean;
  hasUsedArtPulse: boolean;
  hasConnectedCommunity: boolean;
  hasViewedProfile: boolean;
  hasEarnedFirstBadge: boolean;
  
  // 추가 지표
  totalArtworksViewed: number;
  totalArtworksLiked: number;
  totalArtworksSaved: number;
  totalExhibitionsViewed: number;
  communityConnectionsMade: number;
  
  // 사용자 APT 타입
  userAPTType?: APTTypeKey;
  userAPTAnimal?: string;
  userAPTTitle?: string;
  userAPTColor?: string;
}

interface OnboardingContextType {
  // 상태
  isNewUser: boolean;
  showWelcomeModal: boolean;
  currentJourney: DailyJourney | null;
  progress: OnboardingProgress;
  allJourneys: DailyJourney[];
  
  // 액션
  setShowWelcomeModal: (show: boolean) => void;
  completeTask: (taskId: string) => void;
  markDayComplete: (day: number) => void;
  skipToDay: (day: number) => void;
  updateProgress: (updates: Partial<OnboardingProgress>) => void;
  getTodayNudge: () => DailyJourney | null;
  resetOnboarding: () => void;
  
  // 유틸리티
  isOnboardingComplete: boolean;
  getDaysRemaining: () => number;
  getCompletionPercentage: () => number;
}

const OnboardingContextV2 = createContext<OnboardingContextType | null>(null);

// 7일 여정 정의
const createJourneyPlan = (aptType?: APTTypeKey): DailyJourney[] => {
  const aptInfo = aptType ? {
    animal: require('@/types/artist-apt').APT_TYPES[aptType].animal,
    title: require('@/types/artist-apt').APT_TYPES[aptType].title,
    color: require('@/types/artist-apt').APT_TYPES[aptType].color,
  } : null;

  return [
    // Day 0: 가입 직후
    {
      day: 0,
      title: "SAYU에 오신 것을 환영합니다",
      morningNudge: "🎨 예술과 함께하는 특별한 여정이 시작됩니다",
      mainTask: {
        id: 'welcome-tour',
        title: '환영 투어 시작',
        description: 'SAYU의 핵심 가치를 알아보세요',
        action: '시작하기',
        completed: false,
        reward: '첫 방문 뱃지'
      },
      unlocks: ['환영 뱃지'],
      completed: false
    },
    
    // Day 1: AI 아트 프로필
    {
      day: 1,
      title: "AI가 그려주는 나만의 예술 아바타",
      morningNudge: "✨ AI가 당신만의 독특한 아트 프로필을 만들어드립니다",
      mainTask: {
        id: 'create-art-profile',
        title: 'AI 아트 프로필 생성',
        description: '당신의 APT 성격을 반영한 독특한 AI 아트를 만들어보세요',
        action: '프로필 생성',
        route: '/profile/art-profile',
        completed: false,
        reward: `AI 아트 프로필 + SNS 공유 기능`
      },
      bonusTasks: [
        {
          id: 'share-art-profile',
          title: 'AI 아트 프로필 공유',
          description: 'SNS에 나만의 아트 프로필을 공유하고 친구들을 초대하세요',
          action: '공유하기',
          route: '/profile/art-profile',
          completed: false,
          reward: '바이럴 크리에이터 뱃지'
        }
      ],
      eveningReflection: aptType ? 
        `${aptInfo?.animal} 스타일의 AI 아트가 마음에 드시나요?` : 
        'AI가 그려준 당신의 모습은 어떤가요?',
      unlocks: ['AI 아트 프로필', 'SNS 공유 기능', '프로필 커스터마이징'],
      completed: false
    },
    
    // Day 2: 첫 만남
    {
      day: 2,
      title: "당신을 위한 12개의 작품",
      morningNudge: "🖼️ AI가 선별한 당신만의 작품들이 기다립니다",
      mainTask: {
        id: 'explore-gallery',
        title: '갤러리 탐험',
        description: '최소 3개 작품을 자세히 감상하세요',
        action: '갤러리 열기',
        route: '/gallery',
        completed: false,
        reward: 'Art Explorer 뱃지'
      },
      bonusTasks: [
        {
          id: 'like-artwork',
          title: '첫 좋아요',
          description: '마음에 드는 작품에 하트를 눌러보세요',
          action: '좋아요 누르기',
          completed: false,
          reward: '첫 하트 뱃지'
        },
        {
          id: 'save-artwork',
          title: '첫 컬렉션',
          description: '특별한 작품을 저장하세요',
          action: '저장하기',
          completed: false,
          reward: 'Collector 뱃지'
        }
      ],
      unlocks: ['나만의 컬렉션', '추가 추천'],
      completed: false
    },
    
    // Day 3: 현실 연결
    {
      day: 3,
      title: "실제 전시와 만나다",
      morningNudge: "🏛️ 이번 주말 어디로 가볼까요?",
      mainTask: {
        id: 'explore-exhibitions',
        title: '전시 정보 탐색',
        description: '진행 중인 전시를 확인하고 관심 전시를 찾아보세요',
        action: '전시 둘러보기',
        route: '/exhibitions',
        completed: false,
        reward: 'Museum Goer 뱃지'
      },
      bonusTasks: [
        {
          id: 'filter-exhibitions',
          title: '내 주변 전시 찾기',
          description: '거리순으로 정렬해보세요',
          action: '필터 사용',
          completed: false,
          reward: 'Local Explorer 뱃지'
        }
      ],
      unlocks: ['전시 알림', '큐레이터 추천'],
      completed: false
    },
    
    // Day 4: Art Pulse 체험
    {
      day: 4,
      title: "예술계의 맥박을 느끼다",
      morningNudge: "📊 지금 이 순간 예술계에서 일어나는 일",
      mainTask: {
        id: 'discover-artpulse',
        title: 'Art Pulse 탐험',
        description: '실시간 예술 트렌드를 확인하세요',
        action: 'Art Pulse 열기',
        route: '/artpulse',
        completed: false,
        reward: 'Trend Spotter 뱃지'
      },
      bonusTasks: [
        {
          id: 'compare-taste',
          title: '취향 비교',
          description: '나의 취향 vs 대중 취향을 비교해보세요',
          action: '비교하기',
          completed: false,
          reward: 'Unique Taste 뱃지'
        }
      ],
      unlocks: ['트렌드 알림', '일일 리포트'],
      completed: false
    },
    
    // Day 5: 커뮤니티 연결
    {
      day: 5,
      title: "비슷한 취향의 사람들",
      morningNudge: "🤝 혼자가 아닙니다. 동료를 만나보세요",
      mainTask: {
        id: 'connect-community',
        title: '커뮤니티 연결',
        description: '시너지 높은 사용자를 찾아 연결하세요',
        action: '커뮤니티 탐색',
        route: '/community',
        completed: false,
        reward: 'Social Butterfly 뱃지'
      },
      bonusTasks: [
        {
          id: 'follow-user',
          title: '첫 팔로우',
          description: '흥미로운 사용자를 팔로우하세요',
          action: '팔로우하기',
          completed: false,
          reward: 'Connector 뱃지'
        }
      ],
      unlocks: ['시너지 매칭', '추천 친구'],
      completed: false
    },
    
    // Day 6: 깊이 더하기
    {
      day: 6,
      title: "나만의 예술 여정 돌아보기",
      morningNudge: "📈 일주일간의 성장을 확인해보세요",
      mainTask: {
        id: 'review-journey',
        title: '여정 돌아보기',
        description: '프로필에서 일주일간의 활동을 확인하세요',
        action: '프로필 확인',
        route: '/profile',
        completed: false,
        reward: 'Week 1 Survivor 뱃지'
      },
      unlocks: ['상세 통계', '고급 필터'],
      completed: false
    },
    
    // Day 7: 졸업과 시작
    {
      day: 7,
      title: "이제 당신은 SAYU 마스터",
      morningNudge: "🎓 축하합니다! 모든 준비가 끝났습니다",
      mainTask: {
        id: 'graduation',
        title: '졸업식',
        description: '첫 주간 리포트를 확인하고 다음 여정을 준비하세요',
        action: '리포트 확인',
        route: '/profile',
        completed: false,
        reward: 'Early Adopter 뱃지 + 특별 테마'
      },
      unlocks: ['모든 기능', '특별 이벤트 초대'],
      completed: false
    }
  ];
};

export function OnboardingProviderV2({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [isNewUser, setIsNewUser] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [allJourneys, setAllJourneys] = useState<DailyJourney[]>([]);
  const [currentJourney, setCurrentJourney] = useState<DailyJourney | null>(null);
  const [progress, setProgress] = useState<OnboardingProgress>({
    currentDay: 0,
    startedAt: new Date(),
    lastActiveAt: new Date(),
    completedDays: [],
    unlockedDays: 0, // 초기값 추가
    hasCompletedQuiz: false,
    hasViewedGallery: false,
    hasExploredExhibitions: false,
    hasUsedArtPulse: false,
    hasConnectedCommunity: false,
    hasViewedProfile: false,
    hasEarnedFirstBadge: false,
    totalArtworksViewed: 0,
    totalArtworksLiked: 0,
    totalArtworksSaved: 0,
    totalExhibitionsViewed: 0,
    communityConnectionsMade: 0
  });

  // 초기화 및 사용자 체크
  useEffect(() => {
    if (user) {
      // 로컬 스토리지에서 진행 상황 로드
      const savedProgress = localStorage.getItem(`onboarding_v2_${user.id}`);
      
      if (savedProgress) {
        const parsed = JSON.parse(savedProgress);
        
        // 기존 데이터에 unlockedDays가 없으면 추가
        if (parsed.unlockedDays === undefined) {
          // 퀴즈 완료 여부로 unlockedDays 설정
          const hasQuiz = user.personalityType || user.aptType || parsed.hasCompletedQuiz;
          parsed.unlockedDays = hasQuiz ? 1 : 0;
          
          // Day 0이 완료되었는지 체크
          if (hasQuiz && !parsed.completedDays.includes(0)) {
            parsed.completedDays.push(0);
            parsed.currentDay = 1;
          }
        }
        
        setProgress(parsed);
        setIsNewUser(false);
      } else {
        // 신규 사용자 체크 (가입 후 7일 이내)
        const createdAt = new Date(user.created_at || Date.now());
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const userIsNew = createdAt > sevenDaysAgo;
        
        setIsNewUser(userIsNew);
        
        if (userIsNew) {
          // WelcomeModal 자동 표시 비활성화 - 사용자가 JourneySection에서 수동으로 열 수 있음
          // setShowWelcomeModal(true);
          
          // 퀴즈 완료 여부 체크
          const hasQuiz = user.personalityType || user.aptType;
          
          const initialProgress: OnboardingProgress = {
            ...progress,
            startedAt: new Date(),
            userAPTType: user.aptType as APTTypeKey,
            hasCompletedQuiz: !!hasQuiz,
            // 퀴즈를 완료했으면 Day 0 자동 완료, Day 1 해금
            currentDay: hasQuiz ? 1 : 0,
            unlockedDays: hasQuiz ? 1 : 0,
            completedDays: hasQuiz ? [0] : []
          };
          setProgress(initialProgress);
          localStorage.setItem(`onboarding_v2_${user.id}`, JSON.stringify(initialProgress));
        }
      }
      
      // 여정 계획 생성
      const journeys = createJourneyPlan(user.aptType as APTTypeKey);
      setAllJourneys(journeys);
      
      // 오늘의 여정 설정
      const daysSinceStart = Math.floor(
        (Date.now() - new Date(progress.startedAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      const todayJourney = journeys.find(j => j.day === Math.min(daysSinceStart, 7));
      setCurrentJourney(todayJourney || null);
    }
  }, [user]);

  // 진행 상황 저장
  useEffect(() => {
    if (user && progress) {
      localStorage.setItem(`onboarding_v2_${user.id}`, JSON.stringify(progress));
    }
  }, [progress, user]);

  const completeTask = (taskId: string) => {
    if (!currentJourney) return;
    
    // 메인 태스크 완료
    if (currentJourney.mainTask.id === taskId) {
      currentJourney.mainTask.completed = true;
      
      // 보상 토스트 - Day 0는 제외 (welcome-tour는 토스트 안 띄움)
      if (currentJourney.mainTask.reward && taskId !== 'welcome-tour') {
        toast.success(`🎉 ${currentJourney.mainTask.reward} 획득!`, {
          duration: 4000,
          style: {
            background: '#1f2937',
            color: '#fff',
            border: '1px solid #6366f1'
          }
        });
      }
    }
    
    // 보너스 태스크 완료
    const bonusTask = currentJourney.bonusTasks?.find(t => t.id === taskId);
    if (bonusTask) {
      bonusTask.completed = true;
      
      if (bonusTask.reward) {
        toast.success(`🌟 ${bonusTask.reward} 획득!`, {
          duration: 3000,
          style: {
            background: '#1f2937',
            color: '#fff',
            border: '1px solid #10b981'
          }
        });
      }
    }
    
    // 모든 태스크 완료 체크
    const allTasksComplete = currentJourney.mainTask.completed && 
      (currentJourney.bonusTasks?.every(t => t.completed) ?? true);
    
    if (allTasksComplete && !currentJourney.completed) {
      markDayComplete(currentJourney.day);
    }
    
    setCurrentJourney({ ...currentJourney });
  };

  const markDayComplete = (day: number) => {
    const journey = allJourneys.find(j => j.day === day);
    if (journey) {
      journey.completed = true;
      journey.completedAt = new Date();
      
      // Day 0 완료 시 자동으로 Day 1 해제
      if (day === 0) {
        const updatedProgress = {
          ...progress,
          currentDay: 1,
          unlockedDays: Math.max(progress.unlockedDays, 1)
        };
        setProgress(updatedProgress);
        localStorage.setItem('onboarding_progress_v2', JSON.stringify(updatedProgress));
        
        // Day 1 시작 알림
        toast.success('🎉 Day 1이 열렸습니다! AI 아트 프로필을 만들어보세요!', {
          duration: 5000,
          style: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff',
            border: 'none'
          }
        });
      }
      
      setProgress(prev => ({
        ...prev,
        completedDays: [...prev.completedDays, day],
        lastActiveAt: new Date()
      }));
      
      // 완료 축하
      toast.success(`🎊 Day ${day} 완료! ${journey.unlocks.join(', ')} 해제됨`, {
        duration: 5000,
        style: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
        }
      });
      
      // 다음 날로 진행
      if (day < 7) {
        const nextJourney = allJourneys.find(j => j.day === day + 1);
        setCurrentJourney(nextJourney || null);
      }
    }
  };

  const skipToDay = (day: number) => {
    const journey = allJourneys.find(j => j.day === day);
    if (journey) {
      setCurrentJourney(journey);
      setProgress(prev => ({
        ...prev,
        currentDay: day,
        lastActiveAt: new Date()
      }));
    }
  };

  const updateProgress = (updates: Partial<OnboardingProgress>) => {
    setProgress(prev => ({
      ...prev,
      ...updates,
      lastActiveAt: new Date()
    }));
  };

  const getTodayNudge = () => {
    const daysSinceStart = Math.floor(
      (Date.now() - new Date(progress.startedAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    return allJourneys.find(j => j.day === Math.min(daysSinceStart, 7)) || null;
  };

  const resetOnboarding = () => {
    if (!user) return;
    
    localStorage.removeItem(`onboarding_v2_${user.id}`);
    
    const resetProgress: OnboardingProgress = {
      currentDay: 0,
      startedAt: new Date(),
      lastActiveAt: new Date(),
      completedDays: [],
      unlockedDays: 0,
      hasCompletedQuiz: false,
      hasViewedGallery: false,
      hasExploredExhibitions: false,
      hasUsedArtPulse: false,
      hasConnectedCommunity: false,
      hasViewedProfile: false,
      hasEarnedFirstBadge: false,
      totalArtworksViewed: 0,
      totalArtworksLiked: 0,
      totalArtworksSaved: 0,
      totalExhibitionsViewed: 0,
      communityConnectionsMade: 0
    };
    
    setProgress(resetProgress);
    setIsNewUser(true);
    setShowWelcomeModal(true);
    
    const journeys = createJourneyPlan(user.aptType as APTTypeKey);
    setAllJourneys(journeys);
    setCurrentJourney(journeys[0]);
  };

  const getDaysRemaining = () => {
    return 7 - progress.completedDays.length;
  };

  const getCompletionPercentage = () => {
    return Math.round((progress.completedDays.length / 7) * 100);
  };

  const isOnboardingComplete = progress.completedDays.length >= 7;

  return (
    <OnboardingContextV2.Provider value={{
      isNewUser,
      showWelcomeModal,
      currentJourney,
      progress,
      allJourneys,
      setShowWelcomeModal,
      completeTask,
      markDayComplete,
      skipToDay,
      updateProgress,
      getTodayNudge,
      resetOnboarding,
      isOnboardingComplete,
      getDaysRemaining,
      getCompletionPercentage
    }}>
      {children}
    </OnboardingContextV2.Provider>
  );
}

export const useOnboardingV2 = () => {
  const context = useContext(OnboardingContextV2);
  if (!context) {
    throw new Error('useOnboardingV2 must be used within OnboardingProviderV2');
  }
  return context;
};