import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#05070b",
        panel: "#0d1119",
        line: "#1c2736",
        electric: "#087cff",
        cyan: "#35d7ff"
      },
      boxShadow: {
        glow: "0 0 42px rgba(0, 140, 255, .16)"
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(115deg, var(--brand-cyan, #42d9ff) 0%, var(--brand-primary, #078cff) 52%, var(--brand-accent, #0755ed) 100%)"
      }
    }
  },
  plugins: []
};
export default config;
