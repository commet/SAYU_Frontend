'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useResponsive } from '@/lib/responsive';
import dynamic from 'next/dynamic';

// Lazy load mobile component
const MobileExhibitions = dynamic(() => import('@/components/mobile/MobileExhibitions'), {
  ssr: false
});
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
  Ticket 
} from 'lucide-react';

interface Exhibition {
  id: string;
  title: string;
  title_local?: string;
  subtitle?: string;
  venue: string;
  venue_city?: string;
  location: string;
  startDate: string;
  endDate: string;
  description?: string;
  image?: string;
  category?: string;
  price?: string;
  admission_fee?: number | string;
  status: 'ongoing' | 'upcoming' | 'ended';
  viewCount?: number;
  likeCount?: number;
  distance?: string;
  featured?: boolean;
}


export default function ExhibitionsPage() {
  const router = useRouter();
  const { isMobile } = useResponsive();
  
  // Render mobile component for mobile devices
  if (isMobile) {
    return <MobileExhibitions />;
  }
  
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [filteredExhibitions, setFilteredExhibitions] = useState<Exhibition[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'ongoing' | 'upcoming' | 'ended'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedFee, setSelectedFee] = useState<'all' | 'free' | 'paid'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [loading, setLoading] = useState(true);
  const [popularExhibitions, setPopularExhibitions] = useState<Exhibition[]>([]);

  useEffect(() => {
    const fetchExhibitions = async () => {
      try {
        setLoading(true);
        // Fetch from Supabase API
        const response = await fetch('/api/exhibitions?limit=100');
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('API failed:', errorData);
          setExhibitions([]);
          setFilteredExhibitions([]);
        } else {
          const result = await response.json();
          
          if (result.data) {
            console.log('Exhibition data fetched from Supabase:', result.data.length, 'exhibitions');
            setExhibitions(result.data);
            setFilteredExhibitions(result.data);
          } else if (result.exhibitions) {
            console.log('Exhibition data fetched from Supabase:', result.exhibitions.length, 'exhibitions');
            setExhibitions(result.exhibitions);
            setFilteredExhibitions(result.exhibitions);
          } else {
            console.log('No exhibition data found in response:', result);
            setExhibitions([]);
            setFilteredExhibitions([]);
          }
        }
      } catch (error) {
        console.error('Error fetching exhibitions:', error);
        setExhibitions([]);
        setFilteredExhibitions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchExhibitions();
  }, []);

  useEffect(() => {
    let filtered = [...exhibitions];

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(ex => ex.status === selectedStatus);
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(ex => ex.category === selectedCategory);
    }

    // Filter by city
    if (selectedCity !== 'all') {
      filtered = filtered.filter(ex => ex.venue_city === selectedCity);
    }

    // Filter by fee
    if (selectedFee !== 'all') {
      if (selectedFee === 'free') {
        filtered = filtered.filter(ex => 
          ex.admission_fee === 0 || 
          ex.price === '무료' ||
          (typeof ex.admission_fee === 'string' && ex.admission_fee.toLowerCase().includes('무료')) ||
          (typeof ex.price === 'string' && ex.price.toLowerCase().includes('무료'))
        );
      } else if (selectedFee === 'paid') {
        filtered = filtered.filter(ex => 
          (typeof ex.admission_fee === 'number' && ex.admission_fee > 0) ||
          (ex.price && !ex.price.includes('무료'))
        );
      }
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(ex => 
        ex.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ex.title_local && ex.title_local.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (ex.subtitle && ex.subtitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
        ex.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort by status priority (ongoing > upcoming > ended)
    filtered.sort((a, b) => {
      const statusOrder = { ongoing: 0, upcoming: 1, ended: 2 };
      return statusOrder[a.status] - statusOrder[b.status];
    });

    setFilteredExhibitions(filtered);
  }, [exhibitions, selectedStatus, selectedCategory, searchQuery]);


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
  const [cities, setCities] = useState<string[]>(['all']);

  // Extract unique cities from exhibitions
  useEffect(() => {
    const uniqueCities = ['all', ...new Set(exhibitions
      .filter(ex => ex.venue_city)
      .map(ex => ex.venue_city as string)
      .sort())];
    setCities(uniqueCities);
  }, [exhibitions]);

  // Handle like/unlike exhibition
  const handleLike = async (exhibitionId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent navigation when clicking like button
    
    try {
      const response = await fetch(`/api/exhibitions/${exhibitionId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Update local state with new like count from server
          setExhibitions(prev => prev.map(ex => 
            ex.id === exhibitionId 
              ? { ...ex, likeCount: result.data.likeCount }
              : ex
          ));
          setFilteredExhibitions(prev => prev.map(ex => 
            ex.id === exhibitionId 
              ? { ...ex, likeCount: result.data.likeCount }
              : ex
          ));
        }
      }
    } catch (error) {
      console.error('Failed to like exhibition:', error);
    }
  };

  // Get featured exhibition
  const featuredExhibition = exhibitions.find(ex => ex.featured && ex.status === 'ongoing');

  // Get stats with additional API calls
  const [stats, setStats] = useState({
    ongoing: 0,
    upcoming: 0,
    thisWeek: 0,
    nearby: 0
  });

  useEffect(() => {
    // Calculate stats when exhibitions data changes
    const ongoingCount = exhibitions.filter(ex => ex.status === 'ongoing').length;
    const upcomingCount = exhibitions.filter(ex => ex.status === 'upcoming').length;
    const thisWeekCount = exhibitions.filter(ex => ex.status === 'ongoing').length; // Simplified
    const nearbyCount = exhibitions.filter(ex => ex.distance && parseFloat(ex.distance) < 5).length;
    
    setStats({
      ongoing: ongoingCount,
      upcoming: upcomingCount,
      thisWeek: thisWeekCount,
      nearby: nearbyCount
    });

    // Fetch popular exhibitions
    fetch('/api/exhibitions/popular?limit=5')
      .then(res => res.json())
      .then(result => {
        if (result.success && result.data) {
          setPopularExhibitions(result.data);
        }
      })
      .catch(err => console.error('Failed to fetch popular exhibitions:', err));
  }, [exhibitions]);

  if (loading) {
    return (
      <div 
        className="min-h-screen bg-cover bg-center bg-fixed flex items-center justify-center relative"
        style={{ backgroundImage: 'url(/images/backgrounds/family-viewing-corner-gallery-intimate.jpg)' }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-gray-400 mx-auto mb-4"></div>
          <p className="text-white text-sm">전시 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed relative"
      style={{ backgroundImage: 'url(/images/backgrounds/family-viewing-corner-gallery-intimate.jpg)' }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
      {/* Header */}
      <div className="relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">
              전시 탐험
            </h1>
            <p className="text-white text-lg max-w-2xl mx-auto drop-shadow-md">
              당신의 취향에 맞는 전시를 발견하고,<br />
              새로운 예술 경험을 시작하세요
            </p>
          </motion.div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
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
                <p className="text-xs text-gray-300">5km 이내</p>
              </div>
              <MapPin className="w-6 h-6 text-green-400 opacity-50" />
            </div>
          </div>
        </motion.div>

        {/* Featured Exhibition */}
        {featuredExhibition && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              주목할 전시
            </h2>
            <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 backdrop-blur-sm rounded-2xl overflow-hidden border border-purple-500/20">
              <div className="md:flex">
                <div className="md:w-2/5 h-48 md:h-auto relative bg-gradient-to-br from-purple-900/40 to-pink-900/40">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <TrendingUp className="w-16 h-16 text-white/30" />
                  </div>
                </div>
                <div className="md:w-3/5 p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">{featuredExhibition.title}</h3>
                      <p className="text-gray-300 mb-4">{featuredExhibition.description}</p>
                    </div>
                    {getStatusBadge(featuredExhibition.status)}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-300">장소</p>
                      <p className="text-sm text-white font-medium">{featuredExhibition.venue}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-300">기간</p>
                      <p className="text-sm text-white font-medium">
                        {new Date(featuredExhibition.endDate).toLocaleDateString('ko-KR')}까지
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-300">관람료</p>
                      <p className="text-sm text-white font-medium">{featuredExhibition.price}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-300">거리</p>
                      <p className="text-sm text-white font-medium">{featuredExhibition.distance}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
                      상세 정보
                    </button>
                    <button 
                      onClick={(e) => handleLike(featuredExhibition.id, e)}
                      className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <Heart className="w-5 h-5 text-white" />
                    </button>
                    <div className="flex items-center gap-4 ml-auto text-sm text-gray-300">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {featuredExhibition.viewCount?.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {featuredExhibition.likeCount?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-4 space-y-3"
        >
          {/* Search Bar */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-300" />
              <input
                type="text"
                placeholder="전시명, 미술관, 작가로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white text-sm placeholder-gray-400 placeholder:text-xs focus:outline-none focus:border-purple-500 transition-colors"
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
              <button
                onClick={() => setViewMode('map')}
                className={`p-3 rounded-lg transition-colors ${
                  viewMode === 'map' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-800/50 text-gray-300 hover:text-white'
                }`}
              >
                <Map className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filter Buttons - Responsive Layout */}
          <div className="flex flex-col md:flex-row md:flex-wrap md:items-center gap-2 md:gap-6">
            {/* Status Filter - Pills Style */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-300 flex items-center gap-1">
                <Clock className="w-4 h-4" />
                상태:
              </span>
              <div className="flex gap-2">
                {(['all', 'ongoing', 'upcoming', 'ended'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`px-3 py-1.5 rounded-full text-xs transition-all duration-200 ${
                      selectedStatus === status
                        ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-600/30'
                        : 'bg-gray-800/60 text-gray-300 hover:text-white hover:bg-gray-700/70 border border-gray-600/50 hover:border-purple-400/50'
                    }`}
                  >
                    {status === 'all' && '전체'}
                    {status === 'ongoing' && '진행'}
                    {status === 'upcoming' && '예정'}
                    {status === 'ended' && '종료'}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Divider - Hidden on mobile */}
            <div className="hidden md:block w-px h-6 bg-gray-600"></div>
            
            {/* City Filter */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-300 flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                지역:
              </span>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="px-3 py-1.5 rounded-lg text-xs bg-gray-800/60 text-gray-300 hover:text-white hover:bg-gray-700/70 border border-gray-600/50 hover:border-purple-400/50 focus:outline-none focus:border-purple-500 transition-colors"
              >
                {cities.map(city => (
                  <option key={city} value={city}>
                    {city === 'all' ? '전체' : city}
                  </option>
                ))}
              </select>
            </div>

            {/* Fee Filter */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-300 flex items-center gap-1">
                <Ticket className="w-4 h-4" />
                입장료:
              </span>
              <div className="flex gap-2">
                {(['all', 'free', 'paid'] as const).map((fee) => (
                  <button
                    key={fee}
                    onClick={() => setSelectedFee(fee)}
                    className={`px-3 py-1.5 rounded-full text-xs transition-all duration-200 ${
                      selectedFee === fee
                        ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg shadow-green-600/30'
                        : 'bg-gray-800/60 text-gray-300 hover:text-white hover:bg-gray-700/70 border border-gray-600/50 hover:border-green-400/50'
                    }`}
                  >
                    {fee === 'all' && '전체'}
                    {fee === 'free' && '무료'}
                    {fee === 'paid' && '유료'}
                  </button>
                ))}
              </div>
            </div>

            {/* Divider - Hidden on mobile */}
            <div className="hidden md:block w-px h-6 bg-gray-600"></div>
            
            {/* Category Filter - Tag Style */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="text-sm font-medium text-gray-300 flex items-center gap-1 flex-shrink-0">
                <Filter className="w-4 h-4" />
                분야:
              </span>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-2.5 py-1 rounded-2xl text-xs transition-all duration-200 whitespace-nowrap border ${
                      selectedCategory === category
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-400 shadow-md'
                        : 'bg-gray-800/40 text-gray-300 hover:text-white hover:bg-gray-700/60 border-gray-600/40 hover:border-amber-400/60'
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
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-white mb-1 group-hover:text-purple-300 transition-colors line-clamp-1">
                      {exhibition.title_local || exhibition.title}
                    </h3>
                    {exhibition.subtitle && (
                      <p className="text-xs text-gray-400 mb-2 line-clamp-1">
                        {exhibition.subtitle}
                      </p>
                    )}
                    <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                      {exhibition.description || exhibition.venue}
                    </p>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-gray-300">
                        <MapPin className="w-3 h-3" />
                        <span>{exhibition.venue}</span>
                        {exhibition.distance && (
                          <span className="text-purple-300">· {exhibition.distance}</span>
                        )}
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

          {viewMode === 'list' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {filteredExhibitions.map((exhibition, index) => (
                <motion.div
                  key={exhibition.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-gray-700 hover:border-purple-500 transition-all duration-300 cursor-pointer group"
                  onClick={() => router.push(`/exhibitions/${exhibition.id}`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-2">
                        {getStatusBadge(exhibition.status)}
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors line-clamp-1">
                            {exhibition.title_local || exhibition.title}
                          </h3>
                          {exhibition.subtitle && (
                            <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                              {exhibition.subtitle}
                            </p>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                        {exhibition.description || exhibition.venue}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {exhibition.venue}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(exhibition.endDate).toLocaleDateString('ko-KR')}까지
                        </span>
                        {exhibition.price && (
                          <span className="flex items-center gap-1">
                            <Ticket className="w-4 h-4" />
                            {exhibition.price}
                          </span>
                        )}
                        {exhibition.distance && (
                          <span className="text-purple-300">{exhibition.distance}</span>
                        )}
                        <span className="flex items-center gap-3 ml-auto">
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {exhibition.viewCount?.toLocaleString() || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            {exhibition.likeCount?.toLocaleString() || 0}
                          </span>
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-purple-300 transition-colors ml-4 flex-shrink-0 mt-1" />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {viewMode === 'map' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-8 h-[600px] flex items-center justify-center"
            >
              <div className="text-center">
                <Map className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-300 text-lg mb-2">지도 뷰는 준비 중입니다</p>
                <p className="text-gray-500 text-sm">곧 주변 전시를 지도에서 확인할 수 있어요</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* No Results */}
        {filteredExhibitions.length === 0 && (
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
      </div>
    </div>
  );
}