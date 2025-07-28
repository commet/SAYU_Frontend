'use client';

import React from 'react';
import { Calendar, Clock, Users, MessageSquare, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import type { CompanionRequest } from '@sayu/shared';
import { TIME_SLOT_OPTIONS, VIEWING_PACE_OPTIONS, INTERACTION_STYLE_OPTIONS } from '@sayu/shared';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface CompanionRequestCardProps {
  request: CompanionRequest;
  showUser?: boolean;
  onAccept?: () => void;
  onMessage?: () => void;
  className?: string;
}

export function CompanionRequestCard({
  request,
  showUser = true,
  onAccept,
  onMessage,
  className
}: CompanionRequestCardProps) {
  const timeSlot = TIME_SLOT_OPTIONS.find(t => t.value === request.preferred_time_slot);
  const viewingPace = VIEWING_PACE_OPTIONS.find(v => v.value === request.viewing_pace);
  const interactionStyle = INTERACTION_STYLE_OPTIONS.find(i => i.value === request.interaction_style);

  // 매칭 점수 계산 (예시)
  const matchScore = request.matches?.[0]?.total_match_score || 0;
  const matchPercentage = Math.round(matchScore * 100);

  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">
              {format(new Date(request.preferred_date), 'M월 d일 EEEE', { locale: ko })}
            </CardTitle>
            <CardDescription>
              {timeSlot?.label} · {request.group_size}명 희망
            </CardDescription>
          </div>
          
          {matchScore > 0 && (
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {matchPercentage}%
              </div>
              <p className="text-xs text-muted-foreground">매칭도</p>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 사용자 정보 */}
        {showUser && request.user && (
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={request.user.profile_image_url} />
              <AvatarFallback>{request.user.username[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium">{request.user.username}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{request.user.apt_type}</span>
                {request.user.age && (
                  <>
                    <span>·</span>
                    <span>{request.user.age}세</span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 관람 스타일 */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="space-y-1">
            <p className="text-muted-foreground">관람 속도</p>
            <Badge variant="secondary">
              {viewingPace?.label}
            </Badge>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground">대화 스타일</p>
            <Badge variant="secondary">
              {interactionStyle?.label}
            </Badge>
          </div>
        </div>

        {/* 메시지 */}
        {request.message && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm">{request.message}</p>
          </div>
        )}

        {/* 선호 APT 타입 */}
        {request.preferred_apt_types && request.preferred_apt_types.length > 0 && (
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">선호하는 동행 타입</p>
            <div className="flex flex-wrap gap-1">
              {request.preferred_apt_types.map(type => (
                <Badge key={type} variant="outline" className="text-xs">
                  {type}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* 액션 버튼 */}
        {(onAccept || onMessage) && (
          <div className="flex gap-2 pt-2">
            {onMessage && (
              <Button variant="outline" size="sm" onClick={onMessage} className="flex-1">
                <MessageSquare className="h-4 w-4 mr-2" />
                메시지
              </Button>
            )}
            {onAccept && (
              <Button size="sm" onClick={onAccept} className="flex-1">
                <Sparkles className="h-4 w-4 mr-2" />
                동행 신청
              </Button>
            )}
          </div>
        )}

        {/* 상태 표시 */}
        {request.status !== 'active' && (
          <div className="pt-2">
            <Badge 
              variant={request.status === 'matched' ? 'default' : 'secondary'}
              className="w-full justify-center"
            >
              {request.status === 'matched' && '매칭 완료'}
              {request.status === 'expired' && '기간 만료'}
              {request.status === 'cancelled' && '취소됨'}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}