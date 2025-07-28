'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  Edit, 
  Trash2, 
  Lock,
  Users,
  Calendar,
  Eye,
  Plus,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import toast from 'react-hot-toast';
import { collectionsApi, collectionInteractionsApi, collectionItemsApi } from '@/lib/api/collections';
import { museumAPIs } from '@/lib/museumAPIs';
import type { ArtCollection, CollectionItem } from '@/types/collection';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { AddArtworkModal } from '@/components/collections/AddArtworkModal';

export default function CollectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [collection, setCollection] = useState<ArtCollection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showAddArtworkModal, setShowAddArtworkModal] = useState(false);
  
  const collectionId = params?.id as string;
  const supabase = createClientComponentClient();

  useEffect(() => {
    loadCollection();
    getCurrentUser();
  }, [collectionId]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  };

  const loadCollection = async () => {
    try {
      const data = await collectionsApi.getCollection(collectionId);
      setCollection(data);
      
      // 좋아요 여부 확인
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: likes } = await supabase
          .from('collection_likes')
          .select('*')
          .eq('collection_id', collectionId)
          .eq('user_id', user.id)
          .single();
        
        setIsLiked(!!likes);
      }
    } catch (error) {
      console.error('Failed to load collection:', error);
      toast.error('컬렉션을 불러올 수 없습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async () => {
    if (!currentUserId) {
      toast.error('로그인이 필요합니다');
      return;
    }

    try {
      const liked = await collectionInteractionsApi.toggleLike(collectionId);
      setIsLiked(liked);
      toast.success(liked ? '좋아요를 눌렀습니다' : '좋아요를 취소했습니다');
    } catch (error) {
      toast.error('오류가 발생했습니다');
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: collection?.title,
        text: collection?.description,
        url: window.location.href
      });
    } catch (error) {
      // 공유 API를 지원하지 않는 경우 클립보드에 복사
      await navigator.clipboard.writeText(window.location.href);
      toast.success('링크가 복사되었습니다');
    }
  };

  const handleAddArtwork = async (artworkData: any, emotionTags: string[], personalNote: string) => {
    try {
      await collectionItemsApi.addItem(collectionId, {
        artwork_id: artworkData.id.toString(),
        museum_source: artworkData.source || 'met',
        artwork_data: artworkData,
        emotion_tags: emotionTags,
        personal_note: personalNote
      });

      // 컬렉션 다시 로드
      await loadCollection();
      setShowAddArtworkModal(false);
      
      toast.success(`"${artworkData.title}"이(가) 컬렉션에 추가되었습니다.`);
    } catch (error: any) {
      toast.error(`작품 추가에 실패했습니다: ${error.message}`);
    }
  };

  if (isLoading) {
    return <CollectionDetailSkeleton />;
  }

  if (!collection) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">컬렉션을 찾을 수 없습니다</h1>
        <Button onClick={() => router.push('/collections')}>
          컬렉션 목록으로
        </Button>
      </div>
    );
  }

  const isOwner = currentUserId === collection.user_id;
  const isCollaborator = collection.collaborators?.some(
    c => c.user_id === currentUserId && c.status === 'active'
  );
  const canEdit = isOwner || isCollaborator;

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            뒤로
          </Button>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold">{collection.title}</h1>
                {!collection.is_public && <Lock className="h-5 w-5 text-muted-foreground" />}
                {collection.is_shared && <Users className="h-5 w-5 text-muted-foreground" />}
              </div>

              {collection.description && (
                <p className="text-muted-foreground mb-4">{collection.description}</p>
              )}

              {/* 메타 정보 */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={collection.user?.profile_image_url} />
                    <AvatarFallback>{collection.user?.username?.[0]}</AvatarFallback>
                  </Avatar>
                  <span>{collection.user?.username}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{format(new Date(collection.created_at), 'yyyy년 MM월 dd일', { locale: ko })}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{collection.view_count}회 조회</span>
                </div>
              </div>
            </div>

            {/* 액션 버튼 */}
            <div className="flex gap-2">
              <Button
                variant={isLiked ? 'default' : 'outline'}
                size="sm"
                onClick={handleLike}
              >
                <Heart className={`h-4 w-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                {collection.likes_count || 0}
              </Button>
              
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
              </Button>

              {canEdit && (
                <>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 컨텐츠 */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="artworks" className="w-full">
          <TabsList>
            <TabsTrigger value="artworks">
              작품 ({collection.items?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="comments">댓글</TabsTrigger>
            {collection.is_shared && (
              <TabsTrigger value="collaborators">참여자</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="artworks" className="mt-6">
            {canEdit && (
              <div className="mb-6 flex justify-end">
                <Button onClick={() => setShowAddArtworkModal(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  작품 추가
                </Button>
              </div>
            )}
            <CollectionArtworks items={collection.items || []} canEdit={canEdit || false} onUpdate={loadCollection} />
          </TabsContent>

          <TabsContent value="comments" className="mt-6">
            <div className="text-center py-8 text-muted-foreground">
              댓글 기능은 준비 중입니다
            </div>
          </TabsContent>

          {collection.is_shared && (
            <TabsContent value="collaborators" className="mt-6">
              <CollectionCollaborators 
                collaborators={collection.collaborators || []} 
                ownerId={collection.user_id}
              />
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Add Artwork Modal */}
      <AddArtworkModal
        open={showAddArtworkModal}
        onOpenChange={setShowAddArtworkModal}
        onSubmit={handleAddArtwork}
      />
    </div>
  );
}

// 작품 목록 컴포넌트
function CollectionArtworks({ 
  items, 
  canEdit, 
  onUpdate 
}: { 
  items: CollectionItem[]; 
  canEdit: boolean; 
  onUpdate: () => void; 
}) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">아직 저장된 작품이 없습니다</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item) => (
        <div key={item.id} className="group">
          <div className="aspect-[4/5] relative bg-muted rounded-lg overflow-hidden">
            {item.artwork_data.image_url && (
              <OptimizedImage
                src={item.artwork_data.image_url}
                alt={item.artwork_data.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform" placeholder="blur" quality={90}
              />
            )}
          </div>
          
          <div className="mt-3">
            <h3 className="font-medium line-clamp-1">{item.artwork_data.title}</h3>
            <p className="text-sm text-muted-foreground">{item.artwork_data.artist}</p>
            
            {item.emotion_tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {item.emotion_tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            
            {item.personal_note && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {item.personal_note}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// 참여자 목록 컴포넌트
function CollectionCollaborators({ collaborators, ownerId }: any) {
  return (
    <div className="space-y-4">
      {collaborators.map((collaborator: any) => (
        <div key={collaborator.id} className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={collaborator.user?.profile_image_url} />
              <AvatarFallback>{collaborator.user?.username?.[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{collaborator.user?.username}</p>
              <p className="text-sm text-muted-foreground">
                {collaborator.user_id === ownerId ? '소유자' : '참여자'}
              </p>
            </div>
          </div>
          <Badge variant={collaborator.status === 'active' ? 'default' : 'secondary'}>
            {collaborator.status === 'active' ? '활동중' : '대기중'}
          </Badge>
        </div>
      ))}
    </div>
  );
}

// 스켈레톤 로딩
function CollectionDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Skeleton className="h-8 w-32 mb-4" />
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-6 w-96 mb-4" />
          <div className="flex gap-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-32" />
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i}>
              <Skeleton className="aspect-[4/5] rounded-lg" />
              <Skeleton className="h-5 w-full mt-3" />
              <Skeleton className="h-4 w-24 mt-1" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}