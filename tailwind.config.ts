import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        christmas: {
          red: "#C41E3A",
          darkred: "#8B0000",
          green: "#165B33",
          darkgreen: "#146B3A",
          gold: "#F8B229",
          cream: "#F8F5F0",
          snow: "#F0F4F8",
        },
      },
      keyframes: {
        snow: {
          "0%": { transform: "translateY(-10px) translateX(0)", opacity: "1" },
          "100%": { transform: "translateY(100vh) translateX(20px)", opacity: "0.2" },
        },
        twinkle: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.4", transform: "scale(0.85)" },
        },
      },
      animation: {
        snow: "snow 10s linear infinite",
        twinkle: "twinkle 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
