/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#080c14",
        surface: {
          50: "#1e293b",
          100: "#131b2e",
          200: "#0f172a",
          300: "#0b1120",
          card: "rgba(15, 23, 42, 0.75)",
          hover: "rgba(30, 41, 59, 0.85)",
          border: "rgba(51, 65, 85, 0.45)",
          borderGlow: "rgba(56, 189, 248, 0.3)",
        },
        navy: {
          900: "#060a12",
          800: "#0b1220",
          700: "#111c33",
          600: "#1e2e4f",
        },
        skyAccent: {
          light: "#38bdf8",
          DEFAULT: "#0284c7",
          dark: "#0369a1",
        },
        govBlue: {
          50: "#eff6ff",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
        statTeal: "#10b981",
        statAmber: "#f59e0b",
        statRed: "#f43f5e",
        statCyan: "#06b6d4",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "Menlo", "Courier New", "monospace"],
      },
      boxShadow: {
        glow: "0 0 25px -5px rgba(56, 189, 248, 0.25)",
        cyanGlow: "0 0 20px -3px rgba(6, 182, 212, 0.35)",
        panel: "0 10px 30px -10px rgba(0, 0, 0, 0.5)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
    },
  },
  plugins: [],
};
