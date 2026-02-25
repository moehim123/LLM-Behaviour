/** @type {import('tailwindcss').Config} */

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      
      boxShadow: {
        knob: "4px 4px 8px rgba(0,0,0,0.08), -4px -4px 8px rgba(255,255,255,0.10), inset 1px 1px 3px rgba(255,255,255,0.08)",
      },
      fontFamily: {
      sans: ["Mona Sans", "sans-serif"],
     },
      colors: {
        brand: {
          orange: "#EC7E23",
          orangeLight: "#FFF3E9",
        },

        ui: {
          black: "#1E1E1E",
          grey: "rgba(30,30,30,0.59)",
          params: "#7A7775", 
          runBg:"#F9F9F9", 

          sidebarCard: "#FAF8F7",
          quotedBg: "#ECECEC",
          backgroundGrey: "#FCFCFC",
        },
      },
    },
  },
  plugins: [],
};