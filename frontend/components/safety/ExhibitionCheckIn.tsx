'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin,
  Clock,
  Shield,
  CheckCircle,
  AlertTriangle,
  Phone,
  Navigation,
  Users,
  Calendar,
  Info,
  Share2,
  MessageSquare
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Venue {
  id: string;
  name: string;
  address: string;
  coordinates?: { lat: number; lng: number };
  nearbyLandmarks?: string[];
  safetyRating?: number;
  publicTransport?: string[];
}

interface MatchedUser {
  id: string;
  name: string;
  avatar?: string;
}

interface ExhibitionCheckInProps {
  exhibitionMatchId: string;
  userId: string;
  venue: Venue;
  matchedUser?: MatchedUser;
  scheduledTime: Date;
  onCheckIn?: (data: CheckInData) => void;
  onEmergencyAlert?: () => void;
}

interface CheckInData {
  venueConfirmed: boolean;
  arrivalTime: Date;
  notes?: string;
  emergencyContactEnabled: boolean;
  locationShared: boolean;
}

const SAFETY_TIPS = [
  '공공장소에서 만나기',
  '낮 시간대 선택하기',
  '친구나 가족에게 일정 공유하기',
  '개인정보 보호하기',
  '불편함을 느끼면 즉시 자리 떠나기'
];

export function ExhibitionCheckIn({
  exhibitionMatchId,
  userId,
  venue,
  matchedUser,
  scheduledTime,
  onCheckIn,
  onEmergencyAlert
}: ExhibitionCheckInProps) {
  const [checkInStep, setCheckInStep] = useState<'pre' | 'arrived' | 'completed'>('pre');
  const [venueConfirmed, setVenueConfirmed] = useState(false);
  const [emergencyContactEnabled, setEmergencyContactEnabled] = useState(false);
  const [locationShared, setLocationShared] = useState(false);
  const [notes, setNotes] = useState('');
  const [timeUntilMeeting, setTimeUntilMeeting] = useState('');
  const [showSafetyInfo, setShowSafetyInfo] = useState(true);

  // 만남 시간까지 남은 시간 계산
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const diff = scheduledTime.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeUntilMeeting('만남 시간입니다');
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeUntilMeeting(`${hours}시간 ${minutes}분 남음`);
      }
    }, 60000);

    return () => clearInterval(timer);
  }, [scheduledTime]);

  // 체크인 처리
  const handleCheckIn = () => {
    const checkInData: CheckInData = {
      venueConfirmed,
      arrivalTime: new Date(),
      notes: notes.trim() || undefined,
      emergencyContactEnabled,
      locationShared
    };

    onCheckIn?.(checkInData);
    setCheckInStep('arrived');
  };

  // 만남 완료 처리
  const handleMeetingComplete = () => {
    setCheckInStep('completed');
  };

  // 위치 공유
  const shareLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationShared(true);
          // 실제로는 백엔드에 위치 정보 전송
          console.log('Location shared:', position.coords);
        },
        (error) => {
          console.error('Location error:', error);
        }
      );
    }
  };

  // 긴급 연락처 설정
  const setupEmergencyContact = () => {
    setEmergencyContactEnabled(true);
    // 실제로는 긴급 연락처 설정 모달 열기
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* 안전 팁 배너 */}
      <AnimatePresence>
        {showSafetyInfo && checkInStep === 'pre' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 dark:text-blue-100">
                      안전한 만남을 위한 팁
                    </h4>
                    <ul className="mt-2 space-y-1">
                      {SAFETY_TIPS.map((tip, i) => (
                        <li key={i} className="text-sm text-blue-700 dark:text-blue-300">
                          • {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSafetyInfo(false)}
                  className="text-blue-600"
                >
                  닫기
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 메인 체크인 카드 */}
      <Card className="p-6 glass-panel">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              전시 동행 체크인
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {venue.name}
            </p>
          </div>
          <Badge variant={checkInStep === 'completed' ? 'default' : 'secondary'}>
            {checkInStep === 'pre' && '체크인 대기'}
            {checkInStep === 'arrived' && '만남 진행 중'}
            {checkInStep === 'completed' && '만남 완료'}
          </Badge>
        </div>

        {/* 만남 정보 */}
        <div className="space-y-4 mb-6">
          {/* 시간 정보 */}
          <div className="flex items-center gap-3 p-3 bg-secondary/20 rounded-lg">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">
                {scheduledTime.toLocaleDateString('ko-KR', {
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long',
                  hour: 'numeric',
                  minute: 'numeric'
                })}
              </p>
              <p className="text-xs text-muted-foreground">{timeUntilMeeting}</p>
            </div>
          </div>

          {/* 장소 정보 */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Navigation className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">{venue.name}</p>
                <p className="text-sm text-muted-foreground">{venue.address}</p>
                
                {venue.nearbyLandmarks && venue.nearbyLandmarks.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-medium">주변 랜드마크</p>
                    <ul className="text-xs text-muted-foreground">
                      {venue.nearbyLandmarks.map((landmark, i) => (
                        <li key={i}>• {landmark}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <Button variant="outline" size="sm">
                지도 보기
              </Button>
            </div>

            {/* 안전도 평가 */}
            {venue.safetyRating && (
              <div className="flex items-center gap-2">
                <span className="text-sm">안전도</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <div
                      key={rating}
                      className={cn(
                        "w-4 h-4 rounded-full",
                        rating <= venue.safetyRating!
                          ? "bg-green-500"
                          : "bg-gray-300"
                      )}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {venue.safetyRating}/5
                </span>
              </div>
            )}
          </div>

          {/* 매칭 상대 정보 */}
          {matchedUser && (
            <div className="flex items-center gap-3 p-3 bg-secondary/20 rounded-lg">
              <Users className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">함께할 동반자</p>
                <p className="text-sm text-muted-foreground">{matchedUser.name}</p>
              </div>
            </div>
          )}
        </div>

        {/* 체크인 단계별 UI */}
        {checkInStep === 'pre' && (
          <div className="space-y-4">
            {/* 체크인 옵션 */}
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-secondary/20">
                <input
                  type="checkbox"
                  checked={venueConfirmed}
                  onChange={(e) => setVenueConfirmed(e.target.checked)}
                  className="rounded"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">장소 확인 완료</p>
                  <p className="text-xs text-muted-foreground">
                    약속 장소를 확인했습니다
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-secondary/20">
                <input
                  type="checkbox"
                  checked={emergencyContactEnabled}
                  onChange={(e) => setEmergencyContactEnabled(e.target.checked)}
                  className="rounded"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">긴급 연락처 설정</p>
                  <p className="text-xs text-muted-foreground">
                    믿을 수 있는 사람에게 일정 공유
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={setupEmergencyContact}
                >
                  설정
                </Button>
              </label>

              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-secondary/20">
                <input
                  type="checkbox"
                  checked={locationShared}
                  onChange={(e) => setLocationShared(e.target.checked)}
                  className="rounded"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">위치 공유</p>
                  <p className="text-xs text-muted-foreground">
                    안전을 위해 위치 정보 공유
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={shareLocation}
                >
                  공유
                </Button>
              </label>
            </div>

            {/* 메모 */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                메모 (선택사항)
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="특별한 사항이나 기억할 내용을 적어주세요"
                rows={3}
              />
            </div>

            {/* 체크인 버튼 */}
            <Button
              onClick={handleCheckIn}
              disabled={!venueConfirmed}
              className="w-full gap-2"
              size="lg"
            >
              <CheckCircle className="w-5 h-5" />
              체크인하기
            </Button>
          </div>
        )}

        {checkInStep === 'arrived' && (
          <div className="space-y-4">
            <div className="text-center py-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle className="w-10 h-10 text-green-600" />
              </motion.div>
              <h4 className="text-lg font-semibold mb-2">체크인 완료!</h4>
              <p className="text-sm text-muted-foreground">
                즐거운 전시 관람 되세요
              </p>
            </div>

            {/* 긴급 버튼 */}
            <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
              <p className="text-sm font-medium text-red-900 dark:text-red-100 mb-3">
                도움이 필요하신가요?
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 text-red-600 border-red-600 hover:bg-red-100"
                  onClick={onEmergencyAlert}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  긴급 연락
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setCheckInStep('completed')}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  신고하기
                </Button>
              </div>
            </div>

            {/* 만남 완료 버튼 */}
            <Button
              variant="outline"
              className="w-full"
              onClick={handleMeetingComplete}
            >
              만남 완료
            </Button>
          </div>
        )}

        {checkInStep === 'completed' && (
          <div className="text-center py-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Users className="w-10 h-10 text-blue-600" />
            </motion.div>
            <h4 className="text-lg font-semibold mb-2">만남이 완료되었습니다</h4>
            <p className="text-sm text-muted-foreground mb-4">
              오늘의 전시는 어떠셨나요?
            </p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" size="sm">
                리뷰 작성
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-1" />
                경험 공유
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* 긴급 상황 정보 */}
      <Card className="p-4 border-orange-200 bg-orange-50 dark:bg-orange-950/20">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-orange-900 dark:text-orange-100">
              긴급 상황 시
            </p>
            <p className="text-orange-700 dark:text-orange-300 mt-1">
              불편하거나 위험을 느끼시면 즉시 자리를 떠나고 도움을 요청하세요.
              긴급전화: 112 (경찰), 119 (구급)
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}