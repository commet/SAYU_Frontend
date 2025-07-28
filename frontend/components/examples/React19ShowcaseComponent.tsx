'use client';

import { Suspense, useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Heart, Share2, Eye } from 'lucide-react';
import { 
  useOptimizedSearch,
  useSmoothTabs,
  useOptimisticList,
  useDeferredSearch,
  useOptimisticMutation
} from '@/hooks/useReact19Optimizations';

interface Artwork {
  id: string;
  title: string;
  artist: string;
  year: string;
  imageUrl: string;
  style: string;
  likes: number;
  isLiked: boolean;
}

// Mock API functions
const searchArtworks = async (query: string): Promise<Artwork[]> => {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  
  const mockArtworks: Artwork[] = [
    {
      id: '1',
      title: 'Starry Night',
      artist: 'Vincent van Gogh',
      year: '1889',
      imageUrl: '/api/placeholder/300/400',
      style: 'Post-Impressionism',
      likes: 2453,
      isLiked: false
    },
    {
      id: '2',
      title: 'The Great Wave',
      artist: 'Katsushika Hokusai',
      year: '1831',
      imageUrl: '/api/placeholder/300/400',
      style: 'Ukiyo-e',
      likes: 1876,
      isLiked: true
    },
    // More mock data...
  ];
  
  return mockArtworks.filter(artwork => 
    artwork.title.toLowerCase().includes(query.toLowerCase()) ||
    artwork.artist.toLowerCase().includes(query.toLowerCase())
  );
};

const likeArtwork = async (artworkId: string): Promise<{ likes: number; isLiked: boolean }> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return { likes: Math.floor(Math.random() * 1000) + 100, isLiked: true };
};

// 개별 작품 카드 컴포넌트
function ArtworkCard({ artwork, onLike }: { 
  artwork: Artwork; 
  onLike: (id: string) => void; 
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -5 }}
      className="bg-card rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
    >
      {/* 작품 이미지 */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={artwork.imageUrl}
          alt={artwork.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
        
        {/* 호버 오버레이 */}
        <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="flex gap-4">
            <button
              onClick={() => onLike(artwork.id)}
              className={`p-3 rounded-full backdrop-blur-sm transition-all ${
                artwork.isLiked 
                  ? 'bg-red-500 text-white' 
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <Heart className={`w-5 h-5 ${artwork.isLiked ? 'fill-current' : ''}`} />
            </button>
            
            <button className="p-3 bg-white/20 text-white rounded-full backdrop-blur-sm hover:bg-white/30 transition-all">
              <Share2 className="w-5 h-5" />
            </button>
            
            <button className="p-3 bg-white/20 text-white rounded-full backdrop-blur-sm hover:bg-white/30 transition-all">
              <Eye className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      
      {/* 작품 정보 */}
      <div className="p-4">
        <h3 className="font-display font-semibold text-lg line-clamp-2 mb-2">
          {artwork.title}
        </h3>
        <p className="text-muted-foreground font-medium mb-2">
          {artwork.artist}
        </p>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{artwork.year}</span>
          <span className="text-primary font-medium">{artwork.style}</span>
        </div>
        
        {/* 좋아요 정보 */}
        <div className="mt-3 pt-3 border-t border-border flex items-center gap-2">
          <Heart className={`w-4 h-4 ${artwork.isLiked ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
          <span className="text-sm text-muted-foreground">
            {artwork.likes.toLocaleString()} likes
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// 검색 필터 컴포넌트
function SearchFilters({ 
  filters, 
  onFilterChange 
}: { 
  filters: any; 
  onFilterChange: (filters: any) => void; 
}) {
  const [isPending, startTransition] = useTransition();

  const handleFilterChange = (key: string, value: any) => {
    startTransition(() => {
      onFilterChange({ ...filters, [key]: value });
    });
  };

  return (
    <div className={`flex flex-wrap gap-4 transition-opacity ${isPending ? 'opacity-50' : ''}`}>
      <select
        value={filters.style}
        onChange={(e) => handleFilterChange('style', e.target.value)}
        className="px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
      >
        <option value="">All Styles</option>
        <option value="impressionism">Impressionism</option>
        <option value="baroque">Baroque</option>
        <option value="renaissance">Renaissance</option>
        <option value="modern">Modern</option>
      </select>
      
      <select
        value={filters.period}
        onChange={(e) => handleFilterChange('period', e.target.value)}
        className="px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
      >
        <option value="">All Periods</option>
        <option value="19th">19th Century</option>
        <option value="20th">20th Century</option>
        <option value="contemporary">Contemporary</option>
      </select>
      
      <button
        onClick={() => handleFilterChange('liked', !filters.liked)}
        className={`px-4 py-2 rounded-lg border transition-all ${
          filters.liked 
            ? 'bg-red-500 text-white border-red-500' 
            : 'border-border hover:bg-accent'
        }`}
      >
        <Heart className={`w-4 h-4 inline mr-2 ${filters.liked ? 'fill-current' : ''}`} />
        Liked Only
      </button>
    </div>
  );
}

// 메인 React 19 쇼케이스 컴포넌트
export function React19ShowcaseComponent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ style: '', period: '', liked: false });
  
  // React 19 hooks 활용
  const { deferredQuery, isSearching } = useDeferredSearch(searchQuery);
  const { results, isPending: isSearchPending } = useOptimizedSearch(searchArtworks, []);
  const { activeTab, changeTab, isPending: isTabPending } = useSmoothTabs('gallery', ['gallery', 'favorites', 'recent']);
  const { optimisticList, updateItem } = useOptimisticList<Artwork>(results);
  
  // 좋아요 mutation
  const { mutate: likeMutation, isPending: isLiking } = useOptimisticMutation(
    (artworkId: string) => likeArtwork(artworkId),
    {
      optimisticUpdate: (artworkId: string) => ({ likes: 0, isLiked: true }),
      onSuccess: (data, variables) => {
        const updatedArtwork = optimisticList.find(a => a.id === variables);
        if (updatedArtwork) {
          updateItem({
            ...updatedArtwork,
            likes: data.likes,
            isLiked: data.isLiked
          });
        }
      }
    }
  );

  const handleLike = (artworkId: string) => {
    // 낙관적 업데이트
    const artwork = optimisticList.find(a => a.id === artworkId);
    if (artwork) {
      updateItem({
        ...artwork,
        isLiked: !artwork.isLiked,
        likes: artwork.isLiked ? artwork.likes - 1 : artwork.likes + 1
      });
    }
    
    // 실제 API 호출
    likeMutation(artworkId);
  };

  const tabs = [
    { id: 'gallery', label: 'Gallery', count: optimisticList.length },
    { id: 'favorites', label: 'Favorites', count: optimisticList.filter(a => a.isLiked).length },
    { id: 'recent', label: 'Recent', count: 12 }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">
          React 19 Optimized Gallery
        </h1>
        <p className="text-muted-foreground text-lg">
          Showcasing Suspense, Transitions, Optimistic Updates, and Deferred Values
        </p>
      </div>

      {/* 검색 및 필터 */}
      <div className="mb-8 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search artworks or artists..."
            className="w-full pl-10 pr-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
        
        <SearchFilters filters={filters} onFilterChange={setFilters} />
      </div>

      {/* 탭 네비게이션 */}
      <div className="mb-8">
        <div className="flex border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => changeTab(tab.id as any)}
              disabled={isTabPending}
              className={`px-6 py-3 font-medium transition-all relative ${
                activeTab === tab.id
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              } ${isTabPending ? 'opacity-50' : ''}`}
            >
              {tab.label}
              <span className="ml-2 px-2 py-1 text-xs bg-accent rounded-full">
                {tab.count}
              </span>
              
              {isTabPending && activeTab === tab.id && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary/50"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 상태 표시 */}
      <div className="mb-6">
        {(isSearchPending || isSearching) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-muted-foreground"
          >
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            Searching for "{deferredQuery}"...
          </motion.div>
        )}
      </div>

      {/* 작품 그리드 */}
      <Suspense fallback={
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-card rounded-xl overflow-hidden shadow-lg animate-pulse">
              <div className="aspect-[3/4] bg-gray-200 dark:bg-gray-700" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      }>
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {optimisticList.map((artwork) => (
              <ArtworkCard
                key={artwork.id}
                artwork={artwork}
                onLike={handleLike}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      </Suspense>

      {/* 결과 없음 */}
      {optimisticList.length === 0 && !isSearchPending && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="text-6xl mb-4">🎨</div>
          <h3 className="text-xl font-semibold mb-2">No artworks found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search terms or filters
          </p>
        </motion.div>
      )}

      {/* 성능 지표 */}
      <div className="mt-12 p-6 bg-accent/50 rounded-xl">
        <h3 className="text-lg font-semibold mb-4">React 19 Performance Indicators</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${
              isSearchPending ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'
            }`} />
            <div>Search State</div>
          </div>
          
          <div className="text-center">
            <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${
              isTabPending ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'
            }`} />
            <div>Tab Transition</div>
          </div>
          
          <div className="text-center">
            <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${
              isLiking ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'
            }`} />
            <div>Optimistic Updates</div>
          </div>
          
          <div className="text-center">
            <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${
              isSearching ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'
            }`} />
            <div>Deferred Values</div>
          </div>
        </div>
      </div>
    </div>
  );
}