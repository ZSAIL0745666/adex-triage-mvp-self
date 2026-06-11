import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17202a",
        muted: "#657282",
        line: "#d9e1e8",
        field: "#f6f8fb",
        action: "#166534",
        accent: "#0f766e"
      },
      boxShadow: {
        soft: "0 24px 80px rgba(31, 41, 55, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
