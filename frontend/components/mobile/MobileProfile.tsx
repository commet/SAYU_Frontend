'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { 
  Trophy, MapPin, BookOpen, Settings, LogIn, Palette, Share2, Sparkles, 
  User, Heart, Eye, Camera, Calendar, Clock, TrendingUp, Award, ChevronRight,
  Grid, List, MoreVertical, Edit, LogOut, Plus
} from 'lucide-react';
import { personalityDescriptions } from '@/data/personality-descriptions';
import { personalityGradients, getGradientStyle } from '@/constants/personality-gradients';
import FeedbackButton from '@/components/feedback/FeedbackButton';
import ExhibitionArchiveForm from '@/components/exhibition/ExhibitionArchiveForm';
import { profileApi } from '@/lib/profile-api';
import Image from 'next/image';
import { JourneySection } from '@/components/profile/JourneySection';

// Mock data
const mockMuseums = [
  {
    id: '1',
    name: '국립현대미술관',
    location: { lat: 37.5789, lng: 126.9770 },
    visitCount: 5,
    lastVisit: '2024-01-15',
    favorite: true,
    type: 'visited' as const
  },
  {
    id: '2',
    name: '리움미술관',
    location: { lat: 37.5385, lng: 127.0050 },
    visitCount: 3,
    lastVisit: '2024-01-10',
    type: 'visited' as const
  },
  {
    id: '3',
    name: '서울시립미술관',
    location: { lat: 37.5640, lng: 126.9750 },
    visitCount: 0,
    type: 'wishlist' as const
  }
];

const mockVisits = [
  {
    id: '1',
    exhibitionTitle: '론 뮤익',
    museum: '국립현대미술관 서울',
    visitDate: '2025-04-20',
    duration: 120,
    rating: 5,
    photos: 2,
    notes: '거대한 조각 앞에서 압도감을 느꼈다.',
    artworks: 3,
    points: 150
  },
  {
    id: '2',
    exhibitionTitle: '한국현대미술 하이라이트',
    museum: '국립현대미술관 서울',
    visitDate: '2025-05-10',
    duration: 90,
    rating: 4,
    photos: 1,
    artworks: 2,
    points: 100
  }
];

const mockBadges = [
  {
    id: 'first-visit',
    name: '첫 발걸음',
    description: '첫 미술관 방문',
    icon: '🎯',
    color: 'green',
    unlocked: true,
    rarity: 'common',
    unlockedAt: '2024-01-10'
  },
  {
    id: 'art-lover',
    name: '예술 애호가',
    description: '10개 작품 좋아요',
    icon: '❤️',
    color: 'purple',
    unlocked: true,
    progress: 10,
    maxProgress: 10,
    rarity: 'rare',
    unlockedAt: '2024-01-15'
  },
  {
    id: 'explorer',
    name: '탐험가',
    description: '5개 미술관 방문',
    icon: '🗺️',
    color: 'blue',
    unlocked: false,
    progress: 2,
    maxProgress: 5,
    rarity: 'epic'
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
  favoriteArtStyle: '현대 추상',
  followerCount: 12,
  followingCount: 8
};

export default function MobileProfile() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'journey' | 'badges'>('overview');
  const [userPersonalityType, setUserPersonalityType] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showArchiveForm, setShowArchiveForm] = useState(false);
  const [artProfile, setArtProfile] = useState<any>({
    imageUrl: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=400&h=400&fit=crop',
    style: 'Digital Art Portrait'
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  // Load quiz results from localStorage
  useEffect(() => {
    const quizResults = localStorage.getItem('quizResults');
    if (quizResults) {
      const results = JSON.parse(quizResults);
      setUserPersonalityType(results.personalityType);
    }
  }, []);

  // Handle profile picture upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하여야 합니다.');
      return;
    }

    setUploadingImage(true);

    try {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      
      // Update profile image immediately with preview
      setArtProfile(prev => ({
        ...prev,
        imageUrl: previewUrl
      }));

      // Here you would normally upload to your backend
      // For now, we'll just use the preview URL
      // const formData = new FormData();
      // formData.append('image', file);
      // const response = await fetch('/api/upload-profile-image', {
      //   method: 'POST',
      //   body: formData
      // });
      // const data = await response.json();
      // setArtProfile(prev => ({ ...prev, imageUrl: data.imageUrl }));

      console.log('Profile picture uploaded:', file.name);
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('이미지 업로드에 실패했습니다.');
    } finally {
      setUploadingImage(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-pink-900 to-orange-900 px-4">
        <motion.div 
          className="text-center bg-white/10 backdrop-blur-md rounded-2xl p-6 max-w-sm w-full"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          
          <h2 className="text-xl font-bold text-white mb-2">
            {language === 'ko' ? '로그인이 필요합니다' : 'Login Required'}
          </h2>
          <p className="text-sm text-gray-300 mb-4">
            {language === 'ko' 
              ? '프로필을 보려면 로그인해주세요.' 
              : 'Please login to view your profile.'
            }
          </p>
          
          <button
            onClick={() => router.push('/login')}
            className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-medium"
          >
            {language === 'ko' ? '로그인하기' : 'Go to Login'}
          </button>
        </motion.div>
      </div>
    );
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-gray-500 to-gray-600';
      case 'rare': return 'from-blue-500 to-purple-500';
      case 'epic': return 'from-purple-500 to-pink-500';
      case 'legendary': return 'from-yellow-500 to-orange-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-br from-purple-900 via-pink-900 to-orange-900">
      {/* Profile Header */}
      <div className="relative">
        {/* Cover Image - 높이 축소 */}
        <div className="h-20 bg-gradient-to-br from-purple-600 to-pink-600 relative">
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Profile Info - 더 위로 올림 */}
        <div className="px-4 -mt-10">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
            <div className="flex items-start gap-3">
              {/* Profile Image */}
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 overflow-hidden border-4 border-white/20">
                  {artProfile?.imageUrl ? (
                    <Image
                      src={artProfile.imageUrl}
                      alt="Profile"
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                      {user.nickname?.[0] || user.email?.[0] || 'U'}
                    </div>
                  )}
                </div>
                
                {/* Profile Picture Upload Button */}
                <div className="absolute -bottom-1 -right-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="profile-upload"
                  />
                  <label
                    htmlFor="profile-upload"
                    className="flex items-center justify-center w-6 h-6 rounded-full bg-white text-gray-700 shadow-lg cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    {uploadingImage ? (
                      <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Camera className="w-3 h-3" />
                    )}
                  </label>
                </div>
                
                {artProfile && (
                  <motion.div 
                    className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                  >
                    <Sparkles className="w-3 h-3 text-white" />
                  </motion.div>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1">
                <h1 className="text-lg font-bold text-white">{user.nickname || user.email}</h1>
                
                {/* Personality Type Badge */}
                {userPersonalityType && (
                  <div className="mt-1">
                    <span 
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold text-white"
                      style={{ 
                        background: getGradientStyle(userPersonalityType as keyof typeof personalityGradients)
                      }}
                    >
                      <Palette className="w-3 h-3" />
                      {userPersonalityType}
                    </span>
                  </div>
                )}

                {/* Level & Points */}
                <div className="mt-2">
                  <div className="flex items-center gap-3 text-xs text-gray-300">
                    <span>Lv.{mockUserStats.level}</span>
                    <span>•</span>
                    <span>{mockUserStats.totalPoints}P</span>
                  </div>
                  <p className="text-xs text-purple-300 mt-1 opacity-90">
                    {language === 'ko' 
                      ? '🎁 포인트로 전시 할인 혜택 등 준비중' 
                      : '🎁 Exhibition discounts coming soon'}
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/10">
              <button className="text-center">
                <p className="text-lg font-bold text-white">{mockUserStats.followerCount}</p>
                <p className="text-xs text-gray-300">팔로워</p>
              </button>
              <button className="text-center">
                <p className="text-lg font-bold text-white">{mockUserStats.followingCount}</p>
                <p className="text-xs text-gray-300">팔로잉</p>
              </button>
              <button className="text-center">
                <p className="text-lg font-bold text-white">{mockUserStats.totalVisits}</p>
                <p className="text-xs text-gray-300">방문</p>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-2 mt-4">
              <button
                onClick={() => router.push('/profile/art-profile')}
                className="py-2 bg-purple-500/30 rounded-lg text-white text-xs font-medium flex items-center justify-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                AI 프로필
              </button>
              <button
                onClick={() => router.push('/quiz')}
                className="py-2 bg-pink-500/30 rounded-lg text-white text-xs font-medium flex items-center justify-center gap-1"
              >
                <Trophy className="w-3.5 h-3.5" />
                재검사
              </button>
              <button
                onClick={() => {/* Share logic */}}
                className="py-2 bg-blue-500/30 rounded-lg text-white text-xs font-medium flex items-center justify-center gap-1"
              >
                <Share2 className="w-3.5 h-3.5" />
                공유
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="px-4 mt-4">
        <div className="bg-black/20 backdrop-blur-sm rounded-lg p-1 flex">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'overview' 
                ? 'bg-white/20 text-white' 
                : 'text-gray-300'
            }`}
          >
            개요
          </button>
          <button
            onClick={() => setActiveTab('journey')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'journey' 
                ? 'bg-white/20 text-white' 
                : 'text-gray-300'
            }`}
          >
            여정
          </button>
          <button
            onClick={() => setActiveTab('badges')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'badges' 
                ? 'bg-white/20 text-white' 
                : 'text-gray-300'
            }`}
          >
            배지
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4 mt-4">
        <AnimatePresence mode="wait">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              {/* Activity Stats */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <h3 className="text-sm font-semibold text-white mb-3">활동 통계</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-black/20 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <Eye className="w-4 h-4 text-purple-400" />
                      <span className="text-lg font-bold text-white">{mockUserStats.totalArtworks}</span>
                    </div>
                    <p className="text-xs text-gray-300 mt-1">감상한 작품</p>
                  </div>
                  <div className="bg-black/20 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <Camera className="w-4 h-4 text-pink-400" />
                      <span className="text-lg font-bold text-white">{mockUserStats.totalPhotos}</span>
                    </div>
                    <p className="text-xs text-gray-300 mt-1">촬영한 사진</p>
                  </div>
                  <div className="bg-black/20 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <Calendar className="w-4 h-4 text-blue-400" />
                      <span className="text-lg font-bold text-white">{mockUserStats.visitStreak}</span>
                    </div>
                    <p className="text-xs text-gray-300 mt-1">연속 방문</p>
                  </div>
                  <div className="bg-black/20 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      <span className="text-lg font-bold text-white">{mockUserStats.level}</span>
                    </div>
                    <p className="text-xs text-gray-300 mt-1">현재 레벨</p>
                  </div>
                </div>
              </div>

              {/* Recent Museums */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-white">최근 방문</h3>
                  <button className="text-xs text-purple-300">전체보기</button>
                </div>
                <div className="space-y-2">
                  {mockMuseums.filter(m => m.type === 'visited').slice(0, 3).map((museum) => (
                    <button
                      key={museum.id}
                      className="w-full flex items-center justify-between p-2 bg-black/20 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <div className="text-left">
                          <p className="text-sm text-white">{museum.name}</p>
                          <p className="text-xs text-gray-400">{museum.visitCount}회 방문</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Favorite Art Style */}
              <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-md rounded-xl p-4 border border-purple-500/30">
                <h3 className="text-sm font-semibold text-white mb-2">선호 예술 스타일</h3>
                <p className="text-lg font-bold text-white">{mockUserStats.favoriteArtStyle}</p>
                <p className="text-xs text-gray-300 mt-1">
                  당신의 성향과 가장 잘 맞는 스타일입니다
                </p>
              </div>
            </motion.div>
          )}

          {/* Journey Tab */}
          {activeTab === 'journey' && (
            <motion.div
              key="journey"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              {/* Header with Add Button */}
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">전시 기록</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowArchiveForm(true)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white text-xs font-medium"
                  >
                    <Plus className="w-3 h-3" />
                    기록
                  </button>
                  <div className="flex gap-1 bg-black/20 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white/20' : ''}`}
                    >
                      <Grid className="w-4 h-4 text-white" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white/20' : ''}`}
                    >
                      <List className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Exhibition Records */}
              {viewMode === 'list' ? (
                <div className="space-y-3">
                  {mockVisits.map((visit) => (
                    <motion.div
                      key={visit.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="text-sm font-semibold text-white">{visit.exhibitionTitle}</h4>
                          <p className="text-xs text-gray-300">{visit.museum}</p>
                        </div>
                        <button className="p-1">
                          <MoreVertical className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {visit.visitDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {visit.duration}분
                        </span>
                        <span className="flex items-center gap-1">
                          <Camera className="w-3 h-3" />
                          {visit.photos}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < visit.rating ? 'text-yellow-400' : 'text-gray-600'}>
                            ★
                          </span>
                        ))}
                      </div>
                      {visit.notes && (
                        <p className="text-xs text-gray-300 mt-2 italic">"{visit.notes}"</p>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {mockVisits.map((visit) => (
                    <motion.div
                      key={visit.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white/10 backdrop-blur-md rounded-xl overflow-hidden border border-white/20"
                    >
                      <div className="aspect-square bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center">
                        <MapPin className="w-8 h-8 text-white/50" />
                      </div>
                      <div className="p-3">
                        <h4 className="text-xs font-semibold text-white line-clamp-1">{visit.exhibitionTitle}</h4>
                        <p className="text-xs text-gray-400 mt-1">{visit.visitDate}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={`text-xs ${i < visit.rating ? 'text-yellow-400' : 'text-gray-600'}`}>
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Badges Tab */}
          {activeTab === 'badges' && (
            <motion.div
              key="badges"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              {/* Badge Stats */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-white">배지 컬렉션</h3>
                  <span className="text-xs text-purple-300">
                    {mockBadges.filter(b => b.unlocked).length}/{mockBadges.length} 획득
                  </span>
                </div>
                
                {/* Badge Grid */}
                <div className="grid grid-cols-3 gap-3">
                  {mockBadges.map((badge) => (
                    <motion.button
                      key={badge.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`relative aspect-square rounded-xl flex flex-col items-center justify-center p-2 ${
                        badge.unlocked 
                          ? `bg-gradient-to-br ${getRarityColor(badge.rarity)} opacity-100` 
                          : 'bg-gray-800/50 opacity-50'
                      }`}
                    >
                      <span className="text-2xl mb-1">{badge.icon}</span>
                      <p className="text-xs text-white font-medium text-center line-clamp-1">{badge.name}</p>
                      {!badge.unlocked && badge.progress !== undefined && (
                        <div className="absolute bottom-1 left-1 right-1">
                          <div className="h-1 bg-black/30 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-white/50"
                              style={{ width: `${(badge.progress / badge.maxProgress!) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Recent Achievement */}
              <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-md rounded-xl p-4 border border-yellow-500/30">
                <div className="flex items-center gap-3">
                  <Award className="w-8 h-8 text-yellow-400" />
                  <div>
                    <h4 className="text-sm font-semibold text-white">최근 획득</h4>
                    <p className="text-xs text-gray-300">예술 애호가 - 10개 작품 좋아요</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Journey/Onboarding Section - 화면 하단 */}
      <div className="mt-6 px-4 pb-20">
        <JourneySection />
      </div>

      {/* Exhibition Archive Form Modal */}
      <ExhibitionArchiveForm
        isOpen={showArchiveForm}
        onClose={() => setShowArchiveForm(false)}
        onSave={async (data) => {
          try {
            // Convert data to match API interface
            const exhibitionData = {
              exhibitionId: Date.now().toString(),
              exhibitionTitle: data.exhibitionTitle,
              museum: data.museum,
              visitDate: data.visitDate,
              duration: data.duration,
              rating: data.rating,
              notes: data.notes,
              artworks: data.artworks,
              points: Math.floor(data.duration / 10) + (data.rating * 20),
              badges: [],
              photos: data.photos > 0 ? [`photo_${Date.now()}_${Math.random()}`] : []
            };

            console.log('Saving exhibition record (mobile):', exhibitionData);
            
            // Save to backend
            await profileApi.createExhibitionVisit(exhibitionData);
            
            console.log('Exhibition record saved successfully!');
            setShowArchiveForm(false);
          } catch (error) {
            console.error('Failed to save exhibition record:', error);
            alert(language === 'ko' ? '저장에 실패했습니다. 다시 시도해주세요.' : 'Failed to save. Please try again.');
          }
        }}
      />

      {/* Feedback Button */}
      <FeedbackButton
        position="fixed"
        variant="primary"
        contextData={{
          page: 'mobile-profile',
          activeTab
        }}
      />
    </div>
  );
}
