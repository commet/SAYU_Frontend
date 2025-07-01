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
    const newResponses = [...responses, { stage: stage.id, choice: choiceId }];
    setResponses(newResponses);

    if (currentStage < simulationFlow.stages.length - 1) {
      setCurrentStage(currentStage + 1);
    } else {
      // Quiz complete
      localStorage.setItem('scenarioResponses', JSON.stringify(newResponses));
      router.push('/quiz/results?type=scenario');
    }
  };

  const getBackgroundImage = () => {
    const backgrounds: { [key: string]: string } = {
      'city': 'city-view',
      'entrance': 'museum-entrance',
      'exhibition': 'gallery-space',
      'viewing': 'viewing-art',
      'moment': 'special-moment',
      'rest': 'museum-cafe',
      'shop': 'museum-shop',
      'reflection': 'sunset-street'
    };
    return backgrounds[stage.id] || 'city-view';
  };

  const getChoiceImage = (choiceId: string) => {
    const choiceImages: { [key: string]: string } = {
      'modern': 'modern-museum',
      'classical': 'classical-museum',
      'alone': 'alone-viewing',
      'docent': 'docent-tour',
      'emotion': 'emotional-response',
      'meaning': 'analytical-response',
      'flow': 'flow-viewing',
      'systematic': 'reading-labels',
      'abstract': 'abstract-art',
      'realistic': 'portrait-art',
      'journal': 'writing-journal',
      'share': 'sharing-phone',
      'postcard': 'art-postcard',
      'book': 'art-book',
      'feeling': 'emotional-memory',
      'insight': 'new-perspective'
    };
    return choiceImages[choiceId] || 'modern-museum';
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src={`/api/museum-image?type=backgrounds&name=${getBackgroundImage()}`}
          alt="Museum scene"
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = '/api/placeholder-image?type=backgrounds&name=' + getBackgroundImage();
          }}
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Language Toggle removed - now in floating nav */}

      {/* Content */}
      <div className="relative z-10 h-screen flex flex-col p-4 md:p-8">
        {/* Progress Bar */}
        <div className="w-full max-w-4xl mx-auto mb-6">
          <div className="glass rounded-full h-3 p-0.5">
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
            <div className="glass-dark rounded-2xl p-6 md:p-8 mb-8 max-w-3xl w-full">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                {stage[`name_${language}`] || stage.name}
              </h2>
              <p className="text-white/90 text-lg leading-relaxed mb-6">
                {stage[`narrative_${language}`] || stage.narrative}
              </p>
              <p className="text-white text-xl font-semibold">
                {stage[`question_${language}`] || stage.question}
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
                  className="relative group overflow-hidden rounded-2xl shadow-2xl liquid-glass"
                >
                  {/* Choice Image */}
                  <div className="aspect-video relative">
                    <img
                      src={`/api/museum-image?type=choices&name=${getChoiceImage(choice.id)}`}
                      alt={choice.text}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/api/placeholder-image?type=choices&name=' + getChoiceImage(choice.id);
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  </div>

                  {/* Choice Text */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-left">
                    <h3 className="text-white text-xl md:text-2xl font-bold mb-2">
                      {choice[`text_${language}`] || choice.text}
                    </h3>
                    <p className="text-white/80 text-sm md:text-base">
                      {choice[`description_${language}`] || choice.description || (language === 'ko' ? '이 선택지를 클릭하세요' : 'Click to choose this path')}
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