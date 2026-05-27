// tailwind.config.ts
import type { Config } from "tailwindcss";

export default <Config>{
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "hsl(210, 70%, 40%)",
        accent: "hsl(33, 80%, 55%)",
        background: "hsl(0, 0%, 100%)",
        foreground: "hsl(0, 0%, 10%)",
      },
    },
  },
  plugins: [],
};
