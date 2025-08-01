/**
 * 저작권 문제로 Artvee에 없는 현대 작가들의 대체 작가 매핑
 * 각 작가별로 비슷한 스타일이나 시대의 대체 작가를 제공
 */

export const artistAlternatives: Record<string, {
  alternative: string;
  reason: string;
  searchKeywords?: string[];
}> = {
  // 현대 작가들
  'Yayoi Kusama': {
    alternative: 'Gustav Klimt',
    reason: 'Pattern-focused, decorative elements',
    searchKeywords: ['pattern', 'decorative', 'gold']
  },
  'David Hockney': {
    alternative: 'Henri Matisse',
    reason: 'Bold colors and modern life scenes',
    searchKeywords: ['color', 'modern', 'landscape']
  },
  'Banksy': {
    alternative: 'Honoré Daumier',
    reason: 'Social commentary through art',
    searchKeywords: ['social', 'satire', 'urban']
  },
  'Jeff Koons': {
    alternative: 'Marcel Duchamp',
    reason: 'Conceptual approach to everyday objects',
    searchKeywords: ['concept', 'object', 'modern']
  },
  'Damien Hirst': {
    alternative: 'Francis Bacon',
    reason: 'Exploration of life and death themes',
    searchKeywords: ['death', 'life', 'contemporary']
  },
  'Marina Abramović': {
    alternative: 'Frida Kahlo',
    reason: 'Personal and intense artistic expression',
    searchKeywords: ['personal', 'intense', 'self']
  },
  'Takashi Murakami': {
    alternative: 'Katsushika Hokusai',
    reason: 'Japanese artistic tradition with modern twist',
    searchKeywords: ['japanese', 'color', 'pop']
  },
  'Anish Kapoor': {
    alternative: 'Constantin Brâncuși',
    reason: 'Sculptural forms and space',
    searchKeywords: ['sculpture', 'form', 'space']
  },
  'Kehinde Wiley': {
    alternative: 'Jean-Auguste-Dominique Ingres',
    reason: 'Portraiture with decorative backgrounds',
    searchKeywords: ['portrait', 'decorative', 'classical']
  },
  'KAWS': {
    alternative: 'Keith Haring',
    reason: 'Pop art and street culture',
    searchKeywords: ['pop', 'street', 'graphic']
  },
  
  // 20세기 후반 작가들 (저작권 보호 중)
  'Jean-Michel Basquiat': {
    alternative: 'Pablo Picasso',
    reason: 'Expressive and revolutionary approach',
    searchKeywords: ['expressive', 'modern', 'revolutionary']
  },
  'Andy Warhol': {
    alternative: 'Roy Lichtenstein',
    reason: 'Pop art movement',
    searchKeywords: ['pop', 'commercial', 'repeat']
  },
  'Louise Bourgeois': {
    alternative: 'Alberto Giacometti',
    reason: 'Emotional and psychological sculpture',
    searchKeywords: ['sculpture', 'emotion', 'psychology']
  },
  'Cindy Sherman': {
    alternative: 'Diane Arbus',
    reason: 'Photographic exploration of identity',
    searchKeywords: ['photo', 'identity', 'self']
  },
  'Gerhard Richter': {
    alternative: 'Caspar David Friedrich',
    reason: 'German artistic tradition',
    searchKeywords: ['german', 'abstract', 'landscape']
  },
  
  // 덜 알려진 현대 작가들
  'Hilma af Klint': {
    alternative: 'Wassily Kandinsky',
    reason: 'Spiritual abstraction',
    searchKeywords: ['abstract', 'spiritual', 'geometric']
  },
  'Agnes Martin': {
    alternative: 'Piet Mondrian',
    reason: 'Grid-based minimalism',
    searchKeywords: ['grid', 'minimal', 'line']
  },
  'Donald Judd': {
    alternative: 'Kazimir Malevich',
    reason: 'Geometric minimalism',
    searchKeywords: ['geometric', 'minimal', 'form']
  }
};

/**
 * 작가 이름으로 대체 작가 찾기
 */
export function getAlternativeArtist(artistName: string): string {
  const mapping = artistAlternatives[artistName];
  return mapping?.alternative || artistName;
}

/**
 * 여러 작가 중에서 Artvee에 있을 가능성이 높은 작가 찾기
 */
export function findAvailableArtist(artists: string[]): string {
  // 연도가 1950년 이전인 작가들을 우선적으로 선택
  const classicalArtists = [
    'Claude Monet', 'Vincent van Gogh', 'Pablo Picasso', 
    'Wassily Kandinsky', 'Paul Klee', 'Joan Miró',
    'Henri Matisse', 'Paul Cézanne', 'Edgar Degas',
    'Pierre-Auguste Renoir', 'Gustav Klimt', 'Egon Schiele'
  ];
  
  for (const artist of artists) {
    // 이미 클래식 작가 리스트에 있으면 그대로 반환
    if (classicalArtists.some(classic => artist.includes(classic))) {
      return artist;
    }
    
    // 대체 작가가 있으면 그것을 반환
    const alternative = getAlternativeArtist(artist);
    if (alternative !== artist) {
      return alternative;
    }
  }
  
  // 모두 실패하면 첫 번째 작가 반환
  return artists[0] || 'Claude Monet';
}