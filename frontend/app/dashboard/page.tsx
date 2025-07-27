'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Sparkles, 
  FolderOpen, 
  MessageSquare, 
  Users,
  TrendingUp,
  Calendar,
  Heart,
  Lock,
  Trophy,
  Target,
  Palette,
  Clock,
  Activity,
  Zap,
  Crown,
  Coins
} from 'lucide-react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { userActivityApi } from '@/lib/api/collections';
import { CommunityUnlockProgress } from '@/components/community/CommunityUnlockProgress';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { DailyArtHabitWidget } from '@/components/dashboard/DailyArtHabitWidget';
import { ArtPulseWidget } from '@/components/dashboard/ArtPulseWidget';
import { GamificationWidget } from '@/components/dashboard/GamificationWidget';
import { UserJourneyWidget } from '@/components/dashboard/UserJourneyWidget';
import { QuickActionsWidget } from '@/components/dashboard/QuickActionsWidget';
import { DualValueWidget } from '@/components/dashboard/DualValueWidget';
import { FriendActivityWidget } from '@/components/dashboard/FriendActivityWidget';
import { ProfileSummaryWidget } from '@/components/dashboard/ProfileSummaryWidget';
import { JourneyNudgeModal, JourneyProgress } from '@/components/onboarding/JourneyNudge';
import { getTodaysNudge, markNudgeAsViewed, markNudgeAsClicked, getJourneyStatus } from '@/lib/api/journey';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [activityStats, setActivityStats] = useState<any>(null);
  const [communityStatus, setCommunityStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'journey' | 'social'>('overview');
  const [todaysNudge, setTodaysNudge] = useState<any>(null);
  const [journeyStatus, setJourneyStatus] = useState<any>(null);
  const [showJourneyModal, setShowJourneyModal] = useState(false);
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

        // Load journey data
        try {
          const [nudge, journey] = await Promise.all([
            getTodaysNudge(),
            getJourneyStatus()
          ]);
          
          setTodaysNudge(nudge);
          setJourneyStatus(journey);
          
          // Show modal if there's a new nudge
          if (nudge && !showJourneyModal) {
            setShowJourneyModal(true);
          }
        } catch (journeyError) {
          console.error('Failed to load journey data:', journeyError);
        }
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Journey event handlers
  const handleNudgeViewed = async (dayNumber: number) => {
    await markNudgeAsViewed(dayNumber);
    // Refresh journey status
    const updatedJourney = await getJourneyStatus();
    setJourneyStatus(updatedJourney);
  };

  const handleNudgeClicked = async (dayNumber: number) => {
    await markNudgeAsClicked(dayNumber);
    setShowJourneyModal(false);
    // Refresh journey status
    const updatedJourney = await getJourneyStatus();
    setJourneyStatus(updatedJourney);
  };

  const handleJourneyModalDismiss = () => {
    setShowJourneyModal(false);
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
      {/* Enhanced Welcome Section with Profile Summary */}
      <ProfileSummaryWidget 
        user={user}
        activityStats={activityStats}
        communityStatus={communityStatus}
      />

<<<<<<< HEAD
      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            대시보드
          </TabsTrigger>
          <TabsTrigger value="journey" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            나의 여정
          </TabsTrigger>
          <TabsTrigger value="social" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            커뮤니티
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">

          {/* Main Widget Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Daily Art Habit Widget */}
            <DailyArtHabitWidget className="lg:col-span-2 xl:col-span-1" />

            {/* Art Pulse Widget */}
            <ArtPulseWidget className="xl:col-span-1" />

            {/* Gamification Progress Widget */}
            <GamificationWidget className="xl:col-span-1" />
          </div>

          {/* Dual Value System Display */}
          <DualValueWidget />

          {/* Quick Actions Grid */}
          <QuickActionsWidget 
            communityStatus={communityStatus}
          />

          {/* Community Progress (if not unlocked) */}
          {!communityStatus?.isUnlocked && (
        <Card className="border-purple-200 bg-purple-50/50 dark:bg-purple-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              커뮤니티 잠금 해제 진행률
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>컬렉션 생성</span>
                <span>{activityStats?.collectionsCreated || 0} / {communityStatus?.requirements?.minCollections || 3}</span>
              </div>
              <Progress 
                value={(activityStats?.collectionsCreated || 0) / (communityStatus?.requirements?.minCollections || 3) * 100} 
                className="h-2"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>작품 수집</span>
                <span>{activityStats?.itemsCollected || 0} / {communityStatus?.requirements?.minItems || 10}</span>
              </div>
              <Progress 
                value={(activityStats?.itemsCollected || 0) / (communityStatus?.requirements?.minItems || 10) * 100} 
                className="h-2"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>활동 일수</span>
                <span>{activityStats?.activeDays || 0} / {communityStatus?.requirements?.minActiveDays || 7}</span>
              </div>
              <Progress 
                value={(activityStats?.activeDays || 0) / (communityStatus?.requirements?.minActiveDays || 7) * 100} 
                className="h-2"
              />
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              커뮤니티 기능을 잠금 해제하면 다른 사용자들과 교류할 수 있습니다
            </p>
          </CardContent>
        </Card>
          )}
=======
      {/* Community Progress */}
      <CommunityUnlockProgress 
        showCompact={communityStatus?.isUnlocked} 
        onUnlock={() => loadDashboardData()} 
      />
>>>>>>> 387884c5e2dc7dc27995f48a8e33a2a1e7032884

          {/* Activity Stats Row */}
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

          {/* Recent Activity Card */}
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
        </TabsContent>

        {/* Journey Tab */}
        <TabsContent value="journey" className="space-y-6">
          <UserJourneyWidget 
            user={user}
            activityStats={activityStats}
          />
        </TabsContent>

        {/* Social Tab */}
        <TabsContent value="social" className="space-y-6">
          <FriendActivityWidget 
            user={user}
            communityStatus={communityStatus}
          />
        </TabsContent>
      </Tabs>

      {/* Journey Nudge Modal */}
      {showJourneyModal && todaysNudge && (
        <JourneyNudgeModal
          nudge={todaysNudge}
          onViewed={() => handleNudgeViewed(todaysNudge.day_number)}
          onClicked={() => handleNudgeClicked(todaysNudge.day_number)}
          onClose={handleJourneyModalDismiss}
        />
      )}

      {/* Journey Progress Display */}
      {journeyStatus && (
        <div className="fixed bottom-4 right-4 z-40">
          <JourneyProgress 
            journeyStatus={journeyStatus}
            onOpenJourney={() => setShowJourneyModal(true)}
          />
        </div>
      )}
    </div>
  );
}