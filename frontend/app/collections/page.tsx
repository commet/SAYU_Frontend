'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Lock, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CollectionGrid } from '@/components/collections/CollectionGrid';
import { CreateCollectionModal } from '@/components/collections/CreateCollectionModal';
import { collectionsApi, userActivityApi } from '@/lib/api/collections';
import toast from 'react-hot-toast';
import type { ArtCollection, UserArtActivity } from '@/types/collection';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function CollectionsPage() {
  const [myCollections, setMyCollections] = useState<ArtCollection[]>([]);
  const [publicCollections, setPublicCollections] = useState<ArtCollection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [userActivity, setUserActivity] = useState<UserArtActivity | null>(null);
  const [communityStatus, setCommunityStatus] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setIsAuthenticated(!!user);
    if (user) {
      loadData();
    } else {
      setIsLoading(false);
    }
  };

  const loadData = async () => {
    try {
      // 내 컬렉션 불러오기
      const myData = await collectionsApi.getMyCollections();
      setMyCollections(myData || []);

      // 공개 컬렉션 불러오기
      const publicData = await collectionsApi.getPublicCollections();
      setPublicCollections(publicData || []);

      // 사용자 활동 및 커뮤니티 상태 확인
      const activity = await userActivityApi.getMyActivity();
      setUserActivity(activity);

      const status = await userActivityApi.checkCommunityUnlock();
      setCommunityStatus(status);
    } catch (error) {
      console.error('Failed to load collections:', error);
      toast.error('데이터를 불러오는데 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSuccess = () => {
    loadData();
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Lock className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h1 className="text-2xl font-bold mb-2 text-white">로그인이 필요합니다</h1>
        <p className="text-muted-foreground mb-8">
          컬렉션 기능을 사용하려면 로그인해주세요
        </p>
        <Button onClick={() => window.location.href = '/login'} className="text-black bg-white hover:bg-gray-100">
          로그인하기
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 커뮤니티 오픈 진행 상황 */}
      {communityStatus && !communityStatus.isUnlocked && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>커뮤니티 기능 잠금 해제까지</CardTitle>
            <CardDescription>
              더 많은 활동을 통해 다른 사용자들과 교류할 수 있는 기능을 열어보세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>작품 감상</span>
                <span>{communityStatus.progress.artworks_viewed.current}/{communityStatus.progress.artworks_viewed.required}</span>
              </div>
              <Progress 
                value={(communityStatus.progress.artworks_viewed.current / communityStatus.progress.artworks_viewed.required) * 100} 
              />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>컬렉션 생성</span>
                <span>{communityStatus.progress.collections_created.current}/{communityStatus.progress.collections_created.required}</span>
              </div>
              <Progress 
                value={(communityStatus.progress.collections_created.current / communityStatus.progress.collections_created.required) * 100} 
              />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>데일리 챌린지</span>
                <span>{communityStatus.progress.daily_challenges.current}/{communityStatus.progress.daily_challenges.required}</span>
              </div>
              <Progress 
                value={(communityStatus.progress.daily_challenges.current / communityStatus.progress.daily_challenges.required) * 100} 
              />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>감상평 작성</span>
                <span>{communityStatus.progress.notes_written.current}/{communityStatus.progress.notes_written.required}</span>
              </div>
              <Progress 
                value={(communityStatus.progress.notes_written.current / communityStatus.progress.notes_written.required) * 100} 
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* 헤더 */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">컬렉션</h1>
          <p className="text-muted-foreground">
            마음에 드는 작품을 모아 나만의 미술관을 만들어보세요
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          새 컬렉션
        </Button>
      </div>

      {/* 탭 */}
      <Tabs defaultValue="my" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="my">
            내 컬렉션 ({myCollections.length})
          </TabsTrigger>
          <TabsTrigger value="public" disabled={!communityStatus?.isUnlocked}>
            <Globe className="h-4 w-4 mr-2" />
            공개 컬렉션
            {!communityStatus?.isUnlocked && (
              <Lock className="h-3 w-3 ml-2" />
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my">
          {isLoading ? (
            <CollectionGridSkeleton />
          ) : (
            <CollectionGrid collections={myCollections} />
          )}
        </TabsContent>

        <TabsContent value="public">
          {communityStatus?.isUnlocked ? (
            isLoading ? (
              <CollectionGridSkeleton />
            ) : (
              <CollectionGrid collections={publicCollections} showUser />
            )
          ) : (
            <div className="text-center py-12">
              <Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                커뮤니티 기능이 잠겨있습니다.
                <br />
                더 많은 활동을 통해 잠금을 해제하세요!
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* 컬렉션 생성 모달 */}
      <CreateCollectionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}

// 스켈레톤 로딩
function CollectionGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <div className="aspect-[4/3] bg-muted animate-pulse" />
          <CardContent className="p-4">
            <div className="h-6 bg-muted rounded animate-pulse mb-2" />
            <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}