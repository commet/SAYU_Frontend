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

// Batch preloader for multiple images
export function useImageBatchPreloader(urls: string[]) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!urls.length) return;

    const images: HTMLImageElement[] = [];
    let loadedCount = 0;

    urls.forEach(url => {
      const img = new Image();
      img.src = url;
      
      img.addEventListener('load', () => {
        loadedCount++;
        setLoadedImages(prev => new Set(prev).add(url));
        setProgress((loadedCount / urls.length) * 100);
      });

      images.push(img);
    });

    return () => {
      images.forEach(img => {
        img.src = '';
      });
    };
  }, [urls]);

  return { loadedImages, progress, isAllLoaded: loadedImages.size === urls.length };
}