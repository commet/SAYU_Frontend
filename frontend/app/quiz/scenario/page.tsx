'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { narrativeQuestions } from '@/data/narrative-quiz-questions-enhanced';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageToggle from '@/components/ui/LanguageToggle';

export default function ScenarioQuizPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const [currentStage, setCurrentStage] = useState(0);
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const question = narrativeQuestions[currentStage];
  
  // Early return if question is not available (SSR safety)
  if (!question || !mounted) {
    return <div>Loading...</div>;
  }

  const handleChoice = (choiceId: string) => {
    // Find the choice object with weights
    const selectedChoice = question.options.find(option => option.id === choiceId);
    const responseData = { 
      questionId: question.id, 
      choice: choiceId,
      weight: selectedChoice?.weight || {}
    };
    
    const newResponses = [...responses, responseData];
    setResponses(newResponses);

    if (currentStage < narrativeQuestions.length - 1) {
      setCurrentStage(currentStage + 1);
    } else {
      // Quiz complete
      localStorage.setItem('scenarioResponses', JSON.stringify(newResponses));
      router.push('/quiz/results?type=scenario');
    }
  };

  const getBackgroundGradient = () => {
    // Beautiful gradient backgrounds for each stage
    const gradients: { [number: number]: string } = {
      1: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', // Deep blue - entrance
      2: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)', // Gallery blue
      3: 'linear-gradient(135deg, #403b4a 0%, #e7e9bb 100%)', // Mystic purple
      4: 'linear-gradient(135deg, #e53935 0%, #e35d5b 100%)', // Red passion
      5: 'linear-gradient(135deg, #f2994a 0%, #f2c94c 100%)', // Warm sunset
      6: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)', // Sky blue
      7: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)', // Electric purple
      8: 'linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%)', // Ancient gold
      9: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', // Soft contrast
      10: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)', // Hidden corner
      11: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Personal connection
      12: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', // Reflection
      13: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)', // Revelation
      14: 'linear-gradient(135deg, #cfd9df 0%, #e2ebf0 100%)', // Transition
      15: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'  // Transformation
    };
    return gradients[question.id] || gradients[1];
  };

  const getChoiceGradient = (choiceId: string) => {
    const choiceGradients: { [key: string]: string } = {
      // Question 1 - entrance paths
      'solitary': 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', // Quiet blue
      'social': 'linear-gradient(135deg, #f2994a 0%, #f2c94c 100%)', // Warm social
      
      // Question 2 - curator approach
      'intuitive': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Creative purple
      'structured': 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)', // Structured blue
      
      // Question 3 - first chamber
      'atmosphere': 'linear-gradient(135deg, #ee9ca7 0%, #ffdde1 100%)', // Soft emotional
      'details': 'linear-gradient(135deg, #304352 0%, #d7d2cc 100%)', // Sharp detail
      
      // Question 4 - painting stops you
      'emotional': 'linear-gradient(135deg, #fc466b 0%, #3f5efb 100%)', // Deep feeling
      'analytical': 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', // Analytical green
      
      // Question 5 - temporal dance
      'flowing': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', // Fluid movement
      'methodical': 'linear-gradient(135deg, #434343 0%, #000000 100%)', // Systematic dark
      
      // Question 6 - stranger presence
      'preserve': 'linear-gradient(135deg, #4568dc 0%, #b06ab3 100%)', // Private space
      'share': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', // Shared warmth
      
      // Question 7 - experimental installation
      'immerse': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', // Sensory pink
      'analyze': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', // Analytical blue
      
      // Default fallback gradients
      'ancient': 'linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%)',
      'contemporary': 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
      'overlooked': 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
      'celebrated': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    };
    return choiceGradients[choiceId] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  };

  return (
    <div 
      className="quiz-scenario-background" 
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        background: getBackgroundGradient(),
        overflow: 'auto'
      }}
    >
      {/* Subtle texture overlay */}
      <div style={{ 
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      {/* Language Toggle */}
      <div className="language-toggle" style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 20 }}>
        <LanguageToggle variant="glass" />
      </div>

      {/* Content */}
      <div className="quiz-content" style={{ position: 'relative', zIndex: 10, minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '16px' }}>
        {/* Progress Bar */}
        <div className="w-full max-w-4xl mx-auto mb-6">
          <div className="sayu-liquid-glass rounded-full h-3 p-0.5">
            <motion.div
              className="h-full rounded-full shimmer-animation"
              style={{
                background: 'linear-gradient(90deg, #818cf8, #c084fc, #f472b6)',
              }}
              initial={{ width: 0 }}
              animate={{ width: `${((currentStage + 1) / narrativeQuestions.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-white/80 mt-2 text-sm">
            {language === 'ko' 
              ? `${currentStage + 1}단계 / 총 ${narrativeQuestions.length}단계`
              : `Question ${currentStage + 1} of ${narrativeQuestions.length}`
            }
          </p>
        </div>

        {/* Question Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={question.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-col justify-center items-center max-w-6xl mx-auto w-full"
          >
            {/* Narrative Setup */}
            <div className="sayu-quiz-card rounded-2xl p-6 md:p-8 mb-8 max-w-3xl w-full backdrop-blur-md bg-white/10">
              {question.narrative?.setup && (
                <div className="text-white/90 text-base leading-relaxed mb-4 italic">
                  {language === 'ko' && question.narrative.setup_ko 
                    ? question.narrative.setup_ko 
                    : question.narrative.setup}
                </div>
              )}
              {question.narrative?.transition && (
                <div className="text-white/90 text-base leading-relaxed mb-4">
                  {language === 'ko' && question.narrative.transition_ko
                    ? question.narrative.transition_ko
                    : question.narrative.transition}
                </div>
              )}
              <p className="text-white text-xl md:text-2xl font-semibold">
                {language === 'ko' && question.question_ko 
                  ? question.question_ko 
                  : question.question}
              </p>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
              {question.options.map((option) => (
                <motion.button
                  key={option.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleChoice(option.id)}
                  className="sayu-choice-button relative group overflow-hidden rounded-2xl shadow-2xl backdrop-blur-sm"
                  style={{
                    background: getChoiceGradient(option.id),
                    minHeight: '200px'
                  }}
                >
                  {/* Subtle pattern overlay */}
                  <div 
                    className="absolute inset-0 opacity-10"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                      backgroundSize: '60px 60px'
                    }}
                  />

                  {/* Option Text */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-left">
                    <h3 className="text-white text-xl md:text-2xl font-bold mb-2">
                      {language === 'ko' && option.text_ko 
                        ? option.text_ko 
                        : option.text}
                    </h3>
                    {option.subtext && (
                      <p className="text-white/80 text-sm md:text-base">
                        {language === 'ko' && option.subtext_ko
                          ? option.subtext_ko
                          : option.subtext}
                      </p>
                    )}
                  </div>

                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}