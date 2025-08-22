'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ReactNode, MouseEvent, useCallback, useState } from 'react';
import { motion } from 'framer-motion';

interface OptimizedLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  prefetch?: boolean;
  onClick?: () => void;
  showLoading?: boolean;
}

// Custom Link component with smooth transitions
export function OptimizedLink({
  href,
  children,
  className = '',
  prefetch = true,
  onClick,
  showLoading = true,
}: OptimizedLinkProps) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleClick = useCallback((e: MouseEvent<HTMLAnchorElement>) => {
    // Don't prevent default for cmd/ctrl clicks
    if (e.metaKey || e.ctrlKey) return;
    
    // Don't interfere with external links
    if (href.startsWith('http')) return;
    
    e.preventDefault();
    
    if (onClick) onClick();
    
    // Start transition
    setIsNavigating(true);
    
    // Small delay for visual feedback
    requestAnimationFrame(() => {
      router.push(href);
      
      // Reset after navigation
      setTimeout(() => setIsNavigating(false), 300);
    });
  }, [href, router, onClick]);

  return (
    <Link
      href={href}
      className={className}
      prefetch={prefetch}
      onClick={handleClick}
    >
      <motion.span
        animate={{ opacity: isNavigating ? 0.7 : 1 }}
        transition={{ duration: 0.15 }}
      >
        {children}
      </motion.span>
    </Link>
  );
}

// Preloader component for critical routes
export function RoutePreloader() {
  const criticalRoutes = ['/', '/quiz', '/profile', '/dashboard'];
  
  return (
    <>
      {criticalRoutes.map((route) => (
        <Link
          key={route}
          href={route}
          prefetch={true}
          style={{ display: 'none' }}
          aria-hidden="true"
        >
          Preload
        </Link>
      ))}
    </>
  );
}

// Navigation progress indicator
export function NavigationProgress() {
  const [isNavigating, setIsNavigating] = useState(false);
  
  // Listen to route changes
  if (typeof window !== 'undefined') {
    const handleStart = () => setIsNavigating(true);
    const handleComplete = () => setIsNavigating(false);
    
    // You would typically use router events here
    // For Next.js App Router, this needs to be handled differently
  }
  
  if (!isNavigating) return null;
  
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-purple-500 z-[100]"
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      style={{ transformOrigin: 'left' }}
    />
  );
}