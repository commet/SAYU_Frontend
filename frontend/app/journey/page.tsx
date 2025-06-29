'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { usePersonalizedTheme } from '@/hooks/usePersonalizedTheme';
import { useAchievements } from '@/hooks/useAchievements';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ThemeIndicator } from '@/components/ui/theme-showcase';
import { 
  PersonalizedCard,
  PersonalizedButton,
  PersonalizedContainer,
  PersonalizedHeader,
  PersonalizedGrid,
  PersonalizedLoading
} from '@/components/ui/personalized-components';
import { Sparkles, Palette, Heart, TrendingUp, Eye, MessageCircle, Calendar, BarChart3, Archive } from 'lucide-react';
import { DailyRecommendationCard } from '@/components/ui/daily-recommendation';
import { WeeklyInsightsCard } from '@/components/ui/weekly-insights';
import { OnboardingChecklist } from '@/components/onboarding/OnboardingChecklist';
import { JourneyTour } from '@/components/onboarding/JourneyTour';

export default function JourneyPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { theme, isLoading: themeLoading } = usePersonalizedTheme();
  const { trackDailyLogin, trackExplorationDay } = useAchievements();
  const { isNewUser } = useOnboarding();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Track daily login and exploration
  useEffect(() => {
    if (user) {
      trackDailyLogin();
      trackExplorationDay();
    }
  }, [user, trackDailyLogin, trackExplorationDay]);

  if (loading || !user || themeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <PersonalizedLoading text="Preparing your personalized journey..." />
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen theme-animated-element"
      style={{ backgroundColor: theme?.colors.background }}
    >
      {/* Header */}
      <header 
        className="p-6 border-b backdrop-blur-sm"
        style={{ 
          backgroundColor: `${theme?.colors.surface}ee`,
          borderColor: theme?.colors.border
        }}
      >
        <PersonalizedContainer>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <ThemeIndicator />
              <h1 
                className="text-2xl font-bold"
                style={{ color: theme?.colors.text }}
              >
                Your Aesthetic Journey
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span style={{ color: theme?.colors.textSecondary }}>
                Welcome, {user.nickname}
              </span>
              <PersonalizedButton 
                variant="ghost"
                onClick={() => router.push('/profile')}
              >
                View Profile
              </PersonalizedButton>
            </div>
          </div>
        </PersonalizedContainer>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <PersonalizedContainer>
          {/* Hero Section */}
          <PersonalizedHeader 
            title="Your Aesthetic Journey"
            subtitle={`Welcome back, ${user.nickname}! Continue exploring your unique aesthetic personality.`}
            gradient={true}
          />

          {/* Stats Cards */}
          <PersonalizedGrid columns={4} gap="md" className="mb-12" data-tour="profile-stats">
            <PersonalizedCard>
              <div className="flex items-center justify-between mb-4">
                <Sparkles 
                  className="w-8 h-8" 
                  style={{ color: theme?.colors.accent }}
                />
                <span 
                  className="text-2xl font-bold"
                  style={{ color: theme?.colors.text }}
                >
                  {user.typeCode || 'N/A'}
                </span>
              </div>
              <h3 style={{ color: theme?.colors.textSecondary }}>Type Code</h3>
            </PersonalizedCard>

            <PersonalizedCard>
              <div className="flex items-center justify-between mb-4">
                <Palette 
                  className="w-8 h-8" 
                  style={{ color: theme?.colors.secondary }}
                />
                <span 
                  className="text-2xl font-bold capitalize"
                  style={{ color: theme?.colors.text }}
                >
                  {user.agencyLevel || 'Explorer'}
                </span>
              </div>
              <h3 style={{ color: theme?.colors.textSecondary }}>Agency Level</h3>
            </PersonalizedCard>

            <PersonalizedCard>
              <div className="flex items-center justify-between mb-4">
                <Heart 
                  className="w-8 h-8" 
                  style={{ color: theme?.colors.primary }}
                />
                <span 
                  className="text-2xl font-bold capitalize"
                  style={{ color: theme?.colors.text }}
                >
                  {user.journeyStage || 'Beginning'}
                </span>
              </div>
              <h3 style={{ color: theme?.colors.textSecondary }}>Journey Stage</h3>
            </PersonalizedCard>

            <PersonalizedCard>
              <div className="flex items-center justify-between mb-4">
                <TrendingUp 
                  className="w-8 h-8" 
                  style={{ color: theme?.colors.accent }}
                />
                <span 
                  className="text-2xl font-bold"
                  style={{ color: theme?.colors.text }}
                >
                  {user.hasProfile ? 'Complete' : 'In Progress'}
                </span>
              </div>
              <h3 style={{ color: theme?.colors.textSecondary }}>Profile Status</h3>
            </PersonalizedCard>
          </PersonalizedGrid>

          {/* Daily Recommendation & Weekly Insights */}
          <PersonalizedGrid columns={2} gap="lg" className="mb-8">
            <div data-tour="daily-recommendation">
              <DailyRecommendationCard />
            </div>
            <div data-tour="weekly-insights">
              <WeeklyInsightsCard />
            </div>
          </PersonalizedGrid>

          {/* Action Cards */}
          <PersonalizedGrid columns={2} gap="md">
            {!user.hasProfile && (
              <PersonalizedCard gradient hover>
                <div className="p-4">
                  <h2 className="text-2xl font-bold text-white mb-4">
                    Complete Your Profile
                  </h2>
                  <p className="text-white/90 mb-6">
                    Discover your unique aesthetic personality through our guided quiz experience.
                  </p>
                  <PersonalizedButton
                    variant="secondary"
                    onClick={() => router.push('/quiz')}
                  >
                    Start Quiz
                  </PersonalizedButton>
                </div>
              </PersonalizedCard>
            )}

            <PersonalizedCard hover>
              <div className="p-4">
                <div className="flex items-center mb-4">
                  <Eye 
                    className="w-8 h-8 mr-3" 
                    style={{ color: theme?.colors.accent }}
                  />
                  <h2 
                    className="text-2xl font-bold"
                    style={{ color: theme?.colors.text }}
                  >
                    Explore Gallery
                  </h2>
                </div>
                <p 
                  className="mb-6"
                  style={{ color: theme?.colors.textSecondary }}
                >
                  Browse curated artworks matched to your aesthetic preferences.
                </p>
                <PersonalizedButton
                  variant="primary"
                  onClick={() => router.push('/gallery')}
                >
                  View Gallery
                </PersonalizedButton>
              </div>
            </PersonalizedCard>

            <PersonalizedCard hover data-tour="ai-curator">
              <div className="p-4">
                <div className="flex items-center mb-4">
                  <MessageCircle 
                    className="w-8 h-8 mr-3" 
                    style={{ color: theme?.colors.secondary }}
                  />
                  <h2 
                    className="text-2xl font-bold"
                    style={{ color: theme?.colors.text }}
                  >
                    AI Curator
                  </h2>
                </div>
                <p 
                  className="mb-6"
                  style={{ color: theme?.colors.textSecondary }}
                >
                  Chat with your personalized art curator for insights and recommendations.
                </p>
                <PersonalizedButton
                  variant="outline"
                  onClick={() => router.push('/agent')}
                >
                  Start Chat
                </PersonalizedButton>
              </div>
            </PersonalizedCard>

            <PersonalizedCard hover>
              <div className="p-4">
                <div className="flex items-center mb-4">
                  <Archive 
                    className="w-8 h-8 mr-3" 
                    style={{ color: theme?.colors.accent }}
                  />
                  <h2 
                    className="text-2xl font-bold"
                    style={{ color: theme?.colors.text }}
                  >
                    Exhibition Archive
                  </h2>
                </div>
                <p 
                  className="mb-6"
                  style={{ color: theme?.colors.textSecondary }}
                >
                  Capture your museum visits and artwork impressions in real-time.
                </p>
                <PersonalizedButton
                  variant="secondary"
                  onClick={() => router.push('/archive')}
                >
                  Start Archiving
                </PersonalizedButton>
              </div>
            </PersonalizedCard>

            <PersonalizedCard hover data-tour="achievements">
              <div className="p-4">
                <div className="flex items-center mb-4">
                  <BarChart3 
                    className="w-8 h-8 mr-3" 
                    style={{ color: theme?.colors.primary }}
                  />
                  <h2 
                    className="text-2xl font-bold"
                    style={{ color: theme?.colors.text }}
                  >
                    Analytics
                  </h2>
                </div>
                <p 
                  className="mb-6"
                  style={{ color: theme?.colors.textSecondary }}
                >
                  Track your art exploration journey and aesthetic evolution.
                </p>
                <PersonalizedButton
                  variant="ghost"
                  onClick={() => router.push('/profile')}
                >
                  View Insights
                </PersonalizedButton>
              </div>
            </PersonalizedCard>
          </PersonalizedGrid>
        </PersonalizedContainer>
      </main>

      {/* Onboarding Components */}
      {isNewUser && <OnboardingChecklist />}
      <JourneyTour />
    </div>
  );
}