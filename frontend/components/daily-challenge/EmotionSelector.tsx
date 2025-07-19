'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { dailyChallengeApi } from '@/lib/api/daily-challenge';
import { useToast } from '@/hooks/use-toast';
import { EMOTION_TAGS } from '@/types/collection';
import type { DailyChallenge } from '@/types/daily-challenge';
import { cn } from '@/lib/utils';

interface EmotionSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  challenge: DailyChallenge;
  onComplete?: () => void;
}

export function EmotionSelector({ 
  isOpen, 
  onClose, 
  challenge,
  onComplete 
}: EmotionSelectorProps) {
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [personalNote, setPersonalNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanged, setHasChanged] = useState(false);
  const { toast } = useToast();
  
  // 시간 측정
  const startTimeRef = useRef<number>(Date.now());
  const initialSelectionsRef = useRef<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      // 모달이 열릴 때 시간 기록
      startTimeRef.current = Date.now();
      initialSelectionsRef.current = [];
      setHasChanged(false);
    }
  }, [isOpen]);

  const toggleEmotion = (emotion: string) => {
    const newSelection = selectedEmotions.includes(emotion)
      ? selectedEmotions.filter(e => e !== emotion)
      : selectedEmotions.length < 3
      ? [...selectedEmotions, emotion]
      : selectedEmotions;

    setSelectedEmotions(newSelection);

    // 변경 여부 추적
    if (initialSelectionsRef.current.length === 0 && newSelection.length === 3) {
      initialSelectionsRef.current = [...newSelection];
    } else if (initialSelectionsRef.current.length > 0) {
      const isDifferent = !arraysEqual(initialSelectionsRef.current, newSelection);
      setHasChanged(isDifferent);
    }
  };

  const arraysEqual = (a: string[], b: string[]) => {
    if (a.length !== b.length) return false;
    const sortedA = [...a].sort();
    const sortedB = [...b].sort();
    return sortedA.every((val, idx) => val === sortedB[idx]);
  };

  const handleSubmit = async () => {
    if (selectedEmotions.length !== 3) {
      toast({
        title: '감정을 3개 선택해주세요',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    const selectionTime = (Date.now() - startTimeRef.current) / 1000; // 초 단위

    try {
      await dailyChallengeApi.submitResponse(
        challenge.date,
        selectedEmotions,
        selectionTime,
        hasChanged,
        personalNote.trim() || undefined
      );

      toast({
        title: '감정이 기록되었습니다',
        description: '오늘의 매칭 결과를 확인해보세요!'
      });

      onComplete?.();
      handleClose();
    } catch (error: any) {
      console.error('Failed to submit response:', error);
      
      if (error.code === '23505') {
        toast({
          title: '이미 오늘의 챌린지에 참여했습니다',
          variant: 'destructive'
        });
      } else {
        toast({
          title: '제출에 실패했습니다',
          description: '다시 시도해주세요',
          variant: 'destructive'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedEmotions([]);
    setPersonalNote('');
    setHasChanged(false);
    onClose();
  };

  // 감정 카테고리 분류
  const emotionCategories = {
    긍정적: ['평온함', '기쁨', '설렘', '따뜻함', '경이로움', '희망적', '자유로움', '영감', '활력', '만족감', '감동', '행복함'],
    성찰적: ['그리움', '몽환적', '신비로움', '사색적', '깊이있음', '철학적', '명상적', '초월적', '영적인', '숭고함', '경건함', '고요함'],
    복잡한: ['우울함', '불안함', '긴장감', '혼란스러움', '압도됨', '충격적', '도전적', '낯설음', '불편함', '강렬함', '날카로움', '무거움']
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>이 작품을 보며 느낀 감정은?</DialogTitle>
          <DialogDescription>
            가장 강하게 느껴지는 감정 3개를 선택해주세요
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 감정 선택 현황 */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>{selectedEmotions.length}/3개</strong> 선택됨
              {hasChanged && <span className="text-muted-foreground ml-2">(수정됨)</span>}
            </AlertDescription>
          </Alert>

          {/* 감정 태그 선택 */}
          <div className="space-y-4">
            {Object.entries(emotionCategories).map(([category, emotions]) => (
              <div key={category} className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">
                  {category} 감정
                </Label>
                <div className="flex flex-wrap gap-2">
                  {emotions.map((emotion) => (
                    <Badge
                      key={emotion}
                      variant={selectedEmotions.includes(emotion) ? 'default' : 'outline'}
                      className={cn(
                        'cursor-pointer transition-all hover:scale-105',
                        selectedEmotions.includes(emotion) 
                          ? 'bg-primary hover:bg-primary/90' 
                          : 'hover:bg-primary/10',
                        selectedEmotions.length >= 3 && !selectedEmotions.includes(emotion)
                          ? 'opacity-50 cursor-not-allowed'
                          : ''
                      )}
                      onClick={() => {
                        if (selectedEmotions.length < 3 || selectedEmotions.includes(emotion)) {
                          toggleEmotion(emotion);
                        }
                      }}
                    >
                      {emotion}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* 감상평 (선택) */}
          <div className="space-y-2">
            <Label htmlFor="note">
              감상평 <span className="text-muted-foreground">(선택)</span>
            </Label>
            <Textarea
              id="note"
              value={personalNote}
              onChange={(e) => setPersonalNote(e.target.value)}
              placeholder="이 작품에 대한 생각을 자유롭게 적어주세요..."
              rows={3}
              maxLength={500}
            />
            <p className="text-sm text-muted-foreground text-right">
              {personalNote.length}/500
            </p>
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
              disabled={isSubmitting || selectedEmotions.length !== 3}
            >
              {isSubmitting ? '제출 중...' : '감정 기록하기'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}