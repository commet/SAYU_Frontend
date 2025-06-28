'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { simulationFlow } from '@/lib/simulationDesign';
import { generatePlaceholderImages } from '@/lib/geminiConsult';
import { museumImages, stableImageFallbacks } from '@/lib/imageUrls';

interface SimulationProps {
  onComplete: (responses: any[]) => void;
}

export default function MuseumSimulation({ onComplete }: SimulationProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const [responses, setResponses] = useState<any[]>([]);
  const [geminiAdvice, setGeminiAdvice] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const placeholders = generatePlaceholderImages();
  const stage = simulationFlow.stages[currentStage];

  // Gradient backgrounds for each stage
  const getBackgroundGradient = (stage: number) => {
    const gradients = [
      'bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900', // City view
      'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900', // Museum entrance
      'bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900', // Gallery
      'bg-gradient-to-br from-purple-900 via-pink-900 to-red-900', // Viewing art
      'bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900', // Special moment
      'bg-gradient-to-br from-amber-900 via-orange-900 to-red-900', // Cafe
      'bg-gradient-to-br from-teal-900 via-green-900 to-emerald-900', // Shop
      'bg-gradient-to-br from-orange-900 via-red-900 to-purple-900', // Sunset
    ];
    return gradients[stage] || gradients[0];
  };

  // Choice gradients based on choice ID
  const getChoiceGradient = (choiceId: string) => {
    const choiceGradients: { [key: string]: string } = {
      'modern': 'bg-gradient-to-br from-cyan-600 to-blue-700',
      'classical': 'bg-gradient-to-br from-amber-600 to-orange-700',
      'alone': 'bg-gradient-to-br from-purple-600 to-indigo-700',
      'docent': 'bg-gradient-to-br from-green-600 to-teal-700',
      'emotion': 'bg-gradient-to-br from-pink-600 to-rose-700',
      'meaning': 'bg-gradient-to-br from-indigo-600 to-purple-700',
      'flow': 'bg-gradient-to-br from-violet-600 to-purple-700',
      'systematic': 'bg-gradient-to-br from-blue-600 to-indigo-700',
      'abstract': 'bg-gradient-to-br from-fuchsia-600 to-pink-700',
      'realistic': 'bg-gradient-to-br from-teal-600 to-green-700',
      'journal': 'bg-gradient-to-br from-slate-600 to-gray-700',
      'share': 'bg-gradient-to-br from-orange-600 to-red-700',
      'postcard': 'bg-gradient-to-br from-rose-600 to-pink-700',
      'book': 'bg-gradient-to-br from-emerald-600 to-green-700',
      'feeling': 'bg-gradient-to-br from-purple-600 to-pink-700',
      'insight': 'bg-gradient-to-br from-blue-600 to-cyan-700',
    };
    return choiceGradients[choiceId] || 'bg-gradient-to-br from-gray-600 to-gray-700';
  };

  // Get Gemini's advice on implementation
  useEffect(() => {
    const getGeminiAdvice = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/gemini-consult', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: `
For a museum visit simulation quiz, I need advice on implementing stage ${currentStage + 1}: "${stage.name}"
Context: ${stage.narrative}
Question: ${stage.question}

Specific needs:
1. How to make this stage visually immersive?
2. Best way to present image-based choices?
3. Transition effects between stages?
4. Alternative if we can't get real photos?

Please provide concise, practical advice.
            `
          })
        });
        
        const data = await response.json();
        if (data.success) {
          setGeminiAdvice(data.response);
        }
      } catch (error) {
        console.error('Failed to get Gemini advice:', error);
      } finally {
        setLoading(false);
      }
    };

    // Only get advice for the first stage to avoid too many API calls
    if (currentStage === 0 && !geminiAdvice) {
      getGeminiAdvice();
    }
  }, [currentStage, stage, geminiAdvice]);

  const handleChoice = (choice: any) => {
    const newResponses = [...responses, choice];
    setResponses(newResponses);

    if (currentStage < simulationFlow.stages.length - 1) {
      setCurrentStage(currentStage + 1);
    } else {
      onComplete(newResponses);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background - Gradient fallback while fixing images */}
      <div className="absolute inset-0 z-0">
        <div className={`w-full h-full ${getBackgroundGradient(currentStage)}`} />
        <img
          src={museumImages.backgrounds[stage.backgroundImage.split('/').pop()?.replace('.jpg', '') as keyof typeof museumImages.backgrounds]}
          alt={stage.name}
          className="absolute inset-0 w-full h-full object-cover opacity-0"
          style={{ filter: 'brightness(0.7)' }}
          onLoad={(e) => {
            const img = e.target as HTMLImageElement;
            img.style.opacity = '1';
            img.style.transition = 'opacity 0.5s ease-in-out';
          }}
          onError={(e) => {
            console.error('Image failed to load:', stage.backgroundImage);
          }}
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col justify-center items-center p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl w-full"
          >
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white/80 text-sm">
                  단계 {currentStage + 1} / {simulationFlow.stages.length}
                </span>
                <span className="text-white font-medium">
                  {stage.name}
                </span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-pink-500 to-purple-500 h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentStage + 1) / simulationFlow.stages.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Narrative */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {stage.narrative}
              </h2>
              <p className="text-xl text-white/90">
                {stage.question}
              </p>
            </motion.div>

            {/* Choices */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {stage.choices.map((choice, index) => (
                <motion.button
                  key={choice.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleChoice(choice)}
                  className="relative group overflow-hidden rounded-2xl shadow-2xl transform transition-all duration-300 hover:shadow-3xl"
                >
                  {/* Choice Background with gradient fallback */}
                  <div className="absolute inset-0 z-0">
                    <div className={`w-full h-full ${getChoiceGradient(choice.id)}`} />
                    <img
                      src={museumImages.choices[choice.image.split('/').pop()?.replace('.jpg', '') as keyof typeof museumImages.choices]}
                      alt={choice.label}
                      className="absolute inset-0 w-full h-full object-cover opacity-0"
                      style={{ filter: 'brightness(0.8)' }}
                      onLoad={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.style.opacity = '1';
                        img.style.transition = 'opacity 0.5s ease-in-out';
                      }}
                      onError={(e) => {
                        console.error('Choice image failed to load:', choice.image);
                      }}
                    />
                  </div>
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />
                  
                  {/* Content */}
                  <div className="relative z-20 p-8 md:p-12 text-left h-full flex flex-col justify-end min-h-[250px]">
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                      {choice.label}
                    </h3>
                    <p className="text-white/80">
                      {choice.description}
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Gemini Advice (Development Only) */}
            {process.env.NODE_ENV === 'development' && geminiAdvice && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-8 p-4 bg-white/10 rounded-lg text-white/80 text-sm"
              >
                <h4 className="font-bold mb-2">Gemini's Implementation Advice:</h4>
                <p className="whitespace-pre-wrap">{geminiAdvice}</p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}