import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        reserve: {
          forest: "#0B4F3C",
          green: "#2F8F46",
          leaf: "#65A832",
          soft: "#E7F2E5",
          orange: "#F59A32",
          cream: "#FAF9F4",
          charcoal: "#17211D",
          muted: "#5F7068",
          border: "#DDE5DF"
        }
      }
    }
  },
  plugins: [],
} satisfies Config;
