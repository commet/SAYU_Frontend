'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// APT 테마 타입 정의
export interface APTTheme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    muted: string;
    gradient: string[];
  };
  animations: {
    type: 'gentle' | 'dynamic' | 'minimal' | 'energetic';
    speed: 'slow' | 'normal' | 'fast';
    easing: string;
  };
  layout: {
    style: 'grid' | 'masonry' | 'flow' | 'structured';
    density: 'spacious' | 'balanced' | 'compact';
    roundness: 'none' | 'subtle' | 'medium' | 'full';
  };
  interaction: {
    feedback: 'subtle' | 'moderate' | 'expressive';
    hover: 'minimal' | 'elevated' | 'transform';
    click: 'ripple' | 'scale' | 'glow';
  };
  personality: {
    type: string;
    animal: string;
    title: string;
    emoji: string;
  };
}

// 16가지 APT 테마 정의
export const APT_THEMES: Record<string, APTTheme> = {
  LAEF: { // Fox - 몽환적 방랑자
    colors: {
      primary: '#FF6B6B',
      secondary: '#4ECDC4',
      accent: '#FFD93D',
      background: '#FFF5F5',
      surface: '#FFFFFF',
      text: '#2D3436',
      muted: '#74B9FF',
      gradient: ['#FF6B6B', '#FFD93D', '#4ECDC4']
    },
    animations: {
      type: 'dynamic',
      speed: 'normal',
      easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    },
    layout: {
      style: 'flow',
      density: 'spacious',
      roundness: 'medium'
    },
    interaction: {
      feedback: 'expressive',
      hover: 'transform',
      click: 'glow'
    },
    personality: {
      type: 'LAEF',
      animal: 'fox',
      title: '몽환적 방랑자',
      emoji: '🦊'
    }
  },
  
  LAEC: { // Cat - 감성 큐레이터
    colors: {
      primary: '#9B59B6',
      secondary: '#E8D5F2',
      accent: '#F39C12',
      background: '#FAF4FF',
      surface: '#FFFFFF',
      text: '#2C3E50',
      muted: '#BDC3C7',
      gradient: ['#9B59B6', '#E8D5F2']
    },
    animations: {
      type: 'gentle',
      speed: 'slow',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    },
    layout: {
      style: 'grid',
      density: 'balanced',
      roundness: 'subtle'
    },
    interaction: {
      feedback: 'subtle',
      hover: 'elevated',
      click: 'ripple'
    },
    personality: {
      type: 'LAEC',
      animal: 'cat',
      title: '감성 큐레이터',
      emoji: '🐱'
    }
  },
  
  LAMF: { // Owl - 직관적 탐구자
    colors: {
      primary: '#2C3E50',
      secondary: '#34495E',
      accent: '#F1C40F',
      background: '#ECF0F1',
      surface: '#FFFFFF',
      text: '#2C3E50',
      muted: '#95A5A6',
      gradient: ['#2C3E50', '#34495E', '#F1C40F']
    },
    animations: {
      type: 'minimal',
      speed: 'normal',
      easing: 'ease-in-out'
    },
    layout: {
      style: 'structured',
      density: 'spacious',
      roundness: 'none'
    },
    interaction: {
      feedback: 'moderate',
      hover: 'minimal',
      click: 'scale'
    },
    personality: {
      type: 'LAMF',
      animal: 'owl',
      title: '직관적 탐구자',
      emoji: '🦉'
    }
  },
  
  LAMC: { // Turtle - 철학적 수집가
    colors: {
      primary: '#00B894',
      secondary: '#55EFC4',
      accent: '#6C5CE7',
      background: '#F0FFF4',
      surface: '#FFFFFF',
      text: '#2D3436',
      muted: '#B2BEC3',
      gradient: ['#00B894', '#6C5CE7']
    },
    animations: {
      type: 'minimal',
      speed: 'slow',
      easing: 'ease-out'
    },
    layout: {
      style: 'structured',
      density: 'compact',
      roundness: 'medium'
    },
    interaction: {
      feedback: 'subtle',
      hover: 'minimal',
      click: 'ripple'
    },
    personality: {
      type: 'LAMC',
      animal: 'turtle',
      title: '철학적 수집가',
      emoji: '🐢'
    }
  },
  
  LREF: { // Chameleon - 고독한 관찰자
    colors: {
      primary: '#00CEC9',
      secondary: '#81ECEC',
      accent: '#FDCB6E',
      background: '#F5FFFA',
      surface: '#FFFFFF',
      text: '#2D3436',
      muted: '#DFE6E9',
      gradient: ['#00CEC9', '#81ECEC', '#FDCB6E']
    },
    animations: {
      type: 'gentle',
      speed: 'normal',
      easing: 'ease-in-out'
    },
    layout: {
      style: 'flow',
      density: 'balanced',
      roundness: 'full'
    },
    interaction: {
      feedback: 'moderate',
      hover: 'transform',
      click: 'scale'
    },
    personality: {
      type: 'LREF',
      animal: 'chameleon',
      title: '고독한 관찰자',
      emoji: '🦎'
    }
  },
  
  LREC: { // Hedgehog - 섬세한 감정가
    colors: {
      primary: '#A29BFE',
      secondary: '#D6A2E8',
      accent: '#FD79A8',
      background: '#FDF6FF',
      surface: '#FFFFFF',
      text: '#2D3436',
      muted: '#B2BEC3',
      gradient: ['#A29BFE', '#D6A2E8', '#FD79A8']
    },
    animations: {
      type: 'gentle',
      speed: 'slow',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    },
    layout: {
      style: 'masonry',
      density: 'spacious',
      roundness: 'full'
    },
    interaction: {
      feedback: 'subtle',
      hover: 'elevated',
      click: 'ripple'
    },
    personality: {
      type: 'LREC',
      animal: 'hedgehog',
      title: '섬세한 감정가',
      emoji: '🦔'
    }
  },
  
  LRMF: { // Octopus - 디지털 탐험가
    colors: {
      primary: '#0984E3',
      secondary: '#74B9FF',
      accent: '#00D2D3',
      background: '#F0F8FF',
      surface: '#FFFFFF',
      text: '#2D3436',
      muted: '#B2BEC3',
      gradient: ['#0984E3', '#74B9FF', '#00D2D3']
    },
    animations: {
      type: 'dynamic',
      speed: 'fast',
      easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    },
    layout: {
      style: 'flow',
      density: 'balanced',
      roundness: 'medium'
    },
    interaction: {
      feedback: 'expressive',
      hover: 'transform',
      click: 'glow'
    },
    personality: {
      type: 'LRMF',
      animal: 'octopus',
      title: '디지털 탐험가',
      emoji: '🐙'
    }
  },
  
  LRMC: { // Beaver - 학구적 연구자
    colors: {
      primary: '#6C4C3A',
      secondary: '#8B6F47',
      accent: '#DAA520',
      background: '#FAF8F5',
      surface: '#FFFFFF',
      text: '#2D3436',
      muted: '#A0826D',
      gradient: ['#6C4C3A', '#8B6F47', '#DAA520']
    },
    animations: {
      type: 'minimal',
      speed: 'normal',
      easing: 'ease-out'
    },
    layout: {
      style: 'structured',
      density: 'compact',
      roundness: 'none'
    },
    interaction: {
      feedback: 'moderate',
      hover: 'minimal',
      click: 'scale'
    },
    personality: {
      type: 'LRMC',
      animal: 'beaver',
      title: '학구적 연구자',
      emoji: '🦫'
    }
  },
  
  SAEF: { // Butterfly - 감성 나눔이
    colors: {
      primary: '#FF6348',
      secondary: '#FFA502',
      accent: '#FF4757',
      background: '#FFF5F5',
      surface: '#FFFFFF',
      text: '#2D3436',
      muted: '#FFB8B8',
      gradient: ['#FF6348', '#FFA502', '#FF4757']
    },
    animations: {
      type: 'energetic',
      speed: 'fast',
      easing: 'spring(1, 80, 10, 0)'
    },
    layout: {
      style: 'masonry',
      density: 'balanced',
      roundness: 'full'
    },
    interaction: {
      feedback: 'expressive',
      hover: 'transform',
      click: 'glow'
    },
    personality: {
      type: 'SAEF',
      animal: 'butterfly',
      title: '감성 나눔이',
      emoji: '🦋'
    }
  },
  
  SAEC: { // Penguin - 예술 네트워커
    colors: {
      primary: '#3742FA',
      secondary: '#5F6FE8',
      accent: '#70A1FF',
      background: '#F0F4FF',
      surface: '#FFFFFF',
      text: '#2D3436',
      muted: '#A4B0BE',
      gradient: ['#3742FA', '#5F6FE8', '#70A1FF']
    },
    animations: {
      type: 'dynamic',
      speed: 'normal',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    },
    layout: {
      style: 'grid',
      density: 'balanced',
      roundness: 'medium'
    },
    interaction: {
      feedback: 'moderate',
      hover: 'elevated',
      click: 'ripple'
    },
    personality: {
      type: 'SAEC',
      animal: 'penguin',
      title: '예술 네트워커',
      emoji: '🐧'
    }
  },
  
  SAMF: { // Parrot - 영감 전도사
    colors: {
      primary: '#05C46B',
      secondary: '#0BE881',
      accent: '#FFC048',
      background: '#F0FFF9',
      surface: '#FFFFFF',
      text: '#2D3436',
      muted: '#7BED9F',
      gradient: ['#05C46B', '#0BE881', '#FFC048']
    },
    animations: {
      type: 'energetic',
      speed: 'fast',
      easing: 'spring(1, 80, 10, 0)'
    },
    layout: {
      style: 'flow',
      density: 'spacious',
      roundness: 'full'
    },
    interaction: {
      feedback: 'expressive',
      hover: 'transform',
      click: 'glow'
    },
    personality: {
      type: 'SAMF',
      animal: 'parrot',
      title: '영감 전도사',
      emoji: '🦜'
    }
  },
  
  SAMC: { // Deer - 문화 기획자
    colors: {
      primary: '#833471',
      secondary: '#B53471',
      accent: '#F8B500',
      background: '#FFF5FA',
      surface: '#FFFFFF',
      text: '#2D3436',
      muted: '#C44569',
      gradient: ['#833471', '#B53471', '#F8B500']
    },
    animations: {
      type: 'gentle',
      speed: 'normal',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    },
    layout: {
      style: 'structured',
      density: 'balanced',
      roundness: 'subtle'
    },
    interaction: {
      feedback: 'moderate',
      hover: 'elevated',
      click: 'scale'
    },
    personality: {
      type: 'SAMC',
      animal: 'deer',
      title: '문화 기획자',
      emoji: '🦌'
    }
  },
  
  SREF: { // Dog - 열정적 관람자
    colors: {
      primary: '#FF7675',
      secondary: '#FDCB6E',
      accent: '#74B9FF',
      background: '#FFF9F5',
      surface: '#FFFFFF',
      text: '#2D3436',
      muted: '#FAB1A0',
      gradient: ['#FF7675', '#FDCB6E', '#74B9FF']
    },
    animations: {
      type: 'energetic',
      speed: 'fast',
      easing: 'spring(1, 80, 10, 0)'
    },
    layout: {
      style: 'masonry',
      density: 'spacious',
      roundness: 'full'
    },
    interaction: {
      feedback: 'expressive',
      hover: 'transform',
      click: 'glow'
    },
    personality: {
      type: 'SREF',
      animal: 'dog',
      title: '열정적 관람자',
      emoji: '🐕'
    }
  },
  
  SREC: { // Duck - 따뜻한 안내자
    colors: {
      primary: '#F0B27A',
      secondary: '#F8C471',
      accent: '#E59866',
      background: '#FFF8F0',
      surface: '#FFFFFF',
      text: '#2D3436',
      muted: '#F5B7B1',
      gradient: ['#F0B27A', '#F8C471', '#E59866']
    },
    animations: {
      type: 'gentle',
      speed: 'normal',
      easing: 'ease-in-out'
    },
    layout: {
      style: 'grid',
      density: 'balanced',
      roundness: 'medium'
    },
    interaction: {
      feedback: 'moderate',
      hover: 'elevated',
      click: 'ripple'
    },
    personality: {
      type: 'SREC',
      animal: 'duck',
      title: '따뜻한 안내자',
      emoji: '🦆'
    }
  },
  
  SRMF: { // Elephant - 지식 멘토
    colors: {
      primary: '#596275',
      secondary: '#8B95A7',
      accent: '#F3A683',
      background: '#F5F6FA',
      surface: '#FFFFFF',
      text: '#2D3436',
      muted: '#C8D6E5',
      gradient: ['#596275', '#8B95A7', '#F3A683']
    },
    animations: {
      type: 'minimal',
      speed: 'slow',
      easing: 'ease-out'
    },
    layout: {
      style: 'structured',
      density: 'compact',
      roundness: 'subtle'
    },
    interaction: {
      feedback: 'subtle',
      hover: 'minimal',
      click: 'scale'
    },
    personality: {
      type: 'SRMF',
      animal: 'elephant',
      title: '지식 멘토',
      emoji: '🐘'
    }
  },
  
  SRMC: { // Eagle - 체계적 교육자
    colors: {
      primary: '#2C2C54',
      secondary: '#40407A',
      accent: '#F97F51',
      background: '#F5F5FA',
      surface: '#FFFFFF',
      text: '#2D3436',
      muted: '#706FD3',
      gradient: ['#2C2C54', '#40407A', '#F97F51']
    },
    animations: {
      type: 'minimal',
      speed: 'normal',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    },
    layout: {
      style: 'structured',
      density: 'compact',
      roundness: 'none'
    },
    interaction: {
      feedback: 'moderate',
      hover: 'minimal',
      click: 'scale'
    },
    personality: {
      type: 'SRMC',
      animal: 'eagle',
      title: '체계적 교육자',
      emoji: '🦅'
    }
  }
};

// Context
interface APTThemeContextType {
  theme: APTTheme;
  aptType: string;
  setAPTType: (type: string) => void;
  animationEnabled: boolean;
  setAnimationEnabled: (enabled: boolean) => void;
  colorBlindMode: boolean;
  setColorBlindMode: (enabled: boolean) => void;
}

const APTThemeContext = createContext<APTThemeContextType | undefined>(undefined);

export const useAPTTheme = () => {
  const context = useContext(APTThemeContext);
  if (!context) {
    throw new Error('useAPTTheme must be used within APTThemeProvider');
  }
  return context;
};

interface APTThemeProviderProps {
  children: React.ReactNode;
  defaultType?: string;
}

export function APTThemeProvider({ children, defaultType = 'LAEF' }: APTThemeProviderProps) {
  const [aptType, setAPTType] = useState(defaultType);
  const [animationEnabled, setAnimationEnabled] = useState(true);
  const [colorBlindMode, setColorBlindMode] = useState(false);
  
  const theme = APT_THEMES[aptType] || APT_THEMES.LAEF;

  // CSS 변수 업데이트
  useEffect(() => {
    const root = document.documentElement;
    
    // 색상 변수 설정
    Object.entries(theme.colors).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((color, index) => {
          root.style.setProperty(`--apt-${key}-${index}`, color);
        });
      } else {
        root.style.setProperty(`--apt-${key}`, value);
      }
    });
    
    // 애니메이션 속도 설정
    root.style.setProperty('--apt-animation-speed', 
      animationEnabled ? 
        (theme.animations.speed === 'slow' ? '0.6s' : 
         theme.animations.speed === 'fast' ? '0.2s' : '0.3s') 
        : '0s'
    );
    
    // 레이아웃 변수 설정
    root.style.setProperty('--apt-roundness', 
      theme.layout.roundness === 'none' ? '0' :
      theme.layout.roundness === 'subtle' ? '4px' :
      theme.layout.roundness === 'medium' ? '8px' : '16px'
    );
    
    // 접근성 모드
    if (colorBlindMode) {
      root.classList.add('color-blind-mode');
    } else {
      root.classList.remove('color-blind-mode');
    }
    
  }, [theme, animationEnabled, colorBlindMode]);

  return (
    <APTThemeContext.Provider 
      value={{
        theme,
        aptType,
        setAPTType,
        animationEnabled,
        setAnimationEnabled,
        colorBlindMode,
        setColorBlindMode
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={aptType}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="apt-theme-wrapper"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </APTThemeContext.Provider>
  );
}