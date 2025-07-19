'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { collectionsApi } from '@/lib/api/collections';
import { useToast } from '@/hooks/use-toast';

interface CreateCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateCollectionModal({
  isOpen,
  onClose,
  onSuccess
}: CreateCollectionModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: '제목을 입력해주세요',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      await collectionsApi.createCollection({
        title: title.trim(),
        description: description.trim() || undefined,
        is_public: isPublic
      });

      toast({
        title: '컬렉션이 생성되었습니다',
        description: '이제 마음에 드는 작품을 저장해보세요!'
      });

      // 초기화
      setTitle('');
      setDescription('');
      setIsPublic(true);
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to create collection:', error);
      toast({
        title: '컬렉션 생성에 실패했습니다',
        description: '다시 시도해주세요',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>새 컬렉션 만들기</DialogTitle>
          <DialogDescription>
            작품을 모을 컬렉션을 만들어보세요. 나만의 미술관을 큐레이팅할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">컬렉션 이름</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 평온함을 주는 작품들"
              maxLength={50}
              required
            />
            <p className="text-sm text-muted-foreground">
              {title.length}/50
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">설명 (선택)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="이 컬렉션에 대해 설명해주세요"
              rows={3}
              maxLength={200}
            />
            <p className="text-sm text-muted-foreground">
              {description.length}/200
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="public">공개 설정</Label>
              <p className="text-sm text-muted-foreground">
                다른 사람들이 이 컬렉션을 볼 수 있습니다
              </p>
            </div>
            <Switch
              id="public"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !title.trim()}
            >
              {isLoading ? '생성 중...' : '컬렉션 만들기'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}