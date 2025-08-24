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
    <div className="p-6 space-y-4">
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
      </div>
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20" />
    </div>
  </div>
);

export default function ExhibitionsPage() {
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
  const [totalStats] = useState<{
    ongoing: number;
    upcoming: number;
    ended: number;
    total: number;
  }>({
    ongoing: 87,
    upcoming: 62,
    ended: 143,
    total: 292
  });
  
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
      
      // Note: Using hardcoded totalStats instead of API data
      
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
        
        // Using hardcoded totalStats
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [exhibitions.length, lastFetchTime]);

  // Fetch saved exhibitions
  const fetchSavedExhibitions = useCallback(async () => {
    // Load from localStorage first as immediate feedback
    const localSaved = localStorage.getItem('savedExhibitions');
    if (localSaved) {
      setSavedExhibitions(new Set(JSON.parse(localSaved)));
    }
    
    if (!user) return;
    
    try {
      const response = await fetch('/api/exhibitions/save');
      if (response.ok) {
        const result = await response.json();
        if (!result.localOnly && result.data) {
          const savedIds = new Set(result.data.map((item: any) => item.exhibition_id));
          setSavedExhibitions(savedIds);
          // Sync to localStorage as backup
          localStorage.setItem('savedExhibitions', JSON.stringify(Array.from(savedIds)));
        }
      }
    } catch (error) {
      console.error('Failed to fetch saved exhibitions:', error);
    }
  }, [user]);
  
  // Handle save/unsave exhibition
  const handleSaveExhibition = useCallback(async (exhibition: TransformedExhibition) => {
    const isSaved = savedExhibitions.has(exhibition.id);
    
    // Update UI immediately with localStorage
    if (isSaved) {
      setSavedExhibitions(prev => {
        const newSet = new Set(prev);
        newSet.delete(exhibition.id);
        // Update localStorage
        localStorage.setItem('savedExhibitions', JSON.stringify(Array.from(newSet)));
        return newSet;
      });
      toast.success('관심 전시에서 제거되었습니다');
    } else {
      setSavedExhibitions(prev => {
        const newSet = new Set(prev);
        newSet.add(exhibition.id);
        // Update localStorage
        localStorage.setItem('savedExhibitions', JSON.stringify(Array.from(newSet)));
        return newSet;
      });
      toast.success('관심 전시에 추가되었습니다');
    }
    
    // If user is logged in, try to sync to server (but don't block on it)
    if (user) {
      try {
        await fetch('/api/exhibitions/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            exhibitionId: exhibition.id,
            action: isSaved ? 'unsave' : 'save'
          })
        });
      } catch (error) {
        console.error('Failed to sync to server, but saved locally:', error);
      }
    }
  }, [user, savedExhibitions]);

  // Initial load
  useEffect(() => {
    fetchExhibitions(1);
    fetchSavedExhibitions(); // Always fetch (will use localStorage if no user)
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

  // Stats calculation - using hardcoded values
  const stats = totalStats;

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed relative"
      style={{ backgroundImage: "url('/images/backgrounds/family-viewing-corner-gallery-intimate.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
      <div className="relative z-10">
      {/* Header */}
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-sm border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                전시회 탐색
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                현재 <span className="font-semibold text-purple-600">{stats.ongoing}개</span>의 전시가 진행 중이고, <span className="font-semibold text-blue-600">{stats.upcoming}개</span>가 예정되어 있습니다
              </p>
            </div>
            
            {/* Right side buttons */}
            <div className="flex items-center gap-4">
              {/* Saved exhibitions button */}
              {user && (
                <button
                  onClick={() => router.push('/exhibitions/saved')}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Heart className="w-4 h-4" />
                  <span className="hidden sm:inline">관심 전시</span>
                  {savedExhibitions.size > 0 && (
                    <span className="ml-1 px-2 py-0.5 bg-purple-500 rounded-full text-xs">
                      {savedExhibitions.size}
                    </span>
                  )}
                </button>
              )}
              
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
      </div>

      {/* Filters */}
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-b dark:border-gray-700 sticky top-0 z-20">
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
                  {/* Exhibition card content - 패딩과 간격 줄임 */}
                  <div className="p-4">
                    {/* Header with featured badge and save button - 간격 줄임 */}
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        {exhibition.featured && (
                          <div className="inline-block bg-yellow-500 text-white px-2 py-0.5 rounded text-xs mb-1">
                            추천
                          </div>
                        )}
                      </div>
                      {/* Like/Save button - 패딩 줄임 */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveExhibition(exhibition);
                        }}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors group"
                      >
                        <Heart
                          className={`w-4 h-4 transition-colors ${
                            savedExhibitions.has(exhibition.id)
                              ? 'fill-red-500 text-red-500'
                              : 'text-gray-600 dark:text-gray-400 group-hover:text-red-500'
                          }`}
                        />
                      </button>
                    </div>
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
                    
                    {/* Status badge - 간격 줄임 */}
                    <div className="mt-2">
                      <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${
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
                    
                    {/* Stats - 간격 줄임 */}
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
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
    </div>
  );
}