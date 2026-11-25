import containerQueries from '@tailwindcss/container-queries';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./frontend/index.html",
    "./frontend/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#eb4438',
          600: '#d9382d',
          700: '#b9281e',
          800: '#99221b',
          900: '#7f201a',
          950: '#450d09',
        },
        dark: {
          bg: '#212121',
          surface: '#2b2b2b',
          card: '#282828',
          border: '#383838',
          muted: '#9e9e9e',
        },
      },
    },
  },
  plugins: [containerQueries],
}
