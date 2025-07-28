'use client';

import React, { Suspense, lazy } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

// Dynamic import for complex AI generation component
const ArtProfileGenerator = lazy(() => import('@/components/art-profile/ArtProfileGenerator'));

export default function ArtProfilePage() {
  const { user } = useAuth();
  const router = useRouter();

  // 로그인 체크
  React.useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/profile/art-profile');
    }
  }, [user, router]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p>로그인이 필요합니다...</p>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p>Loading Art Profile Generator...</p>
        </div>
      </div>
    }>
      <ArtProfileGenerator />
    </Suspense>
  );
}