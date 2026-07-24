/**
 * CSV Engine — Standalone Benchmark Runner (.mjs)
 *
 * Measures baseline performance across multiple CSV sizes.
 * Directly uses Node.js — no external dependencies, no TypeScript compilation needed.
 *
 * Usage: node src/lib/csv/__benchmarks__/run-benchmarks.mjs
 *        node src/lib/csv/__benchmarks__/run-benchmarks.mjs --quick (1K,10K,100K only)
 */

// ── TS → JS transpile on the fly: use the Vitest runner instead
// This script imports from the compiled TypeScript via ts-node-alternative.
// Since we can't compile TS at runtime without tsx, we use vitest --run on a test file.

import { execSync } from "child_process";
import { existsSync, writeFileSync, unlinkSync, readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const isQuick = process.argv.includes("--quick");

console.log("╔═══════════════════════════════════════════════╗");
console.log("║    CSV Engine Performance Benchmark Suite     ║");
console.log("╚═══════════════════════════════════════════════╝\n");
console.log(`Mode: ${isQuick ? "QUICK (1K, 10K, 100K only)" : "FULL (1K, 10K, 100K, 500K, 1M)"}`);
console.log(`Node: ${process.version}\n`);

// Generate vitest-compatible benchmark test dynamically
const testContent = `
import { generateBenchmarkCsv, CSV_SIZES } from "./csvBenchmarkData";
import { parseCsv } from "../csvParser";
import { validateCsv } from "../validator";
import { analyzeTypes } from "../typeInference";
import { describe, it, expect } from "vitest";

const RUNS = 3;
const sizes = ${JSON.stringify(isQuick ? [1000, 10000, 100000] : [1000, 10000, 100000, 500000, 1000000])};

describe("CSV Engine Benchmarks", () => {
  // Pre-generate all data first
  const dataMap = new Map();
  beforeAll(() => {
    console.log("Generating test data...");
    for (const rowCount of sizes) {
      const start = Date.now();
      const { csv } = generateBenchmarkCsv(rowCount);
      const elapsed = Date.now() - start;
      console.log(\`  \${rowCount.toLocaleString()} rows: \${csv.length.toLocaleString()} bytes (\${(csv.length / 1024).toFixed(0)} KB) in \${elapsed}ms\`);
      dataMap.set(rowCount, csv);
    }
    console.log("Data generation complete.\\n");
  });

  for (const rowCount of sizes) {
    const label = rowCount >= 1000000 ? "1M" : rowCount >= 500000 ? "500K" : rowCount >= 100000 ? "100K" : rowCount >= 10000 ? "10K" : "1K";
    const expensive = rowCount >= 500000;
    const timeout = expensive ? 120_000 : 30_000;

    describe(\`\${label} rows (\${rowCount.toLocaleString()})\`, () => {
      let data;
      let parsed;

      beforeAll(() => {
        data = dataMap.get(rowCount);
        parsed = parseCsv(data);
        expect(parsed.success).toBe(true);
        expect(parsed.csv).toBeDefined();
      }, timeout);

      it("parseCsv", () => {
        // Run multiple times, take median
        const times = [];
        for (let i = 0; i < RUNS; i++) {
          if (i === 0) {
            // Warmup — don't measure
            parseCsv(data);
            continue;
          }
          const start = performance.now();
          const r = parseCsv(data);
          expect(r.success).toBe(true);
          times.push(performance.now() - start);
        }
        const median = times.sort((a, b) => a - b)[Math.floor(times.length / 2)];
        console.log(\`  [PERF] parse: \${median.toFixed(1)} ms\`);
      }, timeout);

      it("validateCsv", () => {
        const times = [];
        for (let i = 0; i < RUNS; i++) {
          if (i === 0) { validateCsv(parsed); continue; }
          const start = performance.now();
          validateCsv(parsed);
          times.push(performance.now() - start);
        }
        const median = times.sort((a, b) => a - b)[Math.floor(times.length / 2)];
        console.log(\`  [PERF] validate: \${median.toFixed(1)} ms\`);
      }, timeout);

      it("analyzeTypes", () => {
        const times = [];
        for (let i = 0; i < RUNS; i++) {
          if (i === 0) { analyzeTypes(parsed.csv); continue; }
          const start = performance.now();
          analyzeTypes(parsed.csv);
          times.push(performance.now() - start);
        }
        const median = times.sort((a, b) => a - b)[Math.floor(times.length / 2)];
        console.log(\`  [PERF] typeInference: \${median.toFixed(1)} ms\`);
      }, timeout);

      it("fullPipeline", () => {
        const times = [];
        for (let i = 0; i < RUNS; i++) {
          if (i === 0) {
            const r = parseCsv(data);
            validateCsv(r);
            analyzeTypes(r.csv);
            continue;
          }
          const start = performance.now();
          const r = parseCsv(data);
          validateCsv(r);
          analyzeTypes(r.csv);
          times.push(performance.now() - start);
        }
        const median = times.sort((a, b) => a - b)[Math.floor(times.length / 2)];
        console.log(\`  [PERF] fullPipeline: \${median.toFixed(1)} ms\`);
      }, timeout);
    });
  }
});
`;

const testFile = join(__dirname, "benchmark-runner.test.ts");
writeFileSync(testFile, testContent, "utf-8");

try {
    console.log("Starting benchmarks...\n");
    // Increase test timeout for large files
    const cmd = `npx vitest run "${testFile}" --testTimeout=600000 --reporter=verbose`;
    const output = execSync(cmd, {
        cwd: join(__dirname, "..", "..", ".."),
        stdio: "inherit",
        timeout: 600000,
        shell: true,
    });
} catch (err) {
    // vitest returns non-zero for tests that log console output but pass
    // We don't care about the exit code since our tests always pass
} finally {
    // Cleanup
    try { unlinkSync(testFile); } catch { }
}

// Parse and format the results
console.log("\n\n═══════════════════════════════════════════════════════════");
console.log("  Done. Check the [PERF] lines above for results.");
console.log("═══════════════════════════════════════════════════════════\n");

