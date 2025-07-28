// 감정 번역 시스템 타입 정의

// HSL 색상 타입
export interface HSLColor {
  hue: number;        // 0-360
  saturation: number; // 0-100
  lightness: number;  // 0-100
  alpha?: number;     // 0-1
}

// 감정 색상 데이터
export interface EmotionColor {
  primary: HSLColor;
  secondary?: HSLColor;
  gradient?: {
    type: 'linear' | 'radial' | 'conic';
    angle?: number;
    center?: { x: number; y: number };
    stops: Array<{
      color: HSLColor;
      position: number; // 0-100
    }>;
  };
  animation?: {
    type: 'breathe' | 'pulse' | 'flow' | 'shimmer';
    duration: number; // milliseconds
    intensity: number; // 0-1
  };
}

// 감정의 시간적 변화
export interface EmotionTimeline {
  timestamp: number;
  color: EmotionColor;
  intensity: number; // 0-1
  note?: string;
}

// 날씨 메타포
export type WeatherMetaphor = 
  | 'sunny'      // 맑음 - 밝고 긍정적
  | 'cloudy'     // 흐림 - 불확실하고 몽롱한
  | 'rainy'      // 비 - 슬프거나 정화되는
  | 'stormy'     // 폭풍 - 격렬하고 혼란스러운
  | 'foggy'      // 안개 - 불분명하고 혼란스러운
  | 'snowy'      // 눈 - 고요하고 순수한
  | 'windy'      // 바람 - 변화무쌍한
  | 'rainbow';   // 무지개 - 희망적이고 다채로운

// 추상적 형태
export interface AbstractShape {
  type: 'circle' | 'triangle' | 'square' | 'organic' | 'chaotic';
  complexity: number; // 0-1
  symmetry: number;   // 0-1
  sharpness: number;  // 0-1 (부드러움 vs 날카로움)
  size: number;       // 0-1
  movement?: {
    type: 'static' | 'rotating' | 'pulsing' | 'flowing';
    speed: number; // 0-1
  };
}

// 음악적 표현
export interface SoundTexture {
  pitch: 'low' | 'mid' | 'high';
  tempo: number; // 40-200 BPM
  harmony: 'consonant' | 'dissonant' | 'neutral';
  timbre: 'soft' | 'bright' | 'dark' | 'metallic' | 'warm';
  dynamics: 'pianissimo' | 'piano' | 'forte' | 'fortissimo';
  rhythm: 'regular' | 'syncopated' | 'free' | 'absent';
}

// 통합 감정 입력
export interface EmotionInput {
  id: string;
  timestamp: Date;
  
  // 다층적 입력
  color?: EmotionColor;
  weather?: WeatherMetaphor;
  shape?: AbstractShape;
  sound?: SoundTexture;
  
  // 컨텍스트
  context?: {
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
    season: 'spring' | 'summer' | 'autumn' | 'winter';
    location?: string;
    trigger?: string; // 감정을 유발한 것
  };
  
  // 선택적 언어 표현
  words?: string[];
  freeText?: string;
}

// 감정 해석 결과
export interface EmotionInterpretation {
  emotionId: string;
  
  // 주요 차원 분석
  dimensions: {
    valence: number;     // -1 to 1 (부정적 vs 긍정적)
    arousal: number;     // 0 to 1 (차분함 vs 활성화)
    dominance: number;   // 0 to 1 (무력함 vs 통제감)
    complexity: number;  // 0 to 1 (단순 vs 복잡)
  };
  
  // 감정 벡터 (AI 처리용)
  vector: number[];
  
  // 주요 특성
  characteristics: {
    primary: string;     // 주요 감정 레이블
    secondary?: string;  // 부차적 감정
    nuances: string[];   // 미묘한 뉘앙스들
  };
  
  // 예술적 매핑 힌트
  artisticHints: {
    preferredStyles: string[];
    avoidStyles: string[];
    colorPalette: 'warm' | 'cool' | 'neutral' | 'contrasting';
    composition: 'centered' | 'dynamic' | 'scattered' | 'layered';
    texture: 'smooth' | 'rough' | 'mixed';
    movement: 'static' | 'flowing' | 'explosive' | 'rhythmic';
  };
}

// 예술 작품 매칭 결과
export interface ArtworkMatch {
  artwork: {
    id: string;
    title: string;
    artist: string;
    year: string;
    imageUrl: string;
    style: string;
    medium: string;
  };
  
  // 매칭 정보
  matching: {
    score: number;       // 0-1
    type: 'direct' | 'metaphorical' | 'complementary';
    reasoning: string;   // AI가 설명하는 연결점
    connections: Array<{
      aspect: string;    // 연결된 측면 (예: "색상", "구도", "주제")
      description: string;
    }>;
  };
  
  // 감정적 여정
  emotionalJourney?: {
    from: string;
    through: string;
    to: string;
  };
}

// 번역 세션
export interface TranslationSession {
  id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  
  // 입력과 결과
  input: EmotionInput;
  interpretation: EmotionInterpretation;
  matches: ArtworkMatch[];
  
  // 사용자 피드백
  feedback?: {
    selectedMatch?: string; // 선택한 작품 ID
    resonanceScore?: number; // 공명도 (0-5)
    notes?: string;
  };
  
  // 메타데이터
  metadata: {
    version: string;
    processingTime: number;
    aiModel: string;
  };
}