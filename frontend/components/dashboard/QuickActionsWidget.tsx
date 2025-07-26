'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles,
  FolderOpen,
  MessageSquare,
  Users,
  Calendar,
  MapPin,
  Palette,
  Share2,
  Lock,
  Zap,
  Gift,
  Code
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface QuickActionsWidgetProps {
  communityStatus: any;
  className?: string;
}

export function QuickActionsWidget({ communityStatus, className }: QuickActionsWidgetProps) {
  const quickActions = [
    {
      title: '컬렉션 관리',
      description: '작품을 수집하고 정리해보세요',
      icon: FolderOpen,
      href: '/collections',
      color: 'from-blue-500 to-cyan-500',
      locked: false,
      badge: null
    },
    {
      title: '데일리 챌린지',
      description: '오늘의 작품으로 감정을 기록하세요',
      icon: Sparkles,
      href: '/daily-challenge',
      color: 'from-purple-500 to-pink-500',
      locked: false,
      badge: { text: 'HOT', variant: 'destructive' }
    },
    {
      title: '감상 교환',
      description: '다른 사용자와 감상을 나눠보세요',
      icon: MessageSquare,
      href: '/exchanges',
      color: 'from-orange-500 to-red-500',
      locked: !communityStatus?.isUnlocked,
      badge: null
    },
    {
      title: '전시 동행',
      description: '함께 전시를 볼 동행을 찾아보세요',
      icon: Users,
      href: '/exhibitions',
      color: 'from-green-500 to-emerald-500',
      locked: !communityStatus?.isUnlocked,
      badge: null
    },
    {
      title: '이벤트 캘린더',
      description: '주변 전시 일정을 확인하세요',
      icon: Calendar,
      href: '/events',
      color: 'from-indigo-500 to-purple-500',
      locked: false,
      badge: { text: 'NEW', variant: 'default' }
    },
    {
      title: '아트맵',
      description: '주변 미술관과 갤러리를 찾아보세요',
      icon: MapPin,
      href: '/artmap',
      color: 'from-teal-500 to-green-500',
      locked: false,
      badge: null
    },
    {
      title: 'AI 아트 프로필',
      description: 'AI가 만드는 나만의 예술 프로필',
      icon: Palette,
      href: '/art-profile',
      color: 'from-pink-500 to-rose-500',
      locked: false,
      badge: { text: 'AI', variant: 'secondary' }
    },
    {
      title: '초대 코드',
      description: '친구를 초대하고 보상을 받으세요',
      icon: Gift,
      href: '/invite',
      color: 'from-amber-500 to-orange-500',
      locked: false,
      badge: null
    }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Zap className="h-5 w-5 text-purple-600" />
          빠른 액션
        </h3>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/features">
            모든 기능 보기
          </Link>
        </Button>
      </div>

      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {quickActions.map((action) => (
          <motion.div key={action.href} variants={item}>
            <Card 
              className={cn(
                "group hover:shadow-lg transition-all duration-300 cursor-pointer",
                action.locked && "opacity-60"
              )}
            >
              <Link 
                href={action.locked ? '#' : action.href}
                className={action.locked ? 'cursor-not-allowed' : ''}
                onClick={(e) => action.locked && e.preventDefault()}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                    {action.badge && (
                      <Badge variant={action.badge.variant as any} className="text-xs">
                        {action.badge.text}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardTitle className="text-base flex items-center gap-2 mb-1">
                    {action.title}
                    {action.locked && <Lock className="h-3 w-3" />}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {action.description}
                  </p>
                </CardContent>
              </Link>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}