// Service Worker for SAYU Daily Art Habit

self.addEventListener('push', function(event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: data.icon || '/icons/icon-192x192.png',
      badge: data.badge || '/icons/icon-72x72.png',
      vibrate: [200, 100, 200],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1,
        url: data.data?.url || '/'
      },
      actions: [
        {
          action: 'explore',
          title: '작품 보기',
          icon: '/icons/icon-96x96.png'
        },
        {
          action: 'close',
          title: '나중에',
          icon: '/icons/icon-96x96.png'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  if (event.action === 'explore' || !event.action) {
    // 알림 클릭 시 해당 URL로 이동
    const urlToOpen = event.notification.data.url || '/daily-art';
    
    event.waitUntil(
      clients.matchAll({
        type: 'window',
        includeUncontrolled: true
      }).then(function(windowClients) {
        // 이미 열려있는 창이 있는지 확인
        for (var i = 0; i < windowClients.length; i++) {
          var client = windowClients[i];
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // 열려있는 창이 없으면 새 창 열기
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
    );
  }
});

// 백그라운드 동기화
self.addEventListener('sync', function(event) {
  if (event.tag === 'daily-habit-sync') {
    event.waitUntil(syncDailyHabit());
  }
});

async function syncDailyHabit() {
  try {
    // 오프라인에서 저장된 데이터를 서버와 동기화
    const cache = await caches.open('daily-habit-v1');
    const requests = await cache.keys();
    
    for (const request of requests) {
      if (request.url.includes('/api/daily-habit/')) {
        try {
          const response = await fetch(request);
          if (response.ok) {
            await cache.delete(request);
          }
        } catch (error) {
          console.error('Sync failed for:', request.url);
        }
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// 설치 이벤트
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('sayu-v1').then(function(cache) {
      return cache.addAll([
        '/',
        '/daily-art',
        '/emotion-checkin',
        '/profile',
        '/icons/icon-192x192.png',
        '/icons/icon-512x512.png'
      ]);
    })
  );
  self.skipWaiting();
});

// 활성화 이벤트
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(cacheName) {
          return cacheName.startsWith('sayu-') && cacheName !== 'sayu-v1';
        }).map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
    })
  );
  self.clients.claim();
});