import { SAYUTypeCode, SAYU_TYPES } from '@/types/sayu-shared';

/**
 * SAYU 16개 성격 유형별 시그니처 그라데이션
 * 
 * IMPORTANT: This file uses the centralized SAYU type definitions from shared/SAYUTypeDefinitions.ts
 * Do not create duplicate type definitions here - always use the imported types.
 */
export const personalityGradients: Record<SAYUTypeCode, {
  name: string;
  nameEn: string;
  colors: string[];
  emotion: string;
  description: string;
}> = {
  // L(Lone Wolf) + A(Abstract) 조합 - 고독한 추상 탐험가들
  LAEF: {
    name: "색채의 속삭임",
    nameEn: "Color Whisperer",
    colors: ["#64FFDA", "#FFB9EE", "#7B61FF"],
    emotion: "ethereal, contemplative",
    description: "꿈결같은 파스텔톤의 부드러운 전환"
  },
  LAEC: {
    name: "캔버스 철학자",
    nameEn: "Canvas Philosopher", 
    colors: ["#667EEA", "#764BA2", "#F093FB"],
    emotion: "introspective, aesthetic",
    description: "깊이 있는 보라빛 명상"
  },
  LAMF: {
    name: "개념 사냥꾼",
    nameEn: "Concept Hunter",
    colors: ["#89F7FE", "#66A6FF", "#8E85FF"],
    emotion: "calm, observant",
    description: "차분한 푸른빛의 흐름"
  },
  LAMC: {
    name: "패턴 건축가",
    nameEn: "Pattern Architect",
    colors: ["#A8EDEA", "#FED6E3", "#D299FF"],
    emotion: "thoughtful, organized",
    description: "정돈된 파스텔의 조화"
  },

  // L(Lone Wolf) + R(Realistic) 조합 - 고독한 현실 관찰자들
  LREF: {
    name: "침묵의 시인",
    nameEn: "Silent Poet",
    colors: ["#FFB088", "#FFD89D", "#FFEAA7"],
    emotion: "warm, connecting",
    description: "포근한 노을빛 감성"
  },
  LREC: {
    name: "질감의 예언자",
    nameEn: "Texture Oracle",
    colors: ["#FFA0AC", "#FFDAC1", "#B5EAEA"],
    emotion: "graceful, social",
    description: "부드러운 코랄과 민트의 만남"
  },
  LRMF: {
    name: "진실 수집가",
    nameEn: "Truth Collector",
    colors: ["#EE9CA7", "#FFDDE1", "#C3AED6"],
    emotion: "sensitive, selective",
    description: "로맨틱한 분홍빛 여정"
  },
  LRMC: {
    name: "기법의 현자",
    nameEn: "Technique Sage",
    colors: ["#FCCB90", "#D57EEA", "#A8E6CF"],
    emotion: "approachable, helpful",
    description: "활기찬 파스텔 하모니"
  },

  // S(Social) + A(Abstract) 조합 - 사회적 추상 탐험가들
  SAEF: {
    name: "감정 지휘자",
    nameEn: "Emotion Conductor",
    colors: ["#FC466B", "#3F5EFB", "#42E695"],
    emotion: "dynamic, independent",
    description: "대담한 네온빛 대비"
  },
  SAEC: {
    name: "느낌의 지도제작자",
    nameEn: "Feeling Cartographer",
    colors: ["#434343", "#7F7FD5", "#91EAE4"],
    emotion: "analytical, precise",
    description: "차가운 도시의 새벽"
  },
  SAMF: {
    name: "마음의 연금술사",
    nameEn: "Mind Alchemist",
    colors: ["#FF6B6B", "#4ECDC4", "#45B7D1"],
    emotion: "experimental, agile",
    description: "활력 넘치는 삼원색"
  },
  SAMC: {
    name: "이론 직조가",
    nameEn: "Theory Weaver",
    colors: ["#636FA4", "#E8CBC0", "#92A8D1"],
    emotion: "strategic, systematic",
    description: "세련된 비즈니스 톤"
  },

  // S(Social) + R(Realistic) 조합 - 사회적 현실 탐험가들
  SREF: {
    name: "이야기 직조가",
    nameEn: "Narrative Weaver",
    colors: ["#FF006E", "#FB5607", "#FFBE0B"],
    emotion: "energetic, connecting",
    description: "불타는 선셋 에너지"
  },
  SREC: {
    name: "마음의 큐레이터",
    nameEn: "Heart Curator",
    colors: ["#F72585", "#B5179E", "#7209B7"],
    emotion: "charismatic, trendy",
    description: "트렌디한 마젠타 웨이브"
  },
  SRMF: {
    name: "문화 항해자",
    nameEn: "Culture Voyager",
    colors: ["#FF4757", "#FFA502", "#05C46B"],
    emotion: "expressive, bold",
    description: "무대 위 스포트라이트"
  },
  SRMC: {
    name: "갤러리 현자",
    nameEn: "Gallery Sage",
    colors: ["#303952", "#546DE5", "#F5F3CE"],
    emotion: "authoritative, organized",
    description: "신뢰감 있는 네이비 그라데이션"
  }
} as const;

// 그라데이션 CSS 생성 헬퍼
export const getGradientStyle = (type: SAYUTypeCode, angle = 135) => {
  const gradient = personalityGradients[type];
  if (!gradient || !gradient.colors) {
    // Fallback gradient if type is not found
    return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  }
  return `linear-gradient(${angle}deg, ${gradient.colors.join(', ')})`;
};

// 다크모드 대응 그라데이션
export const getAdaptiveGradient = (
  type: SAYUTypeCode, 
  isDark: boolean,
  opacity = 1
) => {
  const gradient = personalityGradients[type];
  const colors = isDark 
    ? gradient.colors.map(color => adjustColorBrightness(color, -20))
    : gradient.colors;
  
  return `linear-gradient(135deg, ${colors.map(c => `${c}${Math.round(opacity * 255).toString(16)}`).join(', ')})`;
};

// 색상 밝기 조정 유틸리티
function adjustColorBrightness(color: string, amount: number): string {
  const num = parseInt(color.replace('#', ''), 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
  const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}