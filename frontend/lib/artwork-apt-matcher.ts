/**
 * 작품별 APT 유형 매칭 시스템
 * 작품의 특성을 분석하여 16가지 APT 유형과의 적합도를 계산
 */

interface ArtworkFeatures {
  title: string;
  artist: string;
  year?: string;
  style?: string;
  tags?: string[];
}

interface APTMatchScore {
  type: string;
  score: number;
  reasons: string[];
}

// APT 유형별 키워드와 특성
const APT_CHARACTERISTICS = {
  // L(Lone) + A(Atmospheric) - 혼자서 분위기를 즐기는
  'LAEF': { // 여우 - 몽환적 방랑자
    keywords: {
      title: ['night', 'moon', 'dream', 'mist', 'shadow', 'twilight', 'solitary', 'wanderer'],
      artist: ['van gogh', 'turner', 'friedrich', 'blake', 'redon'],
      style: ['romanticism', 'symbolism', 'expressionism', 'surrealism']
    },
    features: {
      darkness: 0.7,     // 어두운 톤 선호
      emotion: 0.9,      // 감정 강도 높음
      isolation: 0.8,    // 고독한 주제
      mystery: 0.9       // 신비로움
    }
  },
  
  'LAEC': { // 고양이 - 감성 큐레이터
    keywords: {
      title: ['garden', 'flowers', 'portrait', 'woman', 'elegant', 'delicate'],
      artist: ['monet', 'degas', 'cassatt', 'morisot', 'renoir'],
      style: ['impressionism', 'art nouveau', 'japonisme']
    },
    features: {
      elegance: 0.9,
      sensitivity: 0.8,
      beauty: 0.9,
      refinement: 0.8
    }
  },
  
  'LAMF': { // 올빼미 - 직관적 탐구자
    keywords: {
      title: ['interior', 'window', 'room', 'silence', 'contemplation', 'study'],
      artist: ['vermeer', 'hammershoi', 'hopper', 'chardin'],
      style: ['realism', 'dutch golden age', 'northern renaissance']
    },
    features: {
      quietness: 0.9,
      depth: 0.8,
      contemplation: 0.9,
      precision: 0.7
    }
  },
  
  'LAMC': { // 거북이 - 철학적 수집가
    keywords: {
      title: ['still life', 'objects', 'books', 'skull', 'vanitas'],
      artist: ['cezanne', 'morandi', 'chardin', 'klee', 'mondrian'],
      style: ['post-impressionism', 'cubism', 'abstract']
    },
    features: {
      structure: 0.9,
      philosophy: 0.8,
      order: 0.9,
      symbolism: 0.7
    }
  },
  
  // L(Lone) + R(Realistic) - 혼자서 현실을 관찰하는
  'LREF': { // 카멜레온 - 고독한 관찰자
    keywords: {
      title: ['portrait', 'figure', 'street', 'everyday', 'worker'],
      artist: ['velazquez', 'manet', 'courbet', 'millet', 'daumier'],
      style: ['realism', 'naturalism', 'social realism']
    },
    features: {
      observation: 0.9,
      truthfulness: 0.9,
      social: 0.6,
      documentary: 0.7
    }
  },
  
  'LREC': { // 고슴도치 - 섬세한 감정가
    keywords: {
      title: ['child', 'mother', 'family', 'tender', 'intimate', 'gentle'],
      artist: ['renoir', 'cassatt', 'boucher', 'fragonard'],
      style: ['rococo', 'impressionism', 'genre painting']
    },
    features: {
      tenderness: 0.9,
      intimacy: 0.9,
      sweetness: 0.8,
      warmth: 0.7
    }
  },
  
  'LRMF': { // 수달 - 의미 추구자
    keywords: {
      title: ['allegory', 'myth', 'legend', 'story', 'narrative'],
      artist: ['bruegel', 'bosch', 'durer', 'blake'],
      style: ['northern renaissance', 'romanticism', 'symbolism']
    },
    features: {
      narrative: 0.9,
      meaning: 0.9,
      complexity: 0.8,
      wisdom: 0.7
    }
  },
  
  'LRMC': { // 비버 - 체계적 분석가
    keywords: {
      title: ['anatomy', 'study', 'diagram', 'perspective', 'architecture'],
      artist: ['leonardo', 'durer', 'ingres', 'david'],
      style: ['renaissance', 'neoclassicism', 'academic']
    },
    features: {
      precision: 0.9,
      analysis: 0.9,
      technical: 0.8,
      systematic: 0.9
    }
  },
  
  // S(Social) + A(Atmospheric) - 함께 분위기를 나누는
  'SAEF': { // 돌고래 - 열정적 공감자
    keywords: {
      title: ['dance', 'celebration', 'party', 'music', 'joy', 'festival'],
      artist: ['renoir', 'toulouse-lautrec', 'degas', 'bruegel'],
      style: ['impressionism', 'post-impressionism']
    },
    features: {
      joy: 0.9,
      energy: 0.9,
      social: 0.9,
      celebration: 0.8
    }
  },
  
  'SAEC': { // 백조 - 우아한 조화자
    keywords: {
      title: ['ball', 'salon', 'lady', 'dress', 'tea', 'conversation'],
      artist: ['sargent', 'tissot', 'manet', 'renoir'],
      style: ['impressionism', 'belle epoque', 'society portrait']
    },
    features: {
      elegance: 0.9,
      harmony: 0.9,
      social_grace: 0.9,
      refinement: 0.8
    }
  },
  
  'SAMF': { // 부엉이 - 지혜로운 멘토
    keywords: {
      title: ['philosopher', 'teacher', 'wisdom', 'lesson', 'parable'],
      artist: ['rembrandt', 'raphael', 'poussin'],
      style: ['baroque', 'renaissance', 'history painting']
    },
    features: {
      wisdom: 0.9,
      teaching: 0.8,
      depth: 0.9,
      moral: 0.7
    }
  },
  
  'SAMC': { // 코끼리 - 포용적 리더 (누락된 타입)
    keywords: {
      title: ['gathering', 'community', 'assembly', 'unity', 'collective'],
      artist: ['rubens', 'veronese', 'tintoretto'],
      style: ['baroque', 'renaissance', 'grand manner']
    },
    features: {
      leadership: 0.9,
      community: 0.9,
      grandeur: 0.8,
      inclusion: 0.9
    }
  },
  
  // S(Social) + R(Realistic) - 함께 현실을 살아가는
  'SREF': { // 강아지 - 따뜻한 조화자
    keywords: {
      title: ['family', 'friends', 'picnic', 'children', 'home', 'together'],
      artist: ['renoir', 'cassatt', 'morisot', 'pissarro'],
      style: ['impressionism', 'genre painting']
    },
    features: {
      warmth: 0.9,
      togetherness: 0.9,
      comfort: 0.8,
      happiness: 0.8
    }
  },
  
  'SREC': { // 토끼 - 배려심 깊은 협력자
    keywords: {
      title: ['helping', 'care', 'kindness', 'support', 'gentle'],
      artist: ['murillo', 'greuze', 'chardin'],
      style: ['genre painting', 'rococo', 'sentimental']
    },
    features: {
      caring: 0.9,
      gentleness: 0.9,
      cooperation: 0.8,
      empathy: 0.8
    }
  },
  
  'SRMF': { // 늑대 - 충직한 수호자
    keywords: {
      title: ['hero', 'battle', 'victory', 'loyalty', 'courage', 'honor'],
      artist: ['rembrandt', 'rubens', 'velazquez', 'goya'],
      style: ['baroque', 'romanticism', 'history painting']
    },
    features: {
      loyalty: 0.9,
      courage: 0.8,
      protection: 0.9,
      honor: 0.8
    }
  },
  
  'SRMC': { // 펭귄 - 원칙적 조직가
    keywords: {
      title: ['order', 'ceremony', 'institution', 'formal', 'official'],
      artist: ['david', 'ingres', 'vermeer'],
      style: ['neoclassicism', 'academic', 'dutch golden age']
    },
    features: {
      order: 0.9,
      formality: 0.8,
      tradition: 0.8,
      structure: 0.9
    }
  }
};

/**
 * 작품과 APT 유형의 매칭 점수 계산
 */
export function calculateAPTMatch(artwork: ArtworkFeatures, aptType: string): number {
  const characteristics = APT_CHARACTERISTICS[aptType];
  if (!characteristics) return 0;
  
  let score = 0;
  let factors = 0;
  
  // 제목 키워드 매칭
  if (artwork.title) {
    const titleLower = artwork.title.toLowerCase();
    const titleMatches = characteristics.keywords.title.filter(keyword => 
      titleLower.includes(keyword)
    ).length;
    score += titleMatches * 15; // 각 매칭당 15점
    factors++;
  }
  
  // 작가 매칭
  if (artwork.artist) {
    const artistLower = artwork.artist.toLowerCase();
    const artistMatch = characteristics.keywords.artist.some(artist => 
      artistLower.includes(artist)
    );
    if (artistMatch) {
      score += 30; // 작가 매칭은 30점
      factors++;
    }
  }
  
  // 스타일 매칭
  if (artwork.style) {
    const styleLower = artwork.style.toLowerCase();
    const styleMatch = characteristics.keywords.style.some(style => 
      styleLower.includes(style)
    );
    if (styleMatch) {
      score += 25; // 스타일 매칭은 25점
      factors++;
    }
  }
  
  // 연도 기반 시대 매칭 (선택적)
  if (artwork.year) {
    const year = parseInt(artwork.year);
    if (!isNaN(year)) {
      // 시대별 선호도 추가 (예시)
      if (aptType.startsWith('LA') && year < 1900) score += 10; // 고전 선호
      if (aptType.startsWith('SA') && year > 1850) score += 10; // 근현대 선호
    }
  }
  
  // 최대 100점으로 정규화
  return Math.min(100, score);
}

/**
 * 작품에 가장 적합한 APT 유형들 추천
 */
export function recommendAPTTypes(artwork: ArtworkFeatures, topN: number = 3): APTMatchScore[] {
  const scores: APTMatchScore[] = [];
  
  for (const aptType of Object.keys(APT_CHARACTERISTICS)) {
    const score = calculateAPTMatch(artwork, aptType);
    const characteristics = APT_CHARACTERISTICS[aptType];
    
    // 매칭 이유 생성
    const reasons: string[] = [];
    
    if (artwork.artist) {
      const artistMatch = characteristics.keywords.artist.find(a => 
        artwork.artist.toLowerCase().includes(a)
      );
      if (artistMatch) {
        reasons.push(`${artwork.artist}의 작품 선호`);
      }
    }
    
    if (artwork.style) {
      const styleMatch = characteristics.keywords.style.find(s => 
        artwork.style!.toLowerCase().includes(s)
      );
      if (styleMatch) {
        reasons.push(`${styleMatch} 스타일과 조화`);
      }
    }
    
    scores.push({
      type: aptType,
      score,
      reasons
    });
  }
  
  // 점수 높은 순으로 정렬하여 상위 N개 반환
  return scores
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
}

/**
 * 사용자의 좋아요 패턴으로 실제 선호 APT 유형 추론
 */
export function inferUserAPTFromLikes(likedArtworks: ArtworkFeatures[]): Record<string, number> {
  const typeScores: Record<string, number> = {};
  
  // 모든 APT 타입 초기화
  for (const aptType of Object.keys(APT_CHARACTERISTICS)) {
    typeScores[aptType] = 0;
  }
  
  // 각 좋아요한 작품에 대해 APT 매칭 점수 누적
  for (const artwork of likedArtworks) {
    for (const aptType of Object.keys(APT_CHARACTERISTICS)) {
      const score = calculateAPTMatch(artwork, aptType);
      typeScores[aptType] += score;
    }
  }
  
  // 평균 점수로 정규화
  const artworkCount = likedArtworks.length || 1;
  for (const aptType of Object.keys(typeScores)) {
    typeScores[aptType] = Math.round(typeScores[aptType] / artworkCount);
  }
  
  return typeScores;
}