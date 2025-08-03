'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface MasonryGridProps {
  children: ReactNode;
  columns?: {
    default: number;
    sm?: number;
    md?: number;
    lg?: number;
  };
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function MasonryGrid({ 
  children, 
  columns = { default: 1, sm: 2, md: 3, lg: 4 },
  gap = 'md',
  className 
}: MasonryGridProps) {
  const gapClasses = {
    sm: 'gap-3',
    md: 'gap-4 md:gap-6',
    lg: 'gap-6 md:gap-8'
  };

  // Generate column classes based on breakpoints
  const columnClasses = cn(
    // Default
    `columns-${columns.default}`,
    // Small screens
    columns.sm && `sm:columns-${columns.sm}`,
    // Medium screens
    columns.md && `md:columns-${columns.md}`,
    // Large screens
    columns.lg && `lg:columns-${columns.lg}`
  );

  return (
    <div 
      className={cn(
        "masonry-grid",
        columnClasses,
        gapClasses[gap],
        className
      )}
    >
      <AnimatePresence>
        {children}
      </AnimatePresence>
    </div>
  );
}

// Alternative CSS Grid Masonry (for browsers that support it)
export function CSSMasonryGrid({ 
  children, 
  gap = 'md',
  className 
}: Omit<MasonryGridProps, 'columns'>) {
  const gapClasses = {
    sm: 'gap-3',
    md: 'gap-4 md:gap-6',
    lg: 'gap-6 md:gap-8'
  };

  return (
    <div 
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
        gapClasses[gap],
        className
      )}
      style={{
        gridTemplateRows: 'masonry',
        // Fallback for browsers without masonry support
        display: 'grid'
      } as React.CSSProperties}
    >
      <AnimatePresence>
        {children}
      </AnimatePresence>
    </div>
  );
}

// Staggered animation wrapper for masonry items
export function MasonryItem({ 
  children, 
  index = 0,
  className 
}: { 
  children: ReactNode; 
  index?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{
        duration: 0.4,
        delay: index * 0.05,
        ease: [0.4, 0, 0.2, 1]
      }}
      className={cn("masonry-item", className)}
    >
      {children}
    </motion.div>
  );
}