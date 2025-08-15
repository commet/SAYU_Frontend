'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useResponsive } from '@/lib/responsive';
import dynamic from 'next/dynamic';
import ExhibitionsClient from '@/components/exhibitions/ExhibitionsClient';

// Lazy load mobile component
const MobileExhibitions = dynamic(() => import('@/components/mobile/MobileExhibitions'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-300 border-t-purple-600"></div>
    </div>
  )
});

export default function ExhibitionsPage() {
  const { isMobile } = useResponsive();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-cover bg-center bg-fixed flex items-center justify-center relative"
           style={{ backgroundImage: 'url("/images/backgrounds/stone-gallery-entrance-solitary-figure.jpg")' }}>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
        <div className="relative z-10 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/30 border-t-white mx-auto mb-4"></div>
          <p className="text-white/80 text-sm">로딩 중...</p>
        </div>
      </div>
    );
  }
  
  // Render mobile component for mobile devices
  if (isMobile) {
    return (
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-300 border-t-purple-600"></div>
        </div>
      }>
        <MobileExhibitions />
      </Suspense>
    );
  }

  // Desktop version - use optimized client component
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed relative"
      style={{ backgroundImage: "url('/images/backgrounds/family-viewing-corner-gallery-intimate.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
      
      {/* Header */}
      <div className="relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">
              전시 탐험
            </h1>
            <p className="text-white text-lg max-w-2xl mx-auto drop-shadow-md">
              당신의 취향에 맞는 전시를 발견하고,<br />
              새로운 예술 경험을 시작하세요
            </p>
          </motion.div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <Suspense fallback={
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-3 border-purple-200 border-t-purple-600 mx-auto mb-6"></div>
            <p className="text-white text-lg font-medium">전시 정보를 불러오는 중...</p>
            <p className="text-gray-300 text-sm mt-2">Supabase 직접 연결로 빠르게 로딩 중</p>
          </div>
        }>
          <ExhibitionsClient />
        </Suspense>
      </div>
    </div>
  );
}