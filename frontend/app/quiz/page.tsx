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
    <div className="min-h-screen gradient-dawn flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.390, 0.575, 0.565, 1.000] }}
        className="max-w-3xl w-full"
      >
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-12 md:p-16 shadow-dream relative">
          {/* Language Toggle */}
          <div className="absolute top-4 right-4">
            <LanguageToggle variant="minimal" className="text-[hsl(var(--journey-midnight))] border-[hsl(var(--journey-twilight))]/20 hover:bg-[hsl(var(--journey-twilight))]/10" />
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-12"
          >
            <Heart className="w-16 h-16 mx-auto mb-6 text-[hsl(var(--journey-dusty-rose))]" />
            
            <h1 className="text-4xl md:text-6xl font-serif mb-6 text-[hsl(var(--journey-midnight))] leading-tight">
              {language === 'ko' 
                ? '당신만의 예술 여정이\n시작됩니다' 
                : 'Your Personal\nArt Journey Awaits'
              }
            </h1>
            
            <p className="text-xl text-[hsl(var(--journey-twilight))] opacity-80 leading-relaxed max-w-xl mx-auto">
              {language === 'ko' 
                ? '이것은 테스트가 아닙니다. 당신이 아름다움을 경험하는 고유한 방식을 발견하는 여정입니다.'
                : 'This isn\'t a test. It\'s a journey to discover your unique way of experiencing beauty.'
              }
            </p>
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
                  className="bg-[hsl(var(--journey-dawn-cream))] rounded-2xl p-6 shadow-gentle"
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-3xl mb-3">🌅</div>
                  <h3 className="font-medium mb-2 text-[hsl(var(--journey-midnight))]">
                    {language === 'ko' ? '당신의 관람 스타일' : 'Your Viewing Style'}
                  </h3>
                  <p className="text-sm text-[hsl(var(--journey-twilight))] opacity-70">
                    {language === 'ko' 
                      ? '혼자 조용히, 또는 함께 나누며' 
                      : 'Solitary contemplation or shared discovery'
                    }
                  </p>
                </motion.div>
                
                <motion.div 
                  className="bg-[hsl(var(--journey-lavender))] rounded-2xl p-6 shadow-gentle"
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-3xl mb-3">🎭</div>
                  <h3 className="font-medium mb-2 text-[hsl(var(--journey-midnight))]">
                    {language === 'ko' ? '당신의 감상 방식' : 'Your Perception Style'}
                  </h3>
                  <p className="text-sm text-[hsl(var(--journey-twilight))] opacity-70">
                    {language === 'ko' 
                      ? '감정적 몰입 또는 분석적 이해' 
                      : 'Emotional immersion or analytical understanding'
                    }
                  </p>
                </motion.div>
                
                <motion.div 
                  className="bg-[hsl(var(--journey-dusty-rose))] rounded-2xl p-6 shadow-gentle"
                  whileHover={{ y: -4 }}
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
            <div className="bg-white/50 rounded-2xl p-8 shadow-whisper">
              <div className="flex items-center justify-center gap-8 text-[hsl(var(--journey-twilight))]">
                <div className="text-center">
                  <div className="text-3xl mb-2">🖼️</div>
                  <p className="text-sm font-medium">
                    {language === 'ko' ? '10개의 순간' : '10 Moments'}
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
            <EmotionalButton
              onClick={startQuiz}
              size="lg"
              variant="primary"
              className="px-12 py-4 text-lg"
            >
              <Sparkles className="w-5 h-5" />
              {language === 'ko' ? '나의 여정 시작하기' : 'Begin My Journey'}
            </EmotionalButton>
            
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