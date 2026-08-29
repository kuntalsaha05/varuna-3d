/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ocean: {
          900: '#030b1e',
          800: '#071630',
          700: '#0e2448',
          500: '#0077b6',
          400: '#00b4d8',
          300: '#90e0ef'
        }
      }
    },
  },
  plugins: [],
}
