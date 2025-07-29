// SAYU Design System
// 중앙 집중식 디자인 토큰 관리

export const sayuColors = {
  // 주요 브랜드 색상
  primary: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444', // 메인 레드
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d'
  },
  
  // APT 동물별 시그니처 색상 (16가지)
  aptColors: {
    'INFP_호랑이': { primary: '#FF6B6B', secondary: '#FFE66D', accent: '#4ECDC4' },
    'ENFJ_돌고래': { primary: '#4ECDC4', secondary: '#95E1D3', accent: '#F38181' },
    'INTJ_올빼미': { primary: '#845EC2', secondary: '#D65DB1', accent: '#FF6F91' },
    'ENTP_원숭이': { primary: '#FFC75F', secondary: '#F9F871', accent: '#845EC2' },
    'ISFJ_코끼리': { primary: '#4E8397', secondary: '#82C0CC', accent: '#FFA69E' },
    'ESFP_나비': { primary: '#FF6B9D', secondary: '#FEC8D8', accent: '#FFDAB9' },
    'INFJ_늑대': { primary: '#667EEA', secondary: '#764BA2', accent: '#F093FB' },
    'ENFP_강아지': { primary: '#F7B731', secondary: '#5F27CD', accent: '#00D2D3' },
    'ISTJ_곰': { primary: '#6C5B7B', secondary: '#C06C84', accent: '#F8B195' },
    'ESTP_치타': { primary: '#EB3B5A', secondary: '#FC5C65', accent: '#FD79A8' },
    'INTP_부엉이': { primary: '#4B7BEC', secondary: '#5F3DC4', accent: '#364F6B' },
    'ESFJ_펭귄': { primary: '#26DE81', secondary: '#A8E6CF', accent: '#FFD3B6' },
    'ISTP_고양이': { primary: '#778BEB', secondary: '#786FA6', accent: '#63CDDA' },
    'ENFJ_사슴': { primary: '#F19066', secondary: '#F5CD79', accent: '#546DE5' },
    'ISFP_여우': { primary: '#E77F67', secondary: '#F8B500', accent: '#3C6382' },
    'ESTJ_독수리': { primary: '#596275', secondary: '#303952', accent: '#E15F41' }
  },
  
  // 감정 상태 색상
  emotions: {
    curious: '#FFD93D',      // 밝은 노랑
    peaceful: '#6BCF7F',     // 부드러운 초록
    nostalgic: '#B197FC',    // 연한 보라
    inspired: '#FF6B9D',     // 생동감 있는 핑크
    contemplative: '#5EB3FA', // 차분한 파랑
    energetic: '#FF6348',    // 활기찬 주황
    melancholic: '#786FA6',  // 우울한 보라회색
    hopeful: '#7BED9F'       // 희망적인 민트
  },
  
  // 중성 색상
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717'
  }
};

export const typography = {
  // 폰트 패밀리
  fontFamily: {
    heading: "'Pretendard Variable', 'Noto Serif KR', serif",
    body: "'Pretendard', 'Noto Sans KR', sans-serif",
    mono: "'JetBrains Mono', 'Noto Sans Mono', monospace"
  },
  
  // 폰트 사이즈
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem',// 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
    '6xl': '3.75rem', // 60px
    '7xl': '4.5rem',  // 72px
  },
  
  // 폰트 웨이트
  fontWeight: {
    thin: 100,
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900
  },
  
  // 라인 높이
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 1.75,
    body: 1.7
  },
  
  // 자간
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em'
  }
};

export const spacing = {
  0: '0px',
  px: '1px',
  0.5: '0.125rem',  // 2px
  1: '0.25rem',     // 4px
  1.5: '0.375rem',  // 6px
  2: '0.5rem',      // 8px
  2.5: '0.625rem',  // 10px
  3: '0.75rem',     // 12px
  3.5: '0.875rem',  // 14px
  4: '1rem',        // 16px
  5: '1.25rem',     // 20px
  6: '1.5rem',      // 24px
  7: '1.75rem',     // 28px
  8: '2rem',        // 32px
  9: '2.25rem',     // 36px
  10: '2.5rem',     // 40px
  11: '2.75rem',    // 44px
  12: '3rem',       // 48px
  14: '3.5rem',     // 56px
  16: '4rem',       // 64px
  20: '5rem',       // 80px
  24: '6rem',       // 96px
  28: '7rem',       // 112px
  32: '8rem',       // 128px
  36: '9rem',       // 144px
  40: '10rem',      // 160px
  44: '11rem',      // 176px
  48: '12rem',      // 192px
  52: '13rem',      // 208px
  56: '14rem',      // 224px
  60: '15rem',      // 240px
  64: '16rem',      // 256px
  72: '18rem',      // 288px
  80: '20rem',      // 320px
  96: '24rem'       // 384px
};

export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  base: '0.25rem',  // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px'
};

export const boxShadow = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  none: 'none',
  // 커스텀 아트 섀도우
  artCard: '0 4px 20px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)',
  artCardHover: '0 8px 30px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.06)',
  glow: '0 0 20px rgba(239, 68, 68, 0.3)',
  glowStrong: '0 0 40px rgba(239, 68, 68, 0.5)'
};

export const animation = {
  duration: {
    instant: '0ms',
    fast: '150ms',
    base: '300ms',
    slow: '500ms',
    slower: '700ms',
    slowest: '1000ms'
  },
  
  easing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
  }
};

export const breakpoints = {
  xs: '475px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
};

// 컴포넌트별 기본 스타일
export const componentStyles = {
  card: {
    base: {
      borderRadius: borderRadius.xl,
      boxShadow: boxShadow.artCard,
      transition: `all ${animation.duration.base} ${animation.easing.easeOut}`,
      '&:hover': {
        boxShadow: boxShadow.artCardHover,
        transform: 'translateY(-2px)'
      }
    }
  },
  
  button: {
    base: {
      borderRadius: borderRadius.lg,
      fontWeight: typography.fontWeight.medium,
      transition: `all ${animation.duration.fast} ${animation.easing.easeOut}`,
      '&:active': {
        transform: 'scale(0.98)'
      }
    },
    sizes: {
      sm: {
        padding: `${spacing[1.5]} ${spacing[3]}`,
        fontSize: typography.fontSize.sm
      },
      md: {
        padding: `${spacing[2]} ${spacing[4]}`,
        fontSize: typography.fontSize.base
      },
      lg: {
        padding: `${spacing[3]} ${spacing[6]}`,
        fontSize: typography.fontSize.lg
      }
    }
  }
};

// 유틸리티 함수
export const getAPTTheme = (typeCode: string) => {
  const theme = sayuColors.aptColors[typeCode];
  if (!theme) {
    return sayuColors.aptColors['INFP_호랑이']; // 기본값
  }
  return theme;
};

export const getEmotionColor = (emotion: string) => {
  return sayuColors.emotions[emotion.toLowerCase()] || sayuColors.emotions.curious;
};

// 다크모드 대응
export const getDarkModeValue = (lightValue: string, darkValue: string) => {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? darkValue : lightValue;
  }
  return lightValue;
};