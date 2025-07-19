'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Sparkles, TrendingUp, ChevronRight, Lock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { dailyChallengeApi } from '@/lib/api/daily-challenge';
import { userActivityApi } from '@/lib/api/collections';
import type { ChallengeMatch, DailyChallengeStats } from '@/types/daily-challenge';
import { cn } from '@/lib/utils';

interface MatchResultsProps {
  challengeDate?: string;
}

export function MatchResults({ challengeDate }: MatchResultsProps) {
  const [matches, setMatches] = useState<ChallengeMatch[]>([]);
  const [stats, setStats] = useState<DailyChallengeStats | null>(null);
  const [communityUnlocked, setCommunityUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [challengeDate]);

  const loadData = async () => {
    try {
      const date = challengeDate || new Date().toISOString().split('T')[0];
      
      // 커뮤니티 잠금 해제 확인
      const communityStatus = await userActivityApi.checkCommunityUnlock();
      setCommunityUnlocked(communityStatus.isUnlocked);

      if (communityStatus.isUnlocked) {
        const [matchData, statsData] = await Promise.all([
          dailyChallengeApi.getTodayMatches(),
          dailyChallengeApi.getChallengeStats(date)
        ]);
        
        setMatches(matchData);
        setStats(statsData);
      }
    } catch (error) {
      console.error('Failed to load match results:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <MatchResultsSkeleton />;
  }

  if (!communityUnlocked) {
    return (
      <Card>
        <CardHeader className="text-center">
          <Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <CardTitle>커뮤니티 기능 잠금</CardTitle>
          <CardDescription>
            더 많은 활동을 통해 다른 사용자와의 매칭 기능을 열어보세요
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Tabs defaultValue="matches" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="matches">
          <Users className="h-4 w-4 mr-2" />
          오늘의 매칭
        </TabsTrigger>
        <TabsTrigger value="stats">
          <TrendingUp className="h-4 w-4 mr-2" />
          통계
        </TabsTrigger>
      </TabsList>

      <TabsContent value="matches" className="mt-6">
        <div className="space-y-4">
          {matches.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">
                  아직 매칭 결과가 없습니다. 더 많은 사용자가 참여하면 매칭이 생성됩니다.
                </p>
              </CardContent>
            </Card>
          ) : (
            matches.map((match, index) => (
              <MatchCard key={match.id} match={match} rank={index + 1} />
            ))
          )}
        </div>
      </TabsContent>

      <TabsContent value="stats" className="mt-6">
        {stats && <ChallengeStats stats={stats} />}
      </TabsContent>
    </Tabs>
  );
}

function MatchCard({ match, rank }: { match: ChallengeMatch; rank: number }) {
  const matchPercentage = Math.round(match.total_match_score * 100);
  const isTopMatch = rank <= 3;

  return (
    <Card className={cn("transition-all hover:shadow-md", isTopMatch && "border-primary")}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {/* 순위 */}
            <div className={cn(
              "flex items-center justify-center w-10 h-10 rounded-full font-bold",
              isTopMatch ? "bg-primary text-primary-foreground" : "bg-muted"
            )}>
              {rank}
            </div>

            {/* 매칭 사용자 정보 */}
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={match.matched_user?.profile_image_url} />
                <AvatarFallback>
                  {match.matched_user?.username?.[0] || '?'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{match.matched_user?.username}</p>
                <p className="text-sm text-muted-foreground">
                  {match.matched_user?.apt_type}
                </p>
              </div>
            </div>
          </div>

          {/* 매칭 점수 */}
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              {matchPercentage}%
            </div>
            <p className="text-xs text-muted-foreground">매칭도</p>
          </div>
        </div>

        {/* 매칭 상세 점수 */}
        <div className="mt-4 space-y-2">
          <MatchScoreBar 
            label="APT 궁합" 
            score={match.apt_compatibility_score} 
          />
          <MatchScoreBar 
            label="취향 유사도" 
            score={match.taste_similarity_score} 
          />
          <MatchScoreBar 
            label="오늘의 감정" 
            score={match.emotion_match_score} 
          />
        </div>

        {/* 상호작용 버튼 */}
        <div className="mt-4 flex gap-2">
          <Button size="sm" variant="outline" className="flex-1">
            프로필 보기
          </Button>
          <Button size="sm" className="flex-1">
            <Sparkles className="h-4 w-4 mr-2" />
            감상 교환 신청
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function MatchScoreBar({ label, score }: { label: string; score: number }) {
  const percentage = Math.round(score * 100);
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{percentage}%</span>
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  );
}

function ChallengeStats({ stats }: { stats: DailyChallengeStats }) {
  return (
    <div className="space-y-6">
      {/* 참여 현황 */}
      <Card>
        <CardHeader>
          <CardTitle>참여 현황</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.total_responses}명</div>
          <p className="text-muted-foreground">오늘 챌린지에 참여</p>
        </CardContent>
      </Card>

      {/* 인기 감정 */}
      <Card>
        <CardHeader>
          <CardTitle>가장 많이 선택된 감정</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {stats.top_emotions.slice(0, 5).map((emotion, index) => (
            <div key={emotion.emotion} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant={index === 0 ? "default" : "secondary"}>
                  #{index + 1}
                </Badge>
                <span className="font-medium">{emotion.emotion}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {emotion.count}명
                </span>
                <Progress 
                  value={emotion.percentage} 
                  className="h-2 w-24"
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* APT 분포 */}
      <Card>
        <CardHeader>
          <CardTitle>APT 유형별 참여</CardTitle>
          <CardDescription>
            어떤 성격 유형이 오늘 작품에 반응했는지
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(stats.apt_distribution)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 8)
              .map(([apt, count]) => (
                <div key={apt} className="flex justify-between p-2 bg-muted rounded">
                  <span className="text-sm font-medium">{apt}</span>
                  <span className="text-sm text-muted-foreground">{count}명</span>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MatchResultsSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-8 w-16" />
            </div>
            <div className="mt-4 space-y-2">
              <Skeleton className="h-2 w-full" />
              <Skeleton className="h-2 w-full" />
              <Skeleton className="h-2 w-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}