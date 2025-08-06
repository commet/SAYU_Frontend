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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-white/80 backdrop-blur-sm dark:bg-gray-800/90 rounded-3xl shadow-lg p-8 border border-white/20 dark:border-gray-700/50 ring-1 ring-black/5">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                  {greeting}, {user.email?.split('@')[0]}님
                </h1>
                <p className="text-slate-600 dark:text-gray-300 text-lg">
                  {hasCompletedQuiz ? '오늘도 새로운 예술을 발견해보세요' : '예술 여정을 시작해보세요'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500 dark:text-gray-400">{currentTime.toLocaleDateString('ko-KR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-gray-100">{currentTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile & Stats */}
          <div className="space-y-6">
            {/* Art Profile Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/70 backdrop-blur-sm dark:bg-gray-800/80 rounded-2xl shadow-lg border border-white/30 dark:border-gray-700/50 p-6 hover:shadow-xl transition-all duration-300 ring-1 ring-black/5"
            >
              {hasCompletedQuiz ? (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                      <Palette className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-gray-100">나의 예술 성향</h3>
                      <p className="text-sm text-gray-500">{personalityType || 'INFP - 몽상가'}</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-gray-300 mb-4">
                    감성적이고 직관적인 당신은 추상적이고 상징적인 작품에 끌립니다.
                  </p>
                  <button className="text-sm text-gray-500 hover:text-gray-700">
                    자세히 보기 →
                  </button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="font-semibold text-slate-900 dark:text-gray-100 mb-2">예술 성향을 발견하세요</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    AI가 당신만의 예술 취향을 분석해드려요
                  </p>
                  <button
                    onClick={() => router.push('/quiz')}
                    className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
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
              className="bg-gradient-to-br from-indigo-50/80 to-purple-50/80 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-6 cursor-pointer hover:shadow-lg transition-all duration-300 border border-indigo-100/50 dark:border-purple-800/50 hover:scale-[1.02] backdrop-blur-sm"
              onClick={() => router.push('/gallery')}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/90 rounded-lg flex items-center justify-center shadow-md backdrop-blur-sm">
                    <GalleryVerticalEnd className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-gray-100">내 갤러리</h3>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-gray-300">저장한 작품</span>
                  <span className="font-medium text-indigo-600 dark:text-indigo-400">24</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-gray-300">좋아요한 작품</span>
                  <span className="font-medium text-indigo-600 dark:text-indigo-400">87</span>
                </div>
              </div>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-3">갤러리 보기 →</p>
            </motion.div>

            {/* Journey Stats */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-300"
            >
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-gray-400" />
                나의 예술 여정
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">탐험한 작품</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{journeyStats.artworksViewed}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">발견한 아티스트</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{journeyStats.artistsDiscovered}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">방문한 전시</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{journeyStats.exhibitionsVisited}</span>
                </div>
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">활동일</span>
                    <span className="font-semibold text-purple-600 dark:text-purple-400">{journeyStats.daysActive}일째</span>
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
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
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
                    className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 dark:border-gray-700 group hover:scale-[1.02]"
                    onClick={() => router.push(item.type === 'artwork' ? '/gallery' : '/exhibitions')}
                  >
                    <div className="h-48 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <div className="p-6">
                      {item.type === 'artwork' ? (
                        <>
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{item.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{item.artist}</p>
                          <p className="text-xs text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 inline-block px-3 py-1.5 rounded-full font-medium">
                            {item.reason}
                          </p>
                        </>
                      ) : (
                        <>
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{item.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{item.venue}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
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
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">빠른 시작</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => router.push('/gallery')}
                  className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 text-left border border-gray-100 dark:border-gray-700 group hover:scale-[1.02]"
                >
                  <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-3 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/50 transition-colors">
                    <Eye className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-base">내 갤러리</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">저장한 작품 관리</p>
                </button>
                <button
                  onClick={() => router.push('/exhibitions')}
                  className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 text-left border border-gray-100 dark:border-gray-700 group hover:scale-[1.02]"
                >
                  <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-3 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
                    <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-base">주변 전시</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">가까운 전시 찾기</p>
                </button>
                <button
                  onClick={() => router.push('/community')}
                  className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 text-left border border-gray-100 dark:border-gray-700 group hover:scale-[1.02]"
                >
                  <div className="w-10 h-10 bg-pink-50 dark:bg-pink-900/30 rounded-lg flex items-center justify-center mb-3 group-hover:bg-pink-100 dark:group-hover:bg-pink-900/50 transition-colors">
                    <Heart className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-base">커뮤니티</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">다른 아트러버들과 교류</p>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}