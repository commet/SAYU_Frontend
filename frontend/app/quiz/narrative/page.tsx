'use client';

import { Suspense, lazy } from 'react';

// Dynamic import for audio processing component
const AudioGuideQuiz = lazy(() => import('@/components/quiz/AudioGuideQuiz').then(mod => ({ default: mod.AudioGuideQuiz })));

export default function NarrativeQuizPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading Audio Guide Quiz...</p>
        </div>
      </div>
    }>
      <AudioGuideQuiz />
    </Suspense>
  );
}