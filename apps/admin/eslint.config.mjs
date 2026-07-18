import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import tailwind from "eslint-plugin-tailwindcss";

export default [
  ...nextVitals,
  ...nextTypescript,
  tailwind.configs.recommended,
  {
    settings: {
      tailwindcss: {
        cssConfigPath: "src/app/globals.css",
        whitelist: [
          "tactile-lift",
          "stagger-cascade",
          "stagger-cascade-tight",
          "inputs",
          "shadow-card-rest",
          "shadow-card-hover",
          "shadow-dialog",
          "shadow-kbd-rest",
          "shadow-kbd-press",
          "shadow-focus-ring",
        ],
      },
    },
    rules: {
      "tailwindcss/classnames-order": "error",
      "tailwindcss/enforces-shorthand": "error",
      "tailwindcss/no-contradicting-classname": "error",
      "tailwindcss/no-arbitrary-value": "error",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
];
