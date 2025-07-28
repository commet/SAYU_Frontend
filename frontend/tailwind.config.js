/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			white: '#FFFFFF',
  			'off-white': '#FAFAFA',
  			'light-gray': '#F5F5F5',
  			gray: '#E0E0E0',
  			'dark-gray': '#616161',
  			black: '#212121',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				light: '#8B7BAB',
  				dark: '#4B3B75',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			success: '#4CAF50',
  			error: '#F44336',
  			warning: '#FF9800',
  			sayu: {
  				amber: '#FBB040',
  				rose: '#F15A5A',
  				stone: '#78716C',
  				ivory: '#FAFAF8',
  				charcoal: '#2C2C2C'
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			ring: 'hsl(var(--ring))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			input: 'hsl(var(--input))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		fontFamily: {
  			display: [
  				'Playfair Display',
  				'Noto Serif KR',
  				'serif'
  			],
  			body: [
  				'-apple-system',
  				'BlinkMacSystemFont',
  				'Pretendard',
  				'Inter',
  				'sans-serif'
  			],
  			playfair: [
  				'Playfair Display',
  				'serif'
  			],
  			inter: [
  				'Inter',
  				'sans-serif'
  			]
  		},
  		fontSize: {
  			xs: [
  				'0.75rem',
  				{
  					lineHeight: '1.5'
  				}
  			],
  			sm: [
  				'0.875rem',
  				{
  					lineHeight: '1.5'
  				}
  			],
  			base: [
  				'1rem',
  				{
  					lineHeight: '1.5'
  				}
  			],
  			lg: [
  				'1.125rem',
  				{
  					lineHeight: '1.5'
  				}
  			],
  			xl: [
  				'1.5rem',
  				{
  					lineHeight: '1.25'
  				}
  			],
  			'2xl': [
  				'2rem',
  				{
  					lineHeight: '1.25'
  				}
  			],
  			'3xl': [
  				'2.5rem',
  				{
  					lineHeight: '1.25'
  				}
  			]
  		},
  		spacing: {
  			xs: '0.5rem',
  			sm: '1rem',
  			md: '1.5rem',
  			lg: '2rem',
  			xl: '3rem',
  			'2xl': '4rem',
  			'3xl': '6rem'
  		},
  		borderRadius: {
  			xs: '4px',
  			sm: 'calc(var(--radius) - 4px)',
  			md: 'calc(var(--radius) - 2px)',
  			lg: 'var(--radius)',
  			xl: '24px',
  			sayu: '12px',
  			'sayu-lg': '20px'
  		},
  		boxShadow: {
  			subtle: '0 1px 3px rgba(0, 0, 0, 0.05)',
  			gentle: '0 4px 12px rgba(0, 0, 0, 0.08)',
  			moderate: '0 8px 24px rgba(0, 0, 0, 0.12)',
  			emphasis: '0 16px 40px rgba(0, 0, 0, 0.16)',
  			sayu: '0 4px 16px rgba(0, 0, 0, 0.1)',
  			'sayu-lg': '0 8px 32px rgba(0, 0, 0, 0.15)'
  		},
  		transitionDuration: {
  			fast: '150ms',
  			base: '300ms',
  			slow: '500ms'
  		},
  		transitionTimingFunction: {
  			gallery: 'cubic-bezier(0.39, 0.575, 0.565, 1)'
  		},
  		backdropBlur: {
  			subtle: '4px',
  			moderate: '8px',
  			strong: '16px'
  		},
  		zIndex: {
  			dropdown: '10',
  			sticky: '20',
  			overlay: '30',
  			modal: '40',
  			tooltip: '50'
  		},
  		extend: {}
  	}
  },
  plugins: [
    // 3D 변환을 위한 플러그인
    function({ addUtilities }) {
      const newUtilities = {
        '.preserve-3d': {
          transformStyle: 'preserve-3d',
        },
        '.backface-hidden': {
          backfaceVisibility: 'hidden',
        },
        '.rotate-y-180': {
          transform: 'rotateY(180deg)',
        },
      }
      addUtilities(newUtilities)
    },
      require("tailwindcss-animate")
],
}