'use client';

import { useState, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Bookmark, Eye, Share2, MoreVertical } from 'lucide-react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

interface Artwork {
  id: string;
  title: string;
  artist: string;
  year: string;
  imageUrl: string;
  aspectRatio?: number;
}

interface MobileGalleryGridProps {
  artworks: Artwork[];
  onLike?: (id: string) => void;
  onSave?: (id: string) => void;
  onView?: (id: string) => void;
  likedItems?: Set<string>;
  savedItems?: Set<string>;
  loading?: boolean;
}

export default function MobileGalleryGrid({
  artworks,
  onLike,
  onSave,
  onView,
  likedItems = new Set(),
  savedItems = new Set(),
  loading = false
}: MobileGalleryGridProps) {
  const [layout, setLayout] = useState<'masonry' | 'grid'>('masonry');
  const [selectedArtwork, setSelectedArtwork] = useState<string | null>(null);
  
  // Virtual scrolling setup
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: artworks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback((index: number) => {
      const artwork = artworks[index];
      const aspectRatio = artwork.aspectRatio || 1;
      // Base height for mobile + dynamic height based on aspect ratio
      return 200 + (aspectRatio < 1 ? 100 : aspectRatio > 1.5 ? -50 : 0);
    }, [artworks]),
    overscan: 5,
  });

  // Optimized artwork items with intersection observer
  const ArtworkItem = useMemo(() => {
    return ({ artwork, index }: { artwork: Artwork; index: number }) => {
      const [isVisible, ref] = useIntersectionObserver({
        threshold: 0.1,
        triggerOnce: true,
      });

      const handleAction = (action: 'like' | 'save' | 'view', event: React.MouseEvent) => {
        event.stopPropagation();
        
        // Haptic feedback on mobile
        if ('vibrate' in navigator) {
          navigator.vibrate(50);
        }
        
        switch (action) {
          case 'like':
            onLike?.(artwork.id);
            break;
          case 'save':
            onSave?.(artwork.id);
            break;
          case 'view':
            onView?.(artwork.id);
            break;
        }
      };

      return (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          className="relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg"
          onClick={() => setSelectedArtwork(artwork.id)}
        >
          {/* Image Container */}
          <div className="relative overflow-hidden">
            {isVisible ? (
              <img
                src={artwork.imageUrl}
                alt={artwork.title}
                className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
                loading="lazy"
                onLoad={() => onView?.(artwork.id)}
                onError={(e) => {
                  e.currentTarget.src = '/images/placeholder-artwork.svg';
                }}
              />
            ) : (
              <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 animate-pulse" />
            )}
            
            {/* Action Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-200">
              <div className="absolute bottom-4 right-4 flex gap-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="p-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30"
                  onClick={(e) => handleAction('like', e)}
                >
                  <Heart 
                    className={`w-4 h-4 ${likedItems.has(artwork.id) ? 'text-red-500 fill-red-500' : 'text-white'}`} 
                  />
                </motion.button>
                
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="p-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30"
                  onClick={(e) => handleAction('save', e)}
                >
                  <Bookmark 
                    className={`w-4 h-4 ${savedItems.has(artwork.id) ? 'text-green-500 fill-green-500' : 'text-white'}`} 
                  />
                </motion.button>
              </div>
            </div>

            {/* Quick View Indicator */}
            {likedItems.has(artwork.id) && (
              <div className="absolute top-2 left-2">
                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                  <Heart className="w-3 h-3 text-white fill-white" />
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2">
              {artwork.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
              {artwork.artist} • {artwork.year}
            </p>
            
            {/* Mobile-specific quick actions */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex gap-1">
                {likedItems.has(artwork.id) && (
                  <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-xs">
                    Liked
                  </span>
                )}
                {savedItems.has(artwork.id) && (
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-xs">
                    Saved
                  </span>
                )}
              </div>
              
              <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      );
    };
  }, [likedItems, savedItems, onLike, onSave, onView]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse">
            <div className="aspect-square" />
            <div className="p-4 space-y-2">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded" />
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="h-full">
      {/* Layout Toggle */}
      <div className="flex justify-end p-4 pb-2">
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setLayout('grid')}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              layout === 'grid' 
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow' 
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Grid
          </button>
          <button
            onClick={() => setLayout('masonry')}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              layout === 'masonry' 
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow' 
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Masonry
          </button>
        </div>
      </div>

      {/* Virtual Scrolling Container */}
      <div
        ref={parentRef}
        className="h-full overflow-auto"
        style={{ contain: 'strict' }}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {layout === 'grid' ? (
            // Grid Layout (2 columns on mobile)
            <div className="grid grid-cols-2 gap-4 p-4">
              {virtualizer.getVirtualItems().map((virtualItem) => {
                const artwork = artworks[virtualItem.index];
                return (
                  <div
                    key={virtualItem.key}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      transform: `translateY(${virtualItem.start}px)`,
                    }}
                  >
                    <ArtworkItem artwork={artwork} index={virtualItem.index} />
                  </div>
                );
              })}
            </div>
          ) : (
            // Masonry Layout (staggered heights)
            <div className="columns-2 gap-4 p-4">
              {artworks.map((artwork, index) => (
                <ArtworkItem key={artwork.id} artwork={artwork} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pull to Refresh Indicator */}
      <AnimatePresence>
        {selectedArtwork && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setSelectedArtwork(null)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-center text-gray-600 dark:text-gray-400">
                Artwork details modal would open here
              </p>
              <button
                onClick={() => setSelectedArtwork(null)}
                className="w-full mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}