'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAPTTheme } from './APTThemeProvider';
import { cn } from '@/lib/utils';
import Masonry from 'react-masonry-css';

interface APTGalleryLayoutProps {
  children: React.ReactNode[];
  className?: string;
}

export function APTGalleryLayout({ children, className }: APTGalleryLayoutProps) {
  const { theme, animationEnabled } = useAPTTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 레이아웃 스타일별 그리드 설정
  const getLayoutConfig = () => {
    switch (theme.layout.style) {
      case 'grid':
        return {
          type: 'grid',
          columns: {
            default: 4,
            1100: 3,
            700: 2,
            500: 1
          },
          gap: theme.layout.density === 'spacious' ? 32 : 
                theme.layout.density === 'compact' ? 16 : 24
        };
      
      case 'masonry':
        return {
          type: 'masonry',
          breakpoints: {
            default: 4,
            1100: 3,
            700: 2,
            500: 1
          },
          gap: theme.layout.density === 'spacious' ? 32 : 
                theme.layout.density === 'compact' ? 16 : 24
        };
      
      case 'flow':
        return {
          type: 'flow',
          columns: 'auto-fill',
          minWidth: theme.layout.density === 'spacious' ? 320 : 
                   theme.layout.density === 'compact' ? 240 : 280,
          gap: theme.layout.density === 'spacious' ? 32 : 
                theme.layout.density === 'compact' ? 16 : 24
        };
      
      case 'structured':
        return {
          type: 'structured',
          columns: 3,
          gap: theme.layout.density === 'spacious' ? 40 : 
                theme.layout.density === 'compact' ? 20 : 30
        };
    }
  };
  
  const layoutConfig = getLayoutConfig();
  
  // 애니메이션 설정
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: animationEnabled ? 0.1 : 0,
        delayChildren: animationEnabled ? 0.2 : 0
      }
    }
  };
  
  const itemVariants = {
    hidden: {
      opacity: 0,
      y: theme.animations.type === 'energetic' ? 30 : 
         theme.animations.type === 'minimal' ? 0 : 20,
      scale: theme.animations.type === 'dynamic' ? 0.8 : 1
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: animationEnabled ? 0.5 : 0,
        ease: theme.animations.easing
      }
    }
  };
  
  // Flow 레이아웃 특수 효과
  useEffect(() => {
    if (theme.layout.style === 'flow' && containerRef.current) {
      const items = containerRef.current.querySelectorAll('.gallery-item');
      
      items.forEach((item, index) => {
        const el = item as HTMLElement;
        // Flow 패턴에 따른 위치 조정
        if (theme.personality.type.includes('F')) { // Flow 타입
          el.style.transform = `translateY(${Math.sin(index * 0.5) * 10}px)`;
        }
      });
    }
  }, [theme.layout.style, theme.personality.type, children]);
  
  // Grid 레이아웃
  if (layoutConfig.type === 'grid') {
    return (
      <motion.div
        ref={containerRef}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={cn(
          'grid',
          className
        )}
        style={{
          gridTemplateColumns: `repeat(${layoutConfig.columns}, 1fr)`,
          gap: `${layoutConfig.gap}px`
        }}
      >
        <AnimatePresence>
          {children.map((child, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="gallery-item"
              layout={animationEnabled}
            >
              {child}
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    );
  }
  
  // Masonry 레이아웃
  if (layoutConfig.type === 'masonry') {
    return (
      <motion.div
        ref={containerRef}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={className}
      >
        <Masonry
          breakpointCols={layoutConfig.breakpoints}
          className="apt-masonry-grid"
          columnClassName="apt-masonry-grid_column"
        >
          {children.map((child, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="gallery-item mb-6"
              layout={animationEnabled}
            >
              {child}
            </motion.div>
          ))}
        </Masonry>
        
        <style jsx global>{`
          .apt-masonry-grid {
            display: flex;
            width: auto;
            margin-left: -${layoutConfig.gap / 2}px;
            margin-right: -${layoutConfig.gap / 2}px;
          }
          .apt-masonry-grid_column {
            padding-left: ${layoutConfig.gap / 2}px;
            padding-right: ${layoutConfig.gap / 2}px;
            background-clip: padding-box;
          }
        `}</style>
      </motion.div>
    );
  }
  
  // Flow 레이아웃
  if (layoutConfig.type === 'flow') {
    return (
      <motion.div
        ref={containerRef}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={cn(
          'grid',
          className
        )}
        style={{
          gridTemplateColumns: `repeat(${layoutConfig.columns}, minmax(${layoutConfig.minWidth}px, 1fr))`,
          gap: `${layoutConfig.gap}px`,
          gridAutoFlow: 'dense'
        }}
      >
        <AnimatePresence>
          {children.map((child, index) => {
            // Flow 타입별 특수 배치
            const gridSpan = theme.personality.type.includes('F') && index % 3 === 0 ? 2 : 1;
            const gridRow = theme.personality.type.includes('A') && index % 5 === 0 ? 2 : 1;
            
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="gallery-item"
                layout={animationEnabled}
                style={{
                  gridColumn: `span ${gridSpan}`,
                  gridRow: `span ${gridRow}`
                }}
              >
                {child}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    );
  }
  
  // Structured 레이아웃
  return (
    <motion.div
      ref={containerRef}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        'grid',
        className
      )}
      style={{
        gridTemplateColumns: `repeat(${layoutConfig.columns}, 1fr)`,
        gap: `${layoutConfig.gap}px`,
        alignItems: 'start'
      }}
    >
      <AnimatePresence>
        {children.map((child, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className="gallery-item"
            layout={animationEnabled}
            style={{
              // Structured 타입은 정렬된 그리드
              order: theme.personality.type.includes('C') ? index : undefined
            }}
          >
            {child}
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}