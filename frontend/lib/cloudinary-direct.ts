/**
 * Cloudinary Direct Access
 * 파일명 패턴을 알고 있을 때 직접 URL 생성
 */

const CLOUD_NAME = 'dkdzgpj3n';
const BASE_URL = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`;
const FOLDER = 'sayu/artvee-complete';

/**
 * Artvee 파일명 패턴으로 직접 URL 생성
 * 예상 패턴: artvee-[작품명]-[작가명].jpg
 */
export function generateCloudinaryUrls(count: number = 1000) {
  const artworks = [];
  
  // Artvee의 일반적인 작품 ID 패턴
  // 실제 업로드한 파일명 패턴에 맞게 수정 필요
  const patterns = [
    // 유명 작품들
    'starry-night-van-gogh',
    'sunflowers-van-gogh', 
    'water-lilies-monet',
    'impression-sunrise-monet',
    'dance-at-moulin-de-la-galette-renoir',
    'luncheon-of-the-boating-party-renoir',
    'the-kiss-klimt',
    'the-scream-munch',
    'girl-with-a-pearl-earring-vermeer',
    'the-great-wave-hokusai',
    // ... 더 많은 패턴
  ];
  
  // 숫자 기반 패턴 (artvee-001.jpg ~ artvee-1000.jpg)
  for (let i = 1; i <= count; i++) {
    const paddedNum = String(i).padStart(3, '0');
    artworks.push({
      id: `artvee-${paddedNum}`,
      url: `${BASE_URL}/${FOLDER}/artvee-${paddedNum}.jpg`,
      thumbnail: `${BASE_URL}/c_fill,w_400,h_400,q_auto,f_auto/${FOLDER}/artvee-${paddedNum}.jpg`
    });
  }
  
  return artworks;
}

/**
 * 실제 Cloudinary에 있는 파일 확인
 * 이미지 로드를 시도하여 존재 여부 확인
 */
export async function verifyCloudinaryImage(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * 배치로 이미지 존재 확인 후 유효한 것만 반환
 */
export async function fetchValidArtworks(urls: string[]): Promise<string[]> {
  const validUrls = [];
  
  // 병렬로 확인 (10개씩 배치)
  for (let i = 0; i < urls.length; i += 10) {
    const batch = urls.slice(i, i + 10);
    const results = await Promise.all(
      batch.map(url => verifyCloudinaryImage(url))
    );
    
    batch.forEach((url, index) => {
      if (results[index]) {
        validUrls.push(url);
      }
    });
  }
  
  return validUrls;
}

/**
 * Cloudinary 파일 목록 텍스트 파일에서 읽기
 * (만약 export한 목록이 있다면)
 */
export async function loadFromExportedList(): Promise<any[]> {
  try {
    const response = await fetch('/data/cloudinary-export.json');
    if (response.ok) {
      const data = await response.json();
      return data.map((item: any) => ({
        id: item.public_id,
        title: parseTitle(item.public_id),
        artist: parseArtist(item.public_id),
        year: item.context?.year || '19th Century',
        imageUrl: item.secure_url,
        thumbnail: getThumbnailUrl(item.public_id),
        style: item.context?.style || 'Unknown',
        museum: 'Artvee Collection'
      }));
    }
  } catch (error) {
    console.error('Failed to load exported list:', error);
  }
  return [];
}

function parseTitle(publicId: string): string {
  const filename = publicId.split('/').pop() || '';
  const clean = filename.replace('artvee-', '').replace(/\.\w+$/, '');
  const parts = clean.split('-');
  
  // 숫자만 있으면 "Artwork #숫자"
  if (/^\d+$/.test(clean)) {
    return `Artwork #${clean}`;
  }
  
  // 작가 지시자 전까지를 제목으로
  const titleParts = [];
  for (const part of parts) {
    if (['van', 'de', 'della', 'von', 'da'].includes(part.toLowerCase())) {
      break;
    }
    titleParts.push(part.charAt(0).toUpperCase() + part.slice(1));
  }
  
  return titleParts.join(' ') || 'Untitled';
}

function parseArtist(publicId: string): string {
  const filename = publicId.split('/').pop() || '';
  const clean = filename.replace('artvee-', '').replace(/\.\w+$/, '');
  const parts = clean.split('-');
  
  // 작가 지시자 찾기
  let artistStarted = false;
  const artistParts = [];
  
  for (const part of parts) {
    if (['van', 'de', 'della', 'von', 'da'].includes(part.toLowerCase())) {
      artistStarted = true;
    }
    if (artistStarted) {
      artistParts.push(part.charAt(0).toUpperCase() + part.slice(1));
    }
  }
  
  return artistParts.join(' ') || 'Unknown Artist';
}

function getThumbnailUrl(publicId: string): string {
  return `${BASE_URL}/c_fill,w_400,h_400,q_auto,f_auto/${publicId}`;
}