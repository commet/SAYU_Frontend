'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Eye, MessageSquare, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { exhibitionCompanionApi } from '@/lib/api/exhibition-companion';
import { useToast } from '@/hooks/use-toast';
import { 
  TIME_SLOT_OPTIONS, 
  VIEWING_PACE_OPTIONS, 
  INTERACTION_STYLE_OPTIONS 
} from '@/types/exhibition-companion';
import type { Exhibition, CompanionRequest } from '@/types/exhibition-companion';
import { format, isSameDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface CreateCompanionRequestProps {
  isOpen: boolean;
  onClose: () => void;
  exhibition: Exhibition;
  onSuccess?: () => void;
}

interface DateAvailability {
  date: string;
  requestCount: number;
  hasMyRequest: boolean;
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
  const [aptCompatibilityMode, setAptCompatibilityMode] = useState<string>('flexible');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 새로운 상태들
  const [enableGroupMatching, setEnableGroupMatching] = useState(false);
  const [dateAvailability, setDateAvailability] = useState<DateAvailability[]>([]);
  const [isCheckingDate, setIsCheckingDate] = useState(false);
  const [existingRequests, setExistingRequests] = useState<CompanionRequest[]>([]);
  
  const { toast } = useToast();

  const aptCompatibilityOptions = [
    {
      value: 'strict',
      label: '높은 호환성',
      description: '나와 매우 유사한 예술 취향을 가진 사람',
      emoji: '🎯'
    },
    {
      value: 'moderate', 
      label: '균형잡힌 호환성',
      description: '비슷하면서도 다른 관점을 가진 사람',
      emoji: '⚖️'
    },
    {
      value: 'flexible',
      label: '다양한 호환성',
      description: '새로운 관점을 제시해줄 수 있는 사람',
      emoji: '🌟'
    }
  ];

  // 내 기존 요청 로드
  useEffect(() => {
    if (isOpen) {
      loadExistingRequests();
    }
  }, [isOpen]);

  // 날짜 선택 시 해당 날짜의 요청 상태 확인
  useEffect(() => {
    if (date) {
      checkDateAvailability(date);
    }
  }, [date]);

  const loadExistingRequests = async () => {
    try {
      const requests = await exhibitionCompanionApi.getMyCompanionRequests();
      setExistingRequests(requests.filter(req => req.exhibition_id === exhibition.id));
    } catch (error) {
      console.error('Failed to load existing requests:', error);
    }
  };

  const checkDateAvailability = async (selectedDate: Date) => {
    setIsCheckingDate(true);
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      
      // 해당 날짜의 요청들 가져오기
      const requests = await exhibitionCompanionApi.getRequestsByDate(exhibition.id, dateStr);
      
      // 내 요청이 있는지 확인
      const hasMyRequest = existingRequests.some(req => 
        req.preferred_date === dateStr && req.status !== 'cancelled'
      );
      
      setDateAvailability([{
        date: dateStr,
        requestCount: requests.length,
        hasMyRequest
      }]);
      
    } catch (error) {
      console.error('Failed to check date availability:', error);
    } finally {
      setIsCheckingDate(false);
    }
  };

  const handleSubmit = async () => {
    if (!date) {
      toast({
        title: '날짜를 선택해주세요',
        variant: 'destructive'
      });
      return;
    }

    // 날짜 중복 체크
    const dateStr = format(date, 'yyyy-MM-dd');
    const hasExistingRequest = existingRequests.some(req => 
      req.preferred_date === dateStr && req.status !== 'cancelled'
    );

    if (hasExistingRequest && !enableGroupMatching) {
      toast({
        title: '이미 같은 날짜에 동행을 찾고 있습니다',
        description: '다른 날짜를 선택하거나 기존 요청을 취소해주세요',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await exhibitionCompanionApi.createCompanionRequest({
        exhibition_id: exhibition.id,
        preferred_date: dateStr,
        preferred_time_slot: timeSlot as any,
        group_size: parseInt(groupSize),
        viewing_pace: viewingPace as any,
        interaction_style: interactionStyle as any,
        apt_compatibility_mode: aptCompatibilityMode as any,
        message: message.trim() || undefined,
        enable_group_matching: enableGroupMatching
      });

      toast({
        title: '동행 찾기를 시작했습니다',
        description: enableGroupMatching 
          ? '기존 그룹과의 매칭도 진행됩니다!' 
          : '비슷한 취향의 동행자를 찾아드릴게요!'
      });

      onSuccess?.();
      handleClose();
    } catch (error: any) {
      console.error('Failed to create request:', error);
      
      toast({
        title: '요청에 실패했습니다',
        description: error.message || '다시 시도해주세요',
        variant: 'destructive'
      });
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
    setEnableGroupMatching(false);
    setDateAvailability([]);
    setExistingRequests([]);
    onClose();
  };

  // 전시 기간 내 날짜만 선택 가능
  const exhibitionStart = new Date(exhibition.start_date);
  const exhibitionEnd = new Date(exhibition.end_date);
  const today = new Date();
  const minDate = today > exhibitionStart ? today : exhibitionStart;

  // 날짜별 상태 표시를 위한 함수
  const getDateStatus = (checkDate: Date) => {
    const dateStr = format(checkDate, 'yyyy-MM-dd');
    const availability = dateAvailability.find(a => a.date === dateStr);
    
    if (availability?.hasMyRequest) {
      return { type: 'my-request', label: '내 요청' };
    }
    if (availability && availability.requestCount > 0) {
      return { type: 'has-requests', label: `${availability.requestCount}명 대기` };
    }
    return null;
  };

  const selectedDateAvailability = date ? dateAvailability.find(a => a.date === format(date, 'yyyy-MM-dd')) : null;

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
                  modifiers={{
                    hasMyRequest: (date) => {
                      const dateStr = format(date, 'yyyy-MM-dd');
                      return existingRequests.some(req => 
                        req.preferred_date === dateStr && req.status !== 'cancelled'
                      );
                    }
                  }}
                  modifiersStyles={{
                    hasMyRequest: {
                      backgroundColor: 'hsl(var(--primary))',
                      color: 'white',
                      fontWeight: 'bold'
                    }
                  }}
                />
              </PopoverContent>
            </Popover>
            
            {/* 날짜 가용성 표시 */}
            {date && (
              <div className="mt-2">
                {isCheckingDate ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    날짜 확인 중...
                  </div>
                ) : selectedDateAvailability ? (
                  <Alert className={cn(
                    "py-2",
                    selectedDateAvailability.hasMyRequest && "border-orange-500"
                  )}>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {selectedDateAvailability.hasMyRequest ? (
                        <span className="text-orange-600">
                          이미 이 날짜에 동행 요청이 있습니다. 
                          그룹 매칭을 활성화하면 기존 그룹에 합류할 수 있습니다.
                        </span>
                      ) : selectedDateAvailability.requestCount > 0 ? (
                        <span>
                          현재 {selectedDateAvailability.requestCount}명이 이 날짜에 동행을 찾고 있습니다.
                        </span>
                      ) : (
                        <span className="text-green-600">
                          이 날짜에는 아직 동행 요청이 없습니다.
                        </span>
                      )}
                    </AlertDescription>
                  </Alert>
                ) : null}
              </div>
            )}
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

          {/* 인원 및 그룹 매칭 */}
          <div className="space-y-4">
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

            {/* 그룹 매칭 옵션 */}
            {parseInt(groupSize) > 2 && (
              <div className="flex items-start space-x-3 rounded-lg border p-4">
                <Checkbox 
                  id="group-matching"
                  checked={enableGroupMatching}
                  onCheckedChange={(checked) => setEnableGroupMatching(checked as boolean)}
                />
                <div className="space-y-1">
                  <Label 
                    htmlFor="group-matching" 
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    기존 그룹과 매칭 허용
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    이미 형성된 2인 그룹과 함께 {groupSize}인 그룹을 만들 수 있습니다
                  </p>
                </div>
              </div>
            )}
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

          {/* APT 호환성 선택 */}
          <div className="space-y-2">
            <Label>예술 취향 호환성</Label>
            <p className="text-sm text-muted-foreground">
              어떤 성향의 동행자를 원하시나요?
            </p>
            <RadioGroup value={aptCompatibilityMode} onValueChange={setAptCompatibilityMode} className="mt-2">
              {aptCompatibilityOptions.map(option => (
                <div key={option.value} className="flex items-start space-x-2 mb-2">
                  <RadioGroupItem value={option.value} id={`apt-${option.value}`} className="mt-1" />
                  <Label htmlFor={`apt-${option.value}`} className="font-normal cursor-pointer">
                    <div className="flex items-start gap-3">
                      <span className="text-lg">{option.emoji}</span>
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-sm text-muted-foreground">{option.description}</div>
                      </div>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
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

          {/* 요약 정보 */}
          {date && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                <strong>{format(date, 'MM월 dd일')} {TIME_SLOT_OPTIONS.find(t => t.value === timeSlot)?.label}</strong>에{' '}
                <strong>{groupSize}명</strong>으로 전시를 관람할 동행을 찾습니다
                {enableGroupMatching && ' (그룹 매칭 허용)'}
              </AlertDescription>
            </Alert>
          )}

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