// SAYU Unified Theme System
// Single Source of Truth for Colors, Typography, and 3D Materials
// Solves all dark mode conflicts and CSS specificity issues

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { Color } from 'three';

// 🎯 Core Design Token System
export interface DesignTokens {
  // Base Semantic Colors (CSS Variables)
  colors: {
    // Light/Dark Mode Base
    background: {
      primary: string;    // Main background
      secondary: string;  // Card backgrounds  
      tertiary: string;   // Elevated surfaces
      inverse: string;    // Contrasting backgrounds
    };
    
    foreground: {
      primary: string;    // Main text
      secondary: string;  // Muted text
      tertiary: string;   // Disabled text
      inverse: string;    // Text on dark backgrounds
    };
    
    // Semantic Colors
    surface: {
      default: string;
      elevated: string;
      overlay: string;
      glass: string;
    };
    
    border: {
      default: string;
      muted: string;
      strong: string;
      focus: string;
    };
    
    // SAYU Brand Colors (Korean 5 Elements)
    brand: {
      primary: string;    // 청(Blue) - Trust & Depth
      secondary: string;  // 적(Red) - Passion & Energy  
      tertiary: string;   // 황(Yellow) - Creativity & Inspiration
      accent: string;     // Dynamic accent color
      muted: string;      // Subdued brand color
    };
    
    // Functional Colors
    functional: {
      success: string;
      warning: string; 
      error: string;
      info: string;
    };
    
    // 16 Animal Personality Colors
    personalities: Record<string, {
      primary: string;
      secondary: string;
      gradient: string;
    }>;
  };
  
  // Typography System
  typography: {
    fonts: {
      heading: string;    // Playfair Display
      body: string;       // Inter
      mono: string;       // JetBrains Mono
    };
    
    sizes: {
      xs: string;   // 12px
      sm: string;   // 14px
      base: string; // 16px
      lg: string;   // 18px
      xl: string;   // 20px
      '2xl': string; // 24px
      '3xl': string; // 30px
      '4xl': string; // 36px
      '5xl': string; // 48px
      '6xl': string; // 60px
    };
    
    weights: {
      light: number;    // 300
      normal: number;   // 400
      medium: number;   // 500
      semibold: number; // 600
      bold: number;     // 700
    };
    
    lineHeights: {
      tight: number;   // 1.25
      normal: number;  // 1.5
      relaxed: number; // 1.75
    };
    
    letterSpacing: {
      tight: string;   // -0.02em
      normal: string;  // 0em
      wide: string;    // 0.02em
    };
  };
  
  // Layout & Spacing
  layout: {
    spacing: {
      xs: string;   // 4px
      sm: string;   // 8px
      md: string;   // 16px
      lg: string;   // 24px
      xl: string;   // 32px
      '2xl': string; // 48px
      '3xl': string; // 64px
      '4xl': string; // 96px
    };
    
    borderRadius: {
      none: string;   // 0
      sm: string;     // 4px
      md: string;     // 8px
      lg: string;     // 12px
      xl: string;     // 16px
      full: string;   // 9999px
    };
    
    shadows: {
      sm: string;     // Subtle shadow
      md: string;     // Default shadow
      lg: string;     // Prominent shadow
      xl: string;     // Strong shadow
      inner: string;  // Inset shadow
      none: string;   // No shadow
    };
    
    blurs: {
      sm: string;     // 4px
      md: string;     // 8px
      lg: string;     // 16px
      xl: string;     // 24px
    };
  };
  
  // Animation System
  animations: {
    durations: {
      fast: string;     // 150ms
      normal: string;   // 300ms  
      slow: string;     // 500ms
      slower: string;   // 1000ms
    };
    
    easings: {
      linear: string;         // linear
      ease: string;           // ease
      easeIn: string;         // ease-in
      easeOut: string;        // ease-out
      easeInOut: string;      // ease-in-out
      spring: string;         // cubic-bezier(0.68, -0.55, 0.265, 1.55)
      gallery: string;        // cubic-bezier(0.4, 0, 0.2, 1)
    };
  };
  
  // 3D Material Properties
  materials: {
    glass: {
      opacity: number;
      roughness: number;
      metalness: number;
      transmission: number;
    };
    
    metal: {
      roughness: number;
      metalness: number;
    };
    
    fabric: {
      roughness: number;
      metalness: number;
    };
    
    wood: {
      roughness: number;
      metalness: number;
    };
  };
}

// 🌟 Theme Mode Types
export type ThemeMode = 'light' | 'dark' | 'system';
export type ColorScheme = 'neutral' | 'warm' | 'cool' | 'vibrant';
export type PersonalityType = 'LAEF' | 'LAEC' | 'LAMF' | 'LAMC' | 'LREF' | 'LREC' | 'LRMF' | 'LRMC' | 
                             'SAEF' | 'SAEC' | 'SAMF' | 'SAMC' | 'SREF' | 'SREC' | 'SRMF' | 'SRMC';

// 🎨 Theme State Management
interface ThemeState {
  // Current Theme Settings
  mode: ThemeMode;
  colorScheme: ColorScheme;
  personalityType?: PersonalityType;
  currentDimension: string;
  
  // Design Tokens
  tokens: DesignTokens;
  
  // 3D Integration
  threeMaterials: Map<string, any>; // Three.js materials cache
  
  // Performance
  reducedMotion: boolean;
  highContrast: boolean;
  
  // Actions
  setMode: (mode: ThemeMode) => void;
  setColorScheme: (scheme: ColorScheme) => void;
  setPersonalityType: (type: PersonalityType) => void;
  updateDimension: (dimension: string) => void;
  applyTheme: () => void;
  generateCSSVariables: () => Record<string, string>;
  getThreeMaterial: (name: string) => any;
  detectSystemPreferences: () => void;
}

// 🎯 Create Theme Store
export const useThemeStore = create<ThemeState>()(
  subscribeWithSelector((set, get) => ({
    // Initial State
    mode: 'system',
    colorScheme: 'neutral',
    currentDimension: 'central_hub',
    reducedMotion: false,
    highContrast: false,
    tokens: createBaseDesignTokens(),
    threeMaterials: new Map(),

    // Actions
    setMode: (mode: ThemeMode) => {
      set({ mode });
      get().applyTheme();
      
      // Persist preference
      if (typeof window !== 'undefined') {
        localStorage.setItem('sayu-theme-mode', mode);
      }
    },

    setColorScheme: (scheme: ColorScheme) => {
      set({ colorScheme });
      
      // Regenerate tokens with new scheme
      const newTokens = createBaseDesignTokens(scheme);
      set({ tokens: newTokens });
      get().applyTheme();
    },

    setPersonalityType: (type: PersonalityType) => {
      set({ personalityType: type });
      
      // Update tokens with personality colors
      const { tokens } = get();
      const personalityColors = getPersonalityColors(type);
      
      const newTokens = {
        ...tokens,
        colors: {
          ...tokens.colors,
          brand: {
            ...tokens.colors.brand,
            ...personalityColors
          }
        }
      };
      
      set({ tokens: newTokens });
      get().applyTheme();
    },

    updateDimension: (dimension: string) => {
      set({ currentDimension: dimension });
      
      // Apply dimension-specific theme adjustments
      applyDimensionTheme(dimension);
    },

    applyTheme: () => {
      if (typeof window === 'undefined') return;
      
      const { mode, tokens } = get();
      const cssVariables = get().generateCSSVariables();
      
      // Determine actual mode (resolve 'system')
      const actualMode = mode === 'system' 
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : mode;
      
      // Apply mode class
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(actualMode);
      
      // Apply CSS variables
      const root = document.documentElement;
      Object.entries(cssVariables).forEach(([property, value]) => {
        root.style.setProperty(property, value);
      });
      
      // Clear any old theme classes and inline styles
      clearOldThemeStyles();
      
      console.log(`🎨 Theme applied: ${actualMode} mode with ${get().colorScheme} color scheme`);
    },

    generateCSSVariables: () => {
      const { tokens, mode } = get();
      const actualMode = mode === 'system' 
        ? (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : mode;
      
      // Generate CSS variables based on current mode
      const vars: Record<string, string> = {};
      
      // Apply base colors (automatically adjusted for light/dark)
      const colors = actualMode === 'dark' ? getDarkModeColors(tokens) : getLightModeColors(tokens);
      
      // Background colors
      vars['--color-background-primary'] = colors.background.primary;
      vars['--color-background-secondary'] = colors.background.secondary;
      vars['--color-background-tertiary'] = colors.background.tertiary;
      vars['--color-background-inverse'] = colors.background.inverse;
      
      // Foreground colors  
      vars['--color-foreground-primary'] = colors.foreground.primary;
      vars['--color-foreground-secondary'] = colors.foreground.secondary;
      vars['--color-foreground-tertiary'] = colors.foreground.tertiary;
      vars['--color-foreground-inverse'] = colors.foreground.inverse;
      
      // Surface colors
      vars['--color-surface-default'] = colors.surface.default;
      vars['--color-surface-elevated'] = colors.surface.elevated;
      vars['--color-surface-overlay'] = colors.surface.overlay;
      vars['--color-surface-glass'] = colors.surface.glass;
      
      // Border colors
      vars['--color-border-default'] = colors.border.default;
      vars['--color-border-muted'] = colors.border.muted;
      vars['--color-border-strong'] = colors.border.strong;
      vars['--color-border-focus'] = colors.border.focus;
      
      // Brand colors (consistent across modes)
      vars['--color-brand-primary'] = tokens.colors.brand.primary;
      vars['--color-brand-secondary'] = tokens.colors.brand.secondary;
      vars['--color-brand-tertiary'] = tokens.colors.brand.tertiary;
      vars['--color-brand-accent'] = tokens.colors.brand.accent;
      vars['--color-brand-muted'] = tokens.colors.brand.muted;
      
      // Functional colors
      vars['--color-success'] = colors.functional.success;
      vars['--color-warning'] = colors.functional.warning;
      vars['--color-error'] = colors.functional.error;
      vars['--color-info'] = colors.functional.info;
      
      // Typography
      vars['--font-heading'] = tokens.typography.fonts.heading;
      vars['--font-body'] = tokens.typography.fonts.body;
      vars['--font-mono'] = tokens.typography.fonts.mono;
      
      // Layout
      Object.entries(tokens.layout.spacing).forEach(([key, value]) => {
        vars[`--spacing-${key}`] = value;
      });
      
      Object.entries(tokens.layout.borderRadius).forEach(([key, value]) => {
        vars[`--radius-${key}`] = value;
      });
      
      Object.entries(tokens.layout.shadows).forEach(([key, value]) => {
        vars[`--shadow-${key}`] = value;
      });
      
      // Animation
      Object.entries(tokens.animations.durations).forEach(([key, value]) => {
        vars[`--duration-${key}`] = value;
      });
      
      Object.entries(tokens.animations.easings).forEach(([key, value]) => {
        vars[`--easing-${key}`] = value;
      });
      
      return vars;
    },

    getThreeMaterial: (name: string) => {
      const { threeMaterials } = get();
      return threeMaterials.get(name);
    },

    detectSystemPreferences: () => {
      if (typeof window === 'undefined') return;
      
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const highContrast = window.matchMedia('(prefers-contrast: high)').matches;
      
      set({ reducedMotion, highContrast });
      
      // Listen for changes
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (get().mode === 'system') {
          get().applyTheme();
        }
      });
      
      window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
        set({ reducedMotion: e.matches });
      });
    }
  }))
);

// 🎨 Design Token Generation
function createBaseDesignTokens(colorScheme: ColorScheme = 'neutral'): DesignTokens {
  return {
    colors: {
      background: {
        primary: 'hsl(0, 0%, 100%)',
        secondary: 'hsl(0, 0%, 98%)', 
        tertiary: 'hsl(0, 0%, 96%)',
        inverse: 'hsl(0, 0%, 4%)'
      },
      
      foreground: {
        primary: 'hsl(0, 0%, 9%)',
        secondary: 'hsl(0, 0%, 45%)',
        tertiary: 'hsl(0, 0%, 65%)',
        inverse: 'hsl(0, 0%, 98%)'
      },
      
      surface: {
        default: 'hsl(0, 0%, 100%)',
        elevated: 'hsl(0, 0%, 98%)',
        overlay: 'hsla(0, 0%, 100%, 0.9)',
        glass: 'hsla(0, 0%, 100%, 0.7)'
      },
      
      border: {
        default: 'hsl(0, 0%, 91%)',
        muted: 'hsl(0, 0%, 94%)',
        strong: 'hsl(0, 0%, 80%)',
        focus: 'hsl(211, 65%, 45%)'
      },
      
      brand: {
        primary: 'hsl(211, 65%, 45%)',   // 청 - Trust & Depth
        secondary: 'hsl(355, 75%, 55%)', // 적 - Passion & Energy
        tertiary: 'hsl(45, 95%, 51%)',   // 황 - Creativity
        accent: 'hsl(280, 70%, 60%)',    // Dynamic purple
        muted: 'hsl(211, 20%, 65%)'
      },
      
      functional: {
        success: 'hsl(142, 70%, 45%)',
        warning: 'hsl(45, 95%, 51%)',
        error: 'hsl(355, 75%, 55%)',
        info: 'hsl(211, 65%, 45%)'
      },
      
      personalities: generatePersonalityColors()
    },
    
    typography: {
      fonts: {
        heading: '"Playfair Display", serif',
        body: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
        mono: '"JetBrains Mono", "Fira Code", monospace'
      },
      
      sizes: {
        xs: '0.75rem',   // 12px
        sm: '0.875rem',  // 14px
        base: '1rem',    // 16px
        lg: '1.125rem',  // 18px
        xl: '1.25rem',   // 20px
        '2xl': '1.5rem', // 24px
        '3xl': '1.875rem', // 30px
        '4xl': '2.25rem',  // 36px
        '5xl': '3rem',     // 48px
        '6xl': '3.75rem'   // 60px
      },
      
      weights: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700
      },
      
      lineHeights: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75
      },
      
      letterSpacing: {
        tight: '-0.02em',
        normal: '0em',
        wide: '0.02em'
      }
    },
    
    layout: {
      spacing: {
        xs: '0.25rem',   // 4px
        sm: '0.5rem',    // 8px
        md: '1rem',      // 16px
        lg: '1.5rem',    // 24px
        xl: '2rem',      // 32px
        '2xl': '3rem',   // 48px
        '3xl': '4rem',   // 64px
        '4xl': '6rem'    // 96px
      },
      
      borderRadius: {
        none: '0',
        sm: '0.25rem',   // 4px
        md: '0.5rem',    // 8px
        lg: '0.75rem',   // 12px
        xl: '1rem',      // 16px
        full: '9999px'
      },
      
      shadows: {
        sm: '0 1px 3px hsla(0, 0%, 0%, 0.1)',
        md: '0 4px 12px hsla(0, 0%, 0%, 0.08)',
        lg: '0 8px 24px hsla(0, 0%, 0%, 0.12)',
        xl: '0 16px 48px hsla(0, 0%, 0%, 0.16)',
        inner: 'inset 0 2px 4px hsla(0, 0%, 0%, 0.06)',
        none: 'none'
      },
      
      blurs: {
        sm: '4px',
        md: '8px',
        lg: '16px',
        xl: '24px'
      }
    },
    
    animations: {
      durations: {
        fast: '150ms',
        normal: '300ms',
        slow: '500ms',
        slower: '1000ms'
      },
      
      easings: {
        linear: 'linear',
        ease: 'ease',
        easeIn: 'ease-in',
        easeOut: 'ease-out',
        easeInOut: 'ease-in-out',
        spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        gallery: 'cubic-bezier(0.4, 0, 0.2, 1)'
      }
    },
    
    materials: {
      glass: {
        opacity: 0.7,
        roughness: 0.1,
        metalness: 0,
        transmission: 0.9
      },
      
      metal: {
        roughness: 0.2,
        metalness: 0.9
      },
      
      fabric: {
        roughness: 0.8,
        metalness: 0
      },
      
      wood: {
        roughness: 0.6,
        metalness: 0
      }
    }
  };
}

// 🌚 Dark Mode Color Generation
function getDarkModeColors(tokens: DesignTokens) {
  return {
    background: {
      primary: 'hsl(0, 0%, 4%)',    // Very dark
      secondary: 'hsl(0, 0%, 8%)',  // Dark surface
      tertiary: 'hsl(0, 0%, 12%)',  // Elevated surface
      inverse: 'hsl(0, 0%, 98%)'    // Light (for contrast)
    },
    
    foreground: {
      primary: 'hsl(0, 0%, 98%)',   // Near white
      secondary: 'hsl(0, 0%, 70%)', // Muted light
      tertiary: 'hsl(0, 0%, 50%)',  // Disabled light
      inverse: 'hsl(0, 0%, 9%)'     // Dark (for light backgrounds)
    },
    
    surface: {
      default: 'hsl(0, 0%, 8%)',
      elevated: 'hsl(0, 0%, 12%)',
      overlay: 'hsla(0, 0%, 8%, 0.9)',
      glass: 'hsla(0, 0%, 8%, 0.7)'
    },
    
    border: {
      default: 'hsl(0, 0%, 20%)',
      muted: 'hsl(0, 0%, 16%)',
      strong: 'hsl(0, 0%, 30%)',
      focus: 'hsl(211, 65%, 55%)'   // Slightly brighter in dark mode
    },
    
    functional: {
      success: 'hsl(142, 60%, 50%)',
      warning: 'hsl(45, 85%, 55%)',
      error: 'hsl(355, 70%, 60%)',
      info: 'hsl(211, 65%, 55%)'
    }
  };
}

// 🌞 Light Mode Color Generation  
function getLightModeColors(tokens: DesignTokens) {
  return tokens.colors; // Use base colors for light mode
}

// 🦊 Personality Color Generation
function generatePersonalityColors(): Record<string, { primary: string; secondary: string; gradient: string }> {
  const personalities = {
    'LAEF': { primary: 'hsl(25, 80%, 55%)', secondary: 'hsl(35, 70%, 65%)', gradient: 'linear-gradient(135deg, hsl(25, 80%, 55%), hsl(35, 70%, 65%))' }, // Fox
    'LAEC': { primary: 'hsl(260, 60%, 50%)', secondary: 'hsl(280, 50%, 60%)', gradient: 'linear-gradient(135deg, hsl(260, 60%, 50%), hsl(280, 50%, 60%))' }, // Cat
    'LAMF': { primary: 'hsl(30, 70%, 45%)', secondary: 'hsl(40, 60%, 55%)', gradient: 'linear-gradient(135deg, hsl(30, 70%, 45%), hsl(40, 60%, 55%))' }, // Owl
    'LAMC': { primary: 'hsl(120, 50%, 40%)', secondary: 'hsl(140, 45%, 50%)', gradient: 'linear-gradient(135deg, hsl(120, 50%, 40%), hsl(140, 45%, 50%))' }, // Turtle
    'LREF': { primary: 'hsl(100, 60%, 45%)', secondary: 'hsl(120, 55%, 55%)', gradient: 'linear-gradient(135deg, hsl(100, 60%, 45%), hsl(120, 55%, 55%))' }, // Chameleon
    'LREC': { primary: 'hsl(45, 65%, 50%)', secondary: 'hsl(55, 60%, 60%)', gradient: 'linear-gradient(135deg, hsl(45, 65%, 50%), hsl(55, 60%, 60%))' }, // Hedgehog
    'LRMF': { primary: 'hsl(280, 70%, 55%)', secondary: 'hsl(300, 65%, 65%)', gradient: 'linear-gradient(135deg, hsl(280, 70%, 55%), hsl(300, 65%, 65%))' }, // Octopus
    'LRMC': { primary: 'hsl(30, 80%, 45%)', secondary: 'hsl(40, 75%, 55%)', gradient: 'linear-gradient(135deg, hsl(30, 80%, 45%), hsl(40, 75%, 55%))' }, // Beaver
    'SAEF': { primary: 'hsl(300, 75%, 60%)', secondary: 'hsl(320, 70%, 70%)', gradient: 'linear-gradient(135deg, hsl(300, 75%, 60%), hsl(320, 70%, 70%))' }, // Butterfly
    'SAEC': { primary: 'hsl(200, 70%, 50%)', secondary: 'hsl(220, 65%, 60%)', gradient: 'linear-gradient(135deg, hsl(200, 70%, 50%), hsl(220, 65%, 60%))' }, // Penguin
    'SAMF': { primary: 'hsl(160, 65%, 45%)', secondary: 'hsl(180, 60%, 55%)', gradient: 'linear-gradient(135deg, hsl(160, 65%, 45%), hsl(180, 60%, 55%))' }, // Parrot
    'SAMC': { primary: 'hsl(30, 60%, 50%)', secondary: 'hsl(50, 55%, 60%)', gradient: 'linear-gradient(135deg, hsl(30, 60%, 50%), hsl(50, 55%, 60%))' }, // Deer
    'SREF': { primary: 'hsl(355, 70%, 55%)', secondary: 'hsl(15, 75%, 65%)', gradient: 'linear-gradient(135deg, hsl(355, 70%, 55%), hsl(15, 75%, 65%))' }, // Dog
    'SREC': { primary: 'hsl(45, 85%, 55%)', secondary: 'hsl(65, 80%, 65%)', gradient: 'linear-gradient(135deg, hsl(45, 85%, 55%), hsl(65, 80%, 65%))' }, // Duck
    'SRMF': { primary: 'hsl(220, 60%, 50%)', secondary: 'hsl(240, 55%, 60%)', gradient: 'linear-gradient(135deg, hsl(220, 60%, 50%), hsl(240, 55%, 60%))' }, // Elephant  
    'SRMC': { primary: 'hsl(35, 70%, 45%)', secondary: 'hsl(55, 65%, 55%)', gradient: 'linear-gradient(135deg, hsl(35, 70%, 45%), hsl(55, 65%, 55%))' } // Eagle
  };
  
  return personalities;
}

// 🎨 Get Personality-Specific Colors
function getPersonalityColors(type: PersonalityType) {
  const personalities = generatePersonalityColors();
  const colors = personalities[type];
  
  if (!colors) {
    return {
      primary: 'hsl(211, 65%, 45%)',
      secondary: 'hsl(280, 70%, 60%)',
      accent: 'hsl(45, 95%, 51%)'
    };
  }
  
  return {
    primary: colors.primary,
    secondary: colors.secondary,
    accent: colors.primary,
    gradient: colors.gradient
  };
}

// 🏛️ Apply Dimension-Specific Theme
function applyDimensionTheme(dimension: string): void {
  if (typeof window === 'undefined') return;
  
  const root = document.documentElement;
  
  // Remove previous dimension classes
  root.classList.remove('dimension-central-hub', 'dimension-personality-lab', 'dimension-art-studio', 'dimension-gallery-hall', 'dimension-community-lounge');
  
  // Add current dimension class
  root.classList.add(`dimension-${dimension.replace('_', '-')}`);
  
  // Apply dimension-specific CSS variables
  switch (dimension) {
    case 'central_hub':
      root.style.setProperty('--dimension-primary', 'hsl(0, 0%, 98%)');
      root.style.setProperty('--dimension-accent', 'hsl(211, 65%, 45%)');
      break;
      
    case 'personality_lab':
      root.style.setProperty('--dimension-primary', 'hsl(200, 20%, 95%)');
      root.style.setProperty('--dimension-accent', 'hsl(200, 70%, 50%)');
      break;
      
    case 'art_studio':
      root.style.setProperty('--dimension-primary', 'hsl(280, 15%, 95%)');
      root.style.setProperty('--dimension-accent', 'hsl(280, 70%, 55%)');
      break;
      
    case 'gallery_hall':
      root.style.setProperty('--dimension-primary', 'hsl(45, 20%, 95%)');
      root.style.setProperty('--dimension-accent', 'hsl(45, 85%, 55%)');
      break;
      
    case 'community_lounge':
      root.style.setProperty('--dimension-primary', 'hsl(355, 20%, 95%)');
      root.style.setProperty('--dimension-accent', 'hsl(355, 70%, 55%)');
      break;
  }
}

// 🧹 Clear Old Theme Styles (Solve specificity issues)
function clearOldThemeStyles(): void {
  if (typeof window === 'undefined') return;
  
  const root = document.documentElement;
  
  // Remove old theme-related inline styles
  const oldThemeProperties = [
    '--color-primary', '--color-secondary', '--color-accent',
    '--color-background', '--color-foreground', '--color-surface',
    '--color-text', '--color-textSecondary', '--color-border',
    '--color-muted', '--theme-font-headingFont', '--theme-font-bodyFont'
  ];
  
  oldThemeProperties.forEach(prop => {
    root.style.removeProperty(prop);
  });
  
  // Remove old theme classes
  const oldClasses = ['bg-white', 'dark:bg-gray-900', 'text-gray-900', 'dark:text-gray-100'];
  document.body.classList.remove(...oldClasses);
  
  // Remove any conflicting style tags
  const oldStyleTags = document.querySelectorAll('style[data-theme]');
  oldStyleTags.forEach(tag => tag.remove());
}

// 🚀 Initialize Theme System
export function initializeThemeSystem(): void {
  const store = useThemeStore.getState();
  
  // Detect system preferences
  store.detectSystemPreferences();
  
  // Load saved preferences
  if (typeof window !== 'undefined') {
    const savedMode = localStorage.getItem('sayu-theme-mode') as ThemeMode;
    if (savedMode) {
      store.setMode(savedMode);
    }
    
    const savedPersonality = localStorage.getItem('sayu-personality-type') as PersonalityType;
    if (savedPersonality) {
      store.setPersonalityType(savedPersonality);
    }
  }
  
  // Apply initial theme
  store.applyTheme();
  
  console.log('🎨 SAYU Unified Theme System initialized');
}

// 🎯 Export for easy integration
export default useThemeStore;