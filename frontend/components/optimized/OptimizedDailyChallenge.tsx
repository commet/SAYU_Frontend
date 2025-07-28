'use client';

import React, { useState, useTransition, startTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Clock } from 'lucide-react';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import type { DailyChallenge } from '../../../shared';

interface OptimizedDailyChallengeProps {
  challenge: DailyChallenge;
  onResponseSubmit: (emotions: string[]) => Promise<void>;
}

export function OptimizedDailyChallenge({ 
  challenge, 
  onResponseSubmit 
}: OptimizedDailyChallengeProps) {
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleEmotionToggle = (emotion: string) => {
    // 비동기 상태 업데이트를 transition으로 감싸기
    startTransition(() => {
      setSelectedEmotions(prev => 
        prev.includes(emotion)
          ? prev.filter(e => e !== emotion)
          : [...prev, emotion]
      );
    });
  };

  const handleSubmit = async () => {
    if (selectedEmotions.length === 0) return;

    startTransition(async () => {
      try {
        await onResponseSubmit(selectedEmotions);
        setIsSubmitted(true);
      } catch (error) {
        console.error('Failed to submit response:', error);
      }
    });
  };

  const emotionOptions = [
    '평온', '기쁨', '호기심', '그리움', '경이', '성찰', '위로', '영감'
  ];

  return (
    <Card className="w-full overflow-hidden">
      {/* 작품 이미지 */}
      <div className="aspect-[16/9] relative bg-muted">
        {challenge.artwork_data?.image_url && (
          <OptimizedImage
            src={challenge.artwork_data.image_url}
            alt={challenge.artwork_data.title}
            fill
            className="object-cover"
            priority
            quality={90}
          />
        )}
        
        {isSubmitted && (
          <div className="absolute top-4 right-4">
            <Badge variant="default" className="bg-green-600">
              <Sparkles className="h-3 w-3 mr-1" />
              참여 완료
            </Badge>
          </div>
        )}
      </div>

      <CardHeader>
        <CardTitle className="text-xl">
          {challenge.theme || '오늘의 작품'}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 작품 정보 */}
        <div>
          <h3 className="font-semibold text-lg">{challenge.artwork_data?.title}</h3>
          <p className="text-sm text-muted-foreground">
            {challenge.artwork_data?.artist}
          </p>
        </div>

        {/* 감정 선택 */}
        {!isSubmitted && (
          <div className="space-y-4">
            <h4 className="font-medium">이 작품을 보며 느끼는 감정을 선택해주세요</h4>
            
            <div className="grid grid-cols-2 gap-3">
              {emotionOptions.map((emotion) => (
                <Button
                  key={emotion}
                  variant={selectedEmotions.includes(emotion) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleEmotionToggle(emotion)}
                  disabled={isPending}
                  className="justify-start transition-colors"
                >
                  {emotion}
                </Button>
              ))}
            </div>

            <Button
              onClick={handleSubmit}
              disabled={selectedEmotions.length === 0 || isPending}
              className="w-full"
            >
              {isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  제출 중...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  감정 기록하기
                </>
              )}
            </Button>
          </div>
        )}

        {/* 완료 상태 */}
        {isSubmitted && (
          <div className="text-center py-6">
            <Clock className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
            <p className="text-lg font-medium">오늘의 감정이 기록되었습니다</p>
            <p className="text-sm text-muted-foreground mt-1">
              내일 다시 만나요!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}