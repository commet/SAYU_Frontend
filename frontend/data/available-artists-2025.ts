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
 */
export const PERSONALITY_ART_STYLES = {
  // L계열 (Lone)
  LAEF: { focus: "감정적 추상", keywords: ["꿈", "환상", "신비", "직관"] },
  LAEC: { focus: "정제된 미감", keywords: ["균형", "조화", "절제", "우아"] },
  LAMF: { focus: "철학적 상징", keywords: ["의미", "진리", "영적", "초월"] },
  LAMC: { focus: "학문적 완성", keywords: ["체계", "분석", "구조", "완벽"] },
  
  LREF: { focus: "자연 관찰", keywords: ["변화", "순간", "적응", "섬세"] },
  LREC: { focus: "절제된 감성", keywords: ["보호", "신중", "깊이", "안정"] },
  LRMF: { focus: "현실 탐구", keywords: ["진실", "분석", "독립", "탐험"] },
  LRMC: { focus: "지식 구축", keywords: ["연구", "완성", "논리", "체계"] },
  
  // S계열 (Social) 
  SAEF: { focus: "감정 나눔", keywords: ["전파", "교류", "변화", "영감"] },
  SAEC: { focus: "조화 구성", keywords: ["조직", "협력", "체계", "창의"] },
  SAMF: { focus: "메시지 전달", keywords: ["소통", "영향", "아이디어", "변화"] },
  SAMC: { focus: "문화 기획", keywords: ["통합", "전통", "사회", "가치"] },
  
  SREF: { focus: "순수 공감", keywords: ["따뜻함", "자연", "연결", "기쁨"] },
  SREC: { focus: "안정 제공", keywords: ["돌봄", "안전", "포용", "지원"] },
  SRMF: { focus: "지혜 전수", keywords: ["경험", "이야기", "맥락", "역사"] },
  SRMC: { focus: "교육 체계", keywords: ["학습", "전달", "구조", "완성"] }
};