'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Play, Pause, Maximize2, RotateCcw, Info } from 'lucide-react';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface Mobile3DFallbackProps {
  artworks: any[];
  title?: string;
  description?: string;
}

export default function Mobile3DFallback({ 
  artworks, 
  title = "3D Gallery Experience",
  description = "Swipe to explore artworks in an immersive way"
}: Mobile3DFallbackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Device capability detection
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const isLowEnd = useMediaQuery('(max-width: 768px)') && 
    (navigator.hardwareConcurrency || 4) < 4;
  
  // Scroll-based parallax for mobile
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlay) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % artworks.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [isAutoPlay, artworks.length]);

  // Gesture handlers
  const handleDragStart = () => setIsDragging(true);
  const handleDragEnd = (event: any, info: any) => {
    setIsDragging(false);
    
    const threshold = 50;
    if (info.offset.x > threshold && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else if (info.offset.x < -threshold && currentIndex < artworks.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  // Touch/swipe navigation
  const nextArtwork = () => {
    setCurrentIndex((prev) => (prev + 1) % artworks.length);
  };

  const prevArtwork = () => {
    setCurrentIndex((prev) => (prev - 1 + artworks.length) % artworks.length);
  };

  if (!isMobile) {
    // Return placeholder for desktop (actual 3D component would load)
    return (
      <div className="w-full h-96 bg-gradient-to-br from-purple-900 to-blue-900 rounded-2xl flex items-center justify-center text-white">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
            <Maximize2 className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold mb-2">3D Gallery Experience</h3>
          <p className="text-white/80">Full 3D experience available on desktop</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      ref={containerRef}
      className="relative w-full h-screen bg-black overflow-hidden"
      style={{ y: isLowEnd ? 0 : y, opacity }}
    >
      {/* Background with subtle animation */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-pink-900/20" />
      
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/50 to-transparent p-4 pt-safe-top">
        <div className="flex items-center justify-between text-white">
          <div>
            <h2 className="text-lg font-bold">{title}</h2>
            <p className="text-sm text-white/80">{description}</p>
          </div>
          <button
            onClick={() => setIsAutoPlay(!isAutoPlay)}
            className="p-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20"
          >
            {isAutoPlay ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative h-full pt-20 pb-24">
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.1}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          className="h-full cursor-grab active:cursor-grabbing"
          whileDrag={{ scale: 0.95 }}
        >
          {/* Current Artwork */}
          <div className="relative h-full flex items-center justify-center px-4">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.8, rotateY: -20 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 0.8, rotateY: 20 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="relative max-w-sm w-full"
            >
              {/* Artwork Frame */}
              <div className="relative bg-gradient-to-br from-white to-gray-100 p-4 rounded-2xl shadow-2xl">
                <div className="aspect-[3/4] bg-black rounded-lg overflow-hidden">
                  <img
                    src={artworks[currentIndex]?.imageUrl || '/images/placeholder-artwork.svg'}
                    alt={artworks[currentIndex]?.title || 'Artwork'}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                
                {/* Artwork Info */}
                <div className="mt-4 text-center">
                  <h3 className="text-lg font-bold text-gray-900">
                    {artworks[currentIndex]?.title || 'Untitled'}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {artworks[currentIndex]?.artist || 'Unknown Artist'} • {artworks[currentIndex]?.year || 'Unknown Year'}
                  </p>
                </div>

                {/* Mobile-specific enhancement: Mock 3D shadow */}
                <div className="absolute -inset-4 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-3xl -z-10 blur-xl" />
              </div>

              {/* Interactive Elements */}
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
                <button className="p-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white">
                  <Info className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </div>

          {/* Side Artworks (Preview) */}
          <div className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-30">
            {currentIndex > 0 && (
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 0.3 }}
                className="w-16 h-20 bg-white rounded-lg shadow-lg overflow-hidden"
                onClick={prevArtwork}
              >
                <img
                  src={artworks[currentIndex - 1]?.imageUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </motion.div>
            )}
          </div>

          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-30">
            {currentIndex < artworks.length - 1 && (
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 0.3 }}
                className="w-16 h-20 bg-white rounded-lg shadow-lg overflow-hidden"
                onClick={nextArtwork}
              >
                <img
                  src={artworks[currentIndex + 1]?.imageUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/50 to-transparent p-4 pb-safe-bottom">
        {/* Progress Indicator */}
        <div className="flex justify-center space-x-2 mb-4">
          {artworks.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'w-8 bg-white' 
                  : 'w-2 bg-white/30'
              }`}
            />
          ))}
        </div>

        {/* Navigation Controls */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={prevArtwork}
            disabled={currentIndex === 0}
            className="p-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 text-white disabled:opacity-30"
          >
            <RotateCcw className="w-5 h-5 transform rotate-180" />
          </button>
          
          <button
            onClick={nextArtwork}
            disabled={currentIndex === artworks.length - 1}
            className="p-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 text-white disabled:opacity-30"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {/* Instructions */}
        <p className="text-center text-white/60 text-xs mt-4">
          Swipe left or right to navigate • Tap to pause auto-play
        </p>
      </div>

      {/* Performance indicator for low-end devices */}
      {isLowEnd && (
        <div className="absolute top-4 right-4 bg-amber-500/20 backdrop-blur-sm rounded-lg px-2 py-1 border border-amber-500/30">
          <p className="text-amber-200 text-xs">Optimized Mode</p>
        </div>
      )}
    </motion.div>
  );
}