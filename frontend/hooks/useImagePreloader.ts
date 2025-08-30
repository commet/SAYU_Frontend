'use client';

import { useState, useEffect, useRef } from 'react';

interface ImagePreloaderOptions {
  blur?: boolean;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  fallbackSrc?: string;
}

export function useImagePreloader(src: string | undefined, options: ImagePreloaderOptions = {}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string | undefined>(src);
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!src) {
      setIsError(true);
      return;
    }

    // Reset states when src changes
    setIsLoaded(false);
    setIsError(false);

    // Create new image element for preloading
    const img = new Image();
    imageRef.current = img;

    const handleLoad = () => {
      setIsLoaded(true);
      setCurrentSrc(src);
      options.onLoad?.();
    };

    const handleError = () => {
      setIsError(true);
      if (options.fallbackSrc) {
        setCurrentSrc(options.fallbackSrc);
      }
      options.onError?.();
    };

    img.addEventListener('load', handleLoad);
    img.addEventListener('error', handleError);

    // Priority loading
    if (options.priority) {
      img.loading = 'eager';
      img.fetchPriority = 'high';
    }

    // Start loading
    img.src = src;

    // Preload next image if within quiz context
    if (src.includes('quiz') || src.includes('narrative')) {
      const match = src.match(/Q(\d+)/);
      if (match) {
        const currentNum = parseInt(match[1]);
        const nextNum = currentNum + 1;
        if (nextNum <= 15) {
          const nextSrc = src.replace(`Q${currentNum}`, `Q${nextNum}`);
          const nextImg = new Image();
          nextImg.src = nextSrc;
        }
      }
    }

    return () => {
      img.removeEventListener('load', handleLoad);
      img.removeEventListener('error', handleError);
      imageRef.current = null;
    };
  }, [src, options.fallbackSrc]);

  return {
    isLoaded,
    isError,
    currentSrc,
    blur: options.blur && !isLoaded,
  };
}

// Batch preloader for multiple images with priority loading
export function useImageBatchPreloader(urls: string[], priority: 'sequential' | 'parallel' = 'parallel') {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!urls.length) return;

    const images: HTMLImageElement[] = [];
    let loadedCount = 0;

    // Preload first 3 images immediately for faster initial load
    const preloadImages = async () => {
      // High priority for first 3 images
      const highPriorityUrls = urls.slice(0, 3);
      const lowPriorityUrls = urls.slice(3);
      
      // Load high priority images first
      highPriorityUrls.forEach(url => {
        const img = new Image();
        img.fetchPriority = 'high';
        img.decoding = 'async';
        img.src = url;
        images.push(img);
        
        img.onload = () => {
          loadedCount++;
          setLoadedImages(prev => new Set(prev).add(url));
          setProgress((loadedCount / urls.length) * 100);
        };
      });
      
      // Load remaining images with lower priority
      setTimeout(() => {
        lowPriorityUrls.forEach(url => {
          const img = new Image();
          img.fetchPriority = 'low';
          img.decoding = 'async';
          img.src = url;
          
          img.addEventListener('load', () => {
            loadedCount++;
            setLoadedImages(prev => new Set(prev).add(url));
            setProgress((loadedCount / urls.length) * 100);
          });

          images.push(img);
        });
      }, 100); // Small delay for low priority images
    };

    preloadImages();

    return () => {
      images.forEach(img => {
        img.src = '';
      });
    };
  }, [urls]);

  return { loadedImages, progress, isAllLoaded: loadedImages.size === urls.length };
}