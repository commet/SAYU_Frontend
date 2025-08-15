'use client';

import React from 'react';
import Image, { ImageProps } from 'next/image';

interface OptimizedImageProps extends Omit<ImageProps, 'src' | 'alt'> {
  src: string;
  alt: string;
  /** Image loading priority - 'high' for above-the-fold images */
  priority?: boolean;
  /** Quality setting (1-100) - defaults to 75 for optimal balance */
  quality?: number;
  /** Placeholder type for loading state */
  placeholder?: 'blur' | 'empty';
  /** Blur data URL for smooth loading transitions */
  blurDataURL?: string;
  /** Custom className for styling */
  className?: string;
  /** Error fallback image src */
  fallbackSrc?: string;
  /** Performance optimization for personality animal images */
  isPersonalityAnimal?: boolean;
}

/**
 * SAYU 최적화 이미지 컴포넌트
 * 
 * 기능:
 * - Next.js Image 최적화 (WebP/AVIF 변환, 반응형 크기)
 * - 지능형 로딩 (lazy loading with intersection observer)
 * - 성능별 품질 설정 (개성 동물 vs 일반 이미지)
 * - 에러 처리 및 폴백 이미지
 * - 로딩 플레이스홀더 효과
 */
const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  priority = false,
  quality,
  placeholder = 'empty',
  blurDataURL,
  className = '',
  fallbackSrc,
  isPersonalityAnimal = false,
  width,
  height,
  sizes,
  ...props
}) => {
  const [imageSrc, setImageSrc] = React.useState(src);
  const [imageError, setImageError] = React.useState(false);

  // 개성 동물 이미지의 경우 더 높은 품질 설정
  const optimizedQuality = quality || (isPersonalityAnimal ? 85 : 75);

  // 개성 동물 이미지의 경우 최적화된 sizes 설정
  const optimizedSizes = sizes || (isPersonalityAnimal 
    ? '(max-width: 640px) 120px, (max-width: 1024px) 200px, 300px'
    : '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
  );

  // 에러 처리
  const handleError = React.useCallback(() => {
    if (!imageError && fallbackSrc) {
      setImageSrc(fallbackSrc);
      setImageError(true);
    }
  }, [imageError, fallbackSrc]);

  // 기본 블러 플레이스홀더 (성능 최적화)
  const defaultBlurDataURL = isPersonalityAnimal
    ? "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyojm5yyYlXdvB+Pa/Q3Gf0D+ACFH/Z"
    : "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyojm5yyYlXdvB+Pa/Q3Gf0D+ACFH/Z";

  return (
    <Image
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      quality={optimizedQuality}
      priority={priority}
      placeholder={placeholder}
      blurDataURL={blurDataURL || defaultBlurDataURL}
      sizes={optimizedSizes}
      className={`transition-opacity duration-300 ${className}`}
      style={{
        objectFit: 'cover',
        ...props.style
      }}
      onError={handleError}
      // 성능 최적화를 위한 loading 전략
      loading={priority ? 'eager' : 'lazy'}
      // 개성 동물 이미지의 경우 더 적극적인 데이터 프리페칭
      fetchPriority={isPersonalityAnimal ? 'high' : 'auto'}
      {...props}
    />
  );
};

export default OptimizedImage;

/**
 * 개성 동물 전용 최적화 이미지 컴포넌트
 * 
 * 사용 예시:
 * <PersonalityAnimalImage 
 *   animal={personalityAnimals.LAEF} 
 *   type="main" // 'main' | 'avatar' | 'illustration'
 *   priority={true} // 첫 화면에 표시되는 경우
 * />
 */
interface PersonalityAnimalImageProps {
  animal: {
    image: string;
    avatar?: string;
    illustration?: string;
    name: string;
  };
  type: 'main' | 'avatar' | 'illustration';
  priority?: boolean;
  width?: number;
  height?: number;
  className?: string;
}

export const PersonalityAnimalImage: React.FC<PersonalityAnimalImageProps> = ({
  animal,
  type = 'main',
  priority = false,
  width,
  height,
  className = ''
}) => {
  const getImageSrc = () => {
    switch (type) {
      case 'avatar':
        return animal.avatar || animal.image;
      case 'illustration':
        return animal.illustration || animal.image;
      default:
        return animal.image;
    }
  };

  // 타입별 기본 크기 설정
  const getDefaultSize = () => {
    switch (type) {
      case 'avatar':
        return { width: 64, height: 64 };
      case 'illustration':
        return { width: 400, height: 400 };
      default:
        return { width: 200, height: 200 };
    }
  };

  const defaultSize = getDefaultSize();
  
  return (
    <OptimizedImage
      src={getImageSrc()}
      alt={`${animal.name} ${type} image`}
      width={width || defaultSize.width}
      height={height || defaultSize.height}
      priority={priority}
      isPersonalityAnimal={true}
      className={`personality-animal-${type} ${className}`}
      fallbackSrc="/images/personality-animals/fallback.png" // 폴백 이미지
      placeholder="blur"
    />
  );
};