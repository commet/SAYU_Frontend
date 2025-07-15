"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { CalendarIcon, Upload, Plus, Info } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';

// Form schema
const exhibitionSchema = z.object({
  exhibitionTitle: z.string().min(2, '전시명을 입력해주세요'),
  venueName: z.string().min(2, '장소명을 입력해주세요'),
  venueAddress: z.string().optional(),
  startDate: z.date({
    required_error: '시작일을 선택해주세요',
  }),
  endDate: z.date({
    required_error: '종료일을 선택해주세요',
  }),
  artists: z.string().optional(),
  description: z.string().optional(),
  officialUrl: z.string().url().optional().or(z.literal('')),
  posterImageUrl: z.string().url().optional().or(z.literal('')),
  admissionFee: z.string().optional(),
  openingDate: z.date().optional(),
  openingTime: z.string().optional(),
  submitterName: z.string().optional(),
  submitterEmail: z.string().email('올바른 이메일을 입력해주세요'),
  submitterPhone: z.string().optional(),
});

type ExhibitionFormData = z.infer<typeof exhibitionSchema>;

export default function ExhibitionSubmissionForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ExhibitionFormData>({
    resolver: zodResolver(exhibitionSchema),
  });

  const startDate = watch('startDate');
  const endDate = watch('endDate');

  const onSubmit = async (data: ExhibitionFormData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/exhibitions/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          openingEvent: data.openingDate ? {
            date: data.openingDate,
            time: data.openingTime || '',
          } : null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '제출 중 오류가 발생했습니다');
      }

      toast({
        title: '전시 정보 제출 완료',
        description: `${result.message} ${result.pointsAwarded ? `(+${result.pointsAwarded} 포인트)` : ''}`,
      });

      router.push('/exhibitions/submissions');
    } catch (error) {
      toast({
        title: '제출 실패',
        description: error instanceof Error ? error.message : '다시 시도해주세요',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>전시 정보 제보</CardTitle>
          <CardDescription>
            새로운 전시 정보를 제보해주세요. 검증 후 전시 정보에 등록됩니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Exhibition Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">전시 정보</h3>
              
              <div>
                <Label htmlFor="exhibitionTitle">전시명 *</Label>
                <Input
                  id="exhibitionTitle"
                  {...register('exhibitionTitle')}
                  placeholder="예: 데이비드 호크니: 봄의 도착"
                />
                {errors.exhibitionTitle && (
                  <p className="text-sm text-red-500 mt-1">{errors.exhibitionTitle.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">시작일 *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, 'yyyy년 MM월 dd일', { locale: ko }) : '날짜 선택'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(date) => setValue('startDate', date as Date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.startDate && (
                    <p className="text-sm text-red-500 mt-1">{errors.startDate.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="endDate">종료일 *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, 'yyyy년 MM월 dd일', { locale: ko }) : '날짜 선택'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={(date) => setValue('endDate', date as Date)}
                        disabled={(date) => date < (startDate || new Date())}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.endDate && (
                    <p className="text-sm text-red-500 mt-1">{errors.endDate.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="artists">참여 작가</Label>
                <Input
                  id="artists"
                  {...register('artists')}
                  placeholder="작가명을 쉼표로 구분해서 입력 (예: 김환기, 이우환)"
                />
              </div>

              <div>
                <Label htmlFor="description">전시 소개</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="전시에 대한 간단한 소개를 작성해주세요"
                  rows={4}
                />
              </div>
            </div>

            {/* Venue Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">장소 정보</h3>
              
              <div>
                <Label htmlFor="venueName">장소명 *</Label>
                <Input
                  id="venueName"
                  {...register('venueName')}
                  placeholder="예: 국립현대미술관 서울관"
                />
                {errors.venueName && (
                  <p className="text-sm text-red-500 mt-1">{errors.venueName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="venueAddress">주소</Label>
                <Input
                  id="venueAddress"
                  {...register('venueAddress')}
                  placeholder="예: 서울특별시 종로구 삼청로 30"
                />
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">추가 정보</h3>
              
              <div>
                <Label htmlFor="officialUrl">공식 웹사이트</Label>
                <Input
                  id="officialUrl"
                  {...register('officialUrl')}
                  type="url"
                  placeholder="https://"
                />
              </div>

              <div>
                <Label htmlFor="posterImageUrl">포스터 이미지 URL</Label>
                <Input
                  id="posterImageUrl"
                  {...register('posterImageUrl')}
                  type="url"
                  placeholder="https://"
                />
              </div>

              <div>
                <Label htmlFor="admissionFee">입장료</Label>
                <Input
                  id="admissionFee"
                  {...register('admissionFee')}
                  placeholder="예: 15,000원 / 무료"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="openingDate">오프닝 날짜</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {watch('openingDate') ? 
                          format(watch('openingDate'), 'yyyy년 MM월 dd일', { locale: ko }) : 
                          '날짜 선택'
                        }
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={watch('openingDate')}
                        onSelect={(date) => setValue('openingDate', date as Date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label htmlFor="openingTime">오프닝 시간</Label>
                  <Input
                    id="openingTime"
                    {...register('openingTime')}
                    placeholder="예: 17:00"
                  />
                </div>
              </div>
            </div>

            {/* Submitter Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">제보자 정보</h3>
              
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  제보자 정보는 내부 검증용으로만 사용되며 공개되지 않습니다.
                </AlertDescription>
              </Alert>

              <div>
                <Label htmlFor="submitterEmail">이메일 *</Label>
                <Input
                  id="submitterEmail"
                  {...register('submitterEmail')}
                  type="email"
                  placeholder="your@email.com"
                />
                {errors.submitterEmail && (
                  <p className="text-sm text-red-500 mt-1">{errors.submitterEmail.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="submitterName">이름</Label>
                  <Input
                    id="submitterName"
                    {...register('submitterName')}
                    placeholder="홍길동"
                  />
                </div>

                <div>
                  <Label htmlFor="submitterPhone">연락처</Label>
                  <Input
                    id="submitterPhone"
                    {...register('submitterPhone')}
                    placeholder="010-0000-0000"
                  />
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? '제출 중...' : '전시 정보 제출'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}