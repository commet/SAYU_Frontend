'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MapPin, Clock, Users, Sparkles, ChevronRight, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageToggle from '@/components/ui/LanguageToggle';
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
      // Show message to complete quiz first
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
          {timeOfDay === 'morning' && <p>The gallery awakens with morning light...</p>}
          {timeOfDay === 'afternoon' && <p>Peak visiting hours - the gallery bustles with energy</p>}
          {timeOfDay === 'evening' && <p>Golden hour casts warm shadows through the halls</p>}
          {timeOfDay === 'night' && <p>A rare night visit - the artworks whisper secrets</p>}
        </motion.div>
      </motion.div>
    </div>
  );
}