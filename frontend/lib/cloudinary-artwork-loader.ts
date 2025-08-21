/**
 * Cloudinary Artwork Loader
 * 1000개 이상의 Artvee 작품을 로드하고 관리
 */

import cloudinaryData from '@/../../artvee-crawler/data/cloudinary-urls.json';

export interface CloudinaryArtwork {
  id: string;
  title: string;
  artist: string;
  year?: string;
  imageUrl: string;
  thumbnail: string;
  style?: string;
  museum?: string;
  description?: string;
  curatorNote?: string;
  matchPercent?: number;
  width?: number;
  height?: number;
  aspectRatio?: number;
  sayuType?: string;
}

/**
 * 모든 Cloudinary 작품 로드
 */
export function loadAllCloudinaryArtworks(): CloudinaryArtwork[] {
  const artworks: CloudinaryArtwork[] = [];
  
  for (const [key, data] of Object.entries(cloudinaryData)) {
    const artwork = data as any;
    
    artworks.push({
      id: key,
      title: artwork.artwork?.title || formatTitle(key),
      artist: artwork.artwork?.artist || 'Unknown Artist',
      year: extractYear(artwork.artwork?.title),
      imageUrl: artwork.full?.url || '',
      thumbnail: artwork.thumbnail?.url || artwork.full?.url || '',
      width: artwork.full?.width,
      height: artwork.full?.height,
      aspectRatio: artwork.full?.width && artwork.full?.height 
        ? artwork.full.width / artwork.full.height 
        : 1,
      sayuType: artwork.artwork?.sayuType,
      style: detectStyleFromArtist(artwork.artwork?.artist),
      museum: 'Artvee Collection',
      description: generateDescription(artwork.artwork),
      curatorNote: generateCuratorNote(artwork.artwork?.sayuType, artwork.artwork)
    });
  }
  
  return artworks;
}

/**
 * 유형별 작품 필터링 및 큐레이션
 */
export function getArtworksForUserType(userType: string, limit: number = 50): CloudinaryArtwork[] {
  const allArtworks = loadAllCloudinaryArtworks();
  
  // 유형별 선호 작가와 스타일
  const typePreferences: Record<string, { artists: string[], keywords: string[] }> = {
    'LAEF': { 
      artists: ['Vincent van Gogh', 'Edvard Munch', 'Paul Gauguin'],
      keywords: ['expressionism', 'emotion', 'vibrant', 'movement']
    },
    'LAEC': {
      artists: ['Henri Matisse', 'Odilon Redon', 'Gustav Klimt'],
      keywords: ['symbolic', 'decorative', 'emotional', 'color']
    },
    'LAMF': {
      artists: ['Vincent van Gogh', 'Paul Cézanne', 'Georges Seurat'],
      keywords: ['intuitive', 'depth', 'mysterious', 'structure']
    },
    'LAMC': {
      artists: ['Paul Signac', 'Henri-Edmond Cross', 'Georges Seurat'],
      keywords: ['systematic', 'pattern', 'philosophical', 'precise']
    },
    'LREF': {
      artists: ['Camille Pissarro', 'Claude Monet', 'Alfred Sisley'],
      keywords: ['landscape', 'observation', 'natural', 'quiet']
    },
    'LREC': {
      artists: ['Pierre Bonnard', 'Berthe Morisot', 'Mary Cassatt'],
      keywords: ['delicate', 'intimate', 'sensitive', 'detail']
    },
    'LRMF': {
      artists: ['Gustave Caillebotte', 'Edgar Degas', 'Jean-François Millet'],
      keywords: ['observation', 'meaning', 'realistic', 'thoughtful']
    },
    'LRMC': {
      artists: ['Paul Cézanne', 'Georges Seurat', 'Camille Pissarro'],
      keywords: ['structured', 'analytical', 'systematic', 'study']
    },
    'SAEF': {
      artists: ['Pierre-Auguste Renoir', 'Claude Monet', 'Berthe Morisot'],
      keywords: ['joyful', 'light', 'emotional', 'vibrant']
    },
    'SAEC': {
      artists: ['Henri Matisse', 'Pierre Bonnard', 'Raoul Dufy'],
      keywords: ['harmony', 'balance', 'emotional', 'decorative']
    },
    'SAMF': {
      artists: ['Paul Gauguin', 'Odilon Redon', 'Gustave Moreau'],
      keywords: ['symbolic', 'meaning', 'spiritual', 'narrative']
    },
    'SAMC': {
      artists: ['Georges Seurat', 'Paul Signac', 'Henri-Edmond Cross'],
      keywords: ['systematic', 'structure', 'wisdom', 'pattern']
    },
    'SREF': {
      artists: ['Pierre-Auguste Renoir', 'Claude Monet', 'Camille Pissarro'],
      keywords: ['friendly', 'warm', 'natural', 'comfortable']
    },
    'SREC': {
      artists: ['Berthe Morisot', 'Mary Cassatt', 'Eva Gonzalès'],
      keywords: ['careful', 'harmony', 'detail', 'gentle']
    },
    'SRMF': {
      artists: ['Jean-François Millet', 'Gustave Courbet', 'Honoré Daumier'],
      keywords: ['meaningful', 'wise', 'narrative', 'guiding']
    },
    'SRMC': {
      artists: ['Paul Cézanne', 'Georges Seurat', 'Edgar Degas'],
      keywords: ['master', 'systematic', 'clear', 'educational']
    }
  };
  
  const prefs = typePreferences[userType] || { artists: [], keywords: [] };
  
  // 점수 계산
  const scoredArtworks = allArtworks.map(artwork => {
    let score = 50; // 기본 점수
    
    // 작가 매칭
    if (prefs.artists.some(artist => 
      artwork.artist?.toLowerCase().includes(artist.toLowerCase())
    )) {
      score += 30;
    }
    
    // 키워드 매칭
    const textToSearch = `${artwork.title} ${artwork.description} ${artwork.style}`.toLowerCase();
    prefs.keywords.forEach(keyword => {
      if (textToSearch.includes(keyword)) {
        score += 10;
      }
    });
    
    // 이미 sayuType이 지정된 경우 보너스
    if (artwork.sayuType === userType) {
      score += 20;
    }
    
    // 랜덤 요소 추가 (다양성)
    score += Math.random() * 20;
    
    return { ...artwork, matchPercent: Math.min(score, 98) };
  });
  
  // 점수 순으로 정렬하고 상위 N개 선택
  return scoredArtworks
    .sort((a, b) => (b.matchPercent || 0) - (a.matchPercent || 0))
    .slice(0, limit);
}

/**
 * 랜덤 작품 선택
 */
export function getRandomArtworks(count: number = 20): CloudinaryArtwork[] {
  const allArtworks = loadAllCloudinaryArtworks();
  const shuffled = allArtworks.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// Helper functions
function formatTitle(key: string): string {
  return key
    .replace(/-/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

function extractYear(title?: string): string {
  if (!title) return '';
  const match = title.match(/\((\d{4})\)/);
  return match ? match[1] : '';
}

function detectStyleFromArtist(artist?: string): string {
  if (!artist) return 'Unknown';
  
  const artistStyles: Record<string, string> = {
    'Vincent van Gogh': 'Post-Impressionism',
    'Claude Monet': 'Impressionism',
    'Pierre-Auguste Renoir': 'Impressionism',
    'Paul Cézanne': 'Post-Impressionism',
    'Henri Matisse': 'Fauvism',
    'Edvard Munch': 'Expressionism',
    'Paul Gauguin': 'Post-Impressionism',
    'Georges Seurat': 'Neo-Impressionism',
    'Camille Pissarro': 'Impressionism',
    'Edgar Degas': 'Impressionism',
    'Alphonse Mucha': 'Art Nouveau',
    'Gustav Klimt': 'Art Nouveau',
    'Odilon Redon': 'Symbolism'
  };
  
  for (const [name, style] of Object.entries(artistStyles)) {
    if (artist.includes(name)) {
      return style;
    }
  }
  
  return 'Modern Art';
}

function generateDescription(artwork: any): string {
  const descriptions = [
    '화면 전체에 퍼지는 빛과 색채의 조화가 인상적인 작품입니다.',
    '섬세한 붓터치와 대담한 구성이 특징적인 걸작입니다.',
    '자연과 인간의 관계를 깊이 있게 탐구한 작품입니다.',
    '일상의 순간을 예술로 승화시킨 감동적인 작품입니다.',
    '강렬한 감정과 역동적인 움직임이 돋보이는 작품입니다.'
  ];
  
  return descriptions[Math.floor(Math.random() * descriptions.length)];
}

function generateCuratorNote(userType?: string, artwork?: any): string {
  const notes: Record<string, string[]> = {
    'LAEF': [
      '자유로운 붓질과 강렬한 색채가 여우의 방랑 정신과 공명합니다.',
      '예측할 수 없는 구성이 당신의 모험적 감성을 자극합니다.',
      '감정의 자유로운 표현이 여우의 독립적 영혼과 만납니다.'
    ],
    'SREF': [
      '따뜻한 색감과 친근한 주제가 강아지의 공감 능력과 어우러집니다.',
      '편안하고 조화로운 구성이 당신의 따뜻한 마음과 만납니다.',
      '일상의 아름다움이 당신의 친근한 감성과 공명합니다.'
    ]
    // ... 더 많은 유형별 노트
  };
  
  const typeNotes = notes[userType || ''] || [
    '이 작품의 특별한 에너지가 당신의 감성과 만납니다.',
    '깊이 있는 표현이 당신의 내면과 공명합니다.',
    '독특한 시각이 당신의 관점을 확장시킵니다.'
  ];
  
  return typeNotes[Math.floor(Math.random() * typeNotes.length)];
}

/**
 * 검색 기능
 */
export function searchArtworks(query: string): CloudinaryArtwork[] {
  const allArtworks = loadAllCloudinaryArtworks();
  const searchTerm = query.toLowerCase();
  
  return allArtworks.filter(artwork => 
    artwork.title?.toLowerCase().includes(searchTerm) ||
    artwork.artist?.toLowerCase().includes(searchTerm) ||
    artwork.style?.toLowerCase().includes(searchTerm)
  );
}

/**
 * 배치 로딩 (성능 최적화)
 */
export async function loadArtworksBatch(
  start: number = 0, 
  limit: number = 50
): Promise<CloudinaryArtwork[]> {
  const allArtworks = loadAllCloudinaryArtworks();
  return allArtworks.slice(start, start + limit);
}