'use client';

import { use, useState, useTransition, startTransition, useDeferredValue } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

interface Choice {
  id: string;
  text: {
    en: string;
    ko: string;
  };
  visual?: {
    gradient: string[];
    animation: string;
    icon: string;
  };
}

interface Question {
  id: string;
  type: string;
  scenario: {
    en: string;
    ko: string;
  };
  question: {
    en: string;
    ko: string;
  };
  choices: Choice[];
}

interface QuizSession {
  sessionId: string;
  currentQuestion: Question;
  progress: { current: number; total: number };
}

// React 19 use() hook을 위한 데이터 fetching 함수
function startQuizSession(language: 'en' | 'ko'): Promise<QuizSession> {
  return api.quiz.start({ language }).then(response => {
    if (!response.success) {
      throw new Error('Failed to start quiz session');
    }
    return {
      sessionId: response.sessionId,
      currentQuestion: response.currentQuestion,
      progress: response.progress
    };
  });
}

// 퀴즈 답변 제출 함수
function submitQuizAnswer(sessionId: string, questionId: string, choiceId: string) {
  return api.quiz.answer({
    sessionId,
    questionId,
    choiceId,
  });
}

// 퀴즈 세션 컴포넌트 - Suspense로 감싸질 부분
function QuizSessionContent({ language }: { language: 'en' | 'ko' }) {
  // React 19 use() hook으로 Promise를 직접 suspend
  const initialSession = use(startQuizSession(language));
  const router = useRouter();
  
  const [sessionId] = useState(initialSession.sessionId);
  const [currentQuestion, setCurrentQuestion] = useState(initialSession.currentQuestion);
  const [progress, setProgress] = useState(initialSession.progress);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  
  // React 19 useTransition으로 답변 제출을 논블로킹으로 처리
  const [isSubmitting, startSubmitTransition] = useTransition();
  
  // 언어 변경도 useTransition으로 부드럽게 처리
  const [isLanguageChanging, startLanguageTransition] = useTransition();

  const submitAnswer = (choiceId: string) => {
    if (!sessionId || !currentQuestion || isSubmitting) return;

    setSelectedChoice(choiceId);
    
    // React 19 startTransition으로 답변 제출을 논블로킹으로 처리
    startSubmitTransition(async () => {
      try {
        const response = await submitQuizAnswer(sessionId, currentQuestion.id, choiceId);

        if (response.success) {
          if (response.completed) {
            // Quiz completed - navigate to results
            localStorage.setItem('quizResult', JSON.stringify(response.result));
            
            // 부드러운 전환을 위해 약간의 딜레이
            setTimeout(() => {
              router.push(`/quiz/results?type=${response.result.personalityType}`);
            }, 500);
          } else {
            // Next question - 부드러운 전환
            setTimeout(() => {
              setCurrentQuestion(response.nextQuestion);
              setProgress(response.progress);
              setSelectedChoice(null);
            }, 800);
          }
        }
      } catch (error) {
        console.error('Failed to submit answer:', error);
        alert('Failed to submit answer. Please try again.');
      }
    });
  };

  return (
    <div className="container mx-auto px-4 py-12 pt-20">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          {/* Question Number */}
          <div className="text-center mb-8">
            <span className="text-white/60 text-lg">
              Question {progress.current} of {progress.total}
            </span>
          </div>

          {/* Scenario */}
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {currentQuestion.scenario[language]}
            </h2>
            <p className="text-xl md:text-2xl text-white/80">
              {currentQuestion.question[language]}
            </p>
          </div>

          {/* Choices */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            {currentQuestion.choices.map((choice) => (
              <motion.button
                key={choice.id}
                whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                onClick={() => submitAnswer(choice.id)}
                disabled={isSubmitting}
                className={`
                  relative overflow-hidden rounded-2xl p-8 text-left
                  transition-all duration-300 transform
                  ${selectedChoice === choice.id 
                    ? 'ring-4 ring-white scale-105' 
                    : 'hover:ring-2 hover:ring-white/50'
                  }
                  ${isSubmitting && selectedChoice !== choice.id 
                    ? 'opacity-50' 
                    : ''
                  }
                  ${isSubmitting ? 'cursor-not-allowed' : 'cursor-pointer'}
                `}
                style={{
                  background: choice.visual 
                    ? `linear-gradient(135deg, ${choice.visual.gradient.join(', ')})`
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                }}
              >
                {/* Choice Icon */}
                {choice.visual?.icon && (
                  <div className="text-4xl mb-4 opacity-80">
                    {getIcon(choice.visual.icon)}
                  </div>
                )}

                {/* Choice Text */}
                <h3 className="text-xl md:text-2xl font-semibold mb-2">
                  {choice.text[language]}
                </h3>

                {/* Choice ID */}
                <span className="absolute top-4 right-4 text-3xl font-bold opacity-20">
                  {choice.id}
                </span>

                {/* Selection Indicator */}
                {selectedChoice === choice.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-0 bg-white/20 rounded-2xl"
                  />
                )}

                {/* Loading Overlay for selected choice */}
                {isSubmitting && selectedChoice === choice.id && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-black/30 rounded-2xl flex items-center justify-center"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-8 h-8 border-2 border-white border-t-transparent rounded-full"
                    />
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>

          {/* Submission Status */}
          {isSubmitting && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mt-8"
            >
              <p className="text-white/80">Processing your answer...</p>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// 퀴즈 로딩 컴포넌트
function QuizLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16 border-4 border-white border-t-transparent rounded-full"
      />
    </div>
  );
}

// 퀴즈 에러 컴포넌트
function QuizError({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Quiz Error</h1>
        <p className="text-white/80 mb-4">
          Failed to load quiz: {error.message}
        </p>
        <button
          onClick={retry}
          className="px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-all text-white"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

// 메인 컴포넌트 - React 19 최적화 적용
export default function ModernQuizComponentOptimized() {
  const [language, setLanguage] = useState<'en' | 'ko'>('en');
  const [quizKey, setQuizKey] = useState(0); // 언어 변경 시 전체 퀴즈 재시작용
  
  // React 19 useTransition으로 언어 변경을 부드럽게 처리
  const [isLanguageChanging, startLanguageTransition] = useTransition();
  
  // React 19 useDeferredValue로 언어 변경 시 부드러운 전환
  const deferredLanguage = useDeferredValue(language);

  const handleLanguageChange = () => {
    startLanguageTransition(() => {
      const newLanguage = language === 'en' ? 'ko' : 'en';
      setLanguage(newLanguage);
      setQuizKey(prev => prev + 1); // 퀴즈 재시작
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      {/* Language Toggle */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={handleLanguageChange}
          disabled={isLanguageChanging}
          className={`px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-all ${
            isLanguageChanging ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isLanguageChanging ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block mr-2"
            />
          ) : null}
          {language === 'en' ? '한국어' : 'English'}
        </button>
      </div>

      {/* Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/10">
        <motion.div
          className="h-full bg-gradient-to-r from-pink-500 to-purple-500"
          initial={{ width: 0 }}
          animate={{ width: '0%' }} // Will be updated by child component
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* React 19 Suspense로 퀴즈 세션 관리 */}
      <Suspense fallback={<QuizLoading />}>
        <ErrorBoundary 
          key={quizKey} // 언어 변경 시 에러 바운더리도 리셋
          fallback={(error, retry) => <QuizError error={error} retry={retry} />}
        >
          <QuizSessionContent language={deferredLanguage} />
        </ErrorBoundary>
      </Suspense>
    </div>
  );
}

// Icon helper function
function getIcon(iconName: string) {
  const icons: { [key: string]: string } = {
    users: '👥',
    moon: '🌙',
    fire: '🔥',
    waves: '🌊',
    cloud: '☁️',
    eye: '👁️',
  };
  
  return icons[iconName] || '✨';
}

// Error Boundary 임포트
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';