import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const supabase = createClientComponentClient();

export const exchangeApi = {
  // 감상 교환 세션 시작
  async startExchange(artworkData: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // 매칭 가능한 사용자 찾기
    const matchedUserId = await this.findCompatibleUser(user.id, artworkData);
    
    if (!matchedUserId) {
      throw new Error('현재 매칭 가능한 사용자가 없습니다');
    }

    const { data, error } = await supabase
      .from('perception_exchange_sessions')
      .insert({
        artwork_id: artworkData.id,
        museum_source: artworkData.source,
        artwork_data: artworkData,
        initiator_id: user.id,
        participant_id: matchedUserId,
        current_phase: 1,
        status: 'active'
      })
      .select(`
        *,
        initiator:user_profiles!initiator_id(*),
        participant:user_profiles!participant_id(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  // 호환 가능한 사용자 찾기 (APT 기반 매칭)
  async findCompatibleUser(currentUserId: string, artworkData: any) {
    // 1. 현재 사용자의 프로필 가져오기
    const { data: currentUser } = await supabase
      .from('user_profiles')
      .select('apt_type, apt_dimensions')
      .eq('id', currentUserId)
      .single();

    if (!currentUser) return null;

    // 2. 커뮤니티 잠금 해제된 사용자들 중에서 매칭
    const { data: candidates } = await supabase
      .from('user_art_activities')
      .select(`
        user_id,
        user_profiles!inner(
          id,
          apt_type,
          apt_dimensions
        )
      `)
      .eq('community_unlocked', true)
      .neq('user_id', currentUserId);

    if (!candidates || candidates.length === 0) return null;

    // 3. APT 호환성 기반으로 매칭 점수 계산
    let bestMatch = null;
    let bestScore = 0;

    for (const candidate of candidates) {
      const profile = candidate.user_profiles;
      const compatibility = this.calculateAPTCompatibility(
        currentUser.apt_type,
        currentUser.apt_dimensions,
        profile.apt_type,
        profile.apt_dimensions
      );

      if (compatibility > bestScore) {
        bestScore = compatibility;
        bestMatch = profile.id;
      }
    }

    return bestMatch;
  },

  // APT 호환성 계산
  calculateAPTCompatibility(type1: string, dims1: any, type2: string, dims2: any): number {
    // 기본 호환성 매트릭스 (실제로는 더 정교한 알고리즘 필요)
    const complementaryTypes = {
      'LAEF': ['SRMC', 'SRMF'], // Fox와 Eagle/Elephant
      'LAEC': ['SREF', 'SREC'], // Cat과 Dog/Duck
      'LAMF': ['SAEC', 'SAEF'], // Owl과 Penguin/Butterfly
      'LAMC': ['SAMF', 'SAMC'], // Turtle과 Parrot/Deer
      // ... 나머지 조합들
    };

    let score = 0.5; // 기본 점수

    // 상호 보완적인 유형인지 확인
    if (complementaryTypes[type1]?.includes(type2)) {
      score += 0.3;
    }

    // 차원별 균형 확인 (너무 같지도, 너무 다르지도 않은)
    if (dims1 && dims2) {
      const dimensions = ['G_S', 'A_R', 'M_E', 'F_S'];
      let dimScore = 0;
      
      for (const dim of dimensions) {
        const diff = Math.abs((dims1[dim] || 0.5) - (dims2[dim] || 0.5));
        // 적당한 차이(0.2-0.4)가 가장 흥미로운 조합
        if (diff >= 0.2 && diff <= 0.4) {
          dimScore += 0.25;
        }
      }
      score += dimScore * 0.2;
    }

    return Math.min(score, 1.0);
  },

  // 활성 세션 조회
  async getActiveSessions() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('perception_exchange_sessions')
      .select(`
        *,
        initiator:user_profiles!initiator_id(
          id,
          username,
          profile_image_url,
          apt_type
        ),
        participant:user_profiles!participant_id(
          id,
          username,
          profile_image_url,
          apt_type
        ),
        responses:perception_responses(
          phase,
          user_id,
          submitted_at
        )
      `)
      .or(`initiator_id.eq.${user.id},participant_id.eq.${user.id}`)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // 완료된 세션 조회
  async getCompletedSessions() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('perception_exchange_sessions')
      .select(`
        *,
        initiator:user_profiles!initiator_id(
          id,
          username,
          profile_image_url,
          apt_type
        ),
        participant:user_profiles!participant_id(
          id,
          username,
          profile_image_url,
          apt_type
        ),
        evaluations:exchange_evaluations(
          connection_quality,
          insight_gained,
          would_continue
        )
      `)
      .or(`initiator_id.eq.${user.id},participant_id.eq.${user.id}`)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // 교환 통계 조회
  async getExchangeStats() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const [activeSessions, completedSessions, evaluations] = await Promise.all([
      // 진행 중인 세션 수
      supabase
        .from('perception_exchange_sessions')
        .select('id', { count: 'exact' })
        .or(`initiator_id.eq.${user.id},participant_id.eq.${user.id}`)
        .eq('status', 'active'),
      
      // 완료된 세션 수
      supabase
        .from('perception_exchange_sessions')
        .select('id', { count: 'exact' })
        .or(`initiator_id.eq.${user.id},participant_id.eq.${user.id}`)
        .eq('status', 'completed'),
      
      // 평가 점수들
      supabase
        .from('exchange_evaluations')
        .select('connection_quality, insight_gained')
        .eq('evaluator_id', user.id)
    ]);

    const avgConnectionScore = evaluations.data && evaluations.data.length > 0
      ? evaluations.data.reduce((sum, eval) => sum + eval.connection_quality, 0) / evaluations.data.length
      : 0;

    const insightsGained = evaluations.data?.reduce((sum, eval) => sum + eval.insight_gained, 0) || 0;

    return {
      activeSessions: activeSessions.count || 0,
      completedSessions: completedSessions.count || 0,
      totalParticipants: completedSessions.count || 0, // 간단히 완료된 세션 수로 계산
      averageConnectionScore: avgConnectionScore,
      insightsGained
    };
  },

  // 세션 상세 정보 조회
  async getSessionDetail(sessionId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('perception_exchange_sessions')
      .select(`
        *,
        initiator:user_profiles!initiator_id(
          id,
          username,
          profile_image_url,
          apt_type
        ),
        participant:user_profiles!participant_id(
          id,
          username,
          profile_image_url,
          apt_type
        ),
        responses:perception_responses(
          *
        )
      `)
      .eq('id', sessionId)
      .or(`initiator_id.eq.${user.id},participant_id.eq.${user.id}`)
      .single();

    if (error) throw error;
    return data;
  },

  // 단계별 응답 제출
  async submitResponse(sessionId: string, phase: number, responseData: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('perception_responses')
      .upsert({
        session_id: sessionId,
        user_id: user.id,
        phase: phase,
        response_data: responseData
      })
      .select()
      .single();

    if (error) throw error;

    // 양쪽 모두 응답했는지 확인하고 다음 단계로 진행
    await this.checkPhaseCompletion(sessionId, phase);

    return data;
  },

  // 단계 완료 확인 및 진행
  async checkPhaseCompletion(sessionId: string, phase: number) {
    const { count } = await supabase
      .from('perception_responses')
      .select('*', { count: 'exact' })
      .eq('session_id', sessionId)
      .eq('phase', phase);

    // 두 사용자 모두 응답했으면 다음 단계로
    if (count === 2) {
      if (phase < 4) {
        await supabase
          .from('perception_exchange_sessions')
          .update({ current_phase: phase + 1 })
          .eq('id', sessionId);
      } else {
        // 마지막 단계 완료
        await supabase
          .from('perception_exchange_sessions')
          .update({ 
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('id', sessionId);
      }
    }
  },

  // 교환 평가 제출
  async submitEvaluation(sessionId: string, evaluation: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('exchange_evaluations')
      .upsert({
        session_id: sessionId,
        evaluator_id: user.id,
        connection_quality: evaluation.connection_quality,
        insight_gained: evaluation.insight_gained,
        comfort_level: evaluation.comfort_level,
        would_continue: evaluation.would_continue,
        feedback_text: evaluation.feedback_text
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 교환 중단
  async discontinueSession(sessionId: string, reason: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('perception_exchange_sessions')
      .update({ 
        status: 'discontinued',
        completed_at: new Date().toISOString()
      })
      .eq('id', sessionId)
      .or(`initiator_id.eq.${user.id},participant_id.eq.${user.id}`);

    if (error) throw error;
  }
};