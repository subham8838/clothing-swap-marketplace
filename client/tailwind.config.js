/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        moss: { 50: '#F3F5EE', 100: '#E7ECDC', 500: '#5C6B4F', 600: '#3F4A37' },
        pine: { DEFAULT: '#1F3A34', 700: '#16302A', 900: '#0D1F1B' },
        clay: { DEFAULT: '#C98A2C', 600: '#B37723', 700: '#8F5F1B' },
        thread: '#D6483B',
        ink: '#20241F',
        paper: '#F7F6F1',
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        body: ['"Work Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        stitch: "repeating-linear-gradient(90deg, currentColor 0, currentColor 6px, transparent 6px, transparent 12px)",
      },
    },
  },
  plugins: [],
};
