'use client';

import { useRef, useCallback, useEffect, useState } from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';

// Mobile-specific interaction patterns for SAYU
export function useMobileInteractions() {
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent));
  }, []);

  // Haptic feedback
  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (!isMobile || !('vibrate' in navigator)) return;
    
    const patterns = {
      light: 50,
      medium: 100,
      heavy: 200
    };
    
    navigator.vibrate(patterns[type]);
  }, [isMobile]);

  // Enhanced touch gestures
  const useTouchGesture = useCallback((
    element: React.RefObject<HTMLElement>,
    callbacks: {
      onTap?: (e: TouchEvent) => void;
      onDoubleTap?: (e: TouchEvent) => void;
      onLongPress?: (e: TouchEvent) => void;
      onSwipeLeft?: (e: TouchEvent) => void;
      onSwipeRight?: (e: TouchEvent) => void;
      onSwipeUp?: (e: TouchEvent) => void;
      onSwipeDown?: (e: TouchEvent) => void;
      onPinch?: (scale: number, e: TouchEvent) => void;
    }
  ) => {
    const touchStart = useRef<{ x: number; y: number; time: number } | null>(null);
    const doubleTapTimeout = useRef<NodeJS.Timeout | null>(null);
    const longPressTimeout = useRef<NodeJS.Timeout | null>(null);
    const initialDistance = useRef<number>(0);
    const lastTapTime = useRef<number>(0);

    useEffect(() => {
      const el = element.current;
      if (!el || !isMobile) return;

      const handleTouchStart = (e: TouchEvent) => {
        e.preventDefault();
        
        if (e.touches.length === 1) {
          const touch = e.touches[0];
          touchStart.current = {
            x: touch.clientX,
            y: touch.clientY,
            time: Date.now()
          };

          // Long press detection
          longPressTimeout.current = setTimeout(() => {
            if (callbacks.onLongPress) {
              triggerHaptic('medium');
              callbacks.onLongPress(e);
            }
          }, 500);

        } else if (e.touches.length === 2) {
          // Pinch gesture start
          const touch1 = e.touches[0];
          const touch2 = e.touches[1];
          initialDistance.current = Math.sqrt(
            Math.pow(touch2.clientX - touch1.clientX, 2) +
            Math.pow(touch2.clientY - touch1.clientY, 2)
          );
        }
      };

      const handleTouchMove = (e: TouchEvent) => {
        if (longPressTimeout.current) {
          clearTimeout(longPressTimeout.current);
          longPressTimeout.current = null;
        }

        if (e.touches.length === 2 && callbacks.onPinch) {
          // Pinch gesture
          const touch1 = e.touches[0];
          const touch2 = e.touches[1];
          const currentDistance = Math.sqrt(
            Math.pow(touch2.clientX - touch1.clientX, 2) +
            Math.pow(touch2.clientY - touch1.clientY, 2)
          );
          
          const scale = currentDistance / initialDistance.current;
          callbacks.onPinch(scale, e);
        }
      };

      const handleTouchEnd = (e: TouchEvent) => {
        if (longPressTimeout.current) {
          clearTimeout(longPressTimeout.current);
          longPressTimeout.current = null;
        }

        if (!touchStart.current || e.touches.length > 0) return;

        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - touchStart.current.x;
        const deltaY = touch.clientY - touchStart.current.y;
        const deltaTime = Date.now() - touchStart.current.time;
        const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);

        // Swipe detection (minimum distance and maximum time)
        if (distance > 50 && deltaTime < 300) {
          const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
          
          if (angle >= -45 && angle <= 45 && callbacks.onSwipeRight) {
            triggerHaptic('light');
            callbacks.onSwipeRight(e);
          } else if (angle >= 135 || angle <= -135 && callbacks.onSwipeLeft) {
            triggerHaptic('light');
            callbacks.onSwipeLeft(e);
          } else if (angle >= 45 && angle <= 135 && callbacks.onSwipeDown) {
            triggerHaptic('light');
            callbacks.onSwipeDown(e);
          } else if (angle >= -135 && angle <= -45 && callbacks.onSwipeUp) {
            triggerHaptic('light');
            callbacks.onSwipeUp(e);
          }
        }
        // Tap detection (small movement and quick time)
        else if (distance < 10 && deltaTime < 300) {
          const currentTime = Date.now();
          
          // Double tap detection
          if (currentTime - lastTapTime.current < 300 && callbacks.onDoubleTap) {
            if (doubleTapTimeout.current) {
              clearTimeout(doubleTapTimeout.current);
              doubleTapTimeout.current = null;
            }
            triggerHaptic('medium');
            callbacks.onDoubleTap(e);
          }
          // Single tap (delayed to allow for double tap)
          else if (callbacks.onTap) {
            doubleTapTimeout.current = setTimeout(() => {
              triggerHaptic('light');
              callbacks.onTap!(e);
            }, 300);
          }
          
          lastTapTime.current = currentTime;
        }

        touchStart.current = null;
      };

      el.addEventListener('touchstart', handleTouchStart, { passive: false });
      el.addEventListener('touchmove', handleTouchMove, { passive: true });
      el.addEventListener('touchend', handleTouchEnd, { passive: true });

      return () => {
        el.removeEventListener('touchstart', handleTouchStart);
        el.removeEventListener('touchmove', handleTouchMove);
        el.removeEventListener('touchend', handleTouchEnd);
        
        if (doubleTapTimeout.current) clearTimeout(doubleTapTimeout.current);
        if (longPressTimeout.current) clearTimeout(longPressTimeout.current);
      };
    }, [element, callbacks, isMobile, triggerHaptic]);
  }, [isMobile, triggerHaptic]);

  // Pull-to-refresh pattern
  const usePullToRefresh = useCallback((
    element: React.RefObject<HTMLElement>,
    onRefresh: () => Promise<void>,
    threshold: number = 80
  ) => {
    const [isPulling, setIsPulling] = useState(false);
    const [pullDistance, setPullDistance] = useState(0);
    const startY = useRef(0);
    const currentY = useRef(0);

    useEffect(() => {
      const el = element.current;
      if (!el || !isMobile) return;

      const handleTouchStart = (e: TouchEvent) => {
        if (el.scrollTop === 0) {
          startY.current = e.touches[0].clientY;
          setIsPulling(false);
        }
      };

      const handleTouchMove = (e: TouchEvent) => {
        if (startY.current === 0) return;
        
        currentY.current = e.touches[0].clientY;
        const deltaY = currentY.current - startY.current;

        if (deltaY > 0 && el.scrollTop === 0) {
          e.preventDefault();
          const distance = Math.min(deltaY * 0.5, threshold * 1.2);
          setPullDistance(distance);
          setIsPulling(distance > 20);
        }
      };

      const handleTouchEnd = async () => {
        if (pullDistance > threshold) {
          triggerHaptic('medium');
          try {
            await onRefresh();
          } finally {
            setPullDistance(0);
            setIsPulling(false);
          }
        } else {
          setPullDistance(0);
          setIsPulling(false);
        }
        startY.current = 0;
      };

      el.addEventListener('touchstart', handleTouchStart, { passive: true });
      el.addEventListener('touchmove', handleTouchMove, { passive: false });
      el.addEventListener('touchend', handleTouchEnd, { passive: true });

      return () => {
        el.removeEventListener('touchstart', handleTouchStart);
        el.removeEventListener('touchmove', handleTouchMove);
        el.removeEventListener('touchend', handleTouchEnd);
      };
    }, [element, onRefresh, threshold, pullDistance, isMobile, triggerHaptic]);

    return { isPulling, pullDistance };
  }, [isMobile, triggerHaptic]);

  // Safe area utilities for iOS
  const getSafeAreaInsets = useCallback(() => {
    if (!isIOS) return { top: 0, bottom: 0, left: 0, right: 0 };

    const safeAreaTop = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sat') || '0');
    const safeAreaBottom = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sab') || '0');
    const safeAreaLeft = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sal') || '0');
    const safeAreaRight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sar') || '0');

    return {
      top: safeAreaTop,
      bottom: safeAreaBottom,
      left: safeAreaLeft,
      right: safeAreaRight
    };
  }, [isIOS]);

  // Optimize touch targets for mobile
  const getTouchTargetProps = useCallback((size: 'small' | 'medium' | 'large' = 'medium') => {
    const sizes = {
      small: 'min-w-[44px] min-h-[44px] p-2',
      medium: 'min-w-[48px] min-h-[48px] p-3',
      large: 'min-w-[56px] min-h-[56px] p-4'
    };

    return {
      className: `${sizes[size]} touch-manipulation select-none`,
      style: { WebkitTapHighlightColor: 'transparent' }
    };
  }, []);

  return {
    isMobile,
    isIOS,
    triggerHaptic,
    useTouchGesture,
    usePullToRefresh,
    getSafeAreaInsets,
    getTouchTargetProps
  };
}

// Viewport utilities
export function useViewportSize() {
  const [viewport, setViewport] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
    isMobile: false,
    isTablet: false,
    isDesktop: false
  });

  useEffect(() => {
    const updateViewport = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setViewport({
        width,
        height,
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024
      });
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);
    window.addEventListener('orientationchange', updateViewport);

    return () => {
      window.removeEventListener('resize', updateViewport);
      window.removeEventListener('orientationchange', updateViewport);
    };
  }, []);

  return viewport;
}

// Network-aware loading
export function useNetworkAwareLoading() {
  const [connectionType, setConnectionType] = useState<string>('unknown');
  const [isSlowConnection, setIsSlowConnection] = useState(false);

  useEffect(() => {
    const connection = (navigator as any)?.connection;
    if (!connection) return;

    const updateConnection = () => {
      setConnectionType(connection.effectiveType || 'unknown');
      setIsSlowConnection(connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g');
    };

    updateConnection();
    connection.addEventListener('change', updateConnection);

    return () => {
      connection.removeEventListener('change', updateConnection);
    };
  }, []);

  return {
    connectionType,
    isSlowConnection,
    shouldReduceQuality: isSlowConnection,
    shouldPreload: !isSlowConnection
  };
}