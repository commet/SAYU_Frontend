'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Plus, 
  Clock, 
  Users, 
  Heart,
  Lightbulb,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { userActivityApi } from '@/lib/api/collections';
import { perceptionExchangeApi as exchangeApi } from '@/lib/api/perception-exchange';
import { ExchangeSessionCard } from '@/components/perception-exchange/ExchangeSessionCard';
import { StartExchangeModal } from '@/components/perception-exchange/StartExchangeModal';
import { ExchangeDetailModal } from '@/components/perception-exchange/ExchangeDetailModal';
import { useRouter } from 'next/navigation';

export default function ExchangesPage() {
  const [user, setUser] = useState<any>(null);
  const [communityUnlocked, setCommunityUnlocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [completedSessions, setCompletedSessions] = useState<any[]>([]);
  const [showStartModal, setShowStartModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    checkAuthAndCommunity();
  }, []);

  const checkAuthAndCommunity = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const status = await userActivityApi.checkCommunityUnlock();
        setCommunityUnlocked(status.isUnlocked);

        if (status.isUnlocked) {
          await loadExchangeData();
        }
      }
    } catch (error) {
      console.error('Failed to check auth and community status:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadExchangeData = async () => {
    try {
      const [active, completed, exchangeStats] = await Promise.all([
        exchangeApi.getActiveSessions(),
        exchangeApi.getCompletedSessions(),
        exchangeApi.getExchangeStats()
      ]);

      setActiveSessions(active || []);
      setCompletedSessions(completed || []);
      setStats(exchangeStats);
    } catch (error) {
      console.error('Failed to load exchange data:', error);
    }
  };

  const handleStartExchange = async (artworkData: any) => {
    try {
      const session = await exchangeApi.startExchange(artworkData);
      setActiveSessions([session, ...activeSessions]);
      setShowStartModal(false);
    } catch (error) {
      console.error('Failed to start exchange:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">감상 교환 시스템을 불러오는 중...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <MessageSquare className="h-16 w-16 text-muted-foreground" />
        <h1 className="text-2xl font-bold">로그인이 필요합니다</h1>
        <p className="text-muted-foreground text-center max-w-md">
          감상 교환 기능을 사용하려면 로그인해주세요
        </p>
        <Button onClick={() => router.push('/auth/login')}>
          로그인하기
        </Button>
      </div>
    );
  }

  if (!communityUnlocked) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto mb-4 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
              <MessageSquare className="h-10 w-10 text-purple-600" />
            </div>
            <h1 className="text-3xl font-bold mb-4">감상 교환</h1>
            <p className="text-muted-foreground">
              작품에 대한 서로 다른 관점을 나누며 천천히 알아가는 공간입니다
            </p>
          </div>

          <Card className="border-2 border-dashed border-purple-200 bg-purple-50/50 dark:bg-purple-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 justify-center">
                <Clock className="h-5 w-5" />
                커뮤니티 기능 잠금 중
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                더 많은 활동을 통해 다른 사용자들과 교류할 수 있는 기능을 열어보세요
              </p>
              <Button onClick={() => router.push('/collections')}>
                컬렉션 만들러 가기
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-purple-600" />
            감상 교환
          </h1>
          <p className="text-muted-foreground mt-1">
            작품을 통해 서로의 마음을 천천히 알아가세요
          </p>
        </div>
        <Button onClick={() => setShowStartModal(true)} size="lg">
          <Plus className="mr-2 h-4 w-4" />
          새로운 교환 시작
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">진행 중인 교환</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeSessions}</div>
              <p className="text-xs text-muted-foreground">
                현재 참여 중
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">완료된 교환</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedSessions}</div>
              <p className="text-xs text-muted-foreground">
                총 {stats.totalParticipants}명과 교류
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">평균 연결 점수</CardTitle>
              <Heart className="h-4 w-4 text-pink-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.averageConnectionScore ? stats.averageConnectionScore.toFixed(1) : '0.0'}
              </div>
              <p className="text-xs text-muted-foreground">
                5점 만점
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">새로운 인사이트</CardTitle>
              <Lightbulb className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.insightsGained || 0}</div>
              <p className="text-xs text-muted-foreground">
                이번 달 발견
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            진행 중 ({activeSessions.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            완료됨 ({completedSessions.length})
          </TabsTrigger>
          <TabsTrigger value="explore" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            둘러보기
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6">
          {activeSessions.length === 0 ? (
            <Card className="text-center py-16">
              <CardContent>
                <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">진행 중인 교환이 없습니다</h3>
                <p className="text-muted-foreground mb-4">
                  새로운 작품으로 다른 사람과 감상을 나눠보세요
                </p>
                <Button onClick={() => setShowStartModal(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  첫 번째 교환 시작하기
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeSessions.map((session) => (
                <ExchangeSessionCard
                  key={session.id}
                  session={session}
                  onClick={() => setSelectedSession(session)}
                  onUpdate={loadExchangeData}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-6">
          {completedSessions.length === 0 ? (
            <Card className="text-center py-16">
              <CardContent>
                <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">완료된 교환이 없습니다</h3>
                <p className="text-muted-foreground">
                  교환을 완료하면 여기에서 다시 볼 수 있습니다
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedSessions.map((session) => (
                <ExchangeSessionCard
                  key={session.id}
                  session={session}
                  onClick={() => setSelectedSession(session)}
                  onUpdate={loadExchangeData}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="explore" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>감상 교환이란?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 text-sm flex items-center justify-center font-bold">1</span>
                    첫인상 나누기
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    작품을 보고 느낀 첫 번째 감정과 떠오른 생각을 간단히 공유합니다
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 text-sm flex items-center justify-center font-bold">2</span>
                    개인적 경험 연결
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    작품이 자신의 경험이나 기억과 어떻게 연결되는지 이야기합니다
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 text-sm flex items-center justify-center font-bold">3</span>
                    성향과 취향 공유
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    자신의 예술 취향과 성격 유형을 조금 더 깊이 나눕니다
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 text-sm flex items-center justify-center font-bold">4</span>
                    더 깊은 연결
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    서로에게 흥미를 느낀다면 연락처를 교환하고 만남을 이어갈 수 있습니다
                  </p>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-2">
                  💡 교환 팁
                </h4>
                <ul className="text-sm text-purple-700 dark:text-purple-400 space-y-1">
                  <li>• 정답을 찾으려 하지 말고 솔직한 감정을 나눠보세요</li>
                  <li>• 상대방의 관점에 호기심을 가져보세요</li>
                  <li>• 각 단계를 충분히 즐기며 천천히 진행하세요</li>
                  <li>• 서로 다른 것이 당연하니 차이를 존중해주세요</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <StartExchangeModal
        open={showStartModal}
        onOpenChange={setShowStartModal}
        onStart={handleStartExchange}
      />

      {selectedSession && (
        <ExchangeDetailModal
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
          onUpdate={loadExchangeData}
        />
      )}
    </div>
  );
}