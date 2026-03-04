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
        sidebar: "var(--color-sidebar)",
        accent: "var(--color-accent)",
        app: "var(--color-bg)",
        "app-secondary": "var(--color-bg-secondary)",
        card: "var(--color-card)",
        "app-text": "var(--color-text)",
        "text-on-dark": "var(--color-text-on-dark)",
        muted: "var(--color-text-muted)",
        border: "var(--color-border)",
        "success-bg": "var(--color-success-bg)",
        "success-text": "var(--color-success-text)",
        "error-bg": "var(--color-error-bg)",
        "error-text": "var(--color-error-text)",
        "sidebar-muted": "var(--color-sidebar-muted)",
        input: "var(--color-input)",
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
