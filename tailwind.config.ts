import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        sonar: {
          bg: "rgb(var(--sonar-bg) / <alpha-value>)",
          surface: "rgb(var(--sonar-surface) / <alpha-value>)",
          signal: "rgb(var(--sonar-signal) / <alpha-value>)",
          white: "rgb(var(--sonar-white) / <alpha-value>)",
          muted: "rgb(var(--sonar-muted) / <alpha-value>)",
          border: "var(--sonar-border)",
        }
      },
      fontFamily: {
        outfit: ["var(--font-outfit)", "sans-serif"],
        dmmono: ["var(--font-dm-mono)", "monospace"],
        futura: ['Futura', 'Century Gothic', 'Trebuchet MS', 'sans-serif'],
      },
      animation: {
        'sonar-ping': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      }
    },
  },
  plugins: [],
};
export default config;
