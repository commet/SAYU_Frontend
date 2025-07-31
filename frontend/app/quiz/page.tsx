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
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background - More vibrant colors */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50" />
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-100/30 via-transparent to-purple-100/30 animate-gradient-shift" />
      </div>

      {/* Floating Orbs */}
      <div className="absolute inset-0 -z-5">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${200 + i * 50}px`,
              height: `${200 + i * 50}px`,
              background: `radial-gradient(circle, ${['rgba(168, 85, 247, 0.1)', 'rgba(236, 72, 153, 0.1)', 'rgba(59, 130, 246, 0.1)', 'rgba(251, 146, 60, 0.1)'][i % 4]} 0%, transparent 70%)`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, 50, 0],
              y: [0, -50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 15 + i * 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.390, 0.575, 0.565, 1.000] }}
        className="relative z-10 max-w-4xl mx-auto px-4 py-8"
      >
        <GlassCard variant="heavy" className="p-8">
          {/* Language Toggle removed - now in floating nav */}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-8"
          >
            {/* Small museum icon instead of heart */}
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 mb-4">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight text-gray-900 dark:text-gray-900">
              {language === 'ko' 
                ? '당신만의 예술 여정이 시작됩니다' 
                : 'Your Personal Art Journey Awaits'
              }
            </h1>
            
            <div className="text-lg text-gray-700 dark:text-gray-700 leading-relaxed max-w-2xl mx-auto">
              {language === 'ko' ? (
                <>
                  <p className="mb-1">이것은 테스트가 아닙니다.</p>
                  <p className="mb-2">당신이 아름다움을 경험하는 고유한 방식을 발견하는 여정입니다.</p>
                  <p className="text-sm text-gray-600 dark:text-gray-600 font-medium italic">미술관을 거닐며 당신만의 예술 취향을 찾아가는 이야기</p>
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
            className="space-y-6 mb-10"
          >
            {/* What You'll Discover */}
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-6 flex items-center justify-center gap-3 text-gray-900 dark:text-gray-900">
                <Compass className="w-6 h-6 text-gray-800 dark:text-gray-800" />
                {language === 'ko' ? '무엇을 발견하게 될까요?' : 'What You\'ll Discover'}
              </h2>
              
              <div className="grid md:grid-cols-3 gap-6">
                <motion.div 
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                >
                  <GlassCard variant="light" className="h-full p-5 text-center group">
                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🌅</div>
                    <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-900">
                      {language === 'ko' ? '당신의 관람 스타일' : 'Your Viewing Style'}
                    </h3>
                    <div className="text-sm text-gray-600 whitespace-pre-line">
                      {language === 'ko' 
                        ? '혼자 조용히,\n또는 함께 나누며' 
                        : 'Solitary contemplation\nor shared discovery'
                      }
                    </div>
                  </GlassCard>
                </motion.div>
                
                <motion.div 
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                >
                  <GlassCard variant="light" className="h-full p-5 text-center group">
                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🎭</div>
                    <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-900">
                      {language === 'ko' ? '당신의 감상 방식' : 'Your Perception Style'}
                    </h3>
                    <div className="text-sm text-gray-600 whitespace-pre-line">
                      {language === 'ko' 
                        ? '감정적 몰입\n또는 분석적 이해' 
                        : 'Emotional immersion\nor analytical understanding'
                      }
                    </div>
                  </GlassCard>
                </motion.div>
                
                <motion.div 
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                >
                  <GlassCard variant="light" className="h-full p-5 text-center group">
                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">✨</div>
                    <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-900">
                      {language === 'ko' ? '당신의 예술 언어' : 'Your Art Language'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {language === 'ko' 
                        ? '당신에게 말을 거는 작품들' 
                        : 'The artworks that speak to you'
                      }
                    </p>
                  </GlassCard>
                </motion.div>
              </div>
            </div>

            {/* Journey Details */}
            <GlassCard variant="default" className="mt-6">
              <div className="flex items-center justify-center gap-8 py-3">
                <div className="text-center group">
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🖼️</div>
                  <p className="text-sm font-medium text-gray-700">
                    {language === 'ko' ? '15개의 순간' : '15 Moments'}
                  </p>
                </div>
                <div className="text-center group">
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">⏱️</div>
                  <p className="text-sm font-medium text-gray-700">
                    {language === 'ko' ? '7-10분의 여정' : '7-10 min journey'}
                  </p>
                </div>
                <div className="text-center group">
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">💫</div>
                  <p className="text-sm font-medium text-gray-700">
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
              className="mx-auto flex items-center gap-2 px-12 py-6 text-lg font-semibold bg-gray-900 dark:bg-gray-900 text-white hover:bg-gray-800 dark:hover:bg-gray-800 rounded-xl transition-all hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-6 h-6 text-white" />
              {language === 'ko' ? '나의 예술 페르소나 알아보기' : 'Discover My Art Persona'}
            </button>
            
            <p className="mt-6 text-sm text-gray-600 dark:text-gray-600">
              {language === 'ko' 
                ? '정답은 없습니다. 오직 당신의 진실한 마음만이 있을 뿐입니다.' 
                : 'There are no right answers. Only your authentic self.'
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