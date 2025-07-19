// 작품 컬렉션 관련 타입 정의

export interface ArtCollection {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  is_public: boolean;
  is_shared: boolean;
  cover_image_url?: string;
  view_count: number;
  created_at: string;
  updated_at: string;
  // 조인된 데이터
  items_count?: number;
  likes_count?: number;
  user?: {
    id: string;
    username: string;
    profile_image_url?: string;
  };
}

export interface CollectionItem {
  id: string;
  collection_id: string;
  artwork_id: string;
  museum_source: 'met' | 'cleveland' | 'rijksmuseum' | 'artvee';
  artwork_data: ArtworkData;
  emotion_tags: string[];
  personal_note?: string;
  added_by: string;
  added_at: string;
  // 조인된 데이터
  added_by_user?: {
    id: string;
    username: string;
    profile_image_url?: string;
  };
}

export interface ArtworkData {
  id: string;
  title: string;
  artist: string;
  date: string;
  medium?: string;
  dimensions?: string;
  image_url: string;
  thumbnail_url?: string;
  museum_url?: string;
  description?: string;
}

export interface CollectionCollaborator {
  id: string;
  collection_id: string;
  user_id: string;
  role: 'owner' | 'collaborator';
  status: 'pending' | 'active' | 'left';
  invited_at: string;
  joined_at?: string;
  user?: {
    id: string;
    username: string;
    profile_image_url?: string;
    apt_type?: string;
  };
}

export interface CollectionComment {
  id: string;
  collection_id: string;
  user_id: string;
  content: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    username: string;
    profile_image_url?: string;
  };
  replies?: CollectionComment[];
}

export interface UserArtActivity {
  user_id: string;
  artworks_viewed: number;
  collections_created: number;
  emotions_tagged: number;
  notes_written: number;
  daily_challenges_completed: number;
  last_activity_at: string;
  community_unlocked: boolean;
  community_unlocked_at?: string;
}

// 감정 태그 옵션
export const EMOTION_TAGS = [
  // 긍정적 감정
  '평온함', '기쁨', '설렘', '따뜻함', '경이로움', '희망적',
  '자유로움', '영감', '활력', '만족감', '감동', '행복함',
  // 성찰적 감정
  '그리움', '몽환적', '신비로움', '사색적', '깊이있음', '철학적',
  '명상적', '초월적', '영적인', '숭고함', '경건함', '고요함',
  // 복잡한 감정
  '우울함', '불안함', '긴장감', '혼란스러움', '압도됨', '충격적',
  '도전적', '낯설음', '불편함', '강렬함', '날카로움', '무거움'
] as const;

export type EmotionTag = typeof EMOTION_TAGS[number];

// 컬렉션 생성/수정 요청 타입
export interface CreateCollectionRequest {
  title: string;
  description?: string;
  is_public?: boolean;
}

export interface AddItemToCollectionRequest {
  artwork_id: string;
  museum_source: string;
  artwork_data: ArtworkData;
  emotion_tags?: string[];
  personal_note?: string;
}

// 커뮤니티 오픈 기준
export const COMMUNITY_UNLOCK_CRITERIA = {
  min_artworks_viewed: 30,
  min_collections_created: 3,
  min_daily_challenges: 7,
  min_notes_written: 5
} as const;