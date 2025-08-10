/**
 * SAYU Available Artists Database (2025)
 * 
 * Based on actual artworks we have in our collection with working images.
 * This replaces theoretical famous works with actual available masterpieces.
 */

export interface AvailableArtist {
  name: string;
  period: string;
  style: string;
  workCount: number;
  hasImages: boolean;
  notableWorks: string[];
  personalityMatch?: string[];
}

export const AVAILABLE_ARTISTS: Record<string, AvailableArtist> = {
  "Paul Cézanne": {
    name: "Paul Cézanne",
    period: "1839-1906",
    style: "Post-Impressionism", 
    workCount: 21,
    hasImages: true,
    notableWorks: ["A Study for the Card Players", "Bathers", "Still Life with Apples"],
    personalityMatch: ["LAEC", "SAEC", "LRMC"]
  },
  
  "Edvard Munch": {
    name: "Edvard Munch", 
    period: "1863-1944",
    style: "Expressionism",
    workCount: 7,
    hasImages: true,
    notableWorks: ["Madonna", "The Sick Child I", "Evening on Karl Johan Street"],
    personalityMatch: ["LAEF", "LREF", "LRMF"]
  },
  
  "Winslow Homer": {
    name: "Winslow Homer",
    period: "1836-1910", 
    style: "American Realism",
    workCount: 90,
    hasImages: true,
    notableWorks: ["The Gulf Stream", "Snap the Whip", "Breezing Up"],
    personalityMatch: ["LREF", "SREC", "LRMC", "SRMF"]
  },
  
  "Alfred Stieglitz": {
    name: "Alfred Stieglitz",
    period: "1864-1946",
    style: "Modern Photography",
    workCount: 19, 
    hasImages: true,
    notableWorks: ["Equivalent", "The Terminal", "Georgia O'Keeffe"],
    personalityMatch: ["LAEC", "LAMF", "SAEF"]
  },
  
  "Auguste Rodin": {
    name: "Auguste Rodin",
    period: "1840-1917",
    style: "Modern Sculpture",
    workCount: 16,
    hasImages: true,
    notableWorks: ["The Thinker", "The Kiss", "The Burghers of Calais"],
    personalityMatch: ["SREF", "LAEF", "SAEF"]
  },
  
  "Odilon Redon": {
    name: "Odilon Redon", 
    period: "1840-1916",
    style: "Symbolism",
    workCount: 11,
    hasImages: true,
    notableWorks: ["The Cyclops", "The Buddha", "Wildflowers"],
    personalityMatch: ["LAEF", "LAMF", "SAEF"]
  },
  
  "Gustav Klimt": {
    name: "Gustav Klimt",
    period: "1862-1918", 
    style: "Art Nouveau",
    workCount: 1,
    hasImages: true,
    notableWorks: ["Male Nude", "Portrait Studies"],
    personalityMatch: ["LAMF", "SAMC", "SRMF"]
  },
  
  "Vasily Kandinsky": {
    name: "Vasily Kandinsky",
    period: "1866-1944",
    style: "Abstract Art", 
    workCount: 2,
    hasImages: true,
    notableWorks: ["Improvisation No. 30 (Cannons)", "Houses at Murnau"],
    personalityMatch: ["SAEC", "LAEC", "SAMF"]
  },
  
  "Sandro Botticelli": {
    name: "Sandro Botticelli",
    period: "1445-1510",
    style: "Renaissance",
    workCount: 2, 
    hasImages: true,
    notableWorks: ["Virgin and Child with an Angel", "Virgin and Child with Two Angels"],
    personalityMatch: ["SRMC", "SAMC", "LRMC"]
  },
  
  "Eugène Delacroix": {
    name: "Eugène Delacroix",
    period: "1798-1863",
    style: "Romanticism", 
    workCount: 8,
    hasImages: true,
    notableWorks: ["Liberty Leading the People (자유의 여신이 민중을 이끄는 모습)", "The Death of Sardanapalus"],
    personalityMatch: ["SRMF", "SAMF", "LRMF"]
  },
  
  "Francisco Goya": {
    name: "Francisco Goya",
    period: "1746-1828",
    style: "Romanticism",
    workCount: 6,
    hasImages: true, 
    notableWorks: ["The Third of May 1808 (1808년 5월 3일)", "Saturn Devouring His Son"],
    personalityMatch: ["LRMF", "LAMF"]
  },
  
  "Giovanni di Paolo": {
    name: "Giovanni di Paolo",
    period: "1398-1482",
    style: "Renaissance",
    workCount: 6,
    hasImages: true,
    notableWorks: ["The Creation and the Expulsion from Paradise", "Saint Clare"],
    personalityMatch: ["LRMC", "SRMC", "SAMC", "SRMF"]
  },
  
  "Berthe Morisot": {
    name: "Berthe Morisot", 
    period: "1841-1895",
    style: "Impressionism",
    workCount: 4,
    hasImages: true,
    notableWorks: ["The Cradle", "Young Woman Knitting", "Woman at Her Toilette"],
    personalityMatch: ["SREF", "SREC", "SAEF"]
  },
  
  "Henri Fantin-Latour": {
    name: "Henri Fantin-Latour",
    period: "1836-1904", 
    style: "Realism",
    workCount: 3,
    hasImages: true,
    notableWorks: ["Still Life with Flowers", "A Studio at Les Batignolles"],
    personalityMatch: ["LREC", "SREC", "LAEC"]
  },
  
  "Piet Mondrian": {
    name: "Piet Mondrian",
    period: "1872-1944",
    style: "De Stijl",
    workCount: 3,
    hasImages: true,
    notableWorks: ["Composition with Red, Blue and Yellow", "Broadway Boogie Woogie"], 
    personalityMatch: ["LAEC", "LAMC", "SAEC"]
  },
  
  "Alphonse Mucha": {
    name: "Alphonse Mucha",
    period: "1860-1939",
    style: "Art Nouveau", 
    workCount: 100,
    hasImages: false,
    notableWorks: ["The Four Seasons", "Job Cigarettes", "Gismonda"],
    personalityMatch: ["SAEF", "SREF", "SAMF"]
  }
};

/**
 * Get the best available artists for a personality type
 */
export function getBestAvailableArtists(personalityType: string): AvailableArtist[] {
  const matches = Object.values(AVAILABLE_ARTISTS)
    .filter(artist => artist.personalityMatch?.includes(personalityType) && artist.hasImages)
    .sort((a, b) => b.workCount - a.workCount);
  
  // Always return at least 3 artists, fill with fallbacks if needed
  const result = matches.slice(0, 3);
  
  if (result.length < 3) {
    const fallbacks = Object.values(AVAILABLE_ARTISTS)
      .filter(artist => artist.hasImages && !result.includes(artist))
      .sort((a, b) => b.workCount - a.workCount)
      .slice(0, 3 - result.length);
    
    result.push(...fallbacks);
  }
  
  return result;
}

/**
 * Personality-specific art appreciation styles
 * Updated with behavioral keywords from personality-descriptions.ts
 */
export const PERSONALITY_ART_STYLES = {
  // L계열 (Lone)
  LAEF: { 
    focus: "감정적 추상", 
    focusEn: "Emotional Abstraction",
    keywords: ["내면 대화", "감정 몰입", "개인적 의미", "고독한 감상"],
    keywordsEn: ["Inner Dialogue", "Emotional Immersion", "Personal Meaning", "Solitary Appreciation"]
  },
  LAEC: { 
    focus: "정제된 미감", 
    focusEn: "Refined Aesthetics",
    keywords: ["감정 수집", "섬세한 분류", "개인 아카이브", "취향 정제"],
    keywordsEn: ["Emotion Collection", "Delicate Classification", "Personal Archive", "Taste Refinement"]
  },
  LAMF: { 
    focus: "철학적 상징", 
    focusEn: "Philosophical Symbolism",
    keywords: ["직관적 끌림", "추상 선호", "자유로운 해석", "내적 탐험"],
    keywordsEn: ["Intuitive Attraction", "Abstract Preference", "Free Interpretation", "Inner Exploration"]
  },
  LAMC: { 
    focus: "학문적 완성", 
    focusEn: "Academic Perfection",
    keywords: ["배경 탐구", "체계적 학습", "지식 축적", "깊이있는 분석"],
    keywordsEn: ["Background Research", "Systematic Learning", "Knowledge Accumulation", "Deep Analysis"]
  },
  
  LREF: { 
    focus: "자연 관찰", 
    focusEn: "Nature Observation",
    keywords: ["디테일 포착", "미묘한 감정", "조용한 관찰", "개인적 발견"],
    keywordsEn: ["Detail Capture", "Subtle Emotions", "Quiet Observation", "Personal Discovery"]
  },
  LREC: { 
    focus: "절제된 감성", 
    focusEn: "Restrained Emotion",
    keywords: ["심층 의미", "감정 깊이", "반복 감상", "성찰적 사고"],
    keywordsEn: ["Deep Meaning", "Emotional Depth", "Repeated Viewing", "Reflective Thinking"]
  },
  LRMF: { 
    focus: "현실 탐구", 
    focusEn: "Reality Exploration",
    keywords: ["의미 추리", "독립적 시각", "패턴 발견", "논리적 상상"],
    keywordsEn: ["Meaning Deduction", "Independent Perspective", "Pattern Discovery", "Logical Imagination"]
  },
  LRMC: { 
    focus: "지식 구축", 
    focusEn: "Knowledge Building",
    keywords: ["방법론적 접근", "비교 분석", "종합적 이해", "학술적 관심"],
    keywordsEn: ["Methodological Approach", "Comparative Analysis", "Comprehensive Understanding", "Academic Interest"]
  },
  
  // S계열 (Social) 
  SAEF: { 
    focus: "감정 나눔", 
    focusEn: "Emotional Sharing",
    keywords: ["즉각적 반응", "감정 전파", "활발한 표현", "공감의 기쁨"],
    keywordsEn: ["Immediate Response", "Emotion Spreading", "Active Expression", "Joy of Empathy"]
  },
  SAEC: { 
    focus: "조화 구성", 
    focusEn: "Harmonious Composition",
    keywords: ["감정 구조화", "공감 연결", "추상 해석", "집단 경험"],
    keywordsEn: ["Emotion Structuring", "Empathy Connection", "Abstract Interpretation", "Collective Experience"]
  },
  SAMF: { 
    focus: "메시지 전달", 
    focusEn: "Message Delivery",
    keywords: ["의미 연결", "통찰 순간", "패턴 직조", "공유된 이해"],
    keywordsEn: ["Meaning Connection", "Insight Moments", "Pattern Weaving", "Shared Understanding"]
  },
  SAMC: { 
    focus: "문화 기획", 
    focusEn: "Cultural Planning",
    keywords: ["지식 공유", "체계적 설명", "학습 촉진", "집단 지성"],
    keywordsEn: ["Knowledge Sharing", "Systematic Explanation", "Learning Facilitation", "Collective Intelligence"]
  },
  
  SREF: { 
    focus: "순수 공감", 
    focusEn: "Pure Empathy",
    keywords: ["감정 여행", "타인 공감", "정서적 연결", "따뜻한 시선"],
    keywordsEn: ["Emotional Journey", "Others' Empathy", "Emotional Connection", "Warm Perspective"]
  },
  SREC: { 
    focus: "안정 제공", 
    focusEn: "Stability Providing",
    keywords: ["감정 치유", "공간 분위기", "집단 정서", "영적 경험"],
    keywordsEn: ["Emotional Healing", "Space Atmosphere", "Collective Emotion", "Spiritual Experience"]
  },
  SRMF: { 
    focus: "지혜 전수", 
    focusEn: "Wisdom Transmission",
    keywords: ["시대 탐험", "문화 맥락", "역사적 상상", "보편적 의미"],
    keywordsEn: ["Era Exploration", "Cultural Context", "Historical Imagination", "Universal Meaning"]
  },
  SRMC: { 
    focus: "교육 체계", 
    focusEn: "Educational System",
    keywords: ["지식 전달", "교육적 관점", "체계적 안내", "학습 공동체"],
    keywordsEn: ["Knowledge Transfer", "Educational Perspective", "Systematic Guidance", "Learning Community"]
  }
};