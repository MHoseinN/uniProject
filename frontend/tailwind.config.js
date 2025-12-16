/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1a5d3a',
          dark: '#0f3d25',
          light: '#2a7d4a',
        },
        secondary: {
          DEFAULT: '#ff9800',
          dark: '#e68900',
          light: '#ffad33',
        },
        dark: '#1a1a1a',
        light: '#f5f5f5',
      },
      fontFamily: {
        sans: ['Vazirmatn', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
