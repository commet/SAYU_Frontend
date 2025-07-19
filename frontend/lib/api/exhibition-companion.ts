import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { 
  Exhibition,
  CompanionRequest,
  CompanionMatch,
  CreateCompanionRequestData
} from '@/types/exhibition-companion';

const supabase = createClientComponentClient();

export const exhibitionCompanionApi = {
  // 전시 목록 조회
  async getExhibitions(filters?: {
    category?: string;
    venue?: string;
    dateRange?: { start: string; end: string };
  }): Promise<Exhibition[]> {
    let query = supabase
      .from('exhibitions')
      .select(`
        *,
        interest_count:exhibition_interests(count),
        companion_request_count:exhibition_companion_requests(count)
      `)
      .gte('end_date', new Date().toISOString().split('T')[0])
      .order('start_date', { ascending: true });

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.venue) {
      query = query.ilike('venue', `%${filters.venue}%`);
    }
    if (filters?.dateRange) {
      query = query
        .gte('start_date', filters.dateRange.start)
        .lte('end_date', filters.dateRange.end);
    }

    const { data, error } = await query;
    if (error) throw error;

    // 사용자의 관심 표시 여부 확인
    const { data: { user } } = await supabase.auth.getUser();
    if (user && data) {
      const exhibitionIds = data.map(e => e.id);
      const { data: interests } = await supabase
        .from('exhibition_interests')
        .select('exhibition_id')
        .eq('user_id', user.id)
        .in('exhibition_id', exhibitionIds);

      const interestedIds = new Set(interests?.map(i => i.exhibition_id) || []);
      
      return data.map(exhibition => ({
        ...exhibition,
        user_interested: interestedIds.has(exhibition.id)
      }));
    }

    return data || [];
  },

  // 전시 상세 조회
  async getExhibition(id: string): Promise<Exhibition | null> {
    const { data, error } = await supabase
      .from('exhibitions')
      .select(`
        *,
        interest_count:exhibition_interests(count),
        companion_request_count:exhibition_companion_requests(count)
      `)
      .eq('id', id)
      .single();

    if (error) return null;
    return data;
  },

  // 전시 관심 표시/취소
  async toggleInterest(exhibitionId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: existing } = await supabase
      .from('exhibition_interests')
      .select('*')
      .eq('user_id', user.id)
      .eq('exhibition_id', exhibitionId)
      .single();

    if (existing) {
      const { error } = await supabase
        .from('exhibition_interests')
        .delete()
        .eq('user_id', user.id)
        .eq('exhibition_id', exhibitionId);
      
      if (error) throw error;
      return false;
    } else {
      const { error } = await supabase
        .from('exhibition_interests')
        .insert({
          user_id: user.id,
          exhibition_id: exhibitionId
        });
      
      if (error) throw error;
      return true;
    }
  },

  // 동행 요청 생성
  async createCompanionRequest(data: CreateCompanionRequestData): Promise<CompanionRequest> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: request, error } = await supabase
      .from('exhibition_companion_requests')
      .insert({
        ...data,
        user_id: user.id,
        age_range: data.age_range ? `[${data.age_range[0]},${data.age_range[1]})` : null
      })
      .select()
      .single();

    if (error) throw error;
    return request;
  },

  // 내 동행 요청 목록
  async getMyRequests(status?: string): Promise<CompanionRequest[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    let query = supabase
      .from('exhibition_companion_requests')
      .select(`
        *,
        exhibition:exhibitions(*),
        matches:exhibition_companions(
          *,
          companion:user_profiles!companion_id(
            id:user_id,
            username,
            profile_image_url,
            apt_type:personality_type
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  // 동행 찾기 (특정 전시)
  async findCompanions(exhibitionId: string, date?: string): Promise<CompanionRequest[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    let query = supabase
      .from('exhibition_companion_requests')
      .select(`
        *,
        user:user_profiles!user_id(
          id:user_id,
          username,
          profile_image_url,
          apt_type:personality_type,
          birth_date,
          gender
        )
      `)
      .eq('exhibition_id', exhibitionId)
      .eq('status', 'active')
      .neq('user_id', user.id)
      .gt('expires_at', new Date().toISOString());

    if (date) {
      query = query.eq('preferred_date', date);
    }

    const { data, error } = await query;
    if (error) throw error;

    // 나이 계산
    return (data || []).map(request => ({
      ...request,
      user: request.user ? {
        ...request.user,
        age: request.user.birth_date 
          ? new Date().getFullYear() - new Date(request.user.birth_date).getFullYear()
          : undefined
      } : undefined
    }));
  },

  // 동행 제안에 응답
  async respondToMatch(matchId: string, accept: boolean): Promise<void> {
    const { error } = await supabase
      .from('exhibition_companions')
      .update({
        status: accept ? 'accepted' : 'declined',
        responded_at: new Date().toISOString()
      })
      .eq('id', matchId);

    if (error) throw error;

    // 수락한 경우 원래 요청 상태도 업데이트
    if (accept) {
      const { data: match } = await supabase
        .from('exhibition_companions')
        .select('request_id')
        .eq('id', matchId)
        .single();

      if (match) {
        await supabase
          .from('exhibition_companion_requests')
          .update({ status: 'matched' })
          .eq('id', match.request_id);
      }
    }
  },

  // 내가 받은 동행 제안
  async getReceivedMatches(): Promise<CompanionMatch[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('exhibition_companions')
      .select(`
        *,
        request:exhibition_companion_requests(
          *,
          user:user_profiles!user_id(
            id:user_id,
            username,
            profile_image_url,
            apt_type:personality_type
          ),
          exhibition:exhibitions(*)
        )
      `)
      .eq('companion_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // 동행 후 평가
  async reviewCompanion(
    matchId: string,
    rating: number,
    tags: string[],
    note?: string
  ): Promise<void> {
    const { error } = await supabase
      .from('exhibition_companions')
      .update({
        met_in_person: true,
        rating,
        review_tags: tags,
        review_note: note
      })
      .eq('id', matchId);

    if (error) throw error;
  },

  // 추천 동행 찾기 (APT 기반)
  async getRecommendedCompanions(exhibitionId: string): Promise<CompanionRequest[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // 내 APT 타입 가져오기
    const { data: myProfile } = await supabase
      .from('user_profiles')
      .select('personality_type')
      .eq('user_id', user.id)
      .single();

    if (!myProfile?.personality_type) return [];

    // 호환성 높은 APT 타입 찾기
    const { data: compatibleTypes } = await supabase
      .from('compatibility_scores')
      .select('type2')
      .eq('type1', myProfile.personality_type)
      .gte('score', 0.7)
      .limit(5);

    const compatibleApts = compatibleTypes?.map(t => t.type2) || [];

    // 호환되는 APT 타입의 동행 요청 찾기
    const { data, error } = await supabase
      .from('exhibition_companion_requests')
      .select(`
        *,
        user:user_profiles!user_id(
          id:user_id,
          username,
          profile_image_url,
          apt_type:personality_type
        )
      `)
      .eq('exhibition_id', exhibitionId)
      .eq('status', 'active')
      .neq('user_id', user.id)
      .in('user.apt_type', compatibleApts)
      .limit(10);

    if (error) return [];
    return data || [];
  }
};