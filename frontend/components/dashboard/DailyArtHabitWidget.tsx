'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Sun, 
  Coffee, 
  Moon,
  Check,
  Clock,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { dailyHabitApi } from '@/lib/api/daily-habit';
import { cn } from '@/lib/utils';

interface DailyArtHabitWidgetProps {
  className?: string;
}

export function DailyArtHabitWidget({ className }: DailyArtHabitWidgetProps) {
  const [todayEntry, setTodayEntry] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTodayData();
  }, []);

  const loadTodayData = async () => {
    try {
      const data = await dailyHabitApi.getTodayEntry();
      setTodayEntry(data.entry);
    } catch (error) {
      console.error('Failed to load today data:', error);
    } finally {
      setLoading(false);
    }
  };

  const timeSlots = [
    {
      id: 'morning',
      title: '출근길 3분',
      icon: Sun,
      time: '오전 7-9시',
      color: 'from-orange-400 to-yellow-400',
      completed: todayEntry?.morning_completed_at
    },
    {
      id: 'lunch',
      title: '점심시간 5분',
      icon: Coffee,
      time: '오후 12-1시',
      color: 'from-blue-400 to-cyan-400',
      completed: todayEntry?.lunch_completed_at
    },
    {
      id: 'night',
      title: '잠들기 전 10분',
      icon: Moon,
      time: '밤 9-11시',
      color: 'from-purple-500 to-indigo-500',
      completed: todayEntry?.night_completed_at
    }
  ];

  const completionRate = todayEntry?.daily_completion_rate || 0;
  const completedCount = timeSlots.filter(slot => slot.completed).length;

  if (loading) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("hover:shadow-lg transition-shadow", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Daily Art Habit
          </CardTitle>
          <Badge variant={completionRate === 1 ? 'default' : 'secondary'}>
            {completedCount}/3
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress */}
        <div className="space-y-2">
          <Progress value={completionRate * 100} className="h-2" />
          <p className="text-xs text-muted-foreground">
            오늘의 진행도: {Math.round(completionRate * 100)}%
          </p>
        </div>

        {/* Time Slots */}
        <div className="space-y-2">
          {timeSlots.map((slot) => (
            <motion.div
              key={slot.id}
              whileHover={{ x: 4 }}
              className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full bg-gradient-to-br ${slot.color} text-white`}>
                  <slot.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium text-sm">{slot.title}</p>
                  <p className="text-xs text-muted-foreground">{slot.time}</p>
                </div>
              </div>
              {slot.completed ? (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <Check className="h-3 w-3 mr-1" />
                  완료
                </Badge>
              ) : (
                <Clock className="h-4 w-4 text-muted-foreground" />
              )}
            </motion.div>
          ))}
        </div>

        {/* Action Button */}
        <Button asChild className="w-full" variant={completionRate === 1 ? "outline" : "default"}>
          <Link href="/daily-art">
            {completionRate === 1 ? '오늘의 활동 보기' : '시작하기'}
            <ChevronRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}