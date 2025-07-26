'use client';

import { motion } from 'framer-motion';
import { Sparkles, Zap, Heart } from 'lucide-react';

export function WaitlistHero() {
  return (
    <section className="relative overflow-hidden">
      {/* 배경 애니메이션 */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
      </div>

      <div className="relative container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          {/* 베타 뱃지 */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-6"
          >
            <Sparkles className="w-4 h-4" />
            Limited Beta Access
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              예술은 어렵다?
            </span>
            <br />
            <span className="text-gray-900">이제는 아니야</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
            5분이면 당신도 예술가가 될 수 있어요.
            <br />
            모든 사람이 예술을 통해 자신을 발견하고
            <br />
            사유할 수 있는 세상을 만듭니다.
          </p>

          {/* 핵심 가치 제안 */}
          <div className="grid md:grid-cols-3 gap-6 mt-12 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-6 bg-white rounded-2xl shadow-lg"
            >
              <Zap className="w-10 h-10 text-yellow-500 mb-3 mx-auto" />
              <h3 className="font-semibold mb-2">매일 3분</h3>
              <p className="text-sm text-gray-600">
                출근길 작품 하나로<br />하루를 시작하세요
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-6 bg-white rounded-2xl shadow-lg"
            >
              <Heart className="w-10 h-10 text-red-500 mb-3 mx-auto" />
              <h3 className="font-semibold mb-2">감정 우선</h3>
              <p className="text-sm text-gray-600">
                지식 없이도 OK<br />느낌부터 시작해요
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="p-6 bg-white rounded-2xl shadow-lg"
            >
              <Sparkles className="w-10 h-10 text-purple-500 mb-3 mx-auto" />
              <h3 className="font-semibold mb-2">함께 성장</h3>
              <p className="text-sm text-gray-600">
                혼자가 아닌<br />함께하는 사유
              </p>
            </motion.div>
          </div>

          {/* 미션 스테이트먼트 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="inline-flex items-center gap-4 text-sm text-gray-600"
          >
            <span className="text-purple-600 font-semibold">
              누구나 예술가가 되고, 철학자가 될 수 있는 플랫폼
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}