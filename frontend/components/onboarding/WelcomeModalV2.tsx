'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Heart, Users, TrendingUp, ChevronRight, Palette } from 'lucide-react';
import { useOnboardingV2 } from '@/contexts/OnboardingContextV2';
import { useRouter } from 'next/navigation';
import { APT_TYPES } from '@/types/artist-apt';
import toast from 'react-hot-toast';

export function WelcomeModalV2() {
  const router = useRouter();
  const { showWelcomeModal, setShowWelcomeModal, progress } = useOnboardingV2();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      icon: <Sparkles className="w-16 h-16 text-purple-400" />,
      title: "SAYU에 오신 것을 환영합니다",
      subtitle: "예술과 함께하는 특별한 7일 여정",
      description: "매일 새로운 예술 경험을 통해 당신만의 취향을 발견하세요",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: <Heart className="w-16 h-16 text-red-400" />,
      title: "발견",
      subtitle: "당신만의 예술 성격",
      description: "16가지 동물 캐릭터 중 당신은 어떤 예술 성격일까요?",
      gradient: "from-red-500 to-orange-500"
    },
    {
      icon: <Users className="w-16 h-16 text-blue-400" />,
      title: "연결",
      subtitle: "취향이 비슷한 사람들",
      description: "나와 시너지가 높은 사람들을 만나고 소통하세요",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: <TrendingUp className="w-16 h-16 text-green-400" />,
      title: "성장",
      subtitle: "매일 더 깊어지는 예술 이해",
      description: "7일 후, 당신은 예술을 보는 새로운 눈을 갖게 됩니다",
      gradient: "from-green-500 to-emerald-500"
    }
  ];

  const handleStart = () => {
    setShowWelcomeModal(false);
    // 프로필 페이지에 머물면서 Day 1 강조
    toast.success('✨ Day 1이 열렸습니다! AI 아트 프로필을 만들어보세요!', {
      duration: 6000,
      style: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#fff',
        border: 'none',
        fontSize: '16px',
        padding: '16px'
      }
    });
  };

  const handleSkip = () => {
    setShowWelcomeModal(false);
  };

  if (!showWelcomeModal) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
        onClick={handleSkip}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="bg-gray-900/95 backdrop-blur-lg rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-800"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 헤더 */}
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Palette className="w-8 h-8 text-purple-400" />
                <div>
                  <h2 className="text-xl font-bold text-white">Welcome to SAYU</h2>
                  <p className="text-sm text-gray-400">Your Art Journey Begins</p>
                </div>
              </div>
              <button
                onClick={handleSkip}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* 슬라이드 콘텐츠 */}
          <div className="p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                {/* 아이콘 */}
                <div className="flex justify-center mb-6">
                  <div className={`p-6 rounded-full bg-gradient-to-br ${slides[currentSlide].gradient} bg-opacity-20`}>
                    {slides[currentSlide].icon}
                  </div>
                </div>

                {/* 텍스트 */}
                <h3 className="text-2xl font-bold text-white mb-2">
                  {slides[currentSlide].title}
                </h3>
                <p className="text-lg text-purple-300 mb-3">
                  {slides[currentSlide].subtitle}
                </p>
                <p className="text-gray-400 leading-relaxed">
                  {slides[currentSlide].description}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* 인디케이터 */}
            <div className="flex justify-center gap-2 mt-8 mb-6">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentSlide 
                      ? 'w-8 bg-purple-500' 
                      : 'w-2 bg-gray-600 hover:bg-gray-500'
                  }`}
                />
              ))}
            </div>

            {/* 액션 버튼들 */}
            <div className="flex gap-3">
              {currentSlide < slides.length - 1 ? (
                <>
                  <button
                    onClick={handleSkip}
                    className="flex-1 px-6 py-3 text-gray-400 border border-gray-700 rounded-xl hover:bg-gray-800/50 transition-colors"
                  >
                    나중에
                  </button>
                  <button
                    onClick={() => setCurrentSlide(currentSlide + 1)}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all flex items-center justify-center gap-2"
                  >
                    다음
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleSkip}
                    className="flex-1 px-6 py-3 text-gray-400 border border-gray-700 rounded-xl hover:bg-gray-800/50 transition-colors"
                  >
                    둘러보기
                  </button>
                  <button
                    onClick={handleStart}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2"
                  >
                    🚀 여정 시작하기
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* 하단 정보 */}
          <div className="px-8 pb-6">
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
              <p className="text-sm text-gray-400 text-center">
                <span className="text-purple-400 font-semibold">7일간의 여정</span>을 통해
                <br />
                당신만의 예술 취향을 발견하고 성장시켜보세요
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}