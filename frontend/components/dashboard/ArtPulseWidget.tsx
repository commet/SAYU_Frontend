'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Activity,
  Users,
  Clock,
  Zap,
  Heart,
  MessageCircle
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface ArtPulseWidgetProps {
  className?: string;
}

export function ArtPulseWidget({ className }: ArtPulseWidgetProps) {
  const [session, setSession] = useState<any>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with actual API call
    setTimeout(() => {
      const mockSession = {
        id: '1',
        phase: 'contemplation',
        artwork: {
          title: '별이 빛나는 밤',
          artist: '빈센트 반 고흐',
          image_url: '/api/placeholder/400/300'
        },
        startTime: new Date(Date.now() - 5 * 60000), // 5 minutes ago
        endTime: new Date(Date.now() + 10 * 60000), // 10 minutes from now
        participantCount: 127,
        emotionCount: 89,
        reflectionCount: 34
      };
      setSession(mockSession);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    if (!session) return;

    const updateTimeRemaining = () => {
      const now = new Date().getTime();
      const endTime = new Date(session.endTime).getTime();
      const remaining = Math.max(0, endTime - now);
      setTimeRemaining(remaining);
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [session]);

  const formatTimeRemaining = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const isActive = session && timeRemaining > 0;

  if (loading) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-32 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("hover:shadow-lg transition-shadow overflow-hidden", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-purple-600" />
            Art Pulse
          </CardTitle>
          {isActive && (
            <Badge variant="default" className="bg-green-500">
              <Zap className="h-3 w-3 mr-1" />
              LIVE
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isActive ? (
          <>
            {/* Live Session Info */}
            <div className="relative">
              <motion.img
                src={session.artwork.image_url}
                alt={session.artwork.title}
                className="w-full h-32 object-cover rounded-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              />
              <div className="absolute bottom-2 left-2 right-2">
                <div className="bg-black/70 text-white p-2 rounded backdrop-blur-sm">
                  <p className="text-sm font-medium truncate">{session.artwork.title}</p>
                  <p className="text-xs opacity-90">{session.artwork.artist}</p>
                </div>
              </div>
            </div>

            {/* Live Stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-2 bg-purple-50 dark:bg-purple-950/20 rounded">
                <Users className="h-4 w-4 mx-auto mb-1 text-purple-600" />
                <p className="text-xs font-medium">{session.participantCount}</p>
                <p className="text-xs text-muted-foreground">참여자</p>
              </div>
              <div className="text-center p-2 bg-pink-50 dark:bg-pink-950/20 rounded">
                <Heart className="h-4 w-4 mx-auto mb-1 text-pink-600" />
                <p className="text-xs font-medium">{session.emotionCount}</p>
                <p className="text-xs text-muted-foreground">감정</p>
              </div>
              <div className="text-center p-2 bg-indigo-50 dark:bg-indigo-950/20 rounded">
                <MessageCircle className="h-4 w-4 mx-auto mb-1 text-indigo-600" />
                <p className="text-xs font-medium">{session.reflectionCount}</p>
                <p className="text-xs text-muted-foreground">사유</p>
              </div>
            </div>

            {/* Timer */}
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <span className="text-sm text-muted-foreground">
                {session.phase === 'contemplation' && '감상 중'}
                {session.phase === 'sharing' && '사유 공유 중'}
                {session.phase === 'voting' && '투표 중'}
              </span>
              <div className="flex items-center gap-2 text-sm font-mono">
                <Clock className="h-4 w-4" />
                {formatTimeRemaining(timeRemaining)}
              </div>
            </div>

            {/* Join Button */}
            <Button asChild className="w-full">
              <Link href="/art-pulse">
                참여하기
              </Link>
            </Button>
          </>
        ) : (
          <>
            {/* No Active Session */}
            <div className="text-center py-8">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 flex items-center justify-center"
              >
                <Activity className="h-8 w-8 text-purple-600" />
              </motion.div>
              <p className="font-medium mb-1">다음 세션 예정</p>
              <p className="text-sm text-muted-foreground mb-4">
                매일 오후 7시에 시작됩니다
              </p>
              <Button asChild variant="outline" size="sm">
                <Link href="/art-pulse">
                  자세히 보기
                </Link>
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}