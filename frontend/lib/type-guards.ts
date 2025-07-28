// API 응답 타입 가드 함수들

import { 
  EmotionInterpretation, 
  ArtworkMatch,
  EmotionInput 
} from '../../shared';

// 감정 해석 결과 타입 가드
export function isEmotionInterpretation(data: unknown): data is EmotionInterpretation {
  return (
    typeof data === 'object' &&
    data !== null &&
    'emotionId' in data &&
    'dimensions' in data &&
    'vector' in data &&
    'characteristics' in data &&
    typeof (data as any).dimensions === 'object' &&
    typeof (data as any).dimensions.valence === 'number' &&
    typeof (data as any).dimensions.arousal === 'number' &&
    typeof (data as any).dimensions.dominance === 'number' &&
    typeof (data as any).dimensions.complexity === 'number' &&
    Array.isArray((data as any).vector)
  );
}

// 작품 매칭 결과 타입 가드
export function isArtworkMatch(data: unknown): data is ArtworkMatch {
  return (
    typeof data === 'object' &&
    data !== null &&
    'artwork' in data &&
    'matching' in data &&
    typeof (data as any).artwork === 'object' &&
    typeof (data as any).artwork.id === 'string' &&
    typeof (data as any).artwork.title === 'string' &&
    typeof (data as any).matching === 'object' &&
    typeof (data as any).matching.score === 'number' &&
    ['direct', 'metaphorical', 'complementary'].includes((data as any).matching.type)
  );
}

// 작품 매칭 배열 타입 가드
export function isArtworkMatchArray(data: unknown): data is ArtworkMatch[] {
  return Array.isArray(data) && data.every(item => isArtworkMatch(item));
}

// 감상 세션 데이터 타입 가드
export interface ViewingSession {
  artworkId: string;
  duration: number;
  depth: 'glance' | 'observe' | 'contemplate' | 'immerse';
  interactions: Array<{
    type: string;
    timestamp: number;
  }>;
  timestamp: Date;
}

export function isViewingSession(data: unknown): data is ViewingSession {
  return (
    typeof data === 'object' &&
    data !== null &&
    'artworkId' in data &&
    'duration' in data &&
    'depth' in data &&
    typeof (data as any).artworkId === 'string' &&
    typeof (data as any).duration === 'number' &&
    ['glance', 'observe', 'contemplate', 'immerse'].includes((data as any).depth)
  );
}

// API 에러 응답 타입 가드
export interface ApiError {
  success: false;
  error: string;
  message?: string;
  errors?: Array<{ field: string; message: string }>;
}

export function isApiError(data: unknown): data is ApiError {
  return (
    typeof data === 'object' &&
    data !== null &&
    'success' in data &&
    (data as any).success === false &&
    'error' in data &&
    typeof (data as any).error === 'string'
  );
}

// 안전한 JSON 파싱
export function safeJsonParse<T>(
  json: string, 
  validator: (data: unknown) => data is T
): T | null {
  try {
    const parsed = JSON.parse(json);
    return validator(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

// 로컬스토리지 안전 접근
export function safeLocalStorage<T>(
  key: string,
  validator: (data: unknown) => data is T
): T | null {
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;
    
    const parsed = JSON.parse(item);
    return validator(parsed) ? parsed : null;
  } catch {
    return null;
  }
}