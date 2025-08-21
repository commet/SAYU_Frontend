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
      // Increased base height for better visibility
      return 280 + (aspectRatio < 1 ? 100 : aspectRatio > 1.5 ? -50 : 0);
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
        event.preventDefault();
        event.stopPropagation();
        
        console.log(`🔧 MobileGalleryGrid handleAction: ${action} for artwork ${artwork.id}`);
        
        // Haptic feedback on mobile
        if ('vibrate' in navigator) {
          navigator.vibrate(50);
        }
        
        switch (action) {
          case 'like':
            console.log('📱 Mobile Like:', artwork.id);
            onLike?.(artwork.id);
            break;
          case 'save':
            console.log('📱 Mobile Save:', artwork.id);
            onSave?.(artwork.id);
            break;
          case 'view':
            console.log('📱 Mobile View:', artwork.id);
            onView?.(artwork.id);
            break;
        }
      };

      return (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          className="relative bg-slate-800 rounded-xl overflow-hidden shadow-lg border border-slate-700"
          onClick={() => {
            console.log('📱 Mobile artwork clicked:', artwork.title);
            onView?.(artwork);
          }}
        >
          {/* Image Container - Fixed aspect ratio */}
          <div className="aspect-square relative overflow-hidden bg-slate-700">
            <img
              src={artwork.imageUrl}
              alt={artwork.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              loading={index < 4 ? 'eager' : 'lazy'}
              crossOrigin="anonymous"
              onLoad={() => {
                console.log('📱 Mobile image loaded:', artwork.title);
                // Don't call onView here - only on click
              }}
              onError={(e) => {
                console.error('📱 Mobile image failed:', artwork.title, artwork.imageUrl);
                const target = e.currentTarget;
                target.src = '/images/placeholder-artwork.jpg';
              }}
            />
            
            {/* Mobile Action Buttons - Always visible */}
            <div className="absolute top-2 right-2 flex flex-col gap-1">
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="p-1.5 bg-black/70 backdrop-blur-sm rounded-full border border-white/20 shadow-lg touch-manipulation flex items-center justify-center"
                onClick={(e) => handleAction('like', e)}
                style={{ minHeight: '32px', minWidth: '32px' }}
              >
                <Heart 
                  className={`w-3 h-3 ${likedItems.has(artwork.id) ? 'text-red-400 fill-red-400' : 'text-white'}`} 
                />
              </motion.button>
              
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="p-1.5 bg-black/70 backdrop-blur-sm rounded-full border border-white/20 shadow-lg touch-manipulation flex items-center justify-center"
                onClick={(e) => handleAction('save', e)}
                style={{ minHeight: '32px', minWidth: '32px' }}
              >
                <Bookmark 
                  className={`w-3 h-3 ${savedItems.has(artwork.id) ? 'text-green-400 fill-green-400' : 'text-white'}`} 
                />
              </motion.button>
            </div>

            {/* Saved indicator */}
            {savedItems.has(artwork.id) && (
              <div className="absolute top-2 left-2">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <Bookmark className="w-2.5 h-2.5 text-white fill-white" />
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-3">
            <h3 className="font-semibold text-white text-sm line-clamp-1">
              {artwork.title}
            </h3>
            <p className="text-slate-400 text-xs mt-1">
              {artwork.artist} • {artwork.year}
            </p>
            
            {/* Status badges */}
            <div className="flex gap-1 mt-2">
              {likedItems.has(artwork.id) && (
                <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full text-xs">
                  ❤️
                </span>
              )}
              {savedItems.has(artwork.id) && (
                <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-xs">
                  📌
                </span>
              )}
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
    <div className="w-full">
      {/* Simplified Mobile Grid - No virtual scrolling complexity */}
      <div className="grid grid-cols-2 gap-3 p-4">
        {artworks.map((artwork, index) => (
          <ArtworkItem key={artwork.id} artwork={artwork} index={index} />
        ))}
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