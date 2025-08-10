import { useState, useEffect } from 'react';

/**
 * 반응형 디자인을 위한 유틸리티 함수 및 훅
 */

// 브레이크포인트 정의
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

/**
 * 미디어 쿼리 훅 - SSR 호환 버전
 */
export function useMediaQuery(query: string): boolean {
  // SSR을 위한 기본값 설정
  const getInitialValue = () => {
    if (typeof window === 'undefined') {
      return false;
    }
    return window.matchMedia(query).matches;
  };

  const [matches, setMatches] = useState(getInitialValue);

  useEffect(() => {
    // 클라이언트 사이드에서만 실행
    if (typeof window === 'undefined') {
      return;
    }

    const media = window.matchMedia(query);
    
    // 초기값 다시 설정 (hydration 후)
    setMatches(media.matches);

    // 리스너 함수
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // 이벤트 리스너 등록
    if (media.addEventListener) {
      media.addEventListener('change', listener);
    } else {
      // 구형 브라우저 지원
      media.addListener(listener);
    }

    // 클린업
    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', listener);
      } else {
        media.removeListener(listener);
      }
    };
  }, [query]);

  return matches;
}

/**
 * 반응형 상태를 반환하는 훅
 */
export function useResponsive() {
  const isMobile = useMediaQuery(`(max-width: ${breakpoints.md - 1}px)`);
  const isTablet = useMediaQuery(`(min-width: ${breakpoints.md}px) and (max-width: ${breakpoints.lg - 1}px)`);
  const isDesktop = useMediaQuery(`(min-width: ${breakpoints.lg}px)`);
  const isLargeDesktop = useMediaQuery(`(min-width: ${breakpoints.xl}px)`);

  return {
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    // 편의 메서드
    isMobileOrTablet: isMobile || isTablet,
    isTabletOrDesktop: isTablet || isDesktop,
  };
}

/**
 * 디바이스 타입 감지
 */
export function useDeviceType() {
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      if (width < breakpoints.md) {
        setDeviceType('mobile');
      } else if (width < breakpoints.lg) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);

    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return deviceType;
}

/**
 * 터치 디바이스 감지
 */
export function useTouchDevice() {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const checkTouch = () => {
      setIsTouch(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        // @ts-ignore
        navigator.msMaxTouchPoints > 0
      );
    };

    checkTouch();
  }, []);

  return isTouch;
}

/**
 * 화면 방향 감지
 */
export function useOrientation() {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  useEffect(() => {
    const checkOrientation = () => {
      setOrientation(
        window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
      );
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  return orientation;
}

/**
 * 뷰포트 크기 반환
 */
export function useViewport() {
  const [viewport, setViewport] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return viewport;
}

/**
 * 디바이스 성능 감지
 */
export function useDeviceCapabilities() {
  const [capabilities, setCapabilities] = useState({
    gpu: 'unknown' as 'low' | 'medium' | 'high' | 'unknown',
    memory: 4,
    connection: '4g' as '2g' | '3g' | '4g' | '5g' | 'unknown',
    saveData: false,
  });

  useEffect(() => {
    const checkCapabilities = async () => {
      // GPU 성능 체크
      let gpu: 'low' | 'medium' | 'high' | 'unknown' = 'unknown';
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (gl) {
          const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
          if (debugInfo) {
            const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            // 간단한 GPU 분류 (실제로는 더 정교한 로직 필요)
            if (renderer.includes('Intel')) gpu = 'low';
            else if (renderer.includes('AMD') || renderer.includes('NVIDIA')) gpu = 'high';
            else gpu = 'medium';
          }
        }
      } catch (e) {
        console.error('GPU detection failed:', e);
      }

      // 메모리 체크
      const memory = (navigator as any).deviceMemory || 4;

      // 네트워크 상태
      const connection = (navigator as any).connection;
      const effectiveType = connection?.effectiveType || '4g';
      const saveData = connection?.saveData || false;

      setCapabilities({
        gpu,
        memory,
        connection: effectiveType,
        saveData,
      });
    };

    checkCapabilities();
  }, []);

  return capabilities;
}

/**
 * 반응형 이미지 크기 계산
 */
export function getResponsiveImageSizes(defaultSize = '100vw') {
  return `(max-width: ${breakpoints.sm}px) 100vw, 
          (max-width: ${breakpoints.md}px) 80vw, 
          (max-width: ${breakpoints.lg}px) 50vw, 
          ${defaultSize}`;
}

/**
 * 조건부 클래스 이름 생성
 */
export function getResponsiveClassName(
  base: string,
  mobile?: string,
  tablet?: string,
  desktop?: string
) {
  return `${base} ${mobile ? `sm:${mobile}` : ''} ${tablet ? `md:${tablet}` : ''} ${desktop ? `lg:${desktop}` : ''}`.trim();
}

/**
 * 안전 영역 패딩 계산 (iOS notch 등)
 */
export function useSafeArea() {
  const [safeArea, setSafeArea] = useState({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  });

  useEffect(() => {
    const computeSafeArea = () => {
      const styles = getComputedStyle(document.documentElement);
      setSafeArea({
        top: parseInt(styles.getPropertyValue('--sat') || '0'),
        bottom: parseInt(styles.getPropertyValue('--sab') || '0'),
        left: parseInt(styles.getPropertyValue('--sal') || '0'),
        right: parseInt(styles.getPropertyValue('--sar') || '0'),
      });
    };

    // CSS 변수 설정
    document.documentElement.style.setProperty('--sat', 'env(safe-area-inset-top)');
    document.documentElement.style.setProperty('--sab', 'env(safe-area-inset-bottom)');
    document.documentElement.style.setProperty('--sal', 'env(safe-area-inset-left)');
    document.documentElement.style.setProperty('--sar', 'env(safe-area-inset-right)');

    computeSafeArea();
    window.addEventListener('resize', computeSafeArea);

    return () => window.removeEventListener('resize', computeSafeArea);
  }, []);

  return safeArea;
}