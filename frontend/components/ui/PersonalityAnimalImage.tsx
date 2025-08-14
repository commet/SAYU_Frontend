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
  
  
  // 이미지가 없거나 로드 에러가 있으면 이모지 폴백 표시
  if (!imagePath || imageError) {
    if (!showFallback) return null;
    
    return (
      <div 
        className={`relative flex items-center justify-center bg-gradient-to-br from-sayu-lavender/20 to-sayu-sage/20 rounded-lg shadow-sm border border-sayu-warm-gray/10 ${className}`}
        style={{ width, height }}
      >
        <span 
          className="text-center select-none"
          style={{ fontSize: width * 0.4 }}
        >
          {animal.emoji}
        </span>
        <div className="absolute bottom-1 right-1">
          <div className="w-2 h-2 bg-sayu-mocha/20 rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-lg shadow-sm ${className}`} style={{ width, height }}>
      {isLoading && (
        <div 
          className="absolute inset-0 bg-gradient-to-br from-sayu-warm-gray/10 to-sayu-warm-gray/20 animate-pulse rounded-lg flex items-center justify-center"
        >
          <span className="text-sayu-text-muted" style={{ fontSize: width * 0.2 }}>
            {animal.emoji}
          </span>
        </div>
      )}
      
      <OptimizedImage
        src={imagePath}
        alt={`${animal.animal_ko} 캐릭터`}
        width={width}
        height={height}
        className="object-contain rounded-lg transition-all duration-300"
        placeholder="blur"
        quality={90}
        onLoad={() => setIsLoading(false)}
        onError={() => {
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