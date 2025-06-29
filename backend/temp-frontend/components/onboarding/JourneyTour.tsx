'use client';

import { useEffect, useState } from 'react';
import { FeatureSpotlight } from './FeatureSpotlight';
import { useRouter } from 'next/navigation';

export function JourneyTour() {
  const router = useRouter();
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    // Delay tour start to ensure elements are rendered
    const timer = setTimeout(() => {
      const hasShownTour = localStorage.getItem('journeyTour_completed');
      if (!hasShownTour) {
        setShowTour(true);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const tourSteps = [
    {
      target: '[data-tour="profile-stats"]',
      title: 'Your Aesthetic Identity',
      description: 'This shows your unique personality type and current journey stage. Your agency level grows as you engage with art.',
      position: 'bottom' as const
    },
    {
      target: '[data-tour="daily-recommendation"]',
      title: 'Daily Art Discovery',
      description: 'Every day, we curate new artworks specifically matched to your aesthetic personality.',
      position: 'top' as const,
      action: {
        label: 'View Today\'s Art',
        onClick: () => router.push('/gallery')
      }
    },
    {
      target: '[data-tour="ai-curator"]',
      title: 'Your AI Art Companion',
      description: 'Chat with an AI curator who understands your taste and can guide your aesthetic journey.',
      position: 'left' as const,
      action: {
        label: 'Start Conversation',
        onClick: () => router.push('/agent')
      }
    },
    {
      target: '[data-tour="achievements"]',
      title: 'Track Your Progress',
      description: 'Earn achievements as you explore art, chat with the AI, and deepen your aesthetic understanding.',
      position: 'top' as const
    },
    {
      target: '[data-tour="weekly-insights"]',
      title: 'Weekly Insights',
      description: 'Get personalized reports about your art interactions and aesthetic evolution.',
      position: 'left' as const
    }
  ];

  if (!showTour) return null;

  return (
    <FeatureSpotlight
      steps={tourSteps}
      storageKey="journeyTour"
      onComplete={() => setShowTour(false)}
    />
  );
}