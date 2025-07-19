// 관계 유형 및 선호도 관련 타입 정의

export interface RelationshipType {
  code: string;
  name_ko: string;
  name_en: string;
  description: string;
  icon: string;
  sort_order: number;
}

export interface RelationshipPreferences {
  seeking_types: string[];
  romance_openness?: number; // 0-1 scale
  age_preference?: [number, number];
  gender_preference?: 'same' | 'opposite' | 'any';
  location_range?: number; // km
  updated_at?: string;
}

export interface RelationshipProgression {
  id: string;
  user1_id: string;
  user2_id: string;
  initial_connection_type: 'daily_challenge' | 'perception_exchange' | 'exhibition_companion';
  initial_connection_date: string;
  current_relationship_type?: string;
  relationship_level: number; // 1-5
  total_interactions: number;
  last_interaction_at?: string;
  communication_quality?: number;
  shared_interests_score?: number;
  emotional_resonance?: number;
  milestones?: RelationshipMilestone[];
  created_at: string;
  updated_at: string;
  // 조인된 데이터
  partner?: {
    id: string;
    username: string;
    profile_image_url?: string;
    apt_type: string;
  };
}

export interface RelationshipMilestone {
  type: string;
  date: string;
  details?: Record<string, any>;
}

export interface RelationshipBoundaries {
  user_id: string;
  show_real_name_after: 'never' | 'match' | 'first_meeting' | 'mutual_agreement';
  share_contact_after: 'never' | 'match' | 'first_meeting' | 'mutual_agreement';
  block_list: string[];
  pause_matching: boolean;
  pause_until?: string;
  auto_decline_if_no_photo: boolean;
  auto_decline_incomplete_profiles: boolean;
  updated_at: string;
}

// 관계 유형 상수
export const RELATIONSHIP_TYPES = {
  ART_FRIEND: 'art_friend',
  CONVERSATION: 'conversation',
  ROMANCE_OPEN: 'romance_open',
  MENTOR: 'mentor',
  COMPANION: 'companion'
} as const;

// 관계 레벨 정의
export const RELATIONSHIP_LEVELS = {
  1: { name: '새로운 연결', description: '막 연결된 관계' },
  2: { name: '친근한 사이', description: '몇 번의 교류를 나눈 관계' },
  3: { name: '규칙적 교류', description: '정기적으로 소통하는 관계' },
  4: { name: '깊은 유대', description: '서로를 잘 이해하는 관계' },
  5: { name: '특별한 연결', description: '매우 가까운 관계' }
} as const;

// 관계 설정 옵션
export const ROMANCE_OPENNESS_OPTIONS = [
  { value: 0, label: '친구로만', description: '로맨틱한 관계를 원하지 않습니다' },
  { value: 0.3, label: '열려있음', description: '자연스럽게 발전한다면 괜찮습니다' },
  { value: 0.7, label: '관심있음', description: '로맨스로 발전하길 희망합니다' },
  { value: 1, label: '적극적', description: '로맨틱한 관계를 찾고 있습니다' }
] as const;

export const GENDER_PREFERENCE_OPTIONS = [
  { value: 'same', label: '같은 성별' },
  { value: 'opposite', label: '다른 성별' },
  { value: 'any', label: '성별 무관' }
] as const;

// 프라이버시 옵션
export const PRIVACY_OPTIONS = {
  showRealName: [
    { value: 'never', label: '공개하지 않음' },
    { value: 'match', label: '매칭 후 즉시' },
    { value: 'first_meeting', label: '첫 만남 이후' },
    { value: 'mutual_agreement', label: '상호 동의 시' }
  ],
  shareContact: [
    { value: 'never', label: '공개하지 않음' },
    { value: 'match', label: '매칭 후 즉시' },
    { value: 'first_meeting', label: '첫 만남 이후' },
    { value: 'mutual_agreement', label: '상호 동의 시' }
  ]
} as const;