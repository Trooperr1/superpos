/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'kurdish-green': '#00843d',
        'kurdish-red': '#dc2626',
        'kurdish-gold': '#eab308',
      },
      fontFamily: {
        sans: ['Segoe UI', 'Tahoma', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
