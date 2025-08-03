'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Sparkles, Palette, MapPin, Heart, TrendingUp, Calendar, ArrowRight, Zap, Eye, Clock, GalleryVerticalEnd } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isProcessingAuth, setIsProcessingAuth] = useState(true);

  console.log('Dashboard - Loading:', loading, 'User:', user);

  useEffect(() => {
    // Check if we have auth params in URL hash
    const checkAuthHash = async () => {
      if (window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        
        if (accessToken) {
          console.log('Dashboard - Found access token in URL, processing...');
          // Wait a bit for Supabase to process the token
          await new Promise(resolve => setTimeout(resolve, 1000));
          // Clean up the URL
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
      setIsProcessingAuth(false);
    };
    
    checkAuthHash();
  }, []);

  useEffect(() => {
    // 로딩이 완료되고 사용자가 없을 때만 리디렉션
    if (loading || isProcessingAuth) return;
    
    if (!user) {
      console.log('Dashboard - No user found, redirecting to login');
      router.push('/login');
    }
  }, [loading, user, router, isProcessingAuth]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  if (loading || isProcessingAuth) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
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

  // Mock data - 실제로는 API에서 가져올 데이터
  const hasCompletedQuiz = false; // user.profile?.personality_type
  const personalityType = null; // user.profile?.personality_type
  
  const todayRecommendations = [
    {
      type: 'artwork',
      title: '별이 빛나는 밤',
      artist: '빈센트 반 고흐',
      reason: '당신의 감성적 성향과 잘 맞아요',
      image: '/api/placeholder/300/200'
    },
    {
      type: 'exhibition',
      title: '모네와 인상주의',
      venue: '국립현대미술관',
      date: '2024.03.01 - 05.31',
      distance: '2.5km',
      image: '/api/placeholder/300/200'
    }
  ];

  const journeyStats = {
    artworksViewed: 0,
    artistsDiscovered: 0,
    exhibitionsVisited: 0,
    daysActive: 0
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-3xl font-light text-gray-900 mb-2">
            {greeting}, {user.email?.split('@')[0]}님
          </h1>
          <p className="text-gray-500">
            {hasCompletedQuiz ? '오늘도 새로운 예술을 발견해보세요' : '예술 여정을 시작해보세요'}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile & Stats */}
          <div className="space-y-6">
            {/* Art Profile Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-50 rounded-2xl p-6"
            >
              {hasCompletedQuiz ? (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <Palette className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">나의 예술 성향</h3>
                      <p className="text-sm text-gray-500">{personalityType || 'INFP - 몽상가'}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    감성적이고 직관적인 당신은 추상적이고 상징적인 작품에 끌립니다.
                  </p>
                  <button className="text-sm text-gray-500 hover:text-gray-700">
                    자세히 보기 →
                  </button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="font-medium text-gray-900 mb-2">예술 성향을 발견하세요</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    AI가 당신만의 예술 취향을 분석해드려요
                  </p>
                  <button
                    onClick={() => router.push('/quiz')}
                    className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    퀴즈 시작하기
                  </button>
                </div>
              )}
            </motion.div>

            {/* My Gallery Quick Access */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => router.push('/gallery')}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                    <GalleryVerticalEnd className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="font-medium text-gray-900">내 갤러리</h3>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">저장한 작품</span>
                  <span className="font-medium text-purple-600">24</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">좋아요한 작품</span>
                  <span className="font-medium text-purple-600">87</span>
                </div>
              </div>
              <p className="text-xs text-purple-600 mt-3">갤러리 보기 →</p>
            </motion.div>

            {/* Journey Stats */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-50 rounded-2xl p-6"
            >
              <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-gray-400" />
                나의 예술 여정
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">탐험한 작품</span>
                  <span className="font-medium">{journeyStats.artworksViewed}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">발견한 아티스트</span>
                  <span className="font-medium">{journeyStats.artistsDiscovered}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">방문한 전시</span>
                  <span className="font-medium">{journeyStats.exhibitionsVisited}</span>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">활동일</span>
                    <span className="font-medium text-purple-600">{journeyStats.daysActive}일째</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Middle Column - Today's Recommendations */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-lg font-medium text-gray-900 mb-6 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                오늘의 추천
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {todayRecommendations.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="bg-gray-50 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => router.push(item.type === 'artwork' ? '/gallery' : '/exhibitions')}
                  >
                    <div className="h-48 bg-gray-200" />
                    <div className="p-6">
                      {item.type === 'artwork' ? (
                        <>
                          <h3 className="font-medium text-gray-900 mb-1">{item.title}</h3>
                          <p className="text-sm text-gray-600 mb-3">{item.artist}</p>
                          <p className="text-xs text-gray-500 bg-gray-100 inline-block px-3 py-1 rounded-full">
                            {item.reason}
                          </p>
                        </>
                      ) : (
                        <>
                          <h3 className="font-medium text-gray-900 mb-1">{item.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{item.venue}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
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

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-8"
            >
              <h2 className="text-lg font-medium text-gray-900 mb-4">빠른 시작</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => router.push('/gallery')}
                  className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-left"
                >
                  <Eye className="w-5 h-5 text-gray-400 mb-2" />
                  <h4 className="font-medium text-gray-900 text-sm">내 갤러리</h4>
                  <p className="text-xs text-gray-500 mt-1">저장한 작품 관리</p>
                </button>
                <button
                  onClick={() => router.push('/exhibitions')}
                  className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-left"
                >
                  <MapPin className="w-5 h-5 text-gray-400 mb-2" />
                  <h4 className="font-medium text-gray-900 text-sm">주변 전시</h4>
                  <p className="text-xs text-gray-500 mt-1">가까운 전시 찾기</p>
                </button>
                <button
                  onClick={() => router.push('/community')}
                  className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-left"
                >
                  <Heart className="w-5 h-5 text-gray-400 mb-2" />
                  <h4 className="font-medium text-gray-900 text-sm">커뮤니티</h4>
                  <p className="text-xs text-gray-500 mt-1">다른 아트러버들과 교류</p>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}