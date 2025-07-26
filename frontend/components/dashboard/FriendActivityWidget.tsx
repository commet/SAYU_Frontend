'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users,
  MessageSquare,
  Heart,
  TrendingUp,
  UserPlus,
  Bell,
  Share2,
  Calendar,
  MapPin,
  Palette,
  Lock,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface FriendActivityWidgetProps {
  user: any;
  communityStatus: any;
  className?: string;
}

export function FriendActivityWidget({ user, communityStatus, className }: FriendActivityWidgetProps) {
  const [activeTab, setActiveTab] = useState<'feed' | 'exchanges' | 'events'>('feed');

  // Mock data
  const friendActivities = [
    {
      id: '1',
      user: {
        name: '아트러버123',
        avatar: null,
        level: 32
      },
      type: 'collection',
      action: '새로운 컬렉션 "인상주의의 빛" 생성',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      metadata: {
        collectionId: '123',
        itemCount: 12
      }
    },
    {
      id: '2',
      user: {
        name: '감성수집가',
        avatar: null,
        level: 28
      },
      type: 'artpulse',
      action: 'Art Pulse에서 "평온함" 감정 공유',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      metadata: {
        emotion: '평온함',
        artwork: '수련'
      }
    },
    {
      id: '3',
      user: {
        name: '미술관매니아',
        avatar: null,
        level: 45
      },
      type: 'exhibition',
      action: '《현대미술의 거장들》 전시 리뷰 작성',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      metadata: {
        exhibition: '현대미술의 거장들',
        rating: 5
      }
    }
  ];

  const pendingExchanges = [
    {
      id: '1',
      fromUser: '예술탐험가',
      artwork: '별이 빛나는 밤',
      message: '이 작품에 대한 당신의 생각이 궁금해요!',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000)
    },
    {
      id: '2',
      fromUser: '감각주의자',
      artwork: '게르니카',
      message: '전쟁의 참상을 어떻게 해석하시나요?',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000)
    }
  ];

  const upcomingEvents = [
    {
      id: '1',
      title: 'SAYU 아트 토크: 현대미술 읽기',
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      location: '온라인',
      participants: 45,
      host: '큐레이터K'
    },
    {
      id: '2',
      title: '서울 미술관 투어',
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      location: '서울시립미술관',
      participants: 12,
      host: '아트가이드'
    }
  ];

  if (!communityStatus?.isUnlocked) {
    return (
      <Card className={className}>
        <CardContent className="py-12">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <Lock className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold">커뮤니티 기능 잠금</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              컬렉션을 만들고 작품을 수집하여 커뮤니티 기능을 해금하세요.
              다른 예술 애호가들과 교류할 수 있습니다.
            </p>
            <Button asChild>
              <Link href="/collections">
                컬렉션 만들기
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Community Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/20">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">127</p>
                <p className="text-xs text-muted-foreground">팔로워</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-pink-100 dark:bg-pink-900/20">
                <Heart className="h-5 w-5 text-pink-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">89</p>
                <p className="text-xs text-muted-foreground">팔로잉</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20">
                <MessageSquare className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">34</p>
                <p className="text-xs text-muted-foreground">감상 교환</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/20">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">+15%</p>
                <p className="text-xs text-muted-foreground">이번주 활동</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Tabs */}
      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="feed">활동 피드</TabsTrigger>
          <TabsTrigger value="exchanges">감상 교환</TabsTrigger>
          <TabsTrigger value="events">이벤트</TabsTrigger>
        </TabsList>

        {/* Activity Feed */}
        <TabsContent value="feed" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">친구들의 활동</CardTitle>
                <Button variant="ghost" size="sm">
                  <Bell className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <AnimatePresence>
                {friendActivities.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={activity.user.avatar || undefined} />
                      <AvatarFallback>{activity.user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{activity.user.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          Lv.{activity.user.level}
                        </Badge>
                      </div>
                      <p className="text-sm">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(activity.timestamp, { 
                          addSuffix: true, 
                          locale: ko 
                        })}
                      </p>
                    </div>
                    {activity.type === 'collection' && (
                      <Button variant="ghost" size="sm">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/community/feed">
                  더 보기
                </Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Exchanges */}
        <TabsContent value="exchanges" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">대기 중인 감상 교환</CardTitle>
                <Badge>{pendingExchanges.length}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingExchanges.map((exchange) => (
                <motion.div
                  key={exchange.id}
                  whileHover={{ scale: 1.02 }}
                  className="p-4 border rounded-lg space-y-2 cursor-pointer hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Palette className="h-4 w-4 text-purple-600" />
                      <span className="font-medium text-sm">{exchange.artwork}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(exchange.timestamp, { 
                        addSuffix: true, 
                        locale: ko 
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">{exchange.fromUser}</span>님: {exchange.message}
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      응답하기
                    </Button>
                    <Button size="sm" variant="outline">
                      나중에
                    </Button>
                  </div>
                </motion.div>
              ))}
              <Button variant="outline" className="w-full" asChild>
                <Link href="/exchanges">
                  모든 교환 보기
                </Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Events */}
        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">예정된 이벤트</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingEvents.map((event) => (
                <motion.div
                  key={event.id}
                  whileHover={{ scale: 1.02 }}
                  className="p-4 border rounded-lg space-y-2 cursor-pointer hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium">{event.title}</h4>
                    <Badge variant="outline">
                      <Users className="h-3 w-3 mr-1" />
                      {event.participants}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {event.date.toLocaleDateString('ko-KR')}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {event.location}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      주최: {event.host}
                    </span>
                    <Button size="sm">
                      참여하기
                    </Button>
                  </div>
                </motion.div>
              ))}
              <Button variant="outline" className="w-full" asChild>
                <Link href="/events">
                  모든 이벤트 보기
                </Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Invite Friends */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-semibold flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                친구 초대하기
              </h3>
              <p className="text-sm text-muted-foreground">
                친구를 초대하고 함께 예술 여정을 시작하세요
              </p>
            </div>
            <Button size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              초대 링크 복사
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}