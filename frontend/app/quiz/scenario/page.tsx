'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { narrativeQuestions } from '@/data/narrative-quiz-questions';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageToggle from '@/components/ui/LanguageToggle';
import Image from 'next/image';

export default function ScenarioQuizPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const [currentStage, setCurrentStage] = useState(0);
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const question = narrativeQuestions[currentStage];

  const handleChoice = (choiceId: string) => {
    // Find the choice object with weights
    const selectedChoice = question.options.find(option => option.id === choiceId);
    const responseData = { 
      questionId: question.id, 
      choice: choiceId,
      weight: selectedChoice?.weight || {}
    };
    
    console.log('Selected choice:', selectedChoice);
    console.log('Response data:', responseData);
    
    const newResponses = [...responses, responseData];
    setResponses(newResponses);
    
    console.log('All responses so far:', newResponses);

    if (currentStage < narrativeQuestions.length - 1) {
      setCurrentStage(currentStage + 1);
    } else {
      // Quiz complete
      console.log('Quiz complete, saving responses:', newResponses);
      localStorage.setItem('scenarioResponses', JSON.stringify(newResponses));
      router.push('/quiz/results?type=scenario');
    }
  };

  const getBackgroundImage = () => {
    console.log('Current question ID:', question.id);
    // Use more reliable image sources with auto format and quality optimization
    const backgrounds: { [number: number]: string } = {
      1: 'https://images.unsplash.com/photo-1554907984-15263bfd63bd?auto=format&fit=crop&w=1920&h=1080&q=80', // Gallery entrance - oak doors opening
      2: 'https://images.unsplash.com/photo-1544967882-6abee0447b2b?auto=format&fit=crop&w=1920&h=1080&q=80', // Gallery interior - curator approaching
      3: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&w=1920&h=1080&q=80', // First chamber - gallery space
      4: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=1920&h=1080&q=80', // Painting that stops you
      5: 'https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&w=1920&h=1080&q=80', // Sunlit alcove with story
      6: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1920&h=1080&q=80', // Another visitor beside you
      7: 'https://images.unsplash.com/photo-1481277542470-605612bd2d61?auto=format&fit=crop&w=1920&h=1080&q=80', // Experimental installation
      8: 'https://images.unsplash.com/photo-1570115864504-73dc2bf0b10e?auto=format&fit=crop&w=1920&h=1080&q=80', // Ancient artifact room
      9: 'https://images.unsplash.com/photo-1515405295579-ba7b45403062?auto=format&fit=crop&w=1920&h=1080&q=80', // Contemporary vs classical wing
      10: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=1920&h=1080&q=80', // Overlooked corner
      11: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&w=1920&h=1080&q=80', // Personal connection work
      12: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1920&h=1080&q=80', // Gallery bench moment
      13: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1920&h=1080&q=80', // Final revelation
      14: 'https://images.unsplash.com/photo-1470219556762-1771e7f9427d?auto=format&fit=crop&w=1920&h=1080&q=80', // Exit transition
      15: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1920&h=1080&q=80'  // Outside - transformation
    };
    const bgImage = backgrounds[question.id] || backgrounds[1];
    console.log('Selected background image:', bgImage);
    
    // Preload the image to ensure it loads properly
    const img = new Image();
    img.src = bgImage;
    
    return bgImage;
  };

  const getChoiceImage = (choiceId: string) => {
    console.log('Getting choice image for:', choiceId);
    const choiceImages: { [key: string]: string } = {
      // Question 1 - entrance paths
      'solitary': 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=800&h=600&fit=crop&q=80', // Quiet corridor in morning light
      'social': 'https://images.unsplash.com/photo-1568306281853-4704b3a3ac1c?w=800&h=600&fit=crop&q=80', // Bustling atrium with people
      
      // Question 2 - curator approach
      'intuitive': 'https://images.unsplash.com/photo-1502481851512-e9e2529bfbf9?w=800&h=600&fit=crop&q=80', // Wandering freely
      'structured': 'https://images.unsplash.com/photo-1568827999250-3f6afff96e66?w=800&h=600&fit=crop&q=80', // Learning exhibition design
      
      // Question 3 - first chamber
      'atmosphere': 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=800&h=600&fit=crop&q=80', // Emotional atmosphere
      'details': 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&h=600&fit=crop&q=80', // Intricate brushwork
      
      // Question 4 - painting stops you
      'emotional': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop&q=80', // Deep emotional response
      'analytical': 'https://images.unsplash.com/photo-1507643179773-3e975d7ac515?w=800&h=600&fit=crop&q=80', // Decoding symbolic language
      
      // Question 5 - temporal dance
      'flowing': 'https://images.unsplash.com/photo-1517685352821-92cf88aee5a5?w=800&h=600&fit=crop&q=80', // Intuitive flow
      'methodical': 'https://images.unsplash.com/photo-1481277542470-605612bd2d61?w=800&h=600&fit=crop&q=80', // Systematic movement
      
      // Question 6 - stranger presence
      'preserve': 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&h=600&fit=crop&q=80', // Private communion
      'share': 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=600&fit=crop&q=80', // Shared wonder
      
      // Question 7 - experimental installation
      'immerse': 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=800&h=600&fit=crop&q=80', // Sensory experience
      'analyze': 'https://images.unsplash.com/photo-1493612276216-ee3925520721?w=800&h=600&fit=crop&q=80', // Conceptual framework
      
      // Default fallback images for other choices
      'ancient': 'https://images.unsplash.com/photo-1570115864504-73dc2bf0b10e?w=800&h=600&fit=crop&q=80',
      'contemporary': 'https://images.unsplash.com/photo-1515405295579-ba7b45403062?w=800&h=600&fit=crop&q=80',
      'overlooked': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80',
      'celebrated': 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop&q=80'
    };
    const choiceImage = choiceImages[choiceId] || 'https://images.unsplash.com/photo-1565367505395-4a0b3de92301?w=800&h=600&fit=crop&q=80';
    console.log('Selected choice image:', choiceImage);
    return choiceImage;
  };

  return (
    <div 
      className="quiz-scenario-background" 
      style={{ 
        position: 'relative',
        minHeight: '100vh',
        overflow: 'hidden',
        backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${getBackgroundImage()})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Dark Overlay */}
      <div style={{ 
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        zIndex: 1
      }} />

      {/* Language Toggle */}
      <div className="language-toggle" style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 20 }}>
        <LanguageToggle variant="glass" />
      </div>

      {/* Content */}
      <div className="quiz-content" style={{ position: 'relative', zIndex: 10, height: '100vh', display: 'flex', flexDirection: 'column', padding: '16px' }}>
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
            <div className="sayu-quiz-card rounded-2xl p-6 md:p-8 mb-8 max-w-3xl w-full">
              {question.narrative?.setup && (
                <div className="text-white/80 text-base leading-relaxed mb-4 italic">
                  {question.narrative.setup}
                </div>
              )}
              {question.narrative?.transition && (
                <div className="text-white/80 text-base leading-relaxed mb-4">
                  {question.narrative.transition}
                </div>
              )}
              <p className="text-white text-xl md:text-2xl font-semibold">
                {question.question}
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
                  className="sayu-choice-button relative group overflow-hidden rounded-2xl shadow-2xl"
                >
                  {/* Option Image */}
                  <div className="aspect-video relative">
                    <img
                      src={getChoiceImage(option.id)}
                      alt={option.text}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1565367505395-4a0b3de92301?w=800&h=600&fit=crop';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  </div>

                  {/* Option Text */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-left">
                    <h3 className="text-white text-xl md:text-2xl font-bold mb-2">
                      {option.text}
                    </h3>
                    {option.subtext && (
                      <p className="text-white/80 text-sm md:text-base">
                        {option.subtext}
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