'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar,
  Clock,
  MapPin,
  Users,
  Sparkles,
  Timer,
  CheckCircle,
  AlertCircle,
  Coffee,
  Sun,
  Sunset
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { PersonalityType } from '@/types/sayu-shared';
import { ExhibitionMatch } from '@/types/art-persona-matching';
import { APT_TO_ART_MOVEMENT } from '@/types/art-persona-matching';
import { ART_MOVEMENT_PROFILES } from '@/lib/art-movement-profiles';

interface Exhibition {
  id: string;
  title: string;
  venue: string;
  address: string;
  startDate: Date;
  endDate: Date;
  image?: string;
  tags: string[];
}

interface ExhibitionCompanionMatchProps {
  userAptType: PersonalityType;
  userId: string;
  exhibition: Exhibition;
  onCreateMatch?: (match: Omit<ExhibitionMatch, 'id'>) => void;
  existingMatches?: ExhibitionMatch[];
}

const TIME_SLOTS = [
  { id: 'morning', label: '오전', icon: Coffee, time: '10:00 - 12:00' },
  { id: 'afternoon', label: '오후', icon: Sun, time: '14:00 - 17:00' },
  { id: 'evening', label: '저녁', icon: Sunset, time: '18:00 - 20:00' }
] as const;

export function ExhibitionCompanionMatch({
  userAptType,
  userId,
  exhibition,
  onCreateMatch,
  existingMatches = []
}: ExhibitionCompanionMatchProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<typeof TIME_SLOTS[number]['id'] | null>(null);
  const [minCompatibility, setMinCompatibility] = useState(60);
  const [isCreatingMatch, setIsCreatingMatch] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  
  const userArtMovement = APT_TO_ART_MOVEMENT[userAptType];
  const userProfile = ART_MOVEMENT_PROFILES[userArtMovement];

  // 전시 기간 내 주말 날짜 계산
  const getWeekendDates = () => {
    const weekends: Date[] = [];
    const start = new Date(exhibition.startDate);
    const end = new Date(exhibition.endDate);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const day = d.getDay();
      if (day === 0 || day === 6) { // 일요일(0) 또는 토요일(6)
        weekends.push(new Date(d));
      }
    }
    
    return weekends;
  };

  const weekendDates = getWeekendDates();

  // 24시간 카운트다운
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const thursday = new Date();
      thursday.setDate(thursday.getDate() + (4 - thursday.getDay() + 7) % 7);
      thursday.setHours(0, 0, 0, 0);
      
      const diff = thursday.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeRemaining(`${hours}시간 ${minutes}분`);
    }, 60000); // 1분마다 업데이트

    return () => clearInterval(timer);
  }, []);

  // 매칭 생성
  const handleCreateMatch = async () => {
    if (!selectedDate || !selectedTimeSlot) return;
    
    setIsCreatingMatch(true);
    
    const matchData: Omit<ExhibitionMatch, 'id'> = {
      exhibitionId: exhibition.id,
      hostUserId: userId,
      preferredDate: selectedDate,
      timeSlot: selectedTimeSlot,
      matchingCriteria: {
        aptTypes: getCompatibleAptTypes(),
        minCompatibility,
        interests: exhibition.tags
      },
      status: 'open',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24시간 후
    };
    
    try {
      await onCreateMatch?.(matchData);
      // 성공 시 폼 초기화
      setSelectedDate(null);
      setSelectedTimeSlot(null);
    } catch (error) {
      console.error('Failed to create match:', error);
    } finally {
      setIsCreatingMatch(false);
    }
  };

  // 호환 가능한 APT 타입 찾기
  const getCompatibleAptTypes = (): PersonalityType[] => {
    // 실제로는 더 정교한 알고리즘 필요
    return Object.keys(APT_TO_ART_MOVEMENT) as PersonalityType[];
  };

  // 기존 매칭 표시
  const renderExistingMatches = () => {
    const relevantMatches = existingMatches.filter(
      m => m.exhibitionId === exhibition.id && m.status === 'open'
    );
    
    if (relevantMatches.length === 0) return null;
    
    return (
      <div className="mb-6">
        <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
          <Users className="w-4 h-4" />
          진행 중인 매칭 ({relevantMatches.length})
        </h4>
        <div className="space-y-2">
          {relevantMatches.map((match) => {
            const hostMovement = APT_TO_ART_MOVEMENT[userAptType]; // 실제로는 host의 APT 필요
            const hostProfile = ART_MOVEMENT_PROFILES[hostMovement];
            const timeSlot = TIME_SLOTS.find(ts => ts.id === match.timeSlot);
            
            return (
              <motion.div
                key={match.id}
                whileHover={{ scale: 1.02 }}
                className="p-3 border rounded-lg hover:border-primary transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm"
                      style={{ 
                        background: `linear-gradient(135deg, ${hostProfile.colorPalette[0]}, ${hostProfile.colorPalette[1]})` 
                      }}
                    >
                      🎨
                    </div>
                    <div>
                      <p className="text-sm font-medium">{hostProfile.koreanName} 성향</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(match.preferredDate).toLocaleDateString('ko-KR')} 
                        {timeSlot && ` • ${timeSlot.label} ${timeSlot.time}`}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {match.matchingCriteria.minCompatibility}% 이상
                  </Badge>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Card className="p-6 glass-panel">
      {/* 헤더 */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            전시 동행 찾기
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            함께 전시를 관람할 동반자를 찾아보세요
          </p>
        </div>
        <Badge variant="outline" className="gap-1">
          <Timer className="w-3 h-3" />
          {timeRemaining} 남음
        </Badge>
      </div>

      {/* 전시 정보 */}
      <div className="mb-6 p-4 bg-secondary/20 rounded-lg">
        <div className="flex gap-4">
          {exhibition.image && (
            <img 
              src={exhibition.image} 
              alt={exhibition.title}
              className="w-20 h-20 object-cover rounded"
            />
          )}
          <div className="flex-1">
            <h4 className="font-medium">{exhibition.title}</h4>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3" />
              {exhibition.venue}
            </p>
            <div className="flex gap-2 mt-2">
              {exhibition.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 기존 매칭 */}
      {renderExistingMatches()}

      {/* 새 매칭 만들기 */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium">새로운 동행 매칭 만들기</h4>
        
        {/* 날짜 선택 */}
        <div>
          <label className="text-xs text-muted-foreground mb-2 block">
            희망 날짜 (주말만 가능)
          </label>
          <div className="grid grid-cols-3 gap-2">
            {weekendDates.slice(0, 6).map((date) => (
              <Button
                key={date.toISOString()}
                variant={selectedDate?.toDateString() === date.toDateString() ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedDate(date)}
                className="text-xs"
              >
                {date.toLocaleDateString('ko-KR', { 
                  month: 'short', 
                  day: 'numeric',
                  weekday: 'short'
                })}
              </Button>
            ))}
          </div>
        </div>

        {/* 시간대 선택 */}
        <div>
          <label className="text-xs text-muted-foreground mb-2 block">
            선호 시간대
          </label>
          <div className="grid grid-cols-3 gap-2">
            {TIME_SLOTS.map((slot) => {
              const Icon = slot.icon;
              return (
                <Button
                  key={slot.id}
                  variant={selectedTimeSlot === slot.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTimeSlot(slot.id)}
                  className="gap-1"
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-xs">{slot.label}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* 호환성 설정 */}
        <div>
          <label className="text-xs text-muted-foreground mb-2 block">
            최소 호환성: {minCompatibility}%
          </label>
          <input
            type="range"
            min="40"
            max="80"
            step="10"
            value={minCompatibility}
            onChange={(e) => setMinCompatibility(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>다양한 관점</span>
            <span>비슷한 취향</span>
          </div>
        </div>

        {/* 매칭 생성 버튼 */}
        <Button
          onClick={handleCreateMatch}
          disabled={!selectedDate || !selectedTimeSlot || isCreatingMatch}
          className="w-full gap-2"
        >
          {isCreatingMatch ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-4 h-4" />
              </motion.div>
              매칭 생성 중...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              동행 매칭 만들기
            </>
          )}
        </Button>

        {/* 안내 메시지 */}
        <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
          <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
          <div className="text-xs text-blue-600 dark:text-blue-400">
            <p className="font-medium">Thursday 스타일 매칭</p>
            <p>매주 목요일에만 활성화되며, 24시간 내에 매칭이 이루어집니다.</p>
          </div>
        </div>
      </div>
    </Card>
  );
}