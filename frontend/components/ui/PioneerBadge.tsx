'use client';

import { motion } from 'framer-motion';
import { Star, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface PioneerBadgeProps {
  pioneerNumber: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal' | 'celebration';
  showAnimation?: boolean;
  className?: string;
}

export function PioneerBadge({ 
  pioneerNumber, 
  size = 'md', 
  variant = 'default',
  showAnimation = false,
  className = '' 
}: PioneerBadgeProps) {
  const { language } = useLanguage();

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4', 
    lg: 'w-5 h-5'
  };

  const getBadgeContent = () => {
    switch (variant) {
      case 'minimal':
        return `#${pioneerNumber}`;
      case 'celebration':
        return language === 'ko' 
          ? `🎉 Pioneer #${pioneerNumber}` 
          : `🎉 Pioneer #${pioneerNumber}`;
      default:
        return language === 'ko' 
          ? `Pioneer #${pioneerNumber}` 
          : `Pioneer #${pioneerNumber}`;
    }
  };

  const badgeElement = (
    <div className={`
      inline-flex items-center gap-1.5 rounded-full
      bg-gradient-to-r from-purple-500/20 to-pink-500/20
      border border-purple-500/30
      text-purple-700 font-medium
      backdrop-blur-sm
      ${sizeClasses[size]}
      ${className}
    `}>
      {variant !== 'minimal' && (
        <Star className={`${iconSizes[size]} text-purple-600`} />
      )}
      <span>{getBadgeContent()}</span>
      {variant === 'celebration' && (
        <Sparkles className={`${iconSizes[size]} text-purple-600`} />
      )}
    </div>
  );

  if (showAnimation) {
    return (
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ 
          type: "spring", 
          stiffness: 260, 
          damping: 20,
          delay: 0.3
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {badgeElement}
      </motion.div>
    );
  }

  return badgeElement;
}

// 실시간 카운터 컴포넌트
interface PioneerCounterProps {
  currentCount: number;
  maxCount?: number;
  isLoading?: boolean;
}

export function PioneerCounter({ 
  currentCount, 
  maxCount = 100, 
  isLoading = false 
}: PioneerCounterProps) {
  const { language } = useLanguage();
  const remaining = maxCount - currentCount;

  if (isLoading) {
    return (
      <div className="text-center p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-32 mx-auto mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-24 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="text-center p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="text-3xl font-bold text-purple-600 mb-2"
        key={currentCount}
        initial={{ scale: 1.2 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {currentCount}
      </motion.div>
      
      <div className="text-sm text-gray-600">
        {language === 'ko' 
          ? `${remaining}자리 남았습니다`
          : `${remaining} spots remaining`
        }
      </div>
      
      {/* 진행률 바 */}
      <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
        <motion.div 
          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${(currentCount / maxCount) * 100}%` }}
          transition={{ duration: 1, delay: 0.5 }}
        />
      </div>
    </motion.div>
  );
}