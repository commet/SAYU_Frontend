'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MapPin, Clock, Users, Sparkles, ChevronRight, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/lib/i18n';
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
  translationKey: string; // 번역 키 추가
}

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { t, language } = useTranslation();
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
      name: t('home.discoverType'),
      icon: '🎭',
      path: '/quiz',
      status: 'available',
      description: t('home.discoverTypeDesc'),
      translationKey: 'home.discoverType'
    },
    {
      name: t('home.gallery'),
      icon: '🖼️',
      path: '/explore',
      status: user ? 'available' : 'locked',
      description: t('home.galleryDesc'),
      translationKey: 'home.gallery'
    },
    {
      name: t('home.communitySalon'),
      icon: '👥',
      path: '/community',
      status: user ? 'available' : 'locked',
      description: t('home.communitySalonDesc'),
      translationKey: 'home.communitySalon'
    },
    {
      name: t('home.yourCollection'),
      icon: '📚',
      path: '/profile',
      status: user ? 'available' : 'locked',
      description: t('home.yourCollectionDesc'),
      translationKey: 'home.yourCollection'
    }
  ];

  const handleRoomClick = (room: Room) => {
    if (room.status === 'locked') {
      if (room.path === '/profile' || room.path === '/community' || room.path === '/explore') {
        toast(t('auth.loginRequired'), {
          icon: '🔒',
          style: {
            background: 'rgba(147, 51, 234, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(147, 51, 234, 0.2)',
            color: '#fff',
          },
        });
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
              className="enter-button-modern"
              onClick={() => setDoorsOpen(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <div className="enter-button-content">
                <span className="enter-button-text">
                  {t('common.enterSAYU')}
                </span>
                <motion.div 
                  className="enter-button-icon"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ChevronRight className="w-5 h-5" />
                </motion.div>
              </div>
              <div className="enter-button-glow" />
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
            {t('home.yourJourneyAwaits')}
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
              onClick={() => handleRoomClick(room)}
              className={`room-card ${room.status}`}
            >
              <Card className="museum-room-card">
                <div className="room-icon">{room.icon}</div>
                <h3 className="room-name">{room.name}</h3>
                <p className="room-description">{room.description}</p>
                {room.status === 'locked' && (
                  <Lock className="lock-icon" />
                )}
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}