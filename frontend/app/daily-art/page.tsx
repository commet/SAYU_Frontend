'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { pushService } from '@/lib/push-notifications';
import DailyHabitDashboard from '@/components/daily-habit/DailyHabitDashboard';
import { useRouter } from 'next/navigation';

export default function DailyArtPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // 로그인되지 않은 사용자는 로그인 페이지로 리다이렉트
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    // PWA 및 푸시 알림 설정
    if (user) {
      initializePWA();
    }
  }, [user, loading, router]);

  const initializePWA = async () => {
    try {
      // Service Worker 등록
      await pushService.registerServiceWorker();
      
      // 사용자가 이미 푸시 알림을 허용했는지 확인
      if (Notification.permission === 'granted') {
        const isSubscribed = await pushService.isSubscribed();
        if (!isSubscribed) {
          // 구독되지 않았다면 자동으로 구독 시도
          await pushService.subscribeToPush();
        }
      }
    } catch (error) {
      console.error('PWA initialization failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
      </div>
    );
  }

  if (!user) {
    return null; // 리다이렉트 중
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DailyHabitDashboard />
    </div>
  );
}