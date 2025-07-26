import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // SAYU 디자인 시스템 색상 팔레트
        sayu: {
          // 따뜻하고 부드러운 조합
          'peach-breeze': '#F5D9C4',
          'lavender-dream': '#BA98D4',
          'apricot-whisper': '#F4CFA3',
          'tangerine-zest': '#F57B28',
          'peppermint-pink': '#F6C6C2',
          'silent-night': '#62709F',
          'tea-rose': '#E5C8CD',
          'fern-green': '#4E724C',
          
          // 차분하고 세련된 조합
          'sage': '#C3C98D',
          'dark-purple': '#31243E',
          'dusty-jupiter': '#40554B',
          'lime-cream': '#D6EF84',
          'dusty-mauve': '#776B75',
          'ivory-mist': '#F0EDE9',
          'powder-blue': '#A9C7EC',
          'urban-smoke': '#535350',
          
          // 대비가 강한 활기찬 조합
          'match-point': '#DADE55',
          'double-bounce': '#F05692',
          'soft-melon': '#F6CFB5',
          'astral-blue': '#191B47',
          'ucla-blue': '#536895',
          'pearl': '#DBDABE',
          
          // 배경색
          'bg-primary': '#F0EDE9',
          'bg-secondary': '#DBDABE',
          'bg-card': '#FAFAF8',
          
          // 텍스트 색상
          'text-primary': '#31243E',
          'text-secondary': '#535350',
          'text-muted': '#776B75',
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "1.5rem",
        "2xl": "2rem",
      },
      backdropBlur: {
        xs: "4px",
        sm: "8px",
        DEFAULT: "20px",
        lg: "30px",
        xl: "40px",
      },
      transitionTimingFunction: {
        "smooth": "cubic-bezier(0.4, 0, 0.2, 1)",
        "spring": "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        "elastic": "cubic-bezier(0.68, -0.6, 0.32, 1.6)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "float": "float 3s ease-in-out infinite",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
        "gradient-shift": "gradient-shift 6s ease infinite",
        "fade-in": "fade-in 0.5s ease-out",
        "slide-in": "slide-in 0.3s ease-out",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-primary": "var(--gradient-primary)",
        "gradient-accent": "var(--gradient-accent)",
        "gradient-subtle": "var(--gradient-subtle)",
        "gradient-hero": "var(--gradient-hero)",
      },
    },
  },
  plugins: [],
};

export default config;
