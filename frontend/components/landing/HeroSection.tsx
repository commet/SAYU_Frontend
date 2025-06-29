'use client';

import { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';

const artworkImages = [
  '/api/placeholder/300/400',
  '/api/placeholder/400/300', 
  '/api/placeholder/350/450',
  '/api/placeholder/450/350',
  '/api/placeholder/300/300',
  '/api/placeholder/400/500'
];

const floatingWords = [
  { text: '감성', x: 10, y: 20 },
  { text: '예술', x: 80, y: 15 },
  { text: '여정', x: 15, y: 70 },
  { text: '발견', x: 75, y: 65 },
  { text: '성장', x: 45, y: 85 },
  { text: '취향', x: 50, y: 30 }
];

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, 50]);
  const y2 = useTransform(scrollY, [0, 300], [0, -50]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.8]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const { clientX, clientY } = e;
      const { width, height } = containerRef.current.getBoundingClientRect();
      
      const xPercent = (clientX / width - 0.5) * 20;
      const yPercent = (clientY / height - 0.5) * 20;
      
      containerRef.current.style.setProperty('--mouse-x', `${xPercent}px`);
      containerRef.current.style.setProperty('--mouse-y', `${yPercent}px`);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section ref={containerRef} className="relative min-h-screen overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900" />
      
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
                           radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
                           radial-gradient(circle at 40% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)`,
          animation: 'float 20s ease-in-out infinite'
        }} />
      </div>

      {/* Floating artwork images */}
      <motion.div style={{ y: y1, opacity }} className="absolute inset-0 pointer-events-none">
        {artworkImages.map((src, index) => (
          <motion.div
            key={index}
            className="absolute"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: 0.3,
              scale: 1,
              x: [0, Math.random() * 40 - 20, 0],
              y: [0, Math.random() * 40 - 20, 0]
            }}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              delay: index * 0.5,
              ease: "easeInOut"
            }}
            style={{
              left: `${15 + (index % 3) * 30}%`,
              top: `${10 + Math.floor(index / 3) * 40}%`,
              transform: `translate(var(--mouse-x), var(--mouse-y))`
            }}
          >
            <div className="relative w-32 h-40 md:w-48 md:h-60 rounded-lg overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400" />
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Floating words */}
      <motion.div style={{ y: y2 }} className="absolute inset-0 pointer-events-none">
        {floatingWords.map((word, index) => (
          <motion.div
            key={index}
            className="absolute text-white/20 text-2xl md:text-4xl font-bold"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0.2, 0.4, 0.2],
              y: [0, -20, 0]
            }}
            transition={{
              duration: 5 + Math.random() * 3,
              repeat: Infinity,
              delay: index * 0.8,
              ease: "easeInOut"
            }}
            style={{
              left: `${word.x}%`,
              top: `${word.y}%`,
              transform: `translate(calc(var(--mouse-x) * 0.5), calc(var(--mouse-y) * 0.5))`
            }}
          >
            {word.text}
          </motion.div>
        ))}
      </motion.div>

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl"
        >
          {/* Logo/Title */}
          <motion.h1
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-6xl md:text-8xl font-bold text-white mb-6"
          >
            SAYU
          </motion.h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-3xl text-white/90 mb-4"
          >
            당신의 미술 취향을 발견하는 여정
          </motion.p>

          {/* Sub-tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-lg md:text-xl text-white/70 mb-12"
          >
            AI가 분석하는 나만의 예술 성향 · 맞춤형 전시 추천 · 감성 아카이브
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/quiz">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-shadow"
              >
                취향 테스트 시작하기 ✨
              </motion.button>
            </Link>
            
            <Link href="/exhibitions">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-full font-semibold text-lg border border-white/30 hover:bg-white/30 transition-colors"
              >
                전시 둘러보기 🎨
              </motion.button>
            </Link>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-white/50 text-sm flex flex-col items-center gap-2"
            >
              <span>스크롤하여 더 알아보기</span>
              <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
                <motion.div
                  animate={{ y: [0, 15, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-1.5 h-1.5 bg-white/50 rounded-full mt-2"
                />
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          33% {
            transform: translateY(-20px) rotate(2deg);
          }
          66% {
            transform: translateY(20px) rotate(-2deg);
          }
        }
      `}</style>
    </section>
  );
}