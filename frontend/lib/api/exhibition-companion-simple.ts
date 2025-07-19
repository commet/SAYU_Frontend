import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const supabase = createClientComponentClient();

export const exhibitionCompanionApi = {
  // 전시 목록 조회
  async getExhibitions() {
    const { data, error } = await supabase
      .from('exhibitions')
      .select('*')
      .gte('end_date', new Date().toISOString().split('T')[0])
      .order('start_date', { ascending: true });

    if (error) throw error;
    return data;
  },

  // 동행 요청 생성
  async createRequest(requestData: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('companion_requests')
      .insert({
        exhibition_id: requestData.exhibition_id,
        requester_id: user.id,
        preferred_date: requestData.preferred_date,
        preferred_time: requestData.preferred_time,
        flexible_scheduling: requestData.flexible_scheduling || true,
        group_size_preference: requestData.group_size_preference || 2,
        interaction_style: requestData.interaction_style || [],
        companion_preferences: requestData.companion_preferences || {},
        additional_notes: requestData.additional_notes,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30일 후 만료
      })
      .select(`
        *,
        exhibition:exhibitions(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  // 내 동행 요청 조회
  async getMyRequests() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('companion_requests')
      .select(`
        *,
        exhibition:exhibitions(*),
        matches:companion_matches(
          id,
          status,
          companion:user_profiles!companion_id(
            id,
            username,
            profile_image_url,
            apt_type
          )
        )
      `)
      .eq('requester_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // 매칭 가능한 요청들 조회 (다른 사용자들의)
  async getAvailableRequests() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('companion_requests')
      .select(`
        *,
        exhibition:exhibitions(*),
        requester:user_profiles!requester_id(
          id,
          username,
          profile_image_url,
          apt_type
        )
      `)
      .neq('requester_id', user.id)
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // 내 매칭 결과 조회
  async getMyMatches() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('companion_matches')
      .select(`
        *,
        request:companion_requests!request_id(
          *,
          exhibition:exhibitions(*)
        ),
        requester:user_profiles!requester_id(
          id,
          username,
          profile_image_url,
          apt_type
        ),
        companion:user_profiles!companion_id(
          id,
          username,
          profile_image_url,
          apt_type
        )
      `)
      .or(`requester_id.eq.${user.id},companion_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // 매칭 요청 (다른 사용자의 요청에 매칭)
  async requestMatch(requestId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // 먼저 요청 정보 조회
    const { data: request } = await supabase
      .from('companion_requests')
      .select(`
        *,
        requester:user_profiles!requester_id(apt_type, apt_dimensions)
      `)
      .eq('id', requestId)
      .single();

    if (!request) throw new Error('Request not found');

    // 현재 사용자 프로필 조회
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('apt_type, apt_dimensions')
      .eq('id', user.id)
      .single();

    // 호환성 점수 계산 (간단한 버전)
    const compatibilityScore = this.calculateCompatibility(
      userProfile?.apt_type,
      userProfile?.apt_dimensions,
      request.requester.apt_type,
      request.requester.apt_dimensions
    );

    // 매칭 생성
    const { data, error } = await supabase
      .from('companion_matches')
      .insert({
        request_id: requestId,
        requester_id: request.requester_id,
        companion_id: user.id,
        compatibility_score: compatibilityScore,
        match_reasoning: {
          apt_compatibility: compatibilityScore,
          common_interests: [], // 추후 구현
          location_match: true // 추후 구현
        },
        status: 'proposed'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // APT 호환성 계산
  calculateCompatibility(type1: string, dims1: any, type2: string, dims2: any): number {
    let score = 0.5; // 기본 점수

    // 호환성 매트릭스 (간단 버전)
    const complementaryTypes: Record<string, string[]> = {
      'LAEF': ['SRMC', 'SRMF'],
      'LAEC': ['SREF', 'SREC'],
      'LAMF': ['SAEC', 'SAEF'],
      'LAMC': ['SAMF', 'SAMC'],
      'LREF': ['SAMC', 'SAMF'],
      'LREC': ['SAEF', 'SAEC'],
      'LRMF': ['LAEC', 'LAEF'],
      'LRMC': ['LAEF', 'LAEC'],
      'SAEF': ['LRMC', 'LRMF'],
      'SAEC': ['LREF', 'LREC'],
      'SAMF': ['LAMC', 'LREF'],
      'SAMC': ['LAMF', 'LREF'],
      'SREF': ['LAEC', 'LAMC'],
      'SREC': ['LAEF', 'LAMF'],
      'SRMF': ['LAEF', 'LAEC'],
      'SRMC': ['LAEF', 'LAEC']
    };

    // 상호 보완적인 유형인지 확인
    if (type1 && type2 && complementaryTypes[type1]?.includes(type2)) {
      score += 0.3;
    }

    // 차원별 균형 점수 (적당한 차이가 좋음)
    if (dims1 && dims2) {
      const dimensions = ['G_S', 'A_R', 'M_E', 'F_S'];
      let dimScore = 0;
      
      for (const dim of dimensions) {
        const diff = Math.abs((dims1[dim] || 0.5) - (dims2[dim] || 0.5));
        if (diff >= 0.2 && diff <= 0.4) {
          dimScore += 0.25;
        }
      }
      score += dimScore * 0.2;
    }

    return Math.min(Math.max(score, 0), 1);
  },

  // 매칭 수락/거절
  async updateMatchStatus(matchId: string, status: 'accepted' | 'rejected') {
    const { error } = await supabase
      .from('companion_matches')
      .update({ 
        status: status === 'accepted' ? 'confirmed' : 'cancelled'
      })
      .eq('id', matchId);

    if (error) throw error;
  },

  // 동행 완료 및 평가
  async completeAndEvaluate(matchId: string, evaluation: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // 매칭 상태를 완료로 업데이트
    await supabase
      .from('companion_matches')
      .update({ status: 'completed' })
      .eq('id', matchId);

    // 평가 저장
    const { data, error } = await supabase
      .from('companion_evaluations')
      .insert({
        match_id: matchId,
        evaluator_id: user.id,
        companion_rating: evaluation.companion_rating,
        exhibition_experience_rating: evaluation.exhibition_experience_rating,
        conversation_quality: evaluation.conversation_quality,
        would_meet_again: evaluation.would_meet_again,
        feedback_text: evaluation.feedback_text
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 동행 통계 조회
  async getCompanionStats() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const [myRequests, completedMatches, evaluations] = await Promise.all([
      // 내 요청 수
      supabase
        .from('companion_requests')
        .select('id', { count: 'exact' })
        .eq('requester_id', user.id)
        .eq('status', 'active'),
      
      // 완료된 매칭 수
      supabase
        .from('companion_matches')
        .select('id', { count: 'exact' })
        .or(`requester_id.eq.${user.id},companion_id.eq.${user.id}`)
        .eq('status', 'completed'),
      
      // 받은 평가들
      supabase
        .from('companion_evaluations')
        .select('companion_rating, exhibition_experience_rating')
        .neq('evaluator_id', user.id) // 다른 사람이 나를 평가한 것
        .in('match_id', 
          // 내가 참여한 매칭들의 ID
          supabase
            .from('companion_matches')
            .select('id')
            .or(`requester_id.eq.${user.id},companion_id.eq.${user.id}`)
        )
    ]);

    const avgRating = evaluations.data?.length > 0
      ? evaluations.data.reduce((sum, eval) => sum + eval.companion_rating, 0) / evaluations.data.length
      : 0;

    return {
      myRequests: myRequests.count || 0,
      completedMatches: completedMatches.count || 0,
      totalCompanions: completedMatches.count || 0,
      averageRating: avgRating,
      exhibitionsVisited: completedMatches.count || 0,
      thisMonthVisits: 0 // 추후 구현
    };
  }
};