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
        primary: {
          DEFAULT: "#667eea",
          dark: "#5568d3",
          light: "#7c8ff0",
        },
        secondary: {
          DEFAULT: "#764ba2",
          dark: "#5f3c82",
          light: "#8d5ab8",
        },
        accent: {
          DEFAULT: "#f6ad55",
          dark: "#dd8d36",
          light: "#f8c082",
        },
      },
      backgroundImage: {
        "gradient-hero": "linear-gradient(135deg, #4ECDC4 0%, #556FB5 100%)",
        "gradient-purple": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        "gradient-warm": "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
        "gradient-teal": "linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)",
        "gradient-pink": "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
        "gradient-orange": "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
        "gradient-green": "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
export default config;
