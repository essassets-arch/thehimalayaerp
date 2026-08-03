import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Restored: will be tightened to "error" after violations fixed
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/ban-ts-comment": "warn",
      "react-hooks/exhaustive-deps": "error",
      // Stylistic — remain warn
      "react/no-unescaped-entities": "off",
      "prefer-const": "warn",
      "@next/next/no-img-element": "warn"
    }
  },
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      ".next-build/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "scripts/**",
      "old_erpStore.ts",
    ],
  },
];

export default eslintConfig;
