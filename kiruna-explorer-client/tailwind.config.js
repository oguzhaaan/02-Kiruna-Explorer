/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      colors: {
        primary_color: "var(--primary-color)",
      },
      colors: {
        customGray: "#D9D9D9",
        customBlue: "#4388B2",
      },
    },
  },
  plugins: [],
};
