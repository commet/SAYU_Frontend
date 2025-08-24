'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useActivityTracker } from '@/hooks/useActivityTracker';
import toast from 'react-hot-toast';
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
  AlertCircle,
  Navigation,
  SlidersHorizontal,
  Info,
  X,
  Upload,
  Loader2
} from 'lucide-react';
import Image from 'next/image';
import FeedbackButton from '@/components/feedback/FeedbackButton';

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

// Skeleton loader component
const ExhibitionSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md animate-pulse">
    <div className="h-48 bg-gray-200 dark:bg-gray-700" />
    <div className="p-4 space-y-3">
      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
    </div>
  </div>
);

export default function ExhibitionsPageOptimized() {
  const router = useRouter();
  const { user } = useAuth();
  const { trackExhibitionView } = useActivityTracker();
  
  // State management
  const [exhibitions, setExhibitions] = useState<TransformedExhibition[]>([]);
  const [filteredExhibitions, setFilteredExhibitions] = useState<TransformedExhibition[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'ongoing' | 'upcoming' | 'ended'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [savedExhibitions, setSavedExhibitions] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  const ITEMS_PER_PAGE = 20;

  // Cache management
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Handle exhibition click with activity tracking
  const handleExhibitionClick = useCallback((exhibition: TransformedExhibition) => {
    if (user) {
      trackExhibitionView({
        id: exhibition.id,
        title: exhibition.title,
        venue: exhibition.venue,
        image: exhibition.image
      });
    }
    router.push(`/exhibitions/${exhibition.id}`);
  }, [user, trackExhibitionView, router]);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Optimized fetch function with caching
  const fetchExhibitions = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    try {
      // Check cache for first page
      if (pageNum === 1 && !append && exhibitions.length > 0) {
        const now = Date.now();
        if (now - lastFetchTime < CACHE_DURATION) {
          console.log('Using cached data');
          setLoading(false);
          return;
        }
      }

      if (!append) setLoading(true);
      if (append) setLoadingMore(true);
      setError(null);

      // Calculate offset for pagination
      const offset = (pageNum - 1) * ITEMS_PER_PAGE;
      
      // Fetch from API route with pagination
      const response = await fetch(`/api/exhibitions?limit=${ITEMS_PER_PAGE}&offset=${offset}`, {
        signal: AbortSignal.timeout(8000) // 8 second timeout
      });

      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }

      const newExhibitions = result.data || result.exhibitions || [];
      
      if (append) {
        setExhibitions(prev => [...prev, ...newExhibitions]);
        setFilteredExhibitions(prev => [...prev, ...newExhibitions]);
      } else {
        setExhibitions(newExhibitions);
        setFilteredExhibitions(newExhibitions);
        setLastFetchTime(Date.now());
      }
      
      // Check if there are more items
      setHasMore(newExhibitions.length === ITEMS_PER_PAGE);
      
      console.log(`Loaded ${newExhibitions.length} exhibitions (page ${pageNum})`);
      
    } catch (err) {
      console.error('Error fetching exhibitions:', err);
      
      // Only show error for first page
      if (pageNum === 1) {
        setError('전시 정보를 불러오는 중 문제가 발생했습니다.');
        
        // Load minimal fallback data
        const fallbackData: TransformedExhibition[] = [
          {
            id: 'fallback-1',
            title: '이불: 1998년 이후',
            venue: '리움미술관',
            location: '서울',
            startDate: '2025-09-04',
            endDate: '2026-01-04',
            description: '한국 현대미술을 대표하는 이불 작가의 대규모 회고전',
            image: 'https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=800&h=600&fit=crop',
            category: '현대미술',
            price: '성인 20,000원',
            status: 'upcoming',
            viewCount: 156,
            likeCount: 42,
            featured: true
          }
        ];
        setExhibitions(fallbackData);
        setFilteredExhibitions(fallbackData);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [exhibitions.length, lastFetchTime]);

  // Fetch saved exhibitions
  const fetchSavedExhibitions = useCallback(async () => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/exhibitions/save');
      if (response.ok) {
        const { data } = await response.json();
        const savedIds = new Set(data.map((item: any) => item.exhibition_id));
        setSavedExhibitions(savedIds);
      }
    } catch (error) {
      console.error('Failed to fetch saved exhibitions:', error);
    }
  }, [user]);

  // Initial load
  useEffect(() => {
    fetchExhibitions(1);
    if (user) {
      fetchSavedExhibitions();
    }
  }, [user]); // Removed fetchExhibitions from dependencies to prevent loops

  // Load more on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop 
          >= document.documentElement.offsetHeight - 100) {
        if (!loadingMore && hasMore && !loading) {
          setPage(prev => prev + 1);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadingMore, hasMore, loading]);

  // Load more when page changes
  useEffect(() => {
    if (page > 1) {
      fetchExhibitions(page, true);
    }
  }, [page]); // Removed fetchExhibitions from dependencies

  // Filter exhibitions
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
    
    // City filter
    if (selectedCity !== 'all') {
      filtered = filtered.filter(ex => ex.location === selectedCity);
    }
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(ex => 
        ex.title.toLowerCase().includes(query) ||
        ex.venue.toLowerCase().includes(query) ||
        ex.description?.toLowerCase().includes(query)
      );
    }
    
    setFilteredExhibitions(filtered);
  }, [exhibitions, selectedStatus, selectedCategory, selectedCity, searchQuery]);

  // Extract unique categories and cities
  const categories = useMemo(() => {
    const cats = new Set(exhibitions.map(ex => ex.category).filter(Boolean));
    return Array.from(cats);
  }, [exhibitions]);

  const cities = useMemo(() => {
    const locs = new Set(exhibitions.map(ex => ex.location).filter(Boolean));
    return Array.from(locs);
  }, [exhibitions]);

  // Stats calculation
  const stats = useMemo(() => ({
    ongoing: exhibitions.filter(ex => ex.status === 'ongoing').length,
    upcoming: exhibitions.filter(ex => ex.status === 'upcoming').length,
    ended: exhibitions.filter(ex => ex.status === 'ended').length,
    total: exhibitions.length
  }), [exhibitions]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                전시회 탐색
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                현재 {stats.ongoing}개의 전시가 진행 중입니다
              </p>
            </div>
            
            {/* View mode toggle */}
            <div className="hidden sm:flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-purple-100 text-purple-600' : 'text-gray-500'}`}
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-purple-100 text-purple-600' : 'text-gray-500'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="전시회 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            
            {/* Filter buttons */}
            <div className="flex gap-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as any)}
                className="px-4 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">모든 상태</option>
                <option value="ongoing">진행중</option>
                <option value="upcoming">예정</option>
                <option value="ended">종료</option>
              </select>
              
              {categories.length > 0 && (
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">모든 분야</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && exhibitions.length === 0 ? (
          // Initial loading state
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <ExhibitionSkeleton key={i} />
            ))}
          </div>
        ) : error && exhibitions.length === 0 ? (
          // Error state
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">{error}</p>
            <button
              onClick={() => fetchExhibitions(1)}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              다시 시도
            </button>
          </div>
        ) : filteredExhibitions.length === 0 ? (
          // No results state
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">검색 결과가 없습니다</p>
          </div>
        ) : (
          <>
            {/* Exhibition grid */}
            <div className={`
              ${viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
                : 'space-y-4'}
            `}>
              {filteredExhibitions.map((exhibition) => (
                <motion.div
                  key={exhibition.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => handleExhibitionClick(exhibition)}
                  className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow cursor-pointer"
                >
                  {/* Exhibition card content */}
                  {exhibition.image && (
                    <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
                      <Image
                        src={exhibition.image}
                        alt={exhibition.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      />
                      {exhibition.featured && (
                        <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs">
                          추천
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {exhibition.title}
                    </h3>
                    
                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{exhibition.venue}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(exhibition.startDate).toLocaleDateString('ko-KR')} ~ 
                          {new Date(exhibition.endDate).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                      
                      {exhibition.price && (
                        <div className="flex items-center gap-2">
                          <Ticket className="w-4 h-4" />
                          <span>{exhibition.price}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Status badge */}
                    <div className="mt-3">
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        exhibition.status === 'ongoing' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : exhibition.status === 'upcoming'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {exhibition.status === 'ongoing' ? '진행중' : 
                         exhibition.status === 'upcoming' ? '예정' : '종료'}
                      </span>
                    </div>
                    
                    {/* Stats */}
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>{exhibition.viewCount || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        <span>{exhibition.likeCount || 0}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Load more indicator */}
            {loadingMore && (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
              </div>
            )}
            
            {!hasMore && exhibitions.length > ITEMS_PER_PAGE && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                모든 전시를 불러왔습니다
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Feedback button */}
      <FeedbackButton
        position="fixed"
        variant="primary"
        contextData={{
          page: 'exhibitions',
          feature: 'exhibition-list'
        }}
      />
    </div>
  );
}