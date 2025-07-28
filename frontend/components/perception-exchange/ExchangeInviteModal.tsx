'use client';

import React, { useState } from 'react';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { Send, Info } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { perceptionExchangeApi } from '@/lib/api/perception-exchange';
import { useToast } from '@/hooks/use-toast';
import { PHASE_INFO } from '@sayu/shared';

interface ExchangeInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  artwork: {
    id: string;
    title: string;
    artist: string;
    image_url: string;
    museum_source: string;
  };
  partner: {
    id: string;
    username: string;
    profile_image_url?: string;
    apt_type?: string;
  };
  onSuccess?: () => void;
}

export function ExchangeInviteModal({
  isOpen,
  onClose,
  artwork,
  partner,
  onSuccess
}: ExchangeInviteModalProps) {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    const trimmedMessage = message.trim();
    
    if (trimmedMessage.length < 50) {
      toast({
        title: '메시지가 너무 짧습니다',
        description: '최소 50자 이상 작성해주세요',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await perceptionExchangeApi.createExchange({
        partner_id: partner.id,
        artwork_id: artwork.id,
        museum_source: artwork.museum_source,
        artwork_data: artwork,
        initial_message: trimmedMessage
      });

      toast({
        title: '감상 교환을 시작했습니다',
        description: '상대방이 수락하면 대화가 시작됩니다'
      });

      onSuccess?.();
      handleClose();
    } catch (error) {
      console.error('Failed to create exchange:', error);
      toast({
        title: '초대에 실패했습니다',
        description: '다시 시도해주세요',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setMessage('');
    onClose();
  };

  const wordCount = message.trim().split(/\s+/).filter(Boolean).length;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>감상 교환 신청</DialogTitle>
          <DialogDescription>
            이 작품에 대한 감상을 나누며 천천히 알아가보세요
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 작품 정보 */}
          <div className="flex gap-4 p-4 bg-muted rounded-lg">
            <div className="w-20 h-20 relative rounded overflow-hidden flex-shrink-0">
              <OptimizedImage
                src={artwork.image_url}
                alt={artwork.title}
                fill
                className="object-cover" placeholder="blur" quality={90}
              />
            </div>
            <div className="flex-1">
              <h4 className="font-medium">{artwork.title}</h4>
              <p className="text-sm text-muted-foreground">{artwork.artist}</p>
            </div>
          </div>

          {/* 상대방 정보 */}
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={partner.profile_image_url} />
              <AvatarFallback>{partner.username[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{partner.username}</p>
              {partner.apt_type && (
                <p className="text-sm text-muted-foreground">{partner.apt_type}</p>
              )}
            </div>
          </div>

          {/* 단계 설명 */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>감상 교환은 4단계로 진행됩니다:</strong>
              <ol className="mt-2 space-y-1 text-sm">
                <li>1. 익명으로 작품 감상 나누기</li>
                <li>2. 닉네임 공개하며 대화 이어가기</li>
                <li>3. APT 타입과 프로필 일부 공개</li>
                <li>4. 완전한 프로필 공개 및 자유로운 대화</li>
              </ol>
            </AlertDescription>
          </Alert>

          {/* 첫 메시지 작성 */}
          <div className="space-y-2">
            <Label htmlFor="message">
              첫 감상 메시지 <span className="text-xs text-muted-foreground">(익명으로 전달됩니다)</span>
            </Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="이 작품을 보며 느낀 점을 솔직하게 적어주세요. 왜 이 작품이 마음에 들었는지, 어떤 감정을 느꼈는지 등을 자유롭게 표현해보세요."
              rows={6}
              className="resize-none"
            />
            <div className="flex justify-between text-sm">
              <span className={wordCount < 50 ? 'text-destructive' : 'text-muted-foreground'}>
                {wordCount}자 (최소 50자)
              </span>
              <span className="text-muted-foreground">
                상대방도 동의해야 다음 단계로 진행됩니다
              </span>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || wordCount < 50}
            >
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? '전송 중...' : '감상 교환 시작'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}