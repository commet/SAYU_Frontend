'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Filter, Settings, Sparkles } from 'lucide-react';
import RecommendationCard from './RecommendationCard';
import { useAuth } from '@/hooks/useAuth';

interface RecommendationFeedProps {
  initialRecommendations?: any[];
  showFilters?: boolean;
  compact?: boolean;
  limit?: number;
}

interface FilterOptions {
  location: string | null;
  priceRange: [number, number] | null;
  genres: string[];
  timeframe: 'upcoming' | 'ongoing' | 'all';
  distance: number | null;
}

export default function RecommendationFeed({
  initialRecommendations = [],
  showFilters = true,
  compact = false,
  limit = 10
}: RecommendationFeedProps) {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState(initialRecommendations);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    location: null,
    priceRange: null,
    genres: [],
    timeframe: 'upcoming',
    distance: null
  });
  const [showFilterModal, setShowFilterModal] = useState(false);

  useEffect(() => {
    if (user && !initialRecommendations.length) {
      loadRecommendations();
    }
  }, [user]);

  const loadRecommendations = useCallback(async (refresh = false) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        limit: limit.toString(),
        ...filters.location && { location: filters.location },
        ...filters.timeframe && { timeframe: filters.timeframe },
        ...filters.genres.length > 0 && { genres: filters.genres.join(',') },
        ...filters.priceRange && { 
          minPrice: filters.priceRange[0].toString(),
          maxPrice: filters.priceRange[1].toString()
        },
        ...filters.distance && { distance: filters.distance.toString() }
      });

      const response = await fetch(`/api/recommendations/exhibitions?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setRecommendations(data.recommendations);
      }
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setLoading(false);
    }
  }, [user, filters, limit]);

  const handleRefresh = () => {
    loadRecommendations(true);
  };

  const handleLike = async (recommendationId: string) => {
    try {
      await fetch('/api/recommendations/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          recommendationId,
          action: 'like'
        })
      });
    } catch (error) {
      console.error('Failed to send like feedback:', error);
    }
  };

  const handleBookmark = async (recommendationId: string) => {
    try {
      await fetch('/api/recommendations/bookmark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          recommendationId
        })
      });
    } catch (error) {
      console.error('Failed to bookmark:', error);
    }
  };

  const handleView = (recommendationId: string) => {
    // 조회 이벤트 기록
    fetch('/api/recommendations/view', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        recommendationId
      })
    }).catch(console.error);

    // 상세 페이지로 이동
    window.location.href = `/exhibitions/${recommendationId}`;
  };

  const applyFilters = (newFilters: Partial<FilterOptions>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setShowFilterModal(false);
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎨</div>
        <h3 className="text-xl font-bold mb-2">개인 맞춤 추천을 받아보세요!</h3>
        <p className="text-gray-600 mb-4">로그인하고 AI가 추천하는 전시를 만나보세요.</p>
        <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
          로그인하기
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            <h2 className="text-2xl font-bold">AI 맞춤 추천</h2>
          </div>
          {!compact && (
            <div className="text-sm text-gray-600">
              당신의 취향을 분석한 개인화 추천
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {showFilters && (
            <button
              onClick={() => setShowFilterModal(true)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Filter className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 활성 필터 표시 */}
      {(filters.location || filters.genres.length > 0 || filters.priceRange) && (
        <div className="flex flex-wrap gap-2">
          {filters.location && (
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
              📍 {filters.location}
            </span>
          )}
          {filters.genres.map(genre => (
            <span key={genre} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              🎭 {genre}
            </span>
          ))}
          {filters.priceRange && (
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              💰 ₩{filters.priceRange[0].toLocaleString()} - ₩{filters.priceRange[1].toLocaleString()}
            </span>
          )}
          <button
            onClick={() => setFilters({
              location: null,
              priceRange: null,
              genres: [],
              timeframe: 'upcoming',
              distance: null
            })}
            className="px-3 py-1 text-gray-500 hover:bg-gray-100 rounded-full text-sm"
          >
            모든 필터 제거
          </button>
        </div>
      )}

      {/* 로딩 상태 */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full"></div>
        </div>
      )}

      {/* 추천 리스트 */}
      <AnimatePresence>
        {!loading && recommendations.length > 0 && (
          <motion.div
            className={`grid gap-6 ${
              compact 
                ? 'grid-cols-1' 
                : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {recommendations.map((recommendation, index) => (
              <motion.div
                key={recommendation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <RecommendationCard
                  recommendation={recommendation}
                  onLike={handleLike}
                  onBookmark={handleBookmark}
                  onView={handleView}
                  compact={compact}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 빈 상태 */}
      {!loading && recommendations.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-bold mb-2">추천할 전시가 없습니다</h3>
          <p className="text-gray-600 mb-4">
            {filters.location || filters.genres.length > 0 
              ? '필터 조건을 조정해보시거나 더 많은 전시를 관람해주세요.'
              : '더 많은 전시를 관람하시면 더 정확한 추천을 받을 수 있어요.'
            }
          </p>
          <button
            onClick={handleRefresh}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            다시 찾아보기
          </button>
        </div>
      )}

      {/* 필터 모달 */}
      <AnimatePresence>
        {showFilterModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowFilterModal(false)}
          >
            <motion.div
              className="bg-white rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">추천 필터</h3>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* 위치 필터 */}
                <div>
                  <label className="block text-sm font-medium mb-2">위치</label>
                  <select
                    value={filters.location || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value || null }))}
                    className="w-full p-3 border rounded-lg"
                  >
                    <option value="">모든 지역</option>
                    <option value="서울">서울</option>
                    <option value="부산">부산</option>
                    <option value="인천">인천</option>
                    <option value="대구">대구</option>
                    <option value="대전">대전</option>
                    <option value="광주">광주</option>
                  </select>
                </div>

                {/* 장르 필터 */}
                <div>
                  <label className="block text-sm font-medium mb-2">장르</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['contemporary', 'classical', 'photography', 'sculpture', 'digital', 'installation'].map(genre => (
                      <label key={genre} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={filters.genres.includes(genre)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFilters(prev => ({ ...prev, genres: [...prev.genres, genre] }));
                            } else {
                              setFilters(prev => ({ ...prev, genres: prev.genres.filter(g => g !== genre) }));
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">{genre}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* 기간 필터 */}
                <div>
                  <label className="block text-sm font-medium mb-2">기간</label>
                  <select
                    value={filters.timeframe}
                    onChange={(e) => setFilters(prev => ({ ...prev, timeframe: e.target.value as any }))}
                    className="w-full p-3 border rounded-lg"
                  >
                    <option value="upcoming">곧 시작하는 전시</option>
                    <option value="ongoing">현재 진행 중</option>
                    <option value="all">모든 전시</option>
                  </select>
                </div>

                {/* 액션 버튼 */}
                <div className="flex gap-3">
                  <button
                    onClick={() => applyFilters({})}
                    className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    적용하기
                  </button>
                  <button
                    onClick={() => {
                      setFilters({
                        location: null,
                        priceRange: null,
                        genres: [],
                        timeframe: 'upcoming',
                        distance: null
                      });
                      setShowFilterModal(false);
                    }}
                    className="px-4 py-3 text-gray-600 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    초기화
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}