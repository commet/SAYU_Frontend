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
  			/* Rainbow Button Colors */
  			"color-1": "hsl(var(--color-1))",
  			"color-2": "hsl(var(--color-2))",
  			"color-3": "hsl(var(--color-3))",
  			"color-4": "hsl(var(--color-4))",
  			"color-5": "hsl(var(--color-5))",
  			/* SAYU 색상 조합 시스템 */
  			'warm-soft': {
  				'peach-breeze': 'rgb(245 217 196)',
  				'lavender-dream': 'rgb(186 152 212)',
  				'apricot-whisper': 'rgb(244 207 163)',
  				'tangerine-zest': 'rgb(245 123 40)',
  				'peppermint-pink': 'rgb(246 198 194)',
  				'silent-night': 'rgb(98 112 159)',
  				'tea-rose': 'rgb(229 200 205)',
  				'fern-green': 'rgb(78 114 76)',
  			},
  			'calm-elegant': {
  				'sage': 'rgb(195 201 141)',
  				'dark-purple': 'rgb(49 36 62)',
  				'dusty-jupiter': 'rgb(64 85 75)',
  				'lime-cream': 'rgb(214 239 132)',
  				'dusty-mauve': 'rgb(119 107 117)',
  				'ivory-mist': 'rgb(240 237 233)',
  				'powder-blue': 'rgb(169 199 236)',
  				'urban-smoke': 'rgb(83 83 80)',
  			},
  			'vibrant-contrast': {
  				'match-point': 'rgb(218 222 85)',
  				'double-bounce': 'rgb(240 86 146)',
  				'soft-melon': 'rgb(246 207 181)',
  				'astral-blue': 'rgb(25 27 71)',
  				'ucla-blue': 'rgb(83 104 149)',
  				'pearl': 'rgb(219 218 190)',
  			},
  			/* shadcn 기본 색상 */
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
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
  		animation: {
  			rainbow: "rainbow var(--speed, 2s) infinite linear",
  		},
  		keyframes: {
  			rainbow: {
  				"0%": { "background-position": "0%" },
  				"100%": { "background-position": "200%" },
  			},
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