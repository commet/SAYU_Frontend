'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MapPin, Clock, Users, Sparkles, ChevronRight, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageToggle from '@/components/ui/LanguageToggle';
import toast from 'react-hot-toast';
import '@/styles/emotional-palette.css';
import '@/styles/museum-entrance.css';

interface Room {
  name: string;
  icon: string;
  path: string;
  status?: 'locked' | 'available';
  description: string;
}

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { language } = useLanguage();

  // Sample artists data with images - using SAYU personality types
  const featuredArtists = [
    {
      name: { en: 'Yayoi Kusama', ko: '쿠사마 야요이' },
      style: { en: 'Contemporary, Installation', ko: '현대미술, 설치미술' },
      image: 'https://images.unsplash.com/photo-1611604548018-d56bbd596747?w=400&h=400&fit=crop',
      personality: ['SREF', 'SREC'] // 이야기 직조가, 마음의 큐레이터
    },
    {
      name: { en: 'Lee Ufan', ko: '이우환' },
      style: { en: 'Minimalism, Mono-ha', ko: '미니멀리즘, 모노하' },
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
      personality: ['LAMC', 'SAMF'] // 패턴 건축가, 마음의 연금술사
    },
    {
      name: { en: 'David Hockney', ko: '데이비드 호크니' },
      style: { en: 'Pop Art, Landscapes', ko: '팝아트, 풍경화' },
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
      personality: ['LREF', 'LREC'] // 침묵의 시인, 질감의 예언자
    },
    {
      name: { en: 'Nam June Paik', ko: '백남준' },
      style: { en: 'Video Art, New Media', ko: '비디오 아트, 뉴미디어' },
      image: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=400&fit=crop',
      personality: ['SAEF', 'SREC'] // 감정 지휘자, 마음의 큐레이터
    }
  ];
  const [timeOfDay, setTimeOfDay] = useState('');
  const [doorsOpen, setDoorsOpen] = useState(false);
  const [currentVisitors, setCurrentVisitors] = useState(1234);
  const [todayDiscoveries, setTodayDiscoveries] = useState(89);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) setTimeOfDay('morning');
    else if (hour >= 12 && hour < 18) setTimeOfDay('afternoon');
    else if (hour >= 18 && hour < 22) setTimeOfDay('evening');
    else setTimeOfDay('night');
  }, []);

  const rooms: Room[] = [
    {
      name: language === 'ko' ? '당신의 유형 발견하기' : 'Discover Your Type',
      icon: '🎭',
      path: '/quiz',
      status: 'available',
      description: language === 'ko' ? '자기 발견의 여정을 시작하세요' : 'Begin your journey of self-discovery'
    },
    {
      name: language === 'ko' ? '갤러리' : 'Gallery',
      icon: '🖼️',
      path: '/explore',
      status: user ? 'available' : 'locked',
      description: language === 'ko' ? '당신의 영혼과 맞는 예술 작품을 탐험하세요' : 'Explore artworks matched to your soul'
    },
    {
      name: language === 'ko' ? '커뮤니티 살롱' : 'Community Salon',
      icon: '👥',
      path: '/community',
      status: user ? 'available' : 'locked',
      description: language === 'ko' ? '비슷한 감성의 사람들과 연결하세요' : 'Connect with kindred spirits'
    },
    {
      name: language === 'ko' ? '나의 컬렉션' : 'Your Collection',
      icon: '📚',
      path: '/profile',
      status: user ? 'available' : 'locked',
      description: language === 'ko' ? '당신만의 예술 성역' : 'Your personal art sanctuary'
    }
  ];

  const handleRoomClick = (room: Room) => {
    if (room.status === 'locked') {
      if (room.path === '/profile' || room.path === '/community' || room.path === '/explore') {
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
      }
      return;
    }
    router.push(room.path);
  };

  return (
    <div className={`home-gallery-entrance sayu-gradient-bg ${timeOfDay}`}>
      {/* Museum Doors Animation */}
      <AnimatePresence>
        {!doorsOpen && (
          <motion.div 
            className="entrance-doors"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <motion.div 
              className="door left"
              initial={{ x: 0 }}
              animate={{ x: doorsOpen ? '-100%' : 0 }}
              transition={{ duration: 1.5, ease: [0.76, 0, 0.24, 1] }}
            />
            <motion.div 
              className="door right"
              initial={{ x: 0 }}
              animate={{ x: doorsOpen ? '100%' : 0 }}
              transition={{ duration: 1.5, ease: [0.76, 0, 0.24, 1] }}
            />
            
            <motion.button
              className="enter-button apple-button pulse-glow-animation"
              onClick={() => setDoorsOpen(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-2xl font-serif">Enter SAYU</span>
              <ChevronRight className="w-6 h-6 ml-2" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Gallery Foyer */}
      <motion.div 
        className="gallery-foyer"
        initial={{ opacity: 0 }}
        animate={{ opacity: doorsOpen ? 1 : 0 }}
        transition={{ delay: 0.5 }}
      >
        {/* Dynamic Lighting Overlay */}
        <div className={`foyer-lighting ${timeOfDay}`} />

        {/* Welcome Header */}
        <motion.header 
          className="foyer-header"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <div className="absolute top-4 right-4 z-50">
            <LanguageToggle />
          </div>
          <h1 className="museum-title">SAYU</h1>
          <p className="museum-tagline">
            {language === 'ko' ? '당신만의 예술 여정이 기다립니다' : 'Your Personal Art Journey Awaits'}
          </p>
        </motion.header>

        {/* Museum Floor Plan */}
        <motion.div 
          className="museum-floor-plan"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          {rooms.map((room, index) => (
            <motion.div
              key={room.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 + index * 0.1 }}
            >
              <motion.div
                className={`sayu-card cursor-pointer ${room.status === 'locked' ? 'opacity-60' : ''}`}
                onClick={() => handleRoomClick(room)}
                whileHover={room.status !== 'locked' ? { scale: 1.02 } : {}}
                whileTap={room.status !== 'locked' ? { scale: 0.98 } : {}}
              >
                <div className="sayu-icon-container mb-4">
                  <span className="text-2xl">{room.icon}</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{room.name}</h3>
                <p className="text-sm opacity-70">{room.description}</p>
                {room.status === 'locked' && (
                  <Lock className="absolute top-6 right-6 opacity-50" size={20} />
                )}
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Visitor Board */}
        <motion.div 
          className="sayu-liquid-glass rounded-2xl p-6 mt-8 max-w-4xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
        >
          <div className="flex flex-wrap justify-center gap-6">
            <motion.div 
              className="visitor-stat flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full"
              whileHover={{ scale: 1.05 }}
            >
              <Users className="w-5 h-5 text-purple-600" />
              <span className="font-medium">{language === 'ko' ? `현재 방문자: ${currentVisitors.toLocaleString()}` : `Current visitors: ${currentVisitors.toLocaleString()}`}</span>
            </motion.div>
            <motion.div 
              className="visitor-stat flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full"
              whileHover={{ scale: 1.05 }}
            >
              <Sparkles className="w-5 h-5 text-pink-600" />
              <span className="font-medium">{language === 'ko' ? `오늘 발견된 유형: ${todayDiscoveries}` : `Types discovered today: ${todayDiscoveries}`}</span>
            </motion.div>
            <motion.div 
              className="visitor-stat flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full"
              whileHover={{ scale: 1.05 }}
            >
              <Clock className="w-5 h-5 text-blue-600" />
              <span className="font-medium">{timeOfDay === 'night' ? 'Night at the Museum' : `${timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1)} hours`}</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Time-based Welcome Message */}
        <motion.div 
          className="time-message"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          {timeOfDay === 'morning' && <p>{language === 'ko' ? '아침 햇살과 함께 갤러리가 깨어납니다...' : 'The gallery awakens with morning light...'}</p>}
          {timeOfDay === 'afternoon' && <p>{language === 'ko' ? '가장 활기찬 시간 - 갤러리가 에너지로 가득합니다' : 'Peak visiting hours - the gallery bustles with energy'}</p>}
          {timeOfDay === 'evening' && <p>{language === 'ko' ? '황금빛 시간이 복도에 따뜻한 그림자를 드리웁니다' : 'Golden hour casts warm shadows through the halls'}</p>}
          {timeOfDay === 'night' && <p>{language === 'ko' ? '특별한 야간 관람 - 작품들이 비밀을 속삭입니다' : 'A rare night visit - the artworks whisper secrets'}</p>}
        </motion.div>

        {/* Artists Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.5 }}
          className="mt-20 text-center"
        >
          <h2 className="text-3xl font-bold mb-8">
            {language === 'ko' ? '당신과 대화하는 작가들' : 'Artists Who Speak Your Language'}
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {featuredArtists.map((artist, index) => (
              <motion.div
                key={artist.name.en}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 2.7 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="sayu-card p-4 cursor-pointer"
              >
                <div className="relative mb-4">
                  <img
                    src={artist.image}
                    alt={artist.name[language]}
                    className="w-full aspect-square object-cover rounded-lg"
                  />
                  <div className="absolute top-2 right-2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                    {artist.personality[0]}
                  </div>
                </div>
                <h3 className="font-bold text-lg mb-1">{artist.name[language]}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{artist.style[language]}</p>
              </motion.div>
            ))}
          </div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3.2 }}
            className="space-y-4"
          >
            <h3 className="text-2xl font-bold mb-6">
              {language === 'ko' ? '당신의 예술 성향을 발견하세요' : 'Discover Your Art Personality'}
            </h3>
            <Link href="/quiz">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="sayu-button sayu-button-primary px-8 py-4 text-lg font-bold"
              >
                {language === 'ko' ? '성향 테스트 시작하기' : 'Start Personality Test'}
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}