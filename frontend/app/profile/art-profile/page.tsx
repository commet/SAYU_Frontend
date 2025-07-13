'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import ArtProfileGenerator from '@/components/art-profile/ArtProfileGenerator';

export default function ArtProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  // 로그인 체크
  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/profile/art-profile');
    }
  }, [isAuthenticated, router]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p>로그인이 필요합니다...</p>
        </div>
      </div>
    );
  }

  return <ArtProfileGenerator />;
}