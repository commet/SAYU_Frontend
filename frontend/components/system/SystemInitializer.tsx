'use client';

import { useEffect } from 'react';
import { initializeAnimationSystem } from '@/lib/animation-system';
import { initializeThemeSystem } from '@/lib/unified-theme-system';
import useThemeStore from '@/lib/unified-theme-system';
import useAnimationStore from '@/lib/animation-system';

export function SystemInitializer() {
  useEffect(() => {
    // Initialize theme system
    initializeThemeSystem();
    console.log('🎨 Theme system initialized');
    
    // Initialize animation system
    initializeAnimationSystem();
    console.log('🎬 Animation system initialized');
    
    // Register custom CSS animations for scroll-driven effects
    if (typeof window !== 'undefined' && 'AnimationTimeline' in window) {
      console.log('✨ Scroll-driven animations supported');
      
      // Add scroll-driven animation classes to elements
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
          }
        });
      }, { threshold: 0.1 });
      
      // Observe elements with animation classes
      document.querySelectorAll('.scroll-reveal, .scroll-fade, .scroll-scale').forEach(el => {
        observer.observe(el);
      });
    }
    
    // Monitor WebGPU availability
    if ('gpu' in navigator) {
      navigator.gpu.requestAdapter().then(adapter => {
        if (adapter) {
          console.log('🚀 WebGPU available - Enhanced graphics enabled');
          useAnimationStore.getState().setQuality('high');
        }
      });
    }
    
    // Apply saved preferences
    const savedTheme = localStorage.getItem('sayu-theme-mode');
    const savedPersonality = localStorage.getItem('sayu-personality-type');
    
    if (savedTheme) {
      useThemeStore.getState().setMode(savedTheme as any);
    }
    
    if (savedPersonality) {
      useThemeStore.getState().setPersonalityType(savedPersonality as any);
    }
    
    // Add global keyboard shortcuts
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Shift + D - Toggle debug mode
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
        document.body.classList.toggle('debug-grid');
        document.body.classList.toggle('debug-theme');
      }
      
      // Ctrl/Cmd + Shift + T - Toggle theme
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
        const currentMode = useThemeStore.getState().mode;
        const newMode = currentMode === 'light' ? 'dark' : 'light';
        useThemeStore.getState().setMode(newMode);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);
  
  return null;
}

// Performance monitoring component
export function PerformanceMonitor() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    let frameCount = 0;
    let lastTime = performance.now();
    
    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        
        // Update performance profile based on FPS
        const animationStore = useAnimationStore.getState();
        const currentQuality = animationStore.currentQuality;
        
        if (fps < 30 && currentQuality !== 'low') {
          console.warn(`⚠️ Low FPS detected: ${fps}fps - Reducing quality`);
          animationStore.setQuality('low');
        } else if (fps > 50 && fps < 60 && currentQuality === 'low') {
          console.log(`✅ Performance improved: ${fps}fps - Increasing quality`);
          animationStore.setQuality('medium');
        } else if (fps >= 60 && currentQuality !== 'high') {
          console.log(`🚀 Excellent performance: ${fps}fps - Maximum quality`);
          animationStore.setQuality('high');
        }
        
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measureFPS);
    };
    
    requestAnimationFrame(measureFPS);
  }, []);
  
  return null;
}

// Spatial preloader for 3D assets
export function SpatialPreloader() {
  useEffect(() => {
    // Preload critical 3D assets
    const assetsToPreload = [
      '/fonts/Playfair_Display_Bold.json',
      '/models/gallery-hall.glb',
      '/textures/marble.jpg',
      '/textures/wood.jpg'
    ];
    
    assetsToPreload.forEach(async (asset) => {
      try {
        const response = await fetch(asset);
        await response.blob();
        console.log(`✅ Preloaded: ${asset}`);
      } catch (error) {
        console.warn(`⚠️ Failed to preload: ${asset}`, error);
      }
    });
  }, []);
  
  return null;
}