'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Gift, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DailyQuest } from '@/types/gamification';

interface DailyQuestListProps {
  quests: DailyQuest[];
  className?: string;
}

export function DailyQuestList({ quests, className }: DailyQuestListProps) {
  const totalCompleted = quests.filter(q => q.completed).length;
  const totalQuests = quests.length;
  const completionRate = totalQuests > 0 ? (totalCompleted / totalQuests) * 100 : 0;

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            일일 퀘스트
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            {totalCompleted}/{totalQuests} 완료
          </div>
        </div>
        <Progress value={completionRate} className="h-2 mt-2" />
      </CardHeader>
      
      <CardContent className="space-y-3">
        {quests.map((quest, index) => (
          <motion.div
            key={quest.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              'flex items-center justify-between p-3 rounded-lg border',
              quest.completed
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
            )}
          >
            <div className="flex items-center gap-3">
              {quest.completed ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              ) : (
                <Circle className="h-5 w-5 text-gray-400" />
              )}
              
              <div>
                <h4 className={cn(
                  'font-medium',
                  quest.completed && 'line-through text-muted-foreground'
                )}>
                  {quest.name}
                </h4>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{quest.progress}/{quest.required}</span>
                  <span className="flex items-center gap-1">
                    <Gift className="h-3 w-3" />
                    +{quest.xp} XP
                  </span>
                </div>
              </div>
            </div>
            
            {quest.progress > 0 && !quest.completed && (
              <div className="w-16">
                <Progress 
                  value={(quest.progress / (quest.required || 1)) * 100} 
                  className="h-2"
                />
              </div>
            )}
          </motion.div>
        ))}
        
        {totalCompleted === totalQuests && totalQuests > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-4"
          >
            <p className="text-sm font-medium text-green-600 dark:text-green-400">
              🎉 모든 일일 퀘스트 완료! 내일 다시 도전하세요!
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}