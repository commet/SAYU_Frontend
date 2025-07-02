'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { WelcomeModal } from '@/components/onboarding/WelcomeModal';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageToggle from '@/components/ui/LanguageToggle';
import { EmotionalButton } from '@/components/emotional/EmotionalCard';
import { Sparkles, Heart, Compass } from 'lucide-react';
import '@/styles/emotional-palette.css';

export default function QuizIntroPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { language } = useLanguage();
  const { showWelcomeModal, setShowWelcomeModal } = useOnboarding();

  const startQuiz = () => {
    router.push('/quiz/narrative');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--gallery-pearl))] via-[hsl(var(--gallery-white))] to-[hsl(var(--journey-dawn-cream))] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.390, 0.575, 0.565, 1.000] }}
        className="max-w-3xl w-full"
      >
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-12 max-w-4xl mx-auto">
          {/* Language Toggle removed - now in floating nav */}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-12"
          >
            <Heart className="w-16 h-16 mx-auto mb-6 text-[hsl(var(--journey-dusty-rose))]" />
            
            <h1 className="text-3xl md:text-5xl font-serif mb-6 text-[hsl(var(--journey-midnight))] leading-tight">
              {language === 'ko' 
                ? '당신만의 예술 여정이 시작됩니다' 
                : 'Your Personal Art Journey Awaits'
              }
            </h1>
            
            <div className="text-xl text-[hsl(var(--journey-twilight))] opacity-80 leading-relaxed max-w-xl mx-auto">
              {language === 'ko' ? (
                <>
                  <p>이것은 테스트가 아닙니다.</p>
                  <p>당신이 아름다움을 경험하는 고유한 방식을 발견하는 여정입니다.</p>
                </>
              ) : (
                <>
                  <p>This isn't a test.</p>
                  <p>It's a journey to discover your unique way of experiencing beauty.</p>
                </>
              )}
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-8 mb-12"
          >
            {/* What You'll Discover */}
            <div className="text-center">
              <h2 className="text-2xl font-serif mb-6 text-[hsl(var(--journey-midnight))] flex items-center justify-center gap-3">
                <Compass className="w-6 h-6" />
                {language === 'ko' ? '무엇을 발견하게 될까요?' : 'What You\'ll Discover'}
              </h2>
              
              <div className="grid md:grid-cols-3 gap-6">
                <motion.div 
                  className="sayu-card p-6"
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-3xl mb-3">🌅</div>
                  <h3 className="font-medium mb-2 text-[hsl(var(--journey-midnight))]">
                    {language === 'ko' ? '당신의 관람 스타일' : 'Your Viewing Style'}
                  </h3>
                  <div className="text-sm text-[hsl(var(--journey-twilight))] opacity-70 whitespace-pre-line">
                    {language === 'ko' 
                      ? '혼자 조용히,\n또는 함께 나누며' 
                      : 'Solitary contemplation\nor shared discovery'
                    }
                  </div>
                </motion.div>
                
                <motion.div 
                  className="sayu-card p-6"
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-3xl mb-3">🎭</div>
                  <h3 className="font-medium mb-2 text-[hsl(var(--journey-midnight))]">
                    {language === 'ko' ? '당신의 감상 방식' : 'Your Perception Style'}
                  </h3>
                  <div className="text-sm text-[hsl(var(--journey-twilight))] opacity-70 whitespace-pre-line">
                    {language === 'ko' 
                      ? '감정적 몰입\n또는 분석적 이해' 
                      : 'Emotional immersion\nor analytical understanding'
                    }
                  </div>
                </motion.div>
                
                <motion.div 
                  className="sayu-card p-6"
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-3xl mb-3">✨</div>
                  <h3 className="font-medium mb-2 text-[hsl(var(--journey-midnight))]">
                    {language === 'ko' ? '당신의 예술 언어' : 'Your Art Language'}
                  </h3>
                  <p className="text-sm text-[hsl(var(--journey-twilight))] opacity-70">
                    {language === 'ko' 
                      ? '당신에게 말을 거는 작품들' 
                      : 'The artworks that speak to you'
                    }
                  </p>
                </motion.div>
              </div>
            </div>

            {/* Journey Details */}
            <div className="sayu-liquid-glass rounded-2xl p-8">
              <div className="flex items-center justify-center gap-8 text-[hsl(var(--journey-twilight))]">
                <div className="text-center">
                  <div className="text-3xl mb-2">🖼️</div>
                  <p className="text-sm font-medium">
                    {language === 'ko' ? '15개의 순간' : '15 Moments'}
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">⏱️</div>
                  <p className="text-sm font-medium">
                    {language === 'ko' ? '7-10분의 여정' : '7-10 min journey'}
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">💫</div>
                  <p className="text-sm font-medium">
                    {language === 'ko' ? '깊은 자기 발견' : 'Deep self-discovery'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-center"
          >
            <motion.button
              onClick={startQuiz}
              className="bg-[hsl(var(--journey-twilight))] hover:bg-[hsl(var(--journey-midnight))] text-white px-12 py-4 text-lg font-semibold rounded-full flex items-center gap-2 mx-auto transition-all duration-300 shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Sparkles className="w-5 h-5" />
              {language === 'ko' ? '나의 여정 시작하기' : 'Begin My Journey'}
            </motion.button>
            
            <p className="mt-6 text-sm text-[hsl(var(--journey-twilight))] opacity-60">
              {language === 'ko' 
                ? '정답은 없습니다. 오직 당신의 진실한 마음만이 있을 뿐입니다.' 
                : 'There are no right answers. Only your authentic self.'
              }
            </p>
          </motion.div>
        </div>
      </motion.div>

      <WelcomeModal 
        isOpen={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
        userName={user?.nickname}
      />
    </div>
  );
}