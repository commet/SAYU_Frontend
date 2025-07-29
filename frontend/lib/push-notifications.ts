import { dailyHabitApi } from './api/daily-habit';

// VAPID 공개 키 (실제 서비스에서는 환경 변수로 관리)
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_KEY || 'YOUR_VAPID_PUBLIC_KEY';

// Base64 URL 디코딩 함수
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export class PushNotificationService {
  private registration: ServiceWorkerRegistration | null = null;

  // Service Worker 등록
  async registerServiceWorker(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker not supported');
      return false;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('Service Worker registered successfully');
      return true;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return false;
    }
  }

  // 푸시 알림 권한 요청
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      console.warn('Notification permission denied');
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  // 푸시 구독
  async subscribeToPush(): Promise<boolean> {
    if (!this.registration) {
      console.error('Service Worker not registered');
      return false;
    }

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });

      // 서버에 구독 정보 전송
      const p256dhKey = subscription.getKey('p256dh');
      const authKey = subscription.getKey('auth');
      
      const subscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: p256dhKey ? 
            btoa(String.fromCharCode(...new Uint8Array(p256dhKey))) : '',
          auth: authKey ? 
            btoa(String.fromCharCode(...new Uint8Array(authKey))) : ''
        },
        userAgent: navigator.userAgent
      };
      
      await dailyHabitApi.subscribePush(subscriptionData);

      console.log('Push subscription successful');
      return true;
    } catch (error) {
      console.error('Push subscription failed:', error);
      return false;
    }
  }

  // 푸시 구독 해제
  async unsubscribeFromPush(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      const subscription = await this.registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        console.log('Push unsubscription successful');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Push unsubscription failed:', error);
      return false;
    }
  }

  // 구독 상태 확인
  async isSubscribed(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      const subscription = await this.registration.pushManager.getSubscription();
      return !!subscription;
    } catch (error) {
      console.error('Failed to check subscription status:', error);
      return false;
    }
  }

  // 테스트 알림 전송
  async sendTestNotification(): Promise<boolean> {
    try {
      await dailyHabitApi.testPush();
      return true;
    } catch (error) {
      console.error('Test notification failed:', error);
      return false;
    }
  }

  // 로컬 알림 표시 (즉시)
  showLocalNotification(title: string, body: string, options?: NotificationOptions): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        ...options
      });
    }
  }

  // 습관 알림 스케줄링 (실제로는 서버에서 처리)
  async scheduleHabitReminders(times: { morning: string; lunch: string; night: string }): Promise<void> {
    // 이 함수는 실제로는 서버의 크론 작업으로 처리됩니다.
    // 클라이언트에서는 설정만 저장하고, 서버에서 스케줄링합니다.
    console.log('Habit reminders scheduled:', times);
  }
}

// 브라우저 지원 여부 확인
export function isPushNotificationSupported(): boolean {
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

// 시간대별 알림 메시지
export const notificationMessages = {
  morning: {
    title: '🌅 출근길 3분 예술',
    body: '오늘을 시작하는 특별한 작품이 도착했어요',
    url: '/daily-art?time=morning'
  },
  lunch: {
    title: '☕ 점심시간 감정 체크인',
    body: '지금의 기분과 어울리는 작품을 찾아보세요',
    url: '/daily-art?time=lunch'
  },
  night: {
    title: '🌙 하루 마무리 예술',
    body: '오늘 하루를 돌아보며 마음을 정리해요',
    url: '/daily-art?time=night'
  },
  streak: {
    title: '🔥 연속 기록 달성!',
    body: '멋진 습관을 이어가고 있어요',
    url: '/daily-art'
  }
};

// 싱글톤 인스턴스
export const pushService = new PushNotificationService();