'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { useAPTTheme } from './APTThemeProvider';
import { cn } from '@/lib/utils';
import { Heart, Share2, Bookmark, Eye } from 'lucide-react';

interface APTArtworkCardProps {
  artwork: {
    id: string;
    title: string;
    artist: string;
    imageUrl: string;
    likes: number;
    views: number;
    tags: string[];
  };
  className?: string;
  onClick?: () => void;
}

export function APTArtworkCard({ artwork, className, onClick }: APTArtworkCardProps) {
  const { theme, animationEnabled } = useAPTTheme();
  
  // 유형별 카드 스타일 변형
  const getCardVariant = () => {
    const baseStyles = 'relative overflow-hidden transition-all';
    
    switch (theme.personality.type.substring(0, 1)) {
      case 'L': // Lone 타입 - 미니멀한 디자인
        return cn(baseStyles, 'border border-gray-100 hover:border-gray-200');
      case 'S': // Social 타입 - 활발한 디자인
        return cn(baseStyles, 'shadow-lg hover:shadow-xl');
    }
    
    switch (theme.personality.type.substring(1, 2)) {
      case 'A': // Abstract 타입 - 곡선적 디자인
        return cn(baseStyles, 'rounded-2xl');
      case 'R': // Representational 타입 - 직선적 디자인
        return cn(baseStyles, 'rounded-lg');
    }
    
    return baseStyles;
  };
  
  // 애니메이션 변형
  const cardVariants = {
    initial: {
      opacity: 0,
      y: theme.animations.type === 'energetic' ? 20 : 10,
      scale: theme.animations.type === 'minimal' ? 1 : 0.95
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: animationEnabled ? 0.3 : 0,
        ease: theme.animations.easing
      }
    },
    hover: {
      y: theme.interaction.hover === 'transform' ? -5 : 0,
      scale: theme.interaction.hover === 'transform' ? 1.02 : 1,
      transition: {
        duration: 0.2
      }
    }
  };
  
  // 인터랙션 스타일
  const getInteractionStyle = () => {
    switch (theme.interaction.hover) {
      case 'elevated':
        return 'hover:shadow-2xl';
      case 'transform':
        return 'hover:-translate-y-1';
      case 'minimal':
        return 'hover:opacity-95';
      default:
        return '';
    }
  };
  
  // 피드백 스타일
  const getFeedbackIntensity = () => {
    switch (theme.interaction.feedback) {
      case 'subtle':
        return 'opacity-60 hover:opacity-80';
      case 'moderate':
        return 'opacity-70 hover:opacity-100';
      case 'expressive':
        return 'opacity-80 hover:opacity-100 hover:scale-110';
      default:
        return '';
    }
  };

  return (
    <motion.article
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      onClick={onClick}
      className={cn(
        getCardVariant(),
        getInteractionStyle(),
        'cursor-pointer bg-white',
        className
      )}
      style={{
        borderRadius: `var(--apt-roundness)`,
        backgroundColor: theme.colors.surface
      }}
    >
      {/* 이미지 컨테이너 */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <OptimizedImage
          src={artwork.imageUrl}
          alt={artwork.title}
          fill
          className="object-cover transition-transform duration-300"
          style={{
            transform: theme.interaction.hover === 'transform' ? 'scale(1.05)' : 'scale(1)'
          }} placeholder="blur" quality={90}
        />
        
        {/* 오버레이 - 유형별 차별화 */}
        {theme.personality.type.includes('E') && ( // Emotional 타입
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity">
            <div className="absolute bottom-4 left-4 right-4">
              <p className="text-white text-sm">{artwork.artist}</p>
            </div>
          </div>
        )}
        
        {/* 액션 버튼 - 위치와 스타일 유형별 차별화 */}
        <div className={cn(
          "absolute flex gap-2 transition-all",
          theme.layout.style === 'flow' ? 'top-4 right-4' : 'bottom-4 right-4'
        )}>
          <motion.button
            whileTap={{ scale: 0.95 }}
            className={cn(
              "p-2 rounded-full bg-white/90 backdrop-blur-sm",
              getFeedbackIntensity()
            )}
          >
            <Heart size={16} style={{ color: theme.colors.accent }} />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            className={cn(
              "p-2 rounded-full bg-white/90 backdrop-blur-sm",
              getFeedbackIntensity()
            )}
          >
            <Bookmark size={16} style={{ color: theme.colors.primary }} />
          </motion.button>
        </div>
      </div>
      
      {/* 콘텐츠 영역 - 밀도와 레이아웃 유형별 차별화 */}
      <div className={cn(
        "p-4",
        theme.layout.density === 'spacious' && 'p-6',
        theme.layout.density === 'compact' && 'p-3'
      )}>
        <h3 
          className="font-semibold text-lg mb-1 line-clamp-1"
          style={{ color: theme.colors.text }}
        >
          {artwork.title}
        </h3>
        
        <p 
          className="text-sm mb-3"
          style={{ color: theme.colors.muted }}
        >
          {artwork.artist}
        </p>
        
        {/* 메타 정보 - 유형별 표시 방식 차별화 */}
        <div className="flex items-center gap-4 text-sm">
          {theme.personality.type.includes('S') && ( // Social 타입은 상호작용 수치 강조
            <>
              <span className="flex items-center gap-1" style={{ color: theme.colors.muted }}>
                <Heart size={14} />
                {artwork.likes}
              </span>
              <span className="flex items-center gap-1" style={{ color: theme.colors.muted }}>
                <Eye size={14} />
                {artwork.views}
              </span>
            </>
          )}
          
          {theme.personality.type.includes('M') && ( // Meaning-driven 타입은 태그 표시
            <div className="flex flex-wrap gap-1">
              {artwork.tags.slice(0, 2).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs rounded-full"
                  style={{
                    backgroundColor: `${theme.colors.primary}20`,
                    color: theme.colors.primary
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* 클릭 피드백 효과 */}
      {theme.interaction.click === 'ripple' && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="ripple-effect" />
        </div>
      )}
      
      {theme.interaction.click === 'glow' && (
        <div 
          className="absolute inset-0 pointer-events-none opacity-0 hover:opacity-100 transition-opacity"
          style={{
            background: `radial-gradient(circle at center, ${theme.colors.accent}20, transparent)`,
          }}
        />
      )}
    </motion.article>
  );
}