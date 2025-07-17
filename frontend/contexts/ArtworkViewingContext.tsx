'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface Artwork {
  id: string;
  title: string;
  artist: string;
  year: number;
  imageUrl: string;
  description?: string;
  medium?: string;
  dimensions?: string;
  museum?: string;
  department?: string;
  tags?: string[];
  personalityMapping?: {
    viewingStyle: { lone: number; shared: number };
    perceptionMode: { atmospheric: number; realistic: number };
    responseType: { emotional: number; meaningful: number };
    explorationFit: { flow: number; constructive: number };
  };
}

interface ViewingStats {
  totalTime: number;
  startTime: Date;
  interactions: number;
  zoomed: boolean;
  shared: boolean;
}

interface ArtworkViewingContextType {
  currentArtwork: Artwork | null;
  viewingHistory: Artwork[];
  viewingStats: ViewingStats | null;
  setCurrentArtwork: (artwork: Artwork | null) => void;
  addToHistory: (artwork: Artwork) => void;
  clearHistory: () => void;
  updateViewingStats: (stats: Partial<ViewingStats>) => void;
  getViewingTime: () => number;
}

const ArtworkViewingContext = createContext<ArtworkViewingContextType | undefined>(undefined);

export const useArtworkViewing = () => {
  const context = useContext(ArtworkViewingContext);
  if (!context) {
    throw new Error('useArtworkViewing must be used within ArtworkViewingProvider');
  }
  return context;
};

interface ArtworkViewingProviderProps {
  children: ReactNode;
}

export const ArtworkViewingProvider: React.FC<ArtworkViewingProviderProps> = ({ children }) => {
  const [currentArtwork, setCurrentArtworkState] = useState<Artwork | null>(null);
  const [viewingHistory, setViewingHistory] = useState<Artwork[]>([]);
  const [viewingStats, setViewingStats] = useState<ViewingStats | null>(null);

  const setCurrentArtwork = useCallback((artwork: Artwork | null) => {
    // Save stats for previous artwork
    if (currentArtwork && viewingStats) {
      const totalTime = Date.now() - viewingStats.startTime.getTime();
      // Could save this to backend here
    }

    setCurrentArtworkState(artwork);
    
    // Initialize stats for new artwork
    if (artwork) {
      setViewingStats({
        totalTime: 0,
        startTime: new Date(),
        interactions: 0,
        zoomed: false,
        shared: false
      });
    } else {
      setViewingStats(null);
    }
  }, [currentArtwork, viewingStats]);

  const addToHistory = useCallback((artwork: Artwork) => {
    setViewingHistory(prev => {
      // Avoid duplicates in recent history
      const filtered = prev.filter(a => a.id !== artwork.id);
      return [artwork, ...filtered].slice(0, 50); // Keep last 50 artworks
    });
  }, []);

  const clearHistory = useCallback(() => {
    setViewingHistory([]);
  }, []);

  const updateViewingStats = useCallback((updates: Partial<ViewingStats>) => {
    setViewingStats(prev => {
      if (!prev) return null;
      return { ...prev, ...updates };
    });
  }, []);

  const getViewingTime = useCallback(() => {
    if (!viewingStats) return 0;
    return Math.floor((Date.now() - viewingStats.startTime.getTime()) / 1000);
  }, [viewingStats]);

  const value: ArtworkViewingContextType = {
    currentArtwork,
    viewingHistory,
    viewingStats,
    setCurrentArtwork,
    addToHistory,
    clearHistory,
    updateViewingStats,
    getViewingTime
  };

  return (
    <ArtworkViewingContext.Provider value={value}>
      {children}
    </ArtworkViewingContext.Provider>
  );
};

// Helper hook to track viewing behavior
export const useArtworkTracking = () => {
  const { currentArtwork, updateViewingStats } = useArtworkViewing();

  const trackInteraction = useCallback((type: 'click' | 'zoom' | 'share' | 'save') => {
    updateViewingStats({
      interactions: (prev) => (prev || 0) + 1,
      ...(type === 'zoom' && { zoomed: true }),
      ...(type === 'share' && { shared: true })
    });
  }, [updateViewingStats]);

  return { trackInteraction };
};