'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sun, 
  Moon, 
  Coffee, 
  Sunset,
  X,
  Sparkles,
  Clock,
  ChevronRight,
  Star
} from 'lucide-react';
import { useOnboardingV2 } from '@/contexts/OnboardingContextV2';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

interface NudgeContent {
  icon: React.ReactNode;
  message: string;
  action?: {
    label: string;
    route?: string;
    onClick?: () => void;
  };
  priority: 'low' | 'medium' | 'high';
}

export function DailyNudge() {
  const router = useRouter();
  const { 
    isNewUser, 
    currentJourney, 
    progress,
    isOnboardingComplete,
    getDaysRemaining
  } = useOnboardingV2();
  
  const [showNudge, setShowNudge] = useState(false);
  const [currentNudge, setCurrentNudge] = useState<NudgeContent | null>(null);
  const [lastShownTime, setLastShownTime] = useState<Date | null>(null);
  const [dismissedNudges, setDismissedNudges] = useState<Set<string>>(new Set());

  // 시간대 판별
  const getTimeOfDay = (): TimeOfDay => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  };

  // 시간대별 인사말
  const getGreeting = (): string => {
    const timeOfDay = getTimeOfDay();
    const aptAnimal = progress.userAPTAnimal || '예술가';
    
    switch (timeOfDay) {
      case 'morning':
        return `좋은 아침이에요, ${aptAnimal}님! ☀️`;
      case 'afternoon':
        return `오후의 예술 시간, ${aptAnimal}님 🎨`;
      case 'evening':
        return `저녁 감상 시간이에요, ${aptAnimal}님 🌆`;
      case 'night':
        return `밤의 영감을 찾아서, ${aptAnimal}님 🌙`;
    }
  };

  // 시간대별 넛지 생성
  const generateNudge = (): NudgeContent | null => {
    if (!currentJourney || isOnboardingComplete) return null;
    
    const timeOfDay = getTimeOfDay();
    const daysRemaining = getDaysRemaining();
    const completedToday = currentJourney.mainTask.completed;
    
    // 이미 오늘 완료했다면 격려 메시지
    if (completedToday && currentJourney.bonusTasks?.every(t => t.completed)) {
      return {
        icon: <Star className="w-5 h-5 text-yellow-400" />,
        message: `완벽한 하루였어요! 내일도 함께해요 ✨`,
        priority: 'low'
      };
    }
    
    // 시간대별 맞춤 넛지
    switch (timeOfDay) {
      case 'morning':
        if (!completedToday) {
          return {
            icon: <Coffee className="w-5 h-5 text-amber-400" />,
            message: currentJourney.morningNudge,
            action: {
              label: '오늘의 미션 보기',
              onClick: () => setShowNudge(false)
            },
            priority: 'high'
          };
        }
        break;
        
      case 'afternoon':
        if (!completedToday) {
          return {
            icon: <Sun className="w-5 h-5 text-orange-400" />,
            message: `점심 후 5분, ${currentJourney.mainTask.title}를 완료해보는 건 어때요?`,
            action: {
              label: currentJourney.mainTask.action,
              route: currentJourney.mainTask.route
            },
            priority: 'medium'
          };
        }
        break;
        
      case 'evening':
        if (!completedToday) {
          return {
            icon: <Sunset className="w-5 h-5 text-purple-400" />,
            message: `오늘이 가기 전에! ${daysRemaining}일 남았어요 🎯`,
            action: {
              label: '지금 시작하기',
              route: currentJourney.mainTask.route
            },
            priority: 'high'
          };
        } else if (currentJourney.eveningReflection) {
          return {
            icon: <Moon className="w-5 h-5 text-indigo-400" />,
            message: currentJourney.eveningReflection,
            priority: 'low'
          };
        }
        break;
        
      case 'night':
        if (!completedToday && daysRemaining > 1) {
          return {
            icon: <Moon className="w-5 h-5 text-blue-400" />,
            message: `내일 이어서 해도 괜찮아요. 좋은 밤 되세요 🌙`,
            priority: 'low'
          };
        }
        break;
    }
    
    // 보너스 태스크 유도
    const incompleteBonusTasks = currentJourney.bonusTasks?.filter(t => !t.completed) || [];
    if (completedToday && incompleteBonusTasks.length > 0) {
      const randomBonus = incompleteBonusTasks[Math.floor(Math.random() * incompleteBonusTasks.length)];
      return {
        icon: <Sparkles className="w-5 h-5 text-purple-400" />,
        message: `보너스 미션: ${randomBonus.title}`,
        action: {
          label: randomBonus.action,
          route: randomBonus.route
        },
        priority: 'medium'
      };
    }
    
    return null;
  };

  // 넛지 표시 로직
  useEffect(() => {
    if (!isNewUser || isOnboardingComplete) {
      setShowNudge(false);
      return;
    }
    
    const checkAndShowNudge = () => {
      const nudge = generateNudge();
      if (!nudge) return;
      
      // 넛지 ID 생성 (내용 기반)
      const nudgeId = `${currentJourney?.day}_${getTimeOfDay()}_${nudge.message.substring(0, 20)}`;
      
      // 이미 닫은 넛지인지 확인
      if (dismissedNudges.has(nudgeId)) return;
      
      // 마지막 표시 시간 체크 (최소 30분 간격)
      if (lastShownTime) {
        const timeSinceLastShown = Date.now() - lastShownTime.getTime();
        if (timeSinceLastShown < 30 * 60 * 1000) return;
      }
      
      // 우선순위가 high이거나 일정 확률로 표시
      const shouldShow = nudge.priority === 'high' || 
                        (nudge.priority === 'medium' && Math.random() > 0.5) ||
                        (nudge.priority === 'low' && Math.random() > 0.8);
      
      if (shouldShow) {
        setCurrentNudge(nudge);
        setShowNudge(true);
        setLastShownTime(new Date());
      }
    };
    
    // 초기 체크
    checkAndShowNudge();
    
    // 주기적 체크 (10분마다)
    const interval = setInterval(checkAndShowNudge, 10 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [isNewUser, isOnboardingComplete, currentJourney, lastShownTime, dismissedNudges]);

  // 자동 숨김 (낮은 우선순위는 5초 후 자동 숨김)
  useEffect(() => {
    if (showNudge && currentNudge?.priority === 'low') {
      const timer = setTimeout(() => {
        setShowNudge(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showNudge, currentNudge]);

  const handleAction = () => {
    if (currentNudge?.action) {
      if (currentNudge.action.route) {
        router.push(currentNudge.action.route);
      } else if (currentNudge.action.onClick) {
        currentNudge.action.onClick();
      }
      setShowNudge(false);
    }
  };

  const handleDismiss = () => {
    if (currentNudge) {
      const nudgeId = `${currentJourney?.day}_${getTimeOfDay()}_${currentNudge.message.substring(0, 20)}`;
      setDismissedNudges(prev => new Set(prev).add(nudgeId));
    }
    setShowNudge(false);
  };

  if (!showNudge || !currentNudge) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, x: '-50%' }}
        animate={{ opacity: 1, y: 0, x: '-50%' }}
        exit={{ opacity: 0, y: -20, x: '-50%' }}
        className="fixed top-20 left-1/2 z-50 max-w-md"
      >
        <div className={`
          bg-gray-900/95 backdrop-blur-lg rounded-2xl shadow-2xl 
          border overflow-hidden
          ${currentNudge.priority === 'high' 
            ? 'border-purple-500 shadow-purple-500/20' 
            : currentNudge.priority === 'medium'
            ? 'border-blue-500 shadow-blue-500/20'
            : 'border-gray-700 shadow-gray-700/20'
          }
        `}>
          {/* 그라데이션 배경 */}
          <div className={`
            absolute inset-0 opacity-10 pointer-events-none
            ${currentNudge.priority === 'high' 
              ? 'bg-gradient-to-br from-purple-600 to-pink-600' 
              : currentNudge.priority === 'medium'
              ? 'bg-gradient-to-br from-blue-600 to-cyan-600'
              : 'bg-gradient-to-br from-gray-600 to-gray-700'
            }
          `} />
          
          <div className="relative p-4">
            {/* 헤더 */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`
                  p-2 rounded-lg 
                  ${currentNudge.priority === 'high' 
                    ? 'bg-purple-500/20' 
                    : currentNudge.priority === 'medium'
                    ? 'bg-blue-500/20'
                    : 'bg-gray-700/50'
                  }
                `}>
                  {currentNudge.icon}
                </div>
                <div>
                  <p className="text-xs text-gray-400">{getGreeting()}</p>
                  <p className="text-xs text-gray-500">
                    Day {currentJourney?.day} · {getTimeOfDay() === 'morning' ? '오전' : 
                           getTimeOfDay() === 'afternoon' ? '오후' :
                           getTimeOfDay() === 'evening' ? '저녁' : '밤'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="text-gray-400 hover:text-white transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* 메시지 */}
            <p className="text-white text-sm mb-3 leading-relaxed">
              {currentNudge.message}
            </p>
            
            {/* 액션 버튼 */}
            {currentNudge.action && (
              <button
                onClick={handleAction}
                className={`
                  w-full px-4 py-2 rounded-lg text-sm font-medium
                  transition-all flex items-center justify-center gap-2
                  ${currentNudge.priority === 'high' 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white' 
                    : currentNudge.priority === 'medium'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                  }
                `}
              >
                {currentNudge.action.label}
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
            
            {/* 진행률 표시 (high priority만) */}
            {currentNudge.priority === 'high' && currentJourney && (
              <div className="mt-3 pt-3 border-t border-gray-800">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>오늘의 진행률</span>
                  <span>
                    {currentJourney.mainTask.completed ? 1 : 0}/
                    {1 + (currentJourney.bonusTasks?.length || 0)} 완료
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}