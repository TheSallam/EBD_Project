/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class", // <--- THIS WAS MISSING. ADD IT HERE.
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
    "./src/pages/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};