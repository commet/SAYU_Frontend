'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { Heart, Sparkles, ArrowRight, MessageCircle, Lightbulb } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageToggle from '@/components/ui/LanguageToggle';
import { personalityAnimals, getAnimalByType } from '@/data/personality-animals';
import { getChemistry, getChemistryScore } from '@/data/personality-chemistry';
import { EmotionalCard, EmotionalButton } from '@/components/emotional/EmotionalCard';
import '@/styles/emotional-palette.css';

function CompatibilityContent() {
  const { language } = useLanguage();
  const searchParams = useSearchParams();
  const [type1, setType1] = useState<string>('');
  const [type2, setType2] = useState<string>('');
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    // Get types from URL params or localStorage
    const urlType1 = searchParams.get('type1');
    const urlType2 = searchParams.get('type2');
    
    if (urlType1 && urlType2) {
      setType1(urlType1);
      setType2(urlType2);
      setShowResult(true);
    } else {
      // Try to get user's type from localStorage
      // Check multiple possible keys as different quiz components use different keys
      const possibleKeys = ['quizResult', 'quizResults', 'sayu_quiz_result'];
      for (const key of possibleKeys) {
        const storedResults = localStorage.getItem(key);
        if (storedResults) {
          try {
            const parsed = JSON.parse(storedResults);
            const type = parsed.personalityType || parsed.type || parsed.personality_type;
            if (type) {
              setType1(type);
              break;
            }
          } catch (e) {
            console.error(`Error parsing ${key}:`, e);
          }
        }
      }
    }
  }, [searchParams]);

  const handleCheckCompatibility = () => {
    if (type1 && type2) {
      setShowResult(true);
    }
  };

  const chemistry = type1 && type2 ? getChemistry(type1, type2) : null;
  const animal1 = type1 ? getAnimalByType(type1) : null;
  const animal2 = type2 ? getAnimalByType(type2) : null;
  const score = chemistry ? getChemistryScore(chemistry.compatibility) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--gallery-pearl))] via-[hsl(var(--gallery-white))] to-[hsl(var(--journey-dawn-cream))]">
      {/* Language Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <LanguageToggle variant="glass" />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Heart className="w-16 h-16 mx-auto mb-6 text-[hsl(var(--journey-dusty-rose))]" />
          <h1 className="text-4xl md:text-5xl font-serif mb-4 text-[hsl(var(--journey-midnight))]">
            {language === 'ko' ? '예술 궁합 케미스트리' : 'Art Chemistry Match'}
          </h1>
          <p className="text-xl text-[hsl(var(--journey-twilight))] opacity-80">
            {language === 'ko' 
              ? '함께 전시를 볼 때의 시너지를 확인해보세요' 
              : 'Discover your exhibition synergy'
            }
          </p>
        </motion.div>

        {!showResult ? (
          /* Type Selection */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Type 1 Selection */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8">
              <h3 className="text-xl font-medium mb-4 text-[hsl(var(--journey-midnight))]">
                {language === 'ko' ? '첫 번째 유형' : 'First Type'}
              </h3>
              <div className="grid grid-cols-4 gap-4">
                {Object.entries(personalityAnimals).map(([key, animal]) => (
                  <button
                    key={key}
                    onClick={() => setType1(key)}
                    className={`p-4 rounded-xl transition-all ${
                      type1 === key 
                        ? 'bg-[hsl(var(--journey-twilight))] text-white' 
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    <div className="text-3xl mb-2">{animal.emoji}</div>
                    <div className="text-xs font-medium">{key}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Type 2 Selection */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8">
              <h3 className="text-xl font-medium mb-4 text-[hsl(var(--journey-midnight))]">
                {language === 'ko' ? '두 번째 유형' : 'Second Type'}
              </h3>
              <div className="grid grid-cols-4 gap-4">
                {Object.entries(personalityAnimals).map(([key, animal]) => (
                  <button
                    key={key}
                    onClick={() => setType2(key)}
                    className={`p-4 rounded-xl transition-all ${
                      type2 === key 
                        ? 'bg-[hsl(var(--journey-dusty-rose))] text-white' 
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    <div className="text-3xl mb-2">{animal.emoji}</div>
                    <div className="text-xs font-medium">{key}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Check Button */}
            <motion.div className="text-center">
              <EmotionalButton
                variant="primary"
                size="lg"
                onClick={handleCheckCompatibility}
                disabled={!type1 || !type2}
                className="mx-auto"
              >
                <Sparkles className="w-5 h-5" />
                {language === 'ko' ? '궁합 확인하기' : 'Check Chemistry'}
              </EmotionalButton>
            </motion.div>
          </motion.div>
        ) : (
          /* Compatibility Result */
          <AnimatePresence>
            {chemistry && animal1 && animal2 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="space-y-8"
              >
                {/* Animal Pair Display */}
                <EmotionalCard className="p-8">
                  <div className="flex items-center justify-center gap-8 mb-8">
                    <motion.div
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      className="text-center"
                    >
                      <div className="text-6xl mb-2">{animal1.emoji}</div>
                      <p className="font-medium">{type1}</p>
                      <p className="text-sm opacity-70">
                        {language === 'ko' ? animal1.animal_ko : animal1.animal}
                      </p>
                    </motion.div>

                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      <Heart className="w-12 h-12 text-[hsl(var(--journey-dusty-rose))]" />
                    </motion.div>

                    <motion.div
                      initial={{ x: 50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      className="text-center"
                    >
                      <div className="text-6xl mb-2">{animal2.emoji}</div>
                      <p className="font-medium">{type2}</p>
                      <p className="text-sm opacity-70">
                        {language === 'ko' ? animal2.animal_ko : animal2.animal}
                      </p>
                    </motion.div>
                  </div>

                  {/* Compatibility Score */}
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/50 rounded-full">
                      <span className="text-3xl font-bold text-[hsl(var(--journey-twilight))]">
                        {score}%
                      </span>
                      <span className="text-sm opacity-70">
                        {language === 'ko' ? '케미스트리' : 'Chemistry'}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h2 className="text-2xl font-serif text-center mb-4">
                    {language === 'ko' ? chemistry.title_ko : chemistry.title}
                  </h2>

                  {/* Synergy Description */}
                  <div className="bg-white/50 rounded-xl p-6 mb-6">
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-[hsl(var(--journey-amber))] mt-1" />
                      <p className="text-lg">
                        {language === 'ko' 
                          ? chemistry.synergy.description_ko 
                          : chemistry.synergy.description
                        }
                      </p>
                    </div>
                  </div>

                  {/* Recommended Exhibitions */}
                  <div className="mb-6">
                    <h3 className="font-medium mb-3 flex items-center gap-2">
                      <ArrowRight className="w-5 h-5" />
                      {language === 'ko' ? '추천 전시' : 'Recommended Exhibitions'}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {(language === 'ko' 
                        ? chemistry.recommendedExhibitions_ko 
                        : chemistry.recommendedExhibitions
                      ).map((exhibition, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-white/70 rounded-full text-sm"
                        >
                          {exhibition}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Conversation Example */}
                  <div className="mb-6">
                    <h3 className="font-medium mb-3 flex items-center gap-2">
                      <MessageCircle className="w-5 h-5" />
                      {language === 'ko' ? '대화 예시' : 'Conversation Example'}
                    </h3>
                    <div className="space-y-3">
                      {chemistry.conversationExamples.map((conv, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-start gap-2">
                            <span className="text-2xl">{animal1.emoji}</span>
                            <div className="bg-white/70 rounded-2xl rounded-tl-sm px-4 py-2 max-w-xs">
                              <p className="text-sm">
                                {language === 'ko' ? conv.person1_ko : conv.person1}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2 justify-end">
                            <div className="bg-[hsl(var(--journey-lavender))]/30 rounded-2xl rounded-tr-sm px-4 py-2 max-w-xs">
                              <p className="text-sm">
                                {language === 'ko' ? conv.person2_ko : conv.person2}
                              </p>
                            </div>
                            <span className="text-2xl">{animal2.emoji}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tips */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white/50 rounded-xl p-4">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4" />
                        {language === 'ko' ? `${animal1.animal_ko}를 위한 팁` : `Tips for ${animal1.animal}`}
                      </h4>
                      <p className="text-sm opacity-80">
                        {language === 'ko' ? chemistry.tips.for_type1_ko : chemistry.tips.for_type1}
                      </p>
                    </div>
                    <div className="bg-white/50 rounded-xl p-4">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4" />
                        {language === 'ko' ? `${animal2.animal_ko}를 위한 팁` : `Tips for ${animal2.animal}`}
                      </h4>
                      <p className="text-sm opacity-80">
                        {language === 'ko' ? chemistry.tips.for_type2_ko : chemistry.tips.for_type2}
                      </p>
                    </div>
                  </div>
                </EmotionalCard>

                {/* Try Another Button */}
                <motion.div className="text-center">
                  <EmotionalButton
                    variant="ghost"
                    onClick={() => {
                      setShowResult(false);
                      setType2('');
                    }}
                  >
                    {language === 'ko' ? '다른 궁합 보기' : 'Try Another Match'}
                  </EmotionalButton>
                </motion.div>
              </motion.div>
            ) : (
              // Error fallback when chemistry data is not found
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <EmotionalCard className="p-8">
                  <div className="text-6xl mb-4">🤔</div>
                  <h2 className="text-2xl font-serif mb-4 text-[hsl(var(--journey-midnight))]">
                    {language === 'ko' ? '궁합 데이터를 찾을 수 없습니다' : 'Chemistry data not found'}
                  </h2>
                  <p className="text-[hsl(var(--journey-twilight))] mb-6">
                    {language === 'ko' 
                      ? '선택한 성격 유형의 궁합 정보가 아직 준비되지 않았습니다.' 
                      : 'The compatibility information for the selected personality types is not yet available.'}
                  </p>
                  <EmotionalButton
                    variant="primary"
                    onClick={() => {
                      setShowResult(false);
                      setType1('');
                      setType2('');
                    }}
                  >
                    {language === 'ko' ? '다시 선택하기' : 'Select Again'}
                  </EmotionalButton>
                </EmotionalCard>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--gallery-pearl))] via-[hsl(var(--gallery-white))] to-[hsl(var(--journey-dawn-cream))] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(var(--journey-twilight))] mx-auto mb-4"></div>
        <p className="text-[hsl(var(--journey-twilight))]">Loading...</p>
      </div>
    </div>
  );
}

export default function CompatibilityPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CompatibilityContent />
    </Suspense>
  );
}