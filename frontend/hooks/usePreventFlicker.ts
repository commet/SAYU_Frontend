// Custom hook to prevent component flickering
import { useEffect, useLayoutEffect, useState } from 'react';

// Use useLayoutEffect on client, useEffect on server
const useIsomorphicLayoutEffect = 
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function usePreventFlicker() {
  const [isReady, setIsReady] = useState(false);
  
  useIsomorphicLayoutEffect(() => {
    // Ensure DOM is ready before rendering
    const timer = requestAnimationFrame(() => {
      setIsReady(true);
    });
    
    return () => cancelAnimationFrame(timer);
  }, []);
  
  return isReady;
}

// Hook for managing initial load state
export function useInitialLoad() {
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  return isInitialLoad;
}

// Hook for detecting hydration
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  
  useEffect(() => {
    setHydrated(true);
  }, []);
  
  return hydrated;
}

// Hook for optimized image loading
export function useImagePreload(src: string | string[]) {
  const [loaded, setLoaded] = useState(false);
  
  useEffect(() => {
    const sources = Array.isArray(src) ? src : [src];
    let loadedCount = 0;
    
    const images = sources.map(source => {
      const img = new Image();
      img.src = source;
      
      img.onload = () => {
        loadedCount++;
        if (loadedCount === sources.length) {
          setLoaded(true);
        }
      };
      
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === sources.length) {
          setLoaded(true);
        }
      };
      
      return img;
    });
    
    return () => {
      images.forEach(img => {
        img.onload = null;
        img.onerror = null;
      });
    };
  }, [src]);
  
  return loaded;
}

// Hook for viewport-based rendering
export function useInViewport(
  ref: React.RefObject<HTMLElement>,
  options?: IntersectionObserverInit
) {
  const [isInViewport, setIsInViewport] = useState(false);
  
  useEffect(() => {
    if (!ref.current) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInViewport(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px',
        ...options,
      }
    );
    
    observer.observe(ref.current);
    
    return () => observer.disconnect();
  }, [ref, options]);
  
  return isInViewport;
}

// Combined hook for preventing all types of flicker
export function useAntiFlicker() {
  const hydrated = useHydrated();
  const ready = usePreventFlicker();
  const initialLoad = useInitialLoad();
  
  return {
    isReady: hydrated && ready && !initialLoad,
    hydrated,
    ready,
    initialLoad,
  };
}