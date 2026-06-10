import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        ipl: {
          csk: "#FDB913",
          mi: "#004BA0",
          rcb: "#EC1C24",
          dc: "#17479E",
          kkr: "#3A225D",
          pbks: "#ED1B24",
          rr: "#EA1A85",
          gt: "#1C1C1C",
          lsg: "#A72056",
          srh: "#FF822A",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-outfit)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "glow-pulse": {
          "0%, 100%": {
            boxShadow: "0 0 5px rgba(99, 102, 241, 0.3), 0 0 20px rgba(99, 102, 241, 0.1)",
          },
          "50%": {
            boxShadow: "0 0 20px rgba(99, 102, 241, 0.6), 0 0 60px rgba(99, 102, 241, 0.3)",
          },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "slide-up": {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.8)", opacity: "1" },
          "100%": { transform: "scale(2.4)", opacity: "0" },
        },
        "bid-flash": {
          "0%": { backgroundColor: "rgba(245, 158, 11, 0.3)" },
          "100%": { backgroundColor: "transparent" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
        "slide-up": "slide-up 0.5s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "spin-slow": "spin-slow 20s linear infinite",
        "pulse-ring": "pulse-ring 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite",
        "bid-flash": "bid-flash 0.6s ease-out",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "shimmer-gradient":
          "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
