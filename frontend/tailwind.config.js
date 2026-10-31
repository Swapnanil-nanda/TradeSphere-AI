/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#090D12',
        sidebar: '#0D131A',
        panel: '#111922',
        elevated: '#151F29',
        border: {
          DEFAULT: '#25313D',
          subtle: '#1C2631',
          strong: '#364554',
        },
        primary: {
          50: '#f0f5fa',
          100: '#e1ebf5',
          200: '#c5d8eb',
          300: '#9dbfde',
          400: '#6d9fce',
          500: '#2979FF',
          600: '#1c62db',
          700: '#174fb2',
          800: '#174391',
          900: '#183a75',
          DEFAULT: '#E7EDF3',
          muted: '#8B99A8',
        },
        bullish: {
          light: 'rgba(53, 198, 154, 0.15)',
          DEFAULT: '#35C69A',
          dark: '#279d79',
          border: 'rgba(53, 198, 154, 0.35)',
        },
        bearish: {
          light: 'rgba(239, 100, 104, 0.15)',
          DEFAULT: '#EF6468',
          dark: '#d43f43',
          border: 'rgba(239, 100, 104, 0.35)',
        },
        warning: {
          light: 'rgba(216, 171, 94, 0.15)',
          DEFAULT: '#D8AB5E',
          dark: '#b68e47',
          border: 'rgba(216, 171, 94, 0.35)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Geist', 'Plus Jakarta Sans', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['IBM Plex Mono', 'Geist Mono', 'JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        '2xs': ['10px', '13px'],
        'xs': ['11px', '15px'],
        'sm': ['12px', '16px'],
        'base': ['13px', '18px'],
        'md': ['14px', '20px'],
        'lg': ['16px', '22px'],
        'xl': ['20px', '26px'],
      },
    },
  },
  plugins: [],
}
