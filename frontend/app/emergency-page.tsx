'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EmergencyHomePage() {
  const router = useRouter();
  const [currentQuiz, setCurrentQuiz] = useState(0);

  const scenarios = [
    {
      title: "황혼의 미술관",
      description: "두 개의 문이 당신을 기다립니다...",
      choices: [
        { text: "소리가 들리는 문", color: "#FF6B6B" },
        { text: "고요가 부르는 문", color: "#4ECDC4" }
      ]
    },
    {
      title: "신비한 갤러리",
      description: "당신의 감정이 작품과 공명합니다...",
      choices: [
        { text: "강렬한 붉은 작품", color: "#FF6B6B" },
        { text: "차분한 푸른 작품", color: "#4ECDC4" }
      ]
    }
  ];

  return (
    <div className="min-h-screen" style={{
      background: 'linear-gradient(135deg, #FBB040 0%, #F15A5A 50%, #4ECDC4 100%)'
    }}>
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-7xl font-bold text-white mb-4 drop-shadow-lg">
            🎨 SAYU
          </h1>
          <p className="text-2xl text-white drop-shadow mb-8">
            AI와 함께하는 미적 정체성 발견 여행
          </p>
          
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => router.push('/quiz')}
              className="px-8 py-4 bg-white/90 text-purple-600 rounded-2xl font-bold text-lg hover:bg-white hover:scale-105 transition-all shadow-lg"
            >
              🌟 시나리오 퀴즈 시작
            </button>
            <button 
              onClick={() => router.push('/gallery')}
              className="px-8 py-4 bg-purple-600/90 text-white rounded-2xl font-bold text-lg hover:bg-purple-700 hover:scale-105 transition-all shadow-lg"
            >
              🖼️ 갤러리 둘러보기
            </button>
          </div>
        </motion.div>

        {/* 미니 퀴즈 프리뷰 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-white/95 rounded-3xl p-8 shadow-2xl border-4 border-yellow-300">
            <h2 className="text-3xl font-bold text-center mb-6 text-purple-800">
              ✨ 미리보기: {scenarios[currentQuiz].title}
            </h2>
            
            <p className="text-xl text-center mb-8 text-gray-700">
              {scenarios[currentQuiz].description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {scenarios[currentQuiz].choices.map((choice, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-6 rounded-2xl text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all"
                  style={{ backgroundColor: choice.color }}
                  onClick={() => {
                    setCurrentQuiz((prev) => (prev + 1) % scenarios.length);
                  }}
                >
                  {choice.text}
                </motion.button>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link 
                href="/quiz"
                className="inline-block px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold text-xl hover:scale-105 transition-all shadow-lg"
              >
                🚀 실제 퀴즈 체험하기
              </Link>
            </div>
          </div>
        </motion.div>

        {/* 기능 카드들 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-6xl mx-auto">
          {[
            { title: "🧭 AI 큐레이터", desc: "당신만의 미적 가이드", link: "/agent" },
            { title: "🏘️ 빌리지", desc: "같은 취향의 사람들과 만나기", link: "/community" },
            { title: "📊 인사이트", desc: "당신의 미적 진화 과정", link: "/insights" }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.2 }}
              whileHover={{ scale: 1.05 }}
              className="bg-white/90 p-6 rounded-2xl shadow-xl text-center"
            >
              <h3 className="text-2xl font-bold mb-4 text-purple-800">{item.title}</h3>
              <p className="text-gray-600 mb-6">{item.desc}</p>
              <Link 
                href={item.link}
                className="inline-block px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all"
              >
                체험하기
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}