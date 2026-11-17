import type { Config } from "tailwindcss";

// Every color points at a CSS variable (see globals.css), which is what makes dark mode possible.
const v = (name: string) => `rgb(var(--c-${name}) / <alpha-value>)`;

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "canvas": v("canvas"),
        "surface": v("surface"),
        "edge": v("edge"),
        "ink": v("ink"),
        "muted": v("muted"),
        "line": v("line"),
        "tooltip": v("tooltip"),
        "tooltip-fg": v("tooltip-fg"),
        "scroll": v("scroll"),
        lavender: { 50: v("lavender-50"), 100: v("lavender-100"), 200: v("lavender-200"), 500: v("lavender-500"), 600: v("lavender-600") },
        mint: { 50: v("mint-50"), 100: v("mint-100"), 500: v("mint-500"), 600: v("mint-600") },
        peach: { 50: v("peach-50"), 100: v("peach-100"), 500: v("peach-500"), 600: v("peach-600") },
        skyblue: { 50: v("skyblue-50"), 100: v("skyblue-100"), 500: v("skyblue-500"), 600: v("skyblue-600") },
        blush: { 50: v("blush-50"), 100: v("blush-100"), 500: v("blush-500"), 600: v("blush-600") },
        butter: { 50: v("butter-50"), 100: v("butter-100"), 500: v("butter-500"), 600: v("butter-600") },
        fog: { 50: v("fog-50"), 100: v("fog-100"), 500: v("fog-500"), 600: v("fog-600") },
        ember: { 50: v("ember-50"), 100: v("ember-100"), 500: v("ember-500"), 600: v("ember-600") },
        moss: { 50: v("moss-50"), 100: v("moss-100"), 500: v("moss-500"), 600: v("moss-600") },
        jade: { 50: v("jade-50"), 100: v("jade-100"), 500: v("jade-500"), 600: v("jade-600") },
        lagoon: { 50: v("lagoon-50"), 100: v("lagoon-100"), 500: v("lagoon-500"), 600: v("lagoon-600") },
        iris: { 50: v("iris-50"), 100: v("iris-100"), 500: v("iris-500"), 600: v("iris-600") },
        plum: { 50: v("plum-50"), 100: v("plum-100"), 500: v("plum-500"), 600: v("plum-600") },
        petal: { 50: v("petal-50"), 100: v("petal-100"), 500: v("petal-500"), 600: v("petal-600") },
        sand: { 50: v("sand-50"), 100: v("sand-100"), 500: v("sand-500"), 600: v("sand-600") },
        pine: { 50: v("pine-50"), 100: v("pine-100"), 500: v("pine-500"), 600: v("pine-600") },
      },
      boxShadow: {
        soft: "0 8px 30px rgb(var(--c-shadow) / var(--shadow-soft-a))",
        lift: "0 14px 40px rgb(var(--c-shadow) / var(--shadow-lift-a))",
        inset: "inset 0 1px 0 rgba(255,255,255,0.08)",
      },
      borderRadius: { "4xl": "2rem" },
      keyframes: { "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } } },
      animation: { "fade-late": "fade-in 0.35s ease-out 0.7s both" },
    },
  },
  plugins: [],
};
export default config;
