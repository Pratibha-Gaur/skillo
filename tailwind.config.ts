import forms from "@tailwindcss/forms";
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "var(--canvas)",
        surface: "var(--surface)",
        ink: "var(--ink)",
        muted: "var(--muted)",
        line: "var(--line)",
        brand: {
          DEFAULT: "var(--brand)",
          dark: "var(--brand-dark)",
          soft: "var(--brand-soft)",
        },
        coral: "var(--coral)",
        sun: "var(--sun)",
        sky: "var(--sky)",
      },
      fontFamily: {
        sans: ["Manrope Variable", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Newsreader Variable", "Georgia", "serif"],
      },
      boxShadow: {
        soft: "0 12px 32px rgba(31, 46, 38, 0.08)",
        lift: "0 18px 45px rgba(31, 46, 38, 0.12)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.35rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "check-in": {
          "0%": { transform: "scale(0.7)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fade-up 420ms ease-out both",
        "check-in": "check-in 280ms ease-out both",
      },
    },
  },
  plugins: [forms],
};

export default config;
