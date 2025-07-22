'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Sparkles, 
  FolderOpen, 
  MessageSquare, 
  Users,
  TrendingUp,
  Calendar,
  Heart,
  Lock
} from 'lucide-react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { userActivityApi } from '@/lib/api/collections';
import { CommunityUnlockProgress } from '@/components/community/CommunityUnlockProgress';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [activityStats, setActivityStats] = useState<any>(null);
  const [communityStatus, setCommunityStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        // Get activity stats and community status
        const [stats, status] = await Promise.all([
          userActivityApi.getActivityStats(),
          userActivityApi.checkCommunityUnlock()
        ]);
        
        setActivityStats(stats);
        setCommunityStatus(status);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-bold">로그인이 필요합니다</h1>
        <Button asChild>
          <Link href="/auth/login">로그인하기</Link>
        </Button>
      </div>
    );
  }

  const quickActions = [
    {
      title: '컬렉션 관리',
      description: '작품을 수집하고 정리해보세요',
      icon: FolderOpen,
      href: '/collections',
      color: 'from-blue-500 to-cyan-500',
      locked: false
    },
    {
      title: '데일리 챌린지',
      description: '오늘의 작품으로 감정을 기록하세요',
      icon: Sparkles,
      href: '/daily-challenge',
      color: 'from-purple-500 to-pink-500',
      locked: false
    },
    {
      title: '감상 교환',
      description: '다른 사용자와 감상을 나눠보세요',
      icon: MessageSquare,
      href: '/exchanges',
      color: 'from-orange-500 to-red-500',
      locked: !communityStatus?.isUnlocked
    },
    {
      title: '전시 동행',
      description: '함께 전시를 볼 동행을 찾아보세요',
      icon: Users,
      href: '/exhibitions',
      color: 'from-green-500 to-emerald-500',
      locked: !communityStatus?.isUnlocked
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">
          안녕하세요! 👋
        </h1>
        <p className="text-muted-foreground">
          오늘도 예술과 함께하는 하루 되세요
        </p>
      </div>

      {/* Community Progress */}
      <CommunityUnlockProgress 
        showCompact={communityStatus?.isUnlocked} 
        onUnlock={() => loadDashboardData()} 
      />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <Card 
            key={action.href}
            className={`group hover:shadow-lg transition-all duration-300 ${
              action.locked ? 'opacity-60' : ''
            }`}
          >
            <Link 
              href={action.locked ? '#' : action.href}
              className={action.locked ? 'cursor-not-allowed' : ''}
              onClick={(e) => action.locked && e.preventDefault()}
            >
              <CardHeader>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="flex items-center gap-2">
                  {action.title}
                  {action.locked && <Lock className="h-4 w-4" />}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {action.description}
                </p>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>

      {/* Activity Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              총 컬렉션
            </CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activityStats?.collectionsCreated || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              공개: {activityStats?.publicCollections || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              수집한 작품
            </CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activityStats?.itemsCollected || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              이번 주: {activityStats?.itemsThisWeek || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              활동 일수
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activityStats?.activeDays || 0}일
            </div>
            <p className="text-xs text-muted-foreground">
              연속: {activityStats?.streak || 0}일
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            최근 활동
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activityStats?.recentActivity?.length > 0 ? (
            <div className="space-y-4">
              {activityStats.recentActivity.map((activity: any, index: number) => (
                <div key={index} className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                  <span className="flex-1">{activity.description}</span>
                  <span className="text-muted-foreground">
                    {format(new Date(activity.created_at), 'M월 d일', { locale: ko })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              아직 활동 내역이 없습니다. 컬렉션을 만들어보세요!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}