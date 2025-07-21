'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface DarkModeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (value: boolean) => void;
}

const DarkModeContext = createContext<DarkModeContextType | undefined>(undefined);

export function DarkModeProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize dark mode from localStorage or system preference
  useEffect(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem('darkMode');
    
    if (savedTheme !== null) {
      const isDark = savedTheme === 'true';
      setIsDarkMode(isDark);
      applyDarkMode(isDark);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
      applyDarkMode(prefersDark);
    }
    
    setIsInitialized(true);
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      // Only apply system preference if user hasn't manually set a preference
      const savedTheme = localStorage.getItem('darkMode');
      if (savedTheme === null) {
        setIsDarkMode(e.matches);
        applyDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Apply dark mode class to document
  const applyDarkMode = (isDark: boolean) => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      // Clear theme color overrides to let dark mode CSS take precedence
      clearThemeColorOverrides();
    } else {
      document.documentElement.classList.remove('dark');
      // Re-apply theme if available
      reapplyThemeColors();
    }
  };

  // Clear theme color CSS variables that conflict with dark mode
  const clearThemeColorOverrides = () => {
    const root = document.documentElement;
    const colorProps = ['primary', 'secondary', 'background', 'surface', 'muted', 'text', 'textSecondary', 'border'];
    colorProps.forEach(prop => {
      root.style.removeProperty(`--color-${prop}`);
    });
  };

  // Re-apply theme colors when switching back to light mode
  const reapplyThemeColors = () => {
    // Trigger theme re-application by dispatching a custom event
    window.dispatchEvent(new CustomEvent('darkModeToggled', { detail: { isDark: false } }));
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newValue = !isDarkMode;
    setIsDarkMode(newValue);
    localStorage.setItem('darkMode', String(newValue));
    applyDarkMode(newValue);
  };

  // Set dark mode explicitly
  const setDarkMode = (value: boolean) => {
    setIsDarkMode(value);
    localStorage.setItem('darkMode', String(value));
    applyDarkMode(value);
  };

  // Prevent flash of incorrect theme
  useEffect(() => {
    if (isInitialized) {
      applyDarkMode(isDarkMode);
    }
  }, [isDarkMode, isInitialized]);

  return (
    <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode, setDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
}

export function useDarkMode() {
  const context = useContext(DarkModeContext);
  if (context === undefined) {
    throw new Error('useDarkMode must be used within a DarkModeProvider');
  }
  return context;
}

// Utility hook to get dark mode without throwing if outside provider
export function useDarkModeOptional() {
  try {
    return useDarkMode();
  } catch {
    return { isDarkMode: false, toggleDarkMode: () => {}, setDarkMode: () => {} };
  }
}