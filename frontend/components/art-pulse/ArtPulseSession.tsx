"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  Users, 
  Sparkles, 
  Heart,
  Brain,
  Eye,
  Zap,
  RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';
// RealtimeChannel type - works with both real and mock Supabase
type RealtimeChannel = any;

interface TouchPoint {
  x: number;
  y: number;
  timestamp: number;
  userId: string;
}

interface ResonanceData {
  userId: string;
  touchPoints: TouchPoint[];
  resonanceType: 'sensory' | 'emotional' | 'cognitive' | null;
  intensity: number;
  aptType?: string;
}

interface ArtPulseSessionProps {
  dailyChallengeId: string;
  artwork: {
    id: string;
    imageUrl: string;
    title: string;
    artist: string;
  };
  userId: string;
  userAptType: string;
}

export function ArtPulseSession({ 
  dailyChallengeId, 
  artwork, 
  userId,
  userAptType 
}: ArtPulseSessionProps) {
  const [sessionPhase, setSessionPhase] = useState<'waiting' | 'preview' | 'active' | 'results'>('waiting');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [touchHeatmap, setTouchHeatmap] = useState<TouchPoint[]>([]);
  const [myResonance, setMyResonance] = useState<ResonanceData>({
    userId,
    touchPoints: [],
    resonanceType: null,
    intensity: 5,
    aptType: userAptType
  });
  const [otherResonances, setOtherResonances] = useState<ResonanceData[]>([]);
  const [showResults, setShowResults] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const sessionStartTime = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isFinishedRef = useRef<boolean>(false);

  // 시간 체크 및 세션 관리
  useEffect(() => {
    const checkSessionTime = () => {
      // 수동 종료된 경우 타이머 중단
      if (isFinishedRef.current) {
        return;
      }
      
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      
      // 데모 모드: 언제든지 테스트 가능
      const isDemoMode = process.env.NEXT_PUBLIC_ART_PULSE_DEMO === 'true';
      
      if (isDemoMode) {
        // 데모 모드에서는 바로 활성 상태로
        setSessionPhase('active');
        if (sessionStartTime.current === 0) {
          sessionStartTime.current = now.getTime();
        }
        // 실제 경과 시간 계산 (데모용 5분)
        const elapsed = Math.floor((now.getTime() - sessionStartTime.current) / 1000);
        const remaining = Math.max(0, 5 * 60 - elapsed);
        setTimeRemaining(remaining);
        
        // 5분이 지나면 결과 화면으로 (데모) - 수동 종료가 아닐 때만
        if (remaining === 0 && !isFinishedRef.current) {
          isFinishedRef.current = true;
          setSessionPhase('results');
          setShowResults(true);
        }
        return;
      }
      
      // 실제 시간 체크
      // 19:00 - 19:05 미리보기
      if (hours === 19 && minutes < 5) {
        setSessionPhase('preview');
        setTimeRemaining(5 * 60 - minutes * 60 - now.getSeconds());
      }
      // 19:05 - 19:25 활성 세션
      else if (hours === 19 && minutes >= 5 && minutes < 25) {
        setSessionPhase('active');
        if (sessionStartTime.current === 0) {
          sessionStartTime.current = now.getTime();
        }
        setTimeRemaining((25 - minutes) * 60 - now.getSeconds());
      }
      // 19:25 - 19:30 결과
      else if (hours === 19 && minutes >= 25 && minutes < 30) {
        setSessionPhase('results');
        setShowResults(true);
      } else {
        setSessionPhase('waiting');
      }
    };

    timerRef.current = setInterval(checkSessionTime, 1000);
    checkSessionTime();
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  // Supabase Realtime 연결
  useEffect(() => {
    if (sessionPhase === 'active') {
      // Broadcast channel 생성
      const channel = supabase.channel(`art-pulse:${dailyChallengeId}`, {
        config: {
          broadcast: { self: true }
        }
      });

      channel
        .on('broadcast', { event: 'touch' }, ({ payload }) => {
          if (payload.userId !== userId) {
            setTouchHeatmap(prev => [...prev, payload.touch]);
          }
        })
        .on('broadcast', { event: 'resonance' }, ({ payload }) => {
          if (payload.userId !== userId) {
            setOtherResonances(prev => {
              const updated = prev.filter(r => r.userId !== payload.userId);
              return [...updated, payload.resonance];
            });
          }
        })
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
          setActiveUsers(Object.keys(state).length);
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await channel.track({ userId, aptType: userAptType });
          }
        });

      channelRef.current = channel;

      // 주기적으로 참여자 수 변화 시뮬레이션
      const presenceInterval = setInterval(() => {
        const state = channel.presenceState();
        const currentCount = Object.keys(state).length;
        // 랜덤하게 1-2명 증감
        const change = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
        const newCount = Math.max(2, Math.min(12, currentCount + change));
        
        if (newCount !== currentCount) {
          setActiveUsers(newCount);
        }
      }, 15000); // 15초마다

      return () => {
        clearInterval(presenceInterval);
        supabase.removeChannel(channel);
      };
    }
  }, [sessionPhase, dailyChallengeId, userId, userAptType]);

  // 터치 처리
  const handleCanvasTouch = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (sessionPhase !== 'active') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    const touchPoint: TouchPoint = {
      x,
      y,
      timestamp: Date.now(),
      userId
    };

    // 로컬 업데이트
    setMyResonance(prev => ({
      ...prev,
      touchPoints: [...prev.touchPoints, touchPoint]
    }));

    // 브로드캐스트
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'touch',
        payload: { userId, touch: touchPoint }
      });
    }

    // 캔버스에 시각화
    drawTouchPoint(x * rect.width, y * rect.height);
  }, [sessionPhase, userId]);

  // 터치 포인트 그리기
  const drawTouchPoint = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 빛나는 원 그리기
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, 30);
    gradient.addColorStop(0, 'rgba(147, 51, 234, 0.6)');
    gradient.addColorStop(0.5, 'rgba(147, 51, 234, 0.3)');
    gradient.addColorStop(1, 'rgba(147, 51, 234, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, 30, 0, Math.PI * 2);
    ctx.fill();

    // 극도로 느린 페이드 아웃 효과
    let alpha = 1;
    const fadeInterval = setInterval(() => {
      alpha -= 0.003; // 0.005에서 0.003으로 더 느리게
      if (alpha <= 0) {
        clearInterval(fadeInterval);
        return;
      }
      
      ctx.globalAlpha = 0.997; // 0.995에서 0.997로 더 미세하게
      ctx.fillStyle = 'rgba(0, 0, 0, 0.003)'; // 0.005에서 0.003으로 더 연하게
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1;
    }, 150); // 100ms에서 150ms로 더 긴 간격
  };

  // 캔버스 초기화
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setMyResonance(prev => ({ ...prev, touchPoints: [] }));
  };

  // 공명 타입 선택
  const selectResonanceType = (type: 'sensory' | 'emotional' | 'cognitive') => {
    setMyResonance(prev => ({ ...prev, resonanceType: type }));
    
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'resonance',
        payload: { userId, resonance: { ...myResonance, resonanceType: type } }
      });
    }
  };

  // 수동 세션 종료
  const finishSession = () => {
    isFinishedRef.current = true;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setSessionPhase('results');
    setShowResults(true);
    setTimeRemaining(0);
  };

  // 시간 포맷팅
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 대기 화면
  if (sessionPhase === 'waiting') {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8 text-center">
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-purple-500" />
          <h2 className="text-2xl font-bold mb-2">Art Pulse</h2>
          <p className="text-muted-foreground mb-4">
            매일 저녁 7시, 20분간의 특별한 예술 공명 경험
          </p>
          <Badge variant="outline" className="text-lg px-4 py-2">
            다음 세션: 오늘 19:00
          </Badge>
        </CardContent>
      </Card>
    );
  }

  // 미리보기 화면
  if (sessionPhase === 'preview') {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">오늘의 Art Pulse 준비중</h2>
            <Badge variant="default" className="text-lg">
              <Clock className="w-4 h-4 mr-1" />
              {formatTime(timeRemaining)}
            </Badge>
          </div>
          
          <div className="relative aspect-[4/3] mb-6 overflow-hidden rounded-lg">
            <img 
              src={artwork.imageUrl} 
              alt={artwork.title}
              className="w-full h-full object-contain bg-gray-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 text-white">
              <h3 className="text-xl font-semibold">{artwork.title}</h3>
              <p className="text-sm opacity-90">{artwork.artist}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{activeUsers}명이 대기중</span>
            </div>
            <Progress value={(300 - timeRemaining) / 300 * 100} />
          </div>
        </CardContent>
      </Card>
    );
  }

  // 활성 세션
  if (sessionPhase === 'active') {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Badge variant="destructive" className="animate-pulse">
                <Zap className="w-4 h-4 mr-1" />
                LIVE
              </Badge>
              <span className="text-sm text-muted-foreground">
                <Users className="w-4 h-4 inline mr-1" />
                {activeUsers}명이 함께 감상 중
              </span>
            </div>
            <div className="text-right">
              <Badge variant={timeRemaining < 300 ? "destructive" : "outline"} className="text-sm">
                {formatTime(timeRemaining)}
              </Badge>
              {timeRemaining < 300 && (
                <div className="text-xs text-orange-600 mt-1">곧 종료됩니다</div>
              )}
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">작품을 클릭해보세요</p>
              <div className="flex items-center gap-3">
                <p className="text-xs text-muted-foreground">
                  {myResonance.touchPoints.length}번 터치함
                </p>
                {myResonance.touchPoints.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearCanvas}
                    className="h-7 px-2 text-xs"
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    초기화
                  </Button>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              마음에 드는 부분, 인상 깊은 부분을 자유롭게 터치해주세요
            </p>
          </div>

          <div className="relative aspect-[4/3] mb-6">
            <img 
              src={artwork.imageUrl} 
              alt={artwork.title}
              className="w-full h-full object-contain bg-gray-100 rounded-lg"
            />
            <canvas 
              ref={canvasRef}
              className="absolute inset-0 cursor-pointer hover:cursor-pointer"
              style={{ cursor: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\'><circle cx=\'12\' cy=\'12\' r=\'8\' fill=\'%23a855f7\' opacity=\'0.6\'/><circle cx=\'12\' cy=\'12\' r=\'3\' fill=\'%23ffffff\'/></svg>") 12 12, pointer' }}
              width={800}
              height={600}
              onClick={handleCanvasTouch}
            />
            {myResonance.touchPoints.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-black/50 text-white px-4 py-2 rounded-lg text-sm">
                  작품을 클릭해보세요 ✨
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <div className="mb-3">
                <p className="text-sm font-medium mb-1">이 작품을 보며 어떤 마음이 드나요?</p>
                <p className="text-xs text-muted-foreground">가장 먼저 느껴지는 반응을 선택해주세요</p>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                <Button
                  variant={myResonance.resonanceType === 'sensory' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => selectResonanceType('sensory')}
                  className={cn(
                    "flex-col text-center p-3 h-auto hover:scale-[1.02] transition-transform",
                    myResonance.resonanceType === 'sensory' 
                      ? "bg-purple-600 text-white hover:bg-purple-700" 
                      : "bg-white text-gray-900 border-gray-200 hover:bg-gray-50"
                  )}
                >
                  <Eye className={cn(
                    "w-4 h-4 mx-auto mb-2",
                    myResonance.resonanceType === 'sensory' ? "text-white" : "text-gray-600"
                  )} />
                  <div>
                    <div className="font-medium text-xs mb-1">시각적 매력</div>
                    <div className={cn(
                      "text-[10px] leading-tight",
                      myResonance.resonanceType === 'sensory' ? "text-white/80" : "text-gray-500"
                    )}>"색깔이 예뻐", "형태가 독특해"</div>
                  </div>
                </Button>
                
                <Button
                  variant={myResonance.resonanceType === 'emotional' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => selectResonanceType('emotional')}
                  className={cn(
                    "flex-col text-center p-3 h-auto hover:scale-[1.02] transition-transform",
                    myResonance.resonanceType === 'emotional' 
                      ? "bg-purple-600 text-white hover:bg-purple-700" 
                      : "bg-white text-gray-900 border-gray-200 hover:bg-gray-50"
                  )}
                >
                  <Heart className={cn(
                    "w-4 h-4 mx-auto mb-2",
                    myResonance.resonanceType === 'emotional' ? "text-white" : "text-gray-600"
                  )} />
                  <div>
                    <div className="font-medium text-xs mb-1">감정적 울림</div>
                    <div className={cn(
                      "text-[10px] leading-tight",
                      myResonance.resonanceType === 'emotional' ? "text-white/80" : "text-gray-500"
                    )}>"마음이 편해져", "희망적이야"</div>
                  </div>
                </Button>
                
                <Button
                  variant={myResonance.resonanceType === 'cognitive' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => selectResonanceType('cognitive')}
                  className={cn(
                    "flex-col text-center p-3 h-auto hover:scale-[1.02] transition-transform",
                    myResonance.resonanceType === 'cognitive' 
                      ? "bg-purple-600 text-white hover:bg-purple-700" 
                      : "bg-white text-gray-900 border-gray-200 hover:bg-gray-50"
                  )}
                >
                  <Brain className={cn(
                    "w-4 h-4 mx-auto mb-2",
                    myResonance.resonanceType === 'cognitive' ? "text-white" : "text-gray-600"
                  )} />
                  <div>
                    <div className="font-medium text-xs mb-1">호기심과 사고</div>
                    <div className={cn(
                      "text-[10px] leading-tight",
                      myResonance.resonanceType === 'cognitive' ? "text-white/80" : "text-gray-500"
                    )}>"무슨 의미일까", "어떻게 그렸을까"</div>
                  </div>
                </Button>
              </div>
              
              {!myResonance.resonanceType && (
                <div className="text-xs text-center text-muted-foreground mt-2">
                  💡 다른 사람들은 어떻게 느꼈는지 궁금하지 않나요?
                </div>
              )}
            </div>

            <div className="flex gap-2 flex-wrap mb-4">
              {otherResonances.slice(0, 5).map((resonance, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {resonance.aptType} • {resonance.resonanceType}
                </Badge>
              ))}
            </div>

            {/* 조기 종료 옵션 */}
            {(myResonance.touchPoints.length > 0 && myResonance.resonanceType) && (
              <div className="border-t pt-4 mt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">이미 충분히 감상하셨나요?</p>
                    <p className="text-xs text-muted-foreground">시간을 기다리지 않고 바로 결과를 확인할 수 있어요</p>
                  </div>
                  <Button 
                    variant="default" 
                    onClick={finishSession}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    결과 보기
                  </Button>
                </div>
              </div>
            )}

            {/* 아직 충분히 참여하지 않은 경우 안내 */}
            {myResonance.touchPoints.length === 0 && !myResonance.resonanceType && (
              <div className="text-center py-4">
                <p className="text-xs text-muted-foreground">
                  💡 작품을 터치하고 공명을 선택하면 더 풍부한 결과를 볼 수 있어요
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // 결과 화면
  if (sessionPhase === 'results' && showResults) {
    const totalTouches = touchHeatmap.length + myResonance.touchPoints.length;
    const resonanceTypes = otherResonances.reduce((acc, r) => {
      if (r.resonanceType) acc[r.resonanceType] = (acc[r.resonanceType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 내 선택 포함
    if (myResonance.resonanceType) {
      resonanceTypes[myResonance.resonanceType] = (resonanceTypes[myResonance.resonanceType] || 0) + 1;
    }

    const myResonanceLabel = myResonance.resonanceType === 'sensory' ? '시각적 매력' :
                           myResonance.resonanceType === 'emotional' ? '감정적 울림' :
                           myResonance.resonanceType === 'cognitive' ? '호기심과 사고' : '미선택';

    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">공명의 시간이 끝났습니다</h2>
            <p className="text-muted-foreground">
              {activeUsers}명이 함께 이 작품을 감상했습니다
            </p>
          </div>
          
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">당신의 반응</span>
            </div>
            <p className="text-blue-800">
              <strong>{myResonanceLabel}</strong>으로 이 작품을 감상하셨네요!
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">함께한 사람들의 반응</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-blue-500" />
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">시각적 매력</span>
                      <span className="text-sm text-muted-foreground">{resonanceTypes.sensory || 0}명</span>
                    </div>
                    <Progress value={(resonanceTypes.sensory || 0) / activeUsers * 100} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">색감, 형태, 질감에 먼저 반응</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Heart className="w-5 h-5 text-red-500" />
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">감정적 울림</span>
                      <span className="text-sm text-muted-foreground">{resonanceTypes.emotional || 0}명</span>
                    </div>
                    <Progress value={(resonanceTypes.emotional || 0) / activeUsers * 100} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">마음의 감정이 먼저 움직임</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Brain className="w-5 h-5 text-green-500" />
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">호기심과 사고</span>
                      <span className="text-sm text-muted-foreground">{resonanceTypes.cognitive || 0}명</span>
                    </div>
                    <Progress value={(resonanceTypes.cognitive || 0) / activeUsers * 100} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">의미와 맥락을 궁금해함</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">오늘의 발견</h3>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium mb-1">가장 많은 관심을 받은 반응</div>
                  <div className="text-lg">
                    {Object.entries(resonanceTypes).sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] === 'sensory' && '👁️ 시각적 매력'}
                    {Object.entries(resonanceTypes).sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] === 'emotional' && '❤️ 감정적 울림'}
                    {Object.entries(resonanceTypes).sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] === 'cognitive' && '🧠 호기심과 사고'}
                  </div>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium mb-1">총 상호작용</div>
                  <div className="text-lg">{totalTouches}번의 터치</div>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium mb-1">함께한 시간</div>
                  <div className="text-lg">5분간 몰입</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg text-center">
            <p className="text-sm text-gray-700 mb-2">
              🎨 매일 새로운 작품으로 다시 만나요
            </p>
            <p className="text-xs text-gray-500">
              내일 저녁 7시, 또 다른 예술적 공명을 기대해주세요!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}