'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { WelcomeModal } from '@/components/onboarding/WelcomeModal';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { GlassCard, GlassButton } from '@/components/ui/glass';
import { Sparkles, Heart, Unlock } from 'lucide-react';
import { updateUserPurpose } from '@/lib/api/user-purpose';
import LanguageToggle from '@/components/ui/LanguageToggle';
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
      {/* Language Toggle */}
      <div className="absolute top-1 right-1 z-50 scale-75">
        <LanguageToggle variant="glass" size="sm" />
      </div>

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
        initial={{ opacity: 0.9, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative z-10 max-w-4xl mx-auto px-4 py-16 md:py-24"
      >
        <GlassCard variant="heavy" className="p-4 md:p-6 pb-8">
          {/* Language Toggle removed - now in floating nav */}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-6"
          >
            <h1 className="text-xl sm:text-2xl md:text-3xl mb-3 leading-tight text-gray-900 dark:text-gray-900 whitespace-pre-line font-playfair" style={{
              fontWeight: 600,
              letterSpacing: '0.01em'
            }}>
              {language === 'ko' 
                ? '당신만의 예술 여정이\n시작됩니다' 
                : 'Your Personal Art Journey Awaits'
              }
            </h1>

            {/* Journey Details - Moved up right below title */}
            <GlassCard variant="light" className="mt-3 mb-4 py-0 max-w-lg mx-auto">
              <div className="flex items-center justify-between px-1 md:px-8 py-0.5">
                <div className="text-center group">
                  <div className="text-xl md:text-3xl group-hover:scale-110 transition-transform">🏛️</div>
                  <p className="text-[11px] md:text-sm font-medium text-gray-700">
                    {language === 'ko' ? '예술 여행' : 'Art Journey'}
                  </p>
                </div>
                <div className="text-center group ml-2">
                  <div className="text-xl md:text-3xl group-hover:scale-110 transition-transform">🎨</div>
                  <p className="text-[11px] md:text-sm font-medium text-gray-700">
                    {language === 'ko' ? '예술 MBTI' : 'Art MBTI'}
                  </p>
                </div>
                <div className="text-center group">
                  <div className="text-xl md:text-3xl group-hover:scale-110 transition-transform">⏱️</div>
                  <p className="text-[11px] md:text-sm font-medium text-gray-700">
                    {language === 'ko' ? '5-7분 소요' : '5-7 min'}
                  </p>
                </div>
              </div>
            </GlassCard>
            
            {/* Quiz description - more natural and flowing */}
            <p className="text-sm md:text-base text-gray-700 dark:text-gray-700 mt-4 px-6 whitespace-pre-line leading-relaxed text-center">
              {language === 'ko' 
                ? '잠시 미술관을 산책하며\n당신의 마음이 이끄는 대로 작품들을 감상해보세요.\n그 순간의 감정이 당신의 예술 언어가 됩니다.' 
                : 'Take a stroll through the gallery\nand let your heart guide you through the artworks.\nYour feelings will reveal your artistic language.'
              }
            </p>
          </motion.div>
          
          {/* Increased spacing for section separation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-4 mb-6 mt-12"
          >
            {/* What You'll Discover */}
            <div className="text-center">
              <h2 className="text-base md:text-xl font-bold mb-3 flex items-center justify-center gap-2 text-gray-900 dark:text-gray-900">
                <Unlock className="w-5 h-5 md:w-6 md:h-6 text-gray-800 dark:text-gray-800" />
                {language === 'ko' ? '퀴즈 완료하면 이런 것들이 가능해져요' : 'What You\'ll Discover'}
              </h2>
              
              <div className="grid grid-cols-3 gap-2">
                <motion.div 
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                >
                  <GlassCard variant="default" className="h-full p-2 text-center group bg-gradient-to-br from-purple-50/50 to-indigo-50/50 hover:from-purple-100/50 hover:to-indigo-100/50 transition-all duration-300">
                    <div className="text-xl mb-1">🎯</div>
                    <h3 className="font-semibold text-xs mb-1 text-gray-900 dark:text-gray-900">
                      {language === 'ko' ? 'AI 맞춤 추천' : 'AI Recommendations'}
                    </h3>
                    <div className="text-[10px] text-gray-600 leading-tight">
                      {language === 'ko' 
                        ? '당신의 성향에 맞는 전시회' 
                        : 'Exhibitions matched to you'
                      }
                    </div>
                  </GlassCard>
                </motion.div>
                
                <motion.div 
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                >
                  <GlassCard variant="default" className="h-full p-2 text-center group bg-gradient-to-br from-pink-50/50 to-rose-50/50 hover:from-pink-100/50 hover:to-rose-100/50 transition-all duration-300">
                    <div className="text-xl mb-1">👥</div>
                    <h3 className="font-semibold text-xs mb-1 text-gray-900 dark:text-gray-900">
                      {language === 'ko' ? '취향 커뮤니티' : 'Taste Community'}
                    </h3>
                    <div className="text-[10px] text-gray-600 leading-tight">
                      {language === 'ko' 
                        ? '같은 성향 사람들과 연결' 
                        : 'Connect with similar tastes'
                      }
                    </div>
                  </GlassCard>
                </motion.div>
                
                <motion.div 
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                >
                  <GlassCard variant="default" className="h-full p-2 text-center group bg-gradient-to-br from-amber-50/50 to-orange-50/50 hover:from-amber-100/50 hover:to-orange-100/50 transition-all duration-300">
                    <div className="text-xl mb-1">📊</div>
                    <h3 className="font-semibold text-xs mb-1 text-gray-900 dark:text-gray-900">
                      {language === 'ko' ? '예술 포트폴리오' : 'Art Portfolio'}
                    </h3>
                    <p className="text-[10px] text-gray-600 leading-tight">
                      {language === 'ko' 
                        ? '관람 기록과 성장 추적' 
                        : 'Track your art journey'
                      }
                    </p>
                  </GlassCard>
                </motion.div>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-center mt-8 pt-4"
          >
            <button
              onClick={startQuiz}
              className="mx-auto flex items-center gap-2 px-8 md:px-12 py-4 md:py-6 text-base md:text-lg font-semibold bg-gray-900 dark:bg-gray-900 text-white hover:bg-gray-800 dark:hover:bg-gray-800 rounded-xl transition-all hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-6 h-6 text-white" />
              {language === 'ko' ? '나의 예술 페르소나 알아보기' : 'Discover My Art Persona'}
            </button>
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