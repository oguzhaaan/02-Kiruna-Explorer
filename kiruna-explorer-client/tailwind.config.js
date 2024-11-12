/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'selector',
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      colors: {
        selectedPage: "rgba(217,217,217,0.34)",
        text_gray: "#B7B7B7",
        customGray: "#D9D9D9",
        primary_color_light: "#99cae9",
        primary_color_dark: "#315f78",
        customBlue: "#4388B2",
        customPill: "#14405b",
        customGray1: '#686868',
        customGray2: '#313131',
        customGray3: '#D9D9D9',
        customGray3_30: 'rgba(217, 217, 217, 0.3)',
        primary_color: 'var(--primary-color)',
        search_dark_color: 'var(--search-dark-color)',
        search_light_color: 'var(--search-light-color)',
        box_color: 'var(--box-gray-color)',
        box_white_color: 'var(--box-white-color)',
        background_color: 'var(--background-color)',
        background_color_light: 'var(--background-color-light)',
        input_color_dark: 'var(--input-color-dark)',
        input_color_light: 'var(--input-color-light)',
        placeholder_color: 'var(--placeholder-input-color)',
        white_text: 'var(--white-text)',
        black_text: 'var(--black-text)',
        my_green: 'var(--my-green)',
        my_red: 'var(--my-red)',
        my_orange: 'var(--my-orange)',
        box_high_opacity: 'var(--box-high-opacity)'
      },
      backgroundImage: {
        document_item_radient_grey: 'var(--document-item-gradient-grey)',
        document_item_radient_blue: "var(--document-item-gradient-blue)",
      },
      backgroundColor: {
        navbar: 'var(--navbar-bg)',
        navbar_light: 'var(--navbar-bg-light)'
      },
    },
  },
  plugins: [],
  important: true
}
