/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0f",
        card: "rgba(30, 30, 45, 0.7)",
        accent: "#6366f1",
        secondary: "#a855f7",
        success: "#22c55e",
        danger: "#ef4444",
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
