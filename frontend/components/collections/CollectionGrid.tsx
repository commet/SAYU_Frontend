'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FolderOpen, Lock, Users, Heart, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { ArtCollection } from '@/types/collection';
import { cn } from '@/lib/utils';

interface CollectionGridProps {
  collections: ArtCollection[];
  showUser?: boolean;
  className?: string;
}

export function CollectionGrid({ 
  collections, 
  showUser = false,
  className 
}: CollectionGridProps) {
  if (collections.length === 0) {
    return (
      <div className="text-center py-12">
        <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">아직 컬렉션이 없습니다</p>
      </div>
    );
  }

  return (
    <div className={cn(
      "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6",
      className
    )}>
      {collections.map((collection) => (
        <Link
          key={collection.id}
          href={`/collections/${collection.id}`}
          className="group"
        >
          <Card className="overflow-hidden hover:shadow-lg transition-shadow">
            {/* 커버 이미지 또는 플레이스홀더 */}
            <div className="aspect-[4/3] relative bg-muted">
              {collection.cover_image_url ? (
                <Image
                  src={collection.cover_image_url}
                  alt={collection.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FolderOpen className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              
              {/* 상태 뱃지 */}
              <div className="absolute top-2 right-2 flex gap-2">
                {!collection.is_public && (
                  <Badge variant="secondary" className="bg-background/80">
                    <Lock className="h-3 w-3 mr-1" />
                    비공개
                  </Badge>
                )}
                {collection.is_shared && (
                  <Badge variant="secondary" className="bg-background/80">
                    <Users className="h-3 w-3 mr-1" />
                    공동
                  </Badge>
                )}
              </div>
            </div>

            <CardContent className="p-4">
              <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                {collection.title}
              </h3>
              
              {collection.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {collection.description}
                </p>
              )}

              {/* 사용자 정보 */}
              {showUser && collection.user && (
                <div className="flex items-center gap-2 mt-3">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={collection.user.profile_image_url} />
                    <AvatarFallback>{collection.user.username?.[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground">
                    {collection.user.username}
                  </span>
                </div>
              )}
            </CardContent>

            <CardFooter className="px-4 py-3 border-t">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{collection.items_count || 0}개 작품</span>
                
                <div className="flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  <span>{collection.likes_count || 0}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-3 w-3" />
                  <span>0</span>
                </div>
              </div>
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  );
}