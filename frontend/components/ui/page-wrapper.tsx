'use client';

import { Suspense, ReactNode, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LoadingScreen } from './skeleton-loader';
import { usePathname } from 'next/navigation';

interface PageWrapperProps {
  children: ReactNode;
  className?: string;
  showLoading?: boolean;
  loadingMessage?: string;
}

// Prevent flicker with stable initial state
const pageVariants = {
  initial: {
    opacity: 0.95,
    y: 2,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0.95,
    y: -2,
    transition: {
      duration: 0.15,
      ease: 'easeIn',
    },
  },
};

export function PageWrapper({ 
  children, 
  className = '',
  showLoading = false,
  loadingMessage = '로딩 중...'
}: PageWrapperProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent SSR mismatch
  if (!mounted) {
    return (
      <div className={`min-h-screen ${className}`}>
        {children}
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className={`min-h-screen ${className}`}
      >
        <Suspense fallback={<LoadingScreen message={loadingMessage} />}>
          {showLoading ? <LoadingScreen message={loadingMessage} /> : children}
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}

// Page transition provider for smoother navigation
export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => setIsTransitioning(false), 200);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div className={isTransitioning ? 'pointer-events-none' : ''}>
      {children}
    </div>
  );
}

// Optimized suspense boundary
export function OptimizedSuspense({ 
  children, 
  fallback 
}: { 
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <Suspense fallback={fallback || <PageSkeleton />}>
      {children}
    </Suspense>
  );
}

// Generic page skeleton
function PageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="h-12 bg-gray-800 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-64 bg-gray-800 rounded-lg animate-pulse" />
          <div className="h-64 bg-gray-800 rounded-lg animate-pulse" />
          <div className="h-64 bg-gray-800 rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  );
}