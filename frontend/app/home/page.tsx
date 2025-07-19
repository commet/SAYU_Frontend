'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardDescription, GlassCardContent } from '@/components/ui/glass';
import { GlassButton } from '@/components/ui/glass';
import { MapPin, Clock, Users, Sparkles, ChevronRight, Lock, Palette, Heart, Compass } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { FeaturedArtists } from '@/components/home/FeaturedArtists';
import toast from 'react-hot-toast';
import '@/styles/emotional-palette.css';
import '@/styles/museum-entrance.css';
import FeedbackButton from '@/components/feedback/FeedbackButton';

interface Feature {
  name: string;
  icon: string;
  path: string;
  status?: 'locked' | 'available';
  description: string;
  category: string;
}

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { language } = useLanguage();

  // FeaturedArtists 컴포넌트가 API를 통해 실제 데이터를 가져옵니다
  // 임시로 비워둡니다
  const featuredArtists = [
    {
      name: { en: 'Yayoi Kusama', ko: '쿠사마 야요이' },
      style: { en: 'Contemporary, Installation', ko: '현대미술, 설치미술' },
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop&q=80',
      personality: ['SREF', 'SREC'] // 이야기 직조가, 마음의 큐레이터
    },
    {
      name: { en: 'Lee Ufan', ko: '이우환' },
      style: { en: 'Minimalism, Mono-ha', ko: '미니멀리즘, 모노하' },
      image: 'https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=400&h=400&fit=crop&q=80',
      personality: ['LAMC', 'SAMF'] // 패턴 건축가, 마음의 연금술사
    },
    {
      name: { en: 'David Hockney', ko: '데이비드 호크니' },
      style: { en: 'Pop Art, Landscapes', ko: '팝아트, 풍경화' },
      image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=400&fit=crop&q=80',
      personality: ['LREF', 'LREC'] // 침묵의 시인, 질감의 예언자
    },
    {
      name: { en: 'Nam June Paik', ko: '백남준' },
      style: { en: 'Video Art, New Media', ko: '비디오 아트, 뉴미디어' },
      image: 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400&h=400&fit=crop&q=80',
      personality: ['SAEF', 'SREC'] // 감정 지휘자, 마음의 큐레이터
    }
  ];
  const [timeOfDay, setTimeOfDay] = useState('');
  const [doorsOpen, setDoorsOpen] = useState(true);
  const [currentVisitors, setCurrentVisitors] = useState(1234);
  const [todayDiscoveries, setTodayDiscoveries] = useState(89);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) setTimeOfDay('morning');
    else if (hour >= 12 && hour < 18) setTimeOfDay('afternoon');
    else if (hour >= 18 && hour < 22) setTimeOfDay('evening');
    else setTimeOfDay('night');
  }, []);

  // 기능들을 카테고리별로 재구성
  const coreFeatures = [
    {
      name: language === 'ko' ? '성향 테스트' : 'Personality Test',
      icon: '🎭',
      path: '/quiz',
      status: 'available',
      description: language === 'ko' ? '3분 테스트로 당신의 예술 유형을 발견하세요' : 'Discover your art type in 3 minutes',
      category: 'core'
    },
    {
      name: language === 'ko' ? '갤러리 탐험' : 'Gallery Explorer',
      icon: '🖼️',
      path: '/gallery',
      status: 'available',
      description: language === 'ko' ? '세계 유명 미술관의 작품들을 둘러보세요' : 'Explore artworks from world-famous museums',
      category: 'core'
    }
  ];

  const exploreFeatures = [
    {
      name: language === 'ko' ? '작가 발견' : 'Discover Artists',
      icon: '👨‍🎨',
      path: '/artists',
      status: 'available',
      description: language === 'ko' ? '다양한 시대의 작가들을 만나보세요' : 'Meet artists from different eras',
      category: 'explore'
    },
    {
      name: language === 'ko' ? '아트페어 모드' : 'Art Fair Mode',
      icon: '🎨',
      path: '/art-fair',
      status: 'available',
      description: language === 'ko' ? '전시장에서 빠른 작품 저장' : 'Quick artwork saving at exhibitions',
      category: 'explore'
    }
  ];

  const personalFeatures = [
    {
      name: language === 'ko' ? '나의 컬렉션' : 'My Collection',
      icon: '📚',
      path: '/profile',
      status: user ? 'available' : 'locked',
      description: language === 'ko' ? '좋아한 작품들을 모아보세요' : 'Collect your favorite artworks',
      category: 'personal'
    },
    {
      name: language === 'ko' ? '전시 일기' : 'Exhibition Diary',
      icon: '📝',
      path: '/exhibition/record',
      status: user ? 'available' : 'locked',
      description: language === 'ko' ? '관람 경험을 기록하세요' : 'Record your viewing experiences',
      category: 'personal'
    },
    {
      name: language === 'ko' ? '커뮤니티' : 'Community',
      icon: '👥',
      path: '/community',
      status: user ? 'available' : 'locked',
      description: language === 'ko' ? '비슷한 취향의 사람들과 소통' : 'Connect with similar tastes',
      category: 'personal'
    }
  ];

  const advancedFeatures = [
    {
      name: language === 'ko' ? '사유의 산책' : 'Contemplative Walk',
      icon: '🚶‍♀️',
      path: '/contemplative-walk',
      status: 'available',
      description: language === 'ko' ? '작품과 깊은 대화를 나누기' : 'Deep conversation with artworks',
      category: 'advanced'
    }
  ];

  const handleFeatureClick = (feature: Feature) => {
    if (feature.status === 'locked') {
      toast(language === 'ko' 
        ? '로그인이 필요합니다' 
        : 'Please login to access this feature', 
        {
          icon: '🔒',
          style: {
            background: 'rgba(147, 51, 234, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(147, 51, 234, 0.2)',
            color: '#fff',
          },
        }
      );
      setTimeout(() => {
        router.push('/login');
      }, 1000);
      return;
    }
    router.push(feature.path);
  };

  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 300], [1, 0.8]);

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section with Animated Gradient Background */}
      <section className="relative min-h-screen flex items-center justify-center">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-hero animate-gradient-shift opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white" />
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0 -z-5">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-64 h-64 rounded-full"
              style={{
                background: `radial-gradient(circle, ${['rgba(26, 84, 144, 0.1)', 'rgba(230, 57, 70, 0.1)', 'rgba(241, 196, 15, 0.1)'][i % 3]} 0%, transparent 70%)`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                x: [0, 100, 0],
                y: [0, -100, 0],
              }}
              transition={{
                duration: 20 + i * 5,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          ))}
        </div>

        {/* Hero Content */}
        <motion.div 
          className="relative z-10 text-center px-4 max-w-6xl mx-auto"
          style={{ opacity: heroOpacity, scale: heroScale }}
        >
          {/* Main Title */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-7xl md:text-9xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
              SAYU
            </h1>
            <p className="text-2xl md:text-3xl mb-8 text-gray-700">
              {language === 'ko' ? '당신만의 예술 여정이 시작됩니다' : 'Your Personal Art Journey Begins'}
            </p>
          </motion.div>

          {/* Hero Cards */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <GlassCard className="group cursor-pointer">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-xl font-semibold mb-2">
                {language === 'ko' ? '성격 기반 큐레이션' : 'Personality-Based Curation'}
              </h3>
              <p className="text-gray-600">
                {language === 'ko' ? 'APT로 발견하는 나만의 예술 취향' : 'Discover art that matches your APT'}
              </p>
            </GlassCard>

            <GlassCard className="group cursor-pointer">
              <div className="text-4xl mb-4">🖼️</div>
              <h3 className="text-xl font-semibold mb-2">
                {language === 'ko' ? '세계적인 컬렉션' : 'Global Collections'}
              </h3>
              <p className="text-gray-600">
                {language === 'ko' ? 'MET, Rijksmuseum 등 명작 탐험' : 'Explore masterpieces from MET, Rijksmuseum'}
              </p>
            </GlassCard>

            <GlassCard className="group cursor-pointer">
              <div className="text-4xl mb-4">✨</div>
              <h3 className="text-xl font-semibold mb-2">
                {language === 'ko' ? 'AI 아트 프로필' : 'AI Art Profile'}
              </h3>
              <p className="text-gray-600">
                {language === 'ko' ? '당신만의 독특한 예술 정체성 생성' : 'Generate your unique artistic identity'}
              </p>
            </GlassCard>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link href="/">
              <GlassButton size="lg" variant="outline" className="group">
                <Heart className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                {language === 'ko' ? '처음으로' : 'Back to Start'}
              </GlassButton>
            </Link>
            <Link href="/quiz">
              <GlassButton size="lg" variant="primary" className="group">
                <Palette className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                {language === 'ko' ? '성향 테스트 시작하기' : 'Start Personality Test'}
              </GlassButton>
            </Link>
            <Link href="/philosophy">
              <GlassButton size="lg" variant="outline">
                <Sparkles className="mr-2 h-5 w-5" />
                {language === 'ko' ? '철학적 기반 알아보기' : 'Explore Our Philosophy'}
              </GlassButton>
            </Link>
            <Link href="/gallery">
              <GlassButton size="lg" variant="default">
                <Compass className="mr-2 h-5 w-5" />
                {language === 'ko' ? '갤러리 둘러보기' : 'Explore Gallery'}
              </GlassButton>
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-gray-400 rounded-full p-1">
            <div className="w-1 h-3 bg-gray-400 rounded-full mx-auto animate-pulse" />
          </div>
        </motion.div>
      </section>

      {/* Bento Grid Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {language === 'ko' ? '당신의 예술 공간' : 'Your Art Spaces'}
            </h2>
            <p className="text-xl text-gray-600">
              {language === 'ko' ? '각각의 공간이 특별한 경험을 선사합니다' : 'Each space offers a unique experience'}
            </p>
          </motion.div>

          {/* Core Features - 핵심 기능 */}
          <div className="mb-16">
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-2xl font-bold mb-6 text-center"
            >
              {language === 'ko' ? '🎯 지금 바로 시작하기' : '🎯 Start Right Now'}
            </motion.h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-[200px]">
              {coreFeatures.map((feature, index) => (
                <motion.div
                  key={feature.path}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="md:col-span-1"
                >
                  <GlassCard
                    className="h-full cursor-pointer group relative overflow-hidden"
                    onClick={() => handleFeatureClick(feature)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="relative z-10 h-full flex flex-col justify-between p-6">
                      <div>
                        <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                          {feature.icon}
                        </div>
                        <h3 className="text-xl font-bold mb-2">{feature.name}</h3>
                        <p className="text-gray-600 text-sm">{feature.description}</p>
                      </div>
                      <div className="flex items-center gap-2 text-primary group-hover:translate-x-2 transition-transform">
                        <span className="text-sm font-medium">{language === 'ko' ? '시작하기' : 'Start'}</span>
                        <ChevronRight size={16} />
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Explore Features - 탐색 기능 */}
          <div className="mb-16">
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-2xl font-bold mb-6 text-center"
            >
              {language === 'ko' ? '🔍 둘러보기' : '🔍 Explore'}
            </motion.h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-[180px]">
              {exploreFeatures.map((feature, index) => (
                <motion.div
                  key={feature.path}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <GlassCard
                    className="h-full cursor-pointer group relative overflow-hidden"
                    onClick={() => handleFeatureClick(feature)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="relative z-10 h-full flex flex-col justify-between p-5">
                      <div>
                        <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
                          {feature.icon}
                        </div>
                        <h3 className="text-lg font-bold mb-2">{feature.name}</h3>
                        <p className="text-gray-600 text-sm">{feature.description}</p>
                      </div>
                      <div className="flex items-center gap-2 text-primary group-hover:translate-x-2 transition-transform">
                        <span className="text-sm font-medium">{language === 'ko' ? '탐색하기' : 'Explore'}</span>
                        <ChevronRight size={14} />
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Personal Features - 개인화 기능 */}
          <div className="mb-16">
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-2xl font-bold mb-6 text-center"
            >
              {language === 'ko' ? '👤 나만의 공간' : '👤 Personal Space'}
            </motion.h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[160px]">
              {personalFeatures.map((feature, index) => (
                <motion.div
                  key={feature.path}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <GlassCard
                    className={`h-full cursor-pointer group relative overflow-hidden ${
                      feature.status === 'locked' ? 'opacity-60' : ''
                    }`}
                    onClick={() => handleFeatureClick(feature)}
                    whileHover={feature.status !== 'locked' ? { scale: 1.02 } : {}}
                    whileTap={feature.status !== 'locked' ? { scale: 0.98 } : {}}
                  >
                    <div className="relative z-10 h-full flex flex-col justify-between p-4">
                      <div>
                        <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">
                          {feature.icon}
                        </div>
                        <h3 className="text-base font-bold mb-1">{feature.name}</h3>
                        <p className="text-gray-600 text-xs">{feature.description}</p>
                      </div>
                      {feature.status === 'locked' ? (
                        <div className="flex items-center gap-1 text-gray-500">
                          <Lock size={12} />
                          <span className="text-xs">{language === 'ko' ? '로그인 필요' : 'Login required'}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-primary group-hover:translate-x-1 transition-transform">
                          <span className="text-xs font-medium">{language === 'ko' ? '입장' : 'Enter'}</span>
                          <ChevronRight size={12} />
                        </div>
                      )}
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Advanced Features - 고급 체험 */}
          <div className="mb-8">
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-2xl font-bold mb-6 text-center"
            >
              {language === 'ko' ? '✨ 깊은 체험' : '✨ Deep Experience'}
            </motion.h3>
            <div className="grid grid-cols-1 gap-6 auto-rows-[180px]">
              {advancedFeatures.map((feature, index) => (
                <motion.div
                  key={feature.path}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="max-w-md mx-auto w-full"
                >
                  <GlassCard
                    className="h-full cursor-pointer group relative overflow-hidden"
                    onClick={() => handleFeatureClick(feature)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="relative z-10 h-full flex flex-col justify-between p-5">
                      <div>
                        <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
                          {feature.icon}
                        </div>
                        <h3 className="text-lg font-bold mb-2">{feature.name}</h3>
                        <p className="text-gray-600 text-sm">{feature.description}</p>
                      </div>
                      <div className="flex items-center gap-2 text-primary group-hover:translate-x-2 transition-transform">
                        <span className="text-sm font-medium">{language === 'ko' ? '체험하기' : 'Experience'}</span>
                        <ChevronRight size={14} />
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4">
          <GlassCard variant="light">
            <div className="flex flex-wrap justify-center gap-8 py-4">
              <motion.div 
                className="flex items-center gap-3"
                whileHover={{ scale: 1.05 }}
              >
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{currentVisitors.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">{language === 'ko' ? '현재 방문자' : 'Current visitors'}</p>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-center gap-3"
                whileHover={{ scale: 1.05 }}
              >
                <div className="p-3 bg-secondary/10 rounded-xl">
                  <Sparkles className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{todayDiscoveries}</p>
                  <p className="text-sm text-gray-600">{language === 'ko' ? '오늘의 발견' : 'Discoveries today'}</p>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-center gap-3"
                whileHover={{ scale: 1.05 }}
              >
                <div className="p-3 bg-accent/10 rounded-xl">
                  <Heart className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">16</p>
                  <p className="text-sm text-gray-600">{language === 'ko' ? '성격 유형' : 'Personality types'}</p>
                </div>
              </motion.div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Artists Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {language === 'ko' ? '당신과 대화하는 작가들' : 'Artists Who Speak Your Language'}
            </h2>
            <p className="text-xl text-gray-600">
              {language === 'ko' ? '성격 유형별로 만나는 예술가들' : 'Discover artists by personality type'}
            </p>
          </motion.div>
          
          <FeaturedArtists limit={4} />

          {/* Final CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <GlassCard className="inline-block p-12">
              <h3 className="text-3xl font-bold mb-4">
                {language === 'ko' ? '당신의 예술 성격을 발견하세요' : 'Discover Your Art Soul'}
              </h3>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl">
                {language === 'ko' 
                  ? '16가지 성격 유형을 기반으로 당신만의 독특한 예술 취향을 찾아드립니다' 
                  : 'Find your unique artistic taste based on 16 personality types'}
              </p>
              <Link href="/quiz">
                <GlassButton size="lg" variant="primary" className="group">
                  <Sparkles className="mr-2 h-5 w-5 group-hover:rotate-180 transition-transform duration-500" />
                  {language === 'ko' ? '지금 시작하기' : 'Start Now'}
                </GlassButton>
              </Link>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      {/* Fixed Feedback Button */}
      <FeedbackButton
        position="fixed"
        variant="primary"
        contextData={{
          page: 'home',
          feature: 'landing-page'
        }}
      />
    </div>
  );
}