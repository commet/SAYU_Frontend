'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Users, Sparkles, TrendingUp, ChevronRight, Lock, Filter, Check, X, RefreshCw, Bell } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { dailyChallengeApi } from '@/lib/api/daily-challenge';
import { userActivityApi } from '@/lib/api/collections';
import type { ChallengeMatch, DailyChallengeStats } from '@/types/daily-challenge';
import { cn } from '@/lib/utils';

interface MatchResultsProps {
  challengeDate?: string;
}

// 필터 옵션 타입
interface FilterOptions {
  minMatchScore: number;
  showOnlyCompatibleAPT: boolean;
  showOnlyHighEmotion: boolean;
  sortBy: 'score' | 'apt' | 'emotion' | 'recent';
}

// 매치 상태 타입
type MatchStatus = 'pending' | 'accepted' | 'rejected' | 'hidden';

interface MatchWithStatus extends ChallengeMatch {
  status?: MatchStatus;
}

export function MatchResults({ challengeDate }: MatchResultsProps) {
  const [matches, setMatches] = useState<MatchWithStatus[]>([]);
  const [stats, setStats] = useState<DailyChallengeStats | null>(null);
  const [communityUnlocked, setCommunityUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  
  // 필터 상태
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    minMatchScore: 0,
    showOnlyCompatibleAPT: false,
    showOnlyHighEmotion: false,
    sortBy: 'score'
  });
  
  // 실시간 업데이트를 위한 인터벌
  useEffect(() => {
    if (autoRefresh && communityUnlocked) {
      const interval = setInterval(() => {
        loadData(true);
      }, 30000); // 30초마다 업데이트
      
      return () => clearInterval(interval);
    }
  }, [autoRefresh, communityUnlocked, challengeDate]);

  useEffect(() => {
    loadData();
  }, [challengeDate]);

  const loadData = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      else setIsRefreshing(true);
      
      const date = challengeDate || new Date().toISOString().split('T')[0];
      
      // 커뮤니티 잠금 해제 확인
      const communityStatus = await userActivityApi.checkCommunityUnlock();
      setCommunityUnlocked(communityStatus.isUnlocked);

      if (communityStatus.isUnlocked) {
        const [matchData, statsData] = await Promise.all([
          dailyChallengeApi.getTodayMatches(),
          dailyChallengeApi.getChallengeStats(date)
        ]);
        
        // 로컬 스토리지에서 매치 상태 가져오기
        const matchStatuses = JSON.parse(localStorage.getItem('matchStatuses') || '{}');
        
        const matchesWithStatus = (matchData || []).map(match => ({
          ...match,
          status: matchStatuses[match.id] || 'pending'
        }));
        
        setMatches(matchesWithStatus);
        setStats(statsData);
        
        if (silent && matchData.length > matches.length) {
          toast({
            title: "새로운 매칭!",
            description: `${matchData.length - matches.length}개의 새로운 매칭이 발견되었습니다.`,
          });
        }
      }
    } catch (error) {
      console.error('Failed to load match results:', error);
      if (!silent) {
        toast({
          title: "오류",
          description: "매칭 결과를 불러오는데 실패했습니다.",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // 매치 상태 업데이트
  const updateMatchStatus = useCallback((matchId: string, status: MatchStatus) => {
    setMatches(prev => {
      const updated = prev.map(match => 
        match.id === matchId ? { ...match, status } : match
      );
      
      // 로컬 스토리지에 저장
      const statuses = updated.reduce((acc, match) => ({
        ...acc,
        [match.id]: match.status
      }), {});
      localStorage.setItem('matchStatuses', JSON.stringify(statuses));
      
      return updated;
    });
    
    toast({
      title: status === 'accepted' ? "매칭 수락됨" : status === 'rejected' ? "매칭 거절됨" : "매칭 숨김",
      description: status === 'accepted' ? "상대방에게 알림이 전송되었습니다." : undefined,
    });
  }, []);

  // 필터링된 매치 목록
  const filteredMatches = React.useMemo(() => {
    let filtered = matches.filter(match => match.status !== 'hidden');
    
    // 점수 필터
    if (filterOptions.minMatchScore > 0) {
      filtered = filtered.filter(match => 
        (match.match_score || 0) >= filterOptions.minMatchScore / 100
      );
    }
    
    // APT 호환성 필터
    if (filterOptions.showOnlyCompatibleAPT) {
      filtered = filtered.filter(match => 
        (match.apt_compatibility || 0) >= 0.7
      );
    }
    
    // 감정 유사도 필터
    if (filterOptions.showOnlyHighEmotion) {
      filtered = filtered.filter(match => 
        (match.emotion_similarity || 0) >= 0.6
      );
    }
    
    // 정렬
    switch (filterOptions.sortBy) {
      case 'apt':
        filtered.sort((a, b) => (b.apt_compatibility || 0) - (a.apt_compatibility || 0));
        break;
      case 'emotion':
        filtered.sort((a, b) => (b.emotion_similarity || 0) - (a.emotion_similarity || 0));
        break;
      case 'recent':
        filtered.reverse(); // 최신순
        break;
      default: // 'score'
        filtered.sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
    }
    
    return filtered.slice(0, 10); // 상위 10개만
  }, [matches, filterOptions]);

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
        {/* 필터 및 옵션 바 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {/* 필터 드롭다운 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  필터
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                <DropdownMenuLabel>매칭 필터</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <div className="p-2 space-y-2">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">최소 매칭 점수</label>
                    <Select
                      value={filterOptions.minMatchScore.toString()}
                      onValueChange={(value) => 
                        setFilterOptions(prev => ({ ...prev, minMatchScore: parseInt(value) }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">전체</SelectItem>
                        <SelectItem value="50">50% 이상</SelectItem>
                        <SelectItem value="70">70% 이상</SelectItem>
                        <SelectItem value="80">80% 이상</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuCheckboxItem
                  checked={filterOptions.showOnlyCompatibleAPT}
                  onCheckedChange={(checked) => 
                    setFilterOptions(prev => ({ ...prev, showOnlyCompatibleAPT: checked }))
                  }
                >
                  호환되는 APT만 표시
                </DropdownMenuCheckboxItem>
                
                <DropdownMenuCheckboxItem
                  checked={filterOptions.showOnlyHighEmotion}
                  onCheckedChange={(checked) => 
                    setFilterOptions(prev => ({ ...prev, showOnlyHighEmotion: checked }))
                  }
                >
                  높은 감정 유사도만 표시
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* 정렬 선택 */}
            <Select
              value={filterOptions.sortBy}
              onValueChange={(value: any) => 
                setFilterOptions(prev => ({ ...prev, sortBy: value }))
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="score">매칭도순</SelectItem>
                <SelectItem value="apt">APT 궁합순</SelectItem>
                <SelectItem value="emotion">감정 유사도순</SelectItem>
                <SelectItem value="recent">최신순</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            {/* 새로고침 버튼 */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadData()}
              disabled={isRefreshing}
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
              새로고침
            </Button>
            
            {/* 실시간 업데이트 토글 */}
            <Button
              variant={autoRefresh ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              <Bell className="h-4 w-4 mr-2" />
              {autoRefresh ? "실시간 ON" : "실시간 OFF"}
            </Button>
          </div>
        </div>

        {/* 매칭 결과 목록 */}
        <div className="space-y-4">
          {filteredMatches.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">
                  {matches.length === 0 
                    ? "아직 매칭 결과가 없습니다. 더 많은 사용자가 참여하면 매칭이 생성됩니다."
                    : "필터 조건에 맞는 매칭이 없습니다."}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredMatches.map((match, index) => (
              <MatchCard 
                key={match.id} 
                match={match} 
                rank={index + 1}
                onStatusUpdate={updateMatchStatus}
              />
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

function MatchCard({ 
  match, 
  rank,
  onStatusUpdate 
}: { 
  match: MatchWithStatus; 
  rank: number;
  onStatusUpdate: (matchId: string, status: MatchStatus) => void;
}) {
  const matchPercentage = Math.round((match.match_score || 0) * 100);
  const aptCompatibility = Math.round((match.apt_compatibility || 0) * 100);
  const emotionSimilarity = Math.round((match.emotion_similarity || 0) * 100);
  const isTopMatch = rank <= 3;
  const isAccepted = match.status === 'accepted';
  const isRejected = match.status === 'rejected';

  return (
    <Card className={cn(
      "transition-all hover:shadow-md",
      isTopMatch && !isRejected && "border-primary",
      isAccepted && "border-green-500",
      isRejected && "opacity-60"
    )}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {/* 순위 */}
            <div className={cn(
              "flex items-center justify-center w-10 h-10 rounded-full font-bold",
              isTopMatch && !isRejected ? "bg-primary text-primary-foreground" : "bg-muted"
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

          {/* 매칭 점수 및 상태 */}
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              {matchPercentage}%
            </div>
            <p className="text-xs text-muted-foreground">매칭도</p>
            {match.status && match.status !== 'pending' && (
              <Badge 
                variant={isAccepted ? "default" : isRejected ? "secondary" : "outline"}
                className="mt-1"
              >
                {isAccepted ? "수락됨" : isRejected ? "거절됨" : "숨김"}
              </Badge>
            )}
          </div>
        </div>

        {/* 매칭 상세 점수 */}
        <div className="mt-4 space-y-2">
          <MatchScoreBar 
            label="APT 궁합" 
            score={aptCompatibility} 
          />
          <MatchScoreBar 
            label="감정 유사도" 
            score={emotionSimilarity} 
          />
        </div>

        {/* 매칭 이유 */}
        {match.match_reasons && match.match_reasons.length > 0 && (
          <div className="mt-3 flex gap-1 flex-wrap">
            {match.match_reasons.map((reason, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {reason}
              </Badge>
            ))}
          </div>
        )}

        {/* 상호작용 버튼 */}
        <div className="mt-4 flex gap-2">
          {match.status === 'pending' ? (
            <>
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1"
                onClick={() => onStatusUpdate(match.id, 'rejected')}
              >
                <X className="h-4 w-4 mr-2" />
                거절
              </Button>
              <Button 
                size="sm" 
                className="flex-1"
                onClick={() => onStatusUpdate(match.id, 'accepted')}
              >
                <Check className="h-4 w-4 mr-2" />
                수락
              </Button>
            </>
          ) : match.status === 'accepted' ? (
            <>
              <Button size="sm" variant="outline" className="flex-1">
                프로필 보기
              </Button>
              <Button size="sm" className="flex-1">
                <Sparkles className="h-4 w-4 mr-2" />
                감상 교환하기
              </Button>
            </>
          ) : match.status === 'rejected' ? (
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full"
              onClick={() => onStatusUpdate(match.id, 'pending')}
            >
              다시 보기
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

function MatchScoreBar({ label, score }: { label: string; score: number }) {
  const percentage = typeof score === 'number' ? score : 0;
  
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
          {stats.participation_rate && (
            <div className="mt-2">
              <Progress value={stats.participation_rate} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                전체 사용자의 {stats.participation_rate}%
              </p>
            </div>
          )}
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