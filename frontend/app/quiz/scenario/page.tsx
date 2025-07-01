'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { simulationFlow } from '@/lib/simulationDesign';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageToggle from '@/components/ui/LanguageToggle';
import Image from 'next/image';

export default function ScenarioQuizPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const [currentStage, setCurrentStage] = useState(0);
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const stage = simulationFlow.stages[currentStage];

  const handleChoice = (choiceId: string) => {
    // Find the choice object with weights
    const selectedChoice = stage.choices.find(choice => choice.id === choiceId);
    const responseData = { 
      stage: stage.id, 
      choice: choiceId,
      weights: selectedChoice?.weights || {}
    };
    
    console.log('Selected choice:', selectedChoice);
    console.log('Response data:', responseData);
    
    const newResponses = [...responses, responseData];
    setResponses(newResponses);
    
    console.log('All responses so far:', newResponses);

    if (currentStage < simulationFlow.stages.length - 1) {
      setCurrentStage(currentStage + 1);
    } else {
      // Quiz complete
      console.log('Quiz complete, saving responses:', newResponses);
      localStorage.setItem('scenarioResponses', JSON.stringify(newResponses));
      router.push('/quiz/results?type=scenario');
    }
  };

  const getBackgroundImage = () => {
    console.log('Current stage ID:', stage.id);
    const backgrounds: { [key: string]: string } = {
      'city': 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1920&h=1080&fit=crop&q=80', // City skyline
      'entrance': 'https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=1920&h=1080&fit=crop&q=80', // Museum entrance hall
      'exhibition': 'https://images.unsplash.com/photo-1544967882-6abee0447b2b?w=1920&h=1080&fit=crop&q=80', // Gallery exhibition space
      'viewing': 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=1920&h=1080&fit=crop&q=80', // People viewing art
      'moment': 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=1920&h=1080&fit=crop&q=80', // Abstract art moment
      'rest': 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1920&h=1080&fit=crop&q=80', // Museum cafe
      'shop': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&h=1080&fit=crop&q=80', // Museum shop
      'reflection': 'https://images.unsplash.com/photo-1470219556762-1771e7f9427d?w=1920&h=1080&fit=crop&q=80' // Reflective space
    };
    const bgImage = backgrounds[stage.id] || backgrounds['city'];
    console.log('Selected background image:', bgImage);
    return bgImage;
  };

  const getChoiceImage = (choiceId: string) => {
    const choiceImages: { [key: string]: string } = {
      'modern': 'https://images.unsplash.com/photo-1565367505395-4a0b3de92301?w=800&h=600&fit=crop',
      'classical': 'https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=800&h=600&fit=crop',
      'alone': 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=800&h=600&fit=crop',
      'docent': 'https://images.unsplash.com/photo-1568306281853-4704b3a3ac1c?w=800&h=600&fit=crop',
      'emotion': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
      'meaning': 'https://images.unsplash.com/photo-1507643179773-3e975d7ac515?w=800&h=600&fit=crop',
      'flow': 'https://images.unsplash.com/photo-1502481851512-e9e2529bfbf9?w=800&h=600&fit=crop',
      'systematic': 'https://images.unsplash.com/photo-1568827999250-3f6afff96e66?w=800&h=600&fit=crop',
      'abstract': 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=800&h=600&fit=crop',
      'realistic': 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&h=600&fit=crop',
      'journal': 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=600&fit=crop',
      'share': 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=600&fit=crop',
      'postcard': 'https://images.unsplash.com/photo-1575995872537-3793d29d972c?w=800&h=600&fit=crop',
      'book': 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&h=600&fit=crop',
      'feeling': 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&h=600&fit=crop',
      'insight': 'https://images.unsplash.com/photo-1493612276216-ee3925520721?w=800&h=600&fit=crop'
    };
    return choiceImages[choiceId] || 'https://images.unsplash.com/photo-1565367505395-4a0b3de92301?w=800&h=600&fit=crop';
  };

  return (
    <div className="quiz-scenario-background" style={{ 
      position: 'relative',
      minHeight: '100vh',
      overflow: 'hidden',
      backgroundImage: `url(${getBackgroundImage()})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed'
    }}>
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
              animate={{ width: `${((currentStage + 1) / simulationFlow.stages.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-white/80 mt-2 text-sm">
            {language === 'ko' 
              ? `${currentStage + 1}단계 / 총 ${simulationFlow.stages.length}단계`
              : `Stage ${currentStage + 1} of ${simulationFlow.stages.length}`
            }
          </p>
        </div>

        {/* Stage Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={stage.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-col justify-center items-center max-w-6xl mx-auto w-full"
          >
            {/* Narrative */}
            <div className="sayu-quiz-card rounded-2xl p-6 md:p-8 mb-8 max-w-3xl w-full">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                {(() => {
                  console.log('Language:', language, 'Stage name (ko):', stage.name, 'Stage name (en):', stage.name_en);
                  return language === 'ko' ? stage.name : stage.name_en;
                })()}
              </h2>
              <p className="text-white/90 text-lg leading-relaxed mb-6">
                {(() => {
                  console.log('Narrative (ko):', stage.narrative, 'Narrative (en):', stage.narrative_en);
                  return language === 'ko' ? stage.narrative : stage.narrative_en;
                })()}
              </p>
              <p className="text-white text-xl font-semibold">
                {(() => {
                  console.log('Question (ko):', stage.question, 'Question (en):', stage.question_en);
                  return language === 'ko' ? stage.question : stage.question_en;
                })()}
              </p>
            </div>

            {/* Choices */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
              {stage.choices.map((choice) => (
                <motion.button
                  key={choice.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleChoice(choice.id)}
                  className="sayu-choice-button relative group overflow-hidden rounded-2xl shadow-2xl"
                >
                  {/* Choice Image */}
                  <div className="aspect-video relative">
                    <img
                      src={getChoiceImage(choice.id)}
                      alt={choice.text}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1565367505395-4a0b3de92301?w=800&h=600&fit=crop';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  </div>

                  {/* Choice Text */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-left">
                    <h3 className="text-white text-xl md:text-2xl font-bold mb-2">
                      {(() => {
                        console.log(`Choice ${choice.id} - Label (ko):`, choice.label, 'Label (en):', choice.label_en);
                        return language === 'ko' ? choice.label : choice.label_en;
                      })()}
                    </h3>
                    <p className="text-white/80 text-sm md:text-base">
                      {(() => {
                        console.log(`Choice ${choice.id} - Description (ko):`, choice.description, 'Description (en):', choice.description_en);
                        return language === 'ko' ? choice.description : choice.description_en;
                      })()}
                    </p>
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