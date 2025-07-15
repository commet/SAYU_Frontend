'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { followAPI } from '@/lib/follow-api';
import PersonalArtMap from '@/components/artmap/PersonalArtMap';
import ExhibitionRecord from '@/components/exhibition/ExhibitionRecord';
import BadgeSystem from '@/components/gamification/BadgeSystem';
import { Trophy, MapPin, BookOpen, Settings, LogIn, Palette, Share2, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { personalityDescriptions } from '@/data/personality-descriptions';
import { personalityGradients, getGradientStyle } from '@/constants/personality-gradients';
import ProfileSettingsModal from '@/components/profile/ProfileSettingsModal';
import ProfileStats from '@/components/profile/ProfileStats';
import ProfileShareCard from '@/components/profile/ProfileShareCard';
import ProfileIDCard from '@/components/profile/ProfileIDCard';
import SocialLoginModal from '@/components/SocialLoginModal';
import { useGamificationDashboard } from '@/hooks/useGamification';
import AIArtIdentitySection from '@/components/profile/AIArtIdentitySection';

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
  totalPhotos: 12,
  averageVisitDuration: 87,
  favoriteArtStyle: 'Contemporary Abstract',
  lastVisitDate: '2024-01-15',
  followerCount: 0,
  followingCount: 0
};

export default function ProfilePage() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();
  const { dashboard } = useGamificationDashboard();
  const userPoints = dashboard?.currentPoints || 0;
  const [activeTab, setActiveTab] = useState<'map' | 'records' | 'badges' | 'share'>('map');
  const [redirecting, setRedirecting] = useState(false);
  const [userPersonalityType, setUserPersonalityType] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showIDCard, setShowIDCard] = useState(false);
  const [followStats, setFollowStats] = useState({ followerCount: 0, followingCount: 0 });
  
  // Load quiz results from localStorage
  useEffect(() => {
    const quizResults = localStorage.getItem('quizResults');
    if (quizResults) {
      const results = JSON.parse(quizResults);
      setUserPersonalityType(results.personalityType);
    }
  }, []);

  useEffect(() => {
    if (!user && !redirecting) {
      setShowLoginModal(true);
    }
  }, [user, redirecting]);

  // Load follow stats
  useEffect(() => {
    if (user?.id) {
      loadFollowStats();
    }
  }, [user]);

  const loadFollowStats = async () => {
    try {
      const stats = await followAPI.getFollowStats(user!.id);
      setFollowStats({
        followerCount: stats.followerCount,
        followingCount: stats.followingCount
      });
    } catch (error) {
      console.error('Failed to load follow stats:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center sayu-gradient-bg">
        <motion.div 
          className="text-center sayu-liquid-glass rounded-2xl p-8 max-w-md w-full mx-4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-6"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <LogIn className="w-10 h-10 text-white" />
          </motion.div>
          
          <h2 className="text-2xl font-bold mb-4">
            {language === 'ko' ? '로그인이 필요합니다' : 'Login Required'}
          </h2>
          <p className="opacity-70 mb-6">
            {language === 'ko' 
              ? '프로필을 보려면 로그인해주세요.' 
              : 'Please login to view your profile.'
            }
          </p>
          
          <div className="space-y-3">
            <Button
              onClick={() => router.push('/login')}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {language === 'ko' ? '로그인하기' : 'Go to Login'}
            </Button>
            
            <p className="text-sm opacity-60 mt-4">
              {language === 'ko' 
                ? '잠시 후 자동으로 로그인 페이지로 이동합니다...' 
                : 'Redirecting to login page...'
              }
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen sayu-gradient-bg p-4">
      <div className="max-w-7xl mx-auto">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sayu-liquid-glass rounded-2xl p-6 mb-6"
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
                
                {/* Personality Type Display */}
                {userPersonalityType && personalityDescriptions[userPersonalityType] && (
                  <motion.div 
                    className="mt-3 inline-flex items-center gap-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div 
                      className="px-3 py-1 rounded-full text-sm font-medium"
                      style={{ 
                        background: getGradientStyle(userPersonalityType as keyof typeof personalityGradients),
                        color: 'white',
                        textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                      }}
                    >
                      <span className="flex items-center gap-1">
                        <Palette className="w-4 h-4" />
                        {userPersonalityType}
                      </span>
                    </div>
                    <span className="text-sm opacity-80">
                      {personalityGradients[userPersonalityType as keyof typeof personalityGradients]?.name || personalityDescriptions[userPersonalityType].title}
                    </span>
                  </motion.div>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              <motion.button
                className="sayu-button p-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/profile/art-profile')}
                title={language === 'ko' ? 'AI 아트 프로필' : 'AI Art Profile'}
              >
                <Sparkles className="w-5 h-5" />
              </motion.button>
              <motion.button
                className="sayu-button p-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowIDCard(true)}
                title={language === 'ko' ? 'ID 카드 보기' : 'View ID Card'}
              >
                <Trophy className="w-5 h-5" />
              </motion.button>
              <motion.button
                className="sayu-button p-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSettings(true)}
                title={language === 'ko' ? '설정' : 'Settings'}
              >
                <Settings className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* AI Art Identity Section */}
        <AIArtIdentitySection 
          userId={user.id} 
          personalityType={userPersonalityType} 
        />

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <ProfileStats 
            stats={{
              ...mockUserStats,
              followerCount: followStats.followerCount,
              followingCount: followStats.followingCount
            }} 
            userId={user?.id}
          />
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { id: 'map' as const, icon: MapPin, label: { en: 'Art Map', ko: '아트맵' } },
            { id: 'records' as const, icon: BookOpen, label: { en: 'Records', ko: '기록' } },
            { id: 'badges' as const, icon: Trophy, label: { en: 'Badges', ko: '배지' } },
            { id: 'share' as const, icon: Share2, label: { en: 'Share', ko: '공유' } }
          ].map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-500 text-white'
                  : 'sayu-liquid-glass hover:bg-white/20'
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
          
          {activeTab === 'share' && (
            <ProfileShareCard
              userInfo={{
                nickname: user.nickname,
                email: user.email,
                personalityType: userPersonalityType,
                level: mockUserStats.level,
                totalPoints: mockUserStats.totalPoints,
                totalArtworks: mockUserStats.totalArtworks,
                visitStreak: mockUserStats.visitStreak
              }}
            />
          )}
        </motion.div>
      </div>
      
      {/* Settings Modal */}
      <ProfileSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        userInfo={{
          nickname: user.nickname,
          email: user.email,
          personalityType: userPersonalityType
        }}
        onUpdate={(updates) => {
          // In real app, would update user state here
          console.log('Profile updates:', updates);
        }}
      />

      {/* Profile ID Card Modal */}
      {showIDCard && userPersonalityType && (
        <ProfileIDCard
          personalityType={userPersonalityType}
          userName={user.nickname || user.email || 'SAYU Explorer'}
          userLevel={userPoints?.level || mockUserStats.level}
          userPoints={userPoints?.totalPoints || mockUserStats.totalPoints}
          stats={{
            exhibitionsVisited: userPoints?.exhibitionHistory?.length || mockUserStats.totalVisits,
            achievementsUnlocked: userPoints?.achievements?.filter(a => a.unlockedAt).length || mockBadges.filter(b => b.unlocked).length,
            companionsMetCount: 0 // This would come from evaluation system
          }}
          recentExhibitions={
            userPoints?.exhibitionHistory?.slice(0, 3).map(visit => ({
              name: visit.exhibitionName,
              date: new Date(visit.visitDate).toLocaleDateString()
            })) || mockExhibitionRecords.slice(0, 3).map(record => ({
              name: record.exhibition,
              date: record.visitDate
            }))
          }
          plannedExhibitions={[
            { name: '모네의 정원: 빛과 색의 향연', venue: '국립현대미술관' },
            { name: 'Van Gogh Alive Experience', venue: 'DDP 디자인랩' },
            { name: '디지털 아트 페스티벌', venue: '롯데월드타워' }
          ]}
          topAchievements={
            userPoints?.achievements?.filter(a => a.unlockedAt).slice(0, 3).map(achievement => ({
              name: language === 'ko' ? achievement.name_ko : achievement.name,
              icon: achievement.icon
            })) || mockBadges.filter(b => b.unlocked).slice(0, 3).map(badge => ({
              name: language === 'ko' ? badge.name.ko : badge.name.en,
              icon: '🏆'
            }))
          }
          onClose={() => setShowIDCard(false)}
        />
      )}

      {/* Login Modal for unauthorized users */}
      <SocialLoginModal
        isOpen={showLoginModal}
        onClose={() => {
          setShowLoginModal(false);
          router.push('/');
        }}
        onSuccess={() => {
          setShowLoginModal(false);
          window.location.reload();
        }}
        language={language}
      />
    </div>
  );
}