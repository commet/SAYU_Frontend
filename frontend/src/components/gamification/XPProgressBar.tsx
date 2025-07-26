'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface XPProgressBarProps {
  currentXP: number;
  totalXP: number;
  nextLevelXP: number;
  progressToNextLevel: number;
  levelColor: string;
  className?: string;
  showNumbers?: boolean;
}

export function XPProgressBar({
  currentXP,
  totalXP,
  nextLevelXP,
  progressToNextLevel,
  levelColor,
  className,
  showNumbers = true,
}: XPProgressBarProps) {
  return (
    <div className={cn('w-full', className)}>
      <div className="relative h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressToNextLevel}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            background: `linear-gradient(90deg, ${levelColor}cc 0%, ${levelColor} 100%)`,
          }}
        >
          <div className="absolute inset-0 bg-white/20 animate-pulse" />
        </motion.div>
        
        {showNumbers && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
              {currentXP} / {nextLevelXP - totalXP + currentXP} XP
            </span>
          </div>
        )}
      </div>
      
      {showNumbers && (
        <div className="flex justify-between mt-1 text-xs text-muted-foreground">
          <span>현재: {totalXP} XP</span>
          <span>다음 레벨: {nextLevelXP} XP</span>
        </div>
      )}
    </div>
  );
}