'use client';

import { useState, memo } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  sizes?: string;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
  isPersonalityAnimal?: boolean;
}

export const OptimizedImage = memo(function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className,
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  quality = 85,
  placeholder = 'empty',
  blurDataURL,
  onLoad,
  onError,
  isPersonalityAnimal = false,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = (error?: any) => {
    console.error('Image failed to load:', src);
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  // Generate a simple blur placeholder if none provided
  const defaultBlurDataURL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';

  if (hasError) {
    return (
      <div className={cn(
        'flex items-center justify-center bg-gray-100 text-gray-400',
        className
      )}>
        <span className="text-sm">Failed to load image</span>
      </div>
    );
  }

  // 동물 캐릭터 이미지의 경우 일반 img 태그 사용
  // Next.js Image 컴포넌트의 최적화 API가 프로덕션에서 400 에러를 발생시킴
  if (isPersonalityAnimal || src.includes('personality-animals')) {
    return (
      <div className="relative">
        <img
          src={src}
          alt={alt}
          className={cn(
            'transition-opacity duration-300',
            isLoading ? 'opacity-0' : 'opacity-100',
            className
          )}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
          style={{
            width: width ? `${width}px` : '100%',
            height: height ? `${height}px` : 'auto',
            objectFit: fill ? 'cover' : 'contain'
          }}
        />
        {isLoading && (
          <div className={cn(
            'absolute inset-0 flex items-center justify-center bg-gray-200 animate-pulse',
            className
          )}>
            <div className="w-8 h-8 bg-gray-300 rounded animate-pulse" />
          </div>
        )}
      </div>
    );
  }

  // 일반 이미지도 img 태그 사용 (프로덕션 이슈 해결)
  return (
    <div className="relative">
      <img
        src={src}
        alt={alt}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          className
        )}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? 'eager' : 'lazy'}
        style={{
          width: width ? `${width}px` : '100%',
          height: height ? `${height}px` : 'auto',
          objectFit: fill ? 'cover' : 'contain'
        }}
      />
      {isLoading && (
        <div className={cn(
          'absolute inset-0 flex items-center justify-center bg-gray-200 animate-pulse',
          className
        )}>
          <div className="w-8 h-8 bg-gray-300 rounded animate-pulse" />
        </div>
      )}
    </div>
  );
});

// Utility function to generate optimized Cloudinary URLs
export function getCloudinaryUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
    crop?: 'fill' | 'fit' | 'scale' | 'crop';
  } = {}
): string {
  const {
    width,
    height,
    quality = 85,
    format = 'auto',
    crop = 'fill'
  } = options;

  const baseUrl = 'https://res.cloudinary.com/dkdzgpj3n/image/upload/';
  
  const transformations = [
    'f_auto', // Auto format selection
    `q_${quality}`, // Quality
    format !== 'auto' && `f_${format}`,
    width && `w_${width}`,
    height && `h_${height}`,
    (width || height) && `c_${crop}`,
  ].filter(Boolean).join(',');

  return `${baseUrl}${transformations}/${publicId}`;
}

// Hook for responsive image sizes
export function useResponsiveImageSizes(
  breakpoints: { [key: string]: string } = {}
): string {
  const defaultBreakpoints = {
    sm: '100vw',
    md: '50vw',
    lg: '33vw',
    xl: '25vw',
    ...breakpoints
  };

  return Object.entries(defaultBreakpoints)
    .map(([breakpoint, size]) => 
      breakpoint === 'sm' ? size : `(min-width: ${getBreakpointValue(breakpoint)}px) ${size}`
    )
    .join(', ');
}

function getBreakpointValue(breakpoint: string): number {
  const breakpoints: { [key: string]: number } = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
  };
  return breakpoints[breakpoint] || 768;
}