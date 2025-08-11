'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, MessageSquare, Sparkles, Heart, Palette, Eye, Calendar, 
  MapPin, ChevronRight, Info, MoreVertical, Flag, Ban, Filter, X,
  UserPlus, Clock, TrendingUp, Shield, Settings, Search
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { personalityDescriptions } from '@/data/personality-descriptions';
import { getAnimalByType } from '@/data/personality-animals';
import { PersonalityAnimalImage } from '@/components/ui/PersonalityAnimalImage';
import { synergyTable, getSynergyKey } from '@/data/personality-synergy-table';
import FeedbackButton from '@/components/feedback/FeedbackButton';
import Image from 'next/image';

interface UserMatch {
  id: string;
  nickname: string;
  personalityType: string;
  compatibility: 'perfect' | 'good' | 'challenging' | 'learning';
  compatibilityScore: number;
  lastActive: string;
  exhibitions: number;
  artworks: number;
  avatar?: string;
  gender?: 'male' | 'female' | 'other';
  isLiked?: boolean;
  hasLikedMe?: boolean;
  isMatched?: boolean;
  age?: number;
  distance?: number;
}

interface ExhibitionMatch {
  id: string;
  title: string;
  museum: string;
  image: string;
  matchingUsers: number;
  endDate: string;
}

export default function MobileCommunity() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'matches' | 'exhibitions' | 'forums'>('matches');
  const [selectedMatch, setSelectedMatch] = useState<UserMatch | null>(null);
  const [likedUsers, setLikedUsers] = useState<Set<string>>(new Set());
  const [blockedUsers, setBlockedUsers] = useState<Set<string>>(new Set());
  const [showReportModal, setShowReportModal] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter states
  const [genderFilter, setGenderFilter] = useState<'all' | 'opposite'>('all');
  const [showLikedOnly, setShowLikedOnly] = useState(false);
  const [ageFilter, setAgeFilter] = useState<{ min: number; max: number }>({ min: 20, max: 50 });
  const [distanceFilter, setDistanceFilter] = useState<number>(50);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-pink-900 to-orange-900">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-white border-t-transparent"></div>
      </div>
    );
  }

  if (!user) return null;

  const userPersonalityType = user.personalityType || 'LAEF';
  const userAnimal = getAnimalByType(userPersonalityType);

  // Mock compatible users (simplified for mobile)
  const mockUsers: UserMatch[] = [
    {
      id: '1',
      nickname: 'sohee.moment',
      personalityType: 'SAEF',
      compatibility: 'perfect',
      compatibilityScore: 95,
      lastActive: '2시간 전',
      exhibitions: 42,
      artworks: 156,
      avatar: '🦋',
      gender: 'female',
      hasLikedMe: true,
      age: 28,
      distance: 3.5
    },
    {
      id: '2',
      nickname: 'wooj1n',
      personalityType: 'LREF',
      compatibility: 'perfect',
      compatibilityScore: 88,
      lastActive: '30분 전',
      exhibitions: 38,
      artworks: 142,
      avatar: '🦎',
      gender: 'male',
      hasLikedMe: true,
      age: 32,
      distance: 8.2
    },
    {
      id: '3',
      nickname: 'ur.fav.muse',
      personalityType: 'LAMF',
      compatibility: 'good',
      compatibilityScore: 72,
      lastActive: '1일 전',
      exhibitions: 28,
      artworks: 89,
      avatar: '🦉',
      age: 25,
      distance: 15.7
    }
  ];

  // Apply filters
  let filteredUsers = mockUsers.filter(u => !blockedUsers.has(u.id));
  
  if (showLikedOnly) {
    filteredUsers = filteredUsers.filter(u => likedUsers.has(u.id) || u.hasLikedMe);
  }
  
  if (genderFilter === 'opposite') {
    filteredUsers = filteredUsers.filter(u => u.gender && u.gender !== 'other');
  }
  
  if (searchQuery) {
    filteredUsers = filteredUsers.filter(u => 
      u.nickname.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  const handleLikeToggle = (userId: string) => {
    setLikedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
        // Haptic feedback
        if ('vibrate' in navigator) {
          navigator.vibrate(50);
        }
      }
      return newSet;
    });
  };

  const handleBlock = (userId: string) => {
    setBlockedUsers(prev => {
      const newSet = new Set(prev);
      newSet.add(userId);
      return newSet;
    });
  };

  // Mock exhibition data
  const exhibitionMatches: ExhibitionMatch[] = [
    {
      id: '1',
      title: '이불: 시작',
      museum: '리움미술관',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc31?w=400',
      matchingUsers: 18,
      endDate: '2025.05.25'
    },
    {
      id: '2',
      title: '르누아르: 여인의 향기',
      museum: '예술의전당',
      image: 'https://images.unsplash.com/photo-1577720643272-265f09367456?w=400',
      matchingUsers: 24,
      endDate: '2025.04.20'
    }
  ];

  const getCompatibilityBadgeColor = (compatibility: string) => {
    switch (compatibility) {
      case 'perfect': return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'good': return 'bg-gradient-to-r from-blue-500 to-cyan-500';
      case 'challenging': return 'bg-gradient-to-r from-orange-500 to-red-500';
      case 'learning': return 'bg-gradient-to-r from-green-500 to-teal-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-br from-purple-900 via-pink-900 to-orange-900">
      {/* Mobile Header */}
      <div className="sticky top-0 z-20 bg-black/30 backdrop-blur-md border-b border-white/10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-white">커뮤니티</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 bg-white/10 rounded-lg"
              >
                <Filter className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={() => router.push('/profile')}
                className="p-2 bg-white/10 rounded-lg"
              >
                <Settings className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="사용자 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 rounded-lg text-white placeholder-gray-400 text-sm"
            />
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('matches')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'matches' 
                  ? 'bg-white/20 text-white' 
                  : 'text-gray-300'
              }`}
            >
              매칭
            </button>
            <button
              onClick={() => setActiveTab('exhibitions')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'exhibitions' 
                  ? 'bg-white/20 text-white' 
                  : 'text-gray-300'
              }`}
            >
              전시 동행
            </button>
            <button
              onClick={() => setActiveTab('forums')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'forums' 
                  ? 'bg-white/20 text-white' 
                  : 'text-gray-300'
              }`}
            >
              포럼
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-white/10 px-4 py-3 bg-black/20"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white">좋아요만 보기</span>
                  <button
                    onClick={() => setShowLikedOnly(!showLikedOnly)}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      showLikedOnly ? 'bg-purple-500' : 'bg-gray-600'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      showLikedOnly ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-white">성별 필터</span>
                  <select
                    value={genderFilter}
                    onChange={(e) => setGenderFilter(e.target.value as 'all' | 'opposite')}
                    className="px-3 py-1 bg-white/10 rounded text-white text-sm"
                  >
                    <option value="all">전체</option>
                    <option value="opposite">이성만</option>
                  </select>
                </div>

                <div>
                  <span className="text-sm text-white">거리: {distanceFilter}km</span>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    value={distanceFilter}
                    onChange={(e) => setDistanceFilter(Number(e.target.value))}
                    className="w-full mt-1"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content Area */}
      <div className="px-4 py-4">
        <AnimatePresence mode="wait">
          {/* Matches Tab */}
          {activeTab === 'matches' && (
            <motion.div
              key="matches"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              {/* User Stats Card */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-2xl">{userAnimal?.emoji || '🦊'}</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold">{userPersonalityType}</p>
                    <p className="text-xs text-gray-300">{userAnimal?.name_ko || '여우'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-xl font-bold text-white">{likedUsers.size}</p>
                    <p className="text-xs text-gray-300">좋아요</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white">3</p>
                    <p className="text-xs text-gray-300">매칭</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white">12</p>
                    <p className="text-xs text-gray-300">대화</p>
                  </div>
                </div>
              </div>

              {/* User Cards */}
              {filteredUsers.map((match) => {
                const matchAnimal = getAnimalByType(match.personalityType);
                const isLiked = likedUsers.has(match.id);
                const synergyKey = getSynergyKey(userPersonalityType, match.personalityType);
                const synergy = synergyTable[synergyKey];

                return (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/10 backdrop-blur-md rounded-xl overflow-hidden border border-white/20"
                  >
                    {/* User Header */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                            <span className="text-2xl">
                              {match.avatar?.startsWith('http') ? (
                                <Image
                                  src={match.avatar}
                                  alt={match.nickname}
                                  width={56}
                                  height={56}
                                  className="rounded-full"
                                />
                              ) : (
                                match.avatar || matchAnimal?.emoji || '🎨'
                              )}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-white font-semibold">{match.nickname}</p>
                              {match.hasLikedMe && (
                                <span className="text-xs bg-pink-500/30 text-pink-300 px-2 py-0.5 rounded-full">
                                  ❤️ 나를 좋아함
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-300">
                              {match.personalityType} · {matchAnimal?.name_ko}
                            </p>
                            <p className="text-xs text-gray-400">{match.lastActive}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedMatch(match)}
                          className="p-1"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>

                      {/* Compatibility Badge */}
                      <div className="mb-3">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${getCompatibilityBadgeColor(match.compatibility)}`}>
                          <span className="text-white text-xs font-medium">
                            {match.compatibilityScore}% 매칭
                          </span>
                        </div>
                      </div>

                      {/* Synergy Description */}
                      {synergy && (
                        <p className="text-xs text-gray-300 mb-3 line-clamp-2">
                          {language === 'ko' ? synergy.description_ko : synergy.description}
                        </p>
                      )}

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {match.distance}km
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {match.exhibitions}회 전시
                        </span>
                        <span className="flex items-center gap-1">
                          <Palette className="w-3 h-3" />
                          {match.artworks}개 작품
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleLikeToggle(match.id)}
                          className={`flex-1 py-2 rounded-lg font-medium text-sm transition-colors ${
                            isLiked
                              ? 'bg-pink-500 text-white'
                              : 'bg-white/10 text-white'
                          }`}
                        >
                          {isLiked ? '좋아요 취소' : '좋아요'}
                        </button>
                        <button
                          onClick={() => router.push(`/chat/${match.id}`)}
                          className="flex-1 py-2 bg-purple-500/30 rounded-lg text-white font-medium text-sm"
                        >
                          대화하기
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* Exhibitions Tab */}
          {activeTab === 'exhibitions' && (
            <motion.div
              key="exhibitions"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              {exhibitionMatches.map((exhibition) => (
                <motion.div
                  key={exhibition.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/10 backdrop-blur-md rounded-xl overflow-hidden border border-white/20"
                >
                  <div className="aspect-video relative">
                    <Image
                      src={exhibition.image}
                      alt={exhibition.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-white font-semibold text-sm mb-1">{exhibition.title}</h3>
                      <p className="text-xs text-gray-300">{exhibition.museum}</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-gray-400">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        {exhibition.endDate}까지
                      </span>
                      <span className="text-xs text-purple-300">
                        <Users className="w-3 h-3 inline mr-1" />
                        {exhibition.matchingUsers}명 관심
                      </span>
                    </div>
                    <button
                      onClick={() => router.push(`/exhibitions/${exhibition.id}`)}
                      className="w-full py-2 bg-purple-500/30 rounded-lg text-white font-medium text-sm"
                    >
                      동행자 찾기
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Forums Tab */}
          {activeTab === 'forums' && (
            <motion.div
              key="forums"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <h3 className="text-white font-semibold mb-3">인기 토픽</h3>
                <div className="space-y-3">
                  <button className="w-full text-left">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-white">이번 주 전시 추천</p>
                        <p className="text-xs text-gray-400">32개 댓글</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </button>
                  <button className="w-full text-left">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-white">APT별 작품 해석</p>
                        <p className="text-xs text-gray-400">28개 댓글</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </button>
                  <button className="w-full text-left">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-white">미술관 데이트 팁</p>
                        <p className="text-xs text-gray-400">45개 댓글</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Selected Match Modal */}
      <AnimatePresence>
        {selectedMatch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-end"
            onClick={() => setSelectedMatch(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="w-full bg-gray-900 rounded-t-2xl p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-1 bg-gray-600 rounded-full mx-auto mb-4" />
              <div className="space-y-3">
                <button
                  onClick={() => {
                    router.push(`/profile/${selectedMatch.id}`);
                    setSelectedMatch(null);
                  }}
                  className="w-full py-3 text-left text-white"
                >
                  프로필 보기
                </button>
                <button
                  onClick={() => {
                    handleBlock(selectedMatch.id);
                    setSelectedMatch(null);
                  }}
                  className="w-full py-3 text-left text-red-400"
                >
                  차단하기
                </button>
                <button
                  onClick={() => {
                    setShowReportModal(selectedMatch.id);
                    setSelectedMatch(null);
                  }}
                  className="w-full py-3 text-left text-orange-400"
                >
                  신고하기
                </button>
                <button
                  onClick={() => setSelectedMatch(null)}
                  className="w-full py-3 text-center text-gray-400"
                >
                  취소
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback Button */}
      <FeedbackButton
        position="fixed"
        variant="primary"
        contextData={{
          page: 'mobile-community',
          activeTab
        }}
      />
    </div>
  );
}