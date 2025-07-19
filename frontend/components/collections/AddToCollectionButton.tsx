'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Check, FolderPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { collectionsApi, collectionItemsApi } from '@/lib/api/collections';
import { useToast } from '@/hooks/use-toast';
import { CreateCollectionModal } from './CreateCollectionModal';
import type { ArtworkData, ArtCollection } from '@/types/collection';
import { EMOTION_TAGS } from '@/types/collection';
import { cn } from '@/lib/utils';

interface AddToCollectionButtonProps {
  artwork: ArtworkData;
  museumSource: 'met' | 'cleveland' | 'rijksmuseum' | 'artvee';
  variant?: 'default' | 'icon';
  className?: string;
}

export function AddToCollectionButton({
  artwork,
  museumSource,
  variant = 'default',
  className
}: AddToCollectionButtonProps) {
  const [collections, setCollections] = useState<ArtCollection[]>([]);
  const [savedCollections, setSavedCollections] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEmotionDialog, setShowEmotionDialog] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<ArtCollection | null>(null);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [personalNote, setPersonalNote] = useState('');
  const { toast } = useToast();

  // 컬렉션 목록 불러오기
  useEffect(() => {
    loadCollections();
  }, [artwork.id]);

  const loadCollections = async () => {
    try {
      const data = await collectionsApi.getMyCollections();
      setCollections(data || []);
      
      // 이미 저장된 컬렉션 확인
      const saved = new Set<string>();
      for (const collection of data || []) {
        const exists = await collectionItemsApi.checkItemExists(
          collection.id,
          artwork.id
        );
        if (exists) saved.add(collection.id);
      }
      setSavedCollections(saved);
    } catch (error) {
      console.error('Failed to load collections:', error);
    }
  };

  const handleAddToCollection = (collection: ArtCollection) => {
    setSelectedCollection(collection);
    setShowEmotionDialog(true);
  };

  const toggleEmotion = (emotion: string) => {
    if (selectedEmotions.includes(emotion)) {
      setSelectedEmotions(selectedEmotions.filter(e => e !== emotion));
    } else if (selectedEmotions.length < 3) {
      setSelectedEmotions([...selectedEmotions, emotion]);
    }
  };

  const saveToCollection = async () => {
    if (!selectedCollection) return;

    setIsLoading(true);
    try {
      await collectionItemsApi.addItem(selectedCollection.id, {
        artwork_id: artwork.id,
        museum_source: museumSource,
        artwork_data: artwork,
        emotion_tags: selectedEmotions,
        personal_note: personalNote.trim() || undefined
      });

      toast({
        title: '작품이 저장되었습니다',
        description: `"${selectedCollection.title}" 컬렉션에 추가되었습니다`
      });

      setSavedCollections(new Set([...savedCollections, selectedCollection.id]));
      setShowEmotionDialog(false);
      setSelectedEmotions([]);
      setPersonalNote('');
    } catch (error: any) {
      if (error?.code === '23505') {
        toast({
          title: '이미 저장된 작품입니다',
          variant: 'destructive'
        });
      } else {
        toast({
          title: '저장에 실패했습니다',
          description: '다시 시도해주세요',
          variant: 'destructive'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={variant === 'icon' ? 'ghost' : 'outline'}
            size={variant === 'icon' ? 'icon' : 'default'}
            className={className}
          >
            {variant === 'icon' ? (
              <Plus className="h-4 w-4" />
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                컬렉션에 저장
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>내 컬렉션</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {collections.length === 0 ? (
            <div className="px-2 py-4 text-sm text-muted-foreground text-center">
              아직 컬렉션이 없습니다
            </div>
          ) : (
            collections.map((collection) => (
              <DropdownMenuItem
                key={collection.id}
                onClick={() => handleAddToCollection(collection)}
                disabled={savedCollections.has(collection.id)}
              >
                <span className="flex-1">{collection.title}</span>
                {savedCollections.has(collection.id) && (
                  <Check className="h-4 w-4 ml-2 text-green-600" />
                )}
              </DropdownMenuItem>
            ))
          )}
          
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowCreateModal(true)}>
            <FolderPlus className="h-4 w-4 mr-2" />
            새 컬렉션 만들기
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 감정 태그 선택 다이얼로그 */}
      <Dialog open={showEmotionDialog} onOpenChange={setShowEmotionDialog}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>작품에 대한 감정을 기록해주세요</DialogTitle>
            <DialogDescription>
              이 작품을 보며 느낀 감정을 최대 3개까지 선택하세요
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>감정 태그 ({selectedEmotions.length}/3)</Label>
              <div className="flex flex-wrap gap-2">
                {EMOTION_TAGS.map((emotion) => (
                  <Badge
                    key={emotion}
                    variant={selectedEmotions.includes(emotion) ? 'default' : 'outline'}
                    className={cn(
                      'cursor-pointer transition-colors',
                      selectedEmotions.includes(emotion) && 'bg-primary'
                    )}
                    onClick={() => toggleEmotion(emotion)}
                  >
                    {emotion}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">감상평 (선택)</Label>
              <Textarea
                id="note"
                value={personalNote}
                onChange={(e) => setPersonalNote(e.target.value)}
                placeholder="이 작품에 대한 나의 생각..."
                rows={3}
                maxLength={500}
              />
              <p className="text-sm text-muted-foreground">
                {personalNote.length}/500
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEmotionDialog(false);
                  setSelectedEmotions([]);
                  setPersonalNote('');
                }}
              >
                취소
              </Button>
              <Button
                onClick={saveToCollection}
                disabled={isLoading || selectedEmotions.length === 0}
              >
                {isLoading ? '저장 중...' : '저장하기'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 새 컬렉션 만들기 모달 */}
      <CreateCollectionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={loadCollections}
      />
    </>
  );
}