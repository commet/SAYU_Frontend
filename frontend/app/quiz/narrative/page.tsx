'use client';

import { Suspense, lazy, useState, useEffect } from 'react';
import { useResponsive } from '@/lib/responsive';

// Dynamic import for audio processing component
const AudioGuideQuiz = lazy(() => import('@/components/quiz/AudioGuideQuiz').then(mod => ({ default: mod.AudioGuideQuiz })));
const MobileQuiz = lazy(() => import('@/components/quiz/MobileQuiz').then(mod => ({ default: mod.MobileQuiz })));

export default function NarrativeQuizPage() {
  const { isMobile } = useResponsive();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading Quiz...</p>
        </div>
      </div>
    }>
      {mounted && isMobile ? <MobileQuiz /> : <AudioGuideQuiz />}
    </Suspense>
  );
}