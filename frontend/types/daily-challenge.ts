// 데일리 아트 챌린지 관련 타입 정의

export interface DailyChallenge {
  id: string;
  date: string;
  artwork_id: string;
  museum_source: 'met' | 'cleveland' | 'rijksmuseum' | 'artvee';
  artwork_data: {
    title: string;
    artist: string;
    date?: string;
    medium?: string;
    image_url: string;
    museum_url?: string;
    description?: string;
  };
  artwork_vector?: {
    era?: string;
    color?: string;
    subject?: string;
    emotion?: string;
  };
  theme?: string;
  curator_note?: string;
  created_at: string;
}

export interface ChallengeResponse {
  id: string;
  challenge_date: string;
  user_id: string;
  user_apt_type: string;
  emotion_tags: string[];
  emotion_selection_time?: number;
  emotion_changed?: boolean;
  personal_note?: string;
  responded_at: string;
}

export interface UserTasteProfile {
  user_id: string;
  apt_type: string;
  preference_vector: Record<string, number>;
  avg_response_time?: number;
  consistency_score?: number;
  exploration_score?: number;
  total_challenges: number;
  artworks_by_era: Record<string, number>;
  artworks_by_style: Record<string, number>;
  emotion_frequency: Record<string, number>;
  updated_at: string;
}

export interface ChallengeMatch {
  id: string;
  challenge_date: string;
  user1_id: string;
  user2_id: string;
  apt_compatibility_score: number;
  taste_similarity_score: number;
  emotion_match_score: number;
  total_match_score: number;
  match_rank?: number;
  notification_sent: boolean;
  interaction_started: boolean;
  created_at: string;
  // 조인된 데이터
  matched_user?: {
    id: string;
    username: string;
    profile_image_url?: string;
    apt_type: string;
  };
}

export interface DailyChallengeStats {
  total_responses: number;
  emotion_distribution: Record<string, number>;
  apt_distribution: Record<string, number>;
  avg_response_time: number;
  top_emotions: Array<{
    emotion: string;
    count: number;
    percentage: number;
  }>;
}

// 감정 선택 상태 관리
export interface EmotionSelectionState {
  selectedEmotions: string[];
  selectionStartTime: number;
  hasChanged: boolean;
}

// 챌린지 진행 상태
export interface ChallengeProgressState {
  hasResponded: boolean;
  currentStreak: number;
  longestStreak: number;
  totalParticipations: number;
  nextReward?: {
    type: '7day_streak' | '30day_streak';
    daysRemaining: number;
  };
}

// 매칭 결과 보기 상태
export interface MatchViewState {
  showMatches: boolean;
  topMatches: ChallengeMatch[];
  myEmotions: string[];
  stats: DailyChallengeStats;
}