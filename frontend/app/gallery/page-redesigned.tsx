'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Palette, 
  Search, 
  Loader2, 
  ArrowLeft, 
  Shuffle, 
  Filter,
  LayoutGrid,
  List,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { galleryApi, Artwork } from '@/lib/gallery-api';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

// 새로운 컴포넌트들
import { SayuBeamsBackground } from '@/components/ui/sayu-beams-background';
import { SayuGalleryGrid } from '@/components/ui/sayu-gallery-grid';
import { Gallery4 } from '@/components/ui/gallery4';
import { sayuColors, typography, spacing } from '@/styles/design-system';

// Feature 108 스타일의 카테고리 필터
import { cn } from '@/lib/utils';

const ART_CATEGORIES = [
  { id: 'all', name: '전체', icon: Sparkles },
  { id: 'paintings', name: '회화', metDepartment: 11 },
  { id: 'sculpture', name: '조각', metDepartment: 12 },
  { id: 'photography', name: '사진', metDepartment: 12 },
  { id: 'asian-art', name: '동양미술', metDepartment: 6 },
  { id: 'modern', name: '현대미술', metDepartment: 21 },
  { id: 'contemporary', name: '컨템포러리', metDepartment: 21 }
];

// Floating Dock 컴포넌트
function FloatingDock({ 
  onShuffle, 
  onFilter, 
  onLayoutChange, 
  currentLayout 
}: {
  onShuffle: () => void;
  onFilter: () => void;
  onLayoutChange: (layout: 'masonry' | 'grid' | 'list') => void;
  currentLayout: 'masonry' | 'grid' | 'list';
}) {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5, type: "spring", damping: 25 }}
      className="fixed bottom-8 right-8 z-50"
    >
      <div className="flex items-center gap-2 p-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-full shadow-lg border border-gray-200 dark:border-gray-700">
        <Button
          size="icon"
          variant="ghost"
          className="rounded-full"
          onClick={onShuffle}
        >
          <Shuffle className="w-4 h-4" />
        </Button>
        
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />
        
        <Button
          size="icon"
          variant="ghost"
          className="rounded-full"
          onClick={onFilter}
        >
          <Filter className="w-4 h-4" />
        </Button>
        
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />
        
        <div className="flex gap-1">
          <Button
            size="icon"
            variant={currentLayout === 'masonry' ? 'default' : 'ghost'}
            className="rounded-full h-8 w-8"
            onClick={() => onLayoutChange('masonry')}
          >
            <LayoutGrid className="w-3 h-3" />
          </Button>
          <Button
            size="icon"
            variant={currentLayout === 'grid' ? 'default' : 'ghost'}
            className="rounded-full h-8 w-8"
            onClick={() => onLayoutChange('grid')}
          >
            <Palette className="w-3 h-3" />
          </Button>
          <Button
            size="icon"
            variant={currentLayout === 'list' ? 'default' : 'ghost'}
            className="rounded-full h-8 w-8"
            onClick={() => onLayoutChange('list')}
          >
            <List className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// Feature 108 스타일 카테고리 필터
function CategoryFilter({ 
  selected, 
  onChange 
}: {
  selected: string;
  onChange: (category: string) => void;
}) {
  return (
    <div className="w-full overflow-x-auto pb-2 -mx-4 px-4">
      <div className="flex gap-2 min-w-max">
        {ART_CATEGORIES.map((category) => {
          const Icon = category.icon;
          const isSelected = selected === category.id;
          
          return (
            <motion.button
              key={category.id}
              onClick={() => onChange(category.id)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                "flex items-center gap-2 whitespace-nowrap",
                isSelected
                  ? "bg-purple-600 text-white shadow-md scale-105"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              )}
              whileHover={{ scale: isSelected ? 1.05 : 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {Icon && <Icon className="w-4 h-4" />}
              {category.name}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function GalleryPageRedesigned() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { language } = useLanguage();
  
  // State
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [recommendedArtworks, setRecommendedArtworks] = useState<Artwork[]>([]);
  const [loading_artworks, setLoadingArtworks] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [layout, setLayout] = useState<'masonry' | 'grid' | 'list'>('masonry');
  const [likedArtworks, setLikedArtworks] = useState<Set<string>>(new Set());
  
  // 사용자 프로필 기반 테마
  const userAptType = user?.profile?.typeCode || 'INFP_호랑이';

  // 데이터 로딩
  useEffect(() => {
    loadArtworks();
    loadRecommendations();
  }, [selectedCategory]);

  const loadArtworks = async () => {
    setLoadingArtworks(true);
    try {
      // 실제 API 호출 로직
      // const data = await galleryApi.getArtworks(selectedCategory);
      // setArtworks(data);
      
      // 임시 데이터
      setArtworks(Array(20).fill(null).map((_, i) => ({
        id: `artwork-${i}`,
        title: `작품 제목 ${i + 1}`,
        artist: `작가명 ${i + 1}`,
        year: `202${i % 5}`,
        imageUrl: `https://picsum.photos/400/${300 + (i % 4) * 50}?random=${i}`,
        museum: '메트로폴리탄 미술관',
        isLiked: Math.random() > 0.7,
        isArchived: Math.random() > 0.8,
        viewCount: Math.floor(Math.random() * 1000),
        perceptionCount: Math.floor(Math.random() * 50),
        tags: ['인상주의', '풍경화', '19세기'].slice(0, Math.floor(Math.random() * 3) + 1)
      })));
    } catch (error) {
      console.error('Failed to load artworks:', error);
      toast.error('작품을 불러오는데 실패했습니다');
    } finally {
      setLoadingArtworks(false);
    }
  };

  const loadRecommendations = async () => {
    // APT 기반 추천 작품 로드
    setRecommendedArtworks(Array(5).fill(null).map((_, i) => ({
      id: `rec-${i}`,
      title: `추천 작품 ${i + 1}`,
      description: 'APT 기반으로 선별된 작품입니다',
      href: '#',
      image: `https://picsum.photos/600/400?random=rec${i}`
    })));
  };

  const handleShuffle = () => {
    const shuffled = [...artworks].sort(() => Math.random() - 0.5);
    setArtworks(shuffled);
    toast.success('갤러리가 새롭게 정렬되었습니다!');
  };

  const handleFilter = () => {
    // 필터 모달 열기
    toast('고급 필터 기능 준비 중입니다');
  };

  const handleLike = async (artworkId: string) => {
    const newLiked = new Set(likedArtworks);
    if (newLiked.has(artworkId)) {
      newLiked.delete(artworkId);
      toast.success('좋아요 취소');
    } else {
      newLiked.add(artworkId);
      toast.success('좋아요!');
    }
    setLikedArtworks(newLiked);
  };

  const handlePerceptionClick = (artwork: Artwork) => {
    router.push(`/perception-exchange?artwork=${artwork.id}`);
  };

  const filteredArtworks = artworks.filter(artwork => {
    const matchesSearch = 
      artwork.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artwork.artist.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <SayuBeamsBackground 
      intensity="subtle" 
      colorScheme="apt" 
      aptType={userAptType}
      className="min-h-screen"
    >
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700"
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="rounded-full"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              
              <div>
                <h1 className="text-2xl font-bold" style={{ fontFamily: typography.fontFamily.heading }}>
                  {language === 'ko' ? '아트 갤러리' : 'Art Gallery'}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {userAptType} 님을 위한 맞춤 큐레이션
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder={language === 'ko' ? '작품, 작가 검색...' : 'Search artworks, artists...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64 rounded-full"
                />
              </div>
              
              <Badge variant="secondary" className="rounded-full">
                <Sparkles className="w-3 h-3 mr-1" />
                {filteredArtworks.length}개 작품
              </Badge>
            </div>
          </div>

          {/* Category Filter */}
          <CategoryFilter 
            selected={selectedCategory} 
            onChange={setSelectedCategory} 
          />
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 3D Carousel - 추천 섹션 */}
        {recommendedArtworks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold mb-1">
                  {userAptType} 님을 위한 추천
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  성격 유형과 취향을 분석한 맞춤 추천입니다
                </p>
              </div>
              <Button variant="ghost" size="sm" className="rounded-full">
                더보기 <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            
            <Gallery4 
              items={recommendedArtworks}
              title=""
              description=""
            />
          </motion.div>
        )}

        {/* Main Gallery Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {loading_artworks ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <SayuGalleryGrid
              artworks={filteredArtworks}
              onLike={handleLike}
              onArchive={(id) => toast('보관함에 추가되었습니다')}
              onView={(id) => console.log('View:', id)}
              onPerceptionClick={handlePerceptionClick}
              layout={layout}
              showPerceptionPreview={true}
              enableGlareEffect={true}
            />
          )}
        </motion.div>
      </div>

      {/* Floating Dock */}
      <FloatingDock
        onShuffle={handleShuffle}
        onFilter={handleFilter}
        onLayoutChange={setLayout}
        currentLayout={layout}
      />
    </SayuBeamsBackground>
  );
}

export default function GalleryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    }>
      <GalleryPageRedesigned />
    </Suspense>
  );
}