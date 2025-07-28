'use client';

import { useState } from 'react';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
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
  
  // 디버깅용 로그
  console.log('PersonalityAnimalImage:', {
    animalType: animal.type,
    variant,
    imagePath,
    imageError,
    hasImagePath: !!imagePath
  });

  // 이미지가 없거나 로드 에러가 있으면 이모지 폴백 표시
  if (!imagePath || imageError) {
    if (!showFallback) return null;
    
    return (
      <div 
        className={`flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100 rounded-full ${className}`}
        style={{ width, height }}
      >
        <span 
          className="text-center"
          style={{ fontSize: width * 0.4 }}
        >
          {animal.emoji}
        </span>
        {/* 디버깅 정보 표시 */}
        <div className="absolute -bottom-8 left-0 right-0 text-xs text-center text-red-500">
          {!imagePath ? 'No path' : 'Load error'}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`} style={{ width, height }}>
      {isLoading && (
        <div 
          className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse rounded-lg flex items-center justify-center"
        >
          <span className="text-gray-400" style={{ fontSize: width * 0.2 }}>
            {animal.emoji}
          </span>
        </div>
      )}
      
      <OptimizedImage
        src={imagePath}
        alt={`${animal.animal_ko} 캐릭터`}
        width={width}
        height={height}
        className="object-contain rounded-lg"
        placeholder="blur"
        quality={90}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          console.error('Image load error:', {
            animalType: animal.type,
            variant,
            imagePath,
            error: 'Failed to load'
          });
          setImageError(true);
          setIsLoading(false);
        }}
        priority={size === 'lg' || size === 'xl'}
      />
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