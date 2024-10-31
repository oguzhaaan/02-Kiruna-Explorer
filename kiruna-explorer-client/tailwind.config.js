/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary_color: 'var(--primary-color)',
        search_color: 'var(--search-gray-color)',
        box_color: 'var(--box-gray-color)',
        background_color: 'var(--background-color)',
        input_color: 'var(--input-color)',
        placeholder_color : 'var(--placeholder-input-color)'
      },
    },
  },
  plugins: [
  
  ]
}
