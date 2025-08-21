import { NextResponse } from 'next/server';

// Cloudinary Admin API를 사용한 서버사이드 구현
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'dkdzgpj3n';
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get('cursor');
  const userType = searchParams.get('userType') || 'DEFAULT';
  
  try {
    // 방법 1: Cloudinary Admin API 사용 (API Key 필요)
    if (CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
      const auth = Buffer.from(`${CLOUDINARY_API_KEY}:${CLOUDINARY_API_SECRET}`).toString('base64');
      
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/resources/image?prefix=sayu/artvee-complete&max_results=100${cursor ? `&next_cursor=${cursor}` : ''}`,
        {
          headers: {
            'Authorization': `Basic ${auth}`
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        return NextResponse.json({
          artworks: transformCloudinaryData(data.resources, userType),
          nextCursor: data.next_cursor
        });
      }
    }
    
    // 방법 2: 사전에 캐시된 목록 사용
    const cachedArtworks = await getCachedArtworksList();
    return NextResponse.json({
      artworks: cachedArtworks.slice(0, 100),
      nextCursor: null
    });
    
  } catch (error) {
    console.error('Cloudinary API error:', error);
    return NextResponse.json({ error: 'Failed to fetch artworks' }, { status: 500 });
  }
}

function transformCloudinaryData(resources: any[], userType: string) {
  return resources.map(resource => {
    const publicId = resource.public_id;
    const filename = publicId.split('/').pop();
    
    // 파일명 파싱 로직
    const cleanName = filename.replace('artvee-', '').replace(/\.(jpg|png)$/, '');
    const parts = cleanName.split('-');
    
    // 작품 정보 추출
    const artwork = {
      id: publicId,
      title: formatTitle(parts),
      artist: extractArtist(parts),
      year: resource.context?.custom?.year || estimateYear(cleanName),
      imageUrl: resource.secure_url,
      thumbnail: getThumbnailUrl(publicId),
      style: resource.context?.custom?.style || detectStyle(cleanName),
      museum: 'Artvee Collection',
      description: generateDescription(parts),
      curatorNote: generateCuratorNote(userType, parts),
      matchPercent: calculateMatchPercent(userType, cleanName)
    };
    
    return artwork;
  });
}

function formatTitle(parts: string[]): string {
  // 제목 포맷팅 로직
  const titleWords = [];
  for (const part of parts) {
    if (isArtistIndicator(part)) break;
    titleWords.push(part.charAt(0).toUpperCase() + part.slice(1));
  }
  return titleWords.join(' ') || 'Untitled';
}

function extractArtist(parts: string[]): string {
  // 작가명 추출 로직
  const artistIndicators = ['van', 'de', 'della', 'von', 'da', 'del'];
  let artistStarted = false;
  const artistWords = [];
  
  for (const part of parts) {
    if (artistIndicators.includes(part.toLowerCase()) || artistStarted) {
      artistStarted = true;
      artistWords.push(part.charAt(0).toUpperCase() + part.slice(1));
    }
  }
  
  return artistWords.join(' ') || 'Unknown Artist';
}

function isArtistIndicator(word: string): boolean {
  return ['van', 'de', 'della', 'von', 'da', 'del'].includes(word.toLowerCase());
}

function estimateYear(filename: string): string {
  // 파일명에서 연도 추정
  const yearMatch = filename.match(/\d{4}/);
  if (yearMatch) return yearMatch[0];
  
  // 스타일로 연도 추정
  if (filename.includes('renaissance')) return '1400-1600';
  if (filename.includes('baroque')) return '1600-1750';
  if (filename.includes('impressionism')) return '1860-1890';
  if (filename.includes('modern')) return '1900-1950';
  
  return '19th Century';
}

function detectStyle(filename: string): string {
  // 파일명에서 스타일 감지
  const styles = {
    'impressionism': 'Impressionism',
    'expressionism': 'Expressionism',
    'abstract': 'Abstract',
    'realism': 'Realism',
    'baroque': 'Baroque',
    'renaissance': 'Renaissance',
    'romanticism': 'Romanticism',
    'surrealism': 'Surrealism',
    'cubism': 'Cubism',
    'fauvism': 'Fauvism'
  };
  
  for (const [key, value] of Object.entries(styles)) {
    if (filename.toLowerCase().includes(key)) {
      return value;
    }
  }
  
  return 'Post-Impressionism'; // 기본값
}

function generateDescription(parts: string[]): string {
  // 작품 설명 자동 생성
  const title = formatTitle(parts);
  const artist = extractArtist(parts);
  
  const descriptions = [
    `${artist}의 대표작 중 하나로, 독특한 색채와 구성이 돋보입니다.`,
    `화면 전체에 퍼지는 빛과 그림자의 조화가 인상적인 작품입니다.`,
    `섬세한 붓터치와 대담한 색채 대비가 특징적인 걸작입니다.`,
    `자연과 인간의 조화로운 관계를 표현한 서정적 작품입니다.`,
    `깊이 있는 공간감과 역동적인 구성이 시선을 사로잡습니다.`
  ];
  
  return descriptions[Math.floor(Math.random() * descriptions.length)];
}

function generateCuratorNote(userType: string, parts: string[]): string {
  // 유형별 큐레이터 노트 생성
  const notes: Record<string, string[]> = {
    'LAEF': [
      '자유로운 붓질과 대담한 색채가 여우의 방랑 정신과 공명합니다.',
      '형식에 얽매이지 않은 표현이 당신의 자유로운 영혼과 만납니다.',
      '예측할 수 없는 구성이 여우의 모험적 감성을 자극합니다.'
    ],
    'SREF': [
      '따뜻한 색감과 친근한 주제가 강아지의 공감 능력과 어우러집니다.',
      '편안하고 조화로운 구성이 당신의 따뜻한 마음과 만납니다.',
      '일상의 아름다움을 포착한 이 작품이 당신의 감성과 공명합니다.'
    ],
    'LAMC': [
      '체계적인 구성과 깊이 있는 주제가 거북이의 철학적 사고와 만납니다.',
      '숨겨진 의미와 상징이 당신의 분석적 시선을 끕니다.',
      '고요한 명상적 분위기가 당신의 내면과 조화를 이룹니다.'
    ],
    // ... 더 많은 유형별 노트
  };
  
  const typeNotes = notes[userType] || notes['DEFAULT'];
  return typeNotes[Math.floor(Math.random() * typeNotes.length)];
}

function calculateMatchPercent(userType: string, filename: string): number {
  // 유형별 매치 퍼센트 계산
  let baseScore = 75;
  
  // 유형별 선호 키워드
  const preferences: Record<string, string[]> = {
    'LAEF': ['abstract', 'expressionism', 'van-gogh', 'kandinsky'],
    'SREF': ['impressionism', 'monet', 'renoir', 'landscape'],
    'LAMC': ['renaissance', 'vermeer', 'detailed', 'symbolic'],
    // ...
  };
  
  const userPrefs = preferences[userType] || [];
  for (const pref of userPrefs) {
    if (filename.toLowerCase().includes(pref)) {
      baseScore += 5;
    }
  }
  
  return Math.min(baseScore, 98);
}

function getThumbnailUrl(publicId: string): string {
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/c_fill,w_400,h_400,q_auto,f_auto/${publicId}`;
}

async function getCachedArtworksList() {
  // Fallback: 기존 데이터 사용
  const { CLOUDINARY_FAMOUS_ARTWORKS } = await import('@/data/cloudinary-artworks');
  return CLOUDINARY_FAMOUS_ARTWORKS;
}