'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Target, Award, Users } from 'lucide-react';
import { useUserStats, useDailyQuests, useDailyLogin } from '@/hooks/useGamification';
import { UserLevelBadge } from './UserLevelBadge';
import { XPProgressBar } from './XPProgressBar';
import { DailyQuestList } from './DailyQuestList';
import { StreakDisplay } from './StreakDisplay';
import { Leaderboard } from './Leaderboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function GamificationDashboard() {
  const { stats: userStats, isLoading: statsLoading } = useUserStats();
  const { quests: dailyQuests, isLoading: questsLoading } = useDailyQuests();
  const dailyLogin = useDailyLogin();

  React.useEffect(() => {
    // 자동 일일 로그인 처리
    if (userStats && !dailyLogin.isCheckingIn) {
      dailyLogin.checkIn();
    }
  }, [userStats]);

  if (statsLoading || !userStats) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* 헤더 섹션 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <UserLevelBadge
              level={userStats.level}
              levelName={userStats.levelName}
              levelColor={userStats.levelColor}
              levelIcon={userStats.levelIcon}
              size="lg"
              showName={true}
              className="text-white"
            />
            {userStats.weeklyRank && (
              <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1">
                <Users className="h-4 w-4" />
                <span className="text-sm font-medium">주간 #{userStats.weeklyRank}</span>
              </div>
            )}
          </div>
          
          <div className="text-right">
            <p className="text-sm opacity-80">총 경험치</p>
            <p className="text-2xl font-bold">{userStats.totalXP.toLocaleString()} XP</p>
          </div>
        </div>
        
        <XPProgressBar
          currentXP={userStats.currentLevelXP}
          totalXP={userStats.totalXP}
          nextLevelXP={userStats.nextLevelXP}
          progressToNextLevel={userStats.progress}
          levelColor="#ffffff"
          showNumbers={true}
        />
      </motion.div>

      {/* 스트릭 표시 */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <StreakDisplay
          currentStreak={0}
          longestStreak={0}
          lastActivityDate={new Date()}
        />
      </motion.div>

      {/* 탭 섹션 */}
      <Tabs defaultValue="quests" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="quests" className="gap-2">
            <Target className="h-4 w-4" />
            퀘스트
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="gap-2">
            <Award className="h-4 w-4" />
            순위
          </TabsTrigger>
          <TabsTrigger value="rewards" className="gap-2">
            <Sparkles className="h-4 w-4" />
            보상
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quests" className="mt-4">
          {questsLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <DailyQuestList quests={dailyQuests || []} />
          )}
        </TabsContent>

        <TabsContent value="leaderboard" className="mt-4">
          <Leaderboard />
        </TabsContent>

        <TabsContent value="rewards" className="mt-4">
          <RewardsSection totalRewards={userStats.totalXP} />
        </TabsContent>
      </Tabs>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          title="일일 퀘스트"
          value={`${dailyQuests?.filter(q => q.completed).length || 0}/${dailyQuests?.length || 0}`}
          description="오늘 완료한 퀘스트"
          icon={<Target className="h-4 w-4" />}
        />
        <StatsCard
          title="보상 획득"
          value={userStats.totalXP}
          description="잠금 해제된 보상"
          icon={<Award className="h-4 w-4" />}
        />
        <StatsCard
          title="주간 활동"
          value="-"
          description="현재 주간 순위"
          icon={<Users className="h-4 w-4" />}
        />
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-32 w-full" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
    </div>
  );
}

function StatsCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
          {icon}
        </div>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}

function RewardsSection({ totalRewards }: { totalRewards: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>보상 & 업적</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Sparkles className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
          <p className="text-lg font-semibold mb-2">{totalRewards}개의 보상 획득!</p>
          <p className="text-sm text-muted-foreground mb-4">
            레벨업하고 퀘스트를 완료하여 더 많은 보상을 잠금 해제하세요.
          </p>
          <Button variant="outline" size="sm">
            모든 보상 보기
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}