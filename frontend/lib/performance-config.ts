// Performance optimization configuration for SAYU

export const performanceConfig = {
  // Animation settings
  animation: {
    // Reduce initial animation distance
    initialY: 5, // was 20-30
    initialOpacity: 0.8, // was 0
    duration: 0.3, // was 0.6-0.8
    ease: 'easeOut' as const,
    stagger: 0.05, // was 0.1
  },

  // Image loading
  image: {
    quality: 75,
    lazyBoundary: '100px',
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Component loading
  loading: {
    skeletonDuration: 300,
    fadeInDuration: 200,
    delayIncrement: 50,
  },

  // Viewport settings
  viewport: {
    mobileBreakpoint: 768,
    tabletBreakpoint: 1024,
    desktopBreakpoint: 1280,
  },

  // Prefetch settings
  prefetch: {
    enabled: true,
    priority: ['/', '/quiz', '/profile'],
    delay: 2000, // Start prefetching after 2 seconds
  },

  // Cache settings
  cache: {
    maxAge: 3600, // 1 hour
    staleWhileRevalidate: 86400, // 24 hours
  }
};

// Animation variants for consistent behavior
export const fadeInVariants = {
  hidden: {
    opacity: performanceConfig.animation.initialOpacity,
    y: performanceConfig.animation.initialY,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: performanceConfig.animation.duration,
      ease: performanceConfig.animation.ease,
    },
  },
  exit: {
    opacity: performanceConfig.animation.initialOpacity,
    y: -performanceConfig.animation.initialY,
    transition: {
      duration: performanceConfig.animation.duration,
      ease: performanceConfig.animation.ease,
    },
  },
};

// Stagger children animation
export const staggerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: performanceConfig.animation.stagger,
    },
  },
};

// Optimized motion props
export const optimizedMotionProps = {
  initial: 'hidden',
  animate: 'visible',
  exit: 'exit',
  variants: fadeInVariants,
};

// Check if device prefers reduced motion
export const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Get optimized animation duration
export const getAnimationDuration = () => {
  return prefersReducedMotion() ? 0 : performanceConfig.animation.duration;
};

// Intersection Observer options for lazy loading
export const intersectionObserverOptions = {
  root: null,
  rootMargin: performanceConfig.image.lazyBoundary,
  threshold: 0.01,
};

// Debounce function for performance
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle function for performance
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Request idle callback wrapper
export function requestIdleCallback(callback: () => void) {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(callback);
  } else {
    setTimeout(callback, 1);
  }
}

// Prefetch critical resources
export function prefetchCriticalResources() {
  if (typeof window === 'undefined') return;

  performanceConfig.prefetch.priority.forEach((path) => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = path;
    document.head.appendChild(link);
  });
}

// Initialize performance optimizations
export function initializePerformance() {
  if (typeof window === 'undefined') return;

  // Prefetch after initial load
  setTimeout(() => {
    requestIdleCallback(prefetchCriticalResources);
  }, performanceConfig.prefetch.delay);

  // Add performance marks
  if ('performance' in window && 'mark' in window.performance) {
    window.performance.mark('sayu-init');
  }
}