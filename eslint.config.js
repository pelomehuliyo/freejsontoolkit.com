// @ts-check
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import astroPlugin from "eslint-plugin-astro";
import prettierConfig from "eslint-config-prettier";

export default tseslint.config(
  // Global ignores
  {
    ignores: [
      "dist/",
      ".astro/",
      "node_modules/",
      "**/*.d.ts",
      "**/*.worker.ts",
      "src/lib/csv/__benchmarks__/**",
    ],
  },

  // Recommended ESLint config
  eslint.configs.recommended,

  // TypeScript recommended rules
  ...tseslint.configs.recommended,

  // Astro recommended rules
  ...astroPlugin.configs.recommended,

  // Prettier compatibility (must be last to turn off conflicting rules)
  prettierConfig,

  // Project-specific overrides
  {
    rules: {
      // Allow explicit `any` for worker/legacy code
      "@typescript-eslint/no-explicit-any": "warn",

      // Allow unused vars with underscore prefix
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],

      // Allow `arguments` in gtag inline scripts
      "prefer-rest-params": "off",
    },
  },

  // Astro files specific overrides
  {
    files: ["**/*.astro"],
    rules: {
      // Astro files don't need TypeScript specific rules
      "@typescript-eslint/no-unused-vars": "off",
      // Allow `arguments` in inline <script> tags (gtag etc.)
      "prefer-rest-params": "off",
    },
  },

  // Test files overrides
  {
    files: ["**/*.test.ts", "**/*.test.js", "**/*.spec.ts"],
    rules: {
      // Allow expect/describe/it in tests
      "@typescript-eslint/no-unused-vars": "off",
      // No floating promises is fine for tests
      "@typescript-eslint/no-floating-promises": "off",
    },
  },
);
