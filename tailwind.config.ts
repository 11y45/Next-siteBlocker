import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#F5F6FA",
        ink: "#1F2340",
        muted: "#6B7094",
        line: "#ECEEF6",
        // pastel accents (50 = background wash, 100 = chip, 500 = icon/text, 600 = hover)
        lavender: { 50: "#F3F1FF", 100: "#E8E4FF", 200: "#D3CCFF", 500: "#7C6CF0", 600: "#6857E0" },
        mint: { 50: "#EAFAF3", 100: "#D5F5E6", 500: "#2FA67B", 600: "#228A66" },
        peach: { 50: "#FFF3EC", 100: "#FFE5D6", 500: "#E8703A", 600: "#CC5A28" },
        skyblue: { 50: "#EEF6FF", 100: "#DCEBFF", 500: "#3B8BEB", 600: "#2A74D0" },
        blush: { 50: "#FFF0F4", 100: "#FFE0EA", 500: "#D9527A", 600: "#BF3C63" },
        butter: { 50: "#FFFAE8", 100: "#FFF0BF", 500: "#B58A00", 600: "#946F00" },
        fog: { 50: "#F4F5F9", 100: "#E7E9F2", 500: "#6B7094", 600: "#555A7A" },
      },
      boxShadow: {
        soft: "0 8px 30px rgba(31, 35, 64, 0.06)",
        lift: "0 14px 40px rgba(31, 35, 64, 0.10)",
        inset: "inset 0 1px 0 rgba(255,255,255,0.8)",
      },
      borderRadius: { "4xl": "2rem" },
      keyframes: { "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } } },
      animation: { "fade-late": "fade-in 0.35s ease-out 0.7s both" },
    },
  },
  plugins: [],
};
export default config;
