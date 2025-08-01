// 작가 APT 매칭 시스템 타입 정의

export interface APTDimensions {
  L: number; // Lone (독립적)
  S: number; // Shared (사회적)
  A: number; // Abstract (추상적)
  R: number; // Representational (구상적)
  E: number; // Emotional (감정적)
  M: number; // Meaning-driven (의미적)
  F: number; // Flow (자유로운)
  C: number; // Constructive (체계적)
}

export interface APTType {
  type: string;
  weight: number;
  animal?: string;
  title?: string;
  color?: string;
}

export interface APTPeriod {
  dominant_type: string;
  years: string;
}

export interface APTMeta {
  confidence: number;
  source: 'expert_analysis' | 'ai_analysis' | 'text_analysis';
  keywords: string[];
  emotion_tags: string[];
  art_movements: string[];
}

export interface ArtistAPTProfile {
  dimensions: APTDimensions;
  primary_types: APTType[];
  periods?: Record<string, APTPeriod>;
  meta: APTMeta;
}

export interface Artist {
  id: string;
  name: string;
  nationality?: string;
  era?: string;
  bio?: string;
  imageUrl?: string;
}

export interface ArtistWithAPT extends Artist {
  aptProfile?: ArtistAPTProfile;
}

export interface APTMatchResult {
  id: string;
  name: string;
  nationality?: string;
  era?: string;
  imageUrl?: string;
  apt: {
    type: string;
    animal: string;
    title: string;
    color: string;
    dimensions: APTDimensions;
    matchScore: number;
    confidence: number;
  };
}

export interface APTCompatibility {
  overall: number;
  dimensions: {
    [key: string]: {
      userScore: number;
      artistScore: number;
      compatibility: number;
      interpretation: string;
    };
  };
}

export interface APTStatistics {
  type: string;
  animal: string;
  title: string;
  color: string;
  count: number;
  avgConfidence: number;
  topArtists: Array<{
    id: string;
    name: string;
    imageUrl?: string;
  }>;
}

// APT 유형 상수
export const APT_TYPES = {
  LAEF: { animal: '여우', title: '몽환적 방랑자', color: '#FF6B6B' },
  LAEC: { animal: '고양이', title: '감성 큐레이터', color: '#845EC2' },
  LAMF: { animal: '올빼미', title: '직관적 탐구자', color: '#4E8397' },
  LAMC: { animal: '거북이', title: '고독한 철학자', color: '#00C9A7' },
  LREF: { animal: '카멜레온', title: '고독한 관찰자', color: '#C34A36' },
  LREC: { animal: '고슴도치', title: '섬세한 감정가', color: '#FF8066' },
  LRMF: { animal: '문어', title: '침묵의 관찰자', color: '#3C1874' },
  LRMC: { animal: '비버', title: '학구적 연구자', color: '#845EC2' },
  SAEF: { animal: '나비', title: '감정의 물결', color: '#FFD93D' },
  SAEC: { animal: '펭귄', title: '감성 조율사', color: '#6BCB77' },
  SAMF: { animal: '앵무새', title: '의미의 직조자', color: '#FF6B6B' },
  SAMC: { animal: '사슴', title: '지혜의 건축가', color: '#4D8B9F' },
  SREF: { animal: '강아지', title: '친근한 공감자', color: '#FFD93D' },
  SREC: { animal: '오리', title: '세심한 조화자', color: '#42C2FF' },
  SRMF: { animal: '코끼리', title: '지혜로운 안내자', color: '#85C88A' },
  SRMC: { animal: '독수리', title: '마스터 도슨트', color: '#7C73E6' }
} as const;

export type APTTypeKey = keyof typeof APT_TYPES;