import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { 
  PerceptionExchangeSession, 
  PerceptionMessage,
  ExchangePreferences,
  CreateExchangeRequest,
  ExchangeListItem
} from '../../../shared';

const supabase = createClientComponentClient();

export const perceptionExchangeApi = {
  // 감상 교환 초대 생성
  async createExchange(request: CreateExchangeRequest): Promise<string> {
    const { data, error } = await supabase.rpc('create_perception_exchange', {
      p_partner_id: request.partner_id,
      p_artwork_id: request.artwork_id,
      p_museum_source: request.museum_source,
      p_artwork_data: request.artwork_data,
      p_initial_message: request.initial_message
    });

    if (error) throw error;
    return data;
  },

  // 내 교환 목록 조회
  async getMyExchanges(status?: string): Promise<ExchangeListItem[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    let query = supabase
      .from('perception_exchange_sessions')
      .select(`
        *,
        messages:perception_messages(
          *,
          sender:user_profiles!sender_id(
            id:user_id,
            username,
            profile_image_url,
            apt_type:personality_type
          )
        ),
        initiator:user_profiles!initiator_id(
          id:user_id,
          username,
          profile_image_url,
          apt_type:personality_type
        ),
        partner:user_profiles!partner_id(
          id:user_id,
          username,
          profile_image_url,
          apt_type:personality_type
        ),
        quality_metrics:exchange_quality_metrics(*)
      `)
      .or(`initiator_id.eq.${user.id},partner_id.eq.${user.id}`)
      .order('initiated_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;

    // 리스트 아이템으로 변환
    return (data || []).map(session => {
      const isInitiator = session.initiator_id === user.id;
      const messages = session.messages || [];
      
      // 읽지 않은 메시지 수 계산
      const unreadCount = messages.filter(
        msg => msg.sender_id !== user.id && !msg.read_at
      ).length;

      return {
        session: {
          ...session,
          partner: isInitiator ? session.partner : session.initiator,
          messages
        },
        unread_count: unreadCount,
        last_message: messages[messages.length - 1],
        my_role: isInitiator ? 'initiator' : 'partner'
      };
    });
  },

  // 특정 세션 상세 조회
  async getSession(sessionId: string): Promise<PerceptionExchangeSession | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('perception_exchange_sessions')
      .select(`
        *,
        messages:perception_messages(
          *
        )
        ORDER BY sent_at ASC,
        quality_metrics:exchange_quality_metrics(*)
      `)
      .eq('id', sessionId)
      .single();

    if (error) return null;

    // 현재 phase에 따라 파트너 정보 조회
    const isInitiator = data.initiator_id === user.id;
    const partnerId = isInitiator ? data.partner_id : data.initiator_id;
    
    let partnerInfo: any = { id: partnerId };

    if (data.current_phase >= 2) {
      // 닉네임 공개
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('username')
        .eq('user_id', partnerId)
        .single();
      
      if (profile) partnerInfo.username = profile.username;
    }

    if (data.current_phase >= 3) {
      // APT 타입과 프로필 이미지 공개
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('profile_image_url, personality_type')
        .eq('user_id', partnerId)
        .single();
      
      if (profile) {
        partnerInfo.profile_image_url = profile.profile_image_url;
        partnerInfo.apt_type = profile.personality_type;
      }
    }

    // 메시지에 발신자 정보 추가
    const messagesWithSenderInfo = (data.messages || []).map(msg => ({
      ...msg,
      sender_info: {
        is_me: msg.sender_id === user.id,
        ...(data.current_phase >= 2 && msg.sender_id !== user.id ? { nickname: partnerInfo.username } : {}),
        ...(data.current_phase >= 3 && msg.sender_id !== user.id ? { 
          apt_type: partnerInfo.apt_type,
          profile_image_url: partnerInfo.profile_image_url 
        } : {})
      }
    }));

    return {
      ...data,
      partner: partnerInfo,
      messages: messagesWithSenderInfo
    };
  },

  // 메시지 전송
  async sendMessage(
    sessionId: string, 
    content: string, 
    emotionTags?: string[]
  ): Promise<PerceptionMessage> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // 현재 phase 확인
    const { data: session } = await supabase
      .from('perception_exchange_sessions')
      .select('current_phase, status')
      .eq('id', sessionId)
      .single();

    if (!session || session.status !== 'active') {
      throw new Error('Session not active');
    }

    const wordCount = content.split(/\s+/).length;

    const { data, error } = await supabase
      .from('perception_messages')
      .insert({
        session_id: sessionId,
        sender_id: user.id,
        content,
        emotion_tags: emotionTags,
        phase: session.current_phase,
        word_count: wordCount
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 초대 수락
  async acceptInvitation(sessionId: string): Promise<void> {
    const { error } = await supabase
      .from('perception_exchange_sessions')
      .update({ 
        status: 'active',
        accepted_at: new Date().toISOString()
      })
      .eq('id', sessionId);

    if (error) throw error;
  },

  // 초대 거절
  async declineInvitation(sessionId: string): Promise<void> {
    const { error } = await supabase
      .from('perception_exchange_sessions')
      .update({ status: 'declined' })
      .eq('id', sessionId);

    if (error) throw error;
  },

  // 단계 진행 요청
  async requestPhaseAdvance(sessionId: string): Promise<boolean> {
    const { data, error } = await supabase.rpc('advance_exchange_phase', {
      p_session_id: sessionId
    });

    if (error) throw error;
    return data;
  },

  // 메시지 읽음 처리
  async markMessageAsRead(messageId: string): Promise<void> {
    const { error } = await supabase
      .from('perception_messages')
      .update({ read_at: new Date().toISOString() })
      .eq('id', messageId)
      .is('read_at', null);

    if (error) throw error;
  },

  // 메시지에 반응 추가
  async addReaction(
    messageId: string, 
    reaction: 'resonate' | 'thoughtful' | 'inspiring'
  ): Promise<void> {
    const { error } = await supabase
      .from('perception_messages')
      .update({ reaction })
      .eq('id', messageId);

    if (error) throw error;
  },

  // 교환 설정 조회
  async getPreferences(): Promise<ExchangePreferences | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('exchange_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // 교환 설정 업데이트
  async updatePreferences(
    preferences: Partial<ExchangePreferences>
  ): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('exchange_preferences')
      .upsert({
        user_id: user.id,
        ...preferences,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
  },

  // 추천 파트너 찾기 (작품 기반)
  async findPotentialPartners(artworkId: string): Promise<any[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // 같은 작품을 컬렉션에 저장한 사용자들 찾기
    const { data, error } = await supabase
      .from('collection_items')
      .select(`
        added_by,
        emotion_tags,
        user:user_profiles!added_by(
          id:user_id,
          username,
          profile_image_url,
          apt_type:personality_type
        )
      `)
      .eq('artwork_id', artworkId)
      .neq('added_by', user.id)
      .limit(10);

    if (error) return [];

    // 이미 교환 중인 사용자 제외
    const { data: existingSessions } = await supabase
      .from('perception_exchange_sessions')
      .select('initiator_id, partner_id')
      .eq('artwork_id', artworkId)
      .or(`initiator_id.eq.${user.id},partner_id.eq.${user.id}`);

    const excludedUsers = new Set(
      existingSessions?.flatMap(s => [s.initiator_id, s.partner_id]) || []
    );

    return (data || [])
      .filter(item => !excludedUsers.has(item.added_by))
      .map(item => ({
        user_id: item.added_by,
        ...item.user,
        shared_emotions: item.emotion_tags
      }));
  },

  // 진행 중인 세션 조회
  async getActiveSessions(): Promise<PerceptionExchangeSession[]> {
    const exchanges = await this.getMyExchanges('active');
    return exchanges.map(item => item.session);
  },

  // 완료된 세션 조회
  async getCompletedSessions(): Promise<PerceptionExchangeSession[]> {
    const exchanges = await this.getMyExchanges('completed');
    return exchanges.map(item => item.session);
  },

  // 교환 통계 조회
  async getExchangeStats(): Promise<{
    total_exchanges: number;
    active_exchanges: number;
    completed_exchanges: number;
    average_quality_score: number;
  }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase.rpc('get_exchange_stats', {
      p_user_id: user.id
    });

    if (error) throw error;
    return data || {
      total_exchanges: 0,
      active_exchanges: 0,
      completed_exchanges: 0,
      average_quality_score: 0
    };
  },

  // 교환 시작 (초대 수락과 동시에 첫 메시지 전송)
  async startExchange(sessionId: string, initialMessage: string): Promise<void> {
    await this.acceptInvitation(sessionId);
    await this.sendMessage(sessionId, initialMessage);
  }
};