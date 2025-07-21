import { useEffect, useState, useCallback } from 'react';
import { useReducedMotion } from 'framer-motion';

interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  connectionSpeed: 'slow' | 'medium' | 'fast';
  deviceType: 'mobile' | 'tablet' | 'desktop';
  gpuTier: 'low' | 'medium' | 'high';
}

interface PerformanceSettings {
  enableAnimations: boolean;
  animationQuality: 'low' | 'medium' | 'high';
  enableParticles: boolean;
  enable3D: boolean;
  enableBlur: boolean;
  maxAnimations: number;
  imageQuality: 'low' | 'medium' | 'high';
}

export function usePerformanceOptimization() {
  const prefersReducedMotion = useReducedMotion();
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    memoryUsage: 0,
    connectionSpeed: 'fast',
    deviceType: 'desktop',
    gpuTier: 'high',
  });
  
  const [settings, setSettings] = useState<PerformanceSettings>({
    enableAnimations: !prefersReducedMotion,
    animationQuality: 'high',
    enableParticles: true,
    enable3D: true,
    enableBlur: true,
    maxAnimations: 20,
    imageQuality: 'high',
  });
  
  // Detect device type
  useEffect(() => {
    const detectDevice = () => {
      const width = window.innerWidth;
      if (width < 768) return 'mobile';
      if (width < 1024) return 'tablet';
      return 'desktop';
    };
    
    setMetrics(prev => ({ ...prev, deviceType: detectDevice() }));
    
    const handleResize = () => {
      setMetrics(prev => ({ ...prev, deviceType: detectDevice() }));
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Detect connection speed
  useEffect(() => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      const updateConnectionSpeed = () => {
        const effectiveType = connection.effectiveType;
        let speed: 'slow' | 'medium' | 'fast' = 'fast';
        
        if (effectiveType === 'slow-2g' || effectiveType === '2g') {
          speed = 'slow';
        } else if (effectiveType === '3g') {
          speed = 'medium';
        }
        
        setMetrics(prev => ({ ...prev, connectionSpeed: speed }));
      };
      
      updateConnectionSpeed();
      connection.addEventListener('change', updateConnectionSpeed);
      
      return () => connection.removeEventListener('change', updateConnectionSpeed);
    }
  }, []);
  
  // Monitor FPS
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let rafId: number;
    
    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        setMetrics(prev => ({ ...prev, fps }));
        
        frameCount = 0;
        lastTime = currentTime;
      }
      
      rafId = requestAnimationFrame(measureFPS);
    };
    
    rafId = requestAnimationFrame(measureFPS);
    
    return () => cancelAnimationFrame(rafId);
  }, []);
  
  // Monitor memory usage
  useEffect(() => {
    if ('memory' in performance) {
      const checkMemory = () => {
        const memory = (performance as any).memory;
        const usage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
        setMetrics(prev => ({ ...prev, memoryUsage: usage }));
      };
      
      checkMemory();
      const interval = setInterval(checkMemory, 5000);
      
      return () => clearInterval(interval);
    }
  }, []);
  
  // Detect GPU tier
  useEffect(() => {
    const detectGPU = async () => {
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        
        if (!gl) {
          setMetrics(prev => ({ ...prev, gpuTier: 'low' }));
          return;
        }
        
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
          
          // Simple GPU tier detection based on renderer string
          if (renderer.includes('Intel')) {
            setMetrics(prev => ({ ...prev, gpuTier: 'low' }));
          } else if (renderer.includes('AMD') || renderer.includes('NVIDIA')) {
            setMetrics(prev => ({ ...prev, gpuTier: 'high' }));
          } else {
            setMetrics(prev => ({ ...prev, gpuTier: 'medium' }));
          }
        }
      } catch (error) {
        console.error('GPU detection failed:', error);
      }
    };
    
    detectGPU();
  }, []);
  
  // Auto-adjust settings based on performance
  useEffect(() => {
    const { fps, memoryUsage, connectionSpeed, deviceType, gpuTier } = metrics;
    
    // Performance scoring
    let performanceScore = 100;
    
    // FPS impact
    if (fps < 30) performanceScore -= 40;
    else if (fps < 45) performanceScore -= 20;
    else if (fps < 55) performanceScore -= 10;
    
    // Memory impact
    if (memoryUsage > 0.9) performanceScore -= 30;
    else if (memoryUsage > 0.7) performanceScore -= 15;
    else if (memoryUsage > 0.5) performanceScore -= 5;
    
    // Connection impact
    if (connectionSpeed === 'slow') performanceScore -= 30;
    else if (connectionSpeed === 'medium') performanceScore -= 10;
    
    // Device impact
    if (deviceType === 'mobile') performanceScore -= 20;
    else if (deviceType === 'tablet') performanceScore -= 10;
    
    // GPU impact
    if (gpuTier === 'low') performanceScore -= 30;
    else if (gpuTier === 'medium') performanceScore -= 10;
    
    // Apply settings based on score
    if (performanceScore >= 80) {
      // High performance
      setSettings({
        enableAnimations: !prefersReducedMotion,
        animationQuality: 'high',
        enableParticles: true,
        enable3D: true,
        enableBlur: true,
        maxAnimations: 20,
        imageQuality: 'high',
      });
    } else if (performanceScore >= 50) {
      // Medium performance
      setSettings({
        enableAnimations: !prefersReducedMotion,
        animationQuality: 'medium',
        enableParticles: true,
        enable3D: deviceType === 'desktop',
        enableBlur: true,
        maxAnimations: 10,
        imageQuality: 'medium',
      });
    } else {
      // Low performance
      setSettings({
        enableAnimations: !prefersReducedMotion,
        animationQuality: 'low',
        enableParticles: false,
        enable3D: false,
        enableBlur: false,
        maxAnimations: 5,
        imageQuality: 'low',
      });
    }
  }, [metrics, prefersReducedMotion]);
  
  // Manual override functions
  const setQuality = useCallback((quality: 'low' | 'medium' | 'high') => {
    const qualitySettings: Record<string, PerformanceSettings> = {
      low: {
        enableAnimations: !prefersReducedMotion,
        animationQuality: 'low',
        enableParticles: false,
        enable3D: false,
        enableBlur: false,
        maxAnimations: 5,
        imageQuality: 'low',
      },
      medium: {
        enableAnimations: !prefersReducedMotion,
        animationQuality: 'medium',
        enableParticles: true,
        enable3D: false,
        enableBlur: true,
        maxAnimations: 10,
        imageQuality: 'medium',
      },
      high: {
        enableAnimations: !prefersReducedMotion,
        animationQuality: 'high',
        enableParticles: true,
        enable3D: true,
        enableBlur: true,
        maxAnimations: 20,
        imageQuality: 'high',
      },
    };
    
    setSettings(qualitySettings[quality]);
  }, [prefersReducedMotion]);
  
  // Performance monitoring utilities
  const measurePerformance = useCallback((callback: () => void) => {
    const startTime = performance.now();
    callback();
    const endTime = performance.now();
    return endTime - startTime;
  }, []);
  
  const throttleAnimation = useCallback((callback: () => void, delay: number) => {
    let lastCall = 0;
    return () => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        callback();
      }
    };
  }, []);
  
  return {
    metrics,
    settings,
    setQuality,
    measurePerformance,
    throttleAnimation,
    isHighPerformance: metrics.fps >= 55 && metrics.memoryUsage < 0.5,
    isMediumPerformance: metrics.fps >= 30 && metrics.memoryUsage < 0.7,
    isLowPerformance: metrics.fps < 30 || metrics.memoryUsage > 0.7,
  };
}