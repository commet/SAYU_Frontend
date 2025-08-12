/**
 * SAYU 모바일 동적 스케일링 시스템
 * 360px 기준으로 화면 크기에 비례하여 자동 확대
 * 데스크톱(768px 이상)은 영향받지 않음
 */

import { useState, useEffect } from 'react';

// 모바일 브레이크포인트
const MOBILE_BREAKPOINT = 768;
const BASE_WIDTH = 360;  // Samsung Galaxy 기준
const MAX_SCALE = 1.145; // 412px/360px = 1.144

/**
 * 모바일 동적 스케일링 훅
 * 360px 기준으로 설계된 UI를 390px(iPhone), 412px(큰 안드로이드)에서 자동 확대
 */
export function useMobileScale() {
  const [scale, setScale] = useState({
    factor: 1,
    width: 360,
    isMobile: false,
    // 스케일링된 값들
    spacing: {
      xs: 4,   // 4px → 4.6px
      sm: 8,   // 8px → 9.2px
      md: 16,  // 16px → 18.3px
      lg: 24,  // 24px → 27.5px
      xl: 32,  // 32px → 36.6px
    },
    fontSize: {
      xs: 12,  // 12px → 13.7px
      sm: 14,  // 14px → 16px
      base: 16, // 16px → 18.3px
      lg: 18,  // 18px → 20.6px
      xl: 24,  // 24px → 27.5px
      '2xl': 32, // 32px → 36.6px
      '3xl': 36, // 36px → 41.2px
    },
    touchTarget: 44, // 최소 터치 영역
    // 컴포넌트별 크기
    components: {
      artworkSmall: { width: 80, height: 96 },  // w-20 h-24 대체
      artworkMedium: { width: 112, height: 144 }, // w-28 h-36 대체
      avatar: { width: 80, height: 80 }, // w-20 h-20 대체
      button: { paddingX: 16, paddingY: 12, minHeight: 44 },
      card: { padding: 16, gap: 12 },
    }
  });

  useEffect(() => {
    const calculateScale = () => {
      const width = window.innerWidth;
      const isMobile = width < MOBILE_BREAKPOINT;
      
      // 데스크톱은 스케일링 안 함
      if (!isMobile) {
        setScale(prev => ({ ...prev, factor: 1, width, isMobile: false }));
        return;
      }

      // 360px 기준으로 비율 계산
      const scaleFactor = Math.min(Math.max(width / BASE_WIDTH, 1), MAX_SCALE);
      
      setScale({
        factor: scaleFactor,
        width,
        isMobile: true,
        spacing: {
          xs: Math.round(4 * scaleFactor),
          sm: Math.round(8 * scaleFactor),
          md: Math.round(16 * scaleFactor),
          lg: Math.round(24 * scaleFactor),
          xl: Math.round(32 * scaleFactor),
        },
        fontSize: {
          xs: Math.round(12 * scaleFactor),
          sm: Math.round(14 * scaleFactor),
          base: Math.round(16 * scaleFactor),
          lg: Math.round(18 * scaleFactor),
          xl: Math.round(24 * scaleFactor),
          '2xl': Math.round(32 * scaleFactor),
          '3xl': Math.round(36 * scaleFactor),
        },
        touchTarget: Math.max(44, Math.round(44 * scaleFactor)),
        components: {
          artworkSmall: { 
            width: Math.round(80 * scaleFactor), 
            height: Math.round(96 * scaleFactor) 
          },
          artworkMedium: { 
            width: Math.round(112 * scaleFactor), 
            height: Math.round(144 * scaleFactor) 
          },
          avatar: { 
            width: Math.round(80 * scaleFactor), 
            height: Math.round(80 * scaleFactor) 
          },
          button: { 
            paddingX: Math.round(16 * scaleFactor), 
            paddingY: Math.round(12 * scaleFactor),
            minHeight: Math.max(44, Math.round(44 * scaleFactor))
          },
          card: { 
            padding: Math.round(16 * scaleFactor), 
            gap: Math.round(12 * scaleFactor) 
          },
        }
      });
    };

    calculateScale();
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, []);

  return scale;
}

/**
 * 모바일 뷰포트 단위 계산
 * 360px 기준 vw 단위로 변환, 최대값 제한 가능
 */
export function mobileVw(pixels: number, maxPixels?: number): string {
  const vwValue = (pixels / BASE_WIDTH) * 100;
  
  if (maxPixels) {
    return `min(${vwValue.toFixed(2)}vw, ${maxPixels}px)`;
  }
  
  return `${vwValue.toFixed(2)}vw`;
}

/**
 * 모바일 clamp 값 생성
 * 최소값, 선호값(vw), 최대값 설정
 */
export function mobileClamp(min: number, preferred: number, max: number): string {
  const vwValue = (preferred / BASE_WIDTH) * 100;
  return `clamp(${min}px, ${vwValue.toFixed(2)}vw, ${max}px)`;
}

/**
 * 안전한 모바일 스타일 적용
 * 데스크톱에서는 빈 객체 반환
 */
export function getMobileStyles(baseStyles: Record<string, any>) {
  const width = typeof window !== 'undefined' ? window.innerWidth : MOBILE_BREAKPOINT;
  
  // 데스크톱은 스타일 적용 안 함
  if (width >= MOBILE_BREAKPOINT) {
    return {};
  }
  
  const scaleFactor = Math.min(Math.max(width / BASE_WIDTH, 1), MAX_SCALE);
  const scaledStyles: Record<string, any> = {};
  
  Object.entries(baseStyles).forEach(([key, value]) => {
    if (typeof value === 'number' && (
      key.includes('padding') || 
      key.includes('margin') || 
      key.includes('gap') ||
      key.includes('fontSize') ||
      key.includes('width') ||
      key.includes('height') ||
      key.includes('size')
    )) {
      scaledStyles[key] = Math.round(value * scaleFactor);
    } else {
      scaledStyles[key] = value;
    }
  });
  
  return scaledStyles;
}

/**
 * Tailwind 클래스와 동적 스케일링 결합
 * 예: getMobileClasses('p-4', { padding: 16 })
 */
export function getMobileClasses(defaultClasses: string, mobileOverrides?: Record<string, number>) {
  const scale = typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT;
  
  if (!scale || !mobileOverrides) {
    return defaultClasses;
  }
  
  // 모바일에서만 인라인 스타일 적용
  return {
    className: `${defaultClasses} max-md:mobile-scaled`,
    style: getMobileStyles(mobileOverrides)
  };
}