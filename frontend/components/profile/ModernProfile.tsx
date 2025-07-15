'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  User,
  Palette,
  Heart,
  Share2,
  Settings,
  Camera,
  Award,
  Calendar,
  TrendingUp,
  Grid3X3,
  BarChart3,
  Edit3,
  LogOut
} from 'lucide-react';
import Image from 'next/image';
import { ModernButton } from '@/components/ui/modern-button';
import { ModernCard } from '@/components/ui/modern-card';
import ModernGalleryGrid from '@/components/gallery/ModernGalleryGrid';

interface ProfileStats {
  artworksViewed: number;
  artworksLiked: number;
  followersCount: number;
  followingCount: number;
  quizzesTaken: number;
  personalityType: string;
}

interface ProfileTab {
  id: string;
  label: { ko: string; en: string };
  icon: React.ReactNode;
  count?: number;
}

export default function ModernProfile() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState('collection');
  const [isEditing, setIsEditing] = useState(false);

  // Mock data - replace with real API data
  const stats: ProfileStats = {
    artworksViewed: 234,
    artworksLiked: 89,
    followersCount: 156,
    followingCount: 243,
    quizzesTaken: 5,
    personalityType: 'SREF'
  };

  const profileTabs: ProfileTab[] = [
    {
      id: 'collection',
      label: { ko: '컬렉션', en: 'Collection' },
      icon: <Grid3X3 className="w-4 h-4" />,
      count: 89
    },
    {
      id: 'insights',
      label: { ko: '인사이트', en: 'Insights' },
      icon: <BarChart3 className="w-4 h-4" />
    },
    {
      id: 'achievements',
      label: { ko: '업적', en: 'Achievements' },
      icon: <Award className="w-4 h-4" />,
      count: 12
    },
    {
      id: 'activity',
      label: { ko: '활동', en: 'Activity' },
      icon: <Calendar className="w-4 h-4" />
    }
  ];

  const personalityTypeInfo = {
    SREF: {
      name: { ko: '이야기 직조가', en: 'Story Weaver' },
      description: { ko: '감정과 서사를 통해 예술을 경험하는 타입', en: 'Experiences art through emotion and narrative' },
      color: 'from-sayu-lavender to-sayu-powder-blue'
    }
  };

  const typeInfo = personalityTypeInfo[stats.personalityType as keyof typeof personalityTypeInfo];

  return (
    <div className="min-h-screen bg-gradient-to-b from-sayu-bg-primary to-sayu-bg-secondary">
      {/* Profile Header */}
      <div className="relative">
        {/* Cover Image with Gradient */}
        <div className="h-64 md:h-80 relative overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-br ${typeInfo.color} opacity-80`} />
          <div className="absolute inset-0 bg-black/20" />
          
          {/* Pattern Overlay */}
          <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
            <pattern id="profilePattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="1" fill="white" />
            </pattern>
            <rect width="100" height="100" fill="url(#profilePattern)" />
          </svg>
        </div>

        {/* Profile Info */}
        <div className="sayu-container">
          <div className="relative -mt-20 md:-mt-24">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
              {/* Avatar */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative group"
              >
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden bg-white p-1 shadow-xl">
                  {user?.profileImage ? (
                    <Image
                      src={user.profileImage}
                      alt={user.name || 'Profile'}
                      width={160}
                      height={160}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-sayu-lavender to-sayu-sage flex items-center justify-center">
                      <User className="w-12 h-12 text-white" />
                    </div>
                  )}
                </div>
                
                {/* Edit Avatar Button */}
                <button className="absolute bottom-2 right-2 p-2 bg-sayu-mocha text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-4 h-4" />
                </button>
              </motion.div>

              {/* User Info */}
              <div className="flex-1 pb-6">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold text-sayu-text-primary mb-2">
                        {user?.name || 'Anonymous Artist'}
                      </h1>
                      <p className="text-sayu-text-secondary">
                        @{user?.username || 'anonymous'}
                      </p>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <ModernButton
                        variant="secondary"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                        iconLeft={<Edit3 className="w-4 h-4" />}
                      >
                        {language === 'ko' ? '편집' : 'Edit'}
                      </ModernButton>
                      <ModernButton
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push('/settings')}
                      >
                        <Settings className="w-4 h-4" />
                      </ModernButton>
                    </div>
                  </div>

                  {/* Personality Type Badge */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm mb-4">
                    <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${typeInfo.color}`} />
                    <span className="text-sm font-medium text-sayu-text-primary">
                      {typeInfo.name[language]}
                    </span>
                  </div>

                  {/* Bio */}
                  {user?.bio && (
                    <p className="text-sayu-text-secondary max-w-2xl">
                      {user.bio}
                    </p>
                  )}
                </motion.div>
              </div>
            </div>

            {/* Stats */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8"
            >
              {[
                { label: language === 'ko' ? '감상한 작품' : 'Artworks Viewed', value: stats.artworksViewed, icon: <Palette className="w-4 h-4" /> },
                { label: language === 'ko' ? '좋아요' : 'Liked', value: stats.artworksLiked, icon: <Heart className="w-4 h-4" /> },
                { label: language === 'ko' ? '팔로워' : 'Followers', value: stats.followersCount, icon: <User className="w-4 h-4" /> },
                { label: language === 'ko' ? '팔로잉' : 'Following', value: stats.followingCount, icon: <TrendingUp className="w-4 h-4" /> }
              ].map((stat, index) => (
                <ModernCard key={stat.label} className="p-4 text-center">
                  <div className="flex justify-center mb-2 text-sayu-mocha">
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-bold text-sayu-text-primary">
                    {stat.value.toLocaleString()}
                  </div>
                  <div className="text-sm text-sayu-text-muted">{stat.label}</div>
                </ModernCard>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-0 z-20 bg-sayu-bg-primary/80 backdrop-blur-md border-b border-sayu-warm-gray/20 mt-8">
        <div className="sayu-container">
          <div className="flex gap-8 overflow-x-auto scrollbar-hide">
            {profileTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  relative flex items-center gap-2 py-4 text-sm font-medium transition-colors whitespace-nowrap
                  ${activeTab === tab.id 
                    ? 'text-sayu-mocha' 
                    : 'text-sayu-text-muted hover:text-sayu-text-primary'
                  }
                `}
              >
                {tab.icon}
                <span>{tab.label[language]}</span>
                {tab.count && (
                  <span className="ml-1 text-xs text-sayu-text-muted">
                    ({tab.count})
                  </span>
                )}
                
                {/* Active Indicator */}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-sayu-mocha"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="sayu-container py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'collection' && (
            <motion.div
              key="collection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ModernGalleryGrid
                artworks={[
                  // Mock data - replace with real liked artworks
                  {
                    id: '1',
                    title: 'Starry Night',
                    artist: 'Vincent van Gogh',
                    year: '1889',
                    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/800px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg',
                    tags: ['Post-Impressionism', 'Night', 'Landscape'],
                    likes: 1234,
                    isLiked: true
                  },
                  // Add more artworks...
                ]}
              />
            </motion.div>
          )}

          {activeTab === 'insights' && (
            <motion.div
              key="insights"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              <h2 className="text-2xl font-bold text-sayu-text-primary mb-6">
                {language === 'ko' ? '당신의 예술 취향 분석' : 'Your Art Preference Analysis'}
              </h2>
              
              {/* Preference Chart */}
              <ModernCard className="p-6 mb-6">
                <h3 className="font-semibold text-sayu-text-primary mb-4">
                  {language === 'ko' ? '선호 스타일' : 'Preferred Styles'}
                </h3>
                <div className="space-y-3">
                  {[
                    { style: 'Impressionism', percentage: 78 },
                    { style: 'Abstract', percentage: 65 },
                    { style: 'Contemporary', percentage: 54 },
                    { style: 'Classical', percentage: 32 }
                  ].map((item) => (
                    <div key={item.style}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-sayu-text-secondary">{item.style}</span>
                        <span className="text-sm font-medium text-sayu-text-primary">{item.percentage}%</span>
                      </div>
                      <div className="h-2 bg-sayu-bg-tertiary rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-sayu-lavender to-sayu-sage"
                          initial={{ width: 0 }}
                          animate={{ width: `${item.percentage}%` }}
                          transition={{ duration: 1, delay: 0.1 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </ModernCard>

              {/* Viewing Patterns */}
              <ModernCard className="p-6">
                <h3 className="font-semibold text-sayu-text-primary mb-4">
                  {language === 'ko' ? '감상 패턴' : 'Viewing Patterns'}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-sayu-bg-tertiary rounded-lg">
                    <div className="text-2xl font-bold text-sayu-mocha mb-1">3.5분</div>
                    <div className="text-sm text-sayu-text-muted">
                      {language === 'ko' ? '평균 감상 시간' : 'Avg. Viewing Time'}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-sayu-bg-tertiary rounded-lg">
                    <div className="text-2xl font-bold text-sayu-mocha mb-1">16:00</div>
                    <div className="text-sm text-sayu-text-muted">
                      {language === 'ko' ? '주요 활동 시간' : 'Peak Activity Time'}
                    </div>
                  </div>
                </div>
              </ModernCard>
            </motion.div>
          )}

          {activeTab === 'achievements' && (
            <motion.div
              key="achievements"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            >
              {[
                { icon: '🎨', title: 'Art Explorer', description: 'Viewed 100+ artworks' },
                { icon: '❤️', title: 'Curator', description: 'Liked 50+ artworks' },
                { icon: '🎭', title: 'Personality Master', description: 'Completed all quizzes' },
                { icon: '🌟', title: 'Trendsetter', description: 'First 100 users' }
              ].map((achievement, index) => (
                <motion.div
                  key={achievement.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ModernCard className="p-6 text-center hover:shadow-lg transition-shadow">
                    <div className="text-4xl mb-3">{achievement.icon}</div>
                    <h4 className="font-semibold text-sayu-text-primary mb-1">
                      {achievement.title}
                    </h4>
                    <p className="text-xs text-sayu-text-muted">
                      {achievement.description}
                    </p>
                  </ModernCard>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}