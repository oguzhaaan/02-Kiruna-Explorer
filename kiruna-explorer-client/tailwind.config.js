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
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        ".scrollbar-thin": {
          scrollbarWidth: "thin", // Per Firefox
          scrollbarColor: "rgb(31, 29, 29) white", // Per Firefox
        },
        ".scrollbar-webkit": {
          "&::-webkit-scrollbar": {
            width: "8px", // Larghezza della scrollbar
          },
          "&::-webkit-scrollbar-track": {
            background: "black", // Colore del binario
          },
          "&::-webkit-scrollbar-thumb": {
            background: "rgb(31, 41, 55)", // Colore del manico
            borderRadius: "20px", // Raggio degli angoli del manico
            border: "1px solid white" // Bordo del manico
          }
        }
      }
      addUtilities(newUtilities, ["responsive", "hover"]);
    }
  ],
}
