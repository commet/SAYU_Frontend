'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, Star } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ModernHeroV2() {
  const router = useRouter();
  const { language } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Scroll animations
  const { scrollY } = useScroll();
  const yParallax = useTransform(scrollY, [0, 500], [0, -100]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.3]);
  
  return (
    <section ref={containerRef} className="relative min-h-screen overflow-hidden bg-white dark:bg-gray-950">
      {/* Premium Background Pattern */}
      <div className="absolute inset-0">
        {/* Gradient Mesh */}
        <div className="absolute inset-0 opacity-40 dark:opacity-30">
          <div className="absolute top-0 left-0 w-96 h-96 bg-purple-400 rounded-full filter blur-3xl opacity-20 animate-pulse" />
          <div className="absolute top-1/2 right-0 w-96 h-96 bg-pink-400 rounded-full filter blur-3xl opacity-20 animate-pulse animation-delay-2000" />
          <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-blue-400 rounded-full filter blur-3xl opacity-20 animate-pulse animation-delay-4000" />
        </div>
        
        {/* Subtle Pattern */}
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgb(0 0 0 / 0.05) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
      </div>
      
      {/* Main Content */}
      <motion.div 
        className="relative z-10 flex items-center justify-center min-h-screen px-4 py-20"
        style={{ opacity }}
      >
        <div className="text-center max-w-5xl mx-auto">
          {/* Premium Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 mb-8"
          >
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full border border-purple-200 dark:border-purple-800">
              <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                AI-Powered Art Discovery
              </span>
            </div>
          </motion.div>
          
          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-8 tracking-tight"
          >
            <span className="block text-gray-900 dark:text-white">Discover Your</span>
            <span className="block bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              Art Personality
            </span>
          </motion.h1>
          
          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl lg:text-2xl text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            {language === 'ko' 
              ? 'APT 이론 기반 3분 테스트로 당신만의 예술 취향을 발견하고, AI가 추천하는 맞춤 작품을 만나보세요.'
              : 'Take a 3-minute personality test based on APT theory and explore AI-curated artworks tailored just for you.'
            }
          </motion.p>
          
          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            {/* Primary CTA */}
            <button
              onClick={() => router.push('/home')}
              className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <span className="flex items-center gap-2">
                {language === 'ko' ? '무료로 시작하기' : 'Start Free Test'}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            
            {/* Secondary CTA */}
            <button
              onClick={() => router.push('/gallery')}
              className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200"
            >
              {language === 'ko' ? '작품 둘러보기' : 'Browse Gallery'}
            </button>
          </motion.div>
          
          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-400"
          >
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span>4.9/5 rating</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <span>{language === 'ko' ? '50,000+ 사용자' : '50,000+ users'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-600 dark:text-blue-400">⚡</span>
              <span>{language === 'ko' ? '3분 완료' : '3 min test'}</span>
            </div>
          </motion.div>
          
          {/* Floating Elements */}
          {mounted && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-purple-400/20 rounded-full"
                  initial={{
                    x: (i * 250) % (typeof window !== 'undefined' ? window.innerWidth : 1920),
                    y: (i * 150) % (typeof window !== 'undefined' ? window.innerHeight : 1080),
                  }}
                  animate={{
                    y: [(i * 150) % 1080, -20],
                  }}
                  transition={{
                    duration: 15 + i * 2,
                    repeat: Infinity,
                    ease: "linear",
                    delay: i * 2,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </motion.div>
      
      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 border-2 border-gray-300 dark:border-gray-600 rounded-full p-1"
        >
          <div className="w-1 h-2 bg-gray-400 dark:bg-gray-500 rounded-full mx-auto" />
        </motion.div>
      </motion.div>
    </section>
  );
}