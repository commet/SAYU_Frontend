"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Clock, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ArtPulseWidgetProps {
  onOpenSession: () => void;
  className?: string;
}

export function ArtPulseWidget({ onOpenSession, className }: ArtPulseWidgetProps) {
  const [isActive, setIsActive] = useState(false);
  const [timeUntilNext, setTimeUntilNext] = useState('');
  const [pulseAnimation, setPulseAnimation] = useState(false);

  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      
      // 데모 모드 체크
      const isDemoMode = process.env.NEXT_PUBLIC_ART_PULSE_DEMO === 'true';
      
      if (isDemoMode) {
        setIsActive(true);
        setPulseAnimation(true);
        setTimeUntilNext('데모 모드');
        return;
      }
      
      // 19:00 - 19:25 활성화
      const isSessionActive = hours === 19 && minutes >= 0 && minutes < 25;
      setIsActive(isSessionActive);
      
      if (isSessionActive) {
        setPulseAnimation(true);
      }

      // 다음 세션까지 시간 계산
      if (!isSessionActive) {
        let nextSession = new Date();
        
        if (hours >= 19) {
          // 오늘 세션이 끝났으면 내일 7시
          nextSession.setDate(nextSession.getDate() + 1);
        }
        
        nextSession.setHours(19, 0, 0, 0);
        
        const diff = nextSession.getTime() - now.getTime();
        const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
        const minutesLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        setTimeUntilNext(`${hoursLeft}시간 ${minutesLeft}분`);
      }
    };

    const timer = setInterval(checkTime, 10000); // 10초마다 체크
    checkTime();
    
    return () => clearInterval(timer);
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className={cn("fixed bottom-6 right-6 z-50", className)}
      >
        <Card 
          className={cn(
            "relative overflow-hidden transition-all duration-300 cursor-pointer",
            "hover:shadow-lg hover:scale-105",
            isActive && "shadow-purple-500/20 shadow-xl"
          )}
          onClick={onOpenSession}
        >
          {/* 배경 애니메이션 */}
          {isActive && (
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 animate-pulse" />
          )}
          
          <div className="relative p-4 flex items-center gap-4">
            <div className="relative">
              <Sparkles 
                className={cn(
                  "w-8 h-8",
                  isActive ? "text-purple-500 animate-pulse" : "text-gray-400"
                )}
              />
              {pulseAnimation && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-purple-500"
                  animate={{
                    scale: [1, 2, 2],
                    opacity: [0.5, 0, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeOut"
                  }}
                />
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-sm">Art Pulse</h3>
                {isActive && (
                  <Badge variant="destructive" className="animate-pulse text-xs">
                    LIVE
                  </Badge>
                )}
              </div>
              
              {isActive ? (
                <p className="text-xs text-muted-foreground">
                  지금 참여하세요!
                </p>
              ) : (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {timeUntilNext} 후
                </p>
              )}
            </div>

            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>

          {/* 하단 프로그레스 바 (활성 시간 표시) */}
          {isActive && (
            <div className="h-1 bg-purple-500/20">
              <motion.div 
                className="h-full bg-purple-500"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1200, ease: "linear" }} // 20분
              />
            </div>
          )}
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}