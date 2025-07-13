'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useQuizArtworks } from '@/lib/artvee-api';
import { cn } from '@/lib/utils';

interface QuizArtworkBackgroundProps {
  className?: string;
  overlay?: boolean;
  blur?: boolean;
}

export function QuizArtworkBackground({ 
  className, 
  overlay = true,
  blur = false 
}: QuizArtworkBackgroundProps) {
  const { data: artworks, isLoading } = useQuizArtworks(1);
  const [currentArtwork, setCurrentArtwork] = useState(0);
  
  // 주기적으로 배경 변경
  useEffect(() => {
    if (!artworks || artworks.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentArtwork((prev) => (prev + 1) % artworks.length);
    }, 10000); // 10초마다 변경
    
    return () => clearInterval(interval);
  }, [artworks]);
  
  if (isLoading || !artworks || artworks.length === 0) {
    return (
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br from-purple-900/20 to-blue-900/20",
        className
      )} />
    );
  }
  
  const artwork = artworks[currentArtwork];
  
  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      {/* 아트워크 이미지 */}
      <div className="absolute inset-0">
        {artwork.cdn_url && (
          <Image
            src={artwork.cdn_url}
            alt={artwork.title}
            fill
            className={cn(
              "object-cover transition-all duration-1000",
              blur && "blur-sm scale-110"
            )}
            priority
            sizes="100vw"
          />
        )}
      </div>
      
      {/* 오버레이 */}
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
      )}
      
      {/* 아트워크 정보 (옵션) */}
      <div className="absolute bottom-4 left-4 text-white/70 text-xs">
        <p className="font-medium">{artwork.title}</p>
        <p>{artwork.artist}</p>
      </div>
    </div>
  );
}