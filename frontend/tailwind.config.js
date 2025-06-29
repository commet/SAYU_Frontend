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
        // SAYU 전용 색상 팔레트
        sayu: {
          amber: '#FBB040',
          'amber-light': '#FFD700',
          'amber-dark': '#E6A030',
          rose: '#F15A5A',
          'rose-light': '#FF7A7A',
          'rose-dark': '#D14545',
          stone: '#78716C',
          'stone-light': '#A8A29E',
          'stone-dark': '#57534E',
          ivory: '#FAFAF8',
          charcoal: '#2C2C2C'
        },
        // 기본 semantic 색상 (shadcn/ui 대신)
        background: '#FAFAF8',
        foreground: '#2C2C2C',
        muted: '#F5F5F4',
        'muted-foreground': '#78716C',
        border: '#E7E5E4',
      },
      fontFamily: {
        'playfair': ['Playfair Display', 'serif'],
        'inter': ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'sayu': '12px',
        'sayu-lg': '20px',
      },
      boxShadow: {
        'sayu': '0 4px 16px rgba(0, 0, 0, 0.1)',
        'sayu-lg': '0 8px 32px rgba(0, 0, 0, 0.15)',
      }
    },
  },
  plugins: [],
}