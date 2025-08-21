'use client';

import { useState, useEffect, useCallback } from 'react';

interface GuestInteraction {
  type: 'artwork_click' | 'like' | 'save' | 'view' | 'search' | 'category_change';
  timestamp: number;
  data?: any;
}

interface InteractionData {
  interactions: GuestInteraction[];
  totalInteractions: number;
  sessionDuration: number;
  artworkViews: number;
  artworkSaves: number;
  uniqueArtworksViewed: Set<string>;
  shouldShowPrompt: boolean;
  promptThreshold: number;
}

const GUEST_INTERACTIONS_KEY = 'sayu_guest_interactions';
const SESSION_START_KEY = 'sayu_session_start';

export function useGuestTracking() {
  const [interactionData, setInteractionData] = useState<InteractionData>({
    interactions: [],
    totalInteractions: 0,
    sessionDuration: 0,
    artworkViews: 0,
    artworkSaves: 0,
    uniqueArtworksViewed: new Set(),
    shouldShowPrompt: false,
    promptThreshold: 5 // Show prompt after 5 interactions
  });

  useEffect(() => {
    // Initialize session tracking
    const sessionStart = localStorage.getItem(SESSION_START_KEY);
    if (!sessionStart) {
      localStorage.setItem(SESSION_START_KEY, Date.now().toString());
    }

    // Load existing interactions
    loadInteractions();

    // Update session duration every 30 seconds
    const interval = setInterval(updateSessionDuration, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadInteractions = () => {
    try {
      const stored = localStorage.getItem(GUEST_INTERACTIONS_KEY);
      if (stored) {
        const interactions: GuestInteraction[] = JSON.parse(stored);
        const uniqueViews = new Set<string>();
        let artworkViews = 0;
        let artworkSaves = 0;

        interactions.forEach(interaction => {
          if (interaction.type === 'artwork_click' || interaction.type === 'view') {
            artworkViews++;
            if (interaction.data?.artworkId) {
              uniqueViews.add(interaction.data.artworkId);
            }
          } else if (interaction.type === 'save') {
            artworkSaves++;
          }
        });

        setInteractionData(prev => ({
          ...prev,
          interactions,
          totalInteractions: interactions.length,
          artworkViews,
          artworkSaves,
          uniqueArtworksViewed: uniqueViews,
          shouldShowPrompt: interactions.length >= prev.promptThreshold
        }));
      }
    } catch (error) {
      console.error('Error loading guest interactions:', error);
    }
  };

  const updateSessionDuration = () => {
    const sessionStart = localStorage.getItem(SESSION_START_KEY);
    if (sessionStart) {
      const duration = Math.floor((Date.now() - parseInt(sessionStart)) / 1000);
      setInteractionData(prev => ({ ...prev, sessionDuration: duration }));
    }
  };

  const trackInteraction = useCallback((type: GuestInteraction['type'], data?: any) => {
    const interaction: GuestInteraction = {
      type,
      timestamp: Date.now(),
      data
    };

    try {
      const stored = localStorage.getItem(GUEST_INTERACTIONS_KEY);
      const interactions: GuestInteraction[] = stored ? JSON.parse(stored) : [];
      interactions.push(interaction);

      // Keep only last 100 interactions to prevent storage bloat
      const recentInteractions = interactions.slice(-100);
      localStorage.setItem(GUEST_INTERACTIONS_KEY, JSON.stringify(recentInteractions));

      // Update state
      setInteractionData(prev => {
        const newUniqueViews = new Set(prev.uniqueArtworksViewed);
        let newArtworkViews = prev.artworkViews;
        let newArtworkSaves = prev.artworkSaves;

        if (type === 'artwork_click' || type === 'view') {
          newArtworkViews++;
          if (data?.artworkId) {
            newUniqueViews.add(data.artworkId);
          }
        } else if (type === 'save') {
          newArtworkSaves++;
        }

        const newTotalInteractions = prev.totalInteractions + 1;
        
        return {
          ...prev,
          interactions: recentInteractions,
          totalInteractions: newTotalInteractions,
          artworkViews: newArtworkViews,
          artworkSaves: newArtworkSaves,
          uniqueArtworksViewed: newUniqueViews,
          shouldShowPrompt: newTotalInteractions >= prev.promptThreshold
        };
      });

      // Dispatch events for specific thresholds
      if (type === 'save' && data?.artworkId) {
        const guestData = JSON.parse(localStorage.getItem('sayu_guest_data') || '{}');
        const savedCount = guestData.savedArtworks?.length || 0;
        
        if (savedCount === 1) {
          window.dispatchEvent(new CustomEvent('guest-milestone', { 
            detail: { milestone: 'first_save', interactionCount: interactions.length }
          }));
        } else if (savedCount >= 3) {
          window.dispatchEvent(new CustomEvent('guest-milestone', { 
            detail: { milestone: 'collection_started', interactionCount: interactions.length }
          }));
        }
      }

      // High engagement threshold
      if (interactions.length >= 10) {
        window.dispatchEvent(new CustomEvent('guest-milestone', { 
          detail: { milestone: 'high_engagement', interactionCount: interactions.length }
        }));
      }

    } catch (error) {
      console.error('Error tracking interaction:', error);
    }
  }, []);

  const getEngagementLevel = useCallback(() => {
    const { totalInteractions, sessionDuration, artworkSaves, uniqueArtworksViewed } = interactionData;
    
    if (artworkSaves >= 5 || totalInteractions >= 15) return 'high';
    if (artworkSaves >= 2 || totalInteractions >= 8 || sessionDuration >= 300) return 'medium';
    if (totalInteractions >= 3 || sessionDuration >= 120) return 'low';
    return 'minimal';
  }, [interactionData]);

  const shouldShowSignupPrompt = useCallback((trigger?: 'interaction_count' | 'time_spent' | 'save_threshold') => {
    const { totalInteractions, sessionDuration, artworkSaves } = interactionData;
    
    switch (trigger) {
      case 'interaction_count':
        return totalInteractions >= 5;
      case 'time_spent':
        return sessionDuration >= 300; // 5 minutes
      case 'save_threshold':
        return artworkSaves >= 2;
      default:
        return totalInteractions >= 5 || sessionDuration >= 300 || artworkSaves >= 2;
    }
  }, [interactionData]);

  const getInteractionData = useCallback(() => interactionData, [interactionData]);

  const clearInteractionData = useCallback(() => {
    localStorage.removeItem(GUEST_INTERACTIONS_KEY);
    localStorage.removeItem(SESSION_START_KEY);
    setInteractionData({
      interactions: [],
      totalInteractions: 0,
      sessionDuration: 0,
      artworkViews: 0,
      artworkSaves: 0,
      uniqueArtworksViewed: new Set(),
      shouldShowPrompt: false,
      promptThreshold: 5
    });
  }, []);

  const getPersonalizationInsights = useCallback(() => {
    const { uniqueArtworksViewed, interactions } = interactionData;
    
    // Analyze interaction patterns
    const recentInteractions = interactions.slice(-10);
    const categories = new Set();
    const artists = new Set();
    
    recentInteractions.forEach(interaction => {
      if (interaction.data?.category) categories.add(interaction.data.category);
      if (interaction.data?.artist) artists.add(interaction.data.artist);
    });

    return {
      uniqueArtworksViewed: uniqueArtworksViewed.size,
      preferredCategories: Array.from(categories),
      interestedArtists: Array.from(artists),
      engagementPattern: getEngagementLevel(),
      readyForPersonalization: uniqueArtworksViewed.size >= 3 && interactionData.artworkSaves >= 1
    };
  }, [interactionData, getEngagementLevel]);

  return {
    trackInteraction,
    getInteractionData,
    getEngagementLevel,
    shouldShowSignupPrompt,
    clearInteractionData,
    getPersonalizationInsights,
    interactionCount: interactionData.totalInteractions,
    sessionDuration: interactionData.sessionDuration,
    shouldShowPrompt: interactionData.shouldShowPrompt
  };
}