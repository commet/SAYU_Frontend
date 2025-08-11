'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  Calendar, MapPin, Clock, Filter, Search, ChevronRight, Eye, Heart,
  TrendingUp, Sparkles, Map, Grid3x3, List, Star, Users, Ticket,
  X, SlidersHorizontal, Navigation, Info
} from 'lucide-react';
import FeedbackButton from '@/components/feedback/FeedbackButton';

interface Exhibition {
  id: string;
  title: string;
  venue: string;
  location: string;
  startDate: string;
  endDate: string;
  description?: string;
  image?: string;
  category?: string;
  price?: string;
  status: 'ongoing' | 'upcoming' | 'ended';
  viewCount?: number;
  likeCount?: number;
  distance?: string;
  featured?: boolean;
}

export default function MobileExhibitions() {
  const router = useRouter();
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [filteredExhibitions, setFilteredExhibitions] = useState<Exhibition[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'ongoing' | 'upcoming' | 'ended'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [likedExhibitions, setLikedExhibitions] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchExhibitions = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3002/api/exhibitions?limit=100');
        
        if (!response.ok) {
          // Fallback mock data
          const mockData: Exhibition[] = [
            {
              id: '1',
              title: '이불: 시작',
              venue: '리움미술관',
              location: '서울',
              startDate: '2024-12-20',
              endDate: '2025-05-25',
              description: '이불 작가의 대규모 회고전',
              image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc31?w=400',
              category: '현대미술',
              price: '15,000원',
              status: 'ongoing',
              viewCount: 1250,
              likeCount: 342,
              distance: '2.5km',
              featured: true
            },
            {
              id: '2',
              title: '르누아르: 여인의 향기',
              venue: '예술의전당',
              location: '서울',
              startDate: '2024-11-15',
              endDate: '2025-04-20',
              description: '인상주의 거장 르누아르 특별전',
              image: 'https://images.unsplash.com/photo-1577720643272-265f09367456?w=400',
              category: '회화',
              price: '20,000원',
              status: 'ongoing',
              viewCount: 2340,
              likeCount: 567,
              distance: '5.1km',
              featured: true
            },
            {
              id: '3',
              title: '디지털 아트: 미래의 캔버스',
              venue: '국립현대미술관',
              location: '서울',
              startDate: '2025-02-01',
              endDate: '2025-06-30',
              description: '디지털 매체를 활용한 현대 미술',
              image: 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=400',
              category: '미디어아트',
              price: '10,000원',
              status: 'upcoming',
              viewCount: 890,
              likeCount: 234,
              distance: '3.8km'
            }
          ];
          setExhibitions(mockData);
          setFilteredExhibitions(mockData);
        } else {
          const data = await response.json();
          const transformedData = (data.data || data.exhibitions || []).map((ex: any) => ({
            id: ex.id || ex._id,
            title: ex.title || ex.name,
            venue: ex.venue_name || ex.venue || '',
            location: ex.venue_city || ex.location || '',
            startDate: ex.start_date || ex.startDate || '',
            endDate: ex.end_date || ex.endDate || '',
            description: ex.description || '',
            image: ex.image_url || ex.image || null,
            category: ex.category || ex.tags?.[0] || '미술',
            price: ex.price || ex.admission_fee || '정보 없음',
            status: ex.status || 'ongoing',
            viewCount: ex.view_count || Math.floor(Math.random() * 1000),
            likeCount: ex.like_count || Math.floor(Math.random() * 300),
            distance: ex.distance || `${(Math.random() * 10).toFixed(1)}km`,
            featured: ex.featured || false
          }));
          
          setExhibitions(transformedData);
          setFilteredExhibitions(transformedData);
        }
      } catch (error) {
        console.error('Failed to fetch exhibitions:', error);
        // Use fallback data on error
        const mockData: Exhibition[] = [
          {
            id: '1',
            title: '이불: 시작',
            venue: '리움미술관',
            location: '서울',
            startDate: '2024-12-20',
            endDate: '2025-05-25',
            description: '이불 작가의 대규모 회고전',
            image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc31?w=400',
            category: '현대미술',
            price: '15,000원',
            status: 'ongoing',
            viewCount: 1250,
            likeCount: 342,
            distance: '2.5km',
            featured: true
          }
        ];
        setExhibitions(mockData);
        setFilteredExhibitions(mockData);
      } finally {
        setLoading(false);
      }
    };

    fetchExhibitions();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...exhibitions];

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(ex => ex.status === selectedStatus);
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(ex => ex.category === selectedCategory);
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(ex => 
        ex.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.venue.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredExhibitions(filtered);
  }, [exhibitions, selectedStatus, selectedCategory, searchQuery]);

  const handleLikeToggle = (exhibitionId: string) => {
    setLikedExhibitions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(exhibitionId)) {
        newSet.delete(exhibitionId);
      } else {
        newSet.add(exhibitionId);
        // Haptic feedback
        if ('vibrate' in navigator) {
          navigator.vibrate(50);
        }
      }
      return newSet;
    });
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'ongoing': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'upcoming': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'ended': return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ongoing': return '진행중';
      case 'upcoming': return '예정';
      case 'ended': return '종료';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-pink-900 to-orange-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-white border-t-transparent mx-auto mb-4"></div>
          <p className="text-white text-sm">전시 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-br from-purple-900 via-pink-900 to-orange-900">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-black/30 backdrop-blur-md border-b border-white/10">
        <div className="px-4 py-3">
          {/* Title and Actions */}
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-white">전시회</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 bg-white/10 rounded-lg relative"
              >
                <SlidersHorizontal className="w-5 h-5 text-white" />
                {(selectedStatus !== 'all' || selectedCategory !== 'all') && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full" />
                )}
              </button>
              <button
                onClick={() => router.push('/exhibition-map')}
                className="p-2 bg-white/10 rounded-lg"
              >
                <Navigation className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="전시명, 미술관 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 rounded-lg text-white placeholder-gray-400 text-sm"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-1 mt-3 bg-black/20 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex-1 py-1.5 rounded text-sm font-medium transition-colors flex items-center justify-center gap-1 ${
                viewMode === 'grid' ? 'bg-white/20 text-white' : 'text-gray-400'
              }`}
            >
              <Grid3x3 className="w-3.5 h-3.5" />
              그리드
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex-1 py-1.5 rounded text-sm font-medium transition-colors flex items-center justify-center gap-1 ${
                viewMode === 'list' ? 'bg-white/20 text-white' : 'text-gray-400'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              리스트
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex-1 py-1.5 rounded text-sm font-medium transition-colors flex items-center justify-center gap-1 ${
                viewMode === 'map' ? 'bg-white/20 text-white' : 'text-gray-400'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              지도
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
              {/* Status Filter */}
              <div className="mb-3">
                <p className="text-xs text-gray-400 mb-2">상태</p>
                <div className="flex gap-2">
                  {['all', 'ongoing', 'upcoming', 'ended'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setSelectedStatus(status as any)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        selectedStatus === status
                          ? 'bg-purple-500 text-white'
                          : 'bg-white/10 text-gray-300'
                      }`}
                    >
                      {status === 'all' ? '전체' : getStatusText(status)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <p className="text-xs text-gray-400 mb-2">카테고리</p>
                <div className="flex gap-2 flex-wrap">
                  {['all', '현대미술', '회화', '조각', '사진', '미디어아트'].map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        selectedCategory === category
                          ? 'bg-purple-500 text-white'
                          : 'bg-white/10 text-gray-300'
                      }`}
                    >
                      {category === 'all' ? '전체' : category}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        {/* Featured Exhibitions (Horizontal Scroll) */}
        {filteredExhibitions.filter(ex => ex.featured).length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              추천 전시
            </h2>
            <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
              <div className="flex gap-3" style={{ width: 'max-content' }}>
                {filteredExhibitions.filter(ex => ex.featured).map((exhibition) => (
                  <motion.div
                    key={exhibition.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white/10 backdrop-blur-md rounded-xl overflow-hidden border border-white/20 w-72 flex-shrink-0"
                    onClick={() => router.push(`/exhibitions/${exhibition.id}`)}
                  >
                    <div className="aspect-[16/9] relative">
                      {exhibition.image ? (
                        <Image
                          src={exhibition.image}
                          alt={exhibition.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center">
                          <MapPin className="w-8 h-8 text-white/50" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute top-2 right-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeColor(exhibition.status)}`}>
                          {getStatusText(exhibition.status)}
                        </span>
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-white text-sm mb-1 line-clamp-1">{exhibition.title}</h3>
                      <p className="text-xs text-gray-300 mb-2">{exhibition.venue}</p>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {exhibition.endDate}까지
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {exhibition.distance}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Exhibition List/Grid */}
        {viewMode === 'map' ? (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 h-96 flex items-center justify-center">
            <div className="text-center">
              <Map className="w-12 h-12 text-white/50 mx-auto mb-3" />
              <p className="text-white text-sm">지도 보기는</p>
              <button
                onClick={() => router.push('/exhibition-map')}
                className="text-purple-300 text-sm underline"
              >
                전체 지도 페이지
              </button>
              <p className="text-white text-sm">에서 확인하세요</p>
            </div>
          </div>
        ) : viewMode === 'list' ? (
          <div className="space-y-3">
            {filteredExhibitions.map((exhibition) => {
              const isLiked = likedExhibitions.has(exhibition.id);
              
              return (
                <motion.div
                  key={exhibition.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20"
                >
                  <div className="flex gap-3">
                    {/* Thumbnail */}
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-purple-500/30 to-pink-500/30">
                      {exhibition.image ? (
                        <Image
                          src={exhibition.image}
                          alt={exhibition.title}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <MapPin className="w-6 h-6 text-white/50" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-semibold text-white text-sm line-clamp-1 flex-1">{exhibition.title}</h3>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLikeToggle(exhibition.id);
                          }}
                          className="ml-2"
                        >
                          <Heart className={`w-4 h-4 ${isLiked ? 'fill-pink-500 text-pink-500' : 'text-gray-400'}`} />
                        </button>
                      </div>
                      <p className="text-xs text-gray-300 mb-2">{exhibition.venue}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span className={`px-2 py-0.5 rounded-full border ${getStatusBadgeColor(exhibition.status)}`}>
                          {getStatusText(exhibition.status)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {exhibition.viewCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {exhibition.likeCount}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => router.push(`/exhibitions/${exhibition.id}`)}
                    className="w-full mt-3 py-2 bg-purple-500/20 rounded-lg text-white text-xs font-medium flex items-center justify-center gap-1"
                  >
                    상세 정보
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredExhibitions.map((exhibition) => {
              const isLiked = likedExhibitions.has(exhibition.id);
              
              return (
                <motion.div
                  key={exhibition.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white/10 backdrop-blur-md rounded-xl overflow-hidden border border-white/20"
                  onClick={() => router.push(`/exhibitions/${exhibition.id}`)}
                >
                  <div className="aspect-[4/3] relative">
                    {exhibition.image ? (
                      <Image
                        src={exhibition.image}
                        alt={exhibition.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center">
                        <MapPin className="w-8 h-8 text-white/50" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    
                    {/* Status Badge */}
                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeColor(exhibition.status)}`}>
                        {getStatusText(exhibition.status)}
                      </span>
                    </div>

                    {/* Like Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLikeToggle(exhibition.id);
                      }}
                      className="absolute top-2 left-2 p-1.5 bg-black/50 rounded-full"
                    >
                      <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-pink-500 text-pink-500' : 'text-white'}`} />
                    </button>
                  </div>

                  <div className="p-3">
                    <h3 className="font-semibold text-white text-xs line-clamp-1 mb-1">{exhibition.title}</h3>
                    <p className="text-xs text-gray-300 line-clamp-1 mb-2">{exhibition.venue}</p>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        ~{exhibition.endDate?.split('-').slice(1).join('.')}
                      </span>
                      <span>{exhibition.distance}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* No Results */}
        {filteredExhibitions.length === 0 && (
          <div className="text-center py-12">
            <Info className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <p className="text-white text-sm">검색 결과가 없습니다</p>
            <p className="text-gray-400 text-xs mt-1">다른 조건으로 검색해보세요</p>
          </div>
        )}
      </div>

      {/* Feedback Button */}
      <FeedbackButton
        position="fixed"
        variant="primary"
        contextData={{
          page: 'mobile-exhibitions',
          viewMode,
          filters: {
            status: selectedStatus,
            category: selectedCategory
          }
        }}
      />
    </div>
  );
}