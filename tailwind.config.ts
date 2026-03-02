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
        praksonar: {
          teal: "#425c59",
          gold: "#c99b33",
          mint: "#e4eeed",
          mintDark: "#e2eceb",
          white: "#ffffff",
        }
      },
      fontFamily: {
        sans: ['var(--font-league-spartan)', 'sans-serif'],
        mono: ["var(--font-dm-mono)", "monospace"],
      },
      animation: {
        'sonar-ping': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      }
    },
  },
  plugins: [],
};
export default config;
