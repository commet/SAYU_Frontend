'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { 
  Users, 
  Eye, 
  FolderPlus, 
  Calendar, 
  PenTool, 
  CheckCircle2,
  Lock,
  Unlock,
  Sparkles,
  TrendingUp,
  WifiOff,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { userActivityApi } from '@/lib/api/collections';
import { cn } from '@/lib/utils';
import { useOnlineStatus } from '@/hooks/use-online-status';

interface UnlockProgress {
  isUnlocked: boolean;
  progress: {
    artworks_viewed: { current: number; required: number };
    collections_created: { current: number; required: number };
    daily_challenges: { current: number; required: number };
    notes_written: { current: number; required: number };
  };
}

interface CommunityUnlockProgressProps {
  showCompact?: boolean;
  onUnlock?: () => void;
}

// 로컬 스토리지 키
const STORAGE_KEY = 'community_unlock_progress';
const CACHE_DURATION = 5 * 60 * 1000; // 5분

const UNLOCK_CRITERIA = [
  {
    key: 'artworks_viewed' as keyof UnlockProgress['progress'],
    icon: Eye,
    title: '작품 감상',
    description: '다양한 작품을 감상하고 예술적 안목을 기르세요',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10'
  },
  {
    key: 'collections_created' as keyof UnlockProgress['progress'],
    icon: FolderPlus,
    title: '컬렉션 생성',
    description: '나만의 취향이 담긴 컬렉션을 만들어보세요',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10'
  },
  {
    key: 'daily_challenges' as keyof UnlockProgress['progress'],
    icon: Calendar,
    title: '데일리 챌린지',
    description: '매일 새로운 작품과 만나보세요',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10'
  },
  {
    key: 'notes_written' as keyof UnlockProgress['progress'],
    icon: PenTool,
    title: '감상 노트',
    description: '작품에 대한 생각과 감정을 기록해보세요',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10'
  }
];

export function CommunityUnlockProgress({ showCompact = false, onUnlock }: CommunityUnlockProgressProps) {
  const [unlockStatus, setUnlockStatus] = useState<UnlockProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [justUnlocked, setJustUnlocked] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const isOnline = useOnlineStatus();
  const shouldReduceMotion = useReducedMotion();

  // 로컬 스토리지에서 캐시된 데이터 가져오기
  const getCachedData = useCallback(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        const age = Date.now() - timestamp;
        if (age < CACHE_DURATION) {
          return data;
        }
      }
    } catch (error) {
      console.error('Failed to get cached data:', error);
    }
    return null;
  }, []);

  // 로컬 스토리지에 데이터 저장
  const setCachedData = useCallback((data: UnlockProgress) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Failed to cache data:', error);
    }
  }, []);

  // 언락 상태 로드
  const loadUnlockStatus = useCallback(async (force = false) => {
    // 오프라인이고 강제 새로고침이 아닌 경우 캐시 사용
    if (!isOnline && !force) {
      const cached = getCachedData();
      if (cached) {
        setUnlockStatus(cached);
        setIsLoading(false);
        return;
      }
    }

    setIsRefreshing(true);
    try {
      const status = await userActivityApi.checkCommunityUnlock();
      
      // 언락 상태 변경 감지
      const wasLocked = unlockStatus && !unlockStatus.isUnlocked;
      const nowUnlocked = status.isUnlocked;
      
      if (wasLocked && nowUnlocked) {
        setJustUnlocked(true);
        setTimeout(() => setJustUnlocked(false), 3000);
        onUnlock?.();
      }
      
      setUnlockStatus(status);
      setCachedData(status);
      setLastUpdateTime(new Date());
    } catch (error) {
      console.error('Failed to load unlock status:', error);
      
      // 오류 발생 시 캐시된 데이터 사용
      const cached = getCachedData();
      if (cached) {
        setUnlockStatus(cached);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [isOnline, getCachedData, setCachedData, unlockStatus, onUnlock]);

  useEffect(() => {
    // 초기 로드 시 캐시 확인
    const cached = getCachedData();
    if (cached) {
      setUnlockStatus(cached);
      setIsLoading(false);
    }
    
    // 네트워크에서 최신 데이터 가져오기
    loadUnlockStatus();
  }, []);

  // 전체 진행률 계산 (메모이제이션)
  const totalProgress = useMemo(() => {
    if (!unlockStatus) return 0;
    
    return UNLOCK_CRITERIA.reduce((acc, criteria) => {
      const progress = unlockStatus.progress[criteria.key];
      return acc + Math.min(progress.current / progress.required, 1);
    }, 0) / UNLOCK_CRITERIA.length * 100;
  }, [unlockStatus]);

  // 애니메이션 변형 (성능 최적화)
  const cardVariants = useMemo(() => ({
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: shouldReduceMotion ? { duration: 0 } : { duration: 0.3 }
    }
  }), [shouldReduceMotion]);

  const celebrationVariants = useMemo(() => ({
    initial: { opacity: 0, scale: shouldReduceMotion ? 1 : 0.8 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: shouldReduceMotion ? { duration: 0 } : { duration: 0.5 }
    },
    exit: { 
      opacity: 0, 
      scale: shouldReduceMotion ? 1 : 0.8,
      transition: shouldReduceMotion ? { duration: 0 } : { duration: 0.3 }
    }
  }), [shouldReduceMotion]);

  if (isLoading && !unlockStatus) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-2 bg-gray-200 rounded"></div>
            <div className="h-2 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!unlockStatus) return null;

  // 컴팩트 뷰
  if (showCompact) {
    return (
      <Card className={cn("transition-all", unlockStatus.isUnlocked && "border-green-500 bg-green-50/50")}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {unlockStatus.isUnlocked ? (
                <div className="p-2 rounded-full bg-green-500/20">
                  <Unlock className="w-4 h-4 text-green-600" />
                </div>
              ) : (
                <div className="p-2 rounded-full bg-gray-100">
                  <Lock className="w-4 h-4 text-gray-400" />
                </div>
              )}
              <div>
                <p className="font-medium text-sm">
                  {unlockStatus.isUnlocked ? '커뮤니티 활성화됨' : '커뮤니티 언락 진행중'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {Math.round(totalProgress)}% 완료
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isOnline && (
                <WifiOff className="w-4 h-4 text-muted-foreground" />
              )}
              <Badge variant={unlockStatus.isUnlocked ? 'default' : 'secondary'}>
                {unlockStatus.isUnlocked ? '활성화' : '진행중'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 오프라인 알림 */}
      {!isOnline && (
        <Alert>
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            오프라인 상태입니다. 캐시된 진행률을 표시하고 있습니다.
            {lastUpdateTime && (
              <span className="block text-xs mt-1">
                마지막 업데이트: {lastUpdateTime.toLocaleTimeString()}
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* 언락 완료 알림 */}
      <AnimatePresence>
        {justUnlocked && (
          <motion.div
            variants={celebrationVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="relative"
          >
            <Card className="border-green-500 bg-gradient-to-r from-green-50 to-emerald-50">
              <CardContent className="p-6">
                <div className="text-center space-y-3">
                  <motion.div
                    animate={shouldReduceMotion ? {} : { 
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: shouldReduceMotion ? 0 : 0.6,
                      repeat: shouldReduceMotion ? 0 : 2
                    }}
                    className="inline-flex p-3 rounded-full bg-green-500/20"
                  >
                    <Sparkles className="w-8 h-8 text-green-600" />
                  </motion.div>
                  <div>
                    <h3 className="text-lg font-semibold text-green-800">
                      🎉 커뮤니티가 활성화되었습니다!
                    </h3>
                    <p className="text-green-600 text-sm mt-1">
                      이제 다른 사용자들과 예술 감상을 공유할 수 있습니다
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 메인 진행률 카드 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {unlockStatus.isUnlocked ? (
                  <Unlock className="w-5 h-5 text-green-600" />
                ) : (
                  <Lock className="w-5 h-5" />
                )}
                커뮤니티 언락 진행률
              </CardTitle>
              <CardDescription>
                {unlockStatus.isUnlocked 
                  ? '커뮤니티 기능이 활성화되었습니다!'
                  : '다음 조건을 만족하면 커뮤니티 기능이 활성화됩니다'
                }
              </CardDescription>
            </div>
            <Badge 
              variant={unlockStatus.isUnlocked ? 'default' : 'secondary'}
              className="px-3 py-1"
            >
              {Math.round(totalProgress)}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 전체 진행률 바 */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">전체 진행률</span>
              <span>{Math.round(totalProgress)}%</span>
            </div>
            <Progress 
              value={totalProgress} 
              className={cn(
                "h-3 transition-all",
                unlockStatus.isUnlocked && "bg-green-100"
              )}
            />
          </div>

          {/* 개별 조건들 */}
          <div className="grid gap-4">
            {UNLOCK_CRITERIA.map((criteria, index) => {
              const progress = unlockStatus.progress[criteria.key];
              const percentage = Math.min((progress.current / progress.required) * 100, 100);
              const isCompleted = progress.current >= progress.required;
              const Icon = criteria.icon;

              return (
                <motion.div
                  key={criteria.key}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: shouldReduceMotion ? 0 : index * 0.1 }}
                  className={cn(
                    "p-4 border rounded-lg transition-all",
                    isCompleted && "bg-green-50/50 border-green-200"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "p-2 rounded-full shrink-0",
                      criteria.bgColor
                    )}>
                      <Icon className={cn("w-4 h-4", criteria.color)} />
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-sm">{criteria.title}</h4>
                          <p className="text-xs text-muted-foreground">
                            {criteria.description}
                          </p>
                        </div>
                        {isCompleted && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ 
                              type: shouldReduceMotion ? "tween" : "spring",
                              duration: shouldReduceMotion ? 0 : 0.5 
                            }}
                          >
                            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                          </motion.div>
                        )}
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>
                            {progress.current} / {progress.required}
                          </span>
                          <span className="font-medium">
                            {Math.round(percentage)}%
                          </span>
                        </div>
                        <Progress 
                          value={percentage} 
                          className="h-2 transition-all duration-500" 
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* 액션 버튼 */}
          {!unlockStatus.isUnlocked && (
            <div className="pt-4 space-y-3">
              <Button 
                variant="outline" 
                onClick={() => loadUnlockStatus(true)}
                className="w-full gap-2"
                disabled={isRefreshing || !isOnline}
              >
                {isRefreshing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    새로고침 중...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4" />
                    진행률 새로고침
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                활동을 완료한 후 진행률을 새로고침해보세요
                {lastUpdateTime && (
                  <span className="block">
                    마지막 업데이트: {lastUpdateTime.toLocaleTimeString()}
                  </span>
                )}
              </p>
            </div>
          )}

          {unlockStatus.isUnlocked && (
            <div className="pt-4">
              <Button className="w-full gap-2" asChild>
                <a href="/exchanges">
                  <Users className="w-4 h-4" />
                  커뮤니티 둘러보기
                </a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}