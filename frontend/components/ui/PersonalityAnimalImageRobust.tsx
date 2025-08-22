'use client';

import { useState, useEffect } from 'react';
import { PersonalityAnimal } from '@/data/personality-animals';

interface PersonalityAnimalImageRobustProps {
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

export function PersonalityAnimalImageRobust({ 
  animal, 
  variant = 'image', 
  size = 'md',
  className = '',
  showFallback = true
}: PersonalityAnimalImageRobustProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [allFailed, setAllFailed] = useState(false);
  
  const { width, height } = sizeMap[size];
  
  // 다중 fallback 경로 생성 - 배포 환경에서도 확실히 동작하도록
  const getImagePaths = (): string[] => {
    const typeCode = animal?.type?.toLowerCase() || 'laef';
    const animalName = animal?.animal?.toLowerCase() || 'fox';
    
    const paths = [
      // 1. 기본 설정된 경로
      animal?.[variant] || animal?.image,
      
      // 2. 단순화된 경로들 - 다양한 패턴으로 시도
      `/images/animals/${typeCode}.png`,
      `/images/animals/${animalName}-${typeCode}.png`,
      `./images/animals/${typeCode}.png`,
      `./images/animals/${animalName}-${typeCode}.png`,
      
      // 3. 기존 복잡한 경로들
      `/images/personality-animals/main/${animalName}-${typeCode}.png`,
      `/images/personality-animals/avatars/${animalName}-${typeCode}-avatar.png`,
      `/images/personality-animals/illustrations/${animalName}-${typeCode}-full.png`,
      
      // 4. 절대 경로로 시도
      `${window?.location?.origin || ''}/images/animals/${typeCode}.png`,
      `${window?.location?.origin || ''}/images/animals/${animalName}-${typeCode}.png`,
      
      // 5. CDN 경로들 (만약 있다면)
      `https://res.cloudinary.com/sayu/image/upload/v1/animals/${typeCode}.png`,
      `https://cdn.sayu.my/images/animals/${typeCode}.png`
    ].filter(Boolean) as string[];
    
    // 중복 제거
    return [...new Set(paths)];
  };

  const imagePaths = getImagePaths();

  const handleImageError = () => {
    console.log(`Image failed to load: ${imagePaths[currentImageIndex]}`);
    
    if (currentImageIndex < imagePaths.length - 1) {
      // 다음 이미지 경로 시도
      setCurrentImageIndex(prev => prev + 1);
    } else {
      // 모든 경로 실패
      console.error('All image paths failed for animal:', animal?.type, imagePaths);
      setAllFailed(true);
      setIsLoading(false);
    }
  };

  const handleImageLoad = () => {
    console.log(`Image loaded successfully: ${imagePaths[currentImageIndex]}`);
    setIsLoading(false);
  };

  // 이미지 인덱스가 변경될 때 로딩 상태 초기화
  useEffect(() => {
    setIsLoading(true);
  }, [currentImageIndex]);

  // 모든 이미지가 실패했거나 경로가 없는 경우
  if (allFailed || !imagePaths.length) {
    if (!showFallback) return null;
    
    return (
      <div 
        className={`flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg shadow-sm ${className}`} 
        style={{ width, height }}
      >
        <div className={`flex flex-col items-center justify-center text-center ${
          size === 'sm' ? 'text-2xl' : 
          size === 'md' ? 'text-4xl' : 
          size === 'lg' ? 'text-6xl' : 'text-8xl'
        }`}>
          <span className="drop-shadow-lg">{animal?.emoji || '🎨'}</span>
          {size !== 'sm' && (
            <span className={`mt-1 font-medium text-purple-800 ${
              size === 'md' ? 'text-xs' : 
              size === 'lg' ? 'text-sm' : 'text-base'
            }`}>
              {animal?.type || 'SAYU'}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-lg shadow-sm ${className}`} style={{ width, height }}>
      <img
        key={currentImageIndex} // force re-render when path changes
        src={imagePaths[currentImageIndex]}
        alt={`${animal?.animal_ko || 'Animal'} character`}
        width={width}
        height={height}
        className="object-contain rounded-lg transition-all duration-300 w-full h-full"
        loading={size === 'xl' || size === 'lg' ? 'eager' : 'lazy'}
        onError={handleImageError}
        onLoad={handleImageLoad}
        style={{ 
          display: isLoading ? 'none' : 'block',
          imageRendering: 'crisp-edges' 
        }}
      />
      
      {/* 로딩 상태 */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-pink-100 animate-pulse rounded-lg flex items-center justify-center">
          <div className={`animate-spin rounded-full border-2 border-purple-400 border-t-transparent ${
            size === 'sm' ? 'w-6 h-6' : 
            size === 'md' ? 'w-8 h-8' : 
            size === 'lg' ? 'w-12 h-12' : 'w-16 h-16'
          }`} />
        </div>
      )}
    </div>
  );
}

export default PersonalityAnimalImageRobust;