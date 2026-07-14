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
        cssConfigPath: "src/app/globals.css"
      }
    },
    rules: {
      "tailwindcss/no-custom-classname": "error",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off"
    }
  }
];
