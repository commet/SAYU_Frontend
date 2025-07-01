// SAYU 16개 성격 유형별 시그니처 그라데이션
export const personalityGradients = {
  // L(Leisurely) + A(Alone) 조합
  LAEF: {
    name: "몽상가의 황혼",
    nameEn: "Dreamer's Twilight",
    colors: ["#64FFDA", "#FFB9EE", "#7B61FF"],
    emotion: "ethereal, contemplative",
    description: "꿈결같은 파스텔톤의 부드러운 전환"
  },
  LAES: {
    name: "고독한 탐미주의자",
    nameEn: "Solitary Aesthete", 
    colors: ["#667EEA", "#764BA2", "#F093FB"],
    emotion: "introspective, aesthetic",
    description: "깊이 있는 보라빛 명상"
  },
  LAMF: {
    name: "느긋한 관찰자",
    nameEn: "Relaxed Observer",
    colors: ["#89F7FE", "#66A6FF", "#8E85FF"],
    emotion: "calm, observant",
    description: "차분한 푸른빛의 흐름"
  },
  LAMC: {
    name: "사색하는 수집가",
    nameEn: "Contemplative Collector",
    colors: ["#A8EDEA", "#FED6E3", "#D299FF"],
    emotion: "thoughtful, organized",
    description: "정돈된 파스텔의 조화"
  },

  // L(Leisurely) + R(Relationship) 조합
  LREF: {
    name: "따뜻한 공감자",
    nameEn: "Warm Empath",
    colors: ["#FFB088", "#FFD89D", "#FFEAA7"],
    emotion: "warm, connecting",
    description: "포근한 노을빛 감성"
  },
  LRES: {
    name: "우아한 사교가",
    nameEn: "Elegant Socialite",
    colors: ["#FFA0AC", "#FFDAC1", "#B5EAEA"],
    emotion: "graceful, social",
    description: "부드러운 코랄과 민트의 만남"
  },
  LRMF: {
    name: "감성적 큐레이터",
    nameEn: "Emotional Curator",
    colors: ["#EE9CA7", "#FFDDE1", "#C3AED6"],
    emotion: "sensitive, selective",
    description: "로맨틱한 분홍빛 여정"
  },
  LRMC: {
    name: "친근한 안내자",
    nameEn: "Friendly Guide",
    colors: ["#FCCB90", "#D57EEA", "#A8E6CF"],
    emotion: "approachable, helpful",
    description: "활기찬 파스텔 하모니"
  },

  // S(Speedy) + A(Alone) 조합
  SAEF: {
    name: "독립적 개척자",
    nameEn: "Independent Pioneer",
    colors: ["#FC466B", "#3F5EFB", "#42E695"],
    emotion: "dynamic, independent",
    description: "대담한 네온빛 대비"
  },
  SAES: {
    name: "예리한 비평가",
    nameEn: "Sharp Critic",
    colors: ["#434343", "#7F7FD5", "#91EAE4"],
    emotion: "analytical, precise",
    description: "차가운 도시의 새벽"
  },
  SAMF: {
    name: "빠른 실험가",
    nameEn: "Quick Experimenter",
    colors: ["#FF6B6B", "#4ECDC4", "#45B7D1"],
    emotion: "experimental, agile",
    description: "활력 넘치는 삼원색"
  },
  SAMC: {
    name: "효율적 전략가",
    nameEn: "Efficient Strategist",
    colors: ["#636FA4", "#E8CBC0", "#92A8D1"],
    emotion: "strategic, systematic",
    description: "세련된 비즈니스 톤"
  },

  // S(Speedy) + R(Relationship) 조합
  SREF: {
    name: "열정적 네트워커",
    nameEn: "Passionate Networker",
    colors: ["#FF006E", "#FB5607", "#FFBE0B"],
    emotion: "energetic, connecting",
    description: "불타는 선셋 에너지"
  },
  SRES: {
    name: "활발한 인플루언서",
    nameEn: "Vibrant Influencer",
    colors: ["#F72585", "#B5179E", "#7209B7"],
    emotion: "charismatic, trendy",
    description: "트렌디한 마젠타 웨이브"
  },
  SRMF: {
    name: "다이나믹 퍼포머",
    nameEn: "Dynamic Performer",
    colors: ["#FF4757", "#FFA502", "#05C46B"],
    emotion: "expressive, bold",
    description: "무대 위 스포트라이트"
  },
  SRMC: {
    name: "체계적 리더",
    nameEn: "Systematic Leader",
    colors: ["#303952", "#546DE5", "#F5F3CE"],
    emotion: "authoritative, organized",
    description: "신뢰감 있는 네이비 그라데이션"
  }
} as const;

// 그라데이션 CSS 생성 헬퍼
export const getGradientStyle = (type: keyof typeof personalityGradients, angle = 135) => {
  const gradient = personalityGradients[type];
  return `linear-gradient(${angle}deg, ${gradient.colors.join(', ')})`;
};

// 다크모드 대응 그라데이션
export const getAdaptiveGradient = (
  type: keyof typeof personalityGradients, 
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