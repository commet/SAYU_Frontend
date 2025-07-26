'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Calendar, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  className?: string;
}

export function StreakDisplay({
  currentStreak,
  longestStreak,
  lastActivityDate,
  className,
}: StreakDisplayProps) {
  const isActive = currentStreak > 0;
  const streakColor = currentStreak >= 7 ? 'text-orange-500' : 'text-gray-400';

  return (
    <Card className={cn('w-full', className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              animate={isActive ? {
                scale: [1, 1.2, 1],
                rotate: [0, -10, 10, 0],
              } : {}}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3,
              }}
              className={cn('relative', streakColor)}
            >
              <Flame className="h-12 w-12" />
              {currentStreak >= 7 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold"
                >
                  {Math.floor(currentStreak / 7)}
                </motion.div>
              )}
            </motion.div>
            
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-bold">{currentStreak}일</h3>
                {currentStreak >= 3 && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-sm font-medium text-orange-500"
                  >
                    🔥 연속 접속중!
                  </motion.span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">현재 스트릭</p>
            </div>
          </div>
          
          <div className="text-right space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">최고 기록:</span>
              <span className="font-semibold">{longestStreak}일</span>
            </div>
            
            {lastActivityDate && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">마지막 활동:</span>
                <span className="font-medium">
                  {new Date(lastActivityDate).toLocaleDateString('ko-KR')}
                </span>
              </div>
            )}
          </div>
        </div>
        
        {currentStreak > 0 && currentStreak % 7 === 6 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg"
          >
            <p className="text-sm text-orange-800 dark:text-orange-200 text-center">
              🎯 내일 접속하면 <strong>7일 연속 접속</strong> 달성! (+50 XP)
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}