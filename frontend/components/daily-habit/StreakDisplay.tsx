'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Trophy, Calendar, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Streak } from '@/lib/api/daily-habit';

interface StreakDisplayProps {
  streak: Streak;
}

const milestones = [
  { days: 7, label: '일주일', reward: '사유 뱃지', icon: '🏅' },
  { days: 30, label: '한 달', reward: '특별 전시 초대', icon: '🎫' },
  { days: 100, label: '100일', reward: '아트 멘토 매칭', icon: '🎨' }
];

export default function StreakDisplay({ streak }: StreakDisplayProps) {
  const nextMilestone = milestones.find(m => m.days > streak.current_streak) || milestones[2];
  const progressToNext = Math.min(
    (streak.current_streak / nextMilestone.days) * 100,
    100
  );

  return (
    <div className="grid md:grid-cols-3 gap-4">
      {/* Current Streak */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400 to-red-500 rounded-full -mr-16 -mt-16 opacity-20" />
          
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">현재 스트릭</h3>
              <Flame className="w-5 h-5 text-orange-500" />
            </div>
            
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-orange-500">
                {streak.current_streak}
              </span>
              <span className="text-gray-600 mb-1">일 연속</span>
            </div>

            {streak.current_streak > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="mt-3"
              >
                <div className="flex gap-1">
                  {[...Array(Math.min(streak.current_streak, 7))].map((_, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center"
                    >
                      <Flame className="w-4 h-4 text-white" />
                    </div>
                  ))}
                  {streak.current_streak > 7 && (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold">
                      +{streak.current_streak - 7}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Progress to Next Milestone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">다음 목표</h3>
            <Trophy className="w-5 h-5 text-purple-500" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl">{nextMilestone.icon}</span>
              <div className="text-right">
                <p className="font-semibold">{nextMilestone.label}</p>
                <p className="text-sm text-gray-600">{nextMilestone.reward}</p>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>{streak.current_streak}일</span>
                <span>{nextMilestone.days}일</span>
              </div>
              <Progress value={progressToNext} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">
                {nextMilestone.days - streak.current_streak}일 남음
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">통계</h3>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">최장 스트릭</span>
              <span className="font-semibold">{streak.longest_streak}일</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">총 활동일</span>
              <span className="font-semibold">{streak.total_days}일</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">마지막 활동</span>
              <span className="font-semibold">
                {new Date(streak.last_activity_date).toLocaleDateString('ko-KR')}
              </span>
            </div>
          </div>

          {/* Achievement Badges */}
          <div className="flex gap-2 mt-4">
            {streak.achieved_7_days && (
              <Badge variant="default" className="bg-bronze">
                7일 달성
              </Badge>
            )}
            {streak.achieved_30_days && (
              <Badge variant="default" className="bg-silver">
                30일 달성
              </Badge>
            )}
            {streak.achieved_100_days && (
              <Badge variant="default" className="bg-gold">
                100일 달성
              </Badge>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}