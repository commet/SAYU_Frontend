'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { WelcomeModal } from '@/components/onboarding/WelcomeModal';
import { useAuth } from '@/hooks/useAuth';

export default function QuizIntroPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { showWelcomeModal, setShowWelcomeModal } = useOnboarding();
  const [language, setLanguage] = useState<'ko' | 'en'>('ko');

  const startQuiz = () => {
    router.push('/quiz/scenario');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full"
      >
        <div className="bg-black/50 backdrop-blur-lg rounded-3xl p-8 md:p-12 border border-purple-500/20 relative">
          {/* Language Toggle */}
          <div className="absolute top-4 right-4">
            <button
              onClick={() => setLanguage(language === 'ko' ? 'en' : 'ko')}
              className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-all text-white"
            >
              {language === 'ko' ? 'English' : '한국어'}
            </button>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 text-center">
            {language === 'ko' ? '당신의 미적 영혼을 발견하세요' : 'Discover Your Aesthetic Soul'}
          </h1>
          
          <p className="text-gray-300 text-lg mb-8 text-center">
            {language === 'ko' 
              ? '가상의 미술관 여행을 통해 당신만의 독특한 미적 성향을 발견해보세요.'
              : 'Through a virtual museum journey, discover your unique aesthetic personality.'
            }
          </p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-purple-500/30"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4 flex items-center justify-center gap-3">
                <span className="text-4xl">🎨</span>
                {language === 'ko' ? '미술관 여행' : 'Museum Journey'}
              </h2>
              <p className="text-gray-300 text-lg mb-4">
                {language === 'ko'
                  ? '8개의 시나리오를 통해 가상의 미술관을 여행하며 당신의 예술적 성향을 발견합니다.'
                  : 'Travel through a virtual museum with 8 immersive scenarios to discover your artistic personality.'
                }
              </p>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-white/5 rounded-lg p-4">
                  <span className="text-2xl mb-2 block">⏱️</span>
                  <p className="text-sm text-gray-400">
                    {language === 'ko' ? '약 5-7분 소요' : '5-7 minutes'}
                  </p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <span className="text-2xl mb-2 block">🖼️</span>
                  <p className="text-sm text-gray-400">
                    {language === 'ko' ? '8개의 상황' : '8 scenarios'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
          
          <Button
            onClick={startQuiz}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            size="lg"
          >
            {language === 'ko' ? '여행 시작하기' : 'Begin the Journey'}
          </Button>
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