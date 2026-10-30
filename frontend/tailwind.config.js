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
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb', // Zerodha / institutional primary blue
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        bullish: {
          light: '#f0fdf4',
          DEFAULT: '#16a34a',
          dark: '#15803d',
          border: '#bbf7d0'
        },
        bearish: {
          light: '#fef2f2',
          DEFAULT: '#dc2626',
          dark: '#b91c1c',
          border: '#fecaca'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        '2xs': ['10px', '14px'],
        'xs': ['11px', '15px'],
        'sm': ['12px', '16px'],
        'base': ['13px', '18px'],
        'md': ['14px', '20px'],
        'lg': ['16px', '24px'],
      }
    },
  },
  plugins: [],
}
