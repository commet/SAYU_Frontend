'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { useNetworkAwareLoading } from '@/hooks/useMobileInteractions';

interface MobileOptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  aspectRatio?: number;
  className?: string;
  priority?: boolean;
  quality?: 'low' | 'medium' | 'high';
  placeholder?: 'blur' | 'empty' | 'shimmer';
  onLoad?: () => void;
  onError?: () => void;
  onClick?: () => void;
}

export default function MobileOptimizedImage({
  src,
  alt,
  width,
  height,
  aspectRatio = 1,
  className = '',
  priority = false,
  quality = 'medium',
  placeholder = 'shimmer',
  onLoad,
  onError,
  onClick
}: MobileOptimizedImageProps) {
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);
  const { isSlowConnection, shouldReduceQuality } = useNetworkAwareLoading();
  
  // Intersection observer for lazy loading
  const [isVisible, elementRef] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '50px',
    triggerOnce: true,
  });

  // Generate responsive image URLs based on device and network conditions
  const generateOptimizedSrc = useCallback((originalSrc: string, targetQuality: string = quality) => {
    if (!originalSrc) return '';

    // For external URLs (Cloudinary, museum APIs, etc.)
    if (originalSrc.includes('cloudinary.com')) {
      const qualityMap = {
        low: 'q_50,f_auto,w_400',
        medium: 'q_75,f_auto,w_800',
        high: 'q_90,f_auto,w_1200'
      };
      
      const networkQuality = shouldReduceQuality ? 'low' : targetQuality;
      const transform = qualityMap[networkQuality as keyof typeof qualityMap];
      
      return originalSrc.replace('/upload/', `/upload/${transform}/`);
    }

    // For museum APIs with image proxy
    if (originalSrc.includes('/api/image-proxy')) {
      const url = new URL(originalSrc, window.location.origin);
      url.searchParams.set('quality', shouldReduceQuality ? '50' : '75');
      url.searchParams.set('width', shouldReduceQuality ? '400' : '800');
      return url.toString();
    }

    // For other external images
    if (originalSrc.startsWith('http')) {
      return `/api/image-proxy?url=${encodeURIComponent(originalSrc)}&quality=${shouldReduceQuality ? '50' : '75'}`;
    }

    // For local images, return as-is
    return originalSrc;
  }, [quality, shouldReduceQuality]);

  // Progressive loading: load low-quality first, then high-quality
  const loadProgressively = useCallback(async () => {
    if (!src) return;

    try {
      // Load low-quality version first for perceived performance
      const lowQualitySrc = generateOptimizedSrc(src, 'low');
      const highQualitySrc = generateOptimizedSrc(src, quality);

      // Start with low quality
      setCurrentSrc(lowQualitySrc);
      
      // Pre-load high quality in background if not slow connection
      if (!shouldReduceQuality && lowQualitySrc !== highQualitySrc) {
        const highQualityImg = new Image();
        highQualityImg.onload = () => {
          setCurrentSrc(highQualitySrc);
        };
        highQualityImg.src = highQualitySrc;
      }
    } catch (error) {
      console.warn('Progressive loading failed:', error);
      setCurrentSrc(generateOptimizedSrc(src));
    }
  }, [src, quality, generateOptimizedSrc, shouldReduceQuality]);

  // Load image when visible or priority
  useEffect(() => {
    if ((isVisible || priority) && src) {
      loadProgressively();
    }
  }, [isVisible, priority, src, loadProgressively]);

  // Handle image load events
  const handleLoad = useCallback(() => {
    setImageState('loaded');
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setImageState('error');
    // Fallback to placeholder or error image
    setCurrentSrc('/images/placeholder-artwork.svg');
    onError?.();
  }, [onError]);

  // Generate placeholder content
  const renderPlaceholder = () => {
    const baseClasses = `w-full bg-gray-200 dark:bg-gray-700 ${className}`;
    const style = aspectRatio ? { aspectRatio } : { width, height };

    switch (placeholder) {
      case 'shimmer':
        return (
          <div className={`${baseClasses} animate-pulse relative overflow-hidden`} style={style}>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent shimmer-animation" />
          </div>
        );
      
      case 'blur':
        return (
          <div className={`${baseClasses} relative`} style={style}>
            <div className="absolute inset-0 bg-gray-300 dark:bg-gray-600 blur-sm" />
          </div>
        );
      
      default:
        return <div className={baseClasses} style={style} />;
    }
  };

  return (
    <div 
      ref={elementRef}
      className={`relative overflow-hidden ${className}`}
      onClick={onClick}
    >
      {/* Placeholder */}
      {imageState === 'loading' && renderPlaceholder()}
      
      {/* Main Image */}
      {currentSrc && (
        <motion.img
          ref={imgRef}
          src={currentSrc}
          alt={alt}
          width={width}
          height={height}
          className={`
            ${imageState === 'loaded' ? 'opacity-100' : 'opacity-0'}
            transition-opacity duration-300 ease-in-out
            ${aspectRatio ? `aspect-[${aspectRatio}]` : ''}
            object-cover w-full h-full
            ${className}
          `}
          style={aspectRatio ? { aspectRatio } : undefined}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          // Optimize for mobile performance
          {...(isSlowConnection && {
            'data-src': currentSrc,
            src: undefined // Defer loading on slow connections
          })}
        />
      )}

      {/* Error State */}
      {imageState === 'error' && (
        <div 
          className={`
            flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-400
            ${className}
          `}
          style={aspectRatio ? { aspectRatio } : { width, height }}
        >
          <div className="text-center p-4">
            <div className="w-8 h-8 mx-auto mb-2 opacity-50">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-xs">Failed to load</p>
          </div>
        </div>
      )}

      {/* Loading indicator for slow connections */}
      {isSlowConnection && imageState === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
          <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Network status indicator */}
      {shouldReduceQuality && imageState === 'loaded' && (
        <div className="absolute top-2 left-2 bg-amber-500/80 backdrop-blur-sm rounded px-2 py-1">
          <span className="text-xs text-white">Optimized</span>
        </div>
      )}
    </div>
  );
}

// WebP/AVIF support detection hook
export function useModernImageFormats() {
  const [supports, setSupports] = useState({
    webp: false,
    avif: false
  });

  useEffect(() => {
    const checkWebPSupport = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    };

    const checkAVIFSupport = async () => {
      try {
        const response = await fetch(
          'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A='
        );
        const blob = await response.blob();
        return blob.type === 'image/avif';
      } catch {
        return false;
      }
    };

    setSupports({
      webp: checkWebPSupport(),
      avif: false // Disable AVIF check for performance
    });

    // Optionally check AVIF support asynchronously
    // checkAVIFSupport().then(avif => {
    //   setSupports(prev => ({ ...prev, avif }));
    // });
  }, []);

  return supports;
}