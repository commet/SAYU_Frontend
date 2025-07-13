'use client';

import React from 'react';
import Image from 'next/image';
import { usePersonalityArtworks } from '@/lib/artvee-api';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { personalityAnimals } from '@/data/personality-animals';

interface PersonalityArtworksProps {
  personalityType: string;
  limit?: number;
}

export function PersonalityArtworks({ personalityType, limit = 6 }: PersonalityArtworksProps) {
  const { data: artworks, isLoading, error } = usePersonalityArtworks(personalityType, limit);
  
  const animal = personalityAnimals[personalityType];
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-4">
          Loading artworks for {personalityType}...
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(limit)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-4">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  if (error || !artworks) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">
          Unable to load artworks for {personalityType}
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        {animal && (
          <>
            <span className="text-2xl">{animal.emoji}</span>
            <h3 className="text-xl font-semibold">
              {animal.animal_ko} ({personalityType}) 추천 작품
            </h3>
          </>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {artworks.map((artwork) => (
          <Card 
            key={artwork.id} 
            className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="relative aspect-[4/3] bg-muted">
              {artwork.thumbnail_url ? (
                <Image
                  src={artwork.thumbnail_url}
                  alt={artwork.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <span className="text-4xl opacity-20">🎨</span>
                </div>
              )}
              {artwork.relevance_score && (
                <Badge 
                  className="absolute top-2 right-2"
                  variant="secondary"
                >
                  {Math.round(artwork.relevance_score * 100)}% 매치
                </Badge>
              )}
            </div>
            
            <CardContent className="p-4">
              <h4 className="font-medium line-clamp-1">{artwork.title}</h4>
              <p className="text-sm text-muted-foreground">{artwork.artist}</p>
              {artwork.year_created && (
                <p className="text-xs text-muted-foreground mt-1">
                  {artwork.year_created}
                </p>
              )}
              
              {artwork.emotion_tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {artwork.emotion_tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      
      {artworks.length === 0 && (
        <div className="text-center p-8 border border-dashed rounded-lg">
          <p className="text-muted-foreground">
            아직 {personalityType} 타입에 맞는 작품이 없습니다.
          </p>
        </div>
      )}
    </div>
  );
}