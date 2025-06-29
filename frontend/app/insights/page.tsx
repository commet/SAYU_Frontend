'use client';

import { Suspense } from 'react';
import BehavioralInsightsDashboard from '@/components/insights/BehavioralInsightsDashboard';
import { Sparkles } from 'lucide-react';

export default function InsightsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<InsightsLoading />}>
        <BehavioralInsightsDashboard />
      </Suspense>
    </div>
  );
}

function InsightsLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <div className="animate-spin">
          <Sparkles className="w-12 h-12 text-purple-600 mx-auto" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Analyzing Your Art Journey</h2>
          <p className="text-muted-foreground">
            Generating personalized insights from your viewing patterns...
          </p>
        </div>
      </div>
    </div>
  );
}