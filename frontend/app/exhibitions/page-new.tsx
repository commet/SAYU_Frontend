'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Plus, 
  Search, 
  MapPin, 
  Calendar,
  Clock,
  Star,
  MessageSquare,
  CheckCircle,
  Heart
} from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { userActivityApi } from '@/lib/api/collections';
import { exhibitionCompanionApi } from '@/lib/api/exhibition-companion';
// import { ExhibitionCard } from '@/components/exhibition-companion/ExhibitionCard';
import { CompanionRequestCard } from '@/components/exhibition-companion/CompanionRequestCard';
import { CreateCompanionRequest } from '@/components/exhibition-companion/CreateCompanionRequest';
// import { CreateCompanionRequestModal } from '@/components/exhibition-companion/CreateCompanionRequestModal';
// import { CompanionMatchCard } from '@/components/exhibition-companion/CompanionMatchCard';
import { useRouter } from 'next/navigation';

export default function ExhibitionsPage() {
  const [user, setUser] = useState<any>(null);
  const [communityUnlocked, setCommunityUnlocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // 데이터 상태
  const [exhibitions, setExhibitions] = useState<any[]>([]);
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [availableRequests, setAvailableRequests] = useState<any[]>([]);
  const [myMatches, setMyMatches] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  // 모달 상태
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedExhibition, setSelectedExhibition] = useState<any>(null);

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
          await loadExhibitionData();
        }
      }
    } catch (error) {
      console.error('Failed to check auth and community status:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadExhibitionData = async () => {
    try {
      const [
        exhibitionsData,
        requestsData,
        availableData,
        matchesData,
        statsData
      ] = await Promise.all([
        exhibitionCompanionApi.getExhibitions(),
        exhibitionCompanionApi.getMyRequests(),
        exhibitionCompanionApi.getAvailableRequests(),
        exhibitionCompanionApi.getMyMatches(),
        exhibitionCompanionApi.getCompanionStats()
      ]);

      setExhibitions(exhibitionsData || []);
      setMyRequests(requestsData || []);
      setAvailableRequests(availableData || []);
      setMyMatches(matchesData || []);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load exhibition data:', error);
    }
  };

  const handleCreateRequest = async (requestData: any) => {
    try {
      await exhibitionCompanionApi.createCompanionRequest(requestData);
      await loadExhibitionData();
      setShowCreateModal(false);
      setSelectedExhibition(null);
    } catch (error) {
      console.error('Failed to create request:', error);
    }
  };

  const handleRequestMatch = async (requestId: string) => {
    try {
      await exhibitionCompanionApi.createMatch(requestId);
      await loadExhibitionData();
    } catch (error) {
      console.error('Failed to request match:', error);
    }
  };

  const filteredExhibitions = exhibitions.filter(exhibition =>
    exhibition.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exhibition.venue.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">전시 동행 시스템을 불러오는 중...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Users className="h-16 w-16 text-muted-foreground" />
        <h1 className="text-2xl font-bold">로그인이 필요합니다</h1>
        <p className="text-muted-foreground text-center max-w-md">
          전시 동행 기능을 사용하려면 로그인해주세요
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
              <Users className="h-10 w-10 text-purple-600" />
            </div>
            <h1 className="text-3xl font-bold mb-4">전시 동행</h1>
            <p className="text-muted-foreground">
              함께 전시를 관람하며 예술에 대한 새로운 관점을 나눌 동행을 찾아보세요
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
            <Users className="h-8 w-8 text-purple-600" />
            전시 동행
          </h1>
          <p className="text-muted-foreground mt-1">
            함께 전시를 관람할 동행을 찾아보세요
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} size="lg">
          <Plus className="mr-2 h-4 w-4" />
          동행 요청하기
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">내 요청</CardTitle>
              <MessageSquare className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.myRequests}</div>
              <p className="text-xs text-muted-foreground">
                활성 요청
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">매칭 완료</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedMatches}</div>
              <p className="text-xs text-muted-foreground">
                총 {stats.totalCompanions}명과 동행
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">평균 평점</CardTitle>
              <Star className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.averageRating ? stats.averageRating.toFixed(1) : '0.0'}
              </div>
              <p className="text-xs text-muted-foreground">
                5점 만점
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">관람한 전시</CardTitle>
              <Heart className="h-4 w-4 text-pink-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.exhibitionsVisited || 0}</div>
              <p className="text-xs text-muted-foreground">
                이번 달: {stats.thisMonthVisits || 0}개
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="exhibitions" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="exhibitions" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            전시 목록 ({exhibitions.length})
          </TabsTrigger>
          <TabsTrigger value="my-requests" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            내 요청 ({myRequests.length})
          </TabsTrigger>
          <TabsTrigger value="available" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            동행 찾기 ({availableRequests.length})
          </TabsTrigger>
          <TabsTrigger value="matches" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            매칭 결과 ({myMatches.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="exhibitions" className="space-y-6">
          {/* 검색 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="전시명이나 장소로 검색하세요..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* 샘플 전시 데이터 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                id: 1,
                title: '모네와 인상주의',
                venue: '국립현대미술관',
                location: '서울특별시 종로구',
                start_date: '2024-01-01',
                end_date: '2024-03-31',
                description: '클로드 모네의 대표작과 인상주의 화가들의 작품을 만나보세요',
                tags: ['인상주의', '모네', '서양화'],
                status: 'ongoing'
              },
              {
                id: 2,
                title: '한국 현대미술의 흐름',
                venue: '서울시립미술관',
                location: '서울특별시 중구',
                start_date: '2024-02-01',
                end_date: '2024-04-30',
                description: '1970년대부터 현재까지 한국 현대미술의 변화',
                tags: ['현대미술', '한국미술', '회화'],
                status: 'upcoming'
              },
              {
                id: 3,
                title: '디지털 아트 페스티벌',
                venue: 'DDP 디자인뮤지엄',
                location: '서울특별시 중구 을지로',
                start_date: '2024-03-15',
                end_date: '2024-05-15',
                description: '디지털 기술과 예술의 만남',
                tags: ['디지털아트', '미디어아트', '인터랙티브'],
                status: 'upcoming'
              }
            ].map((exhibition) => (
              <Card key={exhibition.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <Badge variant={exhibition.status === 'ongoing' ? 'default' : 'secondary'}>
                      {exhibition.status === 'ongoing' ? '진행중' : '예정'}
                    </Badge>
                  </div>
                  
                  <h3 className="font-bold text-lg mb-2">{exhibition.title}</h3>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{exhibition.venue}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{exhibition.start_date} - {exhibition.end_date}</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {exhibition.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {exhibition.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <Button 
                    className="w-full" 
                    onClick={() => {
                      setSelectedExhibition(exhibition);
                      setShowCreateModal(true);
                    }}
                  >
                    동행 요청하기
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="my-requests" className="space-y-6">
          <Card className="text-center py-16">
            <CardContent>
              <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">동행 요청이 없습니다</h3>
              <p className="text-muted-foreground mb-4">
                관심 있는 전시에 동행 요청을 올려보세요
              </p>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="mr-2 h-4 w-4" />
                첫 번째 요청하기
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="available" className="space-y-6">
          <Card className="text-center py-16">
            <CardContent>
              <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">매칭 가능한 요청이 없습니다</h3>
              <p className="text-muted-foreground">
                현재 동행을 찾고 있는 요청이 없습니다
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matches" className="space-y-6">
          <Card className="text-center py-16">
            <CardContent>
              <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">아직 매칭된 동행이 없습니다</h3>
              <p className="text-muted-foreground">
                동행 요청을 하거나 다른 사용자의 요청에 매칭해보세요
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Request Component */}
      {showCreateModal && selectedExhibition && (
        <CreateCompanionRequest
          isOpen={showCreateModal}
          exhibition={selectedExhibition}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadExhibitionData();
          }}
        />
      )}
    </div>
  );
}