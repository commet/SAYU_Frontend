/**
 * SAYU Gallery 추천 시스템
 * 실제 작품 데이터와 성격 유형 매칭을 통한 큐레이션
 */

import { PERSONALITY_ARTIST_MATCHING_2025 } from '@/data/personality-artwork-matching-2025';
import { getSREFCuratedArtworks } from '@/data/sref-curated-artworks';
import { getCuratedArtworkUrls } from '@/data/curated-artwork-urls';
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
    'modern': ['modern', 'contemporary', 'abstract', '현대', '추상']
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
  
  console.log('🎯 getPersonalizedRecommendations called with userType:', userType);
  
  // APT 타입을 SAYU 타입으로 변환
  const sayuType = APT_TO_SAYU_MAPPING[userType] || 'SREF';
  console.log('🔄 Mapped to sayuType:', sayuType);
  
  // SREF 유형인 경우 실제 큐레이션된 데이터 사용
  if (sayuType === 'SREF' || userType === 'SREF') {
    console.log('✨ Loading SREF curated artworks...');
    const srefArtworks = getSREFCuratedArtworks();
    console.log('📚 Got', srefArtworks.length, 'SREF artworks');
    console.log('🖼️ First SREF artwork:', srefArtworks[0]);
    return srefArtworks.map(artwork => ({
      id: artwork.id,
      title: artwork.title,
      artist: artwork.artist,
      year: artwork.year,
      imageUrl: artwork.imageUrl,
      cloudinaryUrl: artwork.imageUrl,
      museum: artwork.museum,
      medium: artwork.medium,
      department: artwork.medium,
      description: artwork.description,
      matchPercent: artwork.matchPercent,
      curatorNote: artwork.personalityResonance,
      category: artwork.tags,
      isPublicDomain: artwork.isPublicDomain
    }));
  }
  
  const matching = PERSONALITY_ARTIST_MATCHING_2025[sayuType];
  
  if (!matching) {
    // 매칭 데이터가 없으면 랜덤 추천
    return getRandomRecommendations(category);
  }
  
  // Get curated artwork URLs for this personality type
  const curatedUrls = getCuratedArtworkUrls(userType);
  const fallbackImage = '/images/placeholder-artwork.jpg';
  let urlIndex = 0;
  
  // 1. Primary Artist 작품들 (key artwork + alternatives)
  // Key artwork first
  recommendations.push({
    id: `primary-key`,
    title: matching.primary.keyArtwork.title,
    artist: matching.primary.name,
    year: matching.primary.keyArtwork.year || matching.primary.period,
    imageUrl: curatedUrls.length > 0 ? curatedUrls[urlIndex % curatedUrls.length] : fallbackImage,
    cloudinaryUrl: curatedUrls.length > 0 ? curatedUrls[urlIndex % curatedUrls.length] : fallbackImage,
    museum: 'SAYU Curated Collection',
    medium: 'Oil on canvas',
    department: matching.primary.style,
    description: matching.primary.keyArtwork.description,
    matchPercent: 98,
    curatorNote: matching.primary.keyArtwork.personalityResonance,
    category: [category],
    isPublicDomain: true
  });
  urlIndex++;
  
  // Alternative works
  matching.primary.alternativeWorks.forEach((altWork, index) => {
    recommendations.push({
      id: `primary-alt-${index}`,
      title: altWork.title,
      artist: matching.primary.name,
      year: altWork.year || matching.primary.period,
      imageUrl: curatedUrls[urlIndex % curatedUrls.length],
      cloudinaryUrl: curatedUrls[urlIndex % curatedUrls.length],
      museum: 'SAYU Curated Collection',
      medium: 'Oil on canvas',
      department: matching.primary.style,
      description: altWork.description,
      matchPercent: 94 - (index * 2),
      curatorNote: altWork.personalityResonance,
      category: [category],
      isPublicDomain: true
    });
    urlIndex++;
  });
  
  // Additional primary works from actual collection
  const primaryWorks = findArtworksByArtist(matching.primary.name, 3);
  primaryWorks.forEach((artwork, index) => {
    recommendations.push({
      id: `primary-real-${index}`,
      title: artwork.title || `${matching.primary.name} Collection ${index + 1}`,
      artist: artwork.artist || matching.primary.name,
      year: artwork.date || matching.primary.period,
      imageUrl: artwork.cloudinaryUrl || artwork.primaryImage || (curatedUrls.length > 0 ? curatedUrls[urlIndex % curatedUrls.length] : fallbackImage),
      cloudinaryUrl: artwork.cloudinaryUrl,
      museum: artwork.department || 'SAYU Curated',
      medium: artwork.medium || 'Oil on canvas',
      department: artwork.classification || matching.primary.style,
      description: artwork.description || 'A masterpiece that exemplifies the artist\'s unique style and vision.',
      matchPercent: 90 - (index * 2),
      curatorNote: matching.primary.personalityAlignment,
      category: [category],
      isPublicDomain: artwork.isPublicDomain
    });
    urlIndex++;
  });
  
  // 2. Secondary Artist 작품들
  // Key artwork
  recommendations.push({
    id: `secondary-key`,
    title: matching.secondary.keyArtwork.title,
    artist: matching.secondary.name,
    year: matching.secondary.keyArtwork.year || matching.secondary.period,
    imageUrl: curatedUrls.length > 0 ? curatedUrls[urlIndex % curatedUrls.length] : fallbackImage,
    cloudinaryUrl: curatedUrls.length > 0 ? curatedUrls[urlIndex % curatedUrls.length] : fallbackImage,
    museum: 'SAYU Curated Collection',
    medium: 'Oil on canvas',
    department: matching.secondary.style,
    description: matching.secondary.keyArtwork.description,
    matchPercent: 92,
    curatorNote: matching.secondary.keyArtwork.personalityResonance,
    category: [category],
    isPublicDomain: true
  });
  urlIndex++;
  
  // Alternative works
  matching.secondary.alternativeWorks.forEach((altWork, index) => {
    recommendations.push({
      id: `secondary-alt-${index}`,
      title: altWork.title,
      artist: matching.secondary.name,
      year: altWork.year || matching.secondary.period,
      imageUrl: curatedUrls[urlIndex % curatedUrls.length],
      cloudinaryUrl: curatedUrls[urlIndex % curatedUrls.length],
      museum: 'SAYU Curated Collection',
      medium: 'Oil on canvas',
      department: matching.secondary.style,
      description: altWork.description,
      matchPercent: 88 - (index * 2),
      curatorNote: altWork.personalityResonance,
      category: [category],
      isPublicDomain: true
    });
    urlIndex++;
  });
  
  // Additional secondary works
  const secondaryWorks = findArtworksByArtist(matching.secondary.name, 2);
  secondaryWorks.forEach((artwork, index) => {
    recommendations.push({
      id: `secondary-real-${index}`,
      title: artwork.title || `${matching.secondary.name} Collection ${index + 1}`,
      artist: artwork.artist || matching.secondary.name,
      year: artwork.date || matching.secondary.period,
      imageUrl: artwork.cloudinaryUrl || artwork.primaryImage || (curatedUrls.length > 0 ? curatedUrls[urlIndex % curatedUrls.length] : fallbackImage),
      cloudinaryUrl: artwork.cloudinaryUrl,
      museum: artwork.department || 'SAYU Curated',
      medium: artwork.medium || 'Oil on canvas',
      department: artwork.classification || matching.secondary.style,
      description: artwork.description || 'A remarkable work that showcases the artist\'s mastery and emotional depth.',
      matchPercent: 84 - (index * 2),
      curatorNote: matching.secondary.personalityAlignment,
      category: [category],
      isPublicDomain: artwork.isPublicDomain
    });
    urlIndex++;
  });
  
  // 3. Tertiary Artist 작품들 (숨겨진 보석)
  // Key artwork
  recommendations.push({
    id: `tertiary-key`,
    title: matching.tertiary.keyArtwork.title,
    artist: matching.tertiary.name,
    year: matching.tertiary.keyArtwork.year || matching.tertiary.period,
    imageUrl: curatedUrls.length > 0 ? curatedUrls[urlIndex % curatedUrls.length] : fallbackImage,
    cloudinaryUrl: curatedUrls.length > 0 ? curatedUrls[urlIndex % curatedUrls.length] : fallbackImage,
    museum: 'SAYU Hidden Gems',
    medium: 'Mixed media',
    department: matching.tertiary.style,
    description: matching.tertiary.keyArtwork.description,
    matchPercent: 86,
    curatorNote: matching.tertiary.keyArtwork.personalityResonance,
    category: [category],
    isPublicDomain: true
  });
  urlIndex++;
  
  // Alternative works
  matching.tertiary.alternativeWorks.forEach((altWork, index) => {
    recommendations.push({
      id: `tertiary-alt-${index}`,
      title: altWork.title,
      artist: matching.tertiary.name,
      year: altWork.year || matching.tertiary.period,
      imageUrl: curatedUrls[urlIndex % curatedUrls.length],
      cloudinaryUrl: curatedUrls[urlIndex % curatedUrls.length],
      museum: 'SAYU Hidden Gems',
      medium: 'Mixed media',
      department: matching.tertiary.style,
      description: altWork.description,
      matchPercent: 82 - (index * 2),
      curatorNote: altWork.personalityResonance,
      category: [category],
      isPublicDomain: true
    });
    urlIndex++;
  });
  
  // Additional tertiary works
  const tertiaryWorks = findArtworksByArtist(matching.tertiary.name, 1);
  tertiaryWorks.forEach((artwork, index) => {
    recommendations.push({
      id: `tertiary-real-${index}`,
      title: artwork.title || `${matching.tertiary.name} Hidden Gem`,
      artist: artwork.artist || matching.tertiary.name,
      year: artwork.date || matching.tertiary.period,
      imageUrl: artwork.cloudinaryUrl || artwork.primaryImage || (curatedUrls.length > 0 ? curatedUrls[urlIndex % curatedUrls.length] : fallbackImage),
      cloudinaryUrl: artwork.cloudinaryUrl,
      museum: artwork.department || 'SAYU Hidden Gem',
      medium: artwork.medium || 'Mixed media',
      department: artwork.classification || matching.tertiary.style,
      description: artwork.description || 'A hidden treasure that reveals new layers of meaning with each viewing.',
      matchPercent: 80,
      curatorNote: matching.tertiary.personalityAlignment,
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