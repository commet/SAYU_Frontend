'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { WelcomeModal } from '@/components/onboarding/WelcomeModal';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { GlassCard, GlassButton } from '@/components/ui/glass';
import { Sparkles, Heart, Compass } from 'lucide-react';
import { updateUserPurpose } from '@/lib/api/user-purpose';
import '@/styles/emotional-palette.css';

export default function QuizIntroPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { language } = useLanguage();
  const { showWelcomeModal, setShowWelcomeModal } = useOnboarding();

  const startQuiz = () => {
    router.push('/quiz/narrative');
  };

  const handlePurposeSelected = async (purpose: string) => {
    try {
      await updateUserPurpose(purpose);
      console.log('✅ User purpose updated:', purpose);
    } catch (error) {
      console.error('❌ Failed to update user purpose:', error);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-white">
      {/* Gallery Background */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("/images/backgrounds/traditional-gallery-skylight-paintings-mint.jpg")',
            opacity: 0.8
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/20 to-white/40" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.390, 0.575, 0.565, 1.000] }}
        className="relative z-10 max-w-4xl mx-auto px-4 py-4"
      >
        <GlassCard variant="heavy" className="p-4 md:p-6">
          {/* Language Toggle removed - now in floating nav */}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-6"
          >
            {/* Journey compass icon */}
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100 mb-3">
              <Compass className="w-6 h-6 text-indigo-600" />
            </div>
            
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 leading-tight text-gray-900 dark:text-gray-900 whitespace-pre-line">
              {language === 'ko' 
                ? '당신만의 예술 여정이\n시작됩니다' 
                : 'Your Personal Art Journey Awaits'
              }
            </h1>
            
            <div className="text-base text-gray-700 dark:text-gray-700 leading-relaxed max-w-2xl mx-auto">
              {language === 'ko' ? (
                <>
                  <p>이것은 테스트가 아닙니다.</p>
                  <p className="mb-1">당신이 아름다움을 경험하는 고유한 방식을 발견하는 여정입니다.</p>
                  <p className="text-xs text-gray-600 dark:text-gray-600 font-medium italic whitespace-nowrap">미술관을 거닐며 당신만의 예술 취향을 찾아가는 이야기</p>
                </>
              ) : (
                <>
                  <p className="mb-1">This isn't a test.</p>
                  <p className="mb-2">It's a journey to discover your unique way of experiencing beauty.</p>
                  <p className="text-sm text-gray-600 dark:text-gray-600 font-medium italic">A story of finding your art taste while strolling through a museum</p>
                </>
              )}
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-4 mb-6"
          >
            {/* What You'll Discover */}
            <div className="text-center">
              <h2 className="text-base md:text-xl font-bold mb-3 flex items-center justify-center gap-2 text-gray-900 dark:text-gray-900">
                <Compass className="w-5 h-5 md:w-6 md:h-6 text-gray-800 dark:text-gray-800" />
                {language === 'ko' ? '무엇을 발견하게 될까요?' : 'What You\'ll Discover'}
              </h2>
              
              <div className="grid grid-cols-3 gap-2">
                <motion.div 
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                >
                  <GlassCard variant="default" className="h-full p-2 text-center group">
                    <div className="text-xl mb-1">👥</div>
                    <h3 className="font-semibold text-xs mb-1 text-gray-900 dark:text-gray-900">
                      {language === 'ko' ? '관람 스타일' : 'Viewing Style'}
                    </h3>
                    <div className="text-[10px] text-gray-600 leading-tight">
                      {language === 'ko' 
                        ? '혼자 또는 함께' 
                        : 'Solo or shared'
                      }
                    </div>
                  </GlassCard>
                </motion.div>
                
                <motion.div 
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                >
                  <GlassCard variant="default" className="h-full p-2 text-center group">
                    <div className="text-xl mb-1">🎭</div>
                    <h3 className="font-semibold text-xs mb-1 text-gray-900 dark:text-gray-900">
                      {language === 'ko' ? '감상 방식' : 'Perception'}
                    </h3>
                    <div className="text-[10px] text-gray-600 leading-tight">
                      {language === 'ko' 
                        ? '감정 또는 분석' 
                        : 'Feel or analyze'
                      }
                    </div>
                  </GlassCard>
                </motion.div>
                
                <motion.div 
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                >
                  <GlassCard variant="default" className="h-full p-2 text-center group">
                    <div className="text-xl mb-1">✨</div>
                    <h3 className="font-semibold text-xs mb-1 text-gray-900 dark:text-gray-900">
                      {language === 'ko' ? '예술 언어' : 'Art Language'}
                    </h3>
                    <p className="text-[10px] text-gray-600 leading-tight">
                      {language === 'ko' 
                        ? '당신의 작품' 
                        : 'Your artworks'
                      }
                    </p>
                  </GlassCard>
                </motion.div>
              </div>
            </div>

            {/* Journey Details */}
            <GlassCard variant="light" className="mt-4 py-0">
              <div className="flex items-center justify-between px-1 md:px-8 py-0.5">
                <div className="text-center group">
                  <div className="text-xl md:text-3xl group-hover:scale-110 transition-transform">🖼️</div>
                  <p className="text-[11px] md:text-sm font-medium text-gray-700">
                    {language === 'ko' ? '15개의 순간' : '15 Moments'}
                  </p>
                </div>
                <div className="text-center group ml-2">
                  <div className="text-xl md:text-3xl group-hover:scale-110 transition-transform">⏱️</div>
                  <p className="text-[11px] md:text-sm font-medium text-gray-700">
                    {language === 'ko' ? '7-10분의 여정' : '7-10 min journey'}
                  </p>
                </div>
                <div className="text-center group">
                  <div className="text-xl md:text-3xl group-hover:scale-110 transition-transform">💫</div>
                  <p className="text-[11px] md:text-sm font-medium text-gray-700">
                    {language === 'ko' ? '깊은 자기 발견' : 'Deep self-discovery'}
                  </p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-center"
          >
            <button
              onClick={startQuiz}
              className="mx-auto flex items-center gap-2 px-8 md:px-12 py-4 md:py-6 text-base md:text-lg font-semibold bg-gray-900 dark:bg-gray-900 text-white hover:bg-gray-800 dark:hover:bg-gray-800 rounded-xl transition-all hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-6 h-6 text-white" />
              {language === 'ko' ? '나의 예술 페르소나 알아보기' : 'Discover My Art Persona'}
            </button>
            
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-600 whitespace-pre-line">
              {language === 'ko' 
                ? '정답은 없습니다.\n오직 당신의 진실한 마음만이 있을 뿐입니다.' 
                : 'There are no right answers.\nOnly your authentic self.'
              }
            </p>
          </motion.div>
        </GlassCard>
      </motion.div>

      <WelcomeModal 
        isOpen={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
        userName={user?.nickname || undefined}
        onPurposeSelected={handlePurposeSelected}
      />
    </div>
  );
}