/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/App.css"
  ],
  theme: {
    extend: {
      colors: {
        primary_color: 'var(--primary-color)',
        white_text: 'var(--white-text)'
      },
      backgroundColor: {
        navbar: 'var(--navbar-bg)',
      },
    },
  },
  plugins: [],
  important: true
}