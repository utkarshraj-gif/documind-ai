import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#FBFBFA",
        surface: {
          DEFAULT: "#FFFFFF",
          subtle: "#F5F5F2",
          muted: "#EEEEEC",
        },
        border: {
          DEFAULT: "#E5E5DF",
          subtle: "#ECECE8",
          dark: "#D4D4CE",
        },
        ink: {
          DEFAULT: "#1C1917",
          secondary: "#57534E",
          muted: "#858079",
          faint: "#A8A29E",
        },
        accent: {
          DEFAULT: "#C2410C", // Warm terracotta / evidence ember
          hover: "#9A3412",
          subtle: "#FFEDD5",
          faint: "#FFF7ED",
        },
        evidence: {
          highlight: "#FEF08A", // Grounded text highlight
          active: "#FDE047",
        },
      },
      fontFamily: {
        serif: ["Georgia", "Newsreader", "Playfair Display", "serif"],
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgba(28, 25, 23, 0.05)",
        card: "0 1px 3px 0 rgba(28, 25, 23, 0.06), 0 1px 2px -1px rgba(28, 25, 23, 0.04)",
        dropdown: "0 4px 12px 0 rgba(28, 25, 23, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
