'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Filter, 
  Search, 
  ChevronRight, 
  Eye, 
  Heart, 
  TrendingUp, 
  Sparkles, 
  Map, 
  Grid3x3, 
  List, 
  Star, 
  Users, 
  Ticket,
  BookOpen,
  Edit,
  AlertCircle
} from 'lucide-react';

interface Exhibition {
  id: string;
  title: string;
  venue_name?: string;
  venue_city?: string;
  start_date: string;
  end_date: string;
  description?: string;
  image_url?: string;
  category?: string;
  price?: string;
  admission_fee?: number | string;
  view_count?: number;
  like_count?: number;
  featured?: boolean;
}

interface TransformedExhibition {
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
  featured?: boolean;
}

export default function ExhibitionsClient() {
  const router = useRouter();
  const [exhibitions, setExhibitions] = useState<TransformedExhibition[]>([]);
  const [filteredExhibitions, setFilteredExhibitions] = useState<TransformedExhibition[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'ongoing' | 'upcoming' | 'ended'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);

  // Helper function to determine exhibition status
  const determineStatus = (startDate: string, endDate: string): 'ongoing' | 'upcoming' | 'ended' => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (now < start) return 'upcoming';
    if (now > end) return 'ended';
    return 'ongoing';
  };

  // Helper function to extract title from description
  const extractTitle = (description: string, venue: string): string => {
    if (!description) return `${venue} 전시`;
    
    // Extract title from brackets
    const bracketMatch = description.match(/《([^》]+)》|<([^>]+)>|「([^」]+)」|『([^』]+)』/);
    if (bracketMatch) {
      const title = (bracketMatch[1] || bracketMatch[2] || bracketMatch[3] || bracketMatch[4])?.trim();
      if (title && title.length >= 2 && title.length <= 60) {
        return title;
      }
    }
    
    // Fallback
    return `${venue} 전시`;
  };

  const fetchExhibitions = async (isRetry = false) => {
    try {
      setLoading(true);
      setError(null);
      if (isRetry) setRetrying(true);

      // Check cache first (2 minutes)
      const cacheKey = 'exhibitions-supabase-cache';
      const cached = localStorage.getItem(cacheKey);
      if (cached && !isRetry) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < 120000) { // 2 minute cache
          console.log('📦 Using cached exhibitions data');
          setExhibitions(data);
          setFilteredExhibitions(data);
          setLoading(false);
          return;
        }
      }

      console.log('🚀 Fetching exhibitions directly from Supabase...');
      const startTime = Date.now();
      
      const supabase = createClient();
      const { data: rawExhibitions, error: supabaseError } = await supabase
        .from('exhibitions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      const duration = Date.now() - startTime;
      console.log(`⏱️ Supabase query took ${duration}ms`);

      if (supabaseError) {
        throw new Error(`Supabase error: ${supabaseError.message}`);
      }

      // Transform data
      const transformedData = (rawExhibitions || []).map((ex: Exhibition): TransformedExhibition => ({
        id: ex.id,
        title: extractTitle(ex.description || '', ex.venue_name || '미지의 장소'),
        venue: ex.venue_name || '미지의 장소',
        location: ex.venue_city || '서울',
        startDate: ex.start_date,
        endDate: ex.end_date,
        description: ex.description,
        image: ex.image_url,
        category: ex.category || '미술',
        price: ex.price || (typeof ex.admission_fee === 'number' ? `${ex.admission_fee.toLocaleString()}원` : '정보 없음'),
        status: determineStatus(ex.start_date, ex.end_date),
        viewCount: ex.view_count || 0,
        likeCount: ex.like_count || 0,
        featured: ex.featured || false
      }));

      console.log('✅ Successfully loaded', transformedData.length, 'exhibitions');
      
      setExhibitions(transformedData);
      setFilteredExhibitions(transformedData);

      // Cache the data
      localStorage.setItem(cacheKey, JSON.stringify({
        data: transformedData,
        timestamp: Date.now()
      }));

    } catch (err) {
      console.error('❌ Error fetching exhibitions:', err);
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다');
      
      // Try to use cached data as fallback
      try {
        const cached = localStorage.getItem('exhibitions-supabase-cache');
        if (cached) {
          const { data } = JSON.parse(cached);
          console.log('📦 Using cached data as fallback');
          setExhibitions(data);
          setFilteredExhibitions(data);
          setError('캐시된 데이터를 사용 중입니다');
        }
      } catch {
        // Cache fallback failed
      }
    } finally {
      setLoading(false);
      if (isRetry) setRetrying(false);
    }
  };

  useEffect(() => {
    fetchExhibitions();
  }, []);

  // Filter exhibitions
  const applyFilters = useMemo(() => {
    let filtered = [...exhibitions];

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(ex => ex.status === selectedStatus);
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(ex => ex.category === selectedCategory);
    }

    // City filter
    if (selectedCity !== 'all') {
      filtered = filtered.filter(ex => ex.location === selectedCity);
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(ex => 
        ex.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort by status priority (ongoing > upcoming > ended)
    filtered.sort((a, b) => {
      const statusOrder = { ongoing: 0, upcoming: 1, ended: 2 };
      return statusOrder[a.status] - statusOrder[b.status];
    });

    return filtered;
  }, [exhibitions, selectedStatus, selectedCategory, selectedCity, searchQuery]);

  useEffect(() => {
    setFilteredExhibitions(applyFilters);
  }, [applyFilters]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ongoing':
        return <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full">진행중</span>;
      case 'upcoming':
        return <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full">예정</span>;
      case 'ended':
        return <span className="px-2 py-1 bg-gray-500/20 text-gray-300 text-xs rounded-full">종료</span>;
      default:
        return null;
    }
  };

  const categories = ['all', '회화', '현대미술', '미디어아트', '전통미술', '조각', '사진'];
  const cities = ['all', ...new Set(exhibitions.map(ex => ex.location).filter(Boolean).sort())];

  const stats = {
    ongoing: exhibitions.filter(ex => ex.status === 'ongoing').length,
    upcoming: exhibitions.filter(ex => ex.status === 'upcoming').length,
    thisWeek: exhibitions.filter(ex => ex.status === 'ongoing').length,
    nearby: exhibitions.filter(ex => ex.location === '서울').length
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-3 border-purple-200 border-t-purple-600 mx-auto mb-6"></div>
          <p className="text-white text-lg font-medium mb-2">전시 정보를 불러오는 중...</p>
          <p className="text-gray-300 text-sm">Supabase에서 직접 데이터를 가져오고 있습니다</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Error Banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 bg-yellow-900/30 border border-yellow-600/50 rounded-lg p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-200 text-sm">{error}</span>
          </div>
          <button
            onClick={() => fetchExhibitions(true)}
            disabled={retrying}
            className="px-3 py-1 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-200 rounded text-xs transition-colors disabled:opacity-50"
          >
            {retrying ? '재시도 중...' : '재시도'}
          </button>
        </motion.div>
      )}

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6"
      >
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-bold text-white">{stats.ongoing}</p>
              <p className="text-xs text-gray-300">진행중인 전시</p>
            </div>
            <Eye className="w-6 h-6 text-purple-400 opacity-50" />
          </div>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-bold text-white">{stats.upcoming}</p>
              <p className="text-xs text-gray-300">예정된 전시</p>
            </div>
            <Calendar className="w-6 h-6 text-blue-400 opacity-50" />
          </div>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-bold text-white">{stats.thisWeek}</p>
              <p className="text-xs text-gray-300">이번 주 추천</p>
            </div>
            <Star className="w-6 h-6 text-amber-400 opacity-50" />
          </div>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-bold text-white">{stats.nearby}</p>
              <p className="text-xs text-gray-300">서울 지역</p>
            </div>
            <MapPin className="w-6 h-6 text-green-400 opacity-50" />
          </div>
        </div>
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6 space-y-3"
      >
        {/* Search Bar */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-300" />
            <input
              type="text"
              placeholder="전시명, 미술관으로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white text-sm placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-3 rounded-lg transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-800/50 text-gray-300 hover:text-white'
              }`}
            >
              <Grid3x3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-3 rounded-lg transition-colors ${
                viewMode === 'list' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-800/50 text-gray-300 hover:text-white'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <div className="flex gap-2">
              {(['all', 'ongoing', 'upcoming', 'ended'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                    selectedStatus === status
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800/60 text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  {status === 'all' && '전체'}
                  {status === 'ongoing' && '진행중'}
                  {status === 'upcoming' && '예정'}
                  {status === 'ended' && '종료'}
                </button>
              ))}
            </div>
          </div>

          {/* City Filter */}
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="px-3 py-1.5 rounded-lg text-xs bg-gray-800/60 text-gray-300 border border-gray-600 focus:outline-none focus:border-purple-500"
            >
              {cities.map(city => (
                <option key={city} value={city}>
                  {city === 'all' ? '전체 지역' : city}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 flex-1">
            <Filter className="w-4 h-4 text-gray-400" />
            <div className="flex gap-2 overflow-x-auto">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all ${
                    selectedCategory === category
                      ? 'bg-amber-500 text-white'
                      : 'bg-gray-800/40 text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  {category === 'all' ? '전체' : category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Exhibition List */}
      <AnimatePresence mode="wait">
        {viewMode === 'grid' && (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredExhibitions.map((exhibition, index) => (
              <motion.div
                key={exhibition.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700 hover:border-purple-500 transition-all duration-300 cursor-pointer group"
                onClick={() => router.push(`/exhibitions/${exhibition.id}`)}
              >
                <div className="h-24 bg-gradient-to-br from-slate-700/60 to-slate-800/60 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <TrendingUp className="w-10 h-10 text-white/40" />
                  </div>
                  <div className="absolute top-3 right-3">
                    {getStatusBadge(exhibition.status)}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-white mb-1 group-hover:text-purple-300 transition-colors line-clamp-1">
                    {exhibition.title}
                  </h3>
                  <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                    {exhibition.description || exhibition.venue}
                  </p>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-gray-300">
                      <MapPin className="w-3 h-3" />
                      <span>{exhibition.venue}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {new Date(exhibition.startDate).toLocaleDateString('ko-KR')} - 
                        {new Date(exhibition.endDate).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                    {exhibition.price && (
                      <div className="flex items-center gap-2 text-gray-300">
                        <Ticket className="w-3 h-3" />
                        <span>{exhibition.price}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
                    <div className="flex items-center gap-3 text-xs text-gray-300">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {exhibition.viewCount?.toLocaleString() || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {exhibition.likeCount?.toLocaleString() || 0}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-purple-300 transition-colors" />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* No Results */}
      {filteredExhibitions.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-300 text-lg mb-2">검색 결과가 없습니다</p>
          <p className="text-gray-500 text-sm">다른 검색어나 필터를 시도해보세요</p>
        </motion.div>
      )}
    </>
  );
}