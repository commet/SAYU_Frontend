'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowRight, Sparkles, Brain, Palette, Eye, Users, Star, ChevronDown, Clock, Heart, Compass, Camera } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ModernSAYUPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  
  // Scroll progress
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Animal personality types (APT)
  const personalities = [
    { animal: '🦁', name: language === 'ko' ? '사자' : 'Lion', trait: language === 'ko' ? '리더십' : 'Leadership' },
    { animal: '🦊', name: language === 'ko' ? '여우' : 'Fox', trait: language === 'ko' ? '창의성' : 'Creativity' },
    { animal: '🦌', name: language === 'ko' ? '사슴' : 'Deer', trait: language === 'ko' ? '감수성' : 'Sensitivity' },
    { animal: '🐺', name: language === 'ko' ? '늑대' : 'Wolf', trait: language === 'ko' ? '독립성' : 'Independence' },
  ];

  return (
    <div className="relative bg-white dark:bg-gray-950">
      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 transform-origin-0 z-50"
        style={{ scaleX }}
      />
      
      {/* Hero - Clear Purpose */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Subtle animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-950 dark:via-purple-950/10 dark:to-gray-950">
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/50 rounded-full mb-6 border border-purple-200 dark:border-purple-800"
              >
                <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                  {language === 'ko' ? 'APT 성격 기반 예술 추천' : 'APT-based Art Recommendation'}
                </span>
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl md:text-6xl font-bold mb-6 text-gray-900 dark:text-white leading-tight"
              >
                {language === 'ko' ? (
                  <>
                    당신의 성격이<br />
                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      좋아할 예술
                    </span>을<br />
                    찾아드립니다
                  </>
                ) : (
                  <>
                    Find Art That<br />
                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      Matches Your
                    </span><br />
                    Personality
                  </>
                )}
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl text-gray-600 dark:text-gray-400 mb-8"
              >
                {language === 'ko' 
                  ? '3분 성격 테스트로 세계 유명 미술관의 작품 중 당신에게 맞는 예술을 AI가 큐레이션합니다.'
                  : 'Take a 3-minute personality test and let AI curate artworks from world-famous museums just for you.'
                }
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <button
                  onClick={() => router.push('/quiz')}
                  className="group px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                >
                  <span className="flex items-center gap-2">
                    {language === 'ko' ? '성격 테스트 시작' : 'Start Personality Test'}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
                
                <button
                  onClick={() => router.push('/gallery')}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                >
                  {language === 'ko' ? '작품 둘러보기' : 'Browse Gallery'}
                </button>
              </motion.div>
              
              {/* Trust indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-6 mt-8 text-sm text-gray-500 dark:text-gray-400"
              >
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{language === 'ko' ? '3분 소요' : '3 minutes'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>50K+ {language === 'ko' ? '사용자' : 'users'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-current text-yellow-500" />
                  <span>4.9/5</span>
                </div>
              </motion.div>
            </div>
            
            {/* Visual - Personality Preview */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="relative"
            >
              <div className="grid grid-cols-2 gap-4">
                {personalities.map((personality, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 text-center cursor-pointer"
                  >
                    <div className="text-5xl mb-3">{personality.animal}</div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{personality.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{personality.trait}</p>
                  </motion.div>
                ))}
              </div>
              <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-200 to-pink-200 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full blur-3xl" />
            </motion.div>
          </div>
        </div>
        
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
      </section>
      
      {/* How it Works */}
      <section className="py-20 px-4 bg-white dark:bg-black">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              {language === 'ko' ? '어떻게 작동하나요?' : 'How It Works'}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              {language === 'ko' ? '간단한 3단계로 시작하세요' : 'Get started in 3 simple steps'}
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                icon: Brain,
                title: language === 'ko' ? '성격 분석' : 'Personality Analysis',
                description: language === 'ko' 
                  ? 'APT 이론 기반 3분 테스트로 당신의 성격 유형을 파악합니다'
                  : 'Take a 3-minute APT-based test to identify your personality type'
              },
              {
                step: '2',
                icon: Palette,
                title: language === 'ko' ? 'AI 매칭' : 'AI Matching',
                description: language === 'ko'
                  ? 'AI가 성격에 맞는 예술 작품과 작가를 추천합니다'
                  : 'AI recommends artworks and artists that match your personality'
              },
              {
                step: '3',
                icon: Compass,
                title: language === 'ko' ? '예술 여정' : 'Art Journey',
                description: language === 'ko'
                  ? '맞춤형 미술관 투어와 작품 해설을 즐기세요'
                  : 'Enjoy personalized museum tours and artwork interpretations'
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold text-xl">
                      {item.step}
                    </div>
                    <item.icon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {item.description}
                  </p>
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Features Grid */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              {language === 'ko' ? '특별한 기능들' : 'Special Features'}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              {language === 'ko' ? 'SAYU만의 차별화된 서비스' : 'Unique services only from SAYU'}
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Camera,
                title: language === 'ko' ? 'AR 미술관' : 'AR Museum',
                description: language === 'ko' ? '집에서 즐기는 가상 전시' : 'Virtual exhibitions at home',
                color: 'from-purple-500 to-pink-500'
              },
              {
                icon: Heart,
                title: language === 'ko' ? '감정 큐레이션' : 'Mood Curation',
                description: language === 'ko' ? '오늘 기분에 맞는 작품' : 'Art for your mood today',
                color: 'from-pink-500 to-rose-500'
              },
              {
                icon: Users,
                title: language === 'ko' ? '아트 서클' : 'Art Circle',
                description: language === 'ko' ? '비슷한 취향의 친구들' : 'Friends with similar taste',
                color: 'from-blue-500 to-purple-500'
              },
              {
                icon: Eye,
                title: language === 'ko' ? 'AI 도슨트' : 'AI Docent',
                description: language === 'ko' ? '작품 해설과 스토리' : 'Artwork stories & insights',
                color: 'from-green-500 to-blue-500'
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                onHoverStart={() => setHoveredCard(i)}
                onHoverEnd={() => setHoveredCard(null)}
                className="relative group"
              >
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 h-full hover:shadow-lg transition-shadow">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} text-white mb-4`}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {feature.description}
                  </p>
                </div>
                <AnimatePresence>
                  {hoveredCard === i && (
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.95, opacity: 0 }}
                      className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl -z-10"
                    />
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Social Proof */}
      <section className="py-20 px-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-950 dark:to-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              { 
                value: '50,000+', 
                label: language === 'ko' ? '활성 사용자' : 'Active Users',
                sublabel: language === 'ko' ? '매일 예술을 발견하는' : 'Discovering art daily'
              },
              { 
                value: '1M+', 
                label: language === 'ko' ? '큐레이션 작품' : 'Curated Works',
                sublabel: language === 'ko' ? '세계 유명 미술관 제휴' : 'From world museums'
              },
              { 
                value: '98%', 
                label: language === 'ko' ? '매칭 정확도' : 'Match Accuracy',
                sublabel: language === 'ko' ? 'AI 추천 만족도' : 'AI recommendation satisfaction'
              }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <h3 className="text-5xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {stat.value}
                </h3>
                <p className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                  {stat.label}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.sublabel}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 px-4 bg-white dark:bg-black">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-purple-600 to-pink-600 p-12 rounded-3xl text-white"
          >
            <h2 className="text-4xl font-bold mb-4">
              {language === 'ko' 
                ? '지금 당신의 예술 성향을 발견하세요'
                : 'Discover Your Art Personality Now'
              }
            </h2>
            <p className="text-xl mb-8 text-white/90">
              {language === 'ko'
                ? '3분이면 충분합니다. 50,000명이 이미 자신만의 예술을 찾았습니다.'
                : '3 minutes is all it takes. 50,000 people have already found their art.'
              }
            </p>
            <button
              onClick={() => router.push('/quiz')}
              className="px-8 py-4 bg-white text-purple-600 font-bold rounded-xl hover:shadow-lg transition-all"
            >
              <span className="flex items-center gap-2">
                {language === 'ko' ? '무료로 시작하기' : 'Start Free'}
                <ArrowRight className="w-5 h-5" />
              </span>
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}