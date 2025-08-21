'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, MessageSquare, Sparkles, Heart, Palette, Eye, Calendar, 
  MapPin, ChevronRight, Info, MoreVertical, Flag, Ban, Filter, X,
  UserPlus, Clock, TrendingUp, Shield, Settings
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { personalityDescriptions } from '@/data/personality-descriptions';
import { getAnimalByType } from '@/data/personality-animals';
import { PersonalityAnimalImage } from '@/components/ui/PersonalityAnimalImage';
import { synergyTable, getSynergyKey } from '@/data/personality-synergy-table';
import { chemistryData, ChemistryData } from '@/data/personality-chemistry';
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
  const [showChemistryModal, setShowChemistryModal] = useState<UserMatch | null>(null);
  const [likedUsers, setLikedUsers] = useState<Set<string>>(new Set());
  const [blockedUsers, setBlockedUsers] = useState<Set<string>>(new Set());
  const [showReportModal, setShowReportModal] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
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

  // Mock compatible users (데스크탑과 동일하게 4명)
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
    },
    {
      id: '4',
      nickname: 'aesthetic_mind',
      personalityType: 'SRMC',
      compatibility: 'challenging',
      compatibilityScore: 45,
      lastActive: '3시간 전',
      exhibitions: 67,
      artworks: 234,
      avatar: '🦅',
      gender: 'male',
      age: 29,
      distance: 12.1
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

  // 커스텀 케미스트리 데이터 생성 (데스크탑과 동일)
  const getCustomChemistryData = (type1: string, type2: string): ChemistryData | null => {
    // LAEF(여우)의 케미스트리
    if ((type1 === 'LAEF' && type2 === 'LAMF') || (type1 === 'LAMF' && type2 === 'LAEF')) {
      return {
        type1: 'LAEF',
        type2: 'LAMF',
        compatibility: 'good',
        title: 'Introspective Companions',
        title_ko: '내성적 동반자들',
        synergy: {
          description: "Fox's emotional depth meets Owl's philosophical insights",
          description_ko: '여우의 감정적 깊이와 올빼미의 철학적 통찰이 만나요'
        },
        recommendedExhibitions: ['Contemporary art', 'Video installations', 'Digital art', 'Conceptual exhibitions'],
        recommendedExhibitions_ko: ['현대미술', '영상 설치', '디지털 아트', '개념미술 전시'],
        conversationExamples: [
          {
            person1: "This piece really speaks to me emotionally...",
            person1_ko: "이 작품이 정말 감정적으로 와닿아요...",
            person2: "What philosophical questions does it raise for you?",
            person2_ko: "어떤 철학적 질문들을 불러일으키나요?"
          }
        ],
        tips: {
          for_type1: "Give Owl time to process deep thoughts",
          for_type1_ko: "올빼미가 깊은 생각을 처리할 시간을 주세요",
          for_type2: "Fox needs emotional processing time - be patient",
          for_type2_ko: "여우는 감정을 처리할 시간이 필요해요 - 인내심을 가지세요"
        }
      };
    }

    // SAEF(나비)의 케미스트리
    if ((type1 === 'SAEF' && type2 === 'LAMC') || (type1 === 'LAMC' && type2 === 'SAEF')) {
      return {
        type1: 'SAEF',
        type2: 'LAMC',
        compatibility: 'good',
        title: 'Feeling meets Analyzing',
        title_ko: '감성과 분석의 만남',
        synergy: {
          description: "Butterfly's expressiveness balances Turtle's methodical approach",
          description_ko: '나비의 표현력이 거북이의 체계적 접근과 균형을 맞춰요'
        },
        recommendedExhibitions: ['Historical exhibitions', 'Art history showcases', 'Classical paintings', 'Documentary-style exhibitions'],
        recommendedExhibitions_ko: ['역사 전시', '미술사 쇼케이스', '고전 회화', '다큐멘터리 스타일 전시'],
        conversationExamples: [
          {
            person1: "I can feel the artist's pain in this brushstroke",
            person1_ko: "이 붓터치에서 작가의 아픔이 느껴져요",
            person2: "Let's examine the historical context of this technique",
            person2_ko: "이 기법의 역사적 맥락을 살펴볼까요"
          }
        ],
        tips: {
          for_type1: "Turtle's knowledge adds depth to your emotional responses",
          for_type1_ko: "거북이의 지식이 당신의 감정적 반응에 깊이를 더해요",
          for_type2: "Butterfly reminds you that art is about feeling - embrace it",
          for_type2_ko: "나비는 예술이 감정에 관한 것임을 상기시켜요 - 받아들이세요"
        }
      };
    }

    // 더 많은 조합들...
    if ((type1 === 'LAMF' && type2 === 'SREF') || (type1 === 'SREF' && type2 === 'LAMF')) {
      return {
        type1: 'LAMF',
        type2: 'SREF',
        compatibility: 'challenging',
        title: 'Contemplation meets Energy',
        title_ko: '사색과 에너지의 만남',
        synergy: {
          description: "Owl's deep thoughts challenged by Dog's enthusiastic pace",
          description_ko: '올빼미의 깊은 사색이 강아지의 열정적 속도에 도전받아요'
        },
        recommendedExhibitions: ['Interactive exhibitions', 'Mixed media shows', 'Performance art', 'Experimental galleries'],
        recommendedExhibitions_ko: ['인터랙티브 전시', '혼합매체 쇼', '퍼포먼스 아트', '실험적 갤러리'],
        conversationExamples: [
          {
            person1: "We should really contemplate this deeper meaning...",
            person1_ko: "이 깊은 의미를 정말 깊이 사색해봐야 해요...",
            person2: "Or we could just enjoy how it makes us feel right now!",
            person2_ko: "아니면 지금 당장 우리가 느끼는 것을 그냥 즐겨봐요!"
          }
        ],
        tips: {
          for_type1: "Dog's enthusiasm can spark new perspectives",
          for_type1_ko: "강아지의 열정이 새로운 관점을 불러일으킬 수 있어요",
          for_type2: "Owl's insights are worth waiting for - sometimes slow down",
          for_type2_ko: "올빼미의 통찰은 기다릴 가치가 있어요 - 가끔은 속도를 늦추세요"
        }
      };
    }

    // SRMC(독수리) vs LAEF(여우) - challenging 케미스트리
    if ((type1 === 'SRMC' && type2 === 'LAEF') || (type1 === 'LAEF' && type2 === 'SRMC')) {
      return {
        type1: 'LAEF',
        type2: 'SRMC',
        compatibility: 'challenging',
        title: 'Emotion meets Logic',
        title_ko: '감성과 논리의 만남',
        synergy: {
          description: "Fox's emotional depth challenged by Eagle's analytical approach",
          description_ko: '여우의 감정적 깊이가 독수리의 분석적 접근에 도전받아요'
        },
        recommendedExhibitions: ['Art theory exhibitions', 'Academic showcases', 'Research-based installations', 'Critical analysis galleries'],
        recommendedExhibitions_ko: ['미술 이론 전시', '학술적 쇼케이스', '연구 기반 설치', '비평적 분석 갤러리'],
        conversationExamples: [
          {
            person1: "This artwork makes me feel so emotional and connected...",
            person1_ko: "이 작품이 정말 감정적으로 와닿고 연결되는 느낌이에요...",
            person2: "Let's analyze the compositional techniques and historical context",
            person2_ko: "구성 기법과 역사적 맥락을 분석해볼까요"
          },
          {
            person1: "I need some time to process these feelings...",
            person1_ko: "이런 감정들을 처리하는데 시간이 좀 필요해요...",
            person2: "While you do that, I can research the artist's methodology",
            person2_ko: "그러는 동안 저는 작가의 방법론을 연구해볼게요"
          }
        ],
        tips: {
          for_type1: "Eagle's analysis can add intellectual depth to your emotional experience - be open to learning",
          for_type1_ko: "독수리의 분석이 당신의 감정적 경험에 지적 깊이를 더할 수 있어요 - 배우려는 마음을 가져보세요",
          for_type2: "Fox's emotional insights reveal the human side of art - don't dismiss feelings as irrelevant",
          for_type2_ko: "여우의 감정적 통찰이 예술의 인간적 면을 드러내요 - 감정을 무관한 것으로 치부하지 마세요"
        }
      };
    }

    return null;
  };

  // 케미스트리 데이터 가져오기 (기존 + 커스텀)
  const getChemistryData = (type1: string, type2: string): ChemistryData | null => {
    // 먼저 기존 데이터에서 찾기
    const existing = chemistryData.find(
      (data) =>
        (data.type1 === type1 && data.type2 === type2) ||
        (data.type1 === type2 && data.type2 === type1)
    );
    if (existing) return existing;
    
    // 없으면 커스텀 생성
    return getCustomChemistryData(type1, type2);
  };

  return (
    <div className="min-h-screen pb-20 relative">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/backgrounds/classical-gallery-floor-sitting-contemplation.jpg')" }}
      />
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative z-10">
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
                    className="bg-white/10 backdrop-blur-md rounded-xl overflow-hidden border border-white/20 cursor-pointer"
                    onClick={() => setShowChemistryModal(match)}
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
                                <span className="text-xs bg-pink-500/30 text-white px-2 py-0.5 rounded-full">
                                  🎨 전시 동행 원함
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-300">
                              {match.personalityType} · {matchAnimal?.name_ko}
                            </p>
                            <p className="text-xs text-white">{match.lastActive}</p>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMatch(match);
                          }}
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
                        <div className="mb-3">
                          <p className="text-xs text-gray-300 line-clamp-2">
                            {language === 'ko' ? synergy.description_ko : synergy.description}
                          </p>
                          <p className="text-xs text-purple-200 mt-1 flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            탭해서 자세한 케미스트리 보기
                          </p>
                        </div>
                      )}

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-xs text-white mb-3">
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
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLikeToggle(match.id);
                          }}
                          className={`flex-1 py-2 rounded-lg font-medium text-sm transition-colors ${
                            isLiked
                              ? 'bg-pink-500 text-white'
                              : 'bg-white/10 text-white'
                          }`}
                        >
                          {isLiked ? '좋아요 취소' : '좋아요'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            alert('채팅 기능은 곧 출시됩니다! 🚀');
                          }}
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

      {/* Chemistry Detail Modal */}
      <AnimatePresence>
        {showChemistryModal && (() => {
          const chemistry = getChemistryData(userPersonalityType, showChemistryModal.personalityType);
          const matchAnimal = getAnimalByType(showChemistryModal.personalityType);
          
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/80 flex items-end"
              onClick={() => setShowChemistryModal(null)}
            >
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                className="w-full bg-gray-900 rounded-t-2xl max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sticky top-0 bg-gray-900 z-10 p-4 border-b border-gray-700">
                  <div className="w-12 h-1 bg-gray-600 rounded-full mx-auto mb-4" />
                  
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-2xl">{matchAnimal?.emoji || '🎨'}</span>
                    </div>
                    <div>
                      <h2 className="text-white font-bold text-lg">{showChemistryModal.nickname}</h2>
                      <p className="text-sm text-gray-300">
                        {showChemistryModal.personalityType} · {matchAnimal?.name_ko}
                      </p>
                    </div>
                  </div>

                  {chemistry && (
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${getCompatibilityBadgeColor(chemistry.compatibility)}`}>
                      <span className="text-white text-sm font-medium">
                        {showChemistryModal.compatibilityScore}% 매칭 · {language === 'ko' ? chemistry.title_ko : chemistry.title}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 space-y-6">
                  {chemistry ? (
                    <>
                      {/* Synergy Section */}
                      <div>
                        <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-purple-400" />
                          케미스트리 시너지
                        </h3>
                        <p className="text-gray-300 text-sm leading-relaxed">
                          {language === 'ko' ? chemistry.synergy.description_ko : chemistry.synergy.description}
                        </p>
                      </div>

                      {/* Recommended Exhibitions */}
                      <div>
                        <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                          <Palette className="w-5 h-5 text-pink-400" />
                          추천 전시 유형
                        </h3>
                        <div className="space-y-2">
                          {(language === 'ko' ? chemistry.recommendedExhibitions_ko : chemistry.recommendedExhibitions).slice(0, 3).map((exhibition, index) => {
                            const exhibitionReasons = [
                              {
                                ko: "두 분의 감상 스타일이 서로를 보완하며 작품의 새로운 면을 발견할 수 있어요",
                                en: "Your viewing styles complement each other, revealing new aspects of artworks"
                              },
                              {
                                ko: "서로 다른 관점에서 작품을 해석하며 깊이 있는 대화를 나눌 수 있어요",
                                en: "Different perspectives on artworks lead to meaningful conversations"
                              },
                              {
                                ko: "함께 관람하면서 예술에 대한 새로운 시각을 얻을 수 있어요",
                                en: "Joint viewing experiences offer fresh insights into art"
                              }
                            ];
                            const reason = exhibitionReasons[index % exhibitionReasons.length];
                            
                            return (
                              <div key={index} className="bg-white/5 rounded-lg p-3">
                                <p className="text-white text-sm font-medium mb-1">{exhibition}</p>
                                <p className="text-gray-400 text-xs">{language === 'ko' ? reason.ko : reason.en}</p>
                              </div>
                            );
                          })}
                        </div>
                        
                        <div className="mt-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg p-3">
                          <p className="text-purple-200 text-xs font-medium mb-1">
                            💡 {language === 'ko' ? '함께 관람할 때 팁' : 'Tips for Viewing Together'}
                          </p>
                          <p className="text-gray-300 text-xs">
                            {language === 'ko' 
                              ? '서로의 해석을 들어보고, 왜 그렇게 느꼈는지 질문해보세요. 다른 관점이 작품을 더 풍성하게 만들어줄 거예요.'
                              : 'Listen to each other\'s interpretations and ask why you felt that way. Different perspectives will enrich the artwork experience.'
                            }
                          </p>
                        </div>
                      </div>

                      {/* Conversation Examples */}
                      <div>
                        <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                          <MessageSquare className="w-5 h-5 text-blue-400" />
                          대화 케미스트리
                        </h3>
                        <div className="space-y-3">
                          {chemistry.conversationExamples.slice(0, 2).map((example, index) => (
                            <div key={index} className="bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-lg p-3 border border-blue-500/20">
                              <div className="mb-3">
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                                    <span className="text-xs">{userAnimal?.emoji || '🎨'}</span>
                                  </div>
                                  <p className="text-purple-300 text-xs font-medium">
                                    {userAnimal?.name_ko} ({userPersonalityType})
                                  </p>
                                </div>
                                <p className="text-gray-200 text-sm italic pl-8">
                                  "{language === 'ko' ? example.person1_ko : example.person1}"
                                </p>
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center">
                                    <span className="text-xs">{matchAnimal?.emoji || '🎨'}</span>
                                  </div>
                                  <p className="text-pink-300 text-xs font-medium">
                                    {matchAnimal?.name_ko} ({showChemistryModal.personalityType})
                                  </p>
                                </div>
                                <p className="text-gray-200 text-sm italic pl-8">
                                  "{language === 'ko' ? example.person2_ko : example.person2}"
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-3 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg p-3">
                          <h4 className="text-blue-200 text-sm font-medium mb-2 flex items-center gap-2">
                            <span className="text-blue-300">💬</span>
                            대화 케미스트리 분석
                          </h4>
                          <p className="text-gray-300 text-xs leading-relaxed">
                            {(() => {
                              const synergyKey = getSynergyKey(userPersonalityType, showChemistryModal.personalityType);
                              const synergy = synergyTable[synergyKey];
                              return language === 'ko' ? synergy?.description_ko : synergy?.description;
                            })()}
                          </p>
                        </div>
                      </div>

                      {/* Tips */}
                      <div>
                        <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                          <Info className="w-5 h-5 text-yellow-400" />
                          맞춤 소통 가이드
                        </h3>
                        <div className="space-y-3">
                          <div className="bg-gradient-to-r from-purple-500/10 to-purple-600/5 rounded-lg p-3 border border-purple-500/20">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                                <span className="text-xs">{userAnimal?.emoji || '🎨'}</span>
                              </div>
                              <p className="text-purple-300 text-sm font-medium">
                                {userAnimal?.name_ko}인 당신을 위한 팁
                              </p>
                            </div>
                            <p className="text-gray-200 text-sm leading-relaxed">
                              {(() => {
                                const tipText = language === 'ko' ? chemistry.tips.for_type1_ko : chemistry.tips.for_type1;
                                const userDisplayName = user?.nickname || user?.name || 'You';
                                const matchDisplayName = showChemistryModal.nickname || 'Partner';
                                
                                // Get animal names for both users
                                const userAnimalName = language === 'ko' ? userAnimal?.animal_ko : userAnimal?.animal;
                                const matchAnimalName = language === 'ko' ? matchAnimal?.name_ko : matchAnimal?.name_en;
                                
                                return tipText
                                  .replace(/Fox|Owl|Dog|Turtle|Butterfly|Deer|Otter|Beaver|Penguin|Parrot|Bee|Chameleon|Elephant|Duck|Eagle|Cat/gi, matchAnimalName || 'Partner')
                                  .replace(/You|당신/gi, userDisplayName);
                              })()}
                            </p>
                          </div>
                          
                          <div className="bg-gradient-to-r from-pink-500/10 to-pink-600/5 rounded-lg p-3 border border-pink-500/20">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center">
                                <span className="text-xs">{matchAnimal?.emoji || '🎨'}</span>
                              </div>
                              <p className="text-pink-300 text-sm font-medium">
                                {matchAnimal?.name_ko} {showChemistryModal.nickname}과 소통할 때
                              </p>
                            </div>
                            <p className="text-gray-200 text-sm leading-relaxed">
                              {(() => {
                                const tipText = language === 'ko' ? chemistry.tips.for_type2_ko : chemistry.tips.for_type2;
                                const userDisplayName = user?.nickname || user?.name || 'You';
                                const matchDisplayName = showChemistryModal.nickname || 'Partner';
                                
                                // Get animal names for both users
                                const userAnimalName = language === 'ko' ? userAnimal?.animal_ko : userAnimal?.animal;
                                const matchAnimalName = language === 'ko' ? matchAnimal?.name_ko : matchAnimal?.name_en;
                                
                                return tipText
                                  .replace(/Fox|Owl|Dog|Turtle|Butterfly|Deer|Otter|Beaver|Penguin|Parrot|Bee|Chameleon|Elephant|Duck|Eagle|Cat/gi, userAnimalName || 'You')
                                  .replace(/Partner|상대방/gi, matchDisplayName);
                              })()}
                            </p>
                          </div>
                        </div>
                        
                        {/* Additional Compatibility Insights */}
                        <div className="mt-3 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 rounded-lg p-3">
                          <h4 className="text-yellow-200 text-sm font-medium mb-2 flex items-center gap-2">
                            <span className="text-yellow-300">✨</span>
                            케미스트리 깊이 분석
                          </h4>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-300">감정적 공감대</span>
                              <div className="flex gap-1">
                                {[1,2,3,4,5].map(i => (
                                  <div key={i} className={`w-2 h-2 rounded-full ${
                                    chemistry.compatibility === 'perfect' && i <= 5 ? 'bg-green-400' :
                                    chemistry.compatibility === 'good' && i <= 4 ? 'bg-blue-400' :
                                    chemistry.compatibility === 'challenging' && i <= 3 ? 'bg-orange-400' :
                                    i <= 3 ? 'bg-purple-400' : 'bg-gray-600'
                                  }`} />
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-300">대화 호환성</span>
                              <div className="flex gap-1">
                                {[1,2,3,4,5].map(i => (
                                  <div key={i} className={`w-2 h-2 rounded-full ${
                                    chemistry.compatibility === 'perfect' && i <= 5 ? 'bg-green-400' :
                                    chemistry.compatibility === 'good' && i <= 4 ? 'bg-blue-400' :
                                    chemistry.compatibility === 'challenging' && i <= 2 ? 'bg-orange-400' :
                                    i <= 4 ? 'bg-purple-400' : 'bg-gray-600'
                                  }`} />
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-300">예술 취향 매칭</span>
                              <div className="flex gap-1">
                                {[1,2,3,4,5].map(i => (
                                  <div key={i} className={`w-2 h-2 rounded-full ${
                                    chemistry.compatibility === 'perfect' && i <= 4 ? 'bg-green-400' :
                                    chemistry.compatibility === 'good' && i <= 4 ? 'bg-blue-400' :
                                    chemistry.compatibility === 'challenging' && i <= 4 ? 'bg-orange-400' :
                                    i <= 3 ? 'bg-purple-400' : 'bg-gray-600'
                                  }`} />
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-400">아직 이 조합에 대한 상세 케미스트리 정보가 없습니다.</p>
                      <p className="text-gray-500 text-sm mt-2">곧 업데이트 될 예정입니다!</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4 border-t border-gray-700">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLikeToggle(showChemistryModal.id);
                      }}
                      className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                        likedUsers.has(showChemistryModal.id)
                          ? 'bg-pink-500 text-white'
                          : 'bg-white/10 text-white'
                      }`}
                    >
                      {likedUsers.has(showChemistryModal.id) ? '좋아요 취소' : '좋아요'}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        alert('채팅 기능은 곧 출시됩니다! 🚀');
                      }}
                      className="flex-1 py-3 bg-purple-500/30 rounded-lg text-white font-medium"
                    >
                      대화하기
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
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
    </div>
  );
}