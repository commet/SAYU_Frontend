import { NextRequest, NextResponse } from 'next/server';
import cloudinaryData from '@/../../artvee-crawler/data/cloudinary-urls.json';
import famousArtists from '@/../../artvee-crawler/data/famous-artists-artworks.json';

// 캐시 설정
let cachedArtworks: any[] | null = null;
let cacheTime = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1시간

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userType = searchParams.get('userType') || 'DEFAULT';
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = parseInt(searchParams.get('offset') || '0');
  const random = searchParams.get('random') === 'true';

  try {
    // 캐시 확인
    if (!cachedArtworks || Date.now() - cacheTime > CACHE_DURATION) {
      cachedArtworks = processArtworks();
      cacheTime = Date.now();
    }

    // 유형별 필터링
    let filteredArtworks = filterByUserType(cachedArtworks, userType);
    
    // 랜덤 셔플
    if (random) {
      filteredArtworks = shuffleArray(filteredArtworks);
    }
    
    // 페이지네이션
    const paginatedArtworks = filteredArtworks.slice(offset, offset + limit);
    
    return NextResponse.json({
      success: true,
      data: paginatedArtworks,
      total: filteredArtworks.length,
      userType,
      limit,
      offset
    });
    
  } catch (error) {
    console.error('Error fetching artworks:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch artworks' },
      { status: 500 }
    );
  }
}

function processArtworks() {
  const artworks = [];
  
  // Cloudinary URLs 처리
  for (const [id, data] of Object.entries(cloudinaryData as any)) {
    const artwork = data as any;
    
    // Famous artists 데이터와 매칭
    const artistData = famousArtists.find((fa: any) => fa.artveeId === id);
    
    artworks.push({
      id,
      title: artwork.artwork?.title || formatTitle(id),
      artist: artwork.artwork?.artist || artistData?.artist || 'Unknown Artist',
      year: extractYear(artwork.artwork?.title),
      // thumbnail을 먼저 표시하고, full 이미지는 lazy loading
      imageUrl: artwork.thumbnail?.url || artwork.thumbnail?.secure_url || artwork.full?.url || artwork.full?.secure_url,
      thumbnail: artwork.thumbnail?.url || artwork.thumbnail?.secure_url,
      fullImage: artwork.full?.url || artwork.full?.secure_url,
      width: artwork.full?.width,
      height: artwork.full?.height,
      aspectRatio: artwork.full?.width && artwork.full?.height 
        ? artwork.full.width / artwork.full.height 
        : 1,
      sayuType: artwork.artwork?.sayuType || artistData?.sayuType,
      style: detectStyle(artwork.artwork?.artist),
      museum: 'Artvee Collection',
      description: generateDescription(artwork, artistData),
      curatorNote: generateCuratorNote(artwork.artwork?.sayuType, artwork, artistData),
      matchPercent: 75 + Math.floor(Math.random() * 20),
      tags: extractTags(artwork, artistData)
    });
  }
  
  return artworks;
}

function filterByUserType(artworks: any[], userType: string) {
  // 유형별 선호도 매핑
  const preferences: Record<string, { artists: string[], styles: string[], tags: string[] }> = {
    'LAEF': {
      artists: ['Vincent van Gogh', 'Edvard Munch', 'Paul Gauguin'],
      styles: ['Post-Impressionism', 'Expressionism'],
      tags: ['emotional', 'vibrant', 'expressive', 'freedom']
    },
    'LAEC': {
      artists: ['Henri Matisse', 'Gustav Klimt', 'Odilon Redon'],
      styles: ['Fauvism', 'Symbolism', 'Art Nouveau'],
      tags: ['decorative', 'symbolic', 'emotional', 'curator']
    },
    'LAMF': {
      artists: ['Paul Cézanne', 'Georges Seurat', 'Vincent van Gogh'],
      styles: ['Post-Impressionism', 'Neo-Impressionism'],
      tags: ['intuitive', 'structured', 'depth', 'exploration']
    },
    'LAMC': {
      artists: ['Georges Seurat', 'Paul Signac', 'Piet Mondrian'],
      styles: ['Neo-Impressionism', 'Abstract'],
      tags: ['systematic', 'philosophical', 'pattern', 'structure']
    },
    'LREF': {
      artists: ['Camille Pissarro', 'Claude Monet', 'Alfred Sisley'],
      styles: ['Impressionism'],
      tags: ['observation', 'nature', 'quiet', 'solitary']
    },
    'LREC': {
      artists: ['Berthe Morisot', 'Mary Cassatt', 'Pierre Bonnard'],
      styles: ['Impressionism', 'Post-Impressionism'],
      tags: ['delicate', 'intimate', 'sensitive', 'emotional']
    },
    'LRMF': {
      artists: ['Edgar Degas', 'Gustave Caillebotte', 'Jean-François Millet'],
      styles: ['Impressionism', 'Realism'],
      tags: ['observation', 'meaning', 'silent', 'contemplative']
    },
    'LRMC': {
      artists: ['Paul Cézanne', 'Georges Seurat', 'Johannes Vermeer'],
      styles: ['Post-Impressionism', 'Dutch Golden Age'],
      tags: ['academic', 'systematic', 'analytical', 'study']
    },
    'SAEF': {
      artists: ['Pierre-Auguste Renoir', 'Claude Monet', 'Henri Matisse'],
      styles: ['Impressionism', 'Fauvism'],
      tags: ['joyful', 'emotional', 'vibrant', 'social']
    },
    'SAEC': {
      artists: ['Henri Matisse', 'Pierre Bonnard', 'Raoul Dufy'],
      styles: ['Fauvism', 'Post-Impressionism'],
      tags: ['harmony', 'emotional', 'balance', 'social']
    },
    'SAMF': {
      artists: ['Paul Gauguin', 'Odilon Redon', 'Gustave Moreau'],
      styles: ['Post-Impressionism', 'Symbolism'],
      tags: ['meaning', 'symbolic', 'narrative', 'spiritual']
    },
    'SAMC': {
      artists: ['Georges Seurat', 'Paul Signac', 'Wassily Kandinsky'],
      styles: ['Neo-Impressionism', 'Abstract'],
      tags: ['systematic', 'wisdom', 'structure', 'architectural']
    },
    'SREF': {
      artists: ['Pierre-Auguste Renoir', 'Claude Monet', 'Camille Pissarro'],
      styles: ['Impressionism'],
      tags: ['friendly', 'warm', 'empathetic', 'comfortable']
    },
    'SREC': {
      artists: ['Berthe Morisot', 'Mary Cassatt', 'Eva Gonzalès'],
      styles: ['Impressionism'],
      tags: ['careful', 'harmonious', 'detailed', 'gentle']
    },
    'SRMF': {
      artists: ['Jean-François Millet', 'Gustave Courbet', 'Honoré Daumier'],
      styles: ['Realism'],
      tags: ['wise', 'meaningful', 'guiding', 'narrative']
    },
    'SRMC': {
      artists: ['Johannes Vermeer', 'Jan van Eyck', 'Pieter Bruegel'],
      styles: ['Dutch Golden Age', 'Northern Renaissance'],
      tags: ['master', 'systematic', 'educational', 'clear']
    }
  };
  
  const prefs = preferences[userType];
  if (!prefs) return artworks;
  
  // 점수 계산 및 정렬
  const scoredArtworks = artworks.map(artwork => {
    let score = 50;
    
    // 이미 sayuType이 일치하면 높은 점수
    if (artwork.sayuType === userType) {
      score += 30;
    }
    
    // 선호 작가 매칭
    if (prefs.artists.some(artist => 
      artwork.artist?.toLowerCase().includes(artist.toLowerCase())
    )) {
      score += 25;
    }
    
    // 선호 스타일 매칭
    if (prefs.styles.some(style => 
      artwork.style?.toLowerCase().includes(style.toLowerCase())
    )) {
      score += 20;
    }
    
    // 태그 매칭
    const artworkTags = artwork.tags || [];
    prefs.tags.forEach(tag => {
      if (artworkTags.includes(tag)) {
        score += 5;
      }
    });
    
    return { ...artwork, matchScore: score };
  });
  
  // 점수순 정렬
  return scoredArtworks.sort((a, b) => b.matchScore - a.matchScore);
}

function formatTitle(id: string): string {
  return id
    .replace(/-/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

function extractYear(title?: string): string {
  if (!title) return '';
  const match = title.match(/\((\d{4})\)/);
  return match ? match[1] : '';
}

function detectStyle(artist?: string): string {
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
    'Gustav Klimt': 'Art Nouveau'
  };
  
  if (!artist) return 'Modern Art';
  
  for (const [name, style] of Object.entries(artistStyles)) {
    if (artist.includes(name)) {
      return style;
    }
  }
  
  return 'Modern Art';
}

function generateDescription(artwork: any, artistData: any): string {
  const descriptions = [
    '빛과 색채의 조화가 인상적인 작품으로, 작가의 독특한 시각이 돋보입니다.',
    '섬세한 붓터치와 대담한 구성이 만나 깊은 감동을 전달하는 걸작입니다.',
    '일상의 순간을 예술로 승화시킨 작품으로, 보는 이에게 평온함을 선사합니다.',
    '강렬한 감정과 역동적인 움직임이 화면 전체에 생생하게 표현되어 있습니다.',
    '자연과 인간의 관계를 깊이 있게 탐구한 작품으로, 철학적 사색을 불러일으킵니다.'
  ];
  
  return artistData?.description || descriptions[Math.floor(Math.random() * descriptions.length)];
}

function generateCuratorNote(userType: string, artwork: any, artistData: any): string {
  const notes: Record<string, string[]> = {
    'LAEF': [
      '자유로운 붓질과 대담한 색채가 여우의 독립적이고 모험적인 정신과 완벽하게 공명합니다.',
      '예측할 수 없는 구성과 감정의 자유로운 표현이 당신의 방랑자적 기질을 자극합니다.'
    ],
    'LAEC': [
      '섬세한 감정 표현과 상징적 요소들이 고양이의 예민한 감성과 큐레이터적 안목을 만족시킵니다.',
      '색채의 미묘한 조화와 숨겨진 의미들이 당신의 감성적 깊이와 어우러집니다.'
    ],
    'LAMF': [
      '직관적 구성과 깊이 있는 주제가 올빼미의 탐구적 정신과 철학적 사고를 자극합니다.',
      '표면 너머의 의미를 담은 이 작품이 당신의 직관적 통찰력과 만납니다.'
    ],
    'LAMC': [
      '체계적 구성과 철학적 깊이가 거북이의 사색적이고 분석적인 성향과 완벽히 조화됩니다.',
      '패턴과 구조 속에 담긴 우주적 질서가 당신의 고독한 철학과 공명합니다.'
    ],
    'SREF': [
      '따뜻한 색감과 친근한 주제가 강아지의 공감 능력과 사교적 성향을 반영합니다.',
      '일상의 아름다움과 인간적 온기가 당신의 친근한 매력과 어우러집니다.'
    ]
  };
  
  const typeNotes = notes[userType] || [
    '이 작품의 특별한 에너지가 당신의 독특한 감성과 만나 새로운 영감을 선사합니다.',
    '깊이 있는 예술적 표현이 당신의 내면과 공명하며 의미 있는 대화를 시작합니다.'
  ];
  
  return typeNotes[Math.floor(Math.random() * typeNotes.length)];
}

function extractTags(artwork: any, artistData: any): string[] {
  const tags = [];
  
  // 작가 기반 태그
  if (artwork.artwork?.artist) {
    const artist = artwork.artwork.artist.toLowerCase();
    if (artist.includes('van gogh')) tags.push('expressive', 'emotional', 'vibrant');
    if (artist.includes('monet')) tags.push('impressionistic', 'light', 'nature');
    if (artist.includes('renoir')) tags.push('joyful', 'warm', 'social');
    if (artist.includes('matisse')) tags.push('colorful', 'decorative', 'bold');
  }
  
  // 제목 기반 태그
  if (artwork.artwork?.title) {
    const title = artwork.artwork.title.toLowerCase();
    if (title.includes('night')) tags.push('nocturnal', 'mysterious');
    if (title.includes('garden')) tags.push('nature', 'peaceful');
    if (title.includes('portrait')) tags.push('human', 'intimate');
    if (title.includes('landscape')) tags.push('scenic', 'vast');
  }
  
  return [...new Set(tags)];
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}