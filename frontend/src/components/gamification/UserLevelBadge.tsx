'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface UserLevelBadgeProps {
  level: number;
  levelName: string;
  levelColor: string;
  levelIcon: string;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  className?: string;
}

export function UserLevelBadge({
  level,
  levelName,
  levelColor,
  levelIcon,
  size = 'md',
  showName = true,
  className,
}: UserLevelBadgeProps) {
  const sizeClasses = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-12 w-12 text-lg',
    lg: 'h-16 w-16 text-2xl',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      className={cn('flex items-center gap-2', className)}
    >
      <div
        className={cn(
          'relative flex items-center justify-center rounded-full shadow-lg',
          sizeClasses[size]
        )}
        style={{
          background: `linear-gradient(135deg, ${levelColor} 0%, ${levelColor}99 100%)`,
        }}
      >
        <span className="text-white font-bold">{level}</span>
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(from 0deg, transparent, ${levelColor}33, transparent)`,
          }}
        />
      </div>
      
      {showName && (
        <div className="flex flex-col">
          <span className={cn('font-semibold', textSizeClasses[size])}>
            {levelName}
          </span>
          <span className={cn('text-muted-foreground', textSizeClasses[size])}>
            레벨 {level} {levelIcon}
          </span>
        </div>
      )}
    </motion.div>
  );
}