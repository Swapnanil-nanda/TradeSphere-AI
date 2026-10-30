/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#090d16',
        card: '#101726',
        border: '#1f293d',
        accent: '#2563eb',
        bullish: '#10b981',
        bearish: '#f43f5e'
      }
    },
  },
  plugins: [],
}
