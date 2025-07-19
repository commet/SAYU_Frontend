'use client';

import React, { useState } from 'react';
import { Calendar, Clock, Users, Eye, MessageSquare } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { exhibitionCompanionApi } from '@/lib/api/exhibition-companion';
import { useToast } from '@/hooks/use-toast';
import { 
  TIME_SLOT_OPTIONS, 
  VIEWING_PACE_OPTIONS, 
  INTERACTION_STYLE_OPTIONS 
} from '@/types/exhibition-companion';
import type { Exhibition } from '@/types/exhibition-companion';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface CreateCompanionRequestProps {
  isOpen: boolean;
  onClose: () => void;
  exhibition: Exhibition;
  onSuccess?: () => void;
}

export function CreateCompanionRequest({
  isOpen,
  onClose,
  exhibition,
  onSuccess
}: CreateCompanionRequestProps) {
  const [date, setDate] = useState<Date>();
  const [timeSlot, setTimeSlot] = useState<string>('afternoon');
  const [groupSize, setGroupSize] = useState<string>('2');
  const [viewingPace, setViewingPace] = useState<string>('moderate');
  const [interactionStyle, setInteractionStyle] = useState<string>('flexible');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!date) {
      toast({
        title: '날짜를 선택해주세요',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await exhibitionCompanionApi.createCompanionRequest({
        exhibition_id: exhibition.id,
        preferred_date: format(date, 'yyyy-MM-dd'),
        preferred_time_slot: timeSlot as any,
        group_size: parseInt(groupSize),
        viewing_pace: viewingPace as any,
        interaction_style: interactionStyle as any,
        message: message.trim() || undefined
      });

      toast({
        title: '동행 찾기를 시작했습니다',
        description: '비슷한 취향의 동행자를 찾아드릴게요!'
      });

      onSuccess?.();
      handleClose();
    } catch (error: any) {
      console.error('Failed to create request:', error);
      
      if (error.code === '23505') {
        toast({
          title: '이미 같은 날짜에 동행을 찾고 있습니다',
          variant: 'destructive'
        });
      } else {
        toast({
          title: '요청에 실패했습니다',
          description: '다시 시도해주세요',
          variant: 'destructive'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setDate(undefined);
    setTimeSlot('afternoon');
    setGroupSize('2');
    setViewingPace('moderate');
    setInteractionStyle('flexible');
    setMessage('');
    onClose();
  };

  // 전시 기간 내 날짜만 선택 가능
  const exhibitionStart = new Date(exhibition.start_date);
  const exhibitionEnd = new Date(exhibition.end_date);
  const today = new Date();
  const minDate = today > exhibitionStart ? today : exhibitionStart;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>전시 동행 찾기</DialogTitle>
          <DialogDescription>
            "{exhibition.title}"을 함께 관람할 동행을 찾아보세요
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 날짜 선택 */}
          <div className="space-y-2">
            <Label>관람 날짜</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {date ? format(date, 'yyyy년 MM월 dd일 EEEE', { locale: ko }) : '날짜를 선택하세요'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) => date < minDate || date > exhibitionEnd}
                  locale={ko}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* 시간대 선택 */}
          <div className="space-y-2">
            <Label>선호 시간대</Label>
            <RadioGroup value={timeSlot} onValueChange={setTimeSlot}>
              {TIME_SLOT_OPTIONS.map(option => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="font-normal cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* 인원 선택 */}
          <div className="space-y-2">
            <Label>희망 인원 (본인 포함)</Label>
            <RadioGroup value={groupSize} onValueChange={setGroupSize}>
              <div className="flex gap-4">
                {['2', '3', '4'].map(size => (
                  <div key={size} className="flex items-center space-x-2">
                    <RadioGroupItem value={size} id={`size-${size}`} />
                    <Label htmlFor={`size-${size}`} className="font-normal cursor-pointer">
                      {size}명
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* 관람 스타일 */}
          <div className="space-y-4">
            <div>
              <Label>관람 속도</Label>
              <RadioGroup value={viewingPace} onValueChange={setViewingPace} className="mt-2">
                {VIEWING_PACE_OPTIONS.map(option => (
                  <div key={option.value} className="flex items-start space-x-2 mb-2">
                    <RadioGroupItem value={option.value} id={`pace-${option.value}`} className="mt-1" />
                    <Label htmlFor={`pace-${option.value}`} className="font-normal cursor-pointer">
                      <div>
                        <div>{option.label}</div>
                        <div className="text-sm text-muted-foreground">{option.description}</div>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div>
              <Label>대화 스타일</Label>
              <RadioGroup value={interactionStyle} onValueChange={setInteractionStyle} className="mt-2">
                {INTERACTION_STYLE_OPTIONS.map(option => (
                  <div key={option.value} className="flex items-start space-x-2 mb-2">
                    <RadioGroupItem value={option.value} id={`style-${option.value}`} className="mt-1" />
                    <Label htmlFor={`style-${option.value}`} className="font-normal cursor-pointer">
                      <div>
                        <div>{option.label}</div>
                        <div className="text-sm text-muted-foreground">{option.description}</div>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>

          {/* 메시지 */}
          <div className="space-y-2">
            <Label htmlFor="message">
              동행에게 하고 싶은 말 <span className="text-muted-foreground">(선택)</span>
            </Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="어떤 동행을 원하는지, 전시에 대한 기대 등을 자유롭게 적어주세요"
              rows={3}
              maxLength={200}
            />
            <p className="text-sm text-muted-foreground text-right">
              {message.length}/200
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
              disabled={isSubmitting || !date}
            >
              <Users className="h-4 w-4 mr-2" />
              {isSubmitting ? '등록 중...' : '동행 찾기'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}