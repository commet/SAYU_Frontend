'use client';

import { Suspense, use } from 'react';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface Artwork {
  artveeId: string;
  title: string;
  artist: string;
  imageUrl?: string;
}

// Server Action으로 데이터 페칭
async function getPersonalityArtworks(sayuType: string, limit: number): Promise<Artwork[]> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/artvee/personality/${sayuType}?limit=${limit}`,
    {
      next: { revalidate: 300 }, // 5분 캐싱
    }
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch artworks');
  }
  
  const data = await response.json();
  return data.data || [];
}

// Suspense 최적화된 갤러리 컴포넌트
function ArtworkGalleryContent({ artworksPromise }: { artworksPromise: Promise<Artwork[]> }) {
  const artworks = use(artworksPromise);
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {artworks.map((artwork) => (
        <Card key={artwork.artveeId} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="aspect-square relative">
              <OptimizedImage
                src={artwork.imageUrl || '/placeholder-artwork.jpg'}
                alt={artwork.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              />
            </div>
            <div className="p-3">
              <h3 className="font-semibold text-sm truncate">{artwork.title}</h3>
              <p className="text-xs text-muted-foreground truncate">{artwork.artist}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// 스켈레톤 로딩 컴포넌트
function ArtworkGallerySkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <CardContent className="p-0">
            <Skeleton className="aspect-square w-full" />
            <div className="p-3 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// 에러 바운더리 포함 갤러리
interface SuspenseArtworkGalleryProps {
  sayuType: string;
  limit?: number;
}

export function SuspenseArtworkGallery({ sayuType, limit = 8 }: SuspenseArtworkGalleryProps) {
  const artworksPromise = getPersonalityArtworks(sayuType, limit);
  
  return (
    <Suspense fallback={<ArtworkGallerySkeleton />}>
      <ArtworkGalleryContent artworksPromise={artworksPromise} />
    </Suspense>
  );
}