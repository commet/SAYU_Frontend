'use client';

import { useState, useEffect } from 'react';
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

export default function ModernQuizComponent() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 12 });
  const [language, setLanguage] = useState<'en' | 'ko'>('en');
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Start quiz on mount
  useEffect(() => {
    startQuiz();
  }, []);

  const startQuiz = async () => {
    try {
      setLoading(true);
      const response = await api.quiz.start({ language });
      
      if (response.success) {
        setSessionId(response.sessionId);
        setCurrentQuestion(response.currentQuestion);
        setProgress(response.progress);
      }
    } catch (error) {
      console.error('Failed to start quiz:', error);
      alert('Failed to start quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async (choiceId: string) => {
    if (!sessionId || !currentQuestion || isTransitioning) return;

    try {
      setIsTransitioning(true);
      setSelectedChoice(choiceId);
      
      const response = await api.quiz.answer({
        sessionId,
        questionId: currentQuestion.id,
        choiceId,
      });

      if (response.success) {
        if (response.completed) {
          // Quiz completed - navigate to results
          localStorage.setItem('quizResult', JSON.stringify(response.result));
          setTimeout(() => {
            router.push(`/quiz/results?type=${response.result.personalityType}`);
          }, 500);
        } else {
          // Next question
          setTimeout(() => {
            setCurrentQuestion(response.nextQuestion);
            setProgress(response.progress);
            setSelectedChoice(null);
            setIsTransitioning(false);
          }, 800);
        }
      }
    } catch (error) {
      console.error('Failed to submit answer:', error);
      alert('Failed to submit answer. Please try again.');
      setIsTransitioning(false);
    }
  };

  if (loading || !currentQuestion) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      {/* Language Toggle */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => setLanguage(language === 'en' ? 'ko' : 'en')}
          className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-all"
        >
          {language === 'en' ? '한국어' : 'English'}
        </button>
      </div>

      {/* Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/10">
        <motion.div
          className="h-full bg-gradient-to-r from-pink-500 to-purple-500"
          initial={{ width: 0 }}
          animate={{ width: `${(progress.current / progress.total) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

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
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => submitAnswer(choice.id)}
                  disabled={isTransitioning}
                  className={`
                    relative overflow-hidden rounded-2xl p-8 text-left
                    transition-all duration-300 transform
                    ${selectedChoice === choice.id 
                      ? 'ring-4 ring-white scale-105' 
                      : 'hover:ring-2 hover:ring-white/50'
                    }
                    ${isTransitioning && selectedChoice !== choice.id 
                      ? 'opacity-50' 
                      : ''
                    }
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
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
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