/**
 * SAYU 이미지 최적화 유틸리티
 * 
 * 기능:
 * - 이미지 프리로딩 및 캐싱
 * - 반응형 이미지 URL 생성
 * - 성능 모니터링
 * - 메모리 효율성 관리
 */

// 이미지 프리로딩 캐시
const imageCache = new Set<string>();
const loadingPromises = new Map<string, Promise<void>>();

/**
 * 이미지 프리로딩 함수
 * @param src 이미지 소스 URL
 * @param priority 우선순위 (높을수록 먼저 로드)
 */
export const preloadImage = (src: string, priority: 'high' | 'low' = 'low'): Promise<void> => {
  // 이미 캐시된 이미지는 스킵
  if (imageCache.has(src)) {
    return Promise.resolve();
  }

  // 이미 로딩 중인 이미지는 기존 Promise 반환
  if (loadingPromises.has(src)) {
    return loadingPromises.get(src)!;
  }

  const loadPromise = new Promise<void>((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      imageCache.add(src);
      loadingPromises.delete(src);
      resolve();
    };
    
    img.onerror = () => {
      loadingPromises.delete(src);
      reject(new Error(`Failed to load image: ${src}`));
    };

    // 우선순위에 따른 로딩 전략
    if (priority === 'high') {
      img.fetchPriority = 'high';
    }
    
    img.src = src;
  });

  loadingPromises.set(src, loadPromise);
  return loadPromise;
};

/**
 * 개성 동물 이미지들 배치 프리로딩
 * 사용자가 퀴즈를 시작하기 전에 모든 결과 이미지들을 미리 로드
 */
export const preloadPersonalityAnimals = async (): Promise<void> => {
  // 동적 import로 번들 크기 최적화
  const { personalityAnimals } = await import('@/data/personality-animals');
  
  const imageUrls: string[] = [];
  
  // 모든 개성 동물 이미지 URL 수집
  Object.values(personalityAnimals).forEach(animal => {
    imageUrls.push(animal.image);
    if (animal.avatar) imageUrls.push(animal.avatar);
    if (animal.illustration) imageUrls.push(animal.illustration);
  });

  // 병렬 프리로딩 (동시 연결 수 제한)
  const CONCURRENT_LOADS = 4;
  for (let i = 0; i < imageUrls.length; i += CONCURRENT_LOADS) {
    const batch = imageUrls.slice(i, i + CONCURRENT_LOADS);
    await Promise.allSettled(
      batch.map(url => preloadImage(url, 'low'))
    );
  }
};

/**
 * 반응형 이미지 URL 생성 (Next.js Image loader와 호환)
 */
export const generateResponsiveImageUrl = (
  src: string,
  width: number,
  quality: number = 75
): string => {
  // 로컬 이미지의 경우 Next.js가 자동으로 최적화
  if (src.startsWith('/')) {
    return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality}`;
  }
  
  return src;
};

/**
 * 이미지 로딩 성능 모니터링
 */
export const measureImageLoadTime = async (src: string): Promise<number> => {
  const startTime = performance.now();
  
  try {
    await preloadImage(src, 'high');
    const endTime = performance.now();
    const loadTime = endTime - startTime;
    
    // 개발 환경에서만 로그 출력
    if (process.env.NODE_ENV === 'development') {
      console.log(`Image load time for ${src}: ${loadTime.toFixed(2)}ms`);
    }
    
    return loadTime;
  } catch (error) {
    console.error('Image load failed:', src, error);
    return -1;
  }
};

/**
 * 메모리 효율적인 이미지 캐시 정리
 * 사용하지 않는 이미지들을 캐시에서 제거
 */
export const cleanupImageCache = (keepUrls: string[] = []): void => {
  const keepSet = new Set(keepUrls);
  
  for (const url of imageCache) {
    if (!keepSet.has(url)) {
      imageCache.delete(url);
    }
  }
};

/**
 * 이미지 최적화 통계 수집
 */
export const getImageCacheStats = () => {
  return {
    cachedImages: imageCache.size,
    loadingImages: loadingPromises.size,
    cacheHitRate: imageCache.size > 0 ? 
      (imageCache.size / (imageCache.size + loadingPromises.size)) * 100 : 0
  };
};

/**
 * 배경 이미지 CSS 생성 (최적화된)
 * Tailwind CSS와 호환
 */
export const createOptimizedBackgroundImage = (
  src: string,
  options: {
    size?: 'cover' | 'contain' | 'auto';
    position?: string;
    repeat?: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y';
    quality?: number;
  } = {}
): React.CSSProperties => {
  const {
    size = 'cover',
    position = 'center',
    repeat = 'no-repeat',
    quality = 75
  } = options;

  return {
    backgroundImage: `url(${generateResponsiveImageUrl(src, 1920, quality)})`,
    backgroundSize: size,
    backgroundPosition: position,
    backgroundRepeat: repeat,
    // 성능 최적화를 위한 GPU 가속
    willChange: 'auto',
    backfaceVisibility: 'hidden',
  };
};

/**
 * WebP 지원 여부 확인
 */
export const supportsWebP = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  
  return canvas.toDataURL('image/webp').startsWith('data:image/webp');
};

/**
 * AVIF 지원 여부 확인
 */
export const supportsAVIF = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  
  try {
    return canvas.toDataURL('image/avif').startsWith('data:image/avif');
  } catch {
    return false;
  }
};

/**
 * 최적 이미지 포맷 결정
 */
export const getOptimalImageFormat = (): 'avif' | 'webp' | 'png' => {
  if (supportsAVIF()) return 'avif';
  if (supportsWebP()) return 'webp';
  return 'png';
};

/**
 * 이미지 압축 품질 자동 조정
 * 네트워크 속도와 기기 성능에 따라 동적 조정
 */
export const getAdaptiveImageQuality = (): number => {
  if (typeof navigator === 'undefined') return 75;
  
  // 네트워크 연결 상태 확인
  const connection = (navigator as any).connection;
  if (connection) {
    switch (connection.effectiveType) {
      case 'slow-2g':
      case '2g':
        return 50; // 저품질로 빠른 로딩
      case '3g':
        return 65; // 중간 품질
      case '4g':
      default:
        return 85; // 고품질
    }
  }
  
  return 75; // 기본값
};