/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#FFFFFF",
        card: "#FAFAFA",
        ink: "#2D3436",
        muted: "#636E72",
        line: "#E0E0E0",
        chip: "#2D3436",
        sand: "#F5F5F5",
      },
      fontFamily: {
        display: [
          "Sora",
          "-apple-system",
          "Segoe UI",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        body: [
          "Inter",
          "-apple-system",
          "Segoe UI",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        roadrage: [
          "RoadRage",
          "Sora",
          "-apple-system",
          "Segoe UI",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
      borderRadius: {
        xl2: "1.75rem",
      },
      boxShadow: {
        soft: "0 10px 30px -12px rgba(45,52,54,0.15)",
      },
    },
  },
  plugins: [],
};
