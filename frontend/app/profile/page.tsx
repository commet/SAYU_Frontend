'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import PersonalArtMap from '@/components/artmap/PersonalArtMap';
import ExhibitionRecord from '@/components/exhibition/ExhibitionRecord';
import BadgeSystem from '@/components/gamification/BadgeSystem';
import { Trophy, MapPin, BookOpen, Settings } from 'lucide-react';

// Mock data - in real app, would fetch from API
const mockMuseums = [
  {
    id: '1',
    name: 'National Museum of Modern and Contemporary Art',
    location: { lat: 37.5789, lng: 126.9770 },
    visitCount: 5,
    lastVisit: '2024-01-15',
    favorite: true,
    type: 'visited' as const
  },
  {
    id: '2',
    name: 'Leeum Samsung Museum',
    location: { lat: 37.5385, lng: 127.0050 },
    visitCount: 3,
    lastVisit: '2024-01-10',
    type: 'visited' as const
  },
  {
    id: '3',
    name: 'Seoul Museum of Art',
    location: { lat: 37.5640, lng: 126.9750 },
    visitCount: 0,
    type: 'wishlist' as const
  },
  {
    id: '4',
    name: 'Arario Museum',
    location: { lat: 37.5720, lng: 126.9870 },
    visitCount: 0,
    type: 'nearby' as const
  }
];

const mockVisits = [
  {
    id: '1',
    exhibitionId: 'ex1',
    exhibitionTitle: 'MMCA Hyundai Motor Series 2023',
    museum: 'National Museum of Modern and Contemporary Art',
    visitDate: '2024-01-15',
    duration: 120,
    rating: 5,
    photos: ['photo1', 'photo2'],
    notes: 'Amazing exhibition with immersive installations',
    artworks: [
      { id: 'a1', title: 'Infinite Space', artist: 'Kim Soun-Gui', liked: true },
      { id: 'a2', title: 'Time Flows', artist: 'Lee Bul', liked: true },
      { id: 'a3', title: 'Memory Palace', artist: 'Yang Haegue', liked: false }
    ],
    badges: ['First Visit', 'Art Lover'],
    points: 150
  },
  {
    id: '2',
    exhibitionId: 'ex2',
    exhibitionTitle: 'The Future of Art',
    museum: 'Leeum Samsung Museum',
    visitDate: '2024-01-10',
    duration: 90,
    rating: 4,
    artworks: [
      { id: 'a4', title: 'Digital Dreams', artist: 'Nam June Paik', liked: true }
    ],
    points: 100
  }
];

const mockBadges = [
  {
    id: 'first-visit',
    name: { en: 'First Steps', ko: '첫 발걸음' },
    description: { en: 'Complete your first museum visit', ko: '첫 미술관 방문을 완료하세요' },
    icon: <MapPin className="w-6 h-6" />,
    color: 'green',
    unlocked: true,
    rarity: 'common' as const,
    unlockedAt: '2024-01-10'
  },
  {
    id: 'art-lover',
    name: { en: 'Art Lover', ko: '예술 애호가' },
    description: { en: 'Like 10 artworks', ko: '10개의 작품에 좋아요를 누르세요' },
    icon: <Trophy className="w-6 h-6" />,
    color: 'purple',
    unlocked: true,
    progress: 10,
    maxProgress: 10,
    rarity: 'rare' as const,
    unlockedAt: '2024-01-15'
  },
  {
    id: 'explorer',
    name: { en: 'Explorer', ko: '탐험가' },
    description: { en: 'Visit 5 different museums', ko: '5개의 다른 미술관을 방문하세요' },
    icon: <MapPin className="w-6 h-6" />,
    color: 'blue',
    unlocked: false,
    progress: 2,
    maxProgress: 5,
    rarity: 'epic' as const
  }
];

const mockUserStats = {
  level: 3,
  currentExp: 450,
  nextLevelExp: 1000,
  totalPoints: 2450,
  visitStreak: 5,
  totalVisits: 8,
  totalArtworks: 25,
  totalPhotos: 12
};

export default function ProfilePage() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'map' | 'records' | 'badges'>('map');

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">
            {language === 'ko' ? '로그인이 필요합니다' : 'Login Required'}
          </h2>
          <p className="opacity-70">
            {language === 'ko' 
              ? '프로필을 보려면 로그인해주세요.' 
              : 'Please login to view your profile.'
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="liquid-glass rounded-2xl p-6 mb-6"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold">
                {user.nickname?.[0] || user.email?.[0] || 'U'}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{user.nickname || user.email}</h1>
                <p className="text-sm opacity-70">
                  {language === 'ko' ? '레벨' : 'Level'} {mockUserStats.level} • {mockUserStats.totalPoints.toLocaleString()} {language === 'ko' ? '포인트' : 'points'}
                </p>
              </div>
            </div>
            
            <motion.button
              className="apple-button p-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Settings className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'map' as const, icon: MapPin, label: { en: 'Art Map', ko: '아트맵' } },
            { id: 'records' as const, icon: BookOpen, label: { en: 'Records', ko: '기록' } },
            { id: 'badges' as const, icon: Trophy, label: { en: 'Badges', ko: '배지' } }
          ].map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-500 text-white'
                  : 'glass hover:bg-white/20'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label[language]}
            </motion.button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'map' && (
            <PersonalArtMap
              museums={mockMuseums}
              userLocation={{ lat: 37.5665, lng: 126.9780 }}
              onMuseumClick={(museum) => console.log('Museum clicked:', museum)}
            />
          )}

          {activeTab === 'records' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  {language === 'ko' ? '전시 기록' : 'Exhibition Records'}
                </h2>
                <span className="text-sm opacity-70">
                  {mockVisits.length} {language === 'ko' ? '개의 기록' : 'records'}
                </span>
              </div>
              
              {mockVisits.map((visit) => (
                <ExhibitionRecord
                  key={visit.id}
                  visit={visit}
                  onEdit={() => console.log('Edit visit:', visit.id)}
                  onShare={() => console.log('Share visit:', visit.id)}
                />
              ))}
            </div>
          )}

          {activeTab === 'badges' && (
            <BadgeSystem
              badges={mockBadges}
              userStats={mockUserStats}
              onBadgeClick={(badge) => console.log('Badge clicked:', badge)}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}