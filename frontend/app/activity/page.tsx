'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ActivityPage() {
  const router = useRouter();

  useEffect(() => {
    // 2초 후 대시보드로 자동 이동
    const timer = setTimeout(() => {
      router.push('/dashboard');
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center p-8">
        <div className="text-6xl mb-4">🚧</div>
        <h1 className="text-2xl font-bold text-white mb-2">활동 페이지 구현 중</h1>
        <p className="text-gray-400 mb-4">곧 만나보실 수 있습니다!</p>
        <p className="text-sm text-gray-500">대시보드로 돌아갑니다...</p>
      </div>
    </div>
  );
}