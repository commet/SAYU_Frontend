'use client';

import { useState } from 'react';
import OptimizedImage from '@/components/ui/optimized-image';
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

export function PersonalityAnimalImage({ 
  animal, 
  variant = 'image', 
  size = 'md',
  className = '',
  showFallback = true
}: PersonalityAnimalImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const { width, height } = sizeMap[size];
  const imagePath = animal[variant];
  
  // Debug logging for development
  if (process.env.NODE_ENV === 'development') {
    console.log('PersonalityAnimalImage:', { 
      animal: animal.type, 
      variant, 
      imagePath, 
      imageError 
    });
  }
  
  // 이미지 로드 실패 시 처리 - 이모지 표시하지 않음
  if (!imagePath || imageError) {
    // showFallback이 false면 아무것도 표시하지 않음
    if (!showFallback) return null;
    
    // 빈 placeholder만 표시 (이모지 없음)
    return (
      <div 
        className={`relative flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg ${className}`}
        style={{ width, height }}
      />
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-lg shadow-sm ${className}`} style={{ width, height }}>
      <OptimizedImage
        src={imagePath}
        alt={`${animal.animal_ko} 캐릭터`}
        width={width}
        height={height}
        className="object-contain rounded-lg transition-all duration-300"
        priority={size === 'xl' || size === 'lg'} // 큰 이미지는 우선 로딩
        isPersonalityAnimal={true}
        quality={size === 'sm' ? 70 : 85} // 작은 이미지는 품질 낮춤
        placeholder="blur"
        onError={() => {
          console.error('Image failed to load:', imagePath);
          setImageError(true);
          setIsLoading(false);
        }}
        onLoad={() => {
          setIsLoading(false);
          if (process.env.NODE_ENV === 'development') {
            console.log('Image loaded successfully:', imagePath);
          }
        }}
      />
      
      {/* 로딩 오버레이 */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-pink-100 animate-pulse rounded-lg" />
      )}
    </div>
  );
}

// 다중 동물 이미지 그리드
interface AnimalImageGridProps {
  animals: PersonalityAnimal[];
  selectedType?: string;
  onSelect?: (type: string) => void;
  variant?: 'image' | 'avatar' | 'illustration';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function AnimalImageGrid({ 
  animals, 
  selectedType, 
  onSelect, 
  variant = 'avatar',
  size = 'md' 
}: AnimalImageGridProps) {
  return (
    <div className="grid grid-cols-4 gap-4">
      {animals.map((animal) => (
        <button
          key={animal.type}
          onClick={() => onSelect?.(animal.type)}
          className={`relative transition-all duration-200 hover:scale-105 ${
            selectedType === animal.type 
              ? 'ring-4 ring-purple-400 ring-opacity-60' 
              : 'hover:ring-2 hover:ring-purple-200'
          }`}
        >
          <PersonalityAnimalImage 
            animal={animal} 
            variant={variant}
            size={size}
            className="mx-auto"
          />
          <div className="mt-2 text-center">
            <p className="text-xs font-medium">{animal.type}</p>
            <p className="text-xs text-gray-600">{animal.animal_ko}</p>
          </div>
        </button>
      ))}
    </div>
  );
}