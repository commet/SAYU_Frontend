'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MapPin, Clock, Users, Sparkles, ChevronRight, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
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
      name: 'Discover Your Type',
      icon: '🎭',
      path: '/quiz',
      status: 'available',
      description: 'Begin your journey of self-discovery'
    },
    {
      name: 'Gallery',
      icon: '🖼️',
      path: '/explore',
      status: user ? 'available' : 'locked',
      description: 'Explore artworks matched to your soul'
    },
    {
      name: 'Community Salon',
      icon: '👥',
      path: '/community',
      status: user ? 'available' : 'locked',
      description: 'Connect with kindred spirits'
    },
    {
      name: 'Your Collection',
      icon: '📚',
      path: '/profile',
      status: user ? 'available' : 'locked',
      description: 'Your personal art sanctuary'
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
    <div className={`home-gallery-entrance ${timeOfDay}`}>
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
              className="enter-button"
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
          <h1 className="museum-title">SAYU</h1>
          <p className="museum-tagline">Your Personal Art Journey Awaits</p>
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
              <Card 
                className={`room-card ${room.status === 'locked' ? 'locked' : ''}`}
                onClick={() => handleRoomClick(room)}
              >
                <div className="room-icon">{room.icon}</div>
                <h3 className="room-name">{room.name}</h3>
                <p className="room-description">{room.description}</p>
                {room.status === 'locked' && (
                  <Lock className="lock-icon" size={20} />
                )}
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Visitor Board */}
        <motion.div 
          className="visitor-board"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
        >
          <div className="visitor-stat">
            <Users className="w-5 h-5" />
            <span>Current visitors: {currentVisitors.toLocaleString()}</span>
          </div>
          <div className="visitor-stat">
            <Sparkles className="w-5 h-5" />
            <span>Types discovered today: {todayDiscoveries}</span>
          </div>
          <div className="visitor-stat">
            <Clock className="w-5 h-5" />
            <span>{timeOfDay === 'night' ? 'Night at the Museum' : `${timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1)} hours`}</span>
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