'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import '@/styles/sayu-design-system.css';
import { OptimizedImage, getCloudinaryUrl } from '@/components/ui/OptimizedImage';
import { PioneerCounter } from '@/components/ui/PioneerBadge';
import { getPioneerStats } from '@/lib/api/pioneer';
import { 
  AnimeJSTextReveal, 
  AnimeJSGalleryReveal, 
  AnimeJSFloatingElements, 
  AnimeJSScrollReveal,
  AnimeJSMorphingBackground,
  useAnimeJS 
} from '@/components/animations/AnimeJSEnhanced';
import ScrollExpandMedia from '@/components/ui/scroll-expansion-hero';

// Emotion to personality type mapping
const emotionToPersonality = {
  'Passion': ['SAEF', 'SAMF'], // 감정 지휘자, 영감 전도사
  'Serenity': ['LRMC', 'LAMC'], // 침묵의 정원사, 패턴 건축가
  'Mystery': ['SREC', 'SREF'], // 마음의 큐레이터, 이야기 직조가
  'Contemplation': ['LREC', 'LRMF'], // 질감의 예언자, 내면의 탐구자
  'Joy': ['SAEC', 'SAMF'], // 감성 큐레이터, 영감 전도사
  'Imagination': ['LAEF', 'SREF'] // 몽환적 방랑자, 이야기 직조가
};

export default function SensoryLandingPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const supabase = createClientComponentClient();
  const [selectedEmotion, setSelectedEmotion] = useState<string>('#FF6B6B');
  const [selectedEmotionName, setSelectedEmotionName] = useState<string>('Passion');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [artworks, setArtworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pioneerStats, setPioneerStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const anime = useAnimeJS();

  // Scroll animations
  const { scrollY, scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 400], [1, 0.95]);

  // Mouse position for interactive effects
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Fetch artworks based on emotion
  const fetchArtworks = async (emotion: string) => {
    setLoading(true);
    try {
      // Get personality types for the selected emotion
      const personalityTypes = emotionToPersonality[emotion as keyof typeof emotionToPersonality] || ['LAEF'];
      
      // Fetch artworks for each personality type
      const promises = personalityTypes.map(async (type) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/artvee/personality/${type}?limit=5&emotionFilter=${emotion.toLowerCase()}`);
        if (response.ok) {
          const data = await response.json();
          return data.artworks || [];
        }
        return [];
      });
      
      const results = await Promise.all(promises);
      const allArtworks = results.flat();
      
      // Remove duplicates and limit to 12 artworks
      const uniqueArtworks = Array.from(new Map(allArtworks.map(item => [item.artveeId, item])).values()).slice(0, 12);
      
      setArtworks(uniqueArtworks);
    } catch (error) {
      console.error('Error fetching artworks:', error);
      // Fallback to random artworks
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/artvee/random?limit=12`);
        if (response.ok) {
          const data = await response.json();
          setArtworks(data.artworks || []);
        }
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);

    // Check auth status
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        router.push('/dashboard');
      }
    };
    checkAuth();

    // Fetch initial artworks
    fetchArtworks('Passion');

    // Fetch pioneer stats
    const fetchPioneerStats = async () => {
      try {
        const stats = await getPioneerStats();
        setPioneerStats(stats);
      } catch (error) {
        console.error('Failed to fetch pioneer stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchPioneerStats();

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      setMousePosition({
        x: (clientX / window.innerWidth - 0.5) * 20,
        y: (clientY / window.innerHeight - 0.5) * 20,
      });
    };

    // Scroll progress handler
    const handleScroll = () => {
      const winScroll = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = (winScroll / height) * 100;
      setScrollProgress(scrolled);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [router, supabase]);

  if (!mounted) return null;

  // Emotion colors for the picker
  const emotionColors = [
    { color: '#FF6B6B', name: language === 'ko' ? '열정' : 'Passion' },
    { color: '#C589E8', name: language === 'ko' ? '상상' : 'Imagination' },
    { color: '#95CDB6', name: language === 'ko' ? '평온' : 'Serenity' },
    { color: '#5E85CC', name: language === 'ko' ? '사색' : 'Contemplation' },
    { color: '#FFB26B', name: language === 'ko' ? '기쁨' : 'Joy' },
    { color: '#8B7BAB', name: language === 'ko' ? '신비' : 'Mystery' },
  ];

  return (
    <div ref={containerRef} className="relative overflow-hidden">
      {/* Scroll Progress Indicator */}
      <div className="scroll-progress">
        <div 
          className="scroll-progress-bar" 
          style={{ height: `${scrollProgress}%` }}
        />
      </div>

      {/* Custom Cursor */}
      <motion.div 
        className="custom-cursor-dot"
        style={{
          x: mousePosition.x,
          y: mousePosition.y,
        }}
      />
      <motion.div 
        className="custom-cursor-ring"
        style={{
          x: mousePosition.x * 0.5,
          y: mousePosition.y * 0.5,
        }}
      />

      {/* Section 1: Opening Gallery */}
      <section className="scroll-section relative">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 animate-gradient-morph" style={{
          background: `linear-gradient(135deg, ${selectedEmotion}20 0%, transparent 50%, ${selectedEmotion}10 100%)`,
        }} />

        {/* Enhanced Floating Emotion Particles with AnimeJS */}
        <AnimeJSFloatingElements 
          count={20}
          colors={emotionColors.map(e => e.color)}
          className="emotion-particles"
        />

        <motion.div 
          className="relative z-10 text-center px-4 max-w-4xl mx-auto"
          style={{ opacity: heroOpacity, scale: heroScale }}
        >
          <AnimeJSTextReveal
            text={language === 'ko' ? '당신의 감정은 어떤 색인가요?' : 'What Color Is Your Emotion?'}
            className="text-hero mb-8 leading-tight"
            delay={500}
            duration={2000}
          />

          <motion.p 
            className="text-body mb-12 opacity-80"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
          >
            {language === 'ko' 
              ? '감정의 색을 선택하고, 당신만의 예술을 발견하세요'
              : 'Choose the color of your emotion and discover your art'}
          </motion.p>

          {/* Enhanced Emotion Selector */}
          <motion.div 
            className="mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {/* Emotion Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              {emotionColors.map((emotion, index) => (
                <motion.button
                  key={emotion.color}
                  className={`group relative p-6 rounded-3xl transition-all duration-500 overflow-hidden ${
                    selectedEmotionName === emotion.name 
                      ? 'scale-105' 
                      : 'hover:scale-102'
                  }`}
                  style={{ 
                    background: selectedEmotionName === emotion.name
                      ? `linear-gradient(135deg, ${emotion.color}20, ${emotion.color}10)`
                      : 'rgba(255, 255, 255, 0.5)',
                    border: selectedEmotionName === emotion.name
                      ? `2px solid ${emotion.color}`
                      : '1px solid rgba(0, 0, 0, 0.05)',
                    boxShadow: selectedEmotionName === emotion.name 
                      ? `0 8px 32px ${emotion.color}40`
                      : '0 4px 16px rgba(0,0,0,0.05)'
                  }}
                  onClick={() => {
                    setSelectedEmotion(emotion.color);
                    setSelectedEmotionName(emotion.name);
                    fetchArtworks(emotion.name);
                  }}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {/* Emotion Color Visual */}
                  <motion.div 
                    className="w-full h-24 rounded-2xl mb-4 relative overflow-hidden"
                    style={{ background: emotion.color }}
                  >
                    {/* Animated Gradient Overlay */}
                    <motion.div
                      className="absolute inset-0"
                      style={{
                        background: `radial-gradient(circle at 50% 50%, transparent 0%, ${emotion.color} 100%)`,
                      }}
                      animate={{
                        scale: selectedEmotionName === emotion.name ? [1, 1.5, 1] : 1,
                        opacity: selectedEmotionName === emotion.name ? [0.5, 0.8, 0.5] : 0.3,
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    
                    {/* Emotion Icon/Symbol */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-4xl filter brightness-200 opacity-80">
                        {emotion.name === 'Passion' && '🔥'}
                        {emotion.name === 'Serenity' && '🌊'}
                        {emotion.name === 'Joy' && '✨'}
                        {emotion.name === 'Mystery' && '🌙'}
                        {emotion.name === 'Imagination' && '🦋'}
                        {emotion.name === 'Contemplation' && '🍃'}
                      </span>
                    </div>
                  </motion.div>
                  
                  {/* Emotion Name */}
                  <h3 className={`text-lg font-medium mb-2 transition-colors ${
                    selectedEmotionName === emotion.name 
                      ? 'text-gray-900' 
                      : 'text-gray-700'
                  }`}>
                    {emotion.name}
                  </h3>
                  
                  {/* Emotion Description */}
                  <p className="text-sm opacity-70">
                    {language === 'ko' ? (
                      <>
                        {emotion.name === 'Passion' && '뜨거운 열정과 에너지'}
                        {emotion.name === 'Serenity' && '고요한 평화와 안정'}
                        {emotion.name === 'Joy' && '밝은 기쁨과 즐거움'}
                        {emotion.name === 'Mystery' && '신비로운 호기심'}
                        {emotion.name === 'Imagination' && '무한한 상상의 세계'}
                        {emotion.name === 'Contemplation' && '깊은 사색과 성찰'}
                      </>
                    ) : (
                      <>
                        {emotion.name === 'Passion' && 'Burning energy & drive'}
                        {emotion.name === 'Serenity' && 'Peaceful & calm state'}
                        {emotion.name === 'Joy' && 'Bright happiness'}
                        {emotion.name === 'Mystery' && 'Curious enigma'}
                        {emotion.name === 'Imagination' && 'Endless creativity'}
                        {emotion.name === 'Contemplation' && 'Deep reflection'}
                      </>
                    )}
                  </p>
                  
                  {/* Selection Indicator */}
                  {selectedEmotionName === emotion.name && (
                    <motion.div
                      className="absolute top-3 right-3"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring" }}
                    >
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ background: emotion.color }}
                      >
                        <span className="text-white text-xs">✓</span>
                      </div>
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
            
            {/* Current Emotion Indicator */}
            <motion.div 
              className="text-center mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <p className="text-sm opacity-60">
                {language === 'ko' ? '선택된 감정' : 'Selected emotion'}
              </p>
              <motion.p 
                className="text-xl font-medium mt-1"
                style={{ color: selectedEmotion }}
                key={selectedEmotionName}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {selectedEmotionName}
              </motion.p>
            </motion.div>
          </motion.div>

          {/* Pioneer Counter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mb-8"
          >
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-3">
                {language === 'ko' ? 'SAYU의 첫 100명과 함께하세요' : 'Join the First 100 SAYU Pioneers'}
              </div>
              {!statsLoading && pioneerStats && (
                <PioneerCounter 
                  currentCount={pioneerStats.total_pioneers}
                  maxCount={100}
                  isLoading={statsLoading}
                />
              )}
              <div className="text-xs text-gray-500 mt-2">
                {language === 'ko' 
                  ? `오늘 ${pioneerStats?.new_today || 0}명이 새로 가입했습니다`
                  : `${pioneerStats?.new_today || 0} new pioneers joined today`
                }
              </div>
            </div>
          </motion.div>

          <motion.button
            className="glass-enhanced px-12 py-6 rounded-full text-lg font-medium magnetic-button"
            style={{ 
              background: `linear-gradient(135deg, ${selectedEmotion}20, transparent)`,
              border: `1px solid ${selectedEmotion}40`
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/quiz')}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {language === 'ko' ? '나의 예술 성향 찾기' : 'Find My Art Personality'}
          </motion.button>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="text-caption opacity-60">
            {language === 'ko' ? '아래로 스크롤' : 'Scroll down'}
          </div>
        </motion.div>
      </section>

      {/* Section 2: Emotion Translation */}
      <section className="scroll-section bg-gradient-to-b from-transparent to-gray-50/50">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          {/* Left: Emotion Input */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-title mb-6">
              {language === 'ko' ? '감정을 입력하면' : 'When You Input Emotion'}
            </h2>
            <div className="glass-enhanced p-8 rounded-3xl">
              <div className="space-y-4">
                {['기쁨', '설렘', '평온', '호기심'].map((emotion, i) => (
                  <motion.div
                    key={emotion}
                    className="p-4 rounded-2xl"
                    style={{ background: `${emotionColors[i].color}10` }}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <span className="text-body">{emotion}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right: Artwork Translation */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <h2 className="text-title mb-6">
              {language === 'ko' ? '작품으로 번역됩니다' : 'Translated to Artworks'}
            </h2>
            <AnimeJSGalleryReveal
              items={loading ? (
                // Loading skeleton
                [...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-2xl bg-gray-200 animate-pulse"
                  />
                ))
              ) : (
                artworks.slice(0, 4).map((artwork, i) => (
                  <div
                    key={artwork.artveeId}
                    className="aspect-square rounded-2xl overflow-hidden artwork-card relative group"
                  >
                    <OptimizedImage
                      src={artwork.cloudinaryUrl?.full || getCloudinaryUrl(`sayu/artvee/full/${artwork.artveeId}`, {
                        width: 400,
                        height: 400,
                        crop: 'fill',
                        quality: 85
                      })}
                      alt={artwork.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-4 left-4 text-white">
                        <p className="text-sm font-medium">{artwork.title}</p>
                        <p className="text-xs opacity-80">{artwork.artist}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
              className="grid grid-cols-2 gap-4"
            />
          </motion.div>
        </div>
      </section>

      {/* Section 3: Gallery Journey - Horizontal Scroll */}
      <section className="scroll-section py-20">
        <div className="max-w-7xl mx-auto px-4">
          <motion.h2 
            className="text-title text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {language === 'ko' ? '갤러리 여정' : 'Gallery Journey'}
          </motion.h2>

          <div className="horizontal-gallery">
            {loading ? (
              // Loading skeleton
              [...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="w-80 h-96 glass-enhanced rounded-3xl p-6 flex-shrink-0"
                >
                  <div className="w-full h-3/4 bg-gray-200 animate-pulse rounded-2xl mb-4" />
                  <div className="h-4 bg-gray-200 animate-pulse rounded mb-2" />
                  <div className="h-3 bg-gray-200 animate-pulse rounded w-2/3" />
                </div>
              ))
            ) : (
              artworks.map((artwork, i) => (
                <motion.div
                  key={artwork.artveeId}
                  className="gallery-item"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (i % 4) * 0.1 }}
                >
                  <div className="w-80 h-96 glass-enhanced rounded-3xl overflow-hidden group cursor-pointer">
                    <div className="relative w-full h-3/4">
                      <OptimizedImage
                        src={artwork.cloudinaryUrl?.full || getCloudinaryUrl(`sayu/artvee/full/${artwork.artveeId}`, {
                          width: 600,
                          height: 450,
                          crop: 'fill',
                          quality: 85
                        })}
                        alt={artwork.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        sizes="320px"
                      />
                      <div 
                        className="absolute inset-0 opacity-20 mix-blend-overlay"
                        style={{ background: selectedEmotion }}
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-medium mb-1">{artwork.title}</h3>
                      <p className="text-sm opacity-70">{artwork.artist}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ background: selectedEmotion }}
                        />
                        <p className="text-xs opacity-60">{selectedEmotionName}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Section 4: Personal Museum - 3D Perspective */}
      <section className="scroll-section bg-gradient-to-b from-gray-50/50 to-transparent">
        <div className="perspective-container max-w-6xl mx-auto px-4">
          <motion.h2 
            className="text-title text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {language === 'ko' ? '당신만의 미술관' : 'Your Personal Museum'}
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: language === 'ko' ? '감정 번역' : 'Emotion Translation', icon: '🎨' },
              { title: language === 'ko' ? '사유의 동반' : 'Contemplative Companion', icon: '🤔' },
              { title: language === 'ko' ? '취향 발견' : 'Taste Discovery', icon: '✨' },
            ].map((feature, i) => (
              <motion.div
                key={i}
                className="card-3d glass-enhanced p-8 rounded-3xl text-center"
                initial={{ opacity: 0, rotateY: -30 }}
                whileInView={{ opacity: 1, rotateY: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
              >
                <div className="text-6xl mb-4">{feature.icon}</div>
                <h3 className="text-heading mb-4">{feature.title}</h3>
                <p className="text-body opacity-80">
                  {language === 'ko' 
                    ? '당신의 감정과 예술이 만나는 특별한 순간'
                    : 'Special moments where your emotions meet art'}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5: Daily Ritual - Timeline */}
      <section className="scroll-section">
        <div className="max-w-4xl mx-auto px-4">
          <motion.h2 
            className="text-title text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {language === 'ko' ? '매일의 예술 리추얼' : 'Daily Art Ritual'}
          </motion.h2>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-gradient-to-b from-transparent via-gray-300 to-transparent" />

            {/* Timeline Items */}
            {[
              { time: '아침', emotion: '평온', color: '#95CDB6' },
              { time: '점심', emotion: '활력', color: '#FFB26B' },
              { time: '저녁', emotion: '사색', color: '#5E85CC' },
              { time: '밤', emotion: '신비', color: '#8B7BAB' },
            ].map((item, i) => (
              <motion.div
                key={i}
                className={`flex items-center gap-8 mb-12 ${i % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="flex-1 text-right">
                  {i % 2 === 0 && (
                    <>
                      <h3 className="text-heading mb-2">{item.time}</h3>
                      <p className="text-body opacity-80">{item.emotion}</p>
                    </>
                  )}
                </div>
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: item.color }}
                >
                  <div className="w-3 h-3 bg-white rounded-full" />
                </div>
                <div className="flex-1">
                  {i % 2 !== 0 && (
                    <>
                      <h3 className="text-heading mb-2">{item.time}</h3>
                      <p className="text-body opacity-80">{item.emotion}</p>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 6: Community Gallery - Masonry */}
      <section className="scroll-section bg-gradient-to-t from-gray-50/50 to-transparent">
        <div className="max-w-7xl mx-auto px-4">
          <motion.h2 
            className="text-title text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {language === 'ko' ? '감정의 갤러리' : 'Gallery of Emotions'}
          </motion.h2>

          <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
            {loading ? (
              // Loading skeleton
              [...Array(9)].map((_, i) => (
                <div
                  key={i}
                  className="break-inside-avoid mb-6"
                  style={{ height: `${300 + (i % 3) * 100}px` }}
                >
                  <div className="glass-enhanced rounded-3xl bg-gray-200 animate-pulse h-full" />
                </div>
              ))
            ) : (
              artworks.slice(0, 9).map((artwork, i) => (
                <motion.div
                  key={`${artwork.artveeId}-${i}`}
                  className="break-inside-avoid mb-6"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (i % 3) * 0.1 }}
                >
                  <div 
                    className="glass-enhanced rounded-3xl overflow-hidden artwork-card group cursor-pointer"
                    style={{ 
                      height: `${300 + (i % 3) * 100}px`
                    }}
                  >
                    <div className="relative w-full h-full">
                      <OptimizedImage
                        src={artwork.cloudinaryUrl?.full || getCloudinaryUrl(`sayu/artvee/full/${artwork.artveeId}`, {
                          width: 400,
                          height: 600,
                          crop: 'fill',
                          quality: 80
                        })}
                        alt={artwork.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent">
                        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                          <h4 className="text-lg font-medium mb-1">{artwork.title}</h4>
                          <p className="text-sm opacity-90 mb-3">{artwork.artist}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full"
                                style={{ background: selectedEmotion }}
                              />
                              <span className="text-xs opacity-80">{selectedEmotionName}</span>
                            </div>
                            <p className="text-xs opacity-70">
                              {language === 'ko' ? `${100 + i * 23}명이 공감` : `${100 + i * 23} people relate`}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Section 7: Begin Journey - CTA */}
      <section className="scroll-section relative">
        <div className="absolute inset-0 animate-gradient-morph opacity-30" style={{
          background: 'var(--emotion-twilight)',
        }} />

        <motion.div 
          className="relative z-10 text-center px-4 max-w-4xl mx-auto"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-hero mb-8">
            {language === 'ko' ? '시작할 준비가\n되셨나요?' : 'Ready to\nBegin?'}
          </h2>

          <p className="text-body mb-12 opacity-80 max-w-2xl mx-auto">
            {language === 'ko' 
              ? '3분의 테스트로 당신의 예술 성향을 발견하고,\n평생 함께할 작품들을 만나보세요.'
              : 'Discover your art personality with a 3-minute test\nand meet artworks that will stay with you forever.'}
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <motion.button
              className="glass-enhanced px-12 py-6 rounded-full text-lg font-medium magnetic-button"
              style={{ 
                background: `linear-gradient(135deg, ${selectedEmotion}40, ${selectedEmotion}20)`,
                border: `2px solid ${selectedEmotion}`
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/quiz')}
            >
              {language === 'ko' ? '지금 시작하기' : 'Start Now'}
            </motion.button>

            <motion.button
              className="glass-enhanced px-12 py-6 rounded-full text-lg font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/gallery')}
            >
              {language === 'ko' ? '갤러리 둘러보기' : 'Explore Gallery'}
            </motion.button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}