'use client';

import { useState, memo } from 'react';
import Image from 'next/image';
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
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
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

  const imageProps = {
    src,
    alt,
    className: cn(
      'transition-opacity duration-300',
      isLoading ? 'opacity-0' : 'opacity-100',
      className
    ),
    quality,
    priority,
    onLoad: handleLoad,
    onError: handleError,
    ...(placeholder === 'blur' && {
      placeholder: 'blur' as const,
      blurDataURL: blurDataURL || defaultBlurDataURL,
    }),
  };

  if (fill) {
    return (
      <>
        <Image
          {...imageProps}
          fill
          sizes={sizes}
        />
        {isLoading && (
          <div className={cn(
            'absolute inset-0 flex items-center justify-center bg-gray-200 animate-pulse',
            className
          )}>
            <div className="w-8 h-8 bg-gray-300 rounded animate-pulse" />
          </div>
        )}
      </>
    );
  }

  if (width && height) {
    return (
      <div className="relative">
        <Image
          {...imageProps}
          width={width}
          height={height}
          sizes={sizes}
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

  // Fallback to fill if no dimensions provided
  return (
    <div className="relative w-full h-full">
      <Image
        {...imageProps}
        fill
        sizes={sizes}
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