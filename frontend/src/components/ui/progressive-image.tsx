'use client';

import React, { useState, useEffect, useRef } from 'react';
import OptimizedImage from './optimized-image';

interface ProgressiveImageProps {
  /** 저화질 이미지 URL (빠른 로딩용) */
  lowQualitySrc: string;
  /** 고화질 이미지 URL (메인) */
  highQualitySrc: string;
  /** 대체 텍스트 */
  alt: string;
  /** 이미지 크기 */
  width: number;
  height: number;
  /** CSS 클래스 */
  className?: string;
  /** 로딩 우선순위 */
  priority?: boolean;
  /** 개성 동물 이미지 여부 */
  isPersonalityAnimal?: boolean;
}

/**
 * 점진적 이미지 로딩 컴포넌트
 * 
 * 작동 방식:
 * 1. 저화질 이미지를 즉시 표시
 * 2. 고화질 이미지를 백그라운드에서 로딩
 * 3. 로딩 완료 시 부드러운 전환 효과로 교체
 * 
 * 사용 시나리오:
 * - 매우 느린 네트워크 환경
 * - 대용량 일러스트레이션 이미지
 * - 사용자 경험을 극대화해야 하는 핵심 이미지들
 */
const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  lowQualitySrc,
  highQualitySrc,
  alt,
  width,
  height,
  className = '',
  priority = false,
  isPersonalityAnimal = false
}) => {
  const [isHighQualityLoaded, setIsHighQualityLoaded] = useState(false);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer로 뷰포트 진입 감지
  useEffect(() => {
    if (!containerRef.current || priority) {
      setIsIntersecting(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px' // 뷰포트 50px 전에 미리 로딩 시작
      }
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [priority]);

  // 고화질 이미지 프리로딩
  useEffect(() => {
    if (!isIntersecting) return;

    const img = new Image();
    img.onload = () => setIsHighQualityLoaded(true);
    img.onerror = () => console.warn('High quality image failed to load:', highQualitySrc);
    img.src = highQualitySrc;
  }, [isIntersecting, highQualitySrc]);

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {/* 저화질 이미지 (즉시 표시) */}
      <OptimizedImage
        src={lowQualitySrc}
        alt={alt}
        width={width}
        height={height}
        className={`absolute inset-0 transition-opacity duration-500 ${
          isHighQualityLoaded ? 'opacity-0' : 'opacity-100'
        }`}
        quality={30} // 매우 낮은 품질로 빠른 로딩
        priority={priority}
        isPersonalityAnimal={isPersonalityAnimal}
        placeholder="blur"
      />

      {/* 고화질 이미지 (로딩 완료 시 표시) */}
      {isIntersecting && (
        <OptimizedImage
          src={highQualitySrc}
          alt={alt}
          width={width}
          height={height}
          className={`absolute inset-0 transition-opacity duration-500 ${
            isHighQualityLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          quality={isPersonalityAnimal ? 85 : 75}
          priority={priority}
          isPersonalityAnimal={isPersonalityAnimal}
          onLoad={() => setIsHighQualityLoaded(true)}
        />
      )}

      {/* 로딩 인디케이터 */}
      {!isHighQualityLoaded && isIntersecting && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin opacity-50" />
        </div>
      )}
    </div>
  );
};

export default ProgressiveImage;

/**
 * 개성 동물 전용 점진적 이미지 로딩 컴포넌트
 * personality-animals 데이터와 통합
 */
interface ProgressivePersonalityAnimalImageProps {
  animal: {
    image: string;
    avatar?: string;
    illustration?: string;
    name: string;
  };
  type: 'main' | 'avatar' | 'illustration';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  priority?: boolean;
}

export const ProgressivePersonalityAnimalImage: React.FC<ProgressivePersonalityAnimalImageProps> = ({
  animal,
  type = 'main',
  size = 'md',
  className = '',
  priority = false
}) => {
  const sizeMap = {
    sm: { width: 64, height: 64 },
    md: { width: 128, height: 128 },
    lg: { width: 200, height: 200 },
    xl: { width: 300, height: 300 }
  };

  const { width, height } = sizeMap[size];
  
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

  const highQualitySrc = getImageSrc();
  // 저화질 버전은 query parameter로 생성 (Next.js Image Optimization)
  const lowQualitySrc = `/_next/image?url=${encodeURIComponent(highQualitySrc)}&w=${Math.floor(width / 2)}&q=20`;

  return (
    <ProgressiveImage
      lowQualitySrc={lowQualitySrc}
      highQualitySrc={highQualitySrc}
      alt={`${animal.name} ${type} image`}
      width={width}
      height={height}
      className={`personality-animal-${type} ${className}`}
      priority={priority}
      isPersonalityAnimal={true}
    />
  );
};