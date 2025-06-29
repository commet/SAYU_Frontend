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
    // Calculate personality type
    const type = [
      finalScores.L > finalScores.S ? 'L' : 'S',
      finalScores.A > finalScores.R ? 'A' : 'R',
      finalScores.E > finalScores.M ? 'E' : 'M',
      finalScores.F > finalScores.C ? 'F' : 'C'
    ].join('');

    // Store results
    localStorage.setItem('quizResults', JSON.stringify({
      personalityType: type,
      scores: finalScores,
      responses: allResponses,
      completedAt: new Date().toISOString()
    }));

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
    <div className={cn(
      "min-h-screen transition-all duration-1000 relative overflow-hidden",
      fallbackGradients[phase]
    )}>
      {/* Background Image Layer (when implemented) */}
      {backgroundImage && (
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      )}
      
      {/* Gradient Overlay */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br",
        backgroundData.overlay.color
      )} style={{ opacity: backgroundData.overlay.opacity }} />

      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 p-4 backdrop-blur-sm bg-white/5">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          {/* Back button */}
          <button
            onClick={handleGoBack}
            className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            {currentQuestion > 0 ? 'Previous' : 'Back to Intro'}
          </button>
          
          {/* Progress dots */}
          <div className="flex gap-1">
            {[...Array(narrativeQuestions.length)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all duration-300",
                  i <= currentQuestion ? 'bg-white/70 w-2' : 'bg-white/30'
                )}
              />
            ))}
          </div>
          
          {/* Exit button */}
          <button
            onClick={handleExitQuiz}
            className="text-sm text-white/70 hover:text-white transition-colors"
          >
            <Home size={16} />
          </button>
        </div>
      </nav>

      {/* Act Indicator */}
      <motion.div
        className="fixed top-20 left-8 text-white/60 text-sm font-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Act {currentAct === 'curiosity' ? 'I' : currentAct === 'exploration' ? 'II' : 'III'}: 
        {' '}{currentAct.charAt(0).toUpperCase() + currentAct.slice(1)}
      </motion.div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-20 flex items-center justify-center min-h-screen">
        <AnimatePresence mode="wait">
          {!isTransitioning && (
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.8, ease: [0.390, 0.575, 0.565, 1.000] }}
              className="max-w-4xl w-full"
            >
              {/* Narrative Setup */}
              {(question.narrative.setup || question.narrative.transition) && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-white/80 text-lg mb-8 text-center italic leading-relaxed"
                >
                  {getTransitionText()}
                </motion.p>
              )}

              {/* Question */}
              <motion.h2
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="text-3xl md:text-4xl font-serif text-white text-center mb-12 leading-relaxed"
              >
                {question.question}
              </motion.h2>

              {/* Options */}
              <div className="grid md:grid-cols-2 gap-6 mt-12">
                {question.options.map((option, index) => (
                  <motion.div
                    key={option.id}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                  >
                    <button
                      onClick={() => handleChoice(option.id)}
                      className={cn(
                        "w-full p-8 rounded-2xl",
                        "bg-white/10 backdrop-blur-md",
                        "border border-white/20",
                        "hover:bg-white/20 hover:border-white/30",
                        "transition-all duration-500",
                        "text-left group",
                        "shadow-gentle hover:shadow-embrace"
                      )}
                    >
                      <h3 className="text-xl font-medium text-white mb-2 group-hover:translate-x-1 transition-transform">
                        {option.text}
                      </h3>
                      {option.subtext && (
                        <p className="text-white/60 text-sm italic">
                          {option.subtext}
                        </p>
                      )}
                      
                      {/* Hover indicator */}
                      <div className="mt-4 flex items-center text-white/40 group-hover:text-white/60 transition-colors">
                        <span className="text-xs mr-2">Choose this path</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </button>
                  </motion.div>
                ))}
              </div>

              {/* Atmosphere indicator */}
              {question.narrative.atmosphere && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.3 }}
                  transition={{ delay: 1 }}
                  className="text-center mt-12 text-white/40 text-sm"
                >
                  <Sparkles className="w-4 h-4 inline mr-2" />
                  The gallery whispers: {question.narrative.atmosphere}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Gallery sweep transition effect */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: [0.65, 0, 0.35, 1] }}
            className="fixed inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          />
        )}
      </AnimatePresence>

      {/* Encouragement Toast */}
      <EmotionalToast
        message={encouragementMessage}
        emoji="✨"
        isVisible={showEncouragement}
      />
      
      {/* Exit Confirmation Modal */}
      <AnimatePresence>
        {showExitConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowExitConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-dream"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-serif mb-4 text-[hsl(var(--journey-midnight))]">Leave your journey?</h3>
              <p className="text-[hsl(var(--journey-twilight))] mb-6">Your progress will be lost. Are you sure you want to exit?</p>
              <div className="flex gap-4">
                <button
                  onClick={() => router.push('/')}
                  className="flex-1 px-6 py-3 bg-[hsl(var(--journey-dusty-rose))] text-white rounded-full hover:brightness-110 transition-all"
                >
                  Yes, exit
                </button>
                <button
                  onClick={() => setShowExitConfirm(false)}
                  className="flex-1 px-6 py-3 border-2 border-[hsl(var(--journey-dusty-rose))] text-[hsl(var(--journey-dusty-rose))] rounded-full hover:bg-[hsl(var(--journey-dusty-rose)/0.1)] transition-all"
                >
                  Continue journey
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};