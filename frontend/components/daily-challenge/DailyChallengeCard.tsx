'use client';

import React, { useState, useEffect } from 'react';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { Calendar, Clock, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { dailyChallengeApi } from '@/lib/api/daily-challenge';
import { useToast } from '@/hooks/use-toast';
import type { DailyChallenge, ChallengeProgressState } from '../../../shared';
import { EmotionSelector } from './EmotionSelector';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ArtPulseWidget } from '@/components/art-pulse/ArtPulseWidget';
import { ArtPulseSession } from '@/components/art-pulse/ArtPulseSession';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface DailyChallengeCardProps {
  onComplete?: () => void;
}

export function DailyChallengeCard({ onComplete }: DailyChallengeCardProps) {
  const [challenge, setChallenge] = useState<DailyChallenge | null>(null);
  const [progress, setProgress] = useState<ChallengeProgressState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEmotionSelector, setShowEmotionSelector] = useState(false);
  const [showArtPulse, setShowArtPulse] = useState(false);
  const { toast } = useToast();
  
  // Mock user for demo
  const user = { id: 'demo-user', aptType: 'LAEF' };

  useEffect(() => {
    loadChallengeData();
  }, []);

  const loadChallengeData = async () => {
    try {
      const [todayChallenge, userProgress] = await Promise.all([
        dailyChallengeApi.getTodayChallenge(),
        dailyChallengeApi.getChallengeProgress()
      ]);

      setChallenge(todayChallenge);
      setProgress(userProgress);
    } catch (error) {
      console.error('Failed to load challenge:', error);
      toast({
        title: '챌린지를 불러올 수 없습니다',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResponseComplete = () => {
    loadChallengeData();
    onComplete?.();
    setShowEmotionSelector(false);
  };

  if (isLoading) {
    return <DailyChallengeCardSkeleton />;
  }

  if (!challenge) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            오늘의 챌린지가 아직 준비되지 않았습니다.
          </p>
        </CardContent>
      </Card>
    );
  }

  const hasResponded = progress?.hasResponded || false;

  return (
    <>
      <Card className="w-full overflow-hidden">
        {/* 작품 이미지 */}
        <div className="aspect-[16/9] relative bg-muted">
          {challenge.artwork_data.image_url && (
            <OptimizedImage
              src={challenge.artwork_data.image_url}
              alt={challenge.artwork_data.title}
              fill
              className="object-cover"
              priority placeholder="blur" quality={90}
            />
          )}
          
          {/* 연속 참여 배지 */}
          {progress && progress.currentStreak > 0 && (
            <div className="absolute top-4 right-4">
              <Badge variant="secondary" className="bg-background/80 backdrop-blur">
                <TrendingUp className="h-3 w-3 mr-1" />
                {progress.currentStreak}일 연속
              </Badge>
            </div>
          )}
        </div>

        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl">
                {challenge.theme || '오늘의 작품'}
              </CardTitle>
              <CardDescription className="mt-1">
                <span className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(challenge.date), 'M월 d일 EEEE', { locale: ko })}
                </span>
              </CardDescription>
            </div>
            
            {hasResponded && (
              <Badge variant="default" className="bg-green-600">
                <Sparkles className="h-3 w-3 mr-1" />
                참여 완료
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* 작품 정보 */}
          <div>
            <h3 className="font-semibold text-lg">{challenge.artwork_data.title}</h3>
            <p className="text-sm text-muted-foreground">
              {challenge.artwork_data.artist}
              {challenge.artwork_data.date && ` · ${challenge.artwork_data.date}`}
            </p>
          </div>

          {/* 큐레이터 노트 */}
          {challenge.curator_note && (
            <blockquote className="border-l-2 pl-4 italic text-sm text-muted-foreground">
              {challenge.curator_note}
            </blockquote>
          )}

          {/* 다음 리워드까지 진행률 */}
          {progress?.nextReward && !hasResponded && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {progress.nextReward.type === '7day_streak' ? '7일 연속' : '30일 연속'} 달성까지
                </span>
                <span className="font-medium">
                  {progress.nextReward.daysRemaining}일 남음
                </span>
              </div>
              <Progress 
                value={(1 - progress.nextReward.daysRemaining / (progress.nextReward.type === '7day_streak' ? 7 : 30)) * 100} 
              />
            </div>
          )}
        </CardContent>

        <CardFooter>
          {hasResponded ? (
            <Button variant="outline" className="w-full" disabled>
              <Clock className="h-4 w-4 mr-2" />
              내일 다시 만나요!
            </Button>
          ) : (
            <Button 
              className="w-full" 
              onClick={() => setShowEmotionSelector(true)}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              감정 기록하기
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Art Pulse 위젯 */}
      <ArtPulseWidget 
        onOpenSession={() => setShowArtPulse(true)}
        className="fixed bottom-6 right-6"
      />

      {/* Art Pulse 세션 다이얼로그 */}
      <Dialog open={showArtPulse} onOpenChange={setShowArtPulse}>
        <DialogContent className="max-w-5xl p-0">
          {challenge && (
            <ArtPulseSession
              dailyChallengeId={challenge.id}
              artwork={{
                id: challenge.artwork_id,
                imageUrl: challenge.artwork_image,
                title: challenge.artwork_title,
                artist: challenge.artwork_artist
              }}
              userId={user?.id || 'demo-user'}
              userAptType={user?.apt_type || user?.aptType || 'LAEF'}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* 감정 선택 모달 */}
      {challenge && (
        <EmotionSelector
          isOpen={showEmotionSelector}
          onClose={() => setShowEmotionSelector(false)}
          challenge={challenge}
          onComplete={handleResponseComplete}
        />
      )}
    </>
  );
}

function DailyChallengeCardSkeleton() {
  return (
    <Card className="w-full overflow-hidden">
      <Skeleton className="aspect-[16/9] w-full" />
      <CardHeader>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-24 mt-1" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-32 mt-1" />
        </div>
        <Skeleton className="h-16 w-full" />
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );
}