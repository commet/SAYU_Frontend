/**
 * Easter Egg Context Provider
 * Manages easter egg discovery system globally
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { EasterEggService } from '@/lib/easter-egg/easter-egg-service';
import { EasterEggNotification } from '@/components/easter-egg/EasterEggNotification';
import { EasterEgg, Badge, UserEasterEggProgress } from '@/types/sayu-shared';

interface EasterEggContextType {
  progress: UserEasterEggProgress | null;
  discoveredEggs: EasterEgg[];
  badges: Badge[];
  currentTitle: { title: string; titleKo: string };
  totalPoints: number;
  checkCommand: (command: string) => void;
  trackAction: (action: string, data?: any) => void;
  isDiscovered: (eggId: string) => boolean;
  getHints: () => string[];
}

const EasterEggContext = createContext<EasterEggContextType | undefined>(undefined);

export function EasterEggProvider({ children }: { children: React.ReactNode }) {
  const [service, setService] = useState<EasterEggService | null>(null);
  const [progress, setProgress] = useState<UserEasterEggProgress | null>(null);
  const [currentDiscovery, setCurrentDiscovery] = useState<{ egg: EasterEgg; badge?: Badge } | null>(null);

  useEffect(() => {
    // Initialize service on client side only
    if (typeof window !== 'undefined') {
      const easterEggService = EasterEggService.getInstance();
      setService(easterEggService);
      
      // Load initial progress
      setProgress(easterEggService.getProgress());
      
      // Subscribe to discoveries
      const unsubscribe = easterEggService.onDiscovery((discovery) => {
        setProgress(discovery.userProgress);
        
        // Get badge if reward is badge type
        let badge: Badge | undefined;
        if (discovery.egg.reward.type === 'badge') {
          const badges = easterEggService.getBadges();
          badge = badges.find(b => b.id === discovery.egg.reward.id);
        }
        
        setCurrentDiscovery({ egg: discovery.egg, badge });
      });
      
      return () => {
        unsubscribe();
      };
    }
  }, []);

  const checkCommand = useCallback((command: string) => {
    service?.checkCommandEasterEgg(command);
  }, [service]);

  const trackAction = useCallback((action: string, data?: any) => {
    service?.trackAction(action, data);
  }, [service]);

  const isDiscovered = useCallback((eggId: string): boolean => {
    return service?.isDiscovered(eggId) || false;
  }, [service]);

  const getHints = useCallback((): string[] => {
    return service?.getHints() || [];
  }, [service]);

  const value: EasterEggContextType = {
    progress,
    discoveredEggs: service?.getDiscoveredEggs() || [],
    badges: service?.getBadges() || [],
    currentTitle: service?.getCurrentTitle() || { title: 'Art Beginner', titleKo: '예술 입문자' },
    totalPoints: progress?.totalPoints || 0,
    checkCommand,
    trackAction,
    isDiscovered,
    getHints
  };

  return (
    <EasterEggContext.Provider value={value}>
      {children}
      <EasterEggNotification
        discovery={currentDiscovery}
        onClose={() => setCurrentDiscovery(null)}
      />
    </EasterEggContext.Provider>
  );
}

export function useEasterEgg() {
  const context = useContext(EasterEggContext);
  if (context === undefined) {
    throw new Error('useEasterEgg must be used within an EasterEggProvider');
  }
  return context;
}