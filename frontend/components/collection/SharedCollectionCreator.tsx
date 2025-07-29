'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus,
  Users,
  Tag,
  Image as ImageIcon,
  Mic,
  Send,
  Lock,
  Globe,
  UserPlus,
  Sparkles,
  Palette,
  MessageSquare
} from 'lucide-react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { SharedCollection } from '@/types/art-persona-matching';
import { PersonalityType } from '@sayu/shared';

interface Artwork {
  id: string;
  title: string;
  artist: string;
  image: string;
  year?: string;
  tags?: string[];
}

interface SharedCollectionCreatorProps {
  userId: string;
  userAptType: PersonalityType;
  onCreateCollection?: (collection: Omit<SharedCollection, 'id' | 'createdAt' | 'updatedAt'>) => void;
  suggestedArtworks?: Artwork[];
}

const COLLECTION_THEMES = [
  { id: 'sunday-morning', label: '일요일 아침의 미학', emoji: '☀️' },
  { id: 'urban-melancholy', label: '도시의 우울', emoji: '🌃' },
  { id: 'nature-healing', label: '자연의 치유', emoji: '🌿' },
  { id: 'memory-fragments', label: '기억의 조각들', emoji: '💭' },
  { id: 'color-emotions', label: '색채의 감정', emoji: '🎨' },
  { id: 'time-journey', label: '시간 여행', emoji: '⏰' },
  { id: 'dream-scape', label: '꿈의 풍경', emoji: '🌙' },
  { id: 'human-connection', label: '인간의 연결', emoji: '🤝' }
];

export function SharedCollectionCreator({
  userId,
  userAptType,
  onCreateCollection,
  suggestedArtworks = []
}: SharedCollectionCreatorProps) {
  const [collectionName, setCollectionName] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<string>('');
  const [customTheme, setCustomTheme] = useState('');
  const [visibility, setVisibility] = useState<'private' | 'friends' | 'public'>('private');
  const [selectedArtworks, setSelectedArtworks] = useState<Set<string>>(new Set());
  const [artworkNotes, setArtworkNotes] = useState<Record<string, string>>({});
  const [collaboratorIds, setCollaboratorIds] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // 작품 선택 토글
  const toggleArtwork = (artworkId: string) => {
    const newSelected = new Set(selectedArtworks);
    if (newSelected.has(artworkId)) {
      newSelected.delete(artworkId);
      delete artworkNotes[artworkId];
    } else {
      newSelected.add(artworkId);
    }
    setSelectedArtworks(newSelected);
  };

  // 작품 노트 추가
  const addArtworkNote = (artworkId: string, note: string) => {
    setArtworkNotes({ ...artworkNotes, [artworkId]: note });
  };

  // 태그 추가
  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  // 컬렉션 생성
  const handleCreateCollection = () => {
    if (!collectionName.trim() || selectedArtworks.size === 0) return;

    setIsCreating(true);
    
    const theme = selectedTheme === 'custom' ? customTheme : 
                  COLLECTION_THEMES.find(t => t.id === selectedTheme)?.label || '';

    const collectionData: Omit<SharedCollection, 'id' | 'createdAt' | 'updatedAt'> = {
      name: collectionName,
      theme,
      creatorId: userId,
      collaboratorIds,
      artworks: Array.from(selectedArtworks).map(artworkId => ({
        artworkId,
        addedBy: userId,
        note: artworkNotes[artworkId],
        addedAt: new Date()
      })),
      visibility,
      tags
    };

    setTimeout(() => {
      onCreateCollection?.(collectionData);
      setIsCreating(false);
      // 폼 초기화
      setCollectionName('');
      setSelectedTheme('');
      setSelectedArtworks(new Set());
      setArtworkNotes({});
      setTags([]);
    }, 1000);
  };

  return (
    <Card className="p-6 glass-panel max-w-4xl mx-auto">
      <div className="space-y-6">
        {/* 헤더 */}
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Palette className="w-5 h-5" />
            큐레이터의 선택 - 공유 컬렉션 만들기
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            당신만의 테마로 작품을 큐레이션하고 다른 사람들과 공유하세요
          </p>
        </div>

        {/* 기본 정보 */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              컬렉션 이름
            </label>
            <Input
              value={collectionName}
              onChange={(e) => setCollectionName(e.target.value)}
              placeholder="예: 봄날의 색채들"
              maxLength={50}
            />
          </div>

          {/* 테마 선택 */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              테마 선택
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
              {COLLECTION_THEMES.map((theme) => (
                <Button
                  key={theme.id}
                  variant={selectedTheme === theme.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTheme(theme.id)}
                  className="justify-start gap-2 text-xs"
                >
                  <span>{theme.emoji}</span>
                  <span className="truncate">{theme.label}</span>
                </Button>
              ))}
            </div>
            <Button
              variant={selectedTheme === 'custom' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTheme('custom')}
              className="w-full"
            >
              직접 입력
            </Button>
            {selectedTheme === 'custom' && (
              <Input
                value={customTheme}
                onChange={(e) => setCustomTheme(e.target.value)}
                placeholder="나만의 테마를 입력하세요"
                className="mt-2"
              />
            )}
          </div>
        </div>

        {/* 작품 선택 */}
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Image className="w-4 h-4" />
            작품 선택 ({selectedArtworks.size}개 선택됨)
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
            {suggestedArtworks.map((artwork) => {
              const isSelected = selectedArtworks.has(artwork.id);
              return (
                <motion.div
                  key={artwork.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "relative cursor-pointer rounded-lg overflow-hidden border-2 transition-colors",
                    isSelected ? "border-primary" : "border-transparent"
                  )}
                  onClick={() => toggleArtwork(artwork.id)}
                >
                  <div className="relative w-full h-32">
                    <Image
                      src={artwork.image}
                      alt={artwork.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-2 text-white">
                    <p className="text-xs font-medium truncate">{artwork.title}</p>
                    <p className="text-xs opacity-80 truncate">{artwork.artist}</p>
                  </div>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center"
                    >
                      <Plus className="w-4 h-4 text-white rotate-45" />
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* 선택된 작품에 노트 추가 */}
        {selectedArtworks.size > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              작품별 노트 (선택사항)
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {Array.from(selectedArtworks).map((artworkId) => {
                const artwork = suggestedArtworks.find(a => a.id === artworkId);
                if (!artwork) return null;
                
                return (
                  <div key={artworkId} className="flex gap-3 p-2 bg-secondary/20 rounded-lg">
                    <div className="relative w-12 h-12">
                      <Image
                        src={artwork.image}
                        alt={artwork.title}
                        fill
                        className="object-cover rounded"
                        sizes="48px"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium">{artwork.title}</p>
                      <Input
                        placeholder="이 작품을 선택한 이유는..."
                        value={artworkNotes[artworkId] || ''}
                        onChange={(e) => addArtworkNote(artworkId, e.target.value)}
                        className="mt-1 text-xs"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1"
                    >
                      <Mic className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 태그 추가 */}
        <div>
          <label className="text-sm font-medium mb-2 block flex items-center gap-2">
            <Tag className="w-4 h-4" />
            태그
          </label>
          <div className="flex gap-2 mb-2">
            <Input
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTag()}
              placeholder="태그 입력"
              className="flex-1"
            />
            <Button onClick={addTag} size="sm">
              추가
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="gap-1"
              >
                {tag}
                <button
                  onClick={() => setTags(tags.filter((_, i) => i !== index))}
                  className="ml-1 hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        </div>

        {/* 공개 설정 */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            공개 설정
          </label>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant={visibility === 'private' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setVisibility('private')}
              className="gap-2"
            >
              <Lock className="w-4 h-4" />
              나만 보기
            </Button>
            <Button
              variant={visibility === 'friends' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setVisibility('friends')}
              className="gap-2"
            >
              <Users className="w-4 h-4" />
              친구 공개
            </Button>
            <Button
              variant={visibility === 'public' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setVisibility('public')}
              className="gap-2"
            >
              <Globe className="w-4 h-4" />
              전체 공개
            </Button>
          </div>
        </div>

        {/* 생성 버튼 */}
        <Button
          onClick={handleCreateCollection}
          disabled={!collectionName.trim() || selectedArtworks.size === 0 || isCreating}
          className="w-full gap-2"
          size="lg"
        >
          {isCreating ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-4 h-4" />
              </motion.div>
              컬렉션 생성 중...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              컬렉션 만들기
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}