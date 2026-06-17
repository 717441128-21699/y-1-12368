/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0f5fa",
          100: "#dae6f1",
          200: "#b5cde3",
          300: "#84aed0",
          400: "#4d87b8",
          500: "#3182ce",
          600: "#2c6aa1",
          700: "#1e3a5f",
          800: "#183152",
          900: "#162a45",
          950: "#0f1d2f",
        },
        warning: {
          50: "#fff5eb",
          100: "#ffe6cc",
          200: "#ffc999",
          300: "#ffa55c",
          400: "#ff7a1a",
          500: "#dd6b20",
          600: "#c05621",
          700: "#9c4221",
        },
        danger: {
          50: "#fff5f5",
          100: "#fed7d7",
          200: "#feb2b2",
          300: "#fc8181",
          400: "#f56565",
          500: "#e53e3e",
          600: "#c53030",
          700: "#9b2c2c",
        },
        success: {
          50: "#f0fff4",
          100: "#c6f6d5",
          200: "#9ae6b4",
          300: "#68d391",
          400: "#48bb78",
          500: "#38a169",
          600: "#2f855a",
          700: "#276749",
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', "serif"],
        sans: ['"Noto Sans SC"', "system-ui", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "breathing": "breathing 2s ease-in-out infinite",
      },
      keyframes: {
        breathing: {
          "0%, 100%": { opacity: "1", boxShadow: "0 0 0 0 rgba(229, 62, 62, 0.4)" },
          "50%": { opacity: "0.8", boxShadow: "0 0 0 12px rgba(229, 62, 62, 0)" },
        },
      },
    },
  },
  plugins: [],
};
