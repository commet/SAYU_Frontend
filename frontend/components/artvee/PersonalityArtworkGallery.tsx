'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Grid3X3, Layers, Image as ImageIcon, Filter, X } from 'lucide-react';
import ArtworkImage from './ArtworkImage';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface Artwork {
  artveeId: string;
  title: string;
  artist: string;
  year?: string;
  style?: string;
  period?: string;
  url: string;
}

interface PersonalityArtworkGalleryProps {
  sayuType: string;
  artworks: Artwork[];
  isLoading?: boolean;
}

type ViewMode = 'grid' | 'carousel' | 'masonry';

export default function PersonalityArtworkGallery({
  sayuType,
  artworks = [],
  isLoading = false
}: PersonalityArtworkGalleryProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [filters, setFilters] = useState({
    artist: '',
    period: '',
    style: ''
  });

  // 필터링된 작품들
  const filteredArtworks = useMemo(() => {
    return artworks.filter(artwork => {
      if (filters.artist && artwork.artist !== filters.artist) return false;
      if (filters.period && artwork.period !== filters.period) return false;
      if (filters.style && artwork.style !== filters.style) return false;
      return true;
    });
  }, [artworks, filters]);

  // 유니크 값 추출
  const uniqueArtists = useMemo(() => 
    [...new Set(artworks.map(a => a.artist))].sort(),
    [artworks]
  );

  const uniquePeriods = useMemo(() => 
    [...new Set(artworks.filter(a => a.period).map(a => a.period!))].sort(),
    [artworks]
  );

  const uniqueStyles = useMemo(() => 
    [...new Set(artworks.filter(a => a.style).map(a => a.style!))].sort(),
    [artworks]
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="aspect-square" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 컨트롤 바 */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        {/* 뷰 모드 선택 */}
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="w-4 h-4 mr-2" />
            그리드
          </Button>
          <Button
            variant={viewMode === 'carousel' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('carousel')}
          >
            <ImageIcon className="w-4 h-4 mr-2" />
            캐러셀
          </Button>
          <Button
            variant={viewMode === 'masonry' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('masonry')}
          >
            <Layers className="w-4 h-4 mr-2" />
            메이슨리
          </Button>
        </div>

        {/* 필터 */}
        <div className="flex gap-2 flex-wrap">
          <Select
            value={filters.artist}
            onValueChange={(value) => setFilters(prev => ({ ...prev, artist: value }))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="작가 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">전체 작가</SelectItem>
              {uniqueArtists.map(artist => (
                <SelectItem key={artist} value={artist}>
                  {artist}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {uniquePeriods.length > 0 && (
            <Select
              value={filters.period}
              onValueChange={(value) => setFilters(prev => ({ ...prev, period: value }))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="시대 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">전체 시대</SelectItem>
                {uniquePeriods.map(period => (
                  <SelectItem key={period} value={period}>
                    {period}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {uniqueStyles.length > 0 && (
            <Select
              value={filters.style}
              onValueChange={(value) => setFilters(prev => ({ ...prev, style: value }))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="스타일 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">전체 스타일</SelectItem>
                {uniqueStyles.map(style => (
                  <SelectItem key={style} value={style}>
                    {style}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* 결과 수 */}
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {filteredArtworks.length}개의 작품
      </p>

      {/* 갤러리 뷰 */}
      <AnimatePresence mode="wait">
        {viewMode === 'grid' && (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {filteredArtworks.map((artwork) => (
              <motion.div
                key={artwork.artveeId}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <ArtworkImage
                  artveeId={artwork.artveeId}
                  size="thumbnail"
                  artwork={artwork}
                  onClick={() => setSelectedArtwork(artwork)}
                  className="rounded-lg shadow-md hover:shadow-xl transition-shadow"
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {viewMode === 'carousel' && (
          <motion.div
            key="carousel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative"
          >
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
              {filteredArtworks.map((artwork) => (
                <div
                  key={artwork.artveeId}
                  className="flex-none w-[300px] md:w-[400px] snap-center"
                >
                  <ArtworkImage
                    artveeId={artwork.artveeId}
                    size="medium"
                    artwork={artwork}
                    onClick={() => setSelectedArtwork(artwork)}
                    className="rounded-lg shadow-lg"
                  />
                  <div className="mt-2 space-y-1">
                    <h3 className="font-semibold truncate">{artwork.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {artwork.artist} {artwork.year && `• ${artwork.year}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {viewMode === 'masonry' && (
          <motion.div
            key="masonry"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="columns-2 md:columns-3 lg:columns-4 gap-4"
          >
            {filteredArtworks.map((artwork, index) => (
              <motion.div
                key={artwork.artveeId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="break-inside-avoid mb-4"
              >
                <ArtworkImage
                  artveeId={artwork.artveeId}
                  size="medium"
                  artwork={artwork}
                  onClick={() => setSelectedArtwork(artwork)}
                  className="rounded-lg shadow-md hover:shadow-xl transition-shadow"
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 작품 상세 모달 */}
      <AnimatePresence>
        {selectedArtwork && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
            onClick={() => setSelectedArtwork(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-4xl w-full bg-white dark:bg-gray-900 rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-10"
                onClick={() => setSelectedArtwork(null)}
              >
                <X className="w-4 h-4" />
              </Button>
              
              <div className="grid md:grid-cols-2 gap-6 p-6">
                <div>
                  <ArtworkImage
                    artveeId={selectedArtwork.artveeId}
                    size="full"
                    artwork={selectedArtwork}
                    loading="eager"
                    className="rounded-lg"
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedArtwork.title}</h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                      {selectedArtwork.artist}
                    </p>
                    {selectedArtwork.year && (
                      <p className="text-sm text-gray-500 dark:text-gray-500">
                        {selectedArtwork.year}
                      </p>
                    )}
                  </div>
                  
                  {selectedArtwork.style && (
                    <div>
                      <h3 className="font-semibold">스타일</h3>
                      <p className="text-gray-600 dark:text-gray-400">{selectedArtwork.style}</p>
                    </div>
                  )}
                  
                  {selectedArtwork.period && (
                    <div>
                      <h3 className="font-semibold">시대</h3>
                      <p className="text-gray-600 dark:text-gray-400">{selectedArtwork.period}</p>
                    </div>
                  )}
                  
                  <div className="pt-4 space-y-2">
                    <Button className="w-full" asChild>
                      <a href={selectedArtwork.url} target="_blank" rel="noopener noreferrer">
                        원본 보기
                      </a>
                    </Button>
                    <Button variant="outline" className="w-full">
                      컬렉션에 추가
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}