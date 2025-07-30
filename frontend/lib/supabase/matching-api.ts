import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { PersonalityType } from '@/types/sayu-shared';
import { ExhibitionMatch, InteractionPrompt, SharedCollection } from '@/types/art-persona-matching';

const supabase = createClientComponentClient();

export class MatchingAPI {
  // 전시 동행 매칭
  async createExhibitionMatch(data: Omit<ExhibitionMatch, 'id'>) {
    const { data: match, error } = await supabase
      .from('exhibition_matches')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return match;
  }

  async getExhibitionMatches(exhibitionId?: string, status: string = 'open') {
    let query = supabase
      .from('exhibition_matches')
      .select(`
        *,
        host:auth.users!host_user_id(id, email, raw_user_meta_data),
        matched:auth.users!matched_user_id(id, email, raw_user_meta_data)
      `)
      .eq('status', status);

    if (exhibitionId) {
      query = query.eq('exhibition_id', exhibitionId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async applyToMatch(matchId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: match, error } = await supabase
      .from('exhibition_matches')
      .update({ 
        matched_user_id: user.id,
        status: 'matched',
        matched_at: new Date().toISOString()
      })
      .eq('id', matchId)
      .eq('status', 'open')
      .select()
      .single();

    if (error) throw error;
    return match;
  }

  // 작품 상호작용
  async saveArtworkInteraction(interaction: Omit<InteractionPrompt, 'id' | 'createdAt'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('artwork_interactions')
      .insert({
        ...interaction,
        user_id: user.id,
        response: interaction.metadata?.response
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getArtworkInteractions(artworkId?: string, targetUserId?: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    let query = supabase
      .from('artwork_interactions')
      .select(`
        *,
        user:auth.users!user_id(id, email, raw_user_meta_data),
        target:auth.users!target_user_id(id, email, raw_user_meta_data)
      `)
      .or(`user_id.eq.${user.id},target_user_id.eq.${user.id}`);

    if (artworkId) {
      query = query.eq('artwork_id', artworkId);
    }

    if (targetUserId) {
      query = query.or(`user_id.eq.${targetUserId},target_user_id.eq.${targetUserId}`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  // 공유 컬렉션
  async createSharedCollection(collection: Omit<SharedCollection, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // 컬렉션 생성
    const { data: newCollection, error: collectionError } = await supabase
      .from('shared_collections')
      .insert({
        name: collection.name,
        theme: collection.theme,
        creator_id: user.id,
        collaborator_ids: collection.collaboratorIds,
        visibility: collection.visibility,
        tags: collection.tags
      })
      .select()
      .single();

    if (collectionError) throw collectionError;

    // 작품 추가
    if (collection.artworks.length > 0) {
      const artworksToInsert = collection.artworks.map(artwork => ({
        collection_id: newCollection.id,
        artwork_id: artwork.artworkId,
        added_by: user.id,
        note: artwork.note,
        voice_note: artwork.voiceNote
      }));

      const { error: artworksError } = await supabase
        .from('collection_artworks')
        .insert(artworksToInsert);

      if (artworksError) throw artworksError;
    }

    return newCollection;
  }

  async getSharedCollections(visibility?: 'private' | 'friends' | 'public') {
    let query = supabase
      .from('shared_collections')
      .select(`
        *,
        creator:auth.users!creator_id(id, email, raw_user_meta_data),
        artworks:collection_artworks(
          *,
          added_by_user:auth.users!added_by(id, email, raw_user_meta_data)
        )
      `);

    if (visibility) {
      query = query.eq('visibility', visibility);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  // APT 호환성 계산
  async calculateAPTCompatibility(user1Id: string, user2Id: string) {
    // 캐시된 점수 확인
    const { data: cached } = await supabase
      .from('apt_compatibility_scores')
      .select()
      .or(`user1_id.eq.${user1Id},user2_id.eq.${user1Id}`)
      .or(`user1_id.eq.${user2Id},user2_id.eq.${user2Id}`)
      .single();

    if (cached && new Date(cached.calculated_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000) {
      return cached;
    }

    // 새로 계산 (Edge Function 호출)
    const { data, error } = await supabase.functions.invoke('calculate-apt-compatibility', {
      body: { user1Id, user2Id }
    });

    if (error) throw error;
    return data;
  }

  // 실시간 구독
  subscribeToMatches(exhibitionId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`exhibition-matches:${exhibitionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'exhibition_matches',
          filter: `exhibition_id=eq.${exhibitionId}`
        },
        callback
      )
      .subscribe();
  }

  subscribeToInteractions(artworkId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`artwork-interactions:${artworkId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'artwork_interactions',
          filter: `artwork_id=eq.${artworkId}`
        },
        callback
      )
      .subscribe();
  }

  // 프라이버시 레벨 업데이트
  async updatePrivacyLevel(level: number, revealedInfo: string[]) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        privacy_level: level,
        privacy_revealed_info: revealedInfo
      })
      .eq('user_id', user.id);

    if (error) throw error;
    return data;
  }
}

export const matchingAPI = new MatchingAPI();