// APT (Art Persona Type) 기반 예술 스타일 매칭 시스템
import { PersonalityType } from '@/shared/SAYUTypeDefinitions';

export type ArtMovement = 
  | 'RENAISSANCE'        // 르네상스
  | 'IMPRESSIONISM'      // 인상주의
  | 'ABSTRACT'           // 추상주의
  | 'MINIMALISM'         // 미니멀리즘
  | 'POP_ART'            // 팝아트
  | 'SURREALISM'         // 초현실주의
  | 'BAROQUE'            // 바로크
  | 'CUBISM'             // 입체주의
  | 'ROMANTICISM'        // 낭만주의
  | 'MODERNISM'          // 모더니즘
  | 'CONTEMPORARY'       // 현대미술
  | 'EXPRESSIONISM'      // 표현주의
  | 'REALISM'            // 사실주의
  | 'ART_NOUVEAU'        // 아르누보
  | 'DIGITAL_ART'        // 디지털아트
  | 'KOREAN_ART';        // 한국미술

// APT와 예술 사조 매핑
export const APT_TO_ART_MOVEMENT: Record<PersonalityType, ArtMovement> = {
  'LAEF': 'IMPRESSIONISM',     // 여우 - 몽환적이고 감정적
  'LAEC': 'ART_NOUVEAU',        // 고양이 - 우아하고 장식적
  'LAMF': 'SURREALISM',         // 올빼미 - 직관적이고 신비로운
  'LAMC': 'RENAISSANCE',        // 거북이 - 철학적이고 전통적
  'LREF': 'CONTEMPORARY',       // 카멜레온 - 관찰자, 현대적
  'LREC': 'ROMANTICISM',        // 고슴도치 - 섬세하고 감정적
  'LRMF': 'DIGITAL_ART',        // 문어 - 디지털 탐험가
  'LRMC': 'REALISM',            // 비버 - 학구적이고 사실적
  'SAEF': 'POP_ART',            // 나비 - 감성적이고 대중적
  'SAEC': 'KOREAN_ART',         // 펭귄 - 커뮤니티 중심
  'SAMF': 'EXPRESSIONISM',      // 앵무새 - 영감 전달자
  'SAMC': 'BAROQUE',            // 사슴 - 문화 기획자
  'SREF': 'POP_ART',            // 강아지 - 열정적이고 친근한
  'SREC': 'IMPRESSIONISM',      // 오리 - 따뜻한 안내자
  'SRMF': 'MODERNISM',          // 코끼리 - 지식 멘토
  'SRMC': 'CUBISM'              // 독수리 - 체계적이고 분석적
};

// 예술 사조별 특성
export interface ArtMovementProfile {
  movement: ArtMovement;
  koreanName: string;
  characteristics: string[];
  colorPalette: string[];
  keywords: string[];
  description: string;
  matchingTraits: {
    social: number;      // 0-100 (L=0, S=100)
    abstract: number;    // 0-100 (R=0, A=100)
    emotional: number;   // 0-100 (M=0, E=100)
    structured: number;  // 0-100 (F=0, C=100)
  };
}

// 점진적 공개 레벨
export interface PrivacyLevel {
  level: 1 | 2 | 3 | 4;
  name: string;
  description: string;
  reveals: string[];
  visualEffect: {
    blur: number;        // 0-100
    opacity: number;     // 0-1
    artFilter: boolean;  // 예술 필터 적용 여부
  };
}

// 사용자 프라이버시 상태
export interface UserPrivacyState {
  userId: string;
  currentLevel: PrivacyLevel['level'];
  artPersonaImage?: string;      // AI 생성 아트 페르소나 이미지
  blurredPhoto?: string;         // 블러 처리된 사진
  artisticMaskPhoto?: string;    // 예술적 마스크 적용 사진
  revealedInfo: string[];
  lastUpdated: Date;
}

// 매칭 상호작용 타입
export type InteractionType = 
  | 'ARTWORK_COMMENT'      // 작품에 대한 코멘트
  | 'INTERPRETATION'       // 작품 해석 공유
  | 'COLLECTION_INVITE'    // 컬렉션 초대
  | 'EXHIBITION_INVITE'    // 전시 동행 제안
  | 'PRIVACY_REVEAL'       // 프라이버시 레벨 공개 요청
  | 'VOICE_NOTE';          // 음성 노트

// 상호작용 프롬프트
export interface InteractionPrompt {
  id: string;
  type: InteractionType;
  prompt: string;
  targetUserId?: string;
  artworkId?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

// APT 호환성 점수
export interface APTCompatibilityScore {
  overall: number;          // 0-100
  dimensions: {
    social: number;         // L/S 축 호환성
    artistic: number;       // A/R 축 호환성
    emotional: number;      // E/M 축 호환성
    structural: number;     // F/C 축 호환성
  };
  sharedInterests: string[];
  complementaryTraits: string[];
}

// 전시 동행 매칭 (Thursday 스타일)
export interface ExhibitionMatch {
  id: string;
  exhibitionId: string;
  hostUserId: string;
  matchedUserId?: string;
  preferredDate: Date;
  timeSlot: 'morning' | 'afternoon' | 'evening';
  matchingCriteria: {
    aptTypes: PersonalityType[];
    minCompatibility: number;
    interests: string[];
  };
  status: 'open' | 'matched' | 'completed' | 'cancelled';
  expiresAt: Date;  // 24시간 후 만료
}

// 공유 컬렉션 (큐레이터의 선택)
export interface SharedCollection {
  id: string;
  name: string;
  theme: string;
  creatorId: string;
  collaboratorIds: string[];
  artworks: {
    artworkId: string;
    addedBy: string;
    note?: string;
    voiceNote?: string;
    addedAt: Date;
  }[];
  visibility: 'private' | 'friends' | 'public';
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// 실시간 갤러리 탐색 세션
export interface GallerySession {
  sessionId: string;
  participants: {
    userId: string;
    aptType: PersonalityType;
    cursorPosition?: { x: number; y: number };
    currentArtwork?: string;
    isActive: boolean;
  }[];
  galleryId: string;
  startedAt: Date;
  sharedNotes: {
    userId: string;
    artworkId: string;
    note: string;
    timestamp: Date;
  }[];
}

// 안전 기능
export interface SafetyFeatures {
  meetingSpot: {
    venue: string;
    address: string;
    nearbyLandmarks: string[];
    safetyRating: number;  // 1-5
  };
  checkInRequired: boolean;
  emergencyContact?: {
    enabled: boolean;
    contactId?: string;
  };
  reportingEnabled: boolean;
}