import { useEffect, useCallback, useState } from 'react';
import { preloadImage, preloadPersonalityAnimals } from '@/lib/image-optimization';

/**
 * 이미지 프리로딩을 위한 React Hook
 * 
 * 사용 예시:
 * const { preloadImages, isPreloading, preloadedImages } = useImagePreloader();
 * 
 * // 특정 이미지들 프리로드
 * preloadImages(['/image1.png', '/image2.png'], 'high');
 * 
 * // 개성 동물 이미지들 전체 프리로드
 * useEffect(() => {
 *   preloadPersonalityAnimals();
 * }, []);
 */

interface UseImagePreloaderOptions {
  /** 자동으로 개성 동물 이미지들을 프리로드할지 여부 */
  autoPreloadPersonalityAnimals?: boolean;
  /** 프리로딩 시작 지연 시간 (ms) */
  delay?: number;
}

export function useImagePreloader(options: UseImagePreloaderOptions = {}) {
  const { autoPreloadPersonalityAnimals = false, delay = 0 } = options;
  
  const [isPreloading, setIsPreloading] = useState(false);
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(new Set());
  const [preloadError, setPreloadError] = useState<string | null>(null);

  // 개별 이미지들 프리로딩
  const preloadImages = useCallback(async (
    urls: string[],
    priority: 'high' | 'low' = 'low'
  ) => {
    setIsPreloading(true);
    setPreloadError(null);

    try {
      const results = await Promise.allSettled(
        urls.map(url => preloadImage(url, priority))
      );

      const successfullyLoaded = new Set<string>();
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successfullyLoaded.add(urls[index]);
        } else {
          console.warn(`Failed to preload image: ${urls[index]}`, result.reason);
        }
      });

      setPreloadedImages(prev => new Set([...prev, ...successfullyLoaded]));
    } catch (error) {
      console.error('Preloading failed:', error);
      setPreloadError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsPreloading(false);
    }
  }, []);

  // 개성 동물 이미지들 전체 프리로딩
  const preloadAllPersonalityAnimals = useCallback(async () => {
    setIsPreloading(true);
    setPreloadError(null);

    try {
      await preloadPersonalityAnimals();
      
      // 성공적으로 로드된 이미지들을 상태에 반영
      const { personalityAnimals } = await import('@/data/personality-animals');
      const urls: string[] = [];
      
      Object.values(personalityAnimals).forEach(animal => {
        urls.push(animal.image);
        if (animal.avatar) urls.push(animal.avatar);
        if (animal.illustration) urls.push(animal.illustration);
      });

      setPreloadedImages(prev => new Set([...prev, ...urls]));
    } catch (error) {
      console.error('Failed to preload personality animals:', error);
      setPreloadError(error instanceof Error ? error.message : 'Failed to preload');
    } finally {
      setIsPreloading(false);
    }
  }, []);

  // 자동 프리로딩 효과
  useEffect(() => {
    if (!autoPreloadPersonalityAnimals) return;

    const timer = setTimeout(() => {
      preloadAllPersonalityAnimals();
    }, delay);

    return () => clearTimeout(timer);
  }, [autoPreloadPersonalityAnimals, delay, preloadAllPersonalityAnimals]);

  return {
    preloadImages,
    preloadAllPersonalityAnimals,
    isPreloading,
    preloadedImages: Array.from(preloadedImages),
    preloadError,
    isImagePreloaded: useCallback(
      (url: string) => preloadedImages.has(url),
      [preloadedImages]
    )
  };
}

/**
 * 특정 개성 동물 타입의 이미지들을 프리로딩하는 Hook
 * 
 * 사용 예시:
 * usePersonalityAnimalPreloader('LAEF'); // 여우 이미지들만 프리로드
 */
export function usePersonalityAnimalPreloader(animalType?: string) {
  const { preloadImages, isPreloading, preloadedImages, preloadError } = useImagePreloader();

  const preloadAnimalImages = useCallback(async (type: string) => {
    try {
      const { personalityAnimals } = await import('@/data/personality-animals');
      const animal = personalityAnimals[type as keyof typeof personalityAnimals];
      
      if (!animal) {
        console.warn(`Unknown personality animal type: ${type}`);
        return;
      }

      const urls = [animal.image];
      if (animal.avatar) urls.push(animal.avatar);
      if (animal.illustration) urls.push(animal.illustration);

      await preloadImages(urls, 'high');
    } catch (error) {
      console.error('Failed to preload animal images:', error);
    }
  }, [preloadImages]);

  // 자동 프리로딩
  useEffect(() => {
    if (animalType) {
      preloadAnimalImages(animalType);
    }
  }, [animalType, preloadAnimalImages]);

  return {
    preloadAnimalImages,
    isPreloading,
    preloadedImages,
    preloadError
  };
}

/**
 * 퀴즈 진행 중 다음 단계 이미지들을 미리 로딩하는 Hook
 * 사용자 경험 향상을 위한 예측적 프리로딩
 */
export function useQuizImagePreloader(currentStep: number, totalSteps: number) {
  const { preloadAllPersonalityAnimals, isPreloading } = useImagePreloader();
  
  useEffect(() => {
    // 퀴즈 70% 진행 시점에서 결과 이미지들 프리로딩 시작
    const preloadThreshold = Math.floor(totalSteps * 0.7);
    
    if (currentStep >= preloadThreshold) {
      preloadAllPersonalityAnimals();
    }
  }, [currentStep, totalSteps, preloadAllPersonalityAnimals]);

  return { isPreloadingResults: isPreloading };
}