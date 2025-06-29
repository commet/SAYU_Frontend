'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface OnboardingContextType {
  showWelcomeModal: boolean;
  setShowWelcomeModal: (show: boolean) => void;
  isNewUser: boolean;
  onboardingProgress: {
    hasCompletedQuiz: boolean;
    hasChattedWithCurator: boolean;
    hasExploredGallery: boolean;
    hasEarnedAchievement: boolean;
  };
  updateProgress: (key: keyof OnboardingContextType['onboardingProgress'], value: boolean) => void;
  resetOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [onboardingProgress, setOnboardingProgress] = useState({
    hasCompletedQuiz: false,
    hasChattedWithCurator: false,
    hasExploredGallery: false,
    hasEarnedAchievement: false
  });

  useEffect(() => {
    if (user) {
      // Check if user is new (created within last 5 minutes)
      const createdAt = new Date(user.created_at || Date.now());
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const userIsNew = createdAt > fiveMinutesAgo;
      
      setIsNewUser(userIsNew);
      
      // Load onboarding progress
      const savedProgress = localStorage.getItem(`onboarding_${user.id}`);
      if (savedProgress) {
        setOnboardingProgress(JSON.parse(savedProgress));
      } else if (userIsNew) {
        // Initialize progress for new user
        const initialProgress = {
          hasCompletedQuiz: user.hasProfile || false,
          hasChattedWithCurator: false,
          hasExploredGallery: false,
          hasEarnedAchievement: false
        };
        setOnboardingProgress(initialProgress);
        localStorage.setItem(`onboarding_${user.id}`, JSON.stringify(initialProgress));
      }
      
      // Show welcome modal for new users who haven't seen it
      const hasSeenWelcome = localStorage.getItem(`welcome_${user.id}`);
      if (userIsNew && !hasSeenWelcome && !user.hasProfile) {
        setShowWelcomeModal(true);
        localStorage.setItem(`welcome_${user.id}`, 'true');
      }
    }
  }, [user]);

  const updateProgress = (key: keyof typeof onboardingProgress, value: boolean) => {
    if (!user) return;
    
    const newProgress = { ...onboardingProgress, [key]: value };
    setOnboardingProgress(newProgress);
    localStorage.setItem(`onboarding_${user.id}`, JSON.stringify(newProgress));
  };

  const resetOnboarding = () => {
    if (!user) return;
    
    // Clear all onboarding data
    localStorage.removeItem(`onboarding_${user.id}`);
    localStorage.removeItem(`welcome_${user.id}`);
    localStorage.removeItem('onboardingCompleted');
    localStorage.removeItem('journeyTour_completed');
    localStorage.removeItem('featureSpotlight_completed');
    
    // Reset state
    setOnboardingProgress({
      hasCompletedQuiz: false,
      hasChattedWithCurator: false,
      hasExploredGallery: false,
      hasEarnedAchievement: false
    });
    setIsNewUser(true);
    setShowWelcomeModal(true);
  };

  return (
    <OnboardingContext.Provider value={{
      showWelcomeModal,
      setShowWelcomeModal,
      isNewUser,
      onboardingProgress,
      updateProgress,
      resetOnboarding
    }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
};