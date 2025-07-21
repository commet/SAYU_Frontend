'use client';

import { useState, useEffect, useContext, createContext } from 'react';
import { useAuth } from './useAuth';
import { generatePersonalizedTheme, applyThemeToDOM, PersonalizedTheme } from '@/lib/themes';

interface ThemeContextType {
  theme: PersonalizedTheme | null;
  isLoading: boolean;
  applyTheme: (theme: PersonalizedTheme) => void;
  resetToDefault: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: null,
  isLoading: true,
  applyTheme: () => {},
  resetToDefault: () => {}
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [theme, setTheme] = useState<PersonalizedTheme | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user profile and generate theme
  useEffect(() => {
    if (user) {
      fetchUserProfileAndTheme();
    } else {
      // Apply default theme for non-authenticated users
      const defaultTheme = generatePersonalizedTheme('', 'Guest User');
      applyTheme(defaultTheme);
    }
  }, [user]);

  // Listen for dark mode toggles and re-apply theme
  useEffect(() => {
    const handleDarkModeToggle = () => {
      if (theme) {
        // Re-apply current theme when dark mode is toggled
        applyThemeToDOM(theme);
      }
    };

    window.addEventListener('darkModeToggled', handleDarkModeToggle);
    return () => {
      window.removeEventListener('darkModeToggled', handleDarkModeToggle);
    };
  }, [theme]);

  const fetchUserProfileAndTheme = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        const defaultTheme = generatePersonalizedTheme('', 'Guest User');
        applyTheme(defaultTheme);
        return;
      }

      // Check if we have cached theme
      const cachedTheme = localStorage.getItem('userTheme');
      if (cachedTheme) {
        try {
          const parsedTheme = JSON.parse(cachedTheme);
          setTheme(parsedTheme);
          applyThemeToDOM(parsedTheme);
          setIsLoading(false);
          
          // Still fetch fresh profile in background
          fetchFreshProfile(token);
          return;
        } catch (error) {
          console.error('Error parsing cached theme:', error);
        }
      }

      // Fetch fresh profile
      await fetchFreshProfile(token);
    } catch (error) {
      console.error('Error fetching user profile for theming:', error);
      // Fallback to default theme
      const defaultTheme = generatePersonalizedTheme('', 'Guest User');
      applyTheme(defaultTheme);
    }
  };

  const fetchFreshProfile = async (token: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const profileData = await response.json();
        
        // Generate personalized theme from profile
        const personalizedTheme = generatePersonalizedTheme(
          profileData.typeCode || '',
          profileData.archetypeName || 'Art Enthusiast'
        );

        // Cache the theme
        localStorage.setItem('userTheme', JSON.stringify(personalizedTheme));
        
        applyTheme(personalizedTheme);
      } else {
        // Profile not found, use default
        const defaultTheme = generatePersonalizedTheme('', 'Art Explorer');
        applyTheme(defaultTheme);
      }
    } catch (error) {
      console.error('Error fetching fresh profile:', error);
      const defaultTheme = generatePersonalizedTheme('', 'Art Explorer');
      applyTheme(defaultTheme);
    }
  };

  const applyTheme = (newTheme: PersonalizedTheme) => {
    setTheme(newTheme);
    applyThemeToDOM(newTheme);
    setIsLoading(false);

    // Add theme class to body for additional styling
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(`theme-${newTheme.id}`);

    // Dispatch custom event for components that need to react to theme changes
    window.dispatchEvent(new CustomEvent('themeChanged', { 
      detail: { theme: newTheme } 
    }));
  };

  const resetToDefault = () => {
    const defaultTheme = generatePersonalizedTheme('', 'Default User');
    localStorage.removeItem('userTheme');
    applyTheme(defaultTheme);
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      isLoading,
      applyTheme,
      resetToDefault
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function usePersonalizedTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('usePersonalizedTheme must be used within a ThemeProvider');
  }
  return context;
}

// Hook for components that want to react to theme changes
export function useThemeListener(callback: (theme: PersonalizedTheme) => void) {
  useEffect(() => {
    const handleThemeChange = (event: CustomEvent) => {
      callback(event.detail.theme);
    };

    window.addEventListener('themeChanged', handleThemeChange as EventListener);
    return () => {
      window.removeEventListener('themeChanged', handleThemeChange as EventListener);
    };
  }, [callback]);
}

// Utility hook for theme-aware animations
export function useThemeAwareAnimations() {
  const { theme } = usePersonalizedTheme();
  
  return {
    duration: theme?.animations.duration || '0.3s',
    easing: theme?.animations.easing || 'ease',
    hoverScale: theme?.animations.hoverScale || '1.05',
    entrance: theme?.animations.entranceAnimation || 'fadeIn'
  };
}

// Utility hook for theme-aware spacing
export function useThemeAwareLayout() {
  const { theme } = usePersonalizedTheme();
  
  return {
    spacing: theme?.layout.spacing || '1.5rem',
    borderRadius: theme?.layout.borderRadius || '12px',
    cardPadding: theme?.layout.cardPadding || '2rem',
    maxWidth: theme?.layout.maxWidth || '1200px',
    shadows: theme?.layout.shadows || '0 4px 16px rgba(0, 0, 0, 0.1)'
  };
}