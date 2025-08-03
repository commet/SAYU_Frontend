// 갤러리 페이지 전용 컴포넌트들

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  Shuffle, 
  Filter, 
  LayoutGrid, 
  List, 
  Palette,
  Sparkles 
} from 'lucide-react';

// Feature 108 스타일 카테고리 필터
export function CategoryFilter({ 
  categories,
  selected, 
  onChange 
}: {
  categories: Array<{ id: string; name: string; icon?: any }>;
  selected: string;
  onChange: (category: string) => void;
}) {
  return (
    <div className="w-full overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
      <div className="flex gap-2 min-w-max">
        {categories.map((category) => {
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

// Floating Dock 컴포넌트
export function FloatingDock({ 
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
      className="fixed bottom-8 right-8 z-50 hidden md:block"
    >
      <div className="flex items-center gap-2 p-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-full shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex gap-1">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="icon"
              variant={currentLayout === 'masonry' ? 'default' : 'ghost'}
              className="rounded-full h-8 w-8"
              onClick={() => onLayoutChange('masonry')}
              title="메이슨리 레이아웃"
            >
              <LayoutGrid className="w-3 h-3" />
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="icon"
              variant={currentLayout === 'grid' ? 'default' : 'ghost'}
              className="rounded-full h-8 w-8"
              onClick={() => onLayoutChange('grid')}
              title="그리드 레이아웃"
            >
              <Palette className="w-3 h-3" />
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="icon"
              variant={currentLayout === 'list' ? 'default' : 'ghost'}
              className="rounded-full h-8 w-8"
              onClick={() => onLayoutChange('list')}
              title="리스트 레이아웃"
            >
              <List className="w-3 h-3" />
            </Button>
          </motion.div>
        </div>
        
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />
        
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            size="icon"
            variant="ghost"
            className="rounded-full"
            onClick={onFilter}
            title="고급 필터"
          >
            <Filter className="w-4 h-4" />
          </Button>
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            size="icon"
            variant="ghost"
            className="rounded-full"
            onClick={onShuffle}
            title="작품 순서 섞기"
          >
            <Shuffle className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}

// 모바일용 하단 네비게이션
export function MobileBottomNav({
  onShuffle,
  onFilter,
  currentLayout,
  onLayoutChange
}: {
  onShuffle: () => void;
  onFilter: () => void;
  currentLayout: 'masonry' | 'grid' | 'list';
  onLayoutChange: (layout: 'masonry' | 'grid' | 'list') => void;
}) {
  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-t border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center justify-around p-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={onShuffle}
          className="flex flex-col items-center gap-1 h-auto py-2"
        >
          <Shuffle className="w-4 h-4" />
          <span className="text-xs">섞기</span>
        </Button>
        
        <Button
          size="sm"
          variant="ghost"
          onClick={onFilter}
          className="flex flex-col items-center gap-1 h-auto py-2"
        >
          <Filter className="w-4 h-4" />
          <span className="text-xs">필터</span>
        </Button>
        
        <Button
          size="sm"
          variant={currentLayout === 'masonry' ? 'default' : 'ghost'}
          onClick={() => onLayoutChange('masonry')}
          className="flex flex-col items-center gap-1 h-auto py-2"
        >
          <LayoutGrid className="w-4 h-4" />
          <span className="text-xs">격자</span>
        </Button>
        
        <Button
          size="sm"
          variant={currentLayout === 'grid' ? 'default' : 'ghost'}
          onClick={() => onLayoutChange('grid')}
          className="flex flex-col items-center gap-1 h-auto py-2"
        >
          <Palette className="w-4 h-4" />
          <span className="text-xs">그리드</span>
        </Button>
      </div>
    </motion.div>
  );
}

// 갤러리 통계 표시
export function GalleryStats({
  totalArtworks,
  likedCount,
  viewedCount,
  className
}: {
  totalArtworks: number;
  likedCount: number;
  viewedCount: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-4 text-sm", className)}>
      <div className="flex items-center gap-1.5">
        <Sparkles className="w-4 h-4 text-purple-500" />
        <span className="font-medium text-gray-700 dark:text-gray-200">{totalArtworks}</span>
        <span className="text-gray-500 dark:text-gray-400">작품</span>
      </div>
      <div className="w-px h-4 bg-gray-300 dark:bg-gray-600" />
      <div className="flex items-center gap-1.5">
        <span className="text-red-500">♥</span>
        <span className="font-medium text-gray-700 dark:text-gray-200">{likedCount}</span>
      </div>
      <div className="w-px h-4 bg-gray-300 dark:bg-gray-600" />
      <div className="flex items-center gap-1.5">
        <span className="text-blue-500">👁</span>
        <span className="font-medium text-gray-700 dark:text-gray-200">{viewedCount}</span>
      </div>
    </div>
  );
}