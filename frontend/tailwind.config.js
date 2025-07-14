/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Timeless Elegance Base Colors (95% usage)
        white: '#FFFFFF',
        'off-white': '#FAFAFA',
        'light-gray': '#F5F5F5',
        gray: '#E0E0E0',
        'dark-gray': '#616161',
        black: '#212121',
        
        // Primary Color (5% usage) 
        primary: {
          DEFAULT: '#6B5B95',
          light: '#8B7BAB',
          dark: '#4B3B75',
        },
        
        // Semantic Colors
        success: '#4CAF50',
        error: '#F44336',
        warning: '#FF9800',
        
        // Legacy SAYU colors (kept for compatibility)
        sayu: {
          amber: '#FBB040',
          rose: '#F15A5A',
          stone: '#78716C',
          ivory: '#FAFAF8',
          charcoal: '#2C2C2C'
        },
        
        // Shadcn/ui compatible colors
        background: 'var(--journey-background, #FAFAFA)',
        foreground: 'var(--journey-text, #212121)',
        muted: {
          DEFAULT: '#F5F5F5',
          foreground: '#616161',
        },
        border: '#E0E0E0',
        ring: '#6B5B95',
      },
      
      fontFamily: {
        display: ['Playfair Display', 'Noto Serif KR', 'serif'],
        body: ['-apple-system', 'BlinkMacSystemFont', 'Pretendard', 'Inter', 'sans-serif'],
        // Legacy aliases
        playfair: ['Playfair Display', 'serif'],
        inter: ['Inter', 'sans-serif'],
      },
      
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1.5' }],     // 12px
        sm: ['0.875rem', { lineHeight: '1.5' }],    // 14px  
        base: ['1rem', { lineHeight: '1.5' }],      // 16px
        lg: ['1.125rem', { lineHeight: '1.5' }],    // 18px
        xl: ['1.5rem', { lineHeight: '1.25' }],     // 24px
        '2xl': ['2rem', { lineHeight: '1.25' }],    // 32px
        '3xl': ['2.5rem', { lineHeight: '1.25' }],  // 40px
      },
      
      spacing: {
        xs: '0.5rem',   // 8px
        sm: '1rem',     // 16px
        md: '1.5rem',   // 24px
        lg: '2rem',     // 32px
        xl: '3rem',     // 48px
        '2xl': '4rem',  // 64px
        '3xl': '6rem',  // 96px
      },
      
      borderRadius: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        // Legacy aliases
        sayu: '12px',
        'sayu-lg': '20px',
      },
      
      boxShadow: {
        subtle: '0 1px 3px rgba(0, 0, 0, 0.05)',
        gentle: '0 4px 12px rgba(0, 0, 0, 0.08)',
        moderate: '0 8px 24px rgba(0, 0, 0, 0.12)',
        emphasis: '0 16px 40px rgba(0, 0, 0, 0.16)',
        // Legacy aliases
        sayu: '0 4px 16px rgba(0, 0, 0, 0.1)',
        'sayu-lg': '0 8px 32px rgba(0, 0, 0, 0.15)',
      },
      
      transitionDuration: {
        fast: '150ms',
        base: '300ms',
        slow: '500ms',
      },
      
      transitionTimingFunction: {
        gallery: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
      },
      
      backdropBlur: {
        subtle: '4px',
        moderate: '8px',
        strong: '16px',
      },
      
      zIndex: {
        dropdown: '10',
        sticky: '20',
        overlay: '30',
        modal: '40',
        tooltip: '50',
      },
    },
  },
  plugins: [],
}