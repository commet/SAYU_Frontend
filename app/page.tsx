'use client';

import { motion } from 'framer-motion';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-6xl font-bold text-white mb-6">
            🎨 SAYU
          </h1>
          <p className="text-2xl text-gray-300 mb-8">
            AI와 함께하는 미적 정체성 발견 여행
          </p>
          <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
            당신만의 독특한 미적 성향을 발견하고, 
            개인화된 예술 추천을 받아보세요.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
            >
              <h3 className="text-xl font-semibold text-white mb-3">🧭 AI 큐레이터</h3>
              <p className="text-gray-300">
                개인화된 미술 작품 추천과 심화 분석
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
            >
              <h3 className="text-xl font-semibold text-white mb-3">🏘️ 빌리지</h3>
              <p className="text-gray-300">
                같은 취향의 사람들과 함께하는 커뮤니티
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
            >
              <h3 className="text-xl font-semibold text-white mb-3">📊 인사이트</h3>
              <p className="text-gray-300">
                나의 미적 성향 분석과 성장 기록
              </p>
            </motion.div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/working'}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 px-8 rounded-full text-lg shadow-lg"
          >
            미적 여정 시작하기 →
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}