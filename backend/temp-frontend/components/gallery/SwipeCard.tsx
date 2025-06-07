'use client';

import { motion, useAnimation, PanInfo } from 'framer-motion';
import { useState, useRef } from 'react';
import { Heart, X, Info } from 'phosphor-react';
import { cn } from '@/lib/utils';

interface SwipeCardProps {
  artwork: {
    id: string;
    title: string;
    artist: string;
    year: string;
    imageUrl: string;
    museum: string;
    medium?: string;
  };
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  isTop?: boolean;
  zIndex?: number;
}

export function SwipeCard({ 
  artwork, 
  onSwipeLeft, 
  onSwipeRight, 
  isTop = false,
  zIndex = 1 
}: SwipeCardProps) {
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const controls = useAnimation();
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 100;
    const velocity = info.velocity.x;
    const offset = info.offset.x;

    if (Math.abs(velocity) > 500 || Math.abs(offset) > threshold) {
      if (offset > 0 || velocity > 0) {
        // Swiped right - like
        setExitDirection('right');
        controls.start({
          x: 1000,
          rotate: 30,
          opacity: 0,
          transition: { duration: 0.3 }
        }).then(() => {
          onSwipeRight();
        });
      } else {
        // Swiped left - pass
        setExitDirection('left');
        controls.start({
          x: -1000,
          rotate: -30,
          opacity: 0,
          transition: { duration: 0.3 }
        }).then(() => {
          onSwipeLeft();
        });
      }
    } else {
      // Snap back to center
      controls.start({
        x: 0,
        rotate: 0,
        transition: { type: 'spring', stiffness: 500, damping: 30 }
      });
    }
  };

  const handleLike = () => {
    setExitDirection('right');
    controls.start({
      x: 1000,
      rotate: 30,
      opacity: 0,
      scale: 0.8,
      transition: { duration: 0.4 }
    }).then(() => {
      onSwipeRight();
    });
  };

  const handlePass = () => {
    setExitDirection('left');
    controls.start({
      x: -1000,
      rotate: -30,
      opacity: 0,
      scale: 0.8,
      transition: { duration: 0.4 }
    }).then(() => {
      onSwipeLeft();
    });
  };

  return (
    <motion.div
      ref={cardRef}
      className={cn(
        "absolute inset-0 w-full max-w-sm mx-auto cursor-grab active:cursor-grabbing",
        !isTop && "pointer-events-none"
      )}
      style={{ zIndex }}
      animate={controls}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.05 }}
      initial={{ scale: isTop ? 1 : 0.95, opacity: isTop ? 1 : 0.7 }}
      whileHover={isTop ? { scale: 1.02 } : {}}
    >
      <div className="relative bg-card rounded-2xl shadow-xl overflow-hidden h-[600px]">
        {/* Image */}
        <div className="relative h-4/5 overflow-hidden">
          <img
            src={artwork.imageUrl}
            alt={artwork.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = '/images/placeholder-artwork.jpg';
            }}
          />
          
          {/* Swipe Indicators */}
          <motion.div
            className="absolute inset-0 bg-red-500/20 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: exitDirection === 'left' ? 1 : 0 
            }}
          >
            <div className="bg-red-500 text-white p-4 rounded-full">
              <X size={40} weight="bold" />
            </div>
          </motion.div>
          
          <motion.div
            className="absolute inset-0 bg-green-500/20 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: exitDirection === 'right' ? 1 : 0 
            }}
          >
            <div className="bg-green-500 text-white p-4 rounded-full">
              <Heart size={40} weight="fill" />
            </div>
          </motion.div>

          {/* Info Button */}
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full backdrop-blur-sm hover:bg-black/70 transition-colors"
          >
            <Info size={20} />
          </button>
        </div>

        {/* Artwork Info */}
        <div className="h-1/5 p-4 flex flex-col justify-center">
          <h3 className="font-display text-lg line-clamp-2 mb-1">
            {artwork.title}
          </h3>
          <p className="text-muted-foreground font-medium">
            {artwork.artist}
          </p>
          <p className="text-sm text-muted-foreground">
            {artwork.year} • {artwork.medium}
          </p>
        </div>

        {/* Extended Info Overlay */}
        {showInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute inset-0 bg-black/90 text-white p-6 flex flex-col justify-center"
            onClick={() => setShowInfo(false)}
          >
            <h3 className="font-display text-2xl mb-2">{artwork.title}</h3>
            <p className="text-lg mb-2">{artwork.artist}</p>
            <p className="text-gray-300 mb-4">{artwork.year}</p>
            {artwork.medium && (
              <p className="text-gray-300 mb-2">Medium: {artwork.medium}</p>
            )}
            <p className="text-gray-300">Collection: {artwork.museum}</p>
          </motion.div>
        )}
      </div>

      {/* Action Buttons (only show on top card) */}
      {isTop && (
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePass}
            className="w-14 h-14 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={24} weight="bold" className="text-gray-600 dark:text-gray-300" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLike}
            className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
          >
            <Heart size={28} weight="fill" className="text-white" />
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}