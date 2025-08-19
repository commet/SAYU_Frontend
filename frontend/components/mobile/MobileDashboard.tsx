'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { 
  Sparkles, Palette, MapPin, Heart, TrendingUp, Calendar, ArrowRight, 
  Zap, Eye, Clock, GalleryVerticalEnd, Home, Users, User, LogOut, 
  Menu, Star, BookOpen, ChevronRight, MoreVertical, BarChart3, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import FeedbackButton from '@/components/feedback/FeedbackButton';

export default function MobileDashboard() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [artworks, setArtworks] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'recommendations'>('overview');
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Fetch artworks data
  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const response = await fetch('/api/artworks');
        const data = await response.json();
        setArtworks(data.artworks || []);
      } catch (error) {
        console.error('Failed to fetch artworks:', error);
      }
    };
    fetchArtworks();
  }, []);

  // Fetch dashboard stats
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setStatsLoading(true);
        const userId = user?.id || null;
        const response = await fetch(`/api/dashboard/stats${userId ? `?userId=${userId}` : ''}`);
        const data = await response.json();
        
        if (data.success) {
          setDashboardStats(data.data);
          console.log('📊 Mobile dashboard stats loaded:', data.cached ? '(cached)' : '(fresh)');
        } else {
          setDashboardStats(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch mobile dashboard stats:', error);
        setDashboardStats({
          artworksViewed: 127,
          artistsDiscovered: 43,
          exhibitionsVisited: 8,
          savedArtworks: 24,
          newExhibitions: 3,
          communityUpdates: 5
        });
      } finally {
        setStatsLoading(false);
      }
    };

    if (user && !loading) {
      fetchDashboardStats();
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-gray-400 mx-auto mb-4"></div>
          <p className="text-gray-400 text-sm">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const greeting = currentTime.getHours() < 12 ? '좋은 아침이에요' : 
                  currentTime.getHours() < 18 ? '좋은 오후에요' : '좋은 저녁이에요';

  // User quiz completion status
  const hasCompletedQuiz = false;
  const personalityType = null;
  
  // Get random artworks for recommendations
  const randomArtworks = artworks.length > 0 
    ? artworks.sort(() => 0.5 - Math.random()).slice(0, 6)
    : [];
  
  const todayRecommendations = randomArtworks.map((artwork, index) => ({
    type: 'artwork',
    title: artwork.title || 'Untitled',
    artist: artwork.artist || 'Unknown Artist',
    reason: index === 0 ? '당신의 감성적 성향과 잘 맞아요' : '오늘의 추천 작품',
    image: artwork.cloudinaryUrl || artwork.primaryImage || '/api/placeholder/300/200',
    objectID: artwork.objectID
  }));

  // Add exhibition recommendation
  if (todayRecommendations.length < 3) {
    todayRecommendations.push({
      type: 'exhibition',
      title: '모네와 인상주의',
      venue: '국립현대미술관',
      date: '2024.03.01 - 05.31',
      distance: '2.5km',
      image: '/api/placeholder/300/200'
    });
  }

  const journeyStats = dashboardStats || {
    artworksViewed: 127,
    artistsDiscovered: 43,
    exhibitionsVisited: 8,
    daysActive: 15,
    savedArtworks: 24,
    likedArtworks: 87,
    newExhibitions: 3,
    communityUpdates: 5
  };
  
  const showStatsLoading = statsLoading && !dashboardStats;

  return (
    <div className="min-h-screen bg-cover bg-center bg-fixed relative pb-20"
         style={{ backgroundImage: 'url(/images/backgrounds/stone-gallery-entrance-solitary-figure.jpg)' }}>
      
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
      
      {/* Mobile Header */}
      <div className="relative z-20 pt-4">
        {/* Greeting Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 py-4"
        >
          <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-300 via-yellow-300 to-orange-300 bg-clip-text text-transparent">
                {greeting}
              </h1>
              <button 
                onClick={() => router.push('/profile')}
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center"
              >
                <User className="w-5 h-5 text-white" />
              </button>
            </div>
            <p className="text-white font-medium mb-1">
              {user.username || user.displayName || user.email?.split('@')[0] || '예술 애호가'}님
            </p>
            <p className="text-gray-300 text-sm">
              {hasCompletedQuiz ? '오늘도 새로운 예술을 발견해보세요' : '예술 여정을 시작해보세요'}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              {currentTime.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })} · 
              {currentTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </motion.div>

        {/* Mobile Tab Navigation */}
        <div className="px-4 mb-4">
          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-1 flex">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 py-2.5 px-3 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center gap-1.5 ${
                activeTab === 'overview' 
                  ? 'bg-white/20 text-white shadow-sm' 
                  : 'text-gray-300 hover:text-white hover:bg-white/10 active:bg-white/15'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              개요
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`flex-1 py-2.5 px-3 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center gap-1.5 ${
                activeTab === 'activity' 
                  ? 'bg-white/20 text-white shadow-sm' 
                  : 'text-gray-300 hover:text-white hover:bg-white/10 active:bg-white/15'
              }`}
            >
              <Activity className="w-4 h-4" />
              활동
            </button>
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`flex-1 py-2.5 px-3 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center gap-1.5 ${
                activeTab === 'recommendations' 
                  ? 'bg-white/20 text-white shadow-sm' 
                  : 'text-gray-300 hover:text-white hover:bg-white/10 active:bg-white/15'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              추천
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="px-4 space-y-4"
            >
              {/* Stats Overview */}
              {hasCompletedQuiz && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-black/40 backdrop-blur-md rounded-xl p-3 border border-white/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-white">{journeyStats.artworksViewed}</p>
                        <p className="text-xs text-gray-400 mt-1">탐험한 작품</p>
                      </div>
                      <Eye className="w-6 h-6 text-purple-300 opacity-50" />
                    </div>
                  </div>
                  <div className="bg-black/40 backdrop-blur-md rounded-xl p-3 border border-white/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-white">{journeyStats.savedArtworks}</p>
                        <p className="text-xs text-gray-400 mt-1">저장한 작품</p>
                      </div>
                      <Heart className="w-6 h-6 text-pink-300 opacity-50" />
                    </div>
                  </div>
                  <div className="bg-black/40 backdrop-blur-md rounded-xl p-3 border border-white/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-white">{journeyStats.artistsDiscovered}</p>
                        <p className="text-xs text-gray-400 mt-1">발견한 아티스트</p>
                      </div>
                      <Palette className="w-6 h-6 text-amber-300 opacity-50" />
                    </div>
                  </div>
                  <div className="bg-black/40 backdrop-blur-md rounded-xl p-3 border border-white/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-white">{journeyStats.exhibitionsVisited}</p>
                        <p className="text-xs text-gray-400 mt-1">방문한 전시</p>
                      </div>
                      <MapPin className="w-6 h-6 text-blue-300 opacity-50" />
                    </div>
                  </div>
                </div>
              )}

              {/* Art Profile Card */}
              {hasCompletedQuiz && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 backdrop-blur-md rounded-xl border border-purple-500/20 p-4"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                      <Star className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-sm">나의 예술 성향</h3>
                      <p className="text-xs text-amber-400">{personalityType || 'INFP - 몽상가'}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-200 mb-3">
                    감성적이고 직관적인 당신은 추상적이고 상징적인 작품에 끌립니다.
                  </p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => router.push('/profile')}
                      className="flex-1 px-3 py-1.5 bg-purple-600/30 text-white rounded-lg text-xs font-medium"
                    >
                      프로필 보기
                    </button>
                    <button 
                      onClick={() => router.push('/quiz')}
                      className="px-3 py-1.5 bg-white/10 text-white rounded-lg text-xs"
                    >
                      재검사
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Quick Links */}
              <div className="bg-black/40 backdrop-blur-md rounded-xl border border-white/10 p-4">
                <h3 className="font-semibold text-white text-sm mb-3">빠른 메뉴</h3>
                <div className="space-y-2">
                  <button 
                    onClick={() => router.push('/gallery')}
                    className="w-full p-2.5 bg-white/5 rounded-lg flex items-center justify-between text-white active:bg-white/10"
                  >
                    <span className="flex items-center gap-2">
                      <GalleryVerticalEnd className="w-4 h-4 text-purple-300" />
                      <span className="text-sm">내 갤러리</span>
                    </span>
                    <span className="text-xs bg-purple-600/30 px-2 py-0.5 rounded font-medium">{journeyStats.savedArtworks}</span>
                  </button>
                  <button 
                    onClick={() => router.push('/exhibitions')}
                    className="w-full p-2.5 bg-white/5 rounded-lg flex items-center justify-between text-white active:bg-white/10"
                  >
                    <span className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-300" />
                      <span className="text-sm">주변 전시</span>
                    </span>
                    {journeyStats.newExhibitions > 0 && (
                      <span className="text-xs bg-blue-600/30 px-2 py-0.5 rounded font-medium text-blue-200">
                        {journeyStats.newExhibitions}
                      </span>
                    )}
                  </button>
                  <button 
                    onClick={() => router.push('/community')}
                    className="w-full p-2.5 bg-white/5 rounded-lg flex items-center justify-between text-white active:bg-white/10"
                  >
                    <span className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-pink-300" />
                      <span className="text-sm">커뮤니티</span>
                    </span>
                    {journeyStats.communityUpdates > 0 && (
                      <span className="text-xs bg-pink-600/30 px-2 py-0.5 rounded font-medium text-pink-200">
                        {journeyStats.communityUpdates}
                      </span>
                    )}
                  </button>
                  <button 
                    onClick={() => router.push('/artist-portal')}
                    className="w-full p-2.5 bg-white/5 rounded-lg flex items-center justify-between text-white active:bg-white/10"
                  >
                    <span className="flex items-center gap-2">
                      <Palette className="w-4 h-4 text-amber-300" />
                      <span className="text-sm">아티스트 포털</span>
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Learning Resources */}
              <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 backdrop-blur-md rounded-xl p-4 border border-amber-500/20">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-amber-300" />
                    오늘의 예술 지식
                  </h3>
                  <button className="text-xs text-amber-300">
                    더보기
                  </button>
                </div>
                <div className="bg-black/20 rounded-lg p-3">
                  <h4 className="text-white font-medium text-sm mb-1">인상주의란?</h4>
                  <p className="text-xs text-gray-200 mb-2">
                    19세기 후반 프랑스에서 시작된 예술 운동으로, 빛과 색채의 순간적인 인상을 포착하려 했습니다.
                  </p>
                  <button className="text-xs text-amber-300">
                    자세히 알아보기 →
                  </button>
                </div>
              </div>

              {/* Quiz CTA for new users */}
              {!hasCompletedQuiz && (
                <div className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 backdrop-blur-md rounded-xl p-4 border border-purple-500/30">
                  <div className="flex items-center gap-3 mb-3">
                    <Sparkles className="w-8 h-8 text-amber-400 flex-shrink-0" />
                    <div className="flex-1">
                      <h2 className="text-base font-bold text-white">당신만의 예술 성향을 발견하세요</h2>
                      <p className="text-xs text-gray-200 mt-1">
                        간단한 퀴즈를 통해 맞춤형 작품을 추천받아보세요
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push('/quiz')}
                    className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-medium shadow-lg active:scale-95 transition-transform"
                  >
                    테스트 시작하기 →
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'activity' && (
            <motion.div
              key="activity"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="px-4 space-y-4"
            >
              {/* Recent Activity */}
              <div className="bg-black/40 backdrop-blur-md rounded-xl border border-white/10 p-4">
                <h3 className="font-semibold text-white text-sm mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-300" />
                  최근 활동
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-900/40 rounded-full flex items-center justify-center flex-shrink-0">
                      <Eye className="w-4 h-4 text-purple-300" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white font-medium">모네의 수련</p>
                      <p className="text-xs text-gray-400">2시간 전</p>
                    </div>
                    <button className="p-1">
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-900/40 rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4 text-blue-300" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white font-medium">국립현대미술관 방문</p>
                      <p className="text-xs text-gray-400">어제</p>
                    </div>
                    <button className="p-1">
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-pink-900/40 rounded-full flex items-center justify-center flex-shrink-0">
                      <Heart className="w-4 h-4 text-pink-300" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white font-medium">칸딘스키 작품 저장</p>
                      <p className="text-xs text-gray-400">3일 전</p>
                    </div>
                    <button className="p-1">
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
                <button 
                  onClick={() => router.push('/activity')}
                  className="w-full mt-3 text-sm text-blue-300 text-center"
                >
                  전체 활동 보기 →
                </button>
              </div>

              {/* Trending & Community */}
              <div className="grid grid-cols-1 gap-4">
                {/* Trending Artists */}
                <div className="bg-black/40 backdrop-blur-md rounded-xl border border-white/10 p-4">
                  <h3 className="font-semibold text-white text-sm mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    인기 아티스트
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white">클로드 모네</span>
                      <span className="text-xs text-green-400">↑ 12%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white">빈센트 반 고흐</span>
                      <span className="text-xs text-green-400">↑ 8%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white">칸딘스키</span>
                      <span className="text-xs text-gray-400">—</span>
                    </div>
                  </div>
                </div>

                {/* Community Highlights */}
                <div className="bg-black/40 backdrop-blur-md rounded-xl border border-white/10 p-4">
                  <h3 className="font-semibold text-white text-sm mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4 text-pink-300" />
                    커뮤니티 하이라이트
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-white">새로운 전시 리뷰</p>
                        <p className="text-xs text-gray-400">12명이 참여 중</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-white">이달의 아트 챌린지</p>
                        <p className="text-xs text-gray-400">참여하기</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'recommendations' && (
            <motion.div
              key="recommendations"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="px-4 space-y-4"
            >
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                오늘의 추천
              </h2>
              
              {/* Horizontal scroll for recommendations */}
              <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
                <div className="flex gap-3" style={{ width: 'max-content' }}>
                  {todayRecommendations.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-black/40 backdrop-blur-md rounded-xl overflow-hidden border border-white/10 w-64 flex-shrink-0"
                      onClick={() => router.push(item.type === 'artwork' ? '/gallery' : '/exhibitions')}
                    >
                      <div className="aspect-[4/3] bg-gradient-to-br from-purple-900/40 to-pink-900/40 relative">
                        {item.image && item.image !== '/api/placeholder/300/200' ? (
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            className="object-cover"
                            sizes="256px"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Palette className="w-10 h-10 text-white/30" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      </div>
                      <div className="p-3">
                        {item.type === 'artwork' ? (
                          <>
                            <h3 className="font-semibold text-white text-sm mb-1 line-clamp-1">
                              {item.title}
                            </h3>
                            <p className="text-xs text-gray-300 mb-2">{item.artist}</p>
                            <p className="text-xs text-purple-300 bg-purple-900/40 inline-block px-2 py-0.5 rounded-full">
                              {item.reason}
                            </p>
                          </>
                        ) : (
                          <>
                            <h3 className="font-semibold text-white text-sm mb-1">
                              {item.title}
                            </h3>
                            <p className="text-xs text-gray-300 mb-2">{item.venue}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {item.date}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {item.distance}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* More recommendations button */}
              <button 
                onClick={() => router.push('/gallery')}
                className="w-full py-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 text-white text-sm font-medium"
              >
                더 많은 추천 보기 →
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Fixed Feedback Button */}
      <FeedbackButton
        position="fixed"
        variant="primary"
        contextData={{
          page: 'mobile-dashboard',
          hasCompletedQuiz: hasCompletedQuiz,
          personalityType: personalityType
        }}
      />
    </div>
  );
}