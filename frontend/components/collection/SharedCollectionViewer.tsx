'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users,
  Lock,
  Globe,
  MessageSquare,
  Play,
  Heart,
  Share2,
  UserPlus,
  Calendar,
  Tag
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { SharedCollection } from '@/types/art-persona-matching';
import { PersonalityType } from '@/shared/SAYUTypeDefinitions';
import { APT_TO_ART_MOVEMENT } from '@/types/art-persona-matching';
import { ART_MOVEMENT_PROFILES } from '@/lib/art-movement-profiles';

interface CollectionArtwork {
  id: string;
  title: string;
  artist: string;
  image: string;
  year?: string;
  addedBy: {
    id: string;
    name: string;
    aptType: PersonalityType;
  };
  note?: string;
  voiceNote?: string;
  addedAt: Date;
}

interface SharedCollectionViewerProps {
  collection: SharedCollection & {
    creator: {
      id: string;
      name: string;
      aptType: PersonalityType;
    };
    artworks: CollectionArtwork[];
  };
  currentUserId: string;
  onJoinCollection?: (collectionId: string) => void;
  onLikeCollection?: (collectionId: string) => void;
  onShareCollection?: (collectionId: string) => void;
}

export function SharedCollectionViewer({
  collection,
  currentUserId,
  onJoinCollection,
  onLikeCollection,
  onShareCollection
}: SharedCollectionViewerProps) {
  const [selectedArtwork, setSelectedArtwork] = useState<CollectionArtwork | null>(null);
  const [playingVoiceNote, setPlayingVoiceNote] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');

  const creatorMovement = APT_TO_ART_MOVEMENT[collection.creator.aptType];
  const creatorProfile = ART_MOVEMENT_PROFILES[creatorMovement];

  const isCreator = collection.creator.id === currentUserId;
  const isCollaborator = collection.collaboratorIds.includes(currentUserId);
  const canEdit = isCreator || isCollaborator;

  // 가시성 아이콘과 라벨
  const getVisibilityInfo = () => {
    switch (collection.visibility) {
      case 'private':
        return { icon: Lock, label: '나만 보기' };
      case 'friends':
        return { icon: Users, label: '친구 공개' };
      case 'public':
        return { icon: Globe, label: '전체 공개' };
    }
  };

  const visibilityInfo = getVisibilityInfo();
  const VisibilityIcon = visibilityInfo.icon;

  // 음성 노트 재생
  const playVoiceNote = (voiceNote: string) => {
    if (playingVoiceNote === voiceNote) {
      setPlayingVoiceNote(null);
    } else {
      setPlayingVoiceNote(voiceNote);
      // 실제 음성 재생 로직
    }
  };

  // 타임라인 뷰 렌더링
  const renderTimelineView = () => {
    const sortedArtworks = [...collection.artworks].sort(
      (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
    );

    return (
      <div className="space-y-4">
        {sortedArtworks.map((artwork, index) => {
          const adderMovement = APT_TO_ART_MOVEMENT[artwork.addedBy.aptType];
          const adderProfile = ART_MOVEMENT_PROFILES[adderMovement];

          return (
            <motion.div
              key={artwork.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex gap-4 p-4 bg-secondary/10 rounded-lg"
            >
              <div className="relative">
                <img
                  src={artwork.image}
                  alt={artwork.title}
                  className="w-24 h-24 object-cover rounded-lg cursor-pointer"
                  onClick={() => setSelectedArtwork(artwork)}
                />
                {artwork.voiceNote && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute -bottom-2 -right-2 w-8 h-8 p-0 rounded-full"
                    onClick={() => playVoiceNote(artwork.voiceNote!)}
                  >
                    <Play className={cn(
                      "w-4 h-4",
                      playingVoiceNote === artwork.voiceNote && "animate-pulse"
                    )} />
                  </Button>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h5 className="font-medium">{artwork.title}</h5>
                    <p className="text-sm text-muted-foreground">{artwork.artist}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {new Date(artwork.addedAt).toLocaleDateString('ko-KR')}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: adderProfile.colorPalette[0] }}
                      />
                      <p className="text-xs">{artwork.addedBy.name}</p>
                    </div>
                  </div>
                </div>
                
                {artwork.note && (
                  <div className="mt-2 p-2 bg-white/50 rounded text-sm">
                    <MessageSquare className="w-3 h-3 inline mr-1" />
                    {artwork.note}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  return (
    <Card className="p-6 glass-panel">
      {/* 헤더 */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold">{collection.name}</h3>
          {collection.theme && (
            <p className="text-sm text-muted-foreground mt-1">{collection.theme}</p>
          )}
          
          <div className="flex items-center gap-4 mt-3">
            {/* 크리에이터 정보 */}
            <div className="flex items-center gap-2">
              <div 
                className="w-6 h-6 rounded-full"
                style={{ 
                  background: `linear-gradient(135deg, ${creatorProfile.colorPalette[0]}, ${creatorProfile.colorPalette[1]})` 
                }}
              />
              <span className="text-sm">{collection.creator.name}</span>
            </div>
            
            {/* 가시성 */}
            <Badge variant="outline" className="gap-1">
              <VisibilityIcon className="w-3 h-3" />
              {visibilityInfo.label}
            </Badge>
            
            {/* 작품 수 */}
            <Badge variant="secondary">
              {collection.artworks.length}개 작품
            </Badge>
          </div>
        </div>
        
        {/* 액션 버튼들 */}
        <div className="flex gap-2">
          {!canEdit && collection.visibility !== 'private' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onJoinCollection?.(collection.id)}
            >
              <UserPlus className="w-4 h-4 mr-1" />
              참여
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onLikeCollection?.(collection.id)}
          >
            <Heart className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onShareCollection?.(collection.id)}
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* 태그 */}
      {collection.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {collection.tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="gap-1">
              <Tag className="w-3 h-3" />
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* 뷰 모드 전환 */}
      <div className="flex gap-2 mb-4">
        <Button
          variant={viewMode === 'grid' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('grid')}
        >
          그리드 보기
        </Button>
        <Button
          variant={viewMode === 'timeline' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('timeline')}
        >
          타임라인 보기
        </Button>
      </div>

      {/* 작품 목록 */}
      <AnimatePresence mode="wait">
        {viewMode === 'grid' ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
          >
            {collection.artworks.map((artwork) => (
              <motion.div
                key={artwork.id}
                whileHover={{ scale: 1.05 }}
                className="relative cursor-pointer group"
                onClick={() => setSelectedArtwork(artwork)}
              >
                <img
                  src={artwork.image}
                  alt={artwork.title}
                  className="w-full h-40 object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-3 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform">
                  <p className="text-sm font-medium">{artwork.title}</p>
                  <p className="text-xs opacity-80">{artwork.artist}</p>
                </div>
                {artwork.note && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-white/80 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-3 h-3" />
                  </div>
                )}
                {artwork.voiceNote && (
                  <div className="absolute top-2 left-2 w-6 h-6 bg-white/80 rounded-full flex items-center justify-center">
                    <Play className="w-3 h-3" />
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="timeline"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {renderTimelineView()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 협업자 목록 */}
      {collection.collaboratorIds.length > 0 && (
        <div className="mt-6 pt-6 border-t">
          <h4 className="text-sm font-medium mb-3">함께하는 큐레이터</h4>
          <div className="flex gap-2">
            {collection.collaboratorIds.slice(0, 5).map((_, index) => (
              <div
                key={index}
                className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-medium"
              >
                {index + 1}
              </div>
            ))}
            {collection.collaboratorIds.length > 5 && (
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-medium">
                +{collection.collaboratorIds.length - 5}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 작품 상세 모달 */}
      <AnimatePresence>
        {selectedArtwork && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedArtwork(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedArtwork.image}
                alt={selectedArtwork.title}
                className="w-full h-auto"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold">{selectedArtwork.title}</h3>
                <p className="text-muted-foreground">{selectedArtwork.artist}</p>
                {selectedArtwork.year && (
                  <p className="text-sm text-muted-foreground">{selectedArtwork.year}</p>
                )}
                
                {selectedArtwork.note && (
                  <div className="mt-4 p-4 bg-secondary/20 rounded-lg">
                    <p className="text-sm font-medium mb-1">큐레이터 노트</p>
                    <p className="text-sm">{selectedArtwork.note}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      - {selectedArtwork.addedBy.name}
                    </p>
                  </div>
                )}
                
                <Button
                  className="mt-4"
                  onClick={() => setSelectedArtwork(null)}
                >
                  닫기
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}