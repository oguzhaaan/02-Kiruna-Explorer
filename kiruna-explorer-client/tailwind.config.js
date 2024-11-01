/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      colors: {
        customGray: "#D9D9D9",
        customBlue: "#4388B2",
        primary_color: 'var(--primary-color)',
        search_color: 'var(--search-gray-color)',
        box_color: 'var(--box-gray-color)',
        background_color: 'var(--background-color)',
        input_color: 'var(--input-color)',
        placeholder_color: 'var(--placeholder-input-color)',
        white_text: 'var(--white-text)',
        my_green: 'var(--my-green)',
        my_red: 'var(--my-red)',
        my_orange: 'var(--my-orange)'
      },
      backgroundColor: {
        navbar: 'var(--navbar-bg)',
      },
    },
  },
  plugins: [],
  important: true
}
