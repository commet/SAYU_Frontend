'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { 
  Heart, 
  Share2, 
  Download, 
  Maximize2, 
  Filter,
  Grid,
  Square,
  X,
  Info
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ModernButton } from '@/components/ui/modern-button';
import { ModernCard } from '@/components/ui/modern-card';

interface Artwork {
  id: string;
  title: string;
  artist: string;
  year: string;
  imageUrl: string;
  description?: string;
  tags: string[];
  likes: number;
  isLiked?: boolean;
}

interface ModernGalleryGridProps {
  artworks: Artwork[];
  onLoadMore?: () => void;
  hasMore?: boolean;
  loading?: boolean;
}

type ViewMode = 'grid' | 'masonry' | 'single';

export default function ModernGalleryGrid({ 
  artworks, 
  onLoadMore, 
  hasMore = false,
  loading = false 
}: ModernGalleryGridProps) {
  const { language } = useLanguage();
  const [viewMode, setViewMode] = useState<ViewMode>('masonry');
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [likedArtworks, setLikedArtworks] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<string>('all');
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Infinite scroll
  useEffect(() => {
    if (!onLoadMore) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [onLoadMore, hasMore, loading]);

  const handleLike = useCallback((artworkId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setLikedArtworks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(artworkId)) {
        newSet.delete(artworkId);
      } else {
        newSet.add(artworkId);
      }
      return newSet;
    });
  }, []);

  const handleShare = useCallback((artwork: Artwork, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: artwork.title,
        text: `${artwork.title} by ${artwork.artist}`,
        url: window.location.href
      });
    }
  }, []);

  const handleDownload = useCallback((artwork: Artwork, e?: React.MouseEvent) => {
    e?.stopPropagation();
    // Implement download logic
    const link = document.createElement('a');
    link.href = artwork.imageUrl;
    link.download = `${artwork.title}-${artwork.artist}.jpg`;
    link.click();
  }, []);

  // Get unique tags for filtering
  const allTags = Array.from(new Set(artworks.flatMap(a => a.tags)));
  const filteredArtworks = filter === 'all' 
    ? artworks 
    : artworks.filter(a => a.tags.includes(filter));

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <>
      {/* Controls */}
      <div className="sticky top-20 z-30 bg-sayu-bg-primary/80 backdrop-blur-md border-b border-sayu-warm-gray/20 py-4 mb-8">
        <div className="sayu-container">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-sayu-bg-tertiary rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-all ${
                  viewMode === 'grid' 
                    ? 'bg-white shadow-sm text-sayu-mocha' 
                    : 'text-sayu-text-muted hover:text-sayu-text-primary'
                }`}
                title="Grid view"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('masonry')}
                className={`p-2 rounded transition-all ${
                  viewMode === 'masonry' 
                    ? 'bg-white shadow-sm text-sayu-mocha' 
                    : 'text-sayu-text-muted hover:text-sayu-text-primary'
                }`}
                title="Masonry view"
              >
                <Square className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('single')}
                className={`p-2 rounded transition-all ${
                  viewMode === 'single' 
                    ? 'bg-white shadow-sm text-sayu-mocha' 
                    : 'text-sayu-text-muted hover:text-sayu-text-primary'
                }`}
                title="Single view"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 flex-1 justify-end">
              <Filter className="w-4 h-4 text-sayu-text-muted" />
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                    filter === 'all'
                      ? 'bg-sayu-mocha text-sayu-cream'
                      : 'bg-sayu-bg-tertiary text-sayu-text-secondary hover:bg-sayu-bg-secondary'
                  }`}
                >
                  {language === 'ko' ? '전체' : 'All'}
                </button>
                {allTags.slice(0, 5).map(tag => (
                  <button
                    key={tag}
                    onClick={() => setFilter(tag)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                      filter === tag
                        ? 'bg-sayu-mocha text-sayu-cream'
                        : 'bg-sayu-bg-tertiary text-sayu-text-secondary hover:bg-sayu-bg-secondary'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery */}
      <div className="sayu-container">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={`
            ${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : ''}
            ${viewMode === 'masonry' ? 'columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6' : ''}
            ${viewMode === 'single' ? 'max-w-4xl mx-auto space-y-12' : ''}
          `}
        >
          {filteredArtworks.map((artwork, index) => (
            <motion.div
              key={artwork.id}
              variants={itemVariants}
              className={`
                ${viewMode === 'masonry' ? 'break-inside-avoid mb-6' : ''}
                ${viewMode === 'single' ? '' : 'cursor-pointer'}
              `}
              onClick={() => viewMode !== 'single' && setSelectedArtwork(artwork)}
            >
              <ModernCard 
                hover={viewMode !== 'single'}
                className="overflow-hidden group"
              >
                {/* Image Container */}
                <div className={`
                  relative overflow-hidden bg-sayu-bg-tertiary
                  ${viewMode === 'grid' ? 'aspect-square' : ''}
                  ${viewMode === 'single' ? 'aspect-[4/3]' : ''}
                `}>
                  <Image
                    src={artwork.imageUrl}
                    alt={artwork.title}
                    width={viewMode === 'single' ? 1200 : 600}
                    height={viewMode === 'single' ? 900 : 600}
                    className={`
                      w-full h-full object-cover
                      transition-transform duration-700
                      group-hover:scale-110
                    `}
                    loading="lazy"
                  />
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => handleLike(artwork.id, e)}
                          className={`p-2 rounded-full backdrop-blur-sm transition-all ${
                            likedArtworks.has(artwork.id)
                              ? 'bg-red-500 text-white'
                              : 'bg-white/20 text-white hover:bg-white/30'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${likedArtworks.has(artwork.id) ? 'fill-current' : ''}`} />
                        </button>
                        <button
                          onClick={(e) => handleShare(artwork, e)}
                          className="p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleDownload(artwork, e)}
                          className="p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Artwork Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-sayu-text-primary mb-1 line-clamp-1">
                    {artwork.title}
                  </h3>
                  <p className="text-sm text-sayu-text-secondary mb-2">
                    {artwork.artist} · {artwork.year}
                  </p>
                  {viewMode === 'single' && artwork.description && (
                    <p className="text-sm text-sayu-text-muted mt-4 line-clamp-3">
                      {artwork.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex flex-wrap gap-1">
                      {artwork.tags.slice(0, 2).map(tag => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-1 bg-sayu-bg-tertiary text-sayu-text-muted rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <span className="text-sm text-sayu-text-muted flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      {artwork.likes + (likedArtworks.has(artwork.id) ? 1 : 0)}
                    </span>
                  </div>
                </div>
              </ModernCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Load More Trigger */}
        {hasMore && (
          <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
            {loading && (
              <div className="flex items-center gap-2 text-sayu-text-muted">
                <div className="w-4 h-4 border-2 border-sayu-mocha/30 border-t-sayu-mocha rounded-full animate-spin" />
                <span>{language === 'ko' ? '로딩 중...' : 'Loading...'}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Artwork Detail Modal */}
      <AnimatePresence>
        {selectedArtwork && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedArtwork(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col lg:flex-row h-full">
                {/* Image Section */}
                <div className="lg:flex-1 bg-sayu-bg-tertiary flex items-center justify-center p-8">
                  <Image
                    src={selectedArtwork.imageUrl}
                    alt={selectedArtwork.title}
                    width={800}
                    height={800}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>

                {/* Info Section */}
                <div className="lg:w-96 p-8 overflow-y-auto">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-sayu-text-primary mb-2">
                        {selectedArtwork.title}
                      </h2>
                      <p className="text-lg text-sayu-text-secondary">
                        {selectedArtwork.artist} · {selectedArtwork.year}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedArtwork(null)}
                      className="p-2 rounded-full hover:bg-sayu-bg-tertiary transition-colors"
                    >
                      <X className="w-5 h-5 text-sayu-text-muted" />
                    </button>
                  </div>

                  {selectedArtwork.description && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-sayu-text-primary mb-2 flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        {language === 'ko' ? '작품 설명' : 'Description'}
                      </h3>
                      <p className="text-sayu-text-secondary">
                        {selectedArtwork.description}
                      </p>
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="font-semibold text-sayu-text-primary mb-3">
                      {language === 'ko' ? '태그' : 'Tags'}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedArtwork.tags.map(tag => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-sayu-bg-tertiary text-sayu-text-secondary rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <ModernButton
                      variant={likedArtworks.has(selectedArtwork.id) ? "default" : "outline"}
                      onClick={() => handleLike(selectedArtwork.id)}
                      iconLeft={<Heart className={`w-4 h-4 ${likedArtworks.has(selectedArtwork.id) ? 'fill-current' : ''}`} />}
                      className="flex-1"
                    >
                      {likedArtworks.has(selectedArtwork.id) 
                        ? (language === 'ko' ? '좋아요 취소' : 'Unlike')
                        : (language === 'ko' ? '좋아요' : 'Like')
                      }
                    </ModernButton>
                    <ModernButton
                      variant="secondary"
                      onClick={() => handleShare(selectedArtwork)}
                      iconLeft={<Share2 className="w-4 h-4" />}
                    >
                      {language === 'ko' ? '공유' : 'Share'}
                    </ModernButton>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}