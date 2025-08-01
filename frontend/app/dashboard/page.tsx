'use client';

import { useEffect, useState, Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
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
  Activity,
  Target
} from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { ProfileSummaryWidget } from '@/components/dashboard/ProfileSummaryWidget';

// Lazy load heavy components
const DailyArtHabitWidget = lazy(() => import('@/components/dashboard/DailyArtHabitWidget').then(m => ({ default: m.DailyArtHabitWidget })));
const ArtPulseWidget = lazy(() => import('@/components/dashboard/ArtPulseWidget').then(m => ({ default: m.ArtPulseWidget })));
const GamificationWidget = lazy(() => import('@/components/dashboard/GamificationWidget').then(m => ({ default: m.GamificationWidget })));
const QuickActionsWidget = lazy(() => import('@/components/dashboard/QuickActionsWidget').then(m => ({ default: m.QuickActionsWidget })));

// Loading skeleton component
const WidgetSkeleton = () => (
  <Card className="animate-pulse">
    <CardHeader>
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32" />
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
      </div>
    </CardContent>
  </Card>
);

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'journey' | 'social'>('overview');
  
  // Mock data for now - no API calls
  const activityStats = {
    collectionsCreated: 0,
    publicCollections: 0,
    itemsCollected: 0,
    itemsThisWeek: 0,
    activeDays: 0,
    streak: 0,
    recentActivity: []
  };
  
  const communityStatus = {
    isUnlocked: false,
    progress: {
      artworks_viewed: { current: 0, required: 30 },
      collections_created: { current: 0, required: 3 },
      daily_challenges: { current: 0, required: 7 },
      notes_written: { current: 0, required: 5 }
    }
  };

  useEffect(() => {
    // Simple auth check without timeout
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
      }
    } catch (error) {
      // Ignore errors and proceed
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Show loading for a very short time
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If no user, show login prompt
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-bold">로그인이 필요합니다</h1>
        <p className="text-muted-foreground">대시보드를 이용하시려면 로그인해주세요.</p>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/login">로그인하기</Link>
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
          >
            새로고침
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <style jsx>{`
        /* Dashboard specific styles - force white text for certain elements */
        .dashboard-container :global(.badge) {
          color: white !important;
        }
        
        .dashboard-container :global(span[class*="font-"]) {
          color: white !important;
        }
        
        /* Target specific numeric values and XP text */
        .dashboard-container :global(span:has(> "XP")),
        .dashboard-container :global(span:has(> "위")),
        .dashboard-container :global(*:has(> "/")),
        .dashboard-container :global(.text-sm.font-medium),
        .dashboard-container :global(.text-sm.font-bold),
        .dashboard-container :global(.text-2xl.font-bold),
        .dashboard-container :global(.text-3xl.font-bold) {
          color: white !important;
        }
      `}</style>
      <div className="space-y-6 dashboard-container">
        {/* Enhanced Welcome Section with Profile Summary */}
        <ProfileSummaryWidget 
          user={user}
          activityStats={activityStats}
          communityStatus={communityStatus}
        />

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
              <Suspense fallback={<WidgetSkeleton />}>
                <DailyArtHabitWidget className="lg:col-span-2 xl:col-span-1" />
              </Suspense>

              {/* Art Pulse Widget */}
              <Suspense fallback={<WidgetSkeleton />}>
                <ArtPulseWidget className="xl:col-span-1" />
              </Suspense>

              {/* Gamification Progress Widget */}
              <Suspense fallback={<WidgetSkeleton />}>
                <GamificationWidget className="xl:col-span-1" />
              </Suspense>
            </div>

            {/* Quick Actions Grid */}
            <Suspense fallback={<WidgetSkeleton />}>
              <QuickActionsWidget 
                communityStatus={communityStatus}
              />
            </Suspense>

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
          </TabsContent>

          {/* Journey Tab */}
          <TabsContent value="journey" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>나의 여정</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">곧 업데이트 예정입니다.</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Social Tab */}
          <TabsContent value="social" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>커뮤니티</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">곧 업데이트 예정입니다.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}