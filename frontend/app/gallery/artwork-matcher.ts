// 동적 작품 매칭 로직
// 유형별 특성을 분석하여 더 다양하고 정확한 추천 시스템

export interface ArtworkPreferences {
  // 감상 방식
  viewingStyle: 'alone' | 'social'; // L(혼자) vs S(함께)
  
  // 작품 유형 선호
  artType: 'abstract' | 'representational'; // A(추상) vs R(구상)
  
  // 감상 접근법
  approach: 'emotional' | 'intellectual'; // E(감정적) vs M(의미적)
  
  // 처리 방식
  processing: 'free' | 'systematic'; // F(자유로운) vs C(체계적)
  
  // 선호 테마
  preferredThemes?: string[];
  
  // 선호 시대/스타일
  preferredPeriods?: string[];
  
  // 피할 테마
  avoidThemes?: string[];
}

export const aptCharacteristics: Record<string, ArtworkPreferences> = {
  // L 그룹 (혼자 감상)
  'LAEF': {
    viewingStyle: 'alone',
    artType: 'abstract', 
    approach: 'emotional',
    processing: 'free',
    preferredThemes: ['dreamscape', 'emotion', 'color', 'movement', 'expression'],
    preferredPeriods: ['abstract-expressionism', 'surrealism', 'fauvism'],
    avoidThemes: ['political', 'religious-dogma', 'technical-precision']
  },
  
  'LAEC': {
    viewingStyle: 'alone',
    artType: 'abstract',
    approach: 'emotional', 
    processing: 'systematic',
    preferredThemes: ['color-theory', 'geometric', 'minimal', 'contemplative'],
    preferredPeriods: ['abstract-expressionism', 'minimalism', 'color-field'],
    avoidThemes: ['chaotic', 'narrative', 'figurative']
  },
  
  'LAMF': {
    viewingStyle: 'alone',
    artType: 'abstract',
    approach: 'intellectual',
    processing: 'free',
    preferredThemes: ['philosophy', 'concept', 'paradox', 'transformation'],
    preferredPeriods: ['conceptual', 'surrealism', 'dada'],
    avoidThemes: ['decorative', 'commercial', 'sentimental']
  },
  
  'LAMC': {
    viewingStyle: 'alone',
    artType: 'abstract',
    approach: 'intellectual',
    processing: 'systematic',
    preferredThemes: ['theory', 'structure', 'logic', 'research'],
    preferredPeriods: ['constructivism', 'minimalism', 'conceptual'],
    avoidThemes: ['spontaneous', 'expressionist', 'romantic']
  },
  
  'LREF': {
    viewingStyle: 'alone',
    artType: 'representational',
    approach: 'emotional',
    processing: 'free',
    preferredThemes: ['solitude', 'nature', 'introspection', 'melancholy', 'beauty'],
    preferredPeriods: ['romanticism', 'post-impressionism', 'realism'],
    avoidThemes: ['crowded-scenes', 'celebration', 'political-rally']
  },
  
  'LREC': {
    viewingStyle: 'alone',
    artType: 'representational',
    approach: 'emotional',
    processing: 'systematic',
    preferredThemes: ['detail', 'craftsmanship', 'quiet-moments', 'domestic'],
    preferredPeriods: ['dutch-golden-age', 'renaissance', 'impressionism'],
    avoidThemes: ['abstract', 'rough', 'unfinished']
  },
  
  'LRMF': {
    viewingStyle: 'alone',
    artType: 'representational',
    approach: 'intellectual',
    processing: 'free',
    preferredThemes: ['technology', 'modern-life', 'innovation', 'critique'],
    preferredPeriods: ['contemporary', 'pop-art', 'photorealism'],
    avoidThemes: ['traditional', 'classical', 'pastoral']
  },
  
  'LRMC': {
    viewingStyle: 'alone',
    artType: 'representational',
    approach: 'intellectual',
    processing: 'systematic',
    preferredThemes: ['history', 'symbolism', 'technique', 'academia'],
    preferredPeriods: ['renaissance', 'baroque', 'neoclassicism'],
    avoidThemes: ['modern', 'experimental', 'informal']
  },
  
  // S 그룹 (함께 감상)
  'SAEF': {
    viewingStyle: 'social',
    artType: 'abstract',
    approach: 'emotional',
    processing: 'free',
    preferredThemes: ['energy', 'passion', 'movement', 'collective-emotion'],
    preferredPeriods: ['expressionism', 'action-painting', 'street-art'],
    avoidThemes: ['quiet', 'minimal', 'cerebral']
  },
  
  'SAEC': {
    viewingStyle: 'social',
    artType: 'abstract',
    approach: 'emotional',
    processing: 'systematic',
    preferredThemes: ['pattern', 'rhythm', 'visual-effects', 'shared-experience'],
    preferredPeriods: ['op-art', 'kinetic-art', 'digital-art'],
    avoidThemes: ['personal', 'introspective', 'static']
  },
  
  'SAMF': {
    viewingStyle: 'social',
    artType: 'abstract',
    approach: 'intellectual',
    processing: 'free',
    preferredThemes: ['transformation', 'revolution', 'breaking-barriers', 'innovation'],
    preferredPeriods: ['avant-garde', 'neo-expressionism', 'street-art'],
    avoidThemes: ['traditional', 'academic', 'conservative']
  },
  
  'SAMC': {
    viewingStyle: 'social',
    artType: 'abstract',
    approach: 'intellectual',
    processing: 'systematic',
    preferredThemes: ['social-change', 'architecture', 'planning', 'collective-vision'],
    preferredPeriods: ['bauhaus', 'constructivism', 'installation-art'],
    avoidThemes: ['individual', 'emotional', 'chaotic']
  },
  
  'SREF': {
    viewingStyle: 'social',
    artType: 'representational',
    approach: 'emotional',
    processing: 'free',
    preferredThemes: ['storytelling', 'human-connection', 'adventure', 'joy', 'fantasy'],
    preferredPeriods: ['narrative-painting', 'genre-painting', 'illustration'],
    avoidThemes: ['abstract', 'minimal', 'depressing']
  },
  
  'SREC': {
    viewingStyle: 'social',
    artType: 'representational',
    approach: 'emotional',
    processing: 'systematic',
    preferredThemes: ['harmony', 'beauty', 'sharing', 'peaceful-gathering'],
    preferredPeriods: ['impressionism', 'post-impressionism', 'genre-painting'],
    avoidThemes: ['conflict', 'abstract', 'disturbing']
  },
  
  'SRMF': {
    viewingStyle: 'social',
    artType: 'representational',
    approach: 'intellectual',
    processing: 'free',
    preferredThemes: ['education', 'culture', 'exploration', 'discovery'],
    preferredPeriods: ['history-painting', 'orientalism', 'documentary'],
    avoidThemes: ['abstract', 'personal', 'decorative']
  },
  
  'SRMC': {
    viewingStyle: 'social',
    artType: 'representational',
    approach: 'intellectual',
    processing: 'systematic',
    preferredThemes: ['masterworks', 'technique', 'art-history', 'cultural-heritage'],
    preferredPeriods: ['old-masters', 'renaissance', 'classical'],
    avoidThemes: ['experimental', 'contemporary', 'controversial']
  }
};

// 작품 태그 시스템
export interface ArtworkTags {
  themes: string[];
  periods: string[];
  mood: string[];
  complexity: 'simple' | 'moderate' | 'complex';
  social: 'solitary' | 'intimate' | 'public';
}

// 매칭 점수 계산
export function calculateMatchScore(
  userType: string, 
  artworkTags: ArtworkTags
): number {
  const prefs = aptCharacteristics[userType];
  if (!prefs) return 50; // 기본 점수
  
  let score = 50; // 기본점
  
  // 선호 테마 매치 (+30점까지)
  const themeMatches = artworkTags.themes.filter(theme => 
    prefs.preferredThemes?.includes(theme)
  ).length;
  score += Math.min(themeMatches * 10, 30);
  
  // 선호 시대 매치 (+20점까지) 
  const periodMatches = artworkTags.periods.filter(period =>
    prefs.preferredPeriods?.includes(period)
  ).length;
  score += Math.min(periodMatches * 10, 20);
  
  // 피할 테마가 있으면 감점 (-20점까지)
  const avoidMatches = artworkTags.themes.filter(theme =>
    prefs.avoidThemes?.includes(theme)
  ).length;
  score -= avoidMatches * 10;
  
  // 감상 방식 매치
  if ((prefs.viewingStyle === 'alone' && artworkTags.social === 'solitary') ||
      (prefs.viewingStyle === 'social' && artworkTags.social === 'public')) {
    score += 10;
  }
  
  return Math.max(0, Math.min(100, score));
}

// 다양성을 위한 아티스트 분산
export function ensureArtistDiversity<T extends {artist: string}>(
  artworks: T[], 
  maxPerArtist: number = 2
): T[] {
  const artistCount: Record<string, number> = {};
  return artworks.filter(artwork => {
    const count = artistCount[artwork.artist] || 0;
    if (count < maxPerArtist) {
      artistCount[artwork.artist] = count + 1;
      return true;
    }
    return false;
  });
}