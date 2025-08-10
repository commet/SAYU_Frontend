'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  Circle, 
  Gift, 
  Sparkles,
  ChevronRight,
  X,
  Calendar,
  Trophy,
  Zap,
  Target
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useOnboardingV2 } from '@/contexts/OnboardingContextV2';
import toast from 'react-hot-toast';

export function OnboardingWidget() {
  const router = useRouter();
  const { 
    isNewUser,
    currentJourney,
    progress,
    completeTask,
    getCompletionPercentage,
    getDaysRemaining,
    isOnboardingComplete
  } = useOnboardingV2();
  
  const [isExpanded, setIsExpanded] = useState(true);
  const [showWidget, setShowWidget] = useState(false);
  const [permanentlyClosed, setPermanentlyClosed] = useState(false);

  useEffect(() => {
    // localStorage에서 영구 닫기 상태 확인
    const closed = localStorage.getItem('onboarding_widget_closed');
    if (closed === 'true') {
      setPermanentlyClosed(true);
      return;
    }
    
    // 온보딩 중인 사용자에게만 표시
    // 첫 3일간만 표시하거나, 프로필 페이지에서는 항상 표시
    const pathname = window.location.pathname;
    const isProfilePage = pathname === '/profile';
    const daysSinceStart = Math.floor(
      (Date.now() - new Date(progress.startedAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    const isWithinFirst3Days = daysSinceStart <= 3;
    
    if (isNewUser && !isOnboardingComplete && (isWithinFirst3Days || isProfilePage)) {
      setShowWidget(true);
    } else {
      setShowWidget(false);
    }
  }, [isNewUser, isOnboardingComplete, progress.startedAt]);

  if (!showWidget || !currentJourney || permanentlyClosed) return null;
  
  const handlePermanentClose = () => {
    localStorage.setItem('onboarding_widget_closed', 'true');
    setPermanentlyClosed(true);
    setShowWidget(false);
  };

  const completionPercentage = getCompletionPercentage();
  const daysRemaining = getDaysRemaining();
  
  // 오늘의 모든 태스크
  const allTasks = [
    currentJourney.mainTask,
    ...(currentJourney.bonusTasks || [])
  ];
  
  const completedTasksToday = allTasks.filter(t => t.completed).length;
  const totalTasksToday = allTasks.length;

  const handleTaskAction = (task: any) => {
    if (task.route) {
      router.push(task.route);
    }
  };

  const getDayEmoji = (day: number) => {
    const emojis = ['🎨', '🖼️', '🏛️', '📊', '🤝', '📈', '🎓'];
    return emojis[day] || '✨';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-6 right-6 z-40 max-w-md"
    >
      <div className="bg-gray-900/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-800">
        {/* 헤더 */}
        <div 
          className="p-4 border-b border-gray-800 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                  <span className="text-2xl">{getDayEmoji(currentJourney.day)}</span>
                </div>
                {completedTasksToday > 0 && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-white flex items-center gap-2">
                  Day {currentJourney.day}: {currentJourney.title}
                </h3>
                <p className="text-sm text-gray-400">
                  {completedTasksToday}/{totalTasksToday} 완료 • {daysRemaining}일 남음
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                className="text-gray-400 hover:text-white transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
              >
                {isExpanded ? <ChevronRight className="w-5 h-5 rotate-90" /> : <ChevronRight className="w-5 h-5" />}
              </button>
              <button
                className="text-gray-500 hover:text-red-400 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePermanentClose();
                }}
                title="영구적으로 숨기기"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 전체 진행률 바 */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
              <span>전체 여정</span>
              <span>{completionPercentage}%</span>
            </div>
            <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>

        {/* 확장된 콘텐츠 */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="overflow-hidden"
            >
              {/* Morning Nudge */}
              {currentJourney.morningNudge && (
                <div className="px-4 pt-4">
                  <div className="bg-gradient-to-r from-amber-900/20 to-orange-900/20 rounded-lg p-3 border border-amber-500/20">
                    <p className="text-sm text-amber-200">
                      💡 {currentJourney.morningNudge}
                    </p>
                  </div>
                </div>
              )}

              {/* 태스크 리스트 */}
              <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                {/* 메인 태스크 */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-3 rounded-lg border transition-all ${
                    currentJourney.mainTask.completed 
                      ? 'bg-green-900/20 border-green-700' 
                      : 'bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-purple-700 hover:border-purple-600'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 ${currentJourney.mainTask.completed ? 'text-green-400' : 'text-purple-400'}`}>
                      {currentJourney.mainTask.completed ? 
                        <CheckCircle2 className="w-5 h-5" /> : 
                        <Target className="w-5 h-5" />
                      }
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-medium ${
                          currentJourney.mainTask.completed ? 'text-gray-400 line-through' : 'text-white'
                        }`}>
                          {currentJourney.mainTask.title}
                        </h4>
                        <span className="text-xs bg-purple-600/30 text-purple-300 px-2 py-0.5 rounded-full">
                          메인
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">
                        {currentJourney.mainTask.description}
                      </p>
                      {currentJourney.mainTask.reward && !currentJourney.mainTask.completed && (
                        <p className="text-xs text-purple-400 mt-2 flex items-center gap-1">
                          <Gift className="w-3 h-3" />
                          {currentJourney.mainTask.reward}
                        </p>
                      )}
                      {!currentJourney.mainTask.completed && (
                        <button
                          onClick={() => handleTaskAction(currentJourney.mainTask)}
                          className="mt-2 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors flex items-center gap-1"
                        >
                          {currentJourney.mainTask.action}
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>

                {/* 보너스 태스크들 */}
                {currentJourney.bonusTasks?.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (index + 1) * 0.1 }}
                    className={`p-3 rounded-lg border transition-all ${
                      task.completed 
                        ? 'bg-gray-800/50 border-gray-700' 
                        : 'bg-gray-800 border-gray-700 hover:border-purple-600'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 ${task.completed ? 'text-green-400' : 'text-gray-400'}`}>
                        {task.completed ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`font-medium text-sm ${
                            task.completed ? 'text-gray-500 line-through' : 'text-gray-200'
                          }`}>
                            {task.title}
                          </h4>
                          <span className="text-xs bg-amber-600/20 text-amber-300 px-2 py-0.5 rounded-full">
                            보너스
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">
                          {task.description}
                        </p>
                        {task.reward && !task.completed && (
                          <p className="text-xs text-amber-400 mt-1 flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            {task.reward}
                          </p>
                        )}
                        {!task.completed && (
                          <button
                            onClick={() => handleTaskAction(task)}
                            className="mt-2 text-purple-400 hover:text-purple-300 text-xs flex items-center gap-1"
                          >
                            {task.action}
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* 오늘의 언락 */}
                {currentJourney.unlocks.length > 0 && (
                  <div className="mt-4 p-3 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg border border-blue-700/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Trophy className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm font-medium text-white">오늘의 보상</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {currentJourney.unlocks.map((unlock, index) => (
                        <span 
                          key={index}
                          className="text-xs bg-blue-600/20 text-blue-300 px-2 py-1 rounded-full"
                        >
                          🔓 {unlock}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 하단 액션 */}
              <div className="p-4 border-t border-gray-800">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => router.push('/journey')}
                    className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                  >
                    <Calendar className="w-4 h-4" />
                    전체 여정 보기
                  </button>
                  {completedTasksToday === totalTasksToday && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-sm text-green-400 flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      오늘 완료!
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}