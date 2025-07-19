'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useSpring, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowRight, Sparkles, Brain, Palette, Eye, Users, Star, ChevronDown, MousePointer2, Zap, Heart } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ModernTrendPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const [currentSection, setCurrentSection] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Scroll progress
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });
  
  // Mouse parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  // Story sections
  const stories = [
    {
      title: language === 'ko' ? '당신은 어떤 사람인가요?' : 'Who are you?',
      subtitle: language === 'ko' ? '우리는 모두 고유한 감성을 가지고 있습니다' : 'We all have unique sensibilities',
      visual: '🤔',
      bg: 'from-indigo-900 via-purple-900 to-pink-900'
    },
    {
      title: language === 'ko' ? '예술은 어렵지 않아요' : 'Art is not difficult',
      subtitle: language === 'ko' ? 'AI가 당신의 취향을 이해합니다' : 'AI understands your taste',
      visual: '🎨',
      bg: 'from-purple-900 via-pink-900 to-rose-900'
    },
    {
      title: language === 'ko' ? '3분이면 충분해요' : '3 minutes is enough',
      subtitle: language === 'ko' ? '간단한 테스트로 시작하세요' : 'Start with a simple test',
      visual: '⏱️',
      bg: 'from-pink-900 via-rose-900 to-orange-900'
    }
  ];

  return (
    <div ref={containerRef} className="relative">
      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 transform-origin-0 z-50"
        style={{ scaleX }}
      />
      
      {/* Noise Texture Overlay */}
      <div className="fixed inset-0 opacity-[0.015] pointer-events-none z-40"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Hero - Immersive Storytelling */}
      <section className="relative min-h-screen bg-black text-white overflow-hidden">
        {/* Dynamic Background */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute inset-0 opacity-50"
            animate={{
              background: [
                'radial-gradient(circle at 20% 80%, #7c3aed 0%, transparent 50%)',
                'radial-gradient(circle at 80% 20%, #ec4899 0%, transparent 50%)',
                'radial-gradient(circle at 20% 80%, #7c3aed 0%, transparent 50%)',
              ],
            }}
            transition={{ duration: 10, repeat: Infinity }}
          />
          {/* Parallax orbs */}
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full filter blur-3xl"
            animate={{
              x: mousePosition.x * 50,
              y: mousePosition.y * 50,
            }}
            transition={{ type: "spring", stiffness: 50 }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full filter blur-3xl"
            animate={{
              x: mousePosition.x * -50,
              y: mousePosition.y * -50,
            }}
            transition={{ type: "spring", stiffness: 50 }}
          />
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
          <div className="text-center max-w-6xl mx-auto">
            {/* Animated Typography */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              <h1 className="text-[clamp(3rem,10vw,8rem)] font-bold leading-[0.9] mb-8">
                <motion.span
                  className="block"
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {language === 'ko' ? '당신의' : 'YOUR'}
                </motion.span>
                <motion.span
                  className="block bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  style={{
                    WebkitTextStroke: '1px rgba(255,255,255,0.1)',
                  }}
                >
                  {language === 'ko' ? '예술 DNA' : 'ART DNA'}
                </motion.span>
                <motion.span
                  className="block text-3xl md:text-5xl mt-4 text-gray-300"
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  {language === 'ko' ? '를 발견하세요' : 'DISCOVERED'}
                </motion.span>
              </h1>
            </motion.div>
            
            {/* Interactive CTA */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-12"
            >
              <motion.button
                onClick={() => router.push('/quiz')}
                className="group relative px-10 py-6 text-lg font-bold overflow-hidden rounded-full"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Gradient background */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-violet-600 to-pink-600"
                  whileHover={{
                    background: [
                      'linear-gradient(to right, #7c3aed, #ec4899)',
                      'linear-gradient(to right, #ec4899, #7c3aed)',
                      'linear-gradient(to right, #7c3aed, #ec4899)',
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                {/* Shimmer effect */}
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100"
                  initial={{ x: '-100%', skewX: '-12deg' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.5 }}
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                  }}
                />
                <span className="relative z-10 flex items-center gap-3">
                  {language === 'ko' ? 'DNA 분석 시작' : 'Analyze My DNA'}
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <ArrowRight className="w-5 h-5" />
                  </motion.div>
                </span>
              </motion.button>
            </motion.div>
            
            {/* Scroll indicator with animation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2"
            >
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="flex flex-col items-center gap-2"
              >
                <span className="text-sm text-gray-400">{language === 'ko' ? '스크롤하세요' : 'Scroll down'}</span>
                <ChevronDown className="w-6 h-6 text-gray-400" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Interactive Story Sections */}
      {stories.map((story, index) => (
        <section
          key={index}
          className={`relative min-h-screen flex items-center justify-center bg-gradient-to-br ${story.bg} text-white overflow-hidden`}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center px-4"
          >
            <motion.div
              className="text-8xl mb-8"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity }}
            >
              {story.visual}
            </motion.div>
            <h2 className="text-5xl md:text-7xl font-bold mb-4">{story.title}</h2>
            <p className="text-xl md:text-2xl text-white/80">{story.subtitle}</p>
          </motion.div>
        </section>
      ))}
      
      {/* Bento Grid Features */}
      <section className="py-20 px-4 bg-gray-950 text-white">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl md:text-7xl font-bold text-center mb-16"
          >
            {language === 'ko' ? '특별한 경험' : 'Special Experience'}
          </motion.h2>
          
          <div className="grid md:grid-cols-6 gap-4">
            {/* Large card - AI Analysis */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="md:col-span-3 md:row-span-2 group relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600/20 to-purple-600/20 p-8 border border-purple-500/20 backdrop-blur-sm"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-violet-600/10 to-purple-600/10"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
              <Brain className="w-16 h-16 text-purple-400 mb-6" />
              <h3 className="text-3xl font-bold mb-4">
                {language === 'ko' ? 'AI가 당신을 이해합니다' : 'AI Understands You'}
              </h3>
              <p className="text-lg text-gray-300 mb-6">
                {language === 'ko' 
                  ? 'GPT-4 기반 딥러닝으로 당신의 성격과 취향을 정확히 분석합니다. 단순한 매칭이 아닌, 진정한 이해를 바탕으로 한 추천.'
                  : 'GPT-4 powered deep learning accurately analyzes your personality and preferences. Not just matching, but recommendations based on true understanding.'
                }
              </p>
              <div className="flex gap-2">
                {['APT', 'GPT-4', 'Deep Learning'].map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-purple-500/20 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
            
            {/* Medium card - Gallery */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="md:col-span-3 group relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-600/20 to-rose-600/20 p-6 border border-pink-500/20 backdrop-blur-sm"
              whileHover={{ scale: 1.02 }}
            >
              <Palette className="w-12 h-12 text-pink-400 mb-4" />
              <h3 className="text-2xl font-bold mb-2">
                {language === 'ko' ? '세계 미술관 연동' : 'Global Museums'}
              </h3>
              <p className="text-gray-300">
                {language === 'ko' 
                  ? 'MET, 루브르, 오르세 등 세계적인 미술관의 100만점 이상 작품'
                  : 'Over 1M artworks from MET, Louvre, Orsay and more'
                }
              </p>
            </motion.div>
            
            {/* Small cards */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="md:col-span-2 group relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600/20 to-cyan-600/20 p-6 border border-blue-500/20 backdrop-blur-sm"
              whileHover={{ scale: 1.02 }}
            >
              <Eye className="w-10 h-10 text-blue-400 mb-3" />
              <h3 className="text-xl font-bold mb-1">
                {language === 'ko' ? '3D 갤러리' : '3D Gallery'}
              </h3>
              <p className="text-sm text-gray-300">
                {language === 'ko' ? '몰입감 있는 전시' : 'Immersive exhibition'}
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="md:col-span-2 group relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-600/20 to-emerald-600/20 p-6 border border-green-500/20 backdrop-blur-sm"
              whileHover={{ scale: 1.02 }}
            >
              <Users className="w-10 h-10 text-green-400 mb-3" />
              <h3 className="text-xl font-bold mb-1">
                {language === 'ko' ? '소셜 큐레이션' : 'Social Curation'}
              </h3>
              <p className="text-sm text-gray-300">
                {language === 'ko' ? '친구들과 공유' : 'Share with friends'}
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="md:col-span-2 group relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-600/20 to-amber-600/20 p-6 border border-orange-500/20 backdrop-blur-sm"
              whileHover={{ scale: 1.02 }}
            >
              <Heart className="w-10 h-10 text-orange-400 mb-3" />
              <h3 className="text-xl font-bold mb-1">
                {language === 'ko' ? '감정 분석' : 'Emotion Analysis'}
              </h3>
              <p className="text-sm text-gray-300">
                {language === 'ko' ? '기분에 맞는 추천' : 'Mood-based recommendations'}
              </p>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Interactive Stats */}
      <section className="py-20 px-4 bg-black text-white overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { value: '50K+', label: language === 'ko' ? '행복한 사용자' : 'Happy Users', delay: 0 },
              { value: '1M+', label: language === 'ko' ? '큐레이션 작품' : 'Curated Works', delay: 0.2 },
              { value: '98%', label: language === 'ko' ? '정확도' : 'Accuracy', delay: 0.4 }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: stat.delay }}
                className="text-center"
              >
                <motion.h3
                  className="text-7xl md:text-8xl font-bold mb-2"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", delay: stat.delay + 0.2 }}
                >
                  <span className="bg-gradient-to-br from-violet-400 to-pink-400 bg-clip-text text-transparent">
                    {stat.value}
                  </span>
                </motion.h3>
                <p className="text-xl text-gray-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Final CTA - Full Screen */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-900 via-purple-900 to-pink-900 text-white overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute inset-0"
            animate={{
              background: [
                'radial-gradient(circle at 0% 0%, rgba(124, 58, 237, 0.5) 0%, transparent 50%)',
                'radial-gradient(circle at 100% 100%, rgba(236, 72, 153, 0.5) 0%, transparent 50%)',
                'radial-gradient(circle at 0% 0%, rgba(124, 58, 237, 0.5) 0%, transparent 50%)',
              ],
            }}
            transition={{ duration: 10, repeat: Infinity }}
          />
        </div>
        
        <div className="relative z-10 text-center px-4">
          <motion.h2
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-6xl md:text-8xl font-bold mb-8"
          >
            {language === 'ko' ? '준비되셨나요?' : 'Ready?'}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-2xl mb-12 text-white/80"
          >
            {language === 'ko' 
              ? '3분 후, 당신은 완전히 새로운 예술 세계를 만나게 됩니다'
              : 'In 3 minutes, you\'ll discover a whole new world of art'
            }
          </motion.p>
          <motion.button
            onClick={() => router.push('/quiz')}
            className="group relative px-12 py-6 text-xl font-bold overflow-hidden rounded-full"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <motion.div
              className="absolute inset-0 bg-white"
              initial={{ scale: 0, borderRadius: '100%' }}
              whileHover={{ scale: 1.5, borderRadius: '0%' }}
              transition={{ duration: 0.5 }}
            />
            <span className="relative z-10 flex items-center gap-3 text-purple-900 group-hover:text-purple-900">
              <Zap className="w-6 h-6" />
              {language === 'ko' ? '지금 시작하기' : 'Start Now'}
              <ArrowRight className="w-6 h-6" />
            </span>
          </motion.button>
        </div>
      </section>
    </div>
  );
}