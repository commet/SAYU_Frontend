'use client';

import { useState, useEffect } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowRight, Sparkles, Brain, Palette, Eye, Users, Star, Check, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import Image from 'next/image';

export default function ModernProPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const [mounted, setMounted] = useState(false);
  
  // Scroll animations
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });
  
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative bg-black text-white">
      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 transform-origin-0 z-50"
        style={{ scaleX }}
      />
      
      {/* Hero Section - Premium Dark Design */}
      <section className="relative min-h-screen overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          {/* Gradient Orbs */}
          <motion.div
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/30 rounded-full filter blur-3xl"
          />
          <motion.div
            animate={{
              x: [0, -100, 0],
              y: [0, 100, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/30 rounded-full filter blur-3xl"
          />
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
          <div className="text-center max-w-5xl mx-auto">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-8"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-gray-200">
                {language === 'ko' ? 'AI가 찾아주는 나만의 예술' : 'AI-Powered Art Discovery'}
              </span>
            </motion.div>
            
            {/* Title with gradient animation */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6"
            >
              <motion.span
                className="inline-block bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{
                  backgroundSize: "200% 200%",
                }}
              >
                SAYU
              </motion.span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto"
            >
              {language === 'ko' 
                ? '당신의 성격이 만나는 예술의 순간'
                : 'Where Your Personality Meets Art'
              }
            </motion.p>
            
            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/quiz')}
                className="group relative px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl font-semibold overflow-hidden"
              >
                <motion.span
                  className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600"
                  initial={{ x: "100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
                <span className="relative z-10 flex items-center gap-2">
                  {language === 'ko' ? '테스트 시작하기' : 'Start Test'}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </motion.button>
              
              <button
                onClick={() => router.push('/gallery')}
                className="px-8 py-4 bg-white/10 backdrop-blur-md rounded-2xl font-semibold border border-white/20 hover:bg-white/20 transition-all"
              >
                {language === 'ko' ? '작품 둘러보기' : 'Browse Gallery'}
              </button>
            </motion.div>
            
            {/* Scroll indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2"
            >
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ChevronDown className="w-6 h-6 text-gray-400" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Features - Bento Grid */}
      <section className="py-20 px-4 bg-gray-950">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-center mb-16"
          >
            {language === 'ko' ? '왜 SAYU인가?' : 'Why SAYU?'}
          </motion.h2>
          
          <div className="grid md:grid-cols-4 gap-4">
            {/* Large feature */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="md:col-span-2 md:row-span-2 bg-gradient-to-br from-purple-900/50 to-pink-900/50 p-8 rounded-3xl border border-purple-800/50 backdrop-blur-sm"
            >
              <Brain className="w-12 h-12 text-purple-400 mb-4" />
              <h3 className="text-2xl font-bold mb-4">
                {language === 'ko' ? 'AI 성격 분석' : 'AI Personality Analysis'}
              </h3>
              <p className="text-gray-300 text-lg">
                {language === 'ko' 
                  ? 'APT 이론을 기반으로 한 과학적 성격 분석. 단 3분만에 당신의 예술적 성향을 정확히 파악합니다.'
                  : 'Scientific personality analysis based on APT theory. Discover your artistic tendencies in just 3 minutes.'
                }
              </p>
            </motion.div>
            
            {/* Medium features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="md:col-span-2 bg-gradient-to-br from-blue-900/50 to-purple-900/50 p-6 rounded-3xl border border-blue-800/50 backdrop-blur-sm"
            >
              <Palette className="w-10 h-10 text-blue-400 mb-3" />
              <h3 className="text-xl font-bold mb-2">
                {language === 'ko' ? '맞춤형 큐레이션' : 'Personalized Curation'}
              </h3>
              <p className="text-gray-300">
                {language === 'ko' 
                  ? 'AI가 당신의 취향을 학습하여 완벽한 작품을 추천'
                  : 'AI learns your taste and recommends perfect artworks'
                }
              </p>
            </motion.div>
            
            {/* Small features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-green-900/50 to-blue-900/50 p-6 rounded-3xl border border-green-800/50 backdrop-blur-sm"
            >
              <Eye className="w-10 h-10 text-green-400 mb-3" />
              <h3 className="text-xl font-bold mb-2">
                {language === 'ko' ? '미술관 연동' : 'Museum Access'}
              </h3>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-pink-900/50 to-purple-900/50 p-6 rounded-3xl border border-pink-800/50 backdrop-blur-sm"
            >
              <Users className="w-10 h-10 text-pink-400 mb-3" />
              <h3 className="text-xl font-bold mb-2">
                {language === 'ko' ? '커뮤니티' : 'Community'}
              </h3>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Scroll Gallery */}
      <section className="py-20 bg-black">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-bold text-center mb-16"
        >
          {language === 'ko' ? '인기 작품' : 'Popular Artworks'}
        </motion.h2>
        
        {/* Horizontal scroll container */}
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-6 px-4 w-max">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="relative w-80 h-96 bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-2xl overflow-hidden group cursor-pointer"
              >
                <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-20">
                  🎨
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                  <h3 className="text-xl font-bold mb-1">Artwork {i}</h3>
                  <p className="text-gray-300">Artist Name</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Stats */}
      <section className="py-20 px-4 bg-gradient-to-b from-gray-950 to-black">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { value: '50K+', label: language === 'ko' ? '활성 사용자' : 'Active Users' },
              { value: '1M+', label: language === 'ko' ? '큐레이션된 작품' : 'Curated Works' },
              { value: '98%', label: language === 'ko' ? '만족도' : 'Satisfaction' }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <motion.h3
                  className="text-5xl md:text-6xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", delay: i * 0.1 + 0.2 }}
                >
                  {stat.value}
                </motion.h3>
                <p className="text-gray-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Final CTA */}
      <section className="py-20 px-4 bg-gradient-to-r from-purple-900 to-pink-900">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            {language === 'ko' ? '지금 시작하세요' : 'Start Your Journey'}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-200 mb-8"
          >
            {language === 'ko' 
              ? '3분만에 당신의 예술 성향을 발견하세요'
              : 'Discover your art personality in 3 minutes'
            }
          </motion.p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/quiz')}
            className="px-10 py-5 bg-white text-purple-900 font-bold text-xl rounded-2xl shadow-2xl hover:shadow-3xl transition-all"
          >
            <span className="flex items-center gap-3">
              {language === 'ko' ? '무료로 시작하기' : 'Start Free'}
              <ArrowRight className="w-6 h-6" />
            </span>
          </motion.button>
        </div>
      </section>
    </div>
  );
}