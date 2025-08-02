"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Eye, Bookmark, ExternalLink, MessageCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { boxShadow, borderRadius, spacing, animation } from "@/styles/design-system";

interface Artwork {
  id: string;
  title: string;
  artist: string;
  year: string;
  imageUrl: string;
  museum: string;
  medium?: string;
  dimensions?: string;
  museumUrl?: string;
  isLiked?: boolean;
  isArchived?: boolean;
  viewCount?: number;
  perceptionCount?: number;
  tags?: string[];
}

interface SayuGalleryGridProps {
  artworks: Artwork[];
  onLike?: (artworkId: string) => void;
  onArchive?: (artworkId: string) => void;
  onView?: (artworkId: string) => void;
  onPerceptionClick?: (artwork: Artwork) => void;
  layout?: "masonry" | "grid" | "list";
  columns?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  showPerceptionPreview?: boolean;
  enableGlareEffect?: boolean;
  className?: string;
}

// Masonry 레이아웃을 위한 높이 계산
const getRandomHeight = () => {
  const heights = [320, 380, 420, 480];
  return heights[Math.floor(Math.random() * heights.length)];
};

// 감상 미리보기 데이터 (실제로는 API에서 가져옴)
const mockPerceptions = [
  "이 작품에서 느껴지는 고요함이 마음을 편안하게 해요",
  "색감의 대비가 인상적이네요. 특히 파란색과 주황색의 조화가...",
  "작가의 붓터치에서 감정의 움직임이 느껴집니다",
  "빛과 그림자의 표현이 정말 아름다워요"
];

export function SayuGalleryGrid({
  artworks,
  onLike,
  onArchive,
  onView,
  onPerceptionClick,
  layout = "masonry",
  columns = { mobile: 2, tablet: 3, desktop: 4 },
  showPerceptionPreview = true,
  enableGlareEffect = true,
  className
}: SayuGalleryGridProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const gridRef = useRef<HTMLDivElement>(null);

  // 이미지 로드 상태 관리
  const handleImageLoad = (artworkId: string) => {
    setLoadedImages(prev => new Set(prev).add(artworkId));
  };

  // 반응형 컬럼 수 계산
  const getColumnCount = () => {
    if (typeof window === 'undefined') return columns.desktop;
    
    const width = window.innerWidth;
    if (width < 768) return columns.mobile;
    if (width < 1024) return columns.tablet;
    return columns.desktop;
  };

  const [columnCount, setColumnCount] = useState(getColumnCount());

  useEffect(() => {
    const handleResize = () => setColumnCount(getColumnCount());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [columns]);

  // 카드 렌더링
  const renderArtworkCard = (artwork: Artwork, index: number) => {
    const isHovered = hoveredId === artwork.id;
    const isLoaded = loadedImages.has(artwork.id);
    const cardHeight = layout === "masonry" ? getRandomHeight() : "auto";

    return (
      <motion.div
        key={artwork.id}
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ 
          duration: 0.3, 
          delay: index * 0.05,
          layout: { type: "spring", damping: 20 }
        }}
        className={cn(
          "relative group cursor-pointer",
          "rounded-xl overflow-hidden",
          "bg-white dark:bg-neutral-900",
          "transition-all duration-300",
          enableGlareEffect && "glare-card",
          layout === "list" && "flex flex-row"
        )}
        style={{
          height: layout === "masonry" ? cardHeight : "auto",
          boxShadow: isHovered ? boxShadow.artCardHover : boxShadow.artCard,
          transform: isHovered ? "translateY(-4px)" : "translateY(0)"
        }}
        onMouseEnter={() => setHoveredId(artwork.id)}
        onMouseLeave={() => setHoveredId(null)}
        onClick={() => onView?.(artwork.id)}
      >
        {/* Glare effect overlay */}
        {enableGlareEffect && isHovered && (
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-20">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent" />
          </div>
        )}

        {/* Image container */}
        <div className={cn(
          "relative overflow-hidden",
          layout === "list" ? "w-48 h-48" : "w-full",
          layout === "grid" && "aspect-[4/5]", // 더 세로로 긴 비율
          layout === "masonry" && "h-full"
        )}>
          {/* Skeleton loader */}
          {!isLoaded && (
            <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 animate-pulse" />
          )}

          {/* Artwork image */}
          <OptimizedImage
            src={artwork.imageUrl}
            alt={artwork.title}
            fill={layout !== "list"}
            width={layout === "list" ? 192 : undefined}
            height={layout === "list" ? 192 : undefined}
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className={cn(
              "object-cover transition-all duration-700",
              isHovered ? "scale-110" : "scale-100",
              !isLoaded && "opacity-0"
            )}
            onLoad={() => handleImageLoad(artwork.id)}
            placeholder="blur"
            quality={90}
          />

          {/* Gradient overlay */}
          <div className={cn(
            "absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent",
            "opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          )} />

          {/* Quick actions - 이미지 내부 상단에 위치 */}
          <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-y-2 group-hover:translate-y-0 z-10">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "p-2.5 rounded-full backdrop-blur-md",
                "bg-black/40 hover:bg-black/60",
                "transition-all duration-200",
                "shadow-lg"
              )}
              onClick={(e) => {
                e.stopPropagation();
                onLike?.(artwork.id);
              }}
            >
              <Heart
                className={cn(
                  "w-4 h-4 transition-colors",
                  artwork.isLiked ? "fill-red-500 text-red-500" : "text-white"
                )}
              />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-2.5 rounded-full backdrop-blur-md bg-black/40 hover:bg-black/60 transition-all duration-200 shadow-lg"
              onClick={(e) => {
                e.stopPropagation();
                onArchive?.(artwork.id);
              }}
            >
              <Bookmark
                className={cn(
                  "w-4 h-4 transition-colors",
                  artwork.isArchived ? "fill-yellow-500 text-yellow-500" : "text-white"
                )}
              />
            </motion.button>

            {artwork.museumUrl && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-full backdrop-blur-md bg-white/20 hover:bg-white/30 transition-colors duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(artwork.museumUrl, '_blank');
                }}
              >
                <ExternalLink className="w-4 h-4 text-white" />
              </motion.button>
            )}
          </div>

          {/* View count badge */}
          {artwork.viewCount && artwork.viewCount > 0 && (
            <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs">
              <Eye className="w-3 h-3" />
              <span>{artwork.viewCount}</span>
            </div>
          )}
        </div>

        {/* Content section */}
        <div className={cn(
          "p-4",
          layout === "list" && "flex-1"
        )}>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm line-clamp-2 mb-1">
            {artwork.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-xs mb-2">
            {artwork.artist} • {artwork.year}
          </p>

          {/* Tags */}
          {artwork.tags && artwork.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {artwork.tags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Perception preview */}
          {showPerceptionPreview && artwork.perceptionCount && artwork.perceptionCount > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ 
                height: isHovered ? "auto" : 0, 
                opacity: isHovered ? 1 : 0 
              }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div 
                className="mt-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onPerceptionClick?.(artwork);
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <MessageCircle className="w-4 h-4 text-purple-500" />
                  <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                    {artwork.perceptionCount}개의 감상
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 italic line-clamp-2">
                  "{mockPerceptions[Math.floor(Math.random() * mockPerceptions.length)]}"
                </p>
              </div>
            </motion.div>
          )}

          {/* Museum badge */}
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full">
              {artwork.museum}
            </span>
            {artwork.medium && (
              <Sparkles className="w-4 h-4 text-purple-500 opacity-60" />
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div
      ref={gridRef}
      className={cn(
        "w-full",
        layout === "masonry" && "columns-2 md:columns-3 lg:columns-4 xl:columns-5",
        layout === "grid" && `grid grid-cols-${columns.mobile} md:grid-cols-${columns.tablet} lg:grid-cols-${columns.desktop}`,
        layout === "list" && "flex flex-col",
        "gap-4 md:gap-6",
        className
      )}
      style={{
        columnGap: layout === "masonry" ? spacing[4] : undefined
      }}
    >
      <AnimatePresence mode="popLayout">
        {artworks.map((artwork, index) => (
          <div
            key={artwork.id}
            className={cn(
              layout === "masonry" && "break-inside-avoid mb-4 md:mb-6",
              layout === "grid" && "",
              layout === "list" && "mb-4"
            )}
          >
            {renderArtworkCard(artwork, index)}
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}