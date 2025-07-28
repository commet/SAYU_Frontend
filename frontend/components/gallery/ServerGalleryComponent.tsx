// React 19 Server Component - 서버에서 데이터를 가져와서 렌더링
import { Suspense } from 'react';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { MasonryGrid, MasonryItem } from './MasonryGrid';

interface Artwork {
  id: string;
  title: string;
  artist: string;
  year: string;
  imageUrl: string;
  museum: string;
  medium?: string;
  description?: string;
  style?: string;
  period?: string;
}

// 서버에서 실행되는 데이터 fetching 함수
async function getGalleryArtworks(limit: number = 20): Promise<Artwork[]> {
  // Server Component에서는 직접 API 호출 가능
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/artworks/gallery?limit=${limit}`, {
    cache: 'force-cache', // Static generation을 위한 캐싱
    next: { revalidate: 3600 } // 1시간마다 재검증
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch gallery artworks');
  }
  
  return response.json();
}

// 개별 작품 카드 컴포넌트 - Server Component
async function ArtworkCard({ artwork }: { artwork: Artwork }) {
  return (
    <MasonryItem className="group cursor-pointer">
      <div className="bg-card rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02]">
        {/* 작품 이미지 */}
        <div className="relative aspect-[3/4] overflow-hidden">
          <OptimizedImage
            src={artwork.imageUrl}
            alt={artwork.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            priority={false} // Gallery에서는 lazy loading 사용
          />
          
          {/* 호버 오버레이 */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="text-white text-center p-4">
              <p className="text-sm mb-2">{artwork.style}</p>
              <p className="text-xs text-white/80">{artwork.period}</p>
            </div>
          </div>
        </div>
        
        {/* 작품 정보 */}
        <div className="p-4">
          <h3 className="font-display font-semibold text-lg line-clamp-2 mb-2">
            {artwork.title}
          </h3>
          <p className="text-muted-foreground font-medium mb-1">
            {artwork.artist}
          </p>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{artwork.year}</span>
            <span>{artwork.medium}</span>
          </div>
          
          {/* 컬렉션 정보 */}
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              {artwork.museum}
            </p>
          </div>
        </div>
      </div>
    </MasonryItem>
  );
}

// 갤러리 그리드 - Server Component
async function GalleryGrid({ limit }: { limit?: number }) {
  const artworks = await getGalleryArtworks(limit);
  
  return (
    <MasonryGrid 
      columns={{ default: 1, sm: 2, md: 3, lg: 4 }}
      gap="md"
      className="w-full"
    >
      {artworks.map((artwork, index) => (
        <ArtworkCard 
          key={artwork.id} 
          artwork={artwork}
        />
      ))}
    </MasonryGrid>
  );
}

// 로딩 스켈레톤 컴포넌트
function GalleryLoadingSkeleton() {
  return (
    <MasonryGrid 
      columns={{ default: 1, sm: 2, md: 3, lg: 4 }}
      gap="md"
      className="w-full"
    >
      {[...Array(12)].map((_, index) => (
        <MasonryItem key={index}>
          <div className="bg-card rounded-xl overflow-hidden shadow-lg animate-pulse">
            <div className="aspect-[3/4] bg-gray-200 dark:bg-gray-700" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              <div className="flex justify-between">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
              </div>
            </div>
          </div>
        </MasonryItem>
      ))}
    </MasonryGrid>
  );
}

// 에러 컴포넌트
function GalleryError({ error }: { error: Error }) {
  return (
    <div className="text-center py-12">
      <h3 className="text-lg font-semibold text-destructive mb-2">
        Failed to load gallery
      </h3>
      <p className="text-muted-foreground mb-4">
        {error.message}
      </p>
      <button 
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}

// 메인 Server Gallery 컴포넌트
export default async function ServerGalleryComponent({ 
  title = "Featured Artworks",
  subtitle = "Discover masterpieces from around the world",
  limit = 20 
}: {
  title?: string;
  subtitle?: string;
  limit?: number;
}) {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {title}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>
        
        {/* 갤러리 그리드 with Suspense */}
        <Suspense fallback={<GalleryLoadingSkeleton />}>
          <GalleryGrid limit={limit} />
        </Suspense>
      </div>
    </section>
  );
}

// 클라이언트 사이드 인터랙션이 필요한 부분을 위한 별도 컴포넌트
export function InteractiveGalleryWrapper({ children }: { children: React.ReactNode }) {
  'use client';
  
  // 클라이언트 사이드 인터랙션 로직
  // 예: 좋아요, 공유, 필터링 등
  
  return (
    <div className="interactive-gallery">
      {children}
    </div>
  );
}

// 전시 정보를 위한 Server Component
export async function ExhibitionServerComponent({ exhibitionId }: { exhibitionId: string }) {
  // 서버에서 전시 정보 가져오기
  const exhibition = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/exhibitions/${exhibitionId}`, {
    cache: 'force-cache',
    next: { revalidate: 3600 }
  }).then(res => res.json());
  
  return (
    <div className="bg-card rounded-xl p-6">
      <h2 className="text-2xl font-bold mb-4">{exhibition.title}</h2>
      <div className="space-y-4">
        <div>
          <p className="text-muted-foreground">{exhibition.description}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">기간:</span>
            <p className="text-muted-foreground">
              {exhibition.startDate} - {exhibition.endDate}
            </p>
          </div>
          <div>
            <span className="font-medium">장소:</span>
            <p className="text-muted-foreground">{exhibition.venue}</p>
          </div>
        </div>
        
        {/* 전시 작품 목록 */}
        <Suspense fallback={<div className="animate-pulse h-20 bg-gray-200 rounded" />}>
          <GalleryGrid limit={6} />
        </Suspense>
      </div>
    </div>
  );
}

// 성능 최적화를 위한 메타데이터 내보내기
export const metadata = {
  title: 'SAYU Gallery - Discover Art',
  description: 'Explore curated artworks from museums around the world',
  openGraph: {
    title: 'SAYU Gallery',
    description: 'Discover masterpieces from around the world',
    images: ['/images/gallery-og.jpg'],
  },
};