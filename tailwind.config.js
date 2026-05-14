/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class", // we use dark mode by default
  theme: {
    extend: {
      colors: {
        glass: "rgba(255, 255, 255, 0.08)",
        "glass-border": "rgba(255, 255, 255, 0.12)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
