import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "#0A0A0A",
          light: "#FAFAFA",
          card: "#141414",
          "card-hover": "#1C1C1C",
          border: "#262626",
        },
        /* Monochrome brand tokens: all accents resolve to white/gray */
        brand: {
          violet: "#FFFFFF",
          purple: "#E4E4E7",
          cyan: "#FFFFFF",
          blue: "#FFFFFF",
          pink: "#E4E4E7",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
        heading: ["var(--font-space-grotesk)", "Space Grotesk", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "wave-bar": "waveBar 1.2s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        waveBar: {
          "0%, 100%": { height: "20%" },
          "50%": { height: "100%" },
        },
        glow: {
          "from": { boxShadow: "0 0 10px rgba(255, 255, 255, 0.15), 0 0 20px rgba(255, 255, 255, 0.1)" },
          "to": { boxShadow: "0 0 25px rgba(255, 255, 255, 0.3), 0 0 40px rgba(255, 255, 255, 0.2)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
