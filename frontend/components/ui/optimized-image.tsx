'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Skeleton } from './skeleton-loader';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  fallback?: string;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  fill = false,
  sizes,
  quality = 75,
  placeholder = 'empty',
  blurDataURL,
  onLoad,
  fallback = '/images/placeholder.jpg'
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [imageSrc, setImageSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Preload image
    const img = new window.Image();
    img.src = src;
    img.onload = () => {
      setIsLoading(false);
      onLoad?.();
    };
    img.onerror = () => {
      setHasError(true);
      setImageSrc(fallback);
      setIsLoading(false);
    };
  }, [src, fallback, onLoad]);

  if (fill) {
    return (
      <div className={cn('relative overflow-hidden', className)}>
        {isLoading && (
          <Skeleton 
            variant="rectangular" 
            className="absolute inset-0 image-loading" 
          />
        )}
        <Image
          src={imageSrc}
          alt={alt}
          fill
          sizes={sizes || '100vw'}
          quality={quality}
          priority={priority}
          placeholder={placeholder}
          blurDataURL={blurDataURL}
          className={cn(
            'object-cover transition-opacity duration-300',
            isLoading ? 'opacity-0' : 'opacity-100'
          )}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setHasError(true);
            setImageSrc(fallback);
          }}
        />
      </div>
    );
  }

  return (
    <div className={cn('relative inline-block', className)}>
      {isLoading && (
        <Skeleton 
          variant="rectangular"
          width={width}
          height={height}
          className="absolute inset-0 image-loading"
        />
      )}
      <Image
        src={imageSrc}
        alt={alt}
        width={width || 400}
        height={height || 300}
        quality={quality}
        priority={priority}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setImageSrc(fallback);
        }}
      />
    </div>
  );
}

// Background Image with fade-in effect
export function BackgroundImage({
  src,
  alt = 'Background',
  className,
  overlay = true,
  overlayOpacity = 0.5
}: {
  src: string;
  alt?: string;
  className?: string;
  overlay?: boolean;
  overlayOpacity?: number;
}) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const img = new window.Image();
    img.src = src;
    img.onload = () => setIsLoaded(true);
  }, [src]);

  return (
    <div className={cn('absolute inset-0 overflow-hidden', className)}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-pink-900/20 animate-pulse" />
      )}
      <div
        className={cn(
          'absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 bg-image-stable',
          isLoaded ? 'opacity-100' : 'opacity-0'
        )}
        style={{ backgroundImage: `url(${src})` }}
      />
      {overlay && (
        <div 
          className="absolute inset-0 bg-black transition-opacity duration-500"
          style={{ opacity: overlayOpacity }}
        />
      )}
    </div>
  );
}

// Lazy load wrapper for components
export function LazyLoad({ 
  children, 
  fallback = <Skeleton variant="rounded" height={200} />,
  rootMargin = '100px'
}: { 
  children: React.ReactNode;
  fallback?: React.ReactNode;
  rootMargin?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [ref, setRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(ref);

    return () => observer.disconnect();
  }, [ref, rootMargin]);

  return (
    <div ref={setRef}>
      {isVisible ? children : fallback}
    </div>
  );
}