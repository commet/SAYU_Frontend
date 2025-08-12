'use client';

import React, { useState, useCallback, Fragment } from 'react';
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
import { ChevronLeft, ChevronRight, Home, Volume2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import '@/styles/audio-guide.css';

interface QuizResponse {
  questionId: number;
  choice: string;
  weight: Record<string, number>;
  emotional: string;
}

export const MobileQuiz: React.FC = () => {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<QuizResponse[]>([]);
  const [showEncouragement, setShowEncouragement] = useState(false);
  const [encouragementMessage, setEncouragementMessage] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [personalityScores, setPersonalityScores] = useState({
    L: 0, S: 0, A: 0, R: 0, E: 0, M: 0, F: 0, C: 0
  });
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showAPTTransition, setShowAPTTransition] = useState(false);

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
    
    // Show APT transition screen briefly
    setShowAPTTransition(true);
    console.log('APT Transition started, type:', type);
    
    // Navigate to results after showing transition
    setTimeout(() => {
      console.log('Navigating to results page with type:', type);
      router.push(`/results?type=${type}`);
    }, 2500);
  };

  const backgroundData = getBackgroundForQuestion(currentQuestion + 1);
  const currentBackground = backgroundData.backgrounds && backgroundData.backgrounds.length > 0
    ? backgroundData.backgrounds[currentQuestion % backgroundData.backgrounds.length]
    : null;

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{ 
        backgroundImage: currentBackground ? `url(${currentBackground})` : undefined,
        backgroundColor: currentBackground ? undefined : '#1a1a2e',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
      {...handlers}
    >
      {/* 배경 오버레이 - 데스크톱과 동일 */}
      {currentBackground && (
        <div 
          className="absolute inset-0 bg-gradient-to-br"
          style={{ 
            background: `linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.6) 100%)`,
            pointerEvents: 'none'
          }}
        />
      )}
      
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
          
          <div className="flex gap-2">
            <button
              onClick={() => setLanguage(language === 'ko' ? 'en' : 'ko')}
              className="p-2 rounded-lg active:bg-white/10 transition-colors"
            >
              <span className="text-white text-xs font-medium">
                {language === 'ko' ? 'EN' : '한글'}
              </span>
            </button>
            <button
              onClick={() => router.push('/quiz')}
              className="p-2 -mr-2 rounded-lg active:bg-white/10 transition-colors"
            >
              <Home className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* 질문 콘텐츠 - Frame Style */}
      <div className="pt-4 pb-8 px-4 min-h-screen flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="mx-auto max-w-md relative"
          >
            {/* Gallery Room Indicator */}
            <motion.div 
              className="absolute -top-12 right-0 bg-black/50 backdrop-blur-md px-4 py-2 rounded-lg"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-sm font-medium text-white">
                {currentQuestion >= 10 && currentQuestion <= 11
                  ? (language === 'ko' ? '아트샵' : 'Museum Shop')
                  : currentQuestion >= 12 && currentQuestion <= 14
                  ? (language === 'ko' ? '일상 속에서' : 'In Daily Life')
                  : {
                      'curiosity': language === 'ko' ? '입구 홀' : 'Entrance Hall',
                      'exploration': language === 'ko' ? '메인 갤러리' : 'Main Gallery',
                      'revelation': language === 'ko' ? '성찰의 방' : 'Reflection Room'
                    }[question.act] || (language === 'ko' ? '입구 홀' : 'Entrance Hall')}
              </h3>
              <p className="text-xs opacity-70 text-white">Stop {currentQuestion + 1} of {narrativeQuestions.length}</p>
            </motion.div>

            {/* Narrative Setup Box */}
            {question.narrative && (question.narrative.setup || question.narrative.transition || question.narrative.setup_ko || question.narrative.transition_ko) && (
              <motion.div
                className="mb-6 mx-4 p-4 rounded-2xl backdrop-blur-md border border-white/20"
                style={{ 
                  background: currentQuestion >= 12 
                    ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(134, 239, 172, 0.08) 100%)'
                    : currentQuestion >= 3 && currentQuestion <= 7 
                    ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(147, 197, 253, 0.15) 100%)'
                    : 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(219, 39, 119, 0.1) 100%)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <p className="text-sm leading-relaxed font-light text-white/90 italic text-center"
                   style={{ letterSpacing: '-0.01em', lineHeight: '1.5', textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                  {(language === 'ko' 
                    ? (question.narrative.setup_ko || question.narrative.transition_ko)
                    : (question.narrative.setup || question.narrative.transition))
                    ?.split('\n')
                    .map((line, index, array) => (
                      <Fragment key={index}>
                        {line}
                        {index < array.length - 1 && <br />}
                      </Fragment>
                    ))}
                </p>
              </motion.div>
            )}

            {/* Main Question */}
            <motion.h2 
              className="font-bold text-center mb-6 leading-tight"
              style={{ 
                fontSize: '1.05rem', 
                letterSpacing: '-0.03em',
                background: currentQuestion >= 12
                  ? 'linear-gradient(180deg, #ffffff 0%, #22c55e 100%)'
                  : currentQuestion >= 3 && currentQuestion <= 7 
                  ? 'linear-gradient(180deg, #ffffff 0%, #60a5fa 100%)'
                  : 'linear-gradient(180deg, #ffffff 0%, #fbbf24 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: currentQuestion >= 12
                  ? '0 0 40px rgba(34, 197, 94, 0.6)'
                  : currentQuestion >= 3 && currentQuestion <= 7
                  ? '0 0 40px rgba(59, 130, 246, 0.6)'
                  : '0 0 40px rgba(251, 191, 36, 0.5)',
                filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))'
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {(language === 'ko' && question.question_ko ? question.question_ko : question.question)
                .split('\n')
                .map((line, index) => (
                  <Fragment key={index}>
                    {line}
                    {index < (language === 'ko' && question.question_ko ? question.question_ko : question.question).split('\n').length - 1 && <br />}
                  </Fragment>
                ))}
            </motion.h2>

            {/* Choice Cards */}
            <motion.div 
              className="space-y-4 px-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {question.options.map((option, index) => (
                <motion.div
                  key={option.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div
                    className={cn(
                      "cursor-pointer group relative overflow-hidden rounded-xl p-4 transition-all",
                      "bg-white/70 backdrop-blur-md border-2",
                      selectedOption === option.id ? "border-purple-500 bg-white/80" : "border-white/40",
                      isTransitioning && "pointer-events-none opacity-50"
                    )}
                    onClick={() => {
                      if (!isTransitioning) {
                        setSelectedOption(option.id);
                        setTimeout(() => handleChoice(option.id), 200);
                      }
                    }}
                  >
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity">
                      <div className="absolute inset-0" style={{
                        backgroundImage: `radial-gradient(circle at 2px 2px, #8b7355 1px, transparent 1px)`,
                        backgroundSize: '20px 20px'
                      }} />
                    </div>

                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full text-white font-bold text-sm"
                          style={{
                            background: index === 0 
                              ? 'linear-gradient(135deg, #1a1a1a 0%, #434343 100%)' 
                              : 'linear-gradient(135deg, #8b7355 0%, #d4a574 100%)',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.2)',
                            border: '1px solid rgba(255,255,255,0.1)'
                          }}>
                          {index === 0 ? 'A' : 'B'}
                        </span>
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold mb-1 text-gray-900 leading-snug whitespace-pre-line" style={{ letterSpacing: '-0.01em' }}>
                            {language === 'ko' && option.text_ko ? option.text_ko : option.text}
                          </h4>
                          {option.subtext && (
                            <p className="text-gray-700 text-sm leading-snug whitespace-pre-line">
                              {language === 'ko' && option.subtext_ko ? option.subtext_ko : option.subtext}
                            </p>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-gray-800 group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Swipe Hint */}
            <motion.p 
              className="text-white/70 text-xs text-center mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              transition={{ delay: 0.8 }}
            >
              {language === 'ko' 
                ? '← 스와이프하여 이전 질문으로'
                : '← Swipe to go back'}
            </motion.p>

            {/* Atmosphere indicator */}
            {question.narrative.atmosphere && (
              <motion.div
                className="text-center mt-4 text-xs text-white/60 italic"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                <p>
                  {language === 'ko' ? '갤러리 분위기: ' : 'Gallery atmosphere: '}
                  {language === 'ko' ? 
                    {
                      'anticipation': '기대감',
                      'wonder': '경이로움',
                      'threshold': '문턱',
                      'immersion': '몰입',
                      'discovery': '발견',
                      'connection': '연결',
                      'depth': '깊이',
                      'transformation': '변화',
                      'reflection': '성찰',
                      'curiosity': '호기심',
                      'decision': '결정',
                      'memory': '기억',
                      'integration': '통합'
                    }[question.narrative.atmosphere] || question.narrative.atmosphere
                    : question.narrative.atmosphere
                  }
                </p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 격려 메시지 */}
      <AnimatePresence>
        {showEncouragement && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-20 left-6 right-6 bg-black/60 backdrop-blur-md text-white/90 rounded-xl p-3 shadow-lg border border-white/10"
          >
            <p className="text-center text-sm font-light">{encouragementMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* APT Transition Screen */}
      <AnimatePresence>
        {showAPTTransition && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center"
          >
            {/* Museum Cafe Background */}
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: 'url("/images/backgrounds/museum-cafe-empty-shadows-monochrome.jpg")',
              }}
            >
              <div className="absolute inset-0 bg-black/30" />
            </div>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-center px-4 relative z-10"
            >
              {/* Analyzing message at top */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mb-8"
              >
                <p className="text-xl md:text-2xl font-semibold text-white mb-2 whitespace-pre-line">
                  {language === 'ko' 
                    ? '당신의 Art Persona Type을\n분석중...' 
                    : 'Analyzing your\nArt Persona Type...'}
                </p>
                <div className="flex items-center justify-center gap-2 mt-4">
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" />
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                </div>
              </motion.div>

              {/* 16 Types Grid */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="max-w-xs mx-auto"
              >
                <div className="grid grid-cols-4 gap-2">
                  {['LAEF', 'LAEC', 'LAMF', 'LAMC', 'LREF', 'LREC', 'LRMF', 'LRMC', 
                    'SAEF', 'SAEC', 'SAMF', 'SAMC', 'SREF', 'SREC', 'SRMF', 'SRMC'].map((type, index) => (
                    <motion.div
                      key={type}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 1 + index * 0.05 }}
                      className="bg-white/5 backdrop-blur-sm rounded-lg p-2 border border-white/10"
                    >
                      <span className="text-xs font-mono font-bold text-white">
                        {type}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};