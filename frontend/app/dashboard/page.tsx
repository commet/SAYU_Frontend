'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Sparkles, Palette, MapPin, Heart, TrendingUp, Calendar, ArrowRight, Zap, Eye, Clock, GalleryVerticalEnd, Home, Users, User, LogOut, Menu, Star, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { isFeatureEnabled } from '@/lib/features/flags';
import Image from 'next/image';
import FeedbackButton from '@/components/feedback/FeedbackButton';
import { useResponsive } from '@/lib/responsive';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import { useRecentActivities } from '@/hooks/useActivityTracker';

// Lazy load mobile component
const MobileDashboard = dynamic(() => import('@/components/mobile/MobileDashboard'), {
  ssr: false
});

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { isMobile } = useResponsive();
  
  // Render mobile component for mobile devices
  if (isMobile) {
    return <MobileDashboard />;
  }
  const [currentTime, setCurrentTime] = useState(new Date());
  const [artworks, setArtworks] = useState<any[]>([]);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [savedExhibitionsCount, setSavedExhibitionsCount] = useState(0);
  
  // Fetch real recent activities
  const { activities, isLoading: activitiesLoading, refresh: refreshActivities } = useRecentActivities(10);

  console.log('Dashboard - Loading:', loading, 'User:', user);

  useEffect(() => {
    // 로딩이 완료되고 사용자가 없을 때만 리디렉션
    console.log('Dashboard redirect check - loading:', loading, 'user:', user);
    
    if (loading) return;
    
    if (!user) {
      console.log('Dashboard - No user found, redirecting to login');
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

  // Fetch saved exhibitions count
  useEffect(() => {
    const fetchSavedExhibitions = async () => {
      if (!user) return;
      
      try {
        const response = await fetch('/api/exhibitions/save');
        if (response.ok) {
          const { data } = await response.json();
          setSavedExhibitionsCount(data?.length || 0);
        }
      } catch (error) {
        console.error('Failed to fetch saved exhibitions:', error);
      }
    };
    fetchSavedExhibitions();
  }, [user]);

  // Fetch dashboard stats
  useEffect(() => {
    const fetchDashboardStats = async () => {
      // Check if real-time stats are enabled for this user
      const useRealTimeStats = isFeatureEnabled('realtime_dashboard_stats', user?.id);
      
      if (!useRealTimeStats) {
        console.log('🎯 Using mock dashboard data (feature flag disabled)');
        setDashboardStats({
          artworksViewed: 0,
          artistsDiscovered: 0,
          exhibitionsVisited: 0,
          savedArtworks: 0,
          recentActivities: [],
          trendingArtists: []
        });
        setStatsLoading(false);
        return;
      }
      
      try {
        setStatsLoading(true);
        const userId = user?.id || null;
        const response = await fetch(`/api/dashboard/stats${userId ? `?userId=${userId}` : ''}`);
        const data = await response.json();
        
        if (data.success) {
          setDashboardStats(data.data);
          console.log('📊 Dashboard stats loaded:', data.cached ? '(cached)' : '(fresh)');
        } else {
          console.warn('Dashboard stats API returned error:', data.error);
          setDashboardStats(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        setDashboardStats({
          artworksViewed: 0,
          artistsDiscovered: 0,
          exhibitionsVisited: 0,
          savedArtworks: 0,
          recentActivities: [],
          trendingArtists: []
        });
      } finally {
        setStatsLoading(false);
      }
    };

    // Only fetch stats when user data is available
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

  // Get quiz status and personality type from user object (DB)
  const hasCompletedQuiz = user?.quizCompleted || !!user?.personalityType;
  const personalityType = user?.personalityType || user?.aptType;
  
  // Get random artworks for recommendations
  const randomArtworks = artworks.length > 0 
    ? artworks.sort(() => 0.5 - Math.random()).slice(0, 3)
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

  // Use real stats from API, fallback to defaults if not loaded yet
  const journeyStats = dashboardStats || {
    artworksViewed: 0,
    artistsDiscovered: 0,
    exhibitionsVisited: 0,
    savedArtworks: 0,
    recentActivities: [],
    trendingArtists: []
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed relative"
      style={{ backgroundImage: 'url(/images/backgrounds/stone-gallery-entrance-solitary-figure.jpg)' }}
    >
      {/* Dark overlay for better readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
      
      {/* Simple Navigation Bar - 데스크탑만 */}
      {!isMobile && (
        <nav className="relative z-20 border-b border-white/10 backdrop-blur-md bg-black/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">SAYU</h1>
              <div className="hidden md:flex space-x-6">
                <button 
                  onClick={() => router.push('/')}
                  className="text-gray-300 hover:text-white transition-colors flex items-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  홈
                </button>
                <button 
                  onClick={() => router.push('/gallery')}
                  className="text-gray-300 hover:text-white transition-colors flex items-center gap-2"
                >
                  <GalleryVerticalEnd className="w-4 h-4" />
                  갤러리
                </button>
                <button 
                  onClick={() => router.push('/exhibitions')}
                  className="text-gray-300 hover:text-white transition-colors flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  전시
                </button>
                <button 
                  onClick={() => router.push('/community')}
                  className="text-gray-300 hover:text-white transition-colors flex items-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  커뮤니티
                </button>
                <button 
                  onClick={() => router.push('/artist-portal')}
                  className="text-gray-300 hover:text-white transition-colors flex items-center gap-2"
                >
                  <Palette className="w-4 h-4" />
                  아티스트 포털
                </button>
                <button 
                  onClick={() => router.push('/exhibition-portal')}
                  className="text-gray-300 hover:text-white transition-colors flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  전시 포털
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => router.push('/profile')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                <User className="w-5 h-5" />
              </button>
              <button className="text-gray-300 hover:text-white transition-colors">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
            </div>
          </div>
        </nav>
      )}

      <div className={cn(
        "relative z-10 mx-auto",
        isMobile ? "px-4 py-4 pt-20" : "max-w-7xl px-4 sm:px-6 lg:px-8 py-8"
      )}>
        {/* Header - 모바일 반응형 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn("mb-6", isMobile && "mb-4")}
        >
          <div className={cn(
            "bg-black/40 backdrop-blur-md shadow-2xl border border-white/10 ring-1 ring-white/20",
            isMobile ? "rounded-2xl p-4" : "rounded-3xl p-8"
          )}>
            <div className={cn(
              "flex flex-wrap gap-4",
              isMobile ? "flex-col" : "items-center justify-between"
            )}>
              <div>
                <h1 className={cn(
                  "font-bold bg-gradient-to-r from-amber-300 via-yellow-300 to-orange-300 bg-clip-text text-transparent mb-2 drop-shadow-lg",
                  isMobile ? "text-2xl" : "text-4xl"
                )}>
                  {greeting}, {user.username || user.displayName || user.email?.split('@')[0] || '예술 애호가'}님
                </h1>
                <p className={cn(
                  "text-gray-200",
                  isMobile ? "text-sm" : "text-lg"
                )}>
                  {hasCompletedQuiz ? '오늘도 새로운 예술을 발견해보세요' : '예술 여정을 시작해보세요'}
                </p>
              </div>
              {!isMobile && (
                <div className="text-right">
                  <p className="text-sm text-gray-300">{currentTime.toLocaleDateString('ko-KR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <p className="text-2xl font-bold text-white">{currentTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Profile Completion Section - Moved to Profile page as modal */}

        {/* Quiz CTA for new users - Prominent position */}
        {!hasCompletedQuiz && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 backdrop-blur-md rounded-xl p-5 mb-4 border border-purple-500/30"
          >
            <div className="flex items-center justify-center gap-6">
              <Sparkles className="w-10 h-10 text-amber-400 flex-shrink-0" />
              <div className="text-left flex-1">
                <h2 className="text-lg font-bold text-white mb-1">당신만의 예술 성향을 발견하세요</h2>
                <p className="text-sm text-gray-200">
                  간단한 퀴즈를 통해 맞춤형 작품을 추천받아보세요.
                </p>
              </div>
              <button
                onClick={() => router.push('/quiz')}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-medium hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex-shrink-0"
              >
                테스트 시작 →
              </button>
            </div>
          </motion.div>
        )}

        {/* Main Stats Overview - For users who completed quiz */}
        {hasCompletedQuiz && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={cn(
              "grid gap-4 mb-6",
              isMobile ? "grid-cols-2 gap-3 mb-4" : "grid-cols-2 md:grid-cols-4"
            )}
          >
            <div className="bg-black/40 backdrop-blur-md rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-white">{journeyStats.artworksViewed}</p>
                  <p className="text-sm text-gray-400 mt-1">탐험한 작품</p>
                </div>
                <Eye className="w-8 h-8 text-purple-300 opacity-50" />
              </div>
            </div>
            <div className="bg-black/40 backdrop-blur-md rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-white">{journeyStats.savedArtworks}</p>
                  <p className="text-sm text-gray-400 mt-1">저장한 작품</p>
                </div>
                <Heart className="w-8 h-8 text-pink-300 opacity-50" />
              </div>
            </div>
            <div className="bg-black/40 backdrop-blur-md rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-white">{journeyStats.artistsDiscovered}</p>
                  <p className="text-sm text-gray-400 mt-1">발견한 아티스트</p>
                </div>
                <Palette className="w-8 h-8 text-amber-300 opacity-50" />
              </div>
            </div>
            <div className="bg-black/40 backdrop-blur-md rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-white">{journeyStats.exhibitionsVisited}</p>
                  <p className="text-sm text-gray-400 mt-1">방문한 전시</p>
                </div>
                <MapPin className="w-8 h-8 text-blue-300 opacity-50" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Main Content Grid - 모바일 반응형 */}
        <div className={cn(
          "grid gap-6",
          isMobile ? "grid-cols-1 gap-4" : "grid-cols-1 lg:grid-cols-3"
        )}>
          {/* Left Column - Profile & Activity */}
          <div className="space-y-4">
            {/* Art Profile Card - Only for users who completed quiz */}
            {hasCompletedQuiz && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 backdrop-blur-md rounded-2xl shadow-xl border border-purple-500/20 p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">나의 예술 성향</h3>
                    <p className="text-sm text-amber-400">{personalityType || 'INFP - 몽상가'}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-200 mb-4">
                  감성적이고 직관적인 당신은 추상적이고 상징적인 작품에 끌립니다.
                </p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => router.push('/profile')}
                    className="flex-1 px-4 py-2 bg-purple-600/30 hover:bg-purple-600/40 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    프로필 보기
                  </button>
                  <button 
                    onClick={() => router.push('/quiz')}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-colors"
                  >
                    재검사
                  </button>
                </div>
              </motion.div>
            )}

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-black/40 backdrop-blur-md rounded-2xl shadow-lg border border-white/10 p-6"
            >
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-300" />
                최근 활동
              </h3>
              <div className="space-y-4">
                {activitiesLoading ? (
                  // Loading skeleton
                  [1,2,3].map(i => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-white/10 rounded-full animate-pulse"></div>
                      <div className="flex-1">
                        <div className="w-24 h-4 bg-white/10 rounded animate-pulse mb-1"></div>
                        <div className="w-16 h-3 bg-white/10 rounded animate-pulse"></div>
                      </div>
                    </div>
                  ))
                ) : activities.length > 0 ? (
                  // Real activities from database
                  activities.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        activity.type?.includes('artwork') ? 'bg-purple-900/40' :
                        activity.type?.includes('exhibition') ? 'bg-blue-900/40' : 
                        activity.type?.includes('collection') ? 'bg-green-900/40' : 
                        activity.type?.includes('quiz') ? 'bg-yellow-900/40' : 'bg-pink-900/40'
                      }`}>
                        <span className="text-sm">{activity.icon || '📍'}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-white font-medium line-clamp-1">
                          {activity.title || '활동'}
                        </p>
                        {activity.subtitle && (
                          <p className="text-xs text-gray-400 line-clamp-1">{activity.subtitle}</p>
                        )}
                        <p className="text-xs text-gray-500">{activity.formattedTime || '방금 전'}</p>
                      </div>
                      {activity.image && (
                        <img 
                          src={activity.image} 
                          alt=""
                          className="w-10 h-10 rounded object-cover"
                        />
                      )}
                    </div>
                  ))
                ) : (
                  // Empty state
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-400">아직 활동 기록이 없습니다</p>
                    <p className="text-xs text-gray-500 mt-1">갤러리를 둘러보며 시작해보세요!</p>
                  </div>
                )}
              </div>
              <button 
                onClick={() => router.push('/activity')}
                className="w-full mt-4 text-sm text-blue-300 hover:text-blue-200 transition-colors"
              >
                전체 활동 보기 →
              </button>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-black/40 backdrop-blur-md rounded-2xl shadow-lg border border-white/10 p-6"
            >
              <h3 className="font-semibold text-white mb-4">빠른 메뉴</h3>
              <div className="space-y-2">
                <button 
                  onClick={() => router.push('/gallery')}
                  className="w-full p-3 bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-between text-white transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <GalleryVerticalEnd className="w-4 h-4 text-purple-300" />
                    <span className="text-sm">내 갤러리</span>
                  </span>
                  <span className="text-xs bg-purple-600/30 px-2 py-1 rounded">{journeyStats.savedArtworks}</span>
                </button>
                <button 
                  onClick={() => router.push('/exhibitions')}
                  className="w-full p-3 bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-between text-white transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-pink-300" />
                    <span className="text-sm">관심 전시</span>
                  </span>
                  <span className="text-xs bg-pink-600/30 px-2 py-1 rounded">{savedExhibitionsCount}</span>
                </button>
                <button 
                  onClick={() => router.push('/community')}
                  className="w-full p-3 bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-between text-white transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-pink-300" />
                    <span className="text-sm">커뮤니티</span>
                  </span>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </motion.div>
          </div>

          {/* Middle & Right Columns - Recommendations */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Recommendations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                오늘의 추천
              </h2>
              
              <div className={cn(
                "grid gap-4",
                isMobile ? "grid-cols-1 gap-3" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              )}>
                {todayRecommendations.slice(0, 3).map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="bg-black/40 backdrop-blur-md rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-white/10 group hover:scale-[1.02]"
                    onClick={() => router.push(item.type === 'artwork' ? '/gallery' : '/exhibitions')}
                  >
                    <div className="aspect-[4/3] bg-gradient-to-br from-purple-900/40 to-pink-900/40 relative overflow-hidden">
                      {item.image && item.image !== '/api/placeholder/300/200' ? (
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Palette className="w-12 h-12 text-white/30" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                    <div className="p-4">
                      {item.type === 'artwork' ? (
                        <>
                          <h3 className="font-semibold text-white mb-1 line-clamp-1 group-hover:text-amber-300 transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-sm text-gray-300 mb-2 line-clamp-1">{item.artist}</p>
                          <p className="text-xs text-purple-300 bg-purple-900/40 inline-block px-2 py-1 rounded-full">
                            {item.reason}
                          </p>
                        </>
                      ) : (
                        <>
                          <h3 className="font-semibold text-white mb-1 group-hover:text-amber-300 transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-sm text-gray-300 mb-2">{item.venue}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-400">
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
            </motion.div>

            {/* Trending & Community */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Trending Artists */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-black/40 backdrop-blur-md rounded-2xl shadow-lg border border-white/10 p-6"
              >
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  인기 아티스트
                </h3>
                <div className="space-y-3">
                  {statsLoading ? (
                    // Loading skeleton for trending
                    [1,2,3].map(i => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="w-20 h-4 bg-white/10 rounded animate-pulse"></div>
                        <div className="w-10 h-3 bg-white/10 rounded animate-pulse"></div>
                      </div>
                    ))
                  ) : (
                    // Actual trending artists
                    (journeyStats.trendingArtists || []).slice(0, 3).map((artist, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-white">{artist.name}</span>
                        <span className={`text-xs ${
                          artist.change.includes('↑') ? 'text-green-400' : 
                          artist.change.includes('↓') ? 'text-red-400' : 'text-gray-400'
                        }`}>
                          {artist.change}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>

              {/* Community Highlights */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                className="bg-black/40 backdrop-blur-md rounded-2xl shadow-lg border border-white/10 p-6"
              >
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-pink-300" />
                  커뮤니티 하이라이트
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-white line-clamp-1">새로운 전시 리뷰</p>
                      <p className="text-xs text-gray-400">12명이 참여 중</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-white line-clamp-1">이달의 아트 챌린지</p>
                      <p className="text-xs text-gray-400">참여하기</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Learning Resources */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 backdrop-blur-md rounded-2xl p-6 border border-amber-500/20"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-amber-300" />
                  오늘의 예술 지식
                </h3>
                <button className="text-sm text-amber-300 hover:text-amber-200 transition-colors">
                  더보기 →
                </button>
              </div>
              <div className="bg-black/20 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">인상주의란?</h4>
                <p className="text-sm text-gray-200 mb-3">
                  19세기 후반 프랑스에서 시작된 예술 운동으로, 빛과 색채의 순간적인 인상을 포착하려 했습니다.
                </p>
                <button className="text-xs text-amber-300 hover:text-amber-200">
                  자세히 알아보기 →
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Fixed Feedback Button */}
      <FeedbackButton
        position="fixed"
        variant="primary"
        contextData={{
          page: 'dashboard',
          hasCompletedQuiz: hasCompletedQuiz,
          personalityType: personalityType
        }}
      />
    </div>
  );
}