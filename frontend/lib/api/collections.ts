import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { 
  ArtCollection, 
  CollectionItem, 
  CreateCollectionRequest, 
  AddItemToCollectionRequest,
  CollectionComment,
  UserArtActivity
} from '@/types/collection';

const supabase = createClientComponentClient();

// 컬렉션 CRUD
export const collectionsApi = {
  // 내 컬렉션 목록 조회
  async getMyCollections() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('art_collections')
      .select(`
        *,
        items:collection_items(count),
        likes:collection_likes(count)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // 공개 컬렉션 탐색
  async getPublicCollections(limit = 20, offset = 0) {
    const { data, error } = await supabase
      .from('art_collections')
      .select(`
        *,
        user:user_profiles!user_id(
          id,
          username,
          profile_image_url
        ),
        items:collection_items(count),
        likes:collection_likes(count)
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data;
  },

  // 단일 컬렉션 상세 조회
  async getCollection(collectionId: string) {
    const { data, error } = await supabase
      .from('art_collections')
      .select(`
        *,
        user:user_profiles!user_id(
          id,
          username,
          profile_image_url,
          apt_type
        ),
        items:collection_items(
          *,
          added_by_user:user_profiles!added_by(
            id,
            username,
            profile_image_url
          )
        ),
        collaborators:collection_collaborators(
          *,
          user:user_profiles!user_id(
            id,
            username,
            profile_image_url,
            apt_type
          )
        )
      `)
      .eq('id', collectionId)
      .single();

    if (error) throw error;

    // 조회수 증가
    await supabase
      .from('art_collections')
      .update({ view_count: data.view_count + 1 })
      .eq('id', collectionId);

    return data;
  },

  // 컬렉션 생성
  async createCollection(data: CreateCollectionRequest) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: collection, error } = await supabase
      .from('art_collections')
      .insert({
        ...data,
        user_id: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return collection;
  },

  // 컬렉션 수정
  async updateCollection(collectionId: string, data: Partial<CreateCollectionRequest>) {
    const { data: collection, error } = await supabase
      .from('art_collections')
      .update(data)
      .eq('id', collectionId)
      .select()
      .single();

    if (error) throw error;
    return collection;
  },

  // 컬렉션 삭제
  async deleteCollection(collectionId: string) {
    const { error } = await supabase
      .from('art_collections')
      .delete()
      .eq('id', collectionId);

    if (error) throw error;
  }
};

// 컬렉션 아이템 관리
export const collectionItemsApi = {
  // 컬렉션에 작품 추가
  async addItem(collectionId: string, data: AddItemToCollectionRequest) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: item, error } = await supabase
      .from('collection_items')
      .insert({
        collection_id: collectionId,
        ...data,
        added_by: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return item;
  },

  // 아이템 수정 (감정 태그, 노트)
  async updateItem(itemId: string, data: { 
    emotion_tags?: string[], 
    personal_note?: string 
  }) {
    const { data: item, error } = await supabase
      .from('collection_items')
      .update(data)
      .eq('id', itemId)
      .select()
      .single();

    if (error) throw error;
    return item;
  },

  // 아이템 삭제
  async removeItem(itemId: string) {
    const { error } = await supabase
      .from('collection_items')
      .delete()
      .eq('id', itemId);

    if (error) throw error;
  },

  // 작품이 이미 컬렉션에 있는지 확인
  async checkItemExists(collectionId: string, artworkId: string) {
    const { data, error } = await supabase
      .from('collection_items')
      .select('id')
      .eq('collection_id', collectionId)
      .eq('artwork_id', artworkId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  }
};

// 컬렉션 상호작용
export const collectionInteractionsApi = {
  // 좋아요 토글
  async toggleLike(collectionId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // 이미 좋아요 했는지 확인
    const { data: existing } = await supabase
      .from('collection_likes')
      .select('*')
      .eq('collection_id', collectionId)
      .eq('user_id', user.id)
      .single();

    if (existing) {
      // 좋아요 취소
      const { error } = await supabase
        .from('collection_likes')
        .delete()
        .eq('collection_id', collectionId)
        .eq('user_id', user.id);

      if (error) throw error;
      return false;
    } else {
      // 좋아요 추가
      const { error } = await supabase
        .from('collection_likes')
        .insert({
          collection_id: collectionId,
          user_id: user.id
        });

      if (error) throw error;
      return true;
    }
  },

  // 댓글 작성
  async addComment(collectionId: string, content: string, parentId?: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: comment, error } = await supabase
      .from('collection_comments')
      .insert({
        collection_id: collectionId,
        user_id: user.id,
        content,
        parent_id: parentId
      })
      .select(`
        *,
        user:user_profiles!user_id(
          id,
          username,
          profile_image_url
        )
      `)
      .single();

    if (error) throw error;
    return comment;
  },

  // 댓글 목록 조회
  async getComments(collectionId: string) {
    const { data, error } = await supabase
      .from('collection_comments')
      .select(`
        *,
        user:user_profiles!user_id(
          id,
          username,
          profile_image_url
        )
      `)
      .eq('collection_id', collectionId)
      .is('parent_id', null)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // 대댓글 조회
    for (const comment of data || []) {
      const { data: replies } = await supabase
        .from('collection_comments')
        .select(`
          *,
          user:user_profiles!user_id(
            id,
            username,
            profile_image_url
          )
        `)
        .eq('parent_id', comment.id)
        .order('created_at', { ascending: true });

      comment.replies = replies || [];
    }

    return data;
  }
};

// 사용자 활동 추적
export const userActivityApi = {
  // 내 활동 현황 조회
  async getMyActivity(session?: any): Promise<UserArtActivity | null> {
    let user = session?.user;
    
    if (!user) {
      const { data: authData } = await supabase.auth.getUser();
      user = authData.user;
    }
    
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_art_activities')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // 대시보드용 활동 통계 조회
  async getActivityStats(session?: any) {
    let user = session?.user;
    
    if (!user) {
      const { data: authData } = await supabase.auth.getUser();
      user = authData.user;
    }
    
    if (!user) throw new Error('Not authenticated');

    // Get collection stats
    const { data: collections, error: collectionsError } = await supabase
      .from('art_collections')
      .select('id, is_public')
      .eq('user_id', user.id);

    if (collectionsError) throw collectionsError;

    // Get items count
    const { count: itemsCount } = await supabase
      .from('collection_items')
      .select('*', { count: 'exact', head: true })
      .in('collection_id', collections?.map(c => c.id) || []);

    // Get activity days
    const { data: activities } = await supabase
      .from('user_activities')
      .select('activity_date')
      .eq('user_id', user.id)
      .order('activity_date', { ascending: false });

    const uniqueDays = new Set(activities?.map(a => a.activity_date) || []);
    
    // Calculate streak
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    const dates = Array.from(uniqueDays).sort().reverse();
    
    for (let i = 0; i < dates.length; i++) {
      const date = new Date(dates[i]);
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - i);
      
      if (date.toISOString().split('T')[0] === expectedDate.toISOString().split('T')[0]) {
        streak++;
      } else {
        break;
      }
    }

    // Get items this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const { count: itemsThisWeek } = await supabase
      .from('collection_items')
      .select('*', { count: 'exact', head: true })
      .in('collection_id', collections?.map(c => c.id) || [])
      .gte('created_at', weekAgo.toISOString());

    return {
      collectionsCreated: collections?.length || 0,
      publicCollections: collections?.filter(c => c.is_public).length || 0,
      itemsCollected: itemsCount || 0,
      itemsThisWeek: itemsThisWeek || 0,
      activeDays: uniqueDays.size,
      streak,
      recentActivity: activities?.slice(0, 5).map(a => ({
        description: '작품을 수집했습니다',
        created_at: a.activity_date
      })) || []
    };
  },

  // 커뮤니티 오픈 가능 여부 확인
  async checkCommunityUnlock(session?: any): Promise<{
    isUnlocked: boolean;
    progress: {
      artworks_viewed: { current: number; required: number };
      collections_created: { current: number; required: number };
      daily_challenges: { current: number; required: number };
      notes_written: { current: number; required: number };
    };
  }> {
    const activity = await this.getMyActivity(session);
    
    if (!activity) {
      return {
        isUnlocked: false,
        progress: {
          artworks_viewed: { current: 0, required: 30 },
          collections_created: { current: 0, required: 3 },
          daily_challenges: { current: 0, required: 7 },
          notes_written: { current: 0, required: 5 }
        }
      };
    }

    const criteria = {
      artworks_viewed: 30,
      collections_created: 3,
      daily_challenges: 7,
      notes_written: 5
    };

    const isUnlocked = 
      activity.artworks_viewed >= criteria.artworks_viewed &&
      activity.collections_created >= criteria.collections_created &&
      activity.daily_challenges_completed >= criteria.daily_challenges &&
      activity.notes_written >= criteria.notes_written;

    return {
      isUnlocked: activity.community_unlocked || isUnlocked,
      progress: {
        artworks_viewed: { 
          current: activity.artworks_viewed, 
          required: criteria.artworks_viewed 
        },
        collections_created: { 
          current: activity.collections_created, 
          required: criteria.collections_created 
        },
        daily_challenges: { 
          current: activity.daily_challenges_completed, 
          required: criteria.daily_challenges 
        },
        notes_written: { 
          current: activity.notes_written, 
          required: criteria.notes_written 
        }
      }
    };
  }
};