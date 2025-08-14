'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Calendar, 
  CheckCircle2, 
  Circle, 
  Lock, 
  Trophy,
  Zap,
  Gift,
  ChevronRight,
  RotateCcw,
  Target,
  Sparkles
} from 'lucide-react';
import { useOnboardingV2 } from '@/contexts/OnboardingContextV2';
import { useState, useEffect } from 'react';

export function JourneySection() {
  const router = useRouter();
  const {
    isNewUser,
    currentJourney,
    allJourneys,
    progress,
    completeTask,
    resetOnboarding,
    isOnboardingComplete,
    getDaysRemaining,
    getCompletionPercentage,
    setShowWelcomeModal
  } = useOnboardingV2();
  
  // Day 1이 현재 진행 중이면 자동으로 확장
  const [expandedDay, setExpandedDay] = useState<number | null>(() => {
    // Day 1이 current 상태이고 아직 완료되지 않았으면 자동 확장
    const day1Journey = allJourneys.find(j => j.day === 1);
    if (day1Journey && !day1Journey.completed && progress.currentDay === 1) {
      return 1;
    }
    return currentJourney?.day || null;
  });

  // progress.currentDay가 변경될 때 자동으로 해당 Day 확장
  useEffect(() => {
    if (progress.currentDay === 1) {
      const day1Journey = allJourneys.find(j => j.day === 1);
      if (day1Journey && !day1Journey.completed) {
        setExpandedDay(1);
      }
    }
  }, [progress.currentDay, allJourneys]);

  const handleTaskAction = (task: any) => {
    // Day 0 환영 투어는 WelcomeModal 표시
    if (task.id === 'welcome-tour') {
      setShowWelcomeModal(true);
      // 태스크 완료 처리
      setTimeout(() => {
        completeTask(task.id);
        // Day 0 완료 후 Day 1 자동 확장
        setExpandedDay(1);
      }, 100);
      return;
    }
    
    // route가 있는 경우 해당 페이지로 이동
    if (task.route) {
      router.push(task.route);
      // 페이지 이동 후 태스크 자동 완료는 각 페이지에서 처리
      return;
    }
    
    // route가 없는 경우 바로 완료 처리 (보너스 태스크 등)
    completeTask(task.id);
  };

  const getDayStatus = (journey: any) => {
    if (journey.completed) return 'completed';
    if (journey.day === progress.currentDay) return 'current';
    if (journey.day <= progress.unlockedDays) return 'available';
    return 'locked';
  };

  const getDayIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-400" />;
      case 'current':
        return <Circle className="w-5 h-5 text-purple-400 animate-pulse" />;
      case 'available':
        return <Circle className="w-5 h-5 text-gray-400" />;
      default:
        return <Lock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getDayEmoji = (day: number) => {
    const emojis = ['🎨', '🖼️', '🏛️', '📊', '🤝', '📈', '🎓'];
    return emojis[day] || '✨';
  };

  return (
    <div className="bg-gray-800/50 rounded-xl p-4 sm:p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div>
          <h2 className="text-lg sm:text-2xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
            <span className="text-base sm:text-2xl">나의 7일 여정</span>
          </h2>
          <p className="text-gray-400 mt-1 text-xs sm:text-base">
            SAYU와 함께하는 예술 발견의 여행
          </p>
        </div>
        {isOnboardingComplete && (
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-400 font-medium">여정 완료!</span>
          </div>
        )}
      </div>

      {/* 전체 진행률 */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center justify-between text-xs sm:text-sm text-gray-400 mb-2">
          <span>전체 진행률</span>
          <span>{getCompletionPercentage()}% 완료</span>
        </div>
        <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
            initial={{ width: 0 }}
            animate={{ width: `${getCompletionPercentage()}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        {!isOnboardingComplete && (
          <p className="text-xs text-gray-400 mt-2">
            {getDaysRemaining()}일 남음
          </p>
        )}
      </div>

      {/* 7일 여정 리스트 */}
      <div className="space-y-3">
        {allJourneys.map((journey, index) => {
          const status = getDayStatus(journey);
          const isExpanded = expandedDay === journey.day;
          const isClickable = status !== 'locked';
          
          return (
            <motion.div
              key={journey.day}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`
                border rounded-xl transition-all
                ${status === 'completed' ? 'bg-green-900/20 border-green-700/50' :
                  status === 'current' ? 'bg-purple-900/20 border-purple-700' :
                  status === 'available' ? 'bg-gray-800 border-gray-700' :
                  'bg-gray-900/50 border-gray-800 opacity-60'}
              `}
            >
              {/* Day 헤더 */}
              <div
                className={`p-3 sm:p-4 flex items-center justify-between ${
                  isClickable ? 'cursor-pointer hover:bg-white/5' : ''
                }`}
                onClick={() => isClickable && setExpandedDay(isExpanded ? null : journey.day)}
              >
                <div className="flex items-center gap-2 sm:gap-3 flex-1">
                  {getDayIcon(status)}
                  <div className="flex-1">
                    <h3 className="font-semibold text-white flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
                      <span className="text-lg sm:text-2xl">{getDayEmoji(journey.day)}</span>
                      <span>Day {journey.day}:</span>
                      <span className="line-clamp-1">{journey.title}</span>
                    </h3>
                    {status === 'current' && (
                      <p className="text-sm text-purple-400 mt-1">
                        오늘의 미션
                      </p>
                    )}
                  </div>
                </div>
                {isClickable && (
                  <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${
                    isExpanded ? 'rotate-90' : ''
                  }`} />
                )}
              </div>

              {/* 확장된 내용 */}
              {isExpanded && isClickable && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-3 sm:px-4 pb-3 sm:pb-4"
                >
                  {/* Day 1 특별 강조 - AI 아트 프로필 (메인 태스크 통합) */}
                  {journey.day === 1 && status === 'current' && !journey.mainTask.completed ? (
                    <motion.div
                      initial={{ scale: 0.95 }}
                      animate={{ scale: 1 }}
                      className="mb-4 p-3 sm:p-4 bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-xl border border-purple-500/50 shadow-lg shadow-purple-600/20"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="text-white font-bold text-lg flex items-center gap-2">
                            ✨ AI가 그려주는 나만의 예술 아바타
                          </h4>
                          <p className="text-sm text-gray-300 mt-2">
                            당신의 APT 성격을 반영한 독특한 AI 아트를 만들어보세요!
                          </p>
                          <div className="flex items-center gap-2 mt-3">
                            <span className="text-xs bg-purple-600/50 px-2 py-1 rounded-full text-purple-200">
                              🎨 개인화된 AI 아트
                            </span>
                            <span className="text-xs bg-pink-600/50 px-2 py-1 rounded-full text-pink-200">
                              📱 SNS 공유 가능
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push('/profile/art-profile');
                          }}
                          className="ml-4 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                        >
                          <Sparkles className="w-5 h-5" />
                          프로필 생성
                        </button>
                      </div>
                    </motion.div>
                  ) : journey.day === 1 && journey.mainTask.completed ? null : (
                    /* 일반 메인 태스크 (Day 1 완료 시 숨김, 다른 Day는 표시) */
                    <div className={`mb-3 p-3 rounded-lg ${
                      journey.mainTask.completed 
                        ? 'bg-green-900/20 border border-green-700/50' 
                        : 'bg-purple-900/20 border border-purple-700/50'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className={`font-medium flex items-center gap-2 ${
                            journey.mainTask.completed ? 'text-gray-400 line-through' : 'text-white'
                          }`}>
                            <Target className="w-4 h-4 text-purple-400" />
                            {journey.mainTask.title}
                          </h4>
                          <p className="text-sm text-gray-400 mt-1">
                            {journey.mainTask.description}
                          </p>
                          {journey.mainTask.reward && !journey.mainTask.completed && (
                            <p className="text-xs text-purple-400 mt-2 flex items-center gap-1">
                              <Gift className="w-3 h-3" />
                              보상: {journey.mainTask.reward}
                            </p>
                          )}
                        </div>
                        {!journey.mainTask.completed && status === 'current' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTaskAction(journey.mainTask);
                            }}
                            className="ml-3 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
                          >
                            시작
                          </button>
                        )}
                        {journey.mainTask.completed && (
                          <CheckCircle2 className="w-5 h-5 text-green-400 ml-3" />
                        )}
                      </div>
                    </div>
                  )}

                  {/* 보너스 태스크 */}
                  {journey.bonusTasks && journey.bonusTasks.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500 font-medium">보너스 미션</p>
                      {journey.bonusTasks.map((task) => (
                        <div
                          key={task.id}
                          className={`p-2 rounded-lg ${
                            task.completed 
                              ? 'bg-gray-800/50 border border-gray-700/50' 
                              : 'bg-gray-800 border border-gray-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h5 className={`text-sm font-medium flex items-center gap-2 ${
                                task.completed ? 'text-gray-500 line-through' : 'text-gray-200'
                              }`}>
                                <Zap className="w-3 h-3 text-amber-400" />
                                {task.title}
                              </h5>
                              {task.reward && !task.completed && (
                                <p className="text-xs text-amber-400 mt-1">
                                  +{task.reward}
                                </p>
                              )}
                            </div>
                            {task.completed && (
                              <CheckCircle2 className="w-4 h-4 text-green-400" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 언락 정보 */}
                  {journey.unlocks && journey.unlocks.length > 0 && (
                    <div className="mt-3 p-2 bg-blue-900/20 rounded-lg border border-blue-700/30">
                      <p className="text-xs text-blue-300">
                        🔓 해제: {journey.unlocks.join(', ')}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* 리셋 버튼 (개발용) */}
      {process.env.NODE_ENV === 'development' && (
        <button
          onClick={resetOnboarding}
          className="mt-4 text-xs text-gray-500 hover:text-gray-400 flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" />
          온보딩 초기화 (개발용)
        </button>
      )}
    </div>
  );
}