'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sun, 
  Coffee, 
  Moon, 
  Calendar, 
  Flame, 
  Trophy, 
  Bell,
  ChevronRight,
  Check,
  Clock,
  Heart,
  Palette
} from 'lucide-react';
import { dailyHabitApi, DailyEntry, Streak } from '@/lib/api/daily-habit';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';
import MorningSession from './MorningSession';
import LunchSession from './LunchSession';
import NightSession from './NightSession';
import StreakDisplay from './StreakDisplay';
import HabitSettings from './HabitSettings';

type TimeSlot = 'morning' | 'lunch' | 'night';

interface TimeSlotData {
  id: TimeSlot;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  timeRange: string;
  duration: string;
  color: string;
  gradient: string;
}

const timeSlots: TimeSlotData[] = [
  {
    id: 'morning',
    title: '출근길 3분',
    subtitle: '하루를 시작하는 색',
    icon: <Sun className="w-6 h-6" />,
    timeRange: '오전 7-9시',
    duration: '3분',
    color: '#FFB347',
    gradient: 'from-orange-400 to-yellow-400'
  },
  {
    id: 'lunch',
    title: '점심시간 5분',
    subtitle: '감정 체크인',
    icon: <Coffee className="w-6 h-6" />,
    timeRange: '오후 12-1시',
    duration: '5분',
    color: '#87CEEB',
    gradient: 'from-blue-400 to-cyan-400'
  },
  {
    id: 'night',
    title: '잠들기 전 10분',
    subtitle: '하루 돌아보기',
    icon: <Moon className="w-6 h-6" />,
    timeRange: '밤 9-11시',
    duration: '10분',
    color: '#9370DB',
    gradient: 'from-purple-500 to-indigo-500'
  }
];

export default function DailyHabitDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [todayEntry, setTodayEntry] = useState<DailyEntry | null>(null);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [activeSession, setActiveSession] = useState<TimeSlot | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (user) {
      loadTodayData();
    }
  }, [user]);

  const loadTodayData = async () => {
    try {
      setLoading(true);
      const data = await dailyHabitApi.getTodayEntry();
      setTodayEntry(data.entry);
      setStreak(data.streak);
    } catch (error) {
      console.error('Failed to load today data:', error);
      toast.error('데이터를 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const getSessionStatus = (slot: TimeSlot): 'completed' | 'available' | 'locked' => {
    if (!todayEntry) return 'available';
    
    switch (slot) {
      case 'morning':
        return todayEntry.morning_completed_at ? 'completed' : 'available';
      case 'lunch':
        return todayEntry.lunch_completed_at ? 'completed' : 'available';
      case 'night':
        return todayEntry.night_completed_at ? 'completed' : 'available';
    }
  };

  const handleSessionComplete = () => {
    setActiveSession(null);
    loadTodayData();
    toast.success('활동이 기록되었습니다!');
  };

  const completionRate = todayEntry?.daily_completion_rate || 0;
  const completedCount = timeSlots.filter(slot => getSessionStatus(slot.id) === 'completed').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Daily Art Habit</h1>
          <p className="text-gray-600 mt-1">매일 예술과 함께하는 습관</p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowSettings(true)}
          className="gap-2"
        >
          <Bell className="w-4 h-4" />
          알림 설정
        </Button>
      </div>

      {/* Streak Display */}
      {streak && <StreakDisplay streak={streak} />}

      {/* Daily Progress */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">오늘의 진행도</h2>
          <Badge variant={completionRate === 1 ? 'default' : 'secondary'}>
            {completedCount}/3 완료
          </Badge>
        </div>
        <Progress value={completionRate * 100} className="h-3" />
        <p className="text-sm text-gray-600 mt-2">
          {completionRate === 1 
            ? '오늘의 예술 여정을 완료했어요! 🎉' 
            : `${Math.round(completionRate * 100)}% 완료`}
        </p>
      </Card>

      {/* Time Slots */}
      <div className="grid md:grid-cols-3 gap-4">
        {timeSlots.map((slot) => {
          const status = getSessionStatus(slot.id);
          const isCompleted = status === 'completed';
          
          return (
            <motion.div
              key={slot.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                className={`relative overflow-hidden cursor-pointer transition-all ${
                  isCompleted ? 'bg-gray-50' : 'hover:shadow-lg'
                }`}
                onClick={() => !isCompleted && setActiveSession(slot.id)}
              >
                {/* Background Gradient */}
                <div 
                  className={`absolute inset-0 bg-gradient-to-br ${slot.gradient} opacity-10`}
                />
                
                <div className="relative p-6 space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-full bg-gradient-to-br ${slot.gradient} text-white`}>
                      {slot.icon}
                    </div>
                    {isCompleted && (
                      <Badge variant="default" className="bg-green-500">
                        <Check className="w-3 h-3 mr-1" />
                        완료
                      </Badge>
                    )}
                  </div>

                  {/* Content */}
                  <div>
                    <h3 className="text-lg font-semibold">{slot.title}</h3>
                    <p className="text-sm text-gray-600">{slot.subtitle}</p>
                  </div>

                  {/* Time Info */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {slot.timeRange}
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      {slot.duration}
                    </div>
                  </div>

                  {/* Action */}
                  {!isCompleted && (
                    <Button 
                      variant="ghost" 
                      className="w-full justify-between"
                      disabled={isCompleted}
                    >
                      시작하기
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Today's Artworks */}
      {(todayEntry?.morning_artwork_id || todayEntry?.lunch_artwork_id || todayEntry?.night_artwork_id) && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Palette className="w-5 h-5" />
            오늘 감상한 작품들
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {/* Artwork previews would go here */}
          </div>
        </Card>
      )}

      {/* Session Modals */}
      <AnimatePresence>
        {activeSession === 'morning' && (
          <MorningSession 
            onClose={() => setActiveSession(null)}
            onComplete={handleSessionComplete}
          />
        )}
        {activeSession === 'lunch' && (
          <LunchSession 
            onClose={() => setActiveSession(null)}
            onComplete={handleSessionComplete}
          />
        )}
        {activeSession === 'night' && (
          <NightSession 
            onClose={() => setActiveSession(null)}
            onComplete={handleSessionComplete}
          />
        )}
        {showSettings && (
          <HabitSettings 
            onClose={() => setShowSettings(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}