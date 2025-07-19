// 전시 동행 매칭 관련 타입 정의

export interface Exhibition {
  id: string;
  external_id?: string;
  title: string;
  venue: string;
  venue_address?: string;
  start_date: string;
  end_date: string;
  description?: string;
  image_url?: string;
  ticket_url?: string;
  ticket_price_range?: string;
  category?: string;
  created_at: string;
  updated_at: string;
  // 조인된 데이터
  interest_count?: number;
  companion_request_count?: number;
  user_interested?: boolean;
}

export interface CompanionRequest {
  id: string;
  user_id: string;
  exhibition_id: string;
  preferred_date: string;
  preferred_time_slot: 'morning' | 'afternoon' | 'evening' | 'flexible';
  group_size: number;
  viewing_pace: 'quick' | 'moderate' | 'slow';
  interaction_style: 'silent_first' | 'discuss_while' | 'flexible';
  preferred_apt_types?: string[];
  age_range?: [number, number];
  gender_preference?: 'same' | 'any';
  message?: string;
  status: 'active' | 'matched' | 'expired' | 'cancelled';
  expires_at: string;
  created_at: string;
  // 조인된 데이터
  user?: {
    id: string;
    username: string;
    profile_image_url?: string;
    apt_type: string;
    age?: number;
    gender?: string;
  };
  exhibition?: Exhibition;
  matches?: CompanionMatch[];
}

export interface CompanionMatch {
  id: string;
  request_id: string;
  companion_id: string;
  apt_compatibility_score: number;
  style_match_score: number;
  schedule_match_score: number;
  total_match_score: number;
  status: 'pending' | 'accepted' | 'declined';
  responded_at?: string;
  met_in_person?: boolean;
  rating?: number;
  review_tags?: string[];
  review_note?: string;
  created_at: string;
  // 조인된 데이터
  companion?: {
    id: string;
    username: string;
    profile_image_url?: string;
    apt_type: string;
  };
  request?: CompanionRequest;
}

export interface CreateCompanionRequestData {
  exhibition_id: string;
  preferred_date: string;
  preferred_time_slot: 'morning' | 'afternoon' | 'evening' | 'flexible';
  group_size?: number;
  viewing_pace: 'quick' | 'moderate' | 'slow';
  interaction_style: 'silent_first' | 'discuss_while' | 'flexible';
  preferred_apt_types?: string[];
  age_range?: [number, number];
  gender_preference?: 'same' | 'any';
  message?: string;
}

// 시간대 옵션
export const TIME_SLOT_OPTIONS = [
  { value: 'morning', label: '오전 (10:00-13:00)' },
  { value: 'afternoon', label: '오후 (13:00-18:00)' },
  { value: 'evening', label: '저녁 (18:00-21:00)' },
  { value: 'flexible', label: '시간 조율 가능' }
] as const;

// 관람 속도 옵션
export const VIEWING_PACE_OPTIONS = [
  { value: 'quick', label: '빠르게', description: '주요 작품 위주로 1시간 내외' },
  { value: 'moderate', label: '보통', description: '전시 전체를 2시간 내외' },
  { value: 'slow', label: '천천히', description: '작품 하나하나 꼼꼼히' }
] as const;

// 상호작용 스타일 옵션
export const INTERACTION_STYLE_OPTIONS = [
  { value: 'silent_first', label: '각자 감상 후 대화', description: '먼저 조용히 감상하고 나중에 이야기' },
  { value: 'discuss_while', label: '함께 보며 대화', description: '작품을 보면서 자유롭게 대화' },
  { value: 'flexible', label: '상황에 따라', description: '분위기에 맞춰 유연하게' }
] as const;

// 동행 후 평가 태그
export const REVIEW_TAGS = [
  '시간 약속을 잘 지켜요',
  '대화가 즐거웠어요',
  '취향이 잘 맞아요',
  '배려심이 있어요',
  '전시 지식이 풍부해요',
  '편안한 분위기예요',
  '다시 만나고 싶어요'
] as const;

export type ReviewTag = typeof REVIEW_TAGS[number];