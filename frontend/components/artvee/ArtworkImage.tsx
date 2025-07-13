'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { API_CONFIG, getApiUrl } from '@/config/api';

interface ArtworkData {
  title: string;
  artist: string;
  year?: string;
  style?: string;
}

interface ArtworkImageProps {
  artveeId: string;
  size: 'thumbnail' | 'medium' | 'full';
  artwork: ArtworkData;
  loading?: 'lazy' | 'eager';
  className?: string;
  onClick?: () => void;
}

const IMAGE_SIZES = {
  thumbnail: {
    width: 300,
    height: 300,
    sizes: '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px'
  },
  medium: {
    width: 800,
    height: 800,
    sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px'
  },
  full: {
    width: 1920,
    height: 1920,
    sizes: '100vw'
  }
};

export default function ArtworkImage({
  artveeId,
  size = 'medium',
  artwork,
  loading = 'lazy',
  className,
  onClick
}: ArtworkImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 임시 이미지 URL - 나중에 실제 백엔드 API로 교체
  const getImageUrl = () => {
    if (imageError) {
      return '/placeholder-artwork.jpg';
    }
    
    // 로컬 개발용 - 나중에 실제 CDN URL로 교체
    return getApiUrl(API_CONFIG.endpoints.artvee.images(artveeId)) + `?size=${size}`;
  };

  const imageConfig = IMAGE_SIZES[size];

  return (
    <div 
      className={cn(
        'relative overflow-hidden bg-gray-100 dark:bg-gray-800',
        size === 'thumbnail' && 'aspect-square',
        size === 'medium' && 'aspect-[4/3]',
        size === 'full' && 'w-full h-auto',
        isLoading && 'animate-pulse',
        onClick && 'cursor-pointer hover:opacity-90 transition-opacity',
        className
      )}
      onClick={onClick}
    >
      <Image
        src={getImageUrl()}
        alt={`${artwork.title} by ${artwork.artist}${artwork.year ? ` (${artwork.year})` : ''}`}
        width={imageConfig.width}
        height={imageConfig.height}
        sizes={imageConfig.sizes}
        loading={loading}
        className={cn(
          'object-contain',
          size === 'full' && 'w-full h-auto'
        )}
        onError={() => setImageError(true)}
        onLoad={() => setIsLoading(false)}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        </div>
      )}
      {size === 'thumbnail' && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
          <p className="text-white text-xs font-medium truncate">{artwork.title}</p>
          <p className="text-white/80 text-xs truncate">{artwork.artist}</p>
        </div>
      )}
    </div>
  );
}