'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Trophy, 
  Flame, 
  Star, 
  TrendingUp,
  Crown,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

interface ProfileSummaryWidgetProps {
  user: any;
  activityStats: any;
  communityStatus: any;
}

export function ProfileSummaryWidget({ 
  user, 
  activityStats, 
  communityStatus 
}: ProfileSummaryWidgetProps) {
  // Mock data for now - replace with actual API calls
  const level = 27;
  const levelName = "눈뜨는 중";
  const currentXP = 2750;
  const nextLevelXP = 3000;
  const mainTitle = "느긋한 산책자";
  const weeklyStreak = activityStats?.streak || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden"
    >
      <Card className="bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-indigo-950/20 p-6 border-0">
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            {/* Left: User Info & Level */}
            <div className="flex items-center gap-4">
              {/* Level Badge */}
              <motion.div 
                className="relative"
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                  {level}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 rounded-full p-1 shadow-md">
                  <Crown className="w-4 h-4 text-purple-600" />
                </div>
              </motion.div>

              {/* User Details */}
              <div>
                <h1 className="text-3xl font-bold">
                  안녕하세요, {user?.nickname || user?.auth?.user_metadata?.full_name || user?.auth?.user_metadata?.name || '예술 탐험가'}님! 👋
                </h1>
                <p className="text-muted-foreground mt-1">
                  오늘도 예술과 함께하는 하루 되세요
                </p>
                <div className="flex items-center gap-3 mt-3">
                  <Badge variant="secondary" className="bg-white/80 dark:bg-gray-800/80">
                    <Star className="w-3 h-3 mr-1" />
                    Lv.{level} {levelName}
                  </Badge>
                  <Badge variant="outline" className="bg-white/80 dark:bg-gray-800/80">
                    <Trophy className="w-3 h-3 mr-1" />
                    {mainTitle}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Right: Stats & Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* Streak Display */}
              {weeklyStreak > 0 && (
                <motion.div 
                  className="flex items-center gap-2"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Flame className="w-8 h-8 text-orange-500" />
                  <div>
                    <p className="text-2xl font-bold text-orange-600">{weeklyStreak}일</p>
                    <p className="text-xs text-muted-foreground">연속 활동</p>
                  </div>
                </motion.div>
              )}

              {/* Quick Actions */}
              <div className="flex flex-col gap-2">
                <Button asChild size="sm" className="bg-purple-600 hover:bg-purple-700">
                  <Link href="/daily-art">
                    <Sparkles className="w-4 h-4 mr-2" />
                    오늘의 예술
                  </Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link href="/profile">
                    프로필 보기
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Level Progress */}
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">다음 레벨까지</span>
              <span className="font-medium">
                {currentXP} / {nextLevelXP} XP
              </span>
            </div>
            <Progress 
              value={(currentXP / nextLevelXP) * 100} 
              className="h-2 bg-white/50 dark:bg-gray-800/50"
            />
          </div>

          {/* Community Status Alert */}
          {!communityStatus?.isUnlocked && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 p-3 bg-amber-100/50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800"
            >
              <p className="text-sm text-amber-800 dark:text-amber-200 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                커뮤니티 기능까지 {3 - (activityStats?.collectionsCreated || 0)}개의 컬렉션 생성이 필요해요!
              </p>
            </motion.div>
          )}
        </div>

        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-300/20 to-pink-300/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-indigo-300/20 to-purple-300/20 rounded-full blur-3xl" />
      </Card>
    </motion.div>
  );
}