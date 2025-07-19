// 감상 교환 시스템 타입 정의

export interface PerceptionExchangeSession {
  id: string;
  initiator_id: string;
  partner_id: string;
  artwork_id: string;
  museum_source: string;
  artwork_data: {
    title: string;
    artist: string;
    image_url: string;
    date?: string;
    medium?: string;
  };
  status: 'pending' | 'active' | 'completed' | 'expired' | 'declined';
  current_phase: 1 | 2 | 3 | 4;
  initiated_at: string;
  accepted_at?: string;
  completed_at?: string;
  expires_at: string;
  // 조인된 데이터
  partner?: {
    id: string;
    username?: string; // phase 2부터
    profile_image_url?: string; // phase 3부터
    apt_type?: string; // phase 3부터
  };
  messages?: PerceptionMessage[];
  quality_metrics?: ExchangeQualityMetrics;
}

export interface PerceptionMessage {
  id: string;
  session_id: string;
  sender_id: string;
  content: string;
  emotion_tags?: string[];
  phase: 1 | 2 | 3 | 4;
  word_count: number;
  sent_at: string;
  read_at?: string;
  reaction?: 'resonate' | 'thoughtful' | 'inspiring';
  // 현재 단계에 따라 표시되는 정보
  sender_info?: {
    is_me: boolean;
    nickname?: string; // phase 2부터
    apt_type?: string; // phase 3부터
    profile_image_url?: string; // phase 3부터
  };
}

export interface ExchangePreferences {
  user_id: string;
  preferred_exchange_pace: 'slow' | 'moderate' | 'flexible';
  min_message_length: number;
  auto_accept_from_high_matches: boolean;
  auto_accept_threshold: number;
  notify_new_invitations: boolean;
  notify_new_messages: boolean;
  notify_phase_changes: boolean;
  updated_at: string;
}

export interface ExchangeQualityMetrics {
  session_id: string;
  avg_message_length: number;
  total_word_count: number;
  unique_emotion_tags: number;
  response_time_hours?: number;
  message_frequency?: number;
  completion_rate?: number;
  depth_score: number;
  engagement_score: number;
  resonance_score?: number;
  calculated_at: string;
}

// 감상 교환 초대 요청
export interface CreateExchangeRequest {
  partner_id: string;
  artwork_id: string;
  museum_source: string;
  artwork_data: any;
  initial_message: string;
}

// 단계별 공개 정보
export const PHASE_INFO = {
  1: {
    title: '익명 감상',
    description: '서로의 정체를 모른 채 순수하게 작품에 대한 감상을 나눕니다',
    reveals: []
  },
  2: {
    title: '닉네임 공개',
    description: '서로의 닉네임이 공개됩니다',
    reveals: ['nickname']
  },
  3: {
    title: '프로필 일부 공개',
    description: 'APT 유형과 기본 프로필이 공개됩니다',
    reveals: ['nickname', 'apt_type', 'profile_image']
  },
  4: {
    title: '완전한 연결',
    description: '모든 프로필이 공개되고 자유롭게 대화할 수 있습니다',
    reveals: ['full_profile']
  }
} as const;

// 감상 교환 상태
export interface ExchangeListItem {
  session: PerceptionExchangeSession;
  unread_count: number;
  last_message?: PerceptionMessage;
  my_role: 'initiator' | 'partner';
}