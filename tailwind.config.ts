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
        brand: {
          brown: "#632413",
          cream: "#FADAAD",
          green: "#046A38",
          yellow: "#FFCD00",
          ink: "#2B211C",
          paper: "#FFF9F0",
          mist: "#F4EBDD",
        },
      },
      boxShadow: {
        soft: "0 18px 45px rgba(99, 36, 19, 0.12)",
        card: "0 10px 30px rgba(43, 33, 28, 0.08)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      backgroundImage: {
        "brand-glow":
          "radial-gradient(circle at top right, rgba(250,218,173,.6), transparent 38%), linear-gradient(135deg, #fff9f0 0%, #f4ebdd 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
