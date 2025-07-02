// Artwork Enrichment Service
// Adds Korean translations, emotional tags, and personality matching

import { Artwork } from './api-client';

interface EmotionalProfile {
  dominantEmotion: string;
  emotionalTags: string[];
  colorPsychology: string[];
  viewerImpact: string;
}

interface TranslationCache {
  [key: string]: string;
}

export class ArtworkEnrichmentService {
  private translationCache: TranslationCache = {};
  
  // Enrich artwork with additional metadata
  async enrichArtwork(artwork: Artwork): Promise<Artwork> {
    const enriched = { ...artwork };
    
    // Add Korean translations
    enriched.titleKo = await this.translateToKorean(artwork.title);
    enriched.artistKo = await this.translateArtistName(artwork.artist);
    enriched.mediumKo = await this.translateMedium(artwork.medium);
    
    // Add emotional tags
    const emotionalProfile = this.analyzeEmotionalContent(artwork);
    enriched.emotionalTags = emotionalProfile.emotionalTags;
    
    // Add personality matches
    enriched.personalityMatch = this.matchPersonalities(artwork);
    
    return enriched;
  }
  
  // Translate to Korean (using predefined mappings for now)
  private async translateToKorean(text: string): Promise<string> {
    if (this.translationCache[text]) {
      return this.translationCache[text];
    }
    
    // Common art terms translation
    const translations: Record<string, string> = {
      'Untitled': '무제',
      'Self-Portrait': '자화상',
      'Landscape': '풍경',
      'Still Life': '정물',
      'Portrait': '초상화',
      'Abstract': '추상',
      'Composition': '구성',
      'Study': '습작',
      'Sketch': '스케치',
      'Drawing': '드로잉',
      'Painting': '회화',
      'Print': '판화',
      'Sculpture': '조각',
      'Installation': '설치'
    };
    
    // Check for exact match
    if (translations[text]) {
      this.translationCache[text] = translations[text];
      return translations[text];
    }
    
    // Check for partial matches
    for (const [eng, kor] of Object.entries(translations)) {
      if (text.includes(eng)) {
        const translated = text.replace(eng, kor);
        this.translationCache[text] = translated;
        return translated;
      }
    }
    
    // Return original if no translation found
    return text;
  }
  
  // Translate artist names
  private async translateArtistName(artist: string): Promise<string> {
    const artistTranslations: Record<string, string> = {
      'Vincent van Gogh': '빈센트 반 고흐',
      'Pablo Picasso': '파블로 피카소',
      'Claude Monet': '클로드 모네',
      'Salvador Dalí': '살바도르 달리',
      'Frida Kahlo': '프리다 칼로',
      'Andy Warhol': '앤디 워홀',
      'Jackson Pollock': '잭슨 폴록',
      'Mark Rothko': '마크 로스코',
      'Wassily Kandinsky': '바실리 칸딘스키',
      'Piet Mondrian': '피트 몬드리안',
      'Georgia O\'Keeffe': '조지아 오키프',
      'Edward Hopper': '에드워드 호퍼',
      'David Hockney': '데이비드 호크니',
      'Yayoi Kusama': '쿠사마 야요이',
      'Nam June Paik': '백남준',
      'Lee Ufan': '이우환',
      'Kim Whanki': '김환기',
      'Park Seo-bo': '박서보',
      'Unknown': '작가 미상'
    };
    
    return artistTranslations[artist] || artist;
  }
  
  // Translate medium
  private async translateMedium(medium: string): Promise<string> {
    const mediumTranslations: Record<string, string> = {
      'Oil on canvas': '캔버스에 유채',
      'Oil on board': '보드에 유채',
      'Oil on panel': '패널에 유채',
      'Watercolor': '수채화',
      'Acrylic': '아크릴',
      'Ink': '잉크',
      'Pencil': '연필',
      'Charcoal': '목탄',
      'Pastel': '파스텔',
      'Mixed media': '혼합 매체',
      'Bronze': '청동',
      'Marble': '대리석',
      'Wood': '나무',
      'Paper': '종이',
      'Canvas': '캔버스',
      'Silk': '비단',
      'Digital': '디지털',
      'Photography': '사진',
      'Video': '비디오',
      'Installation': '설치'
    };
    
    let translated = medium;
    for (const [eng, kor] of Object.entries(mediumTranslations)) {
      translated = translated.replace(new RegExp(eng, 'gi'), kor);
    }
    
    return translated;
  }
  
  // Analyze emotional content based on artwork metadata
  private analyzeEmotionalContent(artwork: Artwork): EmotionalProfile {
    const emotionalMap: Record<string, EmotionalProfile> = {
      'abstract': {
        dominantEmotion: 'contemplative',
        emotionalTags: ['사색적', '명상적', 'meditative', 'thoughtful'],
        colorPsychology: ['내면 탐구', 'inner exploration'],
        viewerImpact: '내적 성찰을 유도'
      },
      'landscape': {
        dominantEmotion: 'peaceful',
        emotionalTags: ['평화로운', '고요한', 'serene', 'calm'],
        colorPsychology: ['자연의 위안', 'natural comfort'],
        viewerImpact: '마음의 안정'
      },
      'portrait': {
        dominantEmotion: 'intimate',
        emotionalTags: ['친밀한', '개인적', 'personal', 'human'],
        colorPsychology: ['인간적 연결', 'human connection'],
        viewerImpact: '공감과 연결'
      },
      'still life': {
        dominantEmotion: 'contemplative',
        emotionalTags: ['정적인', '관조적', 'quiet', 'observant'],
        colorPsychology: ['일상의 미', 'everyday beauty'],
        viewerImpact: '세심한 관찰'
      },
      'expressionism': {
        dominantEmotion: 'intense',
        emotionalTags: ['강렬한', '감정적', 'emotional', 'passionate'],
        colorPsychology: ['감정의 폭발', 'emotional explosion'],
        viewerImpact: '강한 감정 자극'
      },
      'impressionism': {
        dominantEmotion: 'joyful',
        emotionalTags: ['빛나는', '순간적', 'luminous', 'fleeting'],
        colorPsychology: ['빛의 유희', 'play of light'],
        viewerImpact: '순간의 아름다움'
      },
      'surrealism': {
        dominantEmotion: 'mysterious',
        emotionalTags: ['신비로운', '꿈같은', 'dreamlike', 'enigmatic'],
        colorPsychology: ['무의식 탐구', 'unconscious exploration'],
        viewerImpact: '상상력 자극'
      }
    };
    
    // Determine emotional profile based on tags and classification
    let profile: EmotionalProfile = {
      dominantEmotion: 'neutral',
      emotionalTags: ['예술적', 'artistic'],
      colorPsychology: ['시각적 경험', 'visual experience'],
      viewerImpact: '미적 감상'
    };
    
    // Check classification and tags
    const allText = `${artwork.classification} ${artwork.tags.join(' ')} ${artwork.title}`.toLowerCase();
    
    for (const [key, value] of Object.entries(emotionalMap)) {
      if (allText.includes(key)) {
        profile = value;
        break;
      }
    }
    
    // Add color-based emotions if available
    if (artwork.colors && artwork.colors.length > 0) {
      const dominantColor = artwork.colors[0];
      if (dominantColor.includes('red')) {
        profile.emotionalTags.push('열정적', 'passionate');
      } else if (dominantColor.includes('blue')) {
        profile.emotionalTags.push('차분한', 'calm');
      } else if (dominantColor.includes('yellow')) {
        profile.emotionalTags.push('활기찬', 'energetic');
      }
    }
    
    return profile;
  }
  
  // Match artwork to SAYU personality types
  private matchPersonalities(artwork: Artwork): string[] {
    const matches: string[] = [];
    const allText = `${artwork.classification} ${artwork.tags.join(' ')} ${artwork.medium}`.toLowerCase();
    
    // Abstract preferences
    if (allText.includes('abstract') || allText.includes('non-representational')) {
      if (allText.includes('expressionism') || allText.includes('emotional')) {
        matches.push('LAEF', 'SAEF'); // Emotional abstract
      }
      if (allText.includes('geometric') || allText.includes('minimal')) {
        matches.push('LAMF', 'LAMC'); // Structured abstract
      }
      if (allText.includes('spiritual') || allText.includes('transcendent')) {
        matches.push('LAEC', 'SAEC'); // Conceptual abstract
      }
    }
    
    // Representational preferences
    if (allText.includes('portrait') || allText.includes('figure')) {
      matches.push('LREC', 'SREC'); // Human connection
    }
    if (allText.includes('landscape') || allText.includes('nature')) {
      matches.push('LREF', 'SREF'); // Nature observers
    }
    if (allText.includes('still life') || allText.includes('detail')) {
      matches.push('LRMF', 'SRMF'); // Detail-oriented
    }
    
    // Size preferences
    if (allText.includes('miniature') || allText.includes('small')) {
      matches.push('SREF', 'SREC', 'SRMF', 'SRMC');
    }
    if (allText.includes('large') || allText.includes('monumental')) {
      matches.push('LAEF', 'LAEC', 'LAMF', 'LAMC');
    }
    
    // Medium preferences
    if (allText.includes('print') || allText.includes('etching')) {
      matches.push('SRMC', 'SRMF'); // Precision work
    }
    if (allText.includes('installation') || allText.includes('mixed media')) {
      matches.push('SAEC', 'LAEC'); // Experimental
    }
    
    // Remove duplicates
    return [...new Set(matches)];
  }
  
  // Batch enrich multiple artworks
  async enrichArtworkBatch(artworks: Artwork[]): Promise<Artwork[]> {
    const enrichedArtworks: Artwork[] = [];
    
    for (const artwork of artworks) {
      const enriched = await this.enrichArtwork(artwork);
      enrichedArtworks.push(enriched);
    }
    
    return enrichedArtworks;
  }
}