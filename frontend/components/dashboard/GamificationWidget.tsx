'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy,
  Target,
  Zap,
  TrendingUp,
  ChevronRight,
  Star,
  Crown
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface GamificationWidgetProps {
  className?: string;
}

export function GamificationWidget({ className }: GamificationWidgetProps) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with actual API call
    setTimeout(() => {
      setStats({
        level: 27,
        currentXP: 2750,
        nextLevelXP: 3000,
        rank: 127,
        activeChallenges: [
          {
            id: '1',
            title: '주말 미술관 정복',
            progress: 1,
            target: 2,
            reward: 200,
            icon: '🏛️'
          },
          {
            id: '2',
            title: '감정 표현 마스터',
            progress: 8,
            target: 10,
            reward: 150,
            icon: '💭'
          }
        ],
        recentAchievement: {
          title: 'K-아트 서포터',
          description: '한국 작가전 10회 달성',
          rarity: 'rare'
        }
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const xpProgress = ((stats.currentXP % 1000) / 1000) * 100;

  return (
    <Card className={cn("hover:shadow-lg transition-shadow", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-purple-600" />
            게이미피케이션
          </CardTitle>
          <Badge variant="outline" className="gap-1">
            <Crown className="h-3 w-3" />
            {stats.rank}위
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Level Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                {stats.level}
              </div>
              <div>
                <p className="text-sm font-medium">레벨 {stats.level}</p>
                <p className="text-xs text-muted-foreground">눈뜨는 중</p>
              </div>
            </div>
            <span className="text-sm font-medium">
              {stats.currentXP}/{stats.nextLevelXP}
            </span>
          </div>
          <Progress value={xpProgress} className="h-2" />
        </div>

        {/* Active Challenges */}
        <div className="space-y-2">
          <p className="text-sm font-medium flex items-center gap-2">
            <Target className="h-4 w-4" />
            진행 중인 도전과제
          </p>
          {stats.activeChallenges.map((challenge: any) => (
            <motion.div
              key={challenge.id}
              whileHover={{ scale: 1.02 }}
              className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{challenge.icon}</span>
                  <span className="text-sm font-medium">{challenge.title}</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  +{challenge.reward}
                </Badge>
              </div>
              <div className="space-y-1">
                <Progress 
                  value={(challenge.progress / challenge.target) * 100} 
                  className="h-1.5"
                />
                <p className="text-xs text-muted-foreground text-right">
                  {challenge.progress}/{challenge.target}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Recent Achievement */}
        {stats.recentAchievement && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg"
          >
            <div className="flex items-center gap-2 mb-1">
              <Star className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">최근 획득</span>
            </div>
            <p className="text-sm font-medium">{stats.recentAchievement.title}</p>
            <p className="text-xs text-muted-foreground">
              {stats.recentAchievement.description}
            </p>
          </motion.div>
        )}

        {/* View All Button */}
        <Button asChild variant="outline" className="w-full">
          <Link href="/profile/gamification">
            전체 보기
            <ChevronRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}