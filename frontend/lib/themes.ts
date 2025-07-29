// Personalized Theme System for SAYU
// Maps aesthetic personality types to unique visual themes

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  muted: string;
  text: string;
  textSecondary: string;
  border: string;
  gradient: string;
}

export interface ThemeTypography {
  headingFont: string;
  bodyFont: string;
  headingWeight: string;
  bodyWeight: string;
  letterSpacing: string;
  lineHeight: string;
}

export interface ThemeLayout {
  borderRadius: string;
  spacing: string;
  cardPadding: string;
  maxWidth: string;
  shadows: string;
}

export interface ThemeAnimations {
  duration: string;
  easing: string;
  hoverScale: string;
  entranceAnimation: string;
}

export interface PersonalizedTheme {
  id: string;
  name: string;
  description: string;
  colors: ThemeColors;
  typography: ThemeTypography;
  layout: ThemeLayout;
  animations: ThemeAnimations;
  personality: {
    traits: string[];
    aesthetic: string;
    mood: string;
  };
}

// Theme categories based on aesthetic personality dimensions
export const THEME_CATEGORIES = {
  // Abstract vs Realistic (A/R)
  ABSTRACT: 'abstract',
  REALISTIC: 'realistic',
  
  // Group vs Individual (G/I) 
  SOCIAL: 'social',
  PERSONAL: 'personal',
  
  // Emotional vs Loneal (E/L)
  EMOTIONAL: 'emotional',
  ANALYTICAL: 'analytical',
  
  // Modern vs Traditional (M/T)
  MODERN: 'modern',
  CLASSICAL: 'classical'
};

// Base theme templates for different personality dimensions
export const BASE_THEMES: Record<string, Partial<PersonalizedTheme>> = {
  // Abstract themes - flowing, dynamic, unconventional
  abstract: {
    colors: {
      primary: 'hsl(270, 75%, 60%)',
      secondary: 'hsl(300, 65%, 70%)',
      accent: 'hsl(45, 90%, 65%)',
      background: 'hsl(0, 0%, 2%)',
      surface: 'hsl(270, 20%, 8%)',
      muted: 'hsl(270, 10%, 15%)',
      text: 'hsl(0, 0%, 95%)',
      textSecondary: 'hsl(0, 0%, 70%)',
      border: 'hsl(270, 30%, 20%)',
      gradient: 'linear-gradient(135deg, hsl(270, 75%, 60%), hsl(300, 65%, 70%))'
    },
    typography: {
      headingFont: '"Inter", "SF Pro Display", sans-serif',
      bodyFont: '"Inter", "SF Pro Text", sans-serif',
      headingWeight: '600',
      bodyWeight: '400',
      letterSpacing: '-0.02em',
      lineHeight: '1.6'
    },
    layout: {
      borderRadius: '16px',
      spacing: '1.5rem',
      cardPadding: '2rem',
      maxWidth: '1200px',
      shadows: '0 8px 32px rgba(147, 51, 234, 0.15)'
    },
    animations: {
      duration: '0.3s',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      hoverScale: '1.05',
      entranceAnimation: 'fadeInUp'
    }
  },

  // Realistic themes - grounded, natural, conventional
  realistic: {
    colors: {
      primary: 'hsl(25, 80%, 55%)',
      secondary: 'hsl(15, 70%, 65%)',
      accent: 'hsl(200, 75%, 60%)',
      background: 'hsl(30, 20%, 95%)',
      surface: 'hsl(0, 0%, 100%)',
      muted: 'hsl(30, 10%, 90%)',
      text: 'hsl(30, 15%, 15%)',
      textSecondary: 'hsl(30, 10%, 40%)',
      border: 'hsl(30, 15%, 85%)',
      gradient: 'linear-gradient(135deg, hsl(25, 80%, 55%), hsl(15, 70%, 65%))'
    },
    typography: {
      headingFont: '"Playfair Display", "Georgia", serif',
      bodyFont: '"Source Sans Pro", "Helvetica", sans-serif',
      headingWeight: '700',
      bodyWeight: '400',
      letterSpacing: '0.01em',
      lineHeight: '1.7'
    },
    layout: {
      borderRadius: '8px',
      spacing: '1.25rem',
      cardPadding: '1.75rem',
      maxWidth: '1100px',
      shadows: '0 4px 16px rgba(0, 0, 0, 0.08)'
    },
    animations: {
      duration: '0.25s',
      easing: 'ease-out',
      hoverScale: '1.02',
      entranceAnimation: 'fadeIn'
    }
  },

  // Emotional themes - warm, expressive, intuitive
  emotional: {
    colors: {
      primary: 'hsl(340, 85%, 65%)',
      secondary: 'hsl(20, 90%, 70%)',
      accent: 'hsl(55, 95%, 70%)',
      background: 'hsl(340, 30%, 96%)',
      surface: 'hsl(340, 40%, 98%)',
      muted: 'hsl(340, 20%, 92%)',
      text: 'hsl(340, 30%, 20%)',
      textSecondary: 'hsl(340, 15%, 45%)',
      border: 'hsl(340, 25%, 88%)',
      gradient: 'linear-gradient(135deg, hsl(340, 85%, 65%), hsl(20, 90%, 70%))'
    },
    typography: {
      headingFont: '"Poppins", "SF Pro Display", sans-serif',
      bodyFont: '"Poppins", "SF Pro Text", sans-serif',
      headingWeight: '600',
      bodyWeight: '400',
      letterSpacing: '0em',
      lineHeight: '1.65'
    },
    layout: {
      borderRadius: '20px',
      spacing: '1.75rem',
      cardPadding: '2.25rem',
      maxWidth: '1150px',
      shadows: '0 12px 24px rgba(244, 63, 94, 0.12)'
    },
    animations: {
      duration: '0.4s',
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      hoverScale: '1.08',
      entranceAnimation: 'bounceIn'
    }
  },

  // Analytical themes - clean, structured, logical
  analytical: {
    colors: {
      primary: 'hsl(220, 90%, 60%)',
      secondary: 'hsl(190, 80%, 55%)',
      accent: 'hsl(160, 75%, 50%)',
      background: 'hsl(220, 15%, 97%)',
      surface: 'hsl(0, 0%, 100%)',
      muted: 'hsl(220, 10%, 94%)',
      text: 'hsl(220, 25%, 10%)',
      textSecondary: 'hsl(220, 10%, 35%)',
      border: 'hsl(220, 15%, 90%)',
      gradient: 'linear-gradient(135deg, hsl(220, 90%, 60%), hsl(190, 80%, 55%))'
    },
    typography: {
      headingFont: '"JetBrains Mono", "Monaco", monospace',
      bodyFont: '"System UI", "SF Pro Text", sans-serif',
      headingWeight: '500',
      bodyWeight: '400',
      letterSpacing: '0.02em',
      lineHeight: '1.6'
    },
    layout: {
      borderRadius: '4px',
      spacing: '1rem',
      cardPadding: '1.5rem',
      maxWidth: '1000px',
      shadows: '0 2px 8px rgba(59, 130, 246, 0.1)'
    },
    animations: {
      duration: '0.2s',
      easing: 'linear',
      hoverScale: '1.01',
      entranceAnimation: 'slideInDown'
    }
  },

  // Modern themes - sleek, minimalist, contemporary
  modern: {
    colors: {
      primary: 'hsl(0, 0%, 5%)',
      secondary: 'hsl(0, 0%, 20%)',
      accent: 'hsl(120, 100%, 50%)',
      background: 'hsl(0, 0%, 98%)',
      surface: 'hsl(0, 0%, 100%)',
      muted: 'hsl(0, 0%, 96%)',
      text: 'hsl(0, 0%, 5%)',
      textSecondary: 'hsl(0, 0%, 40%)',
      border: 'hsl(0, 0%, 92%)',
      gradient: 'linear-gradient(135deg, hsl(0, 0%, 5%), hsl(0, 0%, 20%))'
    },
    typography: {
      headingFont: '"SF Pro Display", "Helvetica Neue", sans-serif',
      bodyFont: '"SF Pro Text", "Helvetica", sans-serif',
      headingWeight: '700',
      bodyWeight: '400',
      letterSpacing: '-0.01em',
      lineHeight: '1.5'
    },
    layout: {
      borderRadius: '12px',
      spacing: '1.5rem',
      cardPadding: '2rem',
      maxWidth: '1300px',
      shadows: '0 1px 3px rgba(0, 0, 0, 0.05)'
    },
    animations: {
      duration: '0.15s',
      easing: 'ease',
      hoverScale: '1.02',
      entranceAnimation: 'fadeInDown'
    }
  },

  // Classical themes - elegant, traditional, timeless
  classical: {
    colors: {
      primary: 'hsl(45, 60%, 45%)',
      secondary: 'hsl(25, 50%, 55%)',
      accent: 'hsl(15, 70%, 60%)',
      background: 'hsl(45, 25%, 96%)',
      surface: 'hsl(45, 30%, 98%)',
      muted: 'hsl(45, 15%, 92%)',
      text: 'hsl(45, 20%, 15%)',
      textSecondary: 'hsl(45, 10%, 40%)',
      border: 'hsl(45, 20%, 88%)',
      gradient: 'linear-gradient(135deg, hsl(45, 60%, 45%), hsl(25, 50%, 55%))'
    },
    typography: {
      headingFont: '"Crimson Text", "Times New Roman", serif',
      bodyFont: '"Libre Baskerville", "Georgia", serif',
      headingWeight: '600',
      bodyWeight: '400',
      letterSpacing: '0.02em',
      lineHeight: '1.8'
    },
    layout: {
      borderRadius: '6px',
      spacing: '1.25rem',
      cardPadding: '2rem',
      maxWidth: '1000px',
      shadows: '0 6px 20px rgba(160, 130, 98, 0.1)'
    },
    animations: {
      duration: '0.35s',
      easing: 'ease-in-out',
      hoverScale: '1.03',
      entranceAnimation: 'fadeInUp'
    }
  }
};

// Generate personalized theme from profile type code
export function generatePersonalizedTheme(typeCode: string, archetypeName: string): PersonalizedTheme {
  if (!typeCode || typeCode.length < 4) {
    return generateDefaultTheme();
  }

  // Parse type code (e.g., "AGE_001" -> A=Abstract, G=Group, E=Emotional, M=Modern)
  const [abstract, group, emotional, modern] = typeCode.split('');
  
  // Determine primary theme category
  const isAbstract = abstract === 'A';
  const isEmotional = emotional === 'E';
  const isModern = modern === 'M';
  
  // Select base theme
  let baseTheme: Partial<PersonalizedTheme>;
  
  if (isAbstract && isEmotional) {
    baseTheme = { ...BASE_THEMES.abstract, ...BASE_THEMES.emotional };
  } else if (isAbstract && !isEmotional) {
    baseTheme = { ...BASE_THEMES.abstract, ...BASE_THEMES.analytical };
  } else if (!isAbstract && isEmotional) {
    baseTheme = { ...BASE_THEMES.realistic, ...BASE_THEMES.emotional };
  } else {
    baseTheme = { ...BASE_THEMES.realistic, ...BASE_THEMES.analytical };
  }

  // Blend with modern/classical
  if (isModern) {
    baseTheme = blendThemes(baseTheme, BASE_THEMES.modern, 0.3);
  } else {
    baseTheme = blendThemes(baseTheme, BASE_THEMES.classical, 0.3);
  }

  // Create final theme
  return {
    id: typeCode,
    name: `${archetypeName} Theme`,
    description: `Personalized theme for ${archetypeName}`,
    colors: baseTheme.colors!,
    typography: baseTheme.typography!,
    layout: baseTheme.layout!,
    animations: baseTheme.animations!,
    personality: {
      traits: [
        isAbstract ? 'Creative' : 'Practical',
        group === 'G' ? 'Social' : 'Individual',
        isEmotional ? 'Intuitive' : 'Analytical',
        isModern ? 'Contemporary' : 'Traditional'
      ],
      aesthetic: isAbstract ? 'Abstract' : 'Realistic',
      mood: isEmotional ? 'Expressive' : 'Structured'
    }
  } as PersonalizedTheme;
}

// Blend two themes with a weight factor
function blendThemes(base: Partial<PersonalizedTheme>, overlay: Partial<PersonalizedTheme>, weight: number): Partial<PersonalizedTheme> {
  return {
    ...base,
    colors: {
      primary: '',
      secondary: '',
      background: '',
      surface: '',
      muted: '',
      text: '',
      textSecondary: '',
      border: '',
      accent: '',
      gradient: '',
      ...base.colors,
      // Blend specific properties from overlay
      ...(overlay.colors && {
        accent: overlay.colors.accent,
        gradient: overlay.colors.gradient
      })
    } as ThemeColors,
    typography: {
      headingFont: '',
      bodyFont: '',
      headingWeight: '',
      bodyWeight: '',
      letterSpacing: '',
      lineHeight: '',
      ...base.typography,
      ...(overlay.typography && {
        headingFont: overlay.typography.headingFont
      })
    } as ThemeTypography,
    layout: {
      borderRadius: '',
      spacing: '',
      cardPadding: '',
      maxWidth: '',
      shadows: '',
      ...base.layout,
      ...(overlay.layout && {
        borderRadius: overlay.layout.borderRadius
      })
    } as ThemeLayout,
    animations: {
      duration: '',
      easing: '',
      hoverScale: '',
      entranceAnimation: '',
      ...base.animations,
      ...(overlay.animations && {
        duration: overlay.animations.duration,
        easing: overlay.animations.easing
      })
    } as ThemeAnimations
  };
}

// Generate default theme for users without profiles
function generateDefaultTheme(): PersonalizedTheme {
  return {
    id: 'default',
    name: 'Default Theme',
    description: 'Clean, accessible default theme',
    colors: BASE_THEMES.modern.colors!,
    typography: BASE_THEMES.modern.typography!,
    layout: BASE_THEMES.modern.layout!,
    animations: BASE_THEMES.modern.animations!,
    personality: {
      traits: ['Balanced', 'Accessible', 'Clean'],
      aesthetic: 'Modern',
      mood: 'Neutral'
    }
  } as PersonalizedTheme;
}

// Apply theme to CSS custom properties in a dark mode compatible way
export function applyThemeToDOM(theme: PersonalizedTheme) {
  const root = document.documentElement;
  
  // Only apply non-conflicting theme properties
  // Background and foreground colors are handled by dark mode CSS
  
  // Apply typography (safe in both modes)
  Object.entries(theme.typography).forEach(([key, value]) => {
    root.style.setProperty(`--theme-font-${key}`, value);
  });
  
  // Apply layout (safe in both modes)
  Object.entries(theme.layout).forEach(([key, value]) => {
    root.style.setProperty(`--theme-layout-${key}`, value);
  });
  
  // Apply animations (safe in both modes)
  Object.entries(theme.animations).forEach(([key, value]) => {
    root.style.setProperty(`--theme-animation-${key}`, value);
  });
  
  // Add theme data attribute for CSS targeting
  root.setAttribute('data-theme', theme.id);
}

