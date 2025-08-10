'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useSwipeable } from 'react-swipeable';
import { 
  narrativeQuestions, 
  getPersonalizedTransition,
  getPersonalizedTransition_ko,
  encouragingFeedback,
  encouragingFeedback_ko,
  type NarrativeQuestion
} from '@/data/narrative-quiz-questions';
import { getBackgroundForQuestion } from '@/data/quiz-backgrounds';
import { ChevronLeft, Home, Volume2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface QuizResponse {
  questionId: number;
  choice: string;
  weight: Record<string, number>;
  emotional: string;
}

export const MobileQuiz: React.FC = () => {
  const router = useRouter();
  const { language } = useLanguage();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<QuizResponse[]>([]);
  const [showEncouragement, setShowEncouragement] = useState(false);
  const [encouragementMessage, setEncouragementMessage] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [personalityScores, setPersonalityScores] = useState({
    L: 0, S: 0, A: 0, R: 0, E: 0, M: 0, F: 0, C: 0
  });
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const question = narrativeQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / narrativeQuestions.length) * 100;

  // 햅틱 피드백
  const triggerHaptic = useCallback((intensity: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: 10,
        medium: 20,
        heavy: 30
      };
      navigator.vibrate(patterns[intensity]);
    }
  }, []);

  // 스와이프 핸들러 - 이전/다음 질문
  const handlers = useSwipeable({
    onSwipedRight: () => {
      if (currentQuestion > 0 && !isTransitioning) {
        triggerHaptic('light');
        setCurrentQuestion(prev => prev - 1);
      }
    },
    onSwipedLeft: () => {
      // 다음 질문으로 스와이프는 답변 선택 후에만 가능
      if (selectedOption && !isTransitioning) {
        handleChoice(selectedOption);
      }
    },
    trackMouse: false,
    trackTouch: true,
    swipeDuration: 500,
    preventScrollOnSwipe: true,
  });

  const handleGoBack = () => {
    triggerHaptic('light');
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedOption(null);
    } else {
      router.push('/quiz');
    }
  };

  const handleChoice = async (optionId: string) => {
    const option = question.options.find(opt => opt.id === optionId);
    if (!option) return;

    triggerHaptic('medium');

    // Save response
    const newResponse: QuizResponse = {
      questionId: question.id,
      choice: optionId,
      weight: option.weight,
      emotional: option.emotional
    };
    
    const updatedResponses = [...responses, newResponse];
    setResponses(updatedResponses);

    // Update personality scores
    const newScores = { ...personalityScores };
    Object.entries(option.weight).forEach(([key, value]) => {
      newScores[key as keyof typeof newScores] += value;
    });
    setPersonalityScores(newScores);

    // Show encouraging feedback
    if (currentQuestion % 3 === 2) {
      const feedbackArray = language === 'ko' ? encouragingFeedback_ko : encouragingFeedback;
      const message = feedbackArray[Math.floor(Math.random() * feedbackArray.length)];
      setEncouragementMessage(message);
      setShowEncouragement(true);
      setTimeout(() => setShowEncouragement(false), 3000);
    }

    // Transition to next question or complete
    setIsTransitioning(true);
    setSelectedOption(null);
    
    setTimeout(() => {
      if (currentQuestion < narrativeQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setIsTransitioning(false);
      } else {
        completeQuiz(updatedResponses, newScores);
      }
    }, 600);
  };

  const completeQuiz = (allResponses: QuizResponse[], finalScores: typeof personalityScores) => {
    // Calculate personality type
    const type = [
      finalScores.L > finalScores.S ? 'L' : 'S',
      finalScores.A > finalScores.R ? 'A' : 'R',
      finalScores.E > finalScores.M ? 'E' : 'M',
      finalScores.F > finalScores.C ? 'F' : 'C'
    ].join('');

    // Prepare results
    const quizResults = {
      personalityType: type,
      scores: finalScores,
      responses: allResponses,
      completedAt: new Date().toISOString()
    };
    
    // Store results
    import('@/lib/quiz-api').then(({ saveQuizResultsWithSync }) => {
      saveQuizResultsWithSync(quizResults);
    });

    triggerHaptic('heavy');
    
    // Navigate to results
    setTimeout(() => {
      router.push(`/results?type=${type}`);
    }, 1500);
  };

  const backgroundData = getBackgroundForQuestion(currentQuestion + 1);

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{ 
        background: backgroundData?.gradient || 'linear-gradient(to bottom, #1a1a2e, #0f0f1e)'
      }}
      {...handlers}
    >
      {/* 상단 헤더 */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-black/20 backdrop-blur-md">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={handleGoBack}
            className="p-2 -ml-2 rounded-lg active:bg-white/10 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          
          <div className="flex-1 mx-4">
            <div className="text-center text-white/80 text-sm mb-1">
              {currentQuestion + 1} / {narrativeQuestions.length}
            </div>
            <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-400 to-pink-400"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
          
          <button
            onClick={() => router.push('/quiz')}
            className="p-2 -mr-2 rounded-lg active:bg-white/10 transition-colors"
          >
            <Home className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      {/* 질문 콘텐츠 */}
      <div className="pt-24 pb-8 px-6 min-h-screen flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col justify-center"
          >
            {/* 질문 섹션 */}
            <div className="mb-8">
              {/* 내러티브 텍스트 */}
              {question.narrative && (
                <motion.p 
                  className="text-white/70 text-sm mb-4 leading-relaxed"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {language === 'ko' && question.narrative.setup_ko 
                    ? question.narrative.setup_ko 
                    : question.narrative.setup}
                </motion.p>
              )}

              {/* 메인 질문 */}
              <motion.h2 
                className="text-white text-2xl font-bold mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {language === 'ko' && question.text_ko ? question.text_ko : question.text}
              </motion.h2>

              {/* 서브텍스트 */}
              {question.subtext && (
                <motion.p 
                  className="text-white/60 text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {language === 'ko' && question.subtext_ko 
                    ? question.subtext_ko 
                    : question.subtext}
                </motion.p>
              )}
            </div>

            {/* 선택지 */}
            <div className="space-y-3">
              {question.options.map((option, index) => (
                <motion.button
                  key={option.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  onClick={() => {
                    if (!isTransitioning) {
                      setSelectedOption(option.id);
                      setTimeout(() => handleChoice(option.id), 200);
                    }
                  }}
                  disabled={isTransitioning}
                  className={cn(
                    "w-full p-4 rounded-2xl text-left transition-all duration-200",
                    "bg-white/10 backdrop-blur-md border border-white/20",
                    "active:scale-95 disabled:opacity-50",
                    selectedOption === option.id && "bg-white/20 border-white/40",
                    !isTransitioning && "hover:bg-white/15"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">
                      {option.emoji}
                    </span>
                    <div className="flex-1">
                      <p className="text-white font-medium text-base mb-1">
                        {language === 'ko' && option.text_ko 
                          ? option.text_ko 
                          : option.text}
                      </p>
                      {option.description && (
                        <p className="text-white/60 text-sm">
                          {language === 'ko' && option.description_ko 
                            ? option.description_ko 
                            : option.description}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* 스와이프 힌트 */}
            <motion.p 
              className="text-white/40 text-xs text-center mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              {language === 'ko' 
                ? '← 스와이프하여 이전 질문으로'
                : '← Swipe to go back'}
            </motion.p>
          </motion.div>
        </AnimatePresence>

        {/* 격려 메시지 */}
        <AnimatePresence>
          {showEncouragement && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-20 left-4 right-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl p-4 shadow-xl"
            >
              <p className="text-center font-medium">{encouragementMessage}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};