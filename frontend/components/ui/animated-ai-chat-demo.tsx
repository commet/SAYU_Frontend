'use client';

import React, { useState } from 'react';
import { AnimatedAIChat } from "@/components/ui/animated-ai-chat";
import { motion } from 'framer-motion';

// 원본 데모
export function Demo() {
  return (
    <div className="flex w-screen overflow-x-hidden min-h-screen bg-black">
      <AnimatedAIChat />
    </div>
  );
}

// SAYU 예술 AI 채팅
export const SayuArtAIChat = () => {
  return (
    <div className="min-h-screen flex w-full items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white p-6 relative overflow-hidden">
      {/* SAYU 브랜드 배경 */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full mix-blend-normal filter blur-[128px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full mix-blend-normal filter blur-[128px] animate-pulse delay-700" />
        <div className="absolute top-1/4 right-1/3 w-64 h-64 bg-blue-500/10 rounded-full mix-blend-normal filter blur-[96px] animate-pulse delay-1000" />
      </div>
      
      <div className="w-full max-w-2xl mx-auto relative z-10">
        <motion.div 
          className="text-center space-y-6 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h1 
            className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            SAYU AI 큐레이터
          </motion.h1>
          <motion.p 
            className="text-lg text-white/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            당신만의 예술 여정을 AI와 함께 시작하세요
          </motion.p>
        </motion.div>

        <motion.div 
          className="backdrop-blur-2xl bg-white/[0.05] rounded-2xl border border-white/[0.1] shadow-2xl p-6"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-2xl">
              🎨
            </div>
            <p className="text-white/80">
              APT 테스트, 작품 추천, 감상 가이드까지<br />
              개인 맞춤 예술 경험을 제공합니다
            </p>
            
            <div className="flex flex-wrap gap-3 justify-center mt-6">
              <motion.button 
                className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-lg text-sm text-purple-200 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🧠 APT 테스트
              </motion.button>
              <motion.button 
                className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg text-sm text-blue-200 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🖼️ 작품 추천
              </motion.button>
              <motion.button 
                className="px-4 py-2 bg-pink-600/20 hover:bg-pink-600/30 border border-pink-500/30 rounded-lg text-sm text-pink-200 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                💭 감상 가이드
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// 갤러리 큐레이션 AI
export const GalleryCurationAI = () => {
  return (
    <div className="min-h-screen flex w-full items-center justify-center bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 text-white p-6 relative overflow-hidden">
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full mix-blend-normal filter blur-[128px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full mix-blend-normal filter blur-[128px] animate-pulse delay-700" />
        <div className="absolute top-1/4 right-1/3 w-64 h-64 bg-cyan-500/10 rounded-full mix-blend-normal filter blur-[96px] animate-pulse delay-1000" />
      </div>
      
      <div className="w-full max-w-2xl mx-auto relative z-10">
        <motion.div 
          className="text-center space-y-6 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h1 
            className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            갤러리 큐레이션 AI
          </motion.h1>
          <motion.p 
            className="text-lg text-white/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            50,000여 점의 작품 중 당신에게 맞는 컬렉션을 찾아드립니다
          </motion.p>
        </motion.div>

        <motion.div 
          className="backdrop-blur-2xl bg-white/[0.05] rounded-2xl border border-white/[0.1] shadow-2xl p-6"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-2xl">
              🏛️
            </div>
            <p className="text-white/80">
              AI가 분석한 당신의 취향으로<br />
              개인 맞춤 갤러리 컬렉션을 제공합니다
            </p>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <motion.div 
                className="p-4 bg-emerald-600/10 border border-emerald-500/20 rounded-lg"
                whileHover={{ scale: 1.02 }}
              >
                <div className="text-2xl text-emerald-400 font-bold">15,234</div>
                <div className="text-sm text-emerald-200">클래식 작품</div>
              </motion.div>
              <motion.div 
                className="p-4 bg-teal-600/10 border border-teal-500/20 rounded-lg"
                whileHover={{ scale: 1.02 }}
              >
                <div className="text-2xl text-teal-400 font-bold">28,567</div>
                <div className="text-sm text-teal-200">현대 작품</div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// 커뮤니티 AI 어시스턴트
export const CommunityAI = () => {
  return (
    <div className="min-h-screen flex w-full items-center justify-center bg-gradient-to-br from-rose-900 via-pink-900 to-purple-900 text-white p-6 relative overflow-hidden">
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-rose-500/10 rounded-full mix-blend-normal filter blur-[128px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full mix-blend-normal filter blur-[128px] animate-pulse delay-700" />
        <div className="absolute top-1/4 right-1/3 w-64 h-64 bg-purple-500/10 rounded-full mix-blend-normal filter blur-[96px] animate-pulse delay-1000" />
      </div>
      
      <div className="w-full max-w-2xl mx-auto relative z-10">
        <motion.div 
          className="text-center space-y-6 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h1 
            className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-400 via-pink-400 to-purple-400"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            커뮤니티 AI
          </motion.h1>
          <motion.p 
            className="text-lg text-white/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            같은 취향의 사람들과 연결하고 함께 예술을 즐겨보세요
          </motion.p>
        </motion.div>

        <motion.div 
          className="backdrop-blur-2xl bg-white/[0.05] rounded-2xl border border-white/[0.1] shadow-2xl p-6"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-rose-500 to-purple-500 flex items-center justify-center text-2xl">
              🤝
            </div>
            <p className="text-white/80">
              전시 동행, 감상 교환, 실시간 갤러리 탐험까지<br />
              예술 애호가들과의 특별한 만남을 주선합니다
            </p>
            
            <div className="flex flex-wrap gap-3 justify-center mt-6">
              <motion.button 
                className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 rounded-lg text-sm text-rose-200 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                👥 전시 동행
              </motion.button>
              <motion.button 
                className="px-4 py-2 bg-pink-600/20 hover:bg-pink-600/30 border border-pink-500/30 rounded-lg text-sm text-pink-200 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                💬 감상 교환
              </motion.button>
              <motion.button 
                className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-lg text-sm text-purple-200 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🏛️ 실시간 탐험
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// 인터랙티브 데모
export const InteractiveAnimatedAIChatDemo = () => {
  const [currentDemo, setCurrentDemo] = useState('original');

  const demos = {
    original: <Demo />,
    sayuArt: <SayuArtAIChat />,
    gallery: <GalleryCurationAI />,
    community: <CommunityAI />
  };

  const demoNames = {
    original: '원본 애니메이션',
    sayuArt: 'SAYU AI',
    gallery: '갤러리 큐레이션',
    community: '커뮤니티 AI'
  };

  return (
    <div className="relative min-h-screen">
      {/* Demo toggle buttons */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {Object.keys(demos).map((key) => (
          <motion.button
            key={key}
            onClick={() => setCurrentDemo(key)}
            className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
              currentDemo === key
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-white/90 text-gray-800 border border-gray-200 hover:bg-gray-100 backdrop-blur-sm dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {demoNames[key as keyof typeof demoNames]}
          </motion.button>
        ))}
      </div>

      {/* Demo content */}
      <div className="w-full h-full">
        {demos[currentDemo as keyof typeof demos]}
      </div>
    </div>
  );
};

// Default export
const AnimatedAIChatDemo = () => {
  return <InteractiveAnimatedAIChatDemo />;
};

export default AnimatedAIChatDemo;