'use client';

import { Suspense, use, useState } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface ArtworkImage {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  blurDataURL?: string;
}

// Server Action으로 이미지 메타데이터 가져오기
async function getImageMetadata(artworkIds: string[]): Promise<ArtworkImage[]> {
  // 실제 구현에서는 서버에서 이미지 최적화 정보를 가져옴
  const response = await fetch('/api/artworks/images', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ artworkIds }),
    next: { revalidate: 3600 } // 1시간 캐싱
  });
  
  return response.json();
}

// 지연 로딩될 이미지 컴포넌트
function LazyArtworkImage({ imagePromise }: { imagePromise: Promise<ArtworkImage> }) {
  const image = use(imagePromise);
  const [isLoading, setIsLoading] = useState(true);
  
  return (
    <Card className="overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow">
      <div className="relative aspect-square">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          className={`object-cover transition-opacity group-hover:scale-105 duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          placeholder={image.blurDataURL ? 'blur' : 'empty'}
          blurDataURL={image.blurDataURL}
          onLoad={() => setIsLoading(false)}
          priority={false} // 지연 로딩
        />
        
        {/* 로딩 오버레이 */}
        {isLoading && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}
      </div>
      
      <div className="p-3">
        <h3 className="font-semibold text-sm truncate">{image.alt}</h3>
      </div>
    </Card>
  );
}

// 이미지 스켈레톤
function ImageSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-square w-full" />
      <div className="p-3">
        <Skeleton className="h-4 w-full" />
      </div>
    </Card>
  );
}

// 메인 갤러리 컴포넌트
interface OptimizedImageGalleryProps {
  artworkIds: string[];
  columns?: number;
}

export function OptimizedImageGallery({ 
  artworkIds, 
  columns = 4 
}: OptimizedImageGalleryProps) {
  // 이미지를 청크 단위로 분할하여 점진적 로딩
  const chunkSize = 8;
  const chunks = [];
  
  for (let i = 0; i < artworkIds.length; i += chunkSize) {
    chunks.push(artworkIds.slice(i, i + chunkSize));
  }

  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3', 
    4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
    6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6'
  };

  return (
    <div className="space-y-8">
      {chunks.map((chunk, chunkIndex) => (
        <Suspense 
          key={chunkIndex}
          fallback={
            <div className={`grid ${gridCols[columns as keyof typeof gridCols]} gap-4`}>
              {chunk.map((_, index) => (
                <ImageSkeleton key={index} />
              ))}
            </div>
          }
        >
          <ImageChunk 
            artworkIds={chunk} 
            columns={columns}
            chunkIndex={chunkIndex}
          />
        </Suspense>
      ))}
    </div>
  );
}

// 청크별 이미지 로딩
function ImageChunk({ 
  artworkIds, 
  columns, 
  chunkIndex 
}: { 
  artworkIds: string[];
  columns: number;
  chunkIndex: number;
}) {
  const imagesPromise = getImageMetadata(artworkIds);
  const images = use(imagesPromise);
  
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
    6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6'
  };

  return (
    <div className={`grid ${gridCols[columns as keyof typeof gridCols]} gap-4`}>
      {images.map((image, index) => (
        <Suspense key={image.id} fallback={<ImageSkeleton />}>
          <LazyArtworkImage 
            imagePromise={Promise.resolve(image)}
          />
        </Suspense>
      ))}
    </div>
  );
}

// 가상 스크롤링을 위한 훅 (대용량 갤러리용)
export function useVirtualizedGallery(
  items: string[], 
  itemHeight: number = 300,
  containerHeight: number = 600
) {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleItemCount = Math.ceil(containerHeight / itemHeight) + 2;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - 1);
  const endIndex = Math.min(items.length, startIndex + visibleItemCount);
  
  const visibleItems = items.slice(startIndex, endIndex);
  const offsetY = startIndex * itemHeight;
  
  return {
    visibleItems,
    offsetY,
    totalHeight: items.length * itemHeight,
    onScroll: (e: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(e.currentTarget.scrollTop);
    }
  };
}