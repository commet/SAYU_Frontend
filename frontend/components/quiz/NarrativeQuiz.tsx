'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  narrativeQuestions, 
  getPersonalizedTransition,
  encouragingFeedback,
  type NarrativeQuestion
} from '@/data/narrative-quiz-questions';
import { 
  getBackgroundForQuestion, 
  getPhaseByQuestion, 
  fallbackGradients 
} from '@/data/quiz-backgrounds';
import { EmotionalButton, EmotionalToast, GalleryTransition } from '@/components/emotional/EmotionalCard';
import { ChevronRight, Sparkles, ArrowLeft, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { calculateEnhancedScore } from '@/lib/quiz-scoring-enhanced';

interface QuizResponse {
  questionId: number;
  choice: string;
  weight: Record<string, number>;
  emotional: string;
}

export const NarrativeQuiz: React.FC = () => {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<QuizResponse[]>([]);
  const [showEncouragement, setShowEncouragement] = useState(false);
  const [encouragementMessage, setEncouragementMessage] = useState('');
  const [currentAct, setCurrentAct] = useState<'curiosity' | 'exploration' | 'revelation'>('curiosity');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [personalityScores, setPersonalityScores] = useState({
    L: 0, S: 0, A: 0, R: 0, E: 0, M: 0, F: 0, C: 0
  });
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState<string>('');

  const question = narrativeQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / narrativeQuestions.length) * 100;

  // Update act and background based on current question
  useEffect(() => {
    setCurrentAct(question.act);
    
    // Get background for current phase
    const backgroundData = getBackgroundForQuestion(currentQuestion + 1);
    const phase = getPhaseByQuestion(currentQuestion + 1);
    
    // For now, use fallback gradients. In production, would load actual images
    setBackgroundImage('');
  }, [question, currentQuestion]);

  const handleGoBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else {
      router.push('/quiz');
    }
  };

  const handleExitQuiz = () => {
    setShowExitConfirm(true);
  };

  const handleChoice = async (optionId: string) => {
    const selectedOption = question.options.find(opt => opt.id === optionId);
    if (!selectedOption) return;

    // Save response
    const newResponse: QuizResponse = {
      questionId: question.id,
      choice: optionId,
      weight: selectedOption.weight,
      emotional: selectedOption.emotional
    };
    
    const updatedResponses = [...responses, newResponse];
    setResponses(updatedResponses);

    // Update personality scores
    const newScores = { ...personalityScores };
    Object.entries(selectedOption.weight).forEach(([key, value]) => {
      newScores[key as keyof typeof newScores] += value;
    });
    setPersonalityScores(newScores);

    // Show encouraging feedback
    if (currentQuestion % 3 === 2) {
      const message = encouragingFeedback[Math.floor(Math.random() * encouragingFeedback.length)];
      setEncouragementMessage(message);
      setShowEncouragement(true);
      setTimeout(() => setShowEncouragement(false), 3000);
    }

    // Transition to next question or complete
    setIsTransitioning(true);
    
    setTimeout(() => {
      if (currentQuestion < narrativeQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setIsTransitioning(false);
      } else {
        completeQuiz(updatedResponses, newScores);
      }
    }, 800);
  };

  const completeQuiz = (allResponses: QuizResponse[], finalScores: typeof personalityScores) => {
    // Use enhanced scoring system for better distribution
    const type = calculateEnhancedScore(finalScores, allResponses);

    // Store results
    const quizData = {
      personalityType: type,
      scores: finalScores,
      responses: allResponses,
      completedAt: new Date().toISOString()
    };
    
    localStorage.setItem('quizResults', JSON.stringify(quizData));
    
    // Also save to guest storage for progressive onboarding
    if (typeof window !== 'undefined') {
      import('@/lib/guest-storage').then(({ GuestStorage }) => {
        GuestStorage.saveQuizResults(quizData);
        
        // Dispatch milestone event for progressive prompt
        window.dispatchEvent(new CustomEvent('guest-milestone', { 
          detail: { milestone: 'quiz_completed' }
        }));
      });
    }

    // Navigate to results
    router.push(`/results?type=${type}`);
  };

  const getTransitionText = () => {
    if (currentQuestion === 0) return question.narrative.setup;
    
    const previousResponse = responses[responses.length - 1];
    if (previousResponse) {
      return getPersonalizedTransition(
        currentQuestion,
        currentQuestion + 1,
        previousResponse.choice
      );
    }
    
    return question.narrative.transition || '';
  };

  const phase = getPhaseByQuestion(currentQuestion + 1);
  const backgroundData = getBackgroundForQuestion(currentQuestion + 1);
  
  return (
    <div className="min-h-screen bg-off-white relative">
      {/* Subtle background with personality color */}
      <div 
        className="absolute inset-0 opacity-10 transition-all duration-slow"
        style={{ 
          background: `var(--personality-primary, var(--primary))` 
        }} 
      />

      {/* Navigation Bar - Minimalist Design */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-moderate border-b border-light-gray">
        <div className="flex justify-between items-center max-w-4xl mx-auto px-lg py-md">
          {/* Back button */}
          <button
            onClick={handleGoBack}
            className="flex items-center gap-sm text-sm text-dark-gray hover:text-black transition-colors duration-base"
          >
            <ArrowLeft size={16} />
            <span className="font-medium">
              {currentQuestion > 0 ? 'Previous' : 'Back'}
            </span>
          </button>
          
          {/* Progress indicator - Simple line */}
          <div className="flex items-center gap-xs">
            <div className="w-32 h-1 bg-light-gray rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-slow ease-out rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs text-dark-gray font-medium min-w-fit">
              {currentQuestion + 1} / {narrativeQuestions.length}
            </span>
          </div>
          
          {/* Exit button */}
          <button
            onClick={handleExitQuiz}
            className="p-xs text-dark-gray hover:text-black transition-colors duration-base"
          >
            <Home size={16} />
          </button>
        </div>
      </nav>

      {/* Act indicator - Minimal and elegant */}
      <motion.div
        className="fixed top-24 left-lg text-dark-gray text-sm font-medium z-40"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <div className="font-display">
          {currentAct === 'curiosity' ? 'Curiosity' : 
           currentAct === 'exploration' ? 'Exploration' : 'Revelation'}
        </div>
      </motion.div>

      {/* Main Content - Clean and focused */}
      <div className="flex items-center justify-center min-h-screen pt-20 pb-xl">
        <AnimatePresence mode="wait">
          {!isTransitioning && (
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="max-w-3xl w-full px-lg"
            >
              {/* Narrative Setup */}
              {(question.narrative.setup || question.narrative.transition) && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-dark-gray text-lg mb-xl text-center font-body leading-relaxed"
                >
                  {getTransitionText()}
                </motion.p>
              )}

              {/* Question */}
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-2xl md:text-3xl font-display font-medium text-black text-center mb-2xl leading-tight"
              >
                {question.question}
              </motion.h1>

              {/* Options */}
              <div className="grid gap-md max-w-2xl mx-auto">
                {question.options.map((option, index) => (
                  <motion.div
                    key={option.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    <button
                      onClick={() => handleChoice(option.id)}
                      className={cn(
                        "w-full p-lg rounded-lg text-left",
                        "bg-white border border-gray",
                        "hover:bg-off-white hover:border-primary/30 hover:shadow-gentle",
                        "transition-all duration-base ease-out",
                        "group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      )}
                    >
                      <h3 className="font-body font-medium text-lg text-black mb-xs leading-tight">
                        {option.text}
                      </h3>
                      {option.subtext && (
                        <p className="text-dark-gray text-sm leading-normal">
                          {option.subtext}
                        </p>
                      )}
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Simple transition overlay */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-white/60 backdrop-blur-subtle z-30"
          />
        )}
      </AnimatePresence>

      {/* Encouragement Toast */}
      <EmotionalToast
        message={encouragementMessage}
        emoji="✨"
        isVisible={showEncouragement}
      />
      
      {/* Exit Confirmation Modal - Clean and Simple */}
      <AnimatePresence>
        {showExitConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-moderate z-modal flex items-center justify-center p-lg"
            onClick={() => setShowExitConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg p-xl max-w-md w-full shadow-emphasis"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-display text-xl font-medium mb-sm text-black">
                Leave your journey?
              </h3>
              <p className="font-body text-dark-gray mb-xl leading-normal">
                Your progress will be lost. Are you sure you want to exit?
              </p>
              <div className="flex gap-md">
                <button
                  onClick={() => setShowExitConfirm(false)}
                  className="flex-1 px-lg py-md bg-off-white text-black border border-gray rounded-md hover:bg-light-gray transition-colors duration-base font-medium"
                >
                  Continue
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="flex-1 px-lg py-md bg-primary text-white rounded-md hover:bg-primary-dark transition-colors duration-base font-medium"
                >
                  Exit
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};