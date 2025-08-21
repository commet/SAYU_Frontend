/**
 * Cloudinary API Client
 * 1000개 이상의 Artvee 작품들을 동적으로 불러오기
 */

// Cloudinary 설정
const CLOUD_NAME = 'dkdzgpj3n';
const FOLDER_PATH = 'sayu/artvee-complete';

/**
 * Cloudinary List API를 사용하여 폴더의 모든 이미지 가져오기
 * Client-side에서 사용 가능한 방법
 */
export async function fetchCloudinaryArtworks() {
  try {
    // 방법 1: Cloudinary List API (Public Access)
    // 이 방법은 Cloudinary 설정에서 "List" 권한이 활성화되어 있어야 함
    const listUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/list/${FOLDER_PATH}.json`;
    
    const response = await fetch(listUrl);
    if (response.ok) {
      const data = await response.json();
      return parseCloudinaryList(data);
    }
    
    // 방법 2: Search API 사용 (더 유연함)
    // unsigned upload preset이 필요할 수 있음
    return await searchCloudinaryImages();
    
  } catch (error) {
    console.error('Cloudinary fetch error:', error);
    // Fallback to cached list
    return getCachedArtworksList();
  }
}

/**
 * Cloudinary Search API 사용
 */
async function searchCloudinaryImages() {
  // Search API endpoint
  const searchUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/resources/search`;
  
  const searchParams = {
    expression: `folder:${FOLDER_PATH}/*`,
    max_results: 500, // 한 번에 최대 500개
    sort_by: [{ public_id: 'asc' }]
  };
  
  try {
    const response = await fetch(searchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(searchParams)
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.resources.map(transformCloudinaryResource);
    }
  } catch (error) {
    console.error('Search API error:', error);
  }
  
  return [];
}

/**
 * Cloudinary 리소스를 우리 포맷으로 변환
 */
function transformCloudinaryResource(resource: any) {
  // 파일명에서 작품 정보 추출
  // 예: artvee-starry-night-van-gogh.jpg
  const filename = resource.public_id.split('/').pop();
  const parts = filename.replace('artvee-', '').replace(/\.(jpg|png)$/, '').split('-');
  
  // 작품 제목과 작가 추정
  const titleParts = [];
  const artistParts = [];
  let isArtist = false;
  
  for (const part of parts) {
    // 일반적으로 van, de, della 등이 나오면 작가명 시작
    if (['van', 'de', 'della', 'von', 'da'].includes(part.toLowerCase())) {
      isArtist = true;
    }
    
    if (isArtist) {
      artistParts.push(part);
    } else {
      titleParts.push(part);
    }
  }
  
  const title = titleParts.map(w => 
    w.charAt(0).toUpperCase() + w.slice(1)
  ).join(' ');
  
  const artist = artistParts.length > 0 
    ? artistParts.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : 'Unknown Artist';
  
  return {
    id: resource.public_id,
    title: title || 'Untitled',
    artist: artist,
    year: extractYear(resource.context) || '19th Century',
    imageUrl: resource.secure_url || resource.url,
    thumbnail: getThumbnailUrl(resource.public_id),
    style: extractStyle(resource.context) || 'Impressionism',
    museum: 'Artvee Collection',
    width: resource.width,
    height: resource.height,
    aspectRatio: resource.width / resource.height
  };
}

/**
 * 썸네일 URL 생성 (성능 최적화)
 */
function getThumbnailUrl(publicId: string): string {
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/c_fill,w_400,h_400,q_auto,f_auto/${publicId}`;
}

/**
 * 고품질 이미지 URL 생성
 */
export function getOptimizedImageUrl(publicId: string, options?: {
  width?: number;
  height?: number;
  quality?: number;
}) {
  const { width = 800, height = 800, quality = 'auto' } = options || {};
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/c_fill,w_${width},h_${height},q_${quality},f_auto/${publicId}`;
}

/**
 * 리스트 파싱
 */
function parseCloudinaryList(data: any) {
  if (!data.resources) return [];
  return data.resources.map(transformCloudinaryResource);
}

/**
 * 컨텍스트에서 연도 추출
 */
function extractYear(context: any): string {
  if (!context) return '';
  // context.custom.year 또는 context.year 체크
  return context.custom?.year || context.year || '';
}

/**
 * 컨텍스트에서 스타일 추출
 */
function extractStyle(context: any): string {
  if (!context) return '';
  return context.custom?.style || context.style || '';
}

/**
 * 캐시된 작품 목록 (Fallback)
 * 실제로 Cloudinary에서 export한 JSON 파일을 여기에 넣을 수 있습니다
 */
function getCachedArtworksList() {
  // 기존 cloudinary-artworks.ts의 데이터를 임시로 사용
  return require('../data/cloudinary-artworks').CLOUDINARY_FAMOUS_ARTWORKS;
}

/**
 * 작품을 유형별로 필터링하고 큐레이션
 */
export function curateArtworksForType(allArtworks: any[], userType: string) {
  // 유형별 선호 스타일과 작가
  const typePreferences: Record<string, { styles: string[], artists: string[] }> = {
    'LAEF': { 
      styles: ['Post-Impressionism', 'Expressionism', 'Abstract'], 
      artists: ['van Gogh', 'Kandinsky', 'Pollock'] 
    },
    'SREF': { 
      styles: ['Impressionism', 'Realism'], 
      artists: ['Monet', 'Renoir', 'Degas'] 
    },
    'LAMC': { 
      styles: ['Renaissance', 'Baroque', 'Neoclassicism'], 
      artists: ['Leonardo', 'Rembrandt', 'Vermeer'] 
    },
    // ... 더 많은 유형별 선호도
  };
  
  const prefs = typePreferences[userType] || { styles: [], artists: [] };
  
  // 1차: 선호 스타일/작가 우선
  const preferred = allArtworks.filter(artwork => 
    prefs.styles.some(style => artwork.style?.includes(style)) ||
    prefs.artists.some(artist => artwork.artist?.includes(artist))
  );
  
  // 2차: 랜덤 선택으로 다양성 추가
  const others = allArtworks.filter(artwork => !preferred.includes(artwork));
  const randomOthers = others.sort(() => Math.random() - 0.5).slice(0, 20);
  
  // 최종: 선호 작품 + 랜덤 작품 조합
  return [...preferred.slice(0, 30), ...randomOthers].slice(0, 50);
}

/**
 * 배치로 작품 가져오기 (페이지네이션)
 */
export async function fetchArtworksBatch(nextCursor?: string) {
  const searchUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/resources/search`;
  
  const searchParams = {
    expression: `folder:${FOLDER_PATH}/*`,
    max_results: 100,
    next_cursor: nextCursor,
    sort_by: [{ public_id: 'asc' }]
  };
  
  try {
    const response = await fetch(searchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(searchParams)
    });
    
    if (response.ok) {
      const data = await response.json();
      return {
        resources: data.resources.map(transformCloudinaryResource),
        nextCursor: data.next_cursor
      };
    }
  } catch (error) {
    console.error('Batch fetch error:', error);
  }
  
  return { resources: [], nextCursor: null };
}