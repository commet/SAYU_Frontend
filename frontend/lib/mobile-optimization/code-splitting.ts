// SAYU Mobile Code Splitting Strategy
import { lazy, ComponentType } from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';

// Mobile-first lazy loading
export const MobileOptimizedComponents = {
  // Phase 1: Core Components (Always loaded)
  MobileNav: lazy(() => import('@/components/navigation/MobileNav')),
  
  // Phase 2: Feature Components (Conditionally loaded)
  Gallery3D: lazy(() => import('@/components/spatial/ThreeScene')),
  AdvancedChatbot: lazy(() => import('@/components/chatbot/SmartChatbot')),
  
  // Phase 3: Enhancement Components (Desktop only)
  InteractiveDimensions: lazy(() => import('@/components/spatial/InteractiveDimensions')),
  ComplexAnimations: lazy(() => import('@/components/ui/3d-carousel')),
};

// Conditional component loader based on device capabilities
export function useConditionalComponent<T extends ComponentType<any>>(
  mobileComponent: T,
  desktopComponent: T,
  options: {
    breakpoint?: string;
    performanceThreshold?: number;
    networkCondition?: 'slow' | 'fast' | 'auto';
  } = {}
): T {
  const { 
    breakpoint = '(min-width: 1024px)', 
    performanceThreshold = 4,
    networkCondition = 'auto' 
  } = options;
  
  const isDesktop = useMediaQuery(breakpoint);
  const deviceMemory = (navigator as any)?.deviceMemory || 4;
  const connection = (navigator as any)?.connection;
  
  // Network condition detection
  const isSlowConnection = networkCondition === 'slow' || 
    (networkCondition === 'auto' && connection?.effectiveType === '2g');
  
  // Device capability check
  const isLowEndDevice = deviceMemory < performanceThreshold;
  
  // Return appropriate component
  if (!isDesktop || isLowEndDevice || isSlowConnection) {
    return mobileComponent;
  }
  
  return desktopComponent;
}

// Progressive loading strategy
export const ProgressiveLoadingConfig = {
  // Critical path (load immediately)
  critical: [
    'MobileNav',
    'AuthProvider',
    'LanguageProvider'
  ],
  
  // Above the fold (load after critical)
  aboveFold: [
    'GalleryGrid',
    'QuizComponent',
    'UserProfile'
  ],
  
  // Below the fold (lazy load on scroll)
  belowFold: [
    'CommunityFeed',
    'ExhibitionList',
    'ArtworkRecommendations'
  ],
  
  // Interactive (load on user interaction)
  interactive: [
    'ChatbotModal',
    'ShareModal',
    'SettingsPanel'
  ],
  
  // Desktop enhancement (load on desktop only)
  desktopOnly: [
    'ThreeScene',
    '3DCarousel',
    'AdvancedAnimations'
  ]
};

// Image optimization for mobile
export const MobileImageConfig = {
  // Responsive breakpoints
  breakpoints: {
    mobile: 640,
    tablet: 768,
    desktop: 1024,
    xl: 1280
  },
  
  // Quality settings by device
  quality: {
    mobile: 75,
    tablet: 85,
    desktop: 95
  },
  
  // Format priority
  formats: ['avif', 'webp', 'jpg'],
  
  // Lazy loading threshold
  lazyLoadThreshold: '50px',
  
  // Placeholder strategy
  placeholder: 'blur' // or 'empty' for faster loading
};