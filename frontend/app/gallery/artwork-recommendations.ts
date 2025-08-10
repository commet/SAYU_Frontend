/**
 * SAYU Gallery 추천 시스템
 * 실제 작품 데이터와 성격 유형 매칭을 통한 큐레이션
 */

import { PERSONALITY_ARTIST_MATCHING_2025 } from '@/data/personality-artwork-matching-2025';
import artworksData from '@/public/data/artworks.json';

interface ArtworkRecommendation {
  id: string;
  title: string;
  artist: string;
  year: string;
  imageUrl: string;
  cloudinaryUrl?: string;
  museum: string;
  medium?: string;
  department?: string;
  description?: string;
  matchPercent: number;
  curatorNote: string;
  category?: string[];
  isPublicDomain?: boolean;
}

// APT 타입 매핑 (퀴즈 결과 -> SAYU 유형)
const APT_TO_SAYU_MAPPING: Record<string, string> = {
  // SREF 매핑
  'SREF': 'SREF',
  'SRFT': 'SREF',
  'SRPY': 'SREF',
  
  // WRPY 매핑  
  'WRPY': 'SAMC',
  'WRFT': 'SAMC',
  'WRFU': 'SAMC',
  
  // DRCU 매핑
  'DRCU': 'LRMC',
  'DRCY': 'LRMC',
  'DRFT': 'LRMC',
  
  // LNFT 매핑
  'LNFT': 'LAEF',
  'LNFU': 'LAEF', 
  'LNPY': 'LAEF',
  'LNCU': 'LAEF',
  
  // 기타
  'SFPY': 'SREF',
  'WREU': 'SAMC',
  'DRPU': 'LRMC'
};

// 카테고리별 필터링 함수
function filterByCategory(artworks: any[], category: string): any[] {
  if (category === 'all') return artworks;
  
  const categoryKeywords: Record<string, string[]> = {
    'paintings': ['painting', 'oil', 'canvas', 'watercolor', '회화'],
    'sculpture': ['sculpture', 'bronze', 'marble', 'stone', '조각'],
    'photography': ['photograph', 'photo', 'gelatin', 'print', '사진'],
    'asian-art': ['asian', 'korean', 'chinese', 'japanese', '동양'],
    'modern': ['modern', 'contemporary', 'abstract', '현대', '추상'],
    'contemporary': ['contemporary', 'installation', 'conceptual', '컨템포러리']
  };
  
  const keywords = categoryKeywords[category] || [];
  return artworks.filter(artwork => {
    const searchText = `${artwork.title} ${artwork.artist} ${artwork.medium} ${artwork.classification}`.toLowerCase();
    return keywords.some(keyword => searchText.includes(keyword.toLowerCase()));
  });
}

// 실제 작품 데이터에서 작가별 작품 찾기
function findArtworksByArtist(artistName: string, limit: number = 5): any[] {
  const normalizedArtist = artistName.toLowerCase();
  const artistWorks = artworksData.artworks.filter(artwork => {
    const artworkArtist = (artwork.artist || '').toLowerCase();
    return artworkArtist.includes(normalizedArtist) || 
           normalizedArtist.split(' ').some(part => artworkArtist.includes(part));
  });
  
  // 랜덤하게 섞어서 다양성 제공
  return artistWorks.sort(() => Math.random() - 0.5).slice(0, limit);
}

// 성격 유형별 맞춤 추천 생성
export function getPersonalizedRecommendations(
  userType: string,
  category: string = 'all'
): ArtworkRecommendation[] {
  const recommendations: ArtworkRecommendation[] = [];
  
  // APT 타입을 SAYU 타입으로 변환
  const sayuType = APT_TO_SAYU_MAPPING[userType] || 'SREF';
  const matching = PERSONALITY_ARTIST_MATCHING_2025[sayuType];
  
  if (!matching) {
    // 매칭 데이터가 없으면 랜덤 추천
    return getRandomRecommendations(category);
  }
  
  // 1. Primary Artist 작품들
  const primaryWorks = findArtworksByArtist(matching.primary.name, 4);
  primaryWorks.forEach((artwork, index) => {
    recommendations.push({
      id: `primary-${index}`,
      title: artwork.title || matching.primary.keyArtwork.title,
      artist: artwork.artist || matching.primary.name,
      year: artwork.date || matching.primary.period,
      imageUrl: artwork.cloudinaryUrl || artwork.primaryImage || '',
      cloudinaryUrl: artwork.cloudinaryUrl,
      museum: artwork.department || 'SAYU Curated',
      medium: artwork.medium,
      department: artwork.classification,
      description: index === 0 ? matching.primary.keyArtwork.description : artwork.description,
      matchPercent: 95 - (index * 2),
      curatorNote: index === 0 
        ? matching.primary.keyArtwork.personalityResonance
        : matching.primary.personalityAlignment,
      category: [category],
      isPublicDomain: artwork.isPublicDomain
    });
  });
  
  // 2. Secondary Artist 작품들
  const secondaryWorks = findArtworksByArtist(matching.secondary.name, 3);
  secondaryWorks.forEach((artwork, index) => {
    recommendations.push({
      id: `secondary-${index}`,
      title: artwork.title || matching.secondary.keyArtwork.title,
      artist: artwork.artist || matching.secondary.name,
      year: artwork.date || matching.secondary.period,
      imageUrl: artwork.cloudinaryUrl || artwork.primaryImage || '',
      cloudinaryUrl: artwork.cloudinaryUrl,
      museum: artwork.department || 'SAYU Curated',
      medium: artwork.medium,
      department: artwork.classification,
      description: index === 0 ? matching.secondary.keyArtwork.description : artwork.description,
      matchPercent: 88 - (index * 2),
      curatorNote: index === 0
        ? matching.secondary.keyArtwork.personalityResonance
        : matching.secondary.personalityAlignment,
      category: [category],
      isPublicDomain: artwork.isPublicDomain
    });
  });
  
  // 3. Tertiary Artist 작품들 (숨겨진 보석)
  const tertiaryWorks = findArtworksByArtist(matching.tertiary.name, 3);
  tertiaryWorks.forEach((artwork, index) => {
    recommendations.push({
      id: `tertiary-${index}`,
      title: artwork.title || matching.tertiary.keyArtwork.title,
      artist: artwork.artist || matching.tertiary.name,
      year: artwork.date || matching.tertiary.period,
      imageUrl: artwork.cloudinaryUrl || artwork.primaryImage || '',
      cloudinaryUrl: artwork.cloudinaryUrl,
      museum: artwork.department || 'SAYU Hidden Gem',
      medium: artwork.medium,
      department: artwork.classification,
      description: index === 0 ? matching.tertiary.keyArtwork.description : artwork.description,
      matchPercent: 82 - (index * 2),
      curatorNote: index === 0
        ? matching.tertiary.keyArtwork.personalityResonance
        : matching.tertiary.personalityAlignment,
      category: [category],
      isPublicDomain: artwork.isPublicDomain
    });
  });
  
  // 카테고리 필터링
  if (category !== 'all') {
    const filtered = filterByCategory(recommendations, category);
    if (filtered.length > 0) return filtered;
  }
  
  return recommendations;
}

// 랜덤 추천 (성격 유형이 없을 때)
export function getRandomRecommendations(category: string = 'all'): ArtworkRecommendation[] {
  let pool = [...artworksData.artworks];
  
  // 카테고리 필터링
  if (category !== 'all') {
    pool = filterByCategory(pool, category);
  }
  
  // 랜덤 선택
  const selected = pool
    .sort(() => Math.random() - 0.5)
    .slice(0, 20)
    .map((artwork, index) => ({
      id: `random-${index}`,
      title: artwork.title || 'Untitled',
      artist: artwork.artist || 'Unknown Artist',
      year: artwork.date || '',
      imageUrl: artwork.cloudinaryUrl || artwork.primaryImage || '',
      cloudinaryUrl: artwork.cloudinaryUrl,
      museum: artwork.department || 'Museum Collection',
      medium: artwork.medium,
      department: artwork.classification,
      description: artwork.description || '',
      matchPercent: Math.floor(Math.random() * 20) + 70,
      curatorNote: 'Discover new art that might inspire you',
      category: [category],
      isPublicDomain: artwork.isPublicDomain
    }));
  
  return selected;
}

// 오늘의 추천 (Dashboard용)
export function getTodayRecommendations(userType?: string): ArtworkRecommendation[] {
  if (userType) {
    return getPersonalizedRecommendations(userType, 'all').slice(0, 3);
  }
  return getRandomRecommendations('all').slice(0, 3);
}