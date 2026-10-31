import type { Config } from "tailwindcss";

const c = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg: c("bg"),
        surface: c("surface"),
        ink: c("ink"),
        muted: c("muted"),
        gold: c("gold"),
        rose: c("rose"),
        lilac: c("lilac"),
        sage: c("sage"),
        line: c("line"),
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', "Georgia", "serif"],
        sans: ['"DM Sans"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 10px 40px -12px rgb(var(--ink) / 0.14)",
        glow: "0 0 0 1px rgb(var(--gold) / 0.35), 0 12px 40px -10px rgb(var(--gold) / 0.35)",
      },
      keyframes: {
        floaty: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-8px)" } },
        fadeUp: { from: { opacity: "0", transform: "translateY(12px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        pop: { "0%": { transform: "scale(0.6)" }, "70%": { transform: "scale(1.15)" }, "100%": { transform: "scale(1)" } },
      },
      animation: {
        floaty: "floaty 7s ease-in-out infinite",
        fadeUp: "fadeUp .5s ease both",
        pop: "pop .28s ease both",
      },
    },
  },
  plugins: [],
};

export default config;
