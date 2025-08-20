'use client';

import { useState, useEffect } from 'react';
import { PersonalityAnimal } from '@/data/personality-animals';

interface PersonalityAnimalImageProps {
  animal: PersonalityAnimal;
  variant?: 'image' | 'avatar' | 'illustration';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showFallback?: boolean;
}

const sizeMap = {
  sm: { width: 64, height: 64 },
  md: { width: 128, height: 128 },
  lg: { width: 200, height: 200 },
  xl: { width: 300, height: 300 }
};

// 타입별 이미지 직접 매핑 - 파일 시스템 의존 제거
const ANIMAL_IMAGES: Record<string, string> = {
  'LAEF': 'https://i.imgur.com/YourFoxImage.png', // 실제 업로드한 이미지 URL로 교체 필요
  'LAEC': 'https://i.imgur.com/YourCatImage.png',
  'LAMF': 'https://i.imgur.com/YourOwlImage.png',
  'LAMC': 'https://i.imgur.com/YourTurtleImage.png',
  'LREF': 'https://i.imgur.com/YourChameleonImage.png',
  'LREC': 'https://i.imgur.com/YourHedgehogImage.png',
  'LRMF': 'https://i.imgur.com/YourOctopusImage.png',
  'LRMC': 'https://i.imgur.com/YourBeaverImage.png',
  'SAEF': 'https://i.imgur.com/YourButterflyImage.png',
  'SAEC': 'https://i.imgur.com/YourPenguinImage.png',
  'SAMF': 'https://i.imgur.com/YourParrotImage.png',
  'SAMC': 'https://i.imgur.com/YourDeerImage.png',
  'SREF': 'https://i.imgur.com/YourDogImage.png',
  'SREC': 'https://i.imgur.com/YourDuckImage.png',
  'SRMF': 'https://i.imgur.com/YourElephantImage.png',
  'SRMC': 'https://i.imgur.com/YourEagleImage.png'
};

// Base64 인코딩된 fallback 이미지 (작은 placeholder)
const FALLBACK_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y0ZjRmNCIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Mb2FkaW5nLi4uPC90ZXh0Pgo8L3N2Zz4=';

export function PersonalityAnimalImageFixed({ 
  animal, 
  variant = 'image', 
  size = 'md',
  className = '',
  showFallback = true
}: PersonalityAnimalImageProps) {
  const [imageUrl, setImageUrl] = useState<string>(FALLBACK_IMAGE);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  const { width, height } = sizeMap[size];
  
  useEffect(() => {
    if (!animal?.type) {
      setHasError(true);
      setIsLoading(false);
      return;
    }
    
    // CDN 이미지 사용 또는 로컬 이미지를 다른 경로로
    const cdnImage = ANIMAL_IMAGES[animal.type];
    if (cdnImage && cdnImage !== 'https://i.imgur.com/YourFoxImage.png') {
      // 실제 CDN URL이 설정된 경우
      setImageUrl(cdnImage);
    } else {
      // 로컬 이미지 경로 - 파일명 단순화
      const animalName = animal.animal.toLowerCase();
      const typeCode = animal.type.toLowerCase();
      
      // 여러 경로 시도
      const paths = [
        `/images/personality-animals/main/${animalName}-${typeCode}.png`,
        `/images/personality-animals/${typeCode}.png`,
        `/images/animals/${typeCode}.png`,
        `/animals/${typeCode}.png`
      ];
      
      // 첫 번째 경로부터 시도
      tryLoadImage(paths, 0);
    }
    
    function tryLoadImage(paths: string[], index: number) {
      if (index >= paths.length) {
        setHasError(true);
        setIsLoading(false);
        return;
      }
      
      const img = new Image();
      img.onload = () => {
        setImageUrl(paths[index]);
        setIsLoading(false);
        setHasError(false);
      };
      img.onerror = () => {
        tryLoadImage(paths, index + 1);
      };
      img.src = paths[index];
    }
  }, [animal]);
  
  // 에러 또는 로딩 중일 때
  if (hasError || !animal) {
    if (!showFallback) return null;
    
    return (
      <div 
        className={`relative overflow-hidden rounded-lg shadow-sm flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100 ${className}`} 
        style={{ width, height }}
      >
        <span className="text-4xl">{animal?.emoji || '🎨'}</span>
      </div>
    );
  }
  
  return (
    <div className={`relative overflow-hidden rounded-lg shadow-sm ${className}`} style={{ width, height }}>
      <img
        src={imageUrl}
        alt={`${animal.animal_ko || animal.animal} 캐릭터`}
        width={width}
        height={height}
        className="object-contain rounded-lg transition-all duration-300 w-full h-full"
        loading={size === 'xl' || size === 'lg' ? 'eager' : 'lazy'}
      />
      
      {/* 로딩 오버레이 */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-pink-100 animate-pulse rounded-lg" />
      )}
    </div>
  );
}