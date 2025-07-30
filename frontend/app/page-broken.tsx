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
import { BentoCard, BentoGrid } from '@/components/ui/bento-grid';
import { AnimatedGridPattern } from '@/components/ui/animated-grid-pattern';
// import { PaletteIcon, HeartIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { ThreeDPhotoCarousel } from '@/components/ui/3d-carousel';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { FeatureSteps } from '@/components/ui/feature-section';

// Emotion to personality type mapping
const emotionToPersonality = {
  'Passion': ['SAEF', 'SAMF'], // 감정 지휘자, 영감 전도사
  'Serenity': ['LRMC', 'LAMC'], // 침묵의 정원사, 패턴 건축가
  'Mystery': ['SREC', 'SREF'], // 마음의 큐레이터, 이야기 직조가
  'Contemplation': ['LREC', 'LRMF'], // 질감의 예언자, 내면의 탐구자
  'Joy': ['SAEC', 'SAMF'], // 감성 큐레이터, 영감 전도사
  'Imagination': ['LAEF', 'SREF'] // 몽환적 방랑자, 이야기 직조가
};

// JSON-LD 구조화된 데이터
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'SAYU',
  description: '인공지능이 당신의 감정을 이해하고 맞춤형 예술 작품을 추천합니다',
  url: 'https://sayu.art',
  applicationCategory: 'ArtApplication',
  operatingSystem: 'Any',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'KRW',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    reviewCount: '1523',
  },
  author: {
    '@type': 'Organization',
    name: 'SAYU',
    url: 'https://sayu.art',
  },
};

function SensoryLandingPage() {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
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

  // SAYU 핵심 기능 8가지
  const sayuFeatures = [
    {
      step: language === 'ko' ? 'APT 성향 테스트' : 'APT Personality Test',
      title: language === 'ko' ? '16가지 동물 캐릭터' : '16 Animal Characters',
      content: language === 'ko' 
        ? '5분의 심리학 기반 테스트로 당신만의 예술 성향을 발견하세요. 호랑이부터 고래까지, 당신을 닮은 동물을 찾아드려요.'
        : 'Discover your unique art personality through a 5-minute psychology-based test. Find your spirit animal from tiger to whale.',
      image: getCloudinaryUrl('sayu/features/apt-test', { width: 800, height: 600, crop: 'fill' })
    },
    {
      step: language === 'ko' ? '일일 감정 체크인' : 'Daily Emotion Check-in',
      title: language === 'ko' ? 'AI 맞춤 작품 추천' : 'AI Curated Artworks',
      content: language === 'ko'
        ? '매일 당신의 감정을 선택하면 AI가 공감할 수 있는 작품 5개를 큐레이션합니다. 예술로 하루를 시작하세요.'
        : 'Select your daily emotion and AI curates 5 artworks that resonate with you. Start your day with art.',
      image: getCloudinaryUrl('sayu/features/emotion-checkin', { width: 800, height: 600, crop: 'fill' })
    },
    {
      step: language === 'ko' ? 'AI 아트 카운슬러' : 'AI Art Counselor',
      title: language === 'ko' ? '개인 예술 상담사' : 'Personal Art Therapist',
      content: language === 'ko'
        ? '작품을 보며 AI와 대화하세요. 당신의 감정을 이해하고 예술을 통한 치유의 길을 제시합니다.'
        : 'Chat with AI while viewing art. It understands your emotions and guides you through art therapy.',
      image: getCloudinaryUrl('sayu/features/ai-counselor', { width: 800, height: 600, crop: 'fill' })
    },
    {
      step: language === 'ko' ? '전시 동행 매칭' : 'Exhibition Companion',
      title: language === 'ko' ? '함께하는 예술 여정' : 'Art Journey Together',
      content: language === 'ko'
        ? '비슷한 성향의 사람과 안전하게 전시를 관람하세요. 익명 시스템으로 부담 없이 시작할 수 있어요.'
        : 'Safely visit exhibitions with like-minded people. Start comfortably with our anonymous system.',
      image: getCloudinaryUrl('sayu/features/exhibition-matching', { width: 800, height: 600, crop: 'fill' })
    },
    {
      step: language === 'ko' ? '퍼셉션 익스체인지' : 'Perception Exchange',
      title: language === 'ko' ? '감상의 깊이 더하기' : 'Deepen Your Appreciation',
      content: language === 'ko'
        ? '같은 작품, 다른 시선. 다양한 해석을 통해 작품의 새로운 면을 발견하고 감상의 깊이를 더하세요.'
        : 'Same artwork, different perspectives. Discover new aspects through diverse interpretations.',
      image: getCloudinaryUrl('sayu/features/perception-exchange', { width: 800, height: 600, crop: 'fill' })
    },
    {
      step: language === 'ko' ? '실시간 갤러리' : 'Live Gallery',
      title: language === 'ko' ? '함께 보는 온라인 전시' : 'Online Exhibition Together',
      content: language === 'ko'
        ? '멀리 있는 친구와도 같은 작품을 동시에 감상하세요. 실시간으로 감정과 생각을 나눌 수 있어요.'
        : 'View artworks simultaneously with distant friends. Share emotions and thoughts in real-time.',
      image: getCloudinaryUrl('sayu/features/live-gallery', { width: 800, height: 600, crop: 'fill' })
    },
    {
      step: language === 'ko' ? '개인 미술관' : 'Personal Museum',
      title: language === 'ko' ? '나만의 작품 컬렉션' : 'Your Art Collection',
      content: language === 'ko'
        ? '좋아하는 작품을 저장하면 감정별로 자동 분류됩니다. 당신만의 디지털 미술관을 만들어보세요.'
        : 'Save favorite artworks and they\'re automatically categorized by emotion. Create your digital museum.',
      image: getCloudinaryUrl('sayu/features/personal-museum', { width: 800, height: 600, crop: 'fill' })
    },
    {
      step: language === 'ko' ? '성장 리포트' : 'Growth Report',
      title: language === 'ko' ? '예술과 함께 성장하기' : 'Grow with Art',
      content: language === 'ko'
        ? '감정 변화와 예술 취향의 성장을 시각화합니다. 예술과 함께한 당신의 여정을 기록하세요.'
        : 'Visualize your emotional changes and artistic growth. Document your journey with art.',
      image: getCloudinaryUrl('sayu/features/growth-report', { width: 800, height: 600, crop: 'fill' })
    }
  ];

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
    <>
      {/* SEO를 위한 구조화된 데이터 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <AuroraBackground className="min-h-screen" showRadialGradient={false}>
        <div ref={containerRef} className="relative overflow-hidden w-full">
      
      {/* Fixed Header Elements - Mobile Responsive */}
      <div className="fixed top-4 right-4 md:top-6 md:right-6 flex items-center gap-2 md:gap-4 z-50">
        {/* Language Toggle */}
        <button
          onClick={() => setLanguage(language === 'ko' ? 'en' : 'ko')}
          className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-full px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-medium hover:bg-white/20 transition-colors"
        >
          {language === 'ko' ? 'EN' : '한국어'}
        </button>
        
        {/* SAYU Beta Badge - Hidden on mobile */}
        <Badge variant="warm" className="hidden md:flex backdrop-blur-sm bg-white/10 border border-white/20">
          {language === 'ko' ? 'SAYU 베타' : 'SAYU Beta'}
        </Badge>
        
        {/* Theme Toggle */}
        <ThemeToggle className="backdrop-blur-sm scale-90 md:scale-100" />
      </div>
      
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

      {/* Section 1: Enhanced Hero with Scroll Expansion */}
      <ScrollExpandMedia
        mediaType="image"
        mediaSrc={getCloudinaryUrl('sayu/hero/emotion-art-hero', {
          width: 1280,
          height: 720,
          crop: 'fill',
          quality: 90
        })}
        bgImageSrc={getCloudinaryUrl('sayu/hero/gradient-background', {
          width: 1920,
          height: 1080,
          crop: 'fill',
          quality: 85
        })}
        title={language === 'ko' ? '당신의 감정은 어떤 색인가요?' : 'What Color Is Your Emotion?'}
        scrollToExpand={language === 'ko' ? '스크롤하여 감정을 탐험하세요' : 'Scroll to explore emotions'}
        textBlend={true}
      >
        <motion.div 
          className="relative z-10 text-center px-4 max-w-4xl mx-auto"
        >
          <motion.p 
            className="text-base md:text-xl mb-8 md:mb-12 opacity-90 text-white px-4"
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
            
            {/* Current Emotion Indicator with Real-time Preview */}
            <motion.div 
              className="mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <div className="text-center mb-6">
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
              </div>
              
              {/* Real-time Artwork Preview */}
              <AnimatePresence mode="wait">
                {!loading && artworks.length > 0 && (
                  <motion.div
                    key={selectedEmotionName}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5 }}
                    className="grid grid-cols-3 gap-2 max-w-md mx-auto"
                  >
                    {artworks.slice(0, 3).map((artwork, index) => (
                      <motion.div
                        key={artwork.artveeId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="aspect-square rounded-lg overflow-hidden relative group cursor-pointer"
                      >
                        <OptimizedImage
                          src={artwork.cloudinaryUrl?.thumbnail || getCloudinaryUrl(`sayu/artvee/thumb/${artwork.artveeId}`, {
                            width: 200,
                            height: 200,
                            crop: 'fill',
                            quality: 80
                          })}
                          alt={artwork.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                          sizes="150px"
                          loading="lazy"
                          placeholder="blur"
                          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                        />
                        <div 
                          className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <div className="absolute bottom-2 left-2 right-2">
                            <p className="text-white text-xs font-medium truncate">{artwork.title}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
              
              {loading && (
                <div className="grid grid-cols-3 gap-2 max-w-md mx-auto">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="aspect-square rounded-lg bg-gray-200/50 animate-pulse" />
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>

          {/* Enhanced Pioneer Counter with Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mb-8 mt-12"
          >
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-sm rounded-2xl md:rounded-3xl p-6 md:p-8 max-w-2xl mx-auto">
              <div className="text-center mb-4 md:mb-6">
                <h3 className="text-xl md:text-2xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {language === 'ko' ? '파이오니어가 되어주세요' : 'Become a Pioneer'}
                </h3>
                <p className="text-sm md:text-base text-gray-600">
                  {language === 'ko' ? 'SAYU의 첫 100명과 함께 특별한 여정을 시작하세요' : 'Start a special journey with the first 100 SAYU members'}
                </p>
              </div>
              
              {!statsLoading && pioneerStats && (
                <div className="mb-6">
                  <PioneerCounter 
                    currentCount={pioneerStats.total_pioneers}
                    maxCount={100}
                    isLoading={statsLoading}
                  />
                  <div className="text-center mt-3">
                    <span className="text-lg font-semibold">
                      {100 - (pioneerStats.total_pioneers || 0)}
                    </span>
                    <span className="text-gray-600 ml-2">
                      {language === 'ko' ? '자리 남음' : 'spots left'}
                    </span>
                  </div>
                </div>
              )}
              
              {/* Pioneer Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl mb-2">👑</div>
                  <p className="text-sm font-medium">
                    {language === 'ko' ? '평생 무료 이용' : 'Lifetime Free Access'}
                  </p>
                </div>
                <div>
                  <div className="text-2xl mb-2">🎨</div>
                  <p className="text-sm font-medium">
                    {language === 'ko' ? '독점 아트 컬렉션' : 'Exclusive Art Collection'}
                  </p>
                </div>
                <div>
                  <div className="text-2xl mb-2">💬</div>
                  <p className="text-sm font-medium">
                    {language === 'ko' ? 'AI 우선 기능 접근' : 'Priority AI Features'}
                  </p>
                </div>
              </div>
              
              <div className="text-center mt-4 text-sm text-gray-500">
                {language === 'ko' 
                  ? `오늘 ${pioneerStats?.new_today || 0}명이 파이오니어가 되었습니다`
                  : `${pioneerStats?.new_today || 0} became pioneers today`
                }
              </div>
            </div>
          </motion.div>

          <motion.button
            className="glass-enhanced px-8 md:px-12 py-4 md:py-6 rounded-full text-base md:text-lg font-medium magnetic-button w-full md:w-auto"
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
      </ScrollExpandMedia>

      {/* New Section: Clear Value Proposition */}
      <section className="py-20 px-4 relative">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {language === 'ko' 
                ? '왜 감정과 예술을 연결해야 할까요?' 
                : 'Why Connect Emotions with Art?'}
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <motion.div
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <div className="text-4xl mb-4">🧠</div>
                <h3 className="text-xl font-semibold mb-3">
                  {language === 'ko' ? '과학적 근거' : 'Scientific Basis'}
                </h3>
                <p className="text-gray-600">
                  {language === 'ko' 
                    ? '연구에 따르면 예술은 감정 조절과 정신 건강에 직접적인 영향을 미칩니다'
                    : 'Research shows art directly impacts emotional regulation and mental health'}
                </p>
              </motion.div>
              
              <motion.div
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <div className="text-4xl mb-4">💝</div>
                <h3 className="text-xl font-semibold mb-3">
                  {language === 'ko' ? '개인화된 경험' : 'Personalized Experience'}
                </h3>
                <p className="text-gray-600">
                  {language === 'ko' 
                    ? 'AI가 당신의 감정 상태와 성향을 분석해 가장 공감할 수 있는 작품을 추천합니다'
                    : 'AI analyzes your emotional state to recommend art that resonates with you'}
                </p>
              </motion.div>
              
              <motion.div
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <div className="text-4xl mb-4">🌱</div>
                <h3 className="text-xl font-semibold mb-3">
                  {language === 'ko' ? '지속적인 성장' : 'Continuous Growth'}
                </h3>
                <p className="text-gray-600">
                  {language === 'ko' 
                    ? '매일 변화하는 감정과 함께 새로운 예술적 발견을 통해 내면이 성장합니다'
                    : 'Grow internally through daily artistic discoveries aligned with your emotions'}
                </p>
              </motion.div>
            </div>
            
            {/* Statistics */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  87%
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {language === 'ko' ? '스트레스 감소' : 'Stress Reduction'}
                </p>
              </div>
              <div>
                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                  92%
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {language === 'ko' ? '감정 이해도 향상' : 'Emotional Understanding'}
                </p>
              </div>
              <div>
                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
                  3.5x
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {language === 'ko' ? '예술 탐색 증가' : 'Art Exploration'}
                </p>
              </div>
              <div>
                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">
                  15k+
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {language === 'ko' ? '활성 사용자' : 'Active Users'}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* New Section: How It Works - 3 Steps */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent to-gray-50/30">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {language === 'ko' 
                ? '어떻게 작동하나요?' 
                : 'How Does It Work?'}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {language === 'ko'
                ? '단 3단계로 당신만의 예술 여정을 시작하세요'
                : 'Start your personal art journey in just 3 steps'}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection Lines for Desktop */}
            <div className="hidden md:block absolute top-24 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

            {/* Step 1 */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl mb-6">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  {language === 'ko' ? '성향 테스트' : 'Personality Test'}
                </h3>
                <p className="text-gray-600">
                  {language === 'ko'
                    ? '16가지 동물 캐릭터 중 당신과 가장 닮은 예술 성향을 발견하세요'
                    : 'Discover your art personality among 16 unique animal characters'}
                </p>
                <div className="mt-4 text-4xl">🦁</div>
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xl mb-6">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  {language === 'ko' ? '감정 매칭' : 'Emotion Matching'}
                </h3>
                <p className="text-gray-600">
                  {language === 'ko'
                    ? 'AI가 실시간으로 당신의 감정과 공명하는 작품을 큐레이션합니다'
                    : 'AI curates artworks that resonate with your emotions in real-time'}
                </p>
                <div className="mt-4 text-4xl">🎨</div>
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold text-xl mb-6">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  {language === 'ko' ? '성장 기록' : 'Growth Journey'}
                </h3>
                <p className="text-gray-600">
                  {language === 'ko'
                    ? '매일의 감상을 기록하고 예술과 함께 성장하는 여정을 만들어가세요'
                    : 'Record daily impressions and create a growth journey with art'}
                </p>
                <div className="mt-4 text-4xl">📈</div>
              </div>
            </motion.div>
          </div>

          {/* CTA Button */}
          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            <motion.button
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full font-medium hover:shadow-lg transition-shadow"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/quiz')}
            >
              {language === 'ko' ? '지금 시작하기 →' : 'Start Now →'}
            </motion.button>
          </motion.div>
        </div>
      </section>


      {/* Section 3: Enhanced Gallery Journey - 3D Carousel */}
      <section className="scroll-section py-20 bg-gradient-to-b from-transparent to-gray-50/30">
        <div className="max-w-7xl mx-auto px-4">
          <motion.h2 
            className="text-4xl font-bold text-center mb-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {language === 'ko' ? '갤러리 여정' : 'Gallery Journey'}
          </motion.h2>
          
          <motion.p 
            className="text-center text-gray-600 mb-12 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            {language === 'ko' 
              ? '당신의 감정에 맞춰 선별된 작품들을 3D 갤러리에서 탐험해보세요'
              : 'Explore artworks curated for your emotions in our interactive 3D gallery'}
          </motion.p>

          {loading ? (
            <div className="h-[500px] bg-gray-100 rounded-3xl animate-pulse flex items-center justify-center">
              <div className="text-gray-400">
                {language === 'ko' ? '갤러리 로딩중...' : 'Loading gallery...'}
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              <div className="rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-gray-900 to-gray-800">
                <ThreeDPhotoCarousel 
                  images={artworks.map(artwork => artwork.cloudinaryUrl?.full || getCloudinaryUrl(`sayu/artvee/full/${artwork.artveeId}`, {
                    width: 400,
                    height: 400,
                    crop: 'fill',
                    quality: 85
                  }))}
                  titles={artworks.map(artwork => artwork.title)}
                  artists={artworks.map(artwork => artwork.artist)}
                />
              </div>
              
              {/* Emotion indicator overlay */}
              <div className="absolute top-6 left-6 flex items-center gap-3 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ background: selectedEmotion }}
                />
                <span className="text-sm font-medium">{selectedEmotionName}</span>
              </div>
              
              {/* Interaction hint */}
              <div className="absolute bottom-6 right-6 bg-black/70 text-white text-sm rounded-full px-4 py-2">
                {language === 'ko' ? '드래그하여 회전' : 'Drag to rotate'}
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* New Section: User Testimonials */}
      <section className="py-20 px-4 bg-gradient-to-b from-gray-50/30 to-transparent">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {language === 'ko' 
                ? '사용자들의 이야기' 
                : 'Stories from Our Users'}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {language === 'ko'
                ? 'SAYU를 통해 예술과 함께 성장한 사람들의 진솔한 경험을 들어보세요'
                : 'Hear authentic experiences from people who grew with art through SAYU'}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Testimonial 1 */}
            <motion.div
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
                  MJ
                </div>
                <div className="ml-3">
                  <p className="font-semibold">{language === 'ko' ? '민정' : 'Min Jung'}</p>
                  <p className="text-sm text-gray-500">
                    {language === 'ko' ? 'INFP 호랑이' : 'INFP Tiger'}
                  </p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                {language === 'ko'
                  ? '"매일 아침 감정에 맞는 작품을 보며 하루를 시작해요. 예전엔 몰랐던 제 감정의 깊이를 이해하게 되었어요."'
                  : '"I start each day viewing artworks that match my emotions. I\'ve come to understand the depth of my feelings I never knew before."'}
              </p>
              <div className="flex items-center text-sm text-gray-500">
                <span>⭐⭐⭐⭐⭐</span>
                <span className="ml-2">{language === 'ko' ? '6개월 사용' : '6 months user'}</span>
              </div>
            </motion.div>

            {/* Testimonial 2 */}
            <motion.div
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 flex items-center justify-center text-white font-bold">
                  JH
                </div>
                <div className="ml-3">
                  <p className="font-semibold">{language === 'ko' ? '준호' : 'Jun Ho'}</p>
                  <p className="text-sm text-gray-500">
                    {language === 'ko' ? 'ENTP 여우' : 'ENTP Fox'}
                  </p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                {language === 'ko'
                  ? '"전시 동행 매칭으로 만난 친구와 매주 미술관을 가요. 혼자서는 발견하지 못했을 작품들을 함께 감상하니 더 풍부해져요."'
                  : '"I go to museums weekly with a friend I met through exhibition matching. Appreciating art together enriches the experience beyond solo visits."'}
              </p>
              <div className="flex items-center text-sm text-gray-500">
                <span>⭐⭐⭐⭐⭐</span>
                <span className="ml-2">{language === 'ko' ? '3개월 사용' : '3 months user'}</span>
              </div>
            </motion.div>

            {/* Testimonial 3 */}
            <motion.div
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 flex items-center justify-center text-white font-bold">
                  SY
                </div>
                <div className="ml-3">
                  <p className="font-semibold">{language === 'ko' ? '서연' : 'Seo Yeon'}</p>
                  <p className="text-sm text-gray-500">
                    {language === 'ko' ? 'ISFJ 코끼리' : 'ISFJ Elephant'}
                  </p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                {language === 'ko'
                  ? '"AI 상담사와 대화하면서 제가 왜 특정 작품에 끌리는지 알게 되었어요. 예술이 제 마음의 거울이 되어주고 있어요."'
                  : '"Through conversations with the AI counselor, I discovered why I\'m drawn to certain artworks. Art has become a mirror to my soul."'}
              </p>
              <div className="flex items-center text-sm text-gray-500">
                <span>⭐⭐⭐⭐⭐</span>
                <span className="ml-2">{language === 'ko' ? '1년 사용' : '1 year user'}</span>
              </div>
            </motion.div>
          </div>

          {/* Trust Indicators */}
          <motion.div
            className="mt-12 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex justify-center items-center gap-8 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏆</span>
                <span className="text-sm text-gray-600">
                  {language === 'ko' ? '2024 최고의 웰빙 앱' : '2024 Best Wellness App'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎨</span>
                <span className="text-sm text-gray-600">
                  {language === 'ko' ? '국립현대미술관 협력' : 'MMCA Partnership'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🧠</span>
                <span className="text-sm text-gray-600">
                  {language === 'ko' ? '서울대 심리학과 연구' : 'SNU Psychology Research'}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section 4: Interactive Feature Showcase */}
      <section className="scroll-section bg-gradient-to-b from-gray-50/50 to-transparent relative">
        {/* Animated Grid Pattern Background */}
        <AnimatedGridPattern
          numSquares={30}
          maxOpacity={0.1}
          duration={3}
          repeatDelay={1}
          className="inset-x-0 inset-y-[-30%] h-[200%] skew-y-12"
        />
        
        <div className="relative z-10">
          <FeatureSteps 
            features={sayuFeatures}
            title={language === 'ko' ? 'SAYU의 8가지 핵심 기능' : '8 Core Features of SAYU'}
            className="py-20"
            autoPlayInterval={5000}
          />
          
          {/* CTA Button after features */}
          <motion.div 
            className="text-center pb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <motion.button
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full font-medium hover:shadow-lg transition-shadow inline-flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/quiz')}
            >
              {language === 'ko' ? '나의 예술 성향 찾기' : 'Find My Art Personality'}
              <span>→</span>
            </motion.button>
          </motion.div>
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
          <h2 className="text-3xl md:text-hero mb-6 md:mb-8">
            {language === 'ko' ? '시작할 준비가\n되셨나요?' : 'Ready to\nBegin?'}
          </h2>

          <p className="text-base md:text-body mb-8 md:mb-12 opacity-80 max-w-2xl mx-auto px-4">
            {language === 'ko' 
              ? '3분의 테스트로 당신의 예술 성향을 발견하고,\n평생 함께할 작품들을 만나보세요.'
              : 'Discover your art personality with a 3-minute test\nand meet artworks that will stay with you forever.'}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center px-4">
            <motion.button
              className="glass-enhanced px-8 md:px-12 py-4 md:py-6 rounded-full text-base md:text-lg font-medium magnetic-button"
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
              className="glass-enhanced px-8 md:px-12 py-4 md:py-6 rounded-full text-base md:text-lg font-medium"
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
      </AuroraBackground>
    </>
  );
}

export default SensoryLandingPage;