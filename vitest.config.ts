import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Include test files
    include: ["src/**/*.test.ts", "src/**/*.spec.ts"],

    // Exclude build output and dependencies
    exclude: ["node_modules", "dist", ".astro", "src/lib/csv/__benchmarks__/**"],

    // Enable TypeScript support
    globals: true,

    // Coverage configuration
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      reportsDirectory: "./coverage",
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.test.ts", "src/**/*.spec.ts", "src/**/*.worker.ts", "src/**/types.ts"],
    },
  },
});
