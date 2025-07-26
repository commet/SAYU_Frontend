'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Target,
  Trophy,
  Clock,
  TrendingUp,
  Award,
  Star,
  Zap,
  CheckCircle2,
  Circle,
  Lock,
  Calendar,
  BarChart
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface UserJourneyWidgetProps {
  user: any;
  activityStats: any;
  className?: string;
}

export function UserJourneyWidget({ user, activityStats, className }: UserJourneyWidgetProps) {
  const [activeView, setActiveView] = useState<'roadmap' | 'achievements' | 'stats'>('roadmap');

  // Mock journey data
  const journeyStages = [
    {
      id: 'novice',
      title: '예술 입문자',
      level: '1-10',
      description: '기본 기능을 익히고 첫 컬렉션을 만들어보세요',
      milestones: [
        { title: 'APT 테스트 완료', completed: true },
        { title: '첫 컬렉션 생성', completed: true },
        { title: '10개 작품 수집', completed: true },
        { title: '첫 감상 작성', completed: false }
      ],
      status: 'completed'
    },
    {
      id: 'explorer',
      title: '예술 탐험가',
      level: '11-30',
      description: '다양한 예술 작품을 탐험하고 취향을 발견하세요',
      milestones: [
        { title: '5개 컬렉션 생성', completed: true },
        { title: 'Daily Art 7일 연속', completed: true },
        { title: 'Art Pulse 10회 참여', completed: false },
        { title: '커뮤니티 기능 해금', completed: false }
      ],
      status: 'current'
    },
    {
      id: 'connoisseur',
      title: '예술 애호가',
      level: '31-50',
      description: '깊이 있는 감상과 커뮤니티 활동을 즐기세요',
      milestones: [
        { title: '감상 교환 20회', locked: true },
        { title: '전시 동행 5회', locked: true },
        { title: '큐레이터 배지 획득', locked: true },
        { title: '100개 작품 수집', locked: true }
      ],
      status: 'locked'
    },
    {
      id: 'curator',
      title: '아트 큐레이터',
      level: '51+',
      description: '당신만의 전시를 기획하고 다른 사용자들을 이끌어주세요',
      milestones: [
        { title: '가상 전시 개최', locked: true },
        { title: '멘토 활동', locked: true },
        { title: '아트 인플루언서', locked: true },
        { title: 'SAYU 앰배서더', locked: true }
      ],
      status: 'locked'
    }
  ];

  const achievements = [
    {
      id: '1',
      title: '첫 발자국',
      description: 'SAYU에 가입하고 첫 활동 시작',
      icon: '👣',
      earnedAt: new Date('2024-01-15'),
      rarity: 'common'
    },
    {
      id: '2',
      title: '컬렉터의 시작',
      description: '첫 번째 컬렉션 생성',
      icon: '📚',
      earnedAt: new Date('2024-01-20'),
      rarity: 'common'
    },
    {
      id: '3',
      title: '일주일 연속',
      description: '7일 연속 로그인',
      icon: '🔥',
      earnedAt: new Date('2024-02-01'),
      rarity: 'rare'
    }
  ];

  const stats = {
    totalDays: activityStats?.activeDays || 45,
    artworksViewed: 342,
    reflectionsWritten: 28,
    communityInteractions: 15,
    monthlyGrowth: 23.5,
    favoriteArtist: '클로드 모네',
    favoriteGenre: '인상주의'
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Journey Header */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-6 w-6 text-purple-600" />
            나의 예술 여정
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-2xl font-bold">예술 탐험가</p>
              <p className="text-muted-foreground">레벨 27 • 상위 15%</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">다음 단계까지</p>
              <p className="text-lg font-semibold">3개 마일스톤</p>
            </div>
          </div>
          <Progress value={65} className="h-3" />
        </CardContent>
      </Card>

      {/* View Tabs */}
      <Tabs value={activeView} onValueChange={(value: any) => setActiveView(value)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="roadmap">로드맵</TabsTrigger>
          <TabsTrigger value="achievements">업적</TabsTrigger>
          <TabsTrigger value="stats">통계</TabsTrigger>
        </TabsList>

        {/* Roadmap View */}
        <TabsContent value="roadmap" className="space-y-4">
          {journeyStages.map((stage, index) => (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={cn(
                "transition-all",
                stage.status === 'current' && "border-purple-500 shadow-lg",
                stage.status === 'locked' && "opacity-60"
              )}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center",
                        stage.status === 'completed' && "bg-green-100 text-green-600",
                        stage.status === 'current' && "bg-purple-100 text-purple-600",
                        stage.status === 'locked' && "bg-gray-100 text-gray-400"
                      )}>
                        {stage.status === 'completed' && <CheckCircle2 className="h-6 w-6" />}
                        {stage.status === 'current' && <Target className="h-6 w-6" />}
                        {stage.status === 'locked' && <Lock className="h-6 w-6" />}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{stage.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">레벨 {stage.level}</p>
                      </div>
                    </div>
                    {stage.status === 'current' && (
                      <Badge variant="default">진행 중</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{stage.description}</p>
                  <div className="space-y-2">
                    {stage.milestones.map((milestone, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        {milestone.completed ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : milestone.locked ? (
                          <Lock className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Circle className="h-4 w-4 text-gray-400" />
                        )}
                        <span className={cn(
                          milestone.completed && "text-green-600",
                          milestone.locked && "text-gray-400"
                        )}>
                          {milestone.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        {/* Achievements View */}
        <TabsContent value="achievements" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement) => (
              <motion.div
                key={achievement.id}
                whileHover={{ scale: 1.02 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-3xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{achievement.title}</h4>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={
                            achievement.rarity === 'legendary' ? 'default' :
                            achievement.rarity === 'epic' ? 'secondary' :
                            achievement.rarity === 'rare' ? 'outline' : 'secondary'
                          } className="text-xs">
                            {achievement.rarity === 'legendary' && '전설'}
                            {achievement.rarity === 'epic' && '영웅'}
                            {achievement.rarity === 'rare' && '희귀'}
                            {achievement.rarity === 'common' && '일반'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {achievement.earnedAt.toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          <div className="text-center">
            <Button variant="outline" asChild>
              <Link href="/profile/achievements">
                모든 업적 보기
              </Link>
            </Button>
          </div>
        </TabsContent>

        {/* Stats View */}
        <TabsContent value="stats" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart className="h-4 w-4" />
                  활동 통계
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">총 활동일</span>
                  <span className="font-medium">{stats.totalDays}일</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">감상한 작품</span>
                  <span className="font-medium">{stats.artworksViewed}개</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">작성한 감상</span>
                  <span className="font-medium">{stats.reflectionsWritten}개</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">커뮤니티 활동</span>
                  <span className="font-medium">{stats.communityInteractions}회</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  취향 분석
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">선호 작가</span>
                  <span className="font-medium">{stats.favoriteArtist}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">선호 장르</span>
                  <span className="font-medium">{stats.favoriteGenre}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">월간 성장률</span>
                  <span className="font-medium text-green-600">+{stats.monthlyGrowth}%</span>
                </div>
                <div className="pt-2">
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href="/profile/analysis">
                      상세 분석 보기
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}