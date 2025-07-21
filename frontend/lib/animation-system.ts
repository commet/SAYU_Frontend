// SAYU Unified Animation System
// Integrating CSS Scroll-Driven + Framer Motion + React Three Fiber + GSAP
// 2024-2025 Web Animation Trends Implementation

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { MutableRefObject } from 'react';
import type { Group, Object3D } from 'three';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// 🎯 Animation Layer Architecture
export enum AnimationLayer {
  CSS_NATIVE = 1,     // CSS Scroll-Driven (최고 성능)
  FRAMER_MOTION = 2,  // UI 인터랙션 
  THREE_FIBER = 3,    // 3D 공간 애니메이션
  GSAP = 4           // 복잡한 타임라인
}

// 🎨 Animation Types by 2024-2025 Trends
export interface AnimationDefinition {
  id: string;
  name: string;
  layer: AnimationLayer;
  type: 'entrance' | 'transition' | 'interaction' | 'ambient' | 'scroll-driven';
  performance: 'high' | 'medium' | 'low';
  fallback?: AnimationDefinition;
  config: AnimationConfig;
}

export interface AnimationConfig {
  // Universal properties
  duration?: number;
  delay?: number;
  easing?: string | [number, number, number, number];
  repeat?: number | 'infinite';
  
  // CSS Scroll-Driven specific
  scrollTimeline?: {
    source: 'scroll' | 'view';
    axis: 'x' | 'y' | 'both';
    range?: string; // "entry 0% cover 100%"
  };
  
  // Framer Motion specific
  framerConfig?: {
    initial?: Record<string, any>;
    animate?: Record<string, any>;
    exit?: Record<string, any>;
    transition?: Record<string, any>;
  };
  
  // Three.js specific  
  threeConfig?: {
    property: 'position' | 'rotation' | 'scale' | 'material';
    from: number[] | Record<string, any>;
    to: number[] | Record<string, any>;
    lookAt?: [number, number, number];
  };
  
  // GSAP specific
  gsapConfig?: {
    timeline?: boolean;
    stagger?: number;
    scrollTrigger?: ScrollTrigger.Vars;
  };
}

// 🚀 Performance Detection & Adaptive Quality
export interface PerformanceProfile {
  tier: 'high' | 'medium' | 'low';
  maxAnimations: number;
  preferredLayers: AnimationLayer[];
  features: {
    webgpu: boolean;
    webgl2: boolean;
    hardwareAcceleration: boolean;
    reducedMotion: boolean;
  };
}

// 🎭 Animation State Store
interface AnimationState {
  // Performance & Quality
  performanceProfile: PerformanceProfile;
  currentQuality: 'high' | 'medium' | 'low';
  
  // Active Animations
  activeAnimations: Map<string, AnimationInstance>;
  animationQueue: AnimationDefinition[];
  
  // Spatial State Integration
  currentDimension: string;
  transitionProgress: number;
  
  // User Preferences
  motionPreference: 'auto' | 'reduced' | 'enhanced';
  qualityPreference: 'auto' | 'high' | 'medium' | 'low';
  
  // Actions
  detectPerformance: () => void;
  registerAnimation: (def: AnimationDefinition) => void;
  playAnimation: (id: string, target?: any, options?: PlayOptions) => Promise<void>;
  stopAnimation: (id: string) => void;
  setQuality: (quality: 'high' | 'medium' | 'low') => void;
  updateDimension: (dimension: string) => void;
}

export interface AnimationInstance {
  id: string;
  definition: AnimationDefinition;
  status: 'playing' | 'paused' | 'completed' | 'cancelled';
  target?: any;
  startTime: number;
  progress: number;
  controller?: AbortController;
}

export interface PlayOptions {
  force?: boolean;
  priority?: 'high' | 'medium' | 'low';
  onComplete?: () => void;
  onProgress?: (progress: number) => void;
}

// 🎯 Create Animation Store
export const useAnimationStore = create<AnimationState>()(
  subscribeWithSelector((set, get) => ({
    // Initial State
    performanceProfile: {
      tier: 'medium',
      maxAnimations: 10,
      preferredLayers: [AnimationLayer.CSS_NATIVE, AnimationLayer.FRAMER_MOTION],
      features: {
        webgpu: false,
        webgl2: false,
        hardwareAcceleration: false,
        reducedMotion: false
      }
    },
    currentQuality: 'medium',
    activeAnimations: new Map(),
    animationQueue: [],
    currentDimension: 'central_hub',
    transitionProgress: 0,
    motionPreference: 'auto',
    qualityPreference: 'auto',

    // Actions
    detectPerformance: () => {
      if (typeof window === 'undefined') return;
      
      const profile: PerformanceProfile = {
        tier: 'medium',
        maxAnimations: 10,
        preferredLayers: [AnimationLayer.CSS_NATIVE, AnimationLayer.FRAMER_MOTION],
        features: {
          webgpu: 'gpu' in navigator,
          webgl2: (() => {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl2');
            return !!gl;
          })(),
          hardwareAcceleration: (() => {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl');
            if (!gl) return false;
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : '';
            return !renderer.includes('Software');
          })(),
          reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        }
      };

      // Determine performance tier
      const memory = (performance as any).memory?.usedJSHeapSize || 0;
      const cores = navigator.hardwareConcurrency || 2;
      
      if (profile.features.webgpu && cores >= 8 && memory < 100000000) {
        profile.tier = 'high';
        profile.maxAnimations = 20;
        profile.preferredLayers = [
          AnimationLayer.CSS_NATIVE,
          AnimationLayer.FRAMER_MOTION,
          AnimationLayer.THREE_FIBER,
          AnimationLayer.GSAP
        ];
      } else if (profile.features.webgl2 && cores >= 4) {
        profile.tier = 'medium';
        profile.maxAnimations = 10;
        profile.preferredLayers = [
          AnimationLayer.CSS_NATIVE,
          AnimationLayer.FRAMER_MOTION,
          AnimationLayer.THREE_FIBER
        ];
      } else {
        profile.tier = 'low';
        profile.maxAnimations = 5;
        profile.preferredLayers = [AnimationLayer.CSS_NATIVE, AnimationLayer.FRAMER_MOTION];
      }

      set({ 
        performanceProfile: profile,
        currentQuality: profile.tier
      });
    },

    registerAnimation: (def: AnimationDefinition) => {
      const { animationQueue } = get();
      set({ animationQueue: [...animationQueue, def] });
    },

    playAnimation: async (id: string, target?: any, options?: PlayOptions) => {
      const { animationQueue, activeAnimations, performanceProfile } = get();
      const definition = animationQueue.find(def => def.id === id);
      
      if (!definition) {
        console.warn(`Animation ${id} not found`);
        return;
      }

      // Performance check
      if (activeAnimations.size >= performanceProfile.maxAnimations && !options?.force) {
        console.warn(`Max animations reached (${performanceProfile.maxAnimations})`);
        return;
      }

      // Create instance
      const instance: AnimationInstance = {
        id,
        definition,
        status: 'playing',
        target,
        startTime: performance.now(),
        progress: 0,
        controller: new AbortController()
      };

      // Add to active animations
      const newActiveAnimations = new Map(activeAnimations);
      newActiveAnimations.set(id, instance);
      set({ activeAnimations: newActiveAnimations });

      // Execute animation based on layer
      try {
        await executeAnimation(instance, options);
      } catch (error) {
        console.error(`Animation ${id} failed:`, error);
      }
    },

    stopAnimation: (id: string) => {
      const { activeAnimations } = get();
      const instance = activeAnimations.get(id);
      
      if (instance) {
        instance.controller?.abort();
        instance.status = 'cancelled';
        
        const newActiveAnimations = new Map(activeAnimations);
        newActiveAnimations.delete(id);
        set({ activeAnimations: newActiveAnimations });
      }
    },

    setQuality: (quality: 'high' | 'medium' | 'low') => {
      set({ currentQuality: quality });
    },

    updateDimension: (dimension: string) => {
      set({ currentDimension: dimension });
    }
  }))
);

// 🎬 Animation Execution Engine
async function executeAnimation(
  instance: AnimationInstance, 
  options?: PlayOptions
): Promise<void> {
  const { definition, target, controller } = instance;
  const { config, layer } = definition;

  switch (layer) {
    case AnimationLayer.CSS_NATIVE:
      return executeCSSAnimation(instance, options);
    
    case AnimationLayer.FRAMER_MOTION:
      return executeFramerAnimation(instance, options);
    
    case AnimationLayer.THREE_FIBER:
      return executeThreeAnimation(instance, options);
    
    case AnimationLayer.GSAP:
      return executeGSAPAnimation(instance, options);
    
    default:
      throw new Error(`Unsupported animation layer: ${layer}`);
  }
}

// 🎨 CSS Scroll-Driven Animation Execution
async function executeCSSAnimation(
  instance: AnimationInstance, 
  options?: PlayOptions
): Promise<void> {
  const { definition, target } = instance;
  const { config } = definition;
  
  if (!target || !config.scrollTimeline) return;

  return new Promise((resolve) => {
    const element = target as HTMLElement;
    
    // Apply CSS animation
    const animationName = `sayu-${definition.id}`;
    
    // Create keyframes if they don't exist
    createCSSKeyframes(animationName, config);
    
    // Apply animation
    element.style.animation = [
      animationName,
      `${config.duration || 1000}ms`,
      config.easing || 'ease',
      `${config.delay || 0}ms`,
      config.repeat === 'infinite' ? 'infinite' : (config.repeat || 1),
      'both'
    ].join(' ');
    
    // Set scroll timeline
    if (config.scrollTimeline) {
      element.style.animationTimeline = `scroll(${config.scrollTimeline.axis || 'y'})`;
      if (config.scrollTimeline.range) {
        element.style.animationRange = config.scrollTimeline.range;
      }
    }

    // Listen for animation end
    const handleAnimationEnd = () => {
      element.removeEventListener('animationend', handleAnimationEnd);
      instance.status = 'completed';
      options?.onComplete?.(  );
      resolve();
    };

    element.addEventListener('animationend', handleAnimationEnd);
    
    // Handle abort
    instance.controller?.signal.addEventListener('abort', () => {
      element.removeEventListener('animationend', handleAnimationEnd);
      element.style.animation = '';
      resolve();
    });
  });
}

// 🎭 Framer Motion Animation Execution
async function executeFramerAnimation(
  instance: AnimationInstance, 
  options?: PlayOptions
): Promise<void> {
  // This would integrate with Framer Motion's animate() function
  // Implementation depends on how Framer Motion is integrated in components
  return new Promise(resolve => {
    setTimeout(resolve, instance.definition.config.duration || 1000);
  });
}

// 🌌 Three.js Animation Execution
async function executeThreeAnimation(
  instance: AnimationInstance, 
  options?: PlayOptions
): Promise<void> {
  const { definition, target } = instance;
  const { config } = definition;
  
  if (!target || !config.threeConfig) return;

  return new Promise((resolve) => {
    const object = target as Object3D;
    const { threeConfig } = config;
    const duration = config.duration || 1000;
    const startTime = performance.now();

    const animate = () => {
      if (instance.controller?.signal.aborted) {
        resolve();
        return;
      }

      const now = performance.now();
      const progress = Math.min((now - startTime) / duration, 1);
      
      // Apply interpolation based on property
      switch (threeConfig.property) {
        case 'position':
          if (Array.isArray(threeConfig.from) && Array.isArray(threeConfig.to)) {
            object.position.lerpVectors(
              { x: threeConfig.from[0], y: threeConfig.from[1], z: threeConfig.from[2] } as any,
              { x: threeConfig.to[0], y: threeConfig.to[1], z: threeConfig.to[2] } as any,
              progress
            );
          }
          break;
          
        case 'rotation':
          if (Array.isArray(threeConfig.from) && Array.isArray(threeConfig.to)) {
            object.rotation.x = lerp(threeConfig.from[0], threeConfig.to[0], progress);
            object.rotation.y = lerp(threeConfig.from[1], threeConfig.to[1], progress);
            object.rotation.z = lerp(threeConfig.from[2], threeConfig.to[2], progress);
          }
          break;
          
        case 'scale':
          if (Array.isArray(threeConfig.from) && Array.isArray(threeConfig.to)) {
            object.scale.x = lerp(threeConfig.from[0], threeConfig.to[0], progress);
            object.scale.y = lerp(threeConfig.from[1], threeConfig.to[1], progress);
            object.scale.z = lerp(threeConfig.from[2], threeConfig.to[2], progress);
          }
          break;
      }

      instance.progress = progress;
      options?.onProgress?.(progress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        instance.status = 'completed';
        options?.onComplete?.();
        resolve();
      }
    };

    requestAnimationFrame(animate);
  });
}

// 🎯 GSAP Animation Execution
async function executeGSAPAnimation(
  instance: AnimationInstance, 
  options?: PlayOptions
): Promise<void> {
  const { definition, target } = instance;
  const { config } = definition;
  
  if (!target) return;

  return new Promise((resolve) => {
    const gsapConfig = config.gsapConfig || {};
    
    gsap.to(target, {
      duration: (config.duration || 1000) / 1000, // GSAP uses seconds
      delay: (config.delay || 0) / 1000,
      ease: config.easing || 'power2.out',
      ...gsapConfig,
      onComplete: () => {
        instance.status = 'completed';
        options?.onComplete?.();
        resolve();
      },
      onUpdate: function() {
        instance.progress = this.progress();
        options?.onProgress?.(this.progress());
      }
    });

    // Handle abort
    instance.controller?.signal.addEventListener('abort', () => {
      gsap.killTweensOf(target);
      resolve();
    });
  });
}

// 🔧 Utility Functions
function createCSSKeyframes(name: string, config: AnimationConfig): void {
  if (typeof document === 'undefined') return;
  
  // Check if keyframes already exist
  const existingStyle = document.getElementById(`sayu-keyframes-${name}`);
  if (existingStyle) return;

  // Create keyframes based on config
  const keyframesCSS = `
    @keyframes ${name} {
      from {
        transform: translateY(20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
  `;

  const style = document.createElement('style');
  style.id = `sayu-keyframes-${name}`;
  style.textContent = keyframesCSS;
  document.head.appendChild(style);
}

function lerp(start: number, end: number, progress: number): number {
  return start + (end - start) * progress;
}

// 🎨 Predefined SAYU Animations
export const SAYU_ANIMATIONS: AnimationDefinition[] = [
  // ✨ Entrance Animations
  {
    id: 'gallery-entrance',
    name: 'Gallery Space Entrance',
    layer: AnimationLayer.THREE_FIBER,
    type: 'entrance',
    performance: 'high',
    config: {
      duration: 2000,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      threeConfig: {
        property: 'position',
        from: [0, -10, -20],
        to: [0, 0, 0]
      }
    }
  },
  
  // 🚪 Portal Transitions
  {
    id: 'portal-transition',
    name: 'Dimension Portal Transition',
    layer: AnimationLayer.GSAP,
    type: 'transition',
    performance: 'medium',
    config: {
      duration: 1500,
      easing: 'power3.inOut',
      gsapConfig: {
        timeline: true,
        stagger: 0.1
      }
    }
  },
  
  // 📜 Scroll-Driven Reveals
  {
    id: 'artwork-reveal',
    name: 'Artwork Scroll Reveal',
    layer: AnimationLayer.CSS_NATIVE,
    type: 'scroll-driven',
    performance: 'high',
    config: {
      scrollTimeline: {
        source: 'view',
        axis: 'y',
        range: 'entry 0% cover 40%'
      },
      duration: 1000,
      easing: 'ease-out'
    }
  },
  
  // 🤝 Interaction Animations
  {
    id: 'hover-float',
    name: 'Interactive Hover Float',
    layer: AnimationLayer.FRAMER_MOTION,
    type: 'interaction',
    performance: 'high',
    config: {
      duration: 300,
      easing: [0.25, 0.46, 0.45, 0.94],
      framerConfig: {
        initial: { y: 0, scale: 1 },
        animate: { y: -5, scale: 1.02 },
        exit: { y: 0, scale: 1 }
      }
    }
  },
  
  // 🌊 Ambient Environment
  {
    id: 'ambient-lighting',
    name: 'Ambient Gallery Lighting',
    layer: AnimationLayer.THREE_FIBER,
    type: 'ambient',
    performance: 'medium',
    config: {
      duration: 5000,
      repeat: 'infinite',
      easing: 'linear',
      threeConfig: {
        property: 'material',
        from: { intensity: 0.5 },
        to: { intensity: 1.0 }
      }
    }
  }
];

// 🚀 Initialize Animation System
export function initializeAnimationSystem(): void {
  // Detect performance
  useAnimationStore.getState().detectPerformance();
  
  // Register predefined animations
  SAYU_ANIMATIONS.forEach(animation => {
    useAnimationStore.getState().registerAnimation(animation);
  });
  
  // Set up responsive quality adjustment
  if (typeof window !== 'undefined') {
    // Monitor performance and adjust quality
    let frameCount = 0;
    let lastTime = performance.now();
    
    function monitorPerformance() {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        
        // Adjust quality based on FPS
        const { currentQuality, setQuality } = useAnimationStore.getState();
        
        if (fps < 30 && currentQuality !== 'low') {
          setQuality('low');
          console.log('🐌 Performance detected: Switching to low quality animations');
        } else if (fps > 50 && currentQuality !== 'high') {
          setQuality('high');
          console.log('🚀 Good performance detected: Switching to high quality animations');
        }
        
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(monitorPerformance);
    }
    
    requestAnimationFrame(monitorPerformance);
  }
}

export default useAnimationStore;