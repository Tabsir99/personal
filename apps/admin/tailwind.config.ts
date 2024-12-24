import type { Config } from "tailwindcss";

const flattenColorPalette =
  require("tailwindcss/lib/util/flattenColorPalette").default;

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      borderColor: {
        spinnerColor: "#1a73e8 transparent transparent transparent"
      },
      screens: {
        xs: "400px",
      },
      animation: {
        shimmer: "shimmer 3s linear infinite",
        shimmer2: "shimmer2 2s infinite linear",
        bounce: "bounce 1s infinite linear",
        loading: "loading 1s infinite linear",
        "slide-in": "slideIn 0.5s ease-out",
        spin: "spinner 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite"
      },
      keyframes: {
        spinner: {
          from: {
            transform: "rotate(0deg)"
          },
          to: {
            transform: "rotate(360deg)"
          }
        },
        shimmer: {
          from: {
            backgroundPosition: "0 0",
          },
          to: {
            backgroundPosition: "-200% 0",
          },
        },
        shimmer2: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        bounce: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        slideIn: {
          "0%": { transform: "translateY(-20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },

        loading: {
          "70%, 80%": {
            "transform-origin": "center",
            transform: "scaleX(0.4)",
          },
          "100%": {
            left: "100%",
          },
        },
      },
    },
  },

  variants: {
    extend: {
      opacity: ["disabled"],
      cursor: ["disabled"],
    },
  },
  plugins: [addVariablesForColors],
} satisfies Config;

function addVariablesForColors({ addBase, theme }: any) {
  let allColors = flattenColorPalette(theme("colors"));
  let newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
  );

  addBase({
    ":root": newVars,
  });
}
