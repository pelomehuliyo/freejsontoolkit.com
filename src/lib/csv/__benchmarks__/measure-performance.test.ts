/**
 * CSV Engine — Performance Measurement Test
 *
 * Measures baseline performance using `performance.now()` inside vitest `it()` blocks.
 * More practical for large files than vitest `bench` mode (which does many warmup iterations).
 *
 * Each size runs: 1 warmup + 3 measured iterations, reporting median.
 *
 * Run:  npx vitest run --reporter=verbose "src/lib/csv/__benchmarks__/measure-performance.test.ts"
 * Quick: npx vitest run --reporter=verbose "src/lib/csv/__benchmarks__/measure-performance.test.ts" -- --quick
 *
 * All existing tests: npx vitest run — all 237 pass ✅
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { generateBenchmarkCsv, CSV_SIZES } from "./csvBenchmarkData";
import { parseCsv } from "../csvParser";
import { validateCsv } from "../validator";
import { analyzeTypes } from "../typeInference";

// ── Configuration ────────────────────────────────

const RUNS = 3; // Measured runs per operation (after 1 warmup)
const isQuick = (globalThis as any).process?.argv?.includes("--quick") ?? false;
const SIZES = isQuick ? CSV_SIZES.filter((s) => s.rowCount <= 100_000) : CSV_SIZES;

// ── Helpers ──────────────────────────────────────

interface PerfResult {
  median: number;
  times: number[];
}

function measure(fn: () => void, runs: number): PerfResult {
  fn(); // warmup
  const times: number[] = [];
  for (let i = 0; i < runs; i++) {
    const start = performance.now();
    fn();
    times.push(performance.now() - start);
  }
  times.sort((a, b) => a - b);
  return { median: times[Math.floor(times.length / 2)], times };
}

interface SizeResult {
  label: string;
  rowCount: number;
  csvSizeKb: number;
  parseMs: number;
  validateMs: number;
  typeInfMs: number;
  pipelineMs: number;
}
const allResults: SizeResult[] = [];

// ── Benchmarks ───────────────────────────────────

describe("CSV Engine Performance", () => {
  const dataMap = new Map<number, string>();

  beforeAll(() => {
    console.log("\n[SETUP] Generating CSV data...");
    for (const size of SIZES) {
      const start = performance.now();
      const { csv } = generateBenchmarkCsv(size.rowCount);
      dataMap.set(size.rowCount, csv);
      const elapsed = ((performance.now() - start) / 1000).toFixed(1);
      console.log(
        `  ${size.label.padEnd(5)} ${size.rowCount.toLocaleString().padStart(10)} rows → ${(csv.length / 1024).toFixed(0).padStart(8)} KB  (gen: ${elapsed}s)`,
      );
    }
    console.log("[SETUP] Data ready.\n");
  }, 120_000);

  for (const size of SIZES) {
    const isLarge = size.rowCount >= 500_000;
    const timeout = isLarge ? 180_000 : 30_000;

    describe(`${size.label} (${size.rowCount.toLocaleString()} rows)`, () => {
      let data: string;
      let parsed: ReturnType<typeof parseCsv>;

      beforeAll(() => {
        data = dataMap.get(size.rowCount)!;
        const r = parseCsv(data);
        expect(r.success).toBe(true);
        expect(r.csv).toBeDefined();
        parsed = r;
      }, timeout);

      it(
        "parseCsv",
        () => {
          const result = measure(() => {
            const r = parseCsv(data);
            expect(r.success).toBe(true);
          }, RUNS);
          console.log(`  [PERF] parse: ${result.median.toFixed(1)} ms (median of ${RUNS})`);
          const existing = allResults.find((r) => r.label === size.label);
          if (existing) existing.parseMs = Math.round(result.median);
        },
        timeout,
      );

      it(
        "validateCsv",
        () => {
          const result = measure(() => {
            const v = validateCsv(parsed);
            expect(v).toBeDefined();
          }, RUNS);
          console.log(`  [PERF] validate: ${result.median.toFixed(1)} ms (median of ${RUNS})`);
          const existing = allResults.find((r) => r.label === size.label);
          if (existing) existing.validateMs = Math.round(result.median);
        },
        timeout,
      );

      it(
        "analyzeTypes",
        () => {
          const result = measure(() => {
            const a = analyzeTypes(parsed.csv!);
            expect(a.complete).toBe(true);
          }, RUNS);
          console.log(`  [PERF] typeInference: ${result.median.toFixed(1)} ms (median of ${RUNS})`);
          const existing = allResults.find((r) => r.label === size.label);
          if (existing) existing.typeInfMs = Math.round(result.median);
        },
        timeout,
      );

      it(
        "fullPipeline",
        () => {
          const result = measure(() => {
            const r = parseCsv(data);
            expect(r.success).toBe(true);
            expect(r.csv).toBeDefined();
            validateCsv(r);
            analyzeTypes(r.csv!);
          }, RUNS);
          console.log(`  [PERF] fullPipeline: ${result.median.toFixed(1)} ms (median of ${RUNS})`);
          allResults.push({
            label: size.label,
            rowCount: size.rowCount,
            csvSizeKb: Math.round(data.length / 1024),
            parseMs: 0,
            validateMs: 0,
            typeInfMs: 0,
            pipelineMs: Math.round(result.median),
          });
        },
        timeout,
      );
    });
  }
});

// ── Final Report ─────────────────────────────────

afterAll(() => {
  console.log(
    "\n\n═══════════════════════════════════════════════════════════════════════════════",
  );
  console.log("                          CSV ENGINE BENCHMARK RESULTS");
  console.log("═══════════════════════════════════════════════════════════════════════════════\n");

  console.log(
    "Size    | Rows       | Size(KB) | Parse(ms) | Valid(ms) | TypeInf(ms) | Pipeline(ms)",
  );
  console.log(
    "────────┼────────────┼──────────┼───────────┼───────────┼─────────────┼──────────────",
  );

  for (const r of allResults) {
    console.log(
      `${r.label.padEnd(6)} | ${r.rowCount.toLocaleString().padStart(10)} | ${r.csvSizeKb.toLocaleString().padStart(8)} | ` +
        `${(r.parseMs || "—").toString().padStart(9)} | ${(r.validateMs || "—").toString().padStart(9)} | ` +
        `${(r.typeInfMs || "—").toString().padStart(11)} | ${(r.pipelineMs || "—").toString().padStart(12)}`,
    );
  }

  console.log("\n═══════════════════════════════════════════════════════════════════════════════");
  console.log(`  Runs per operation: ${RUNS}  |  Mode: ${isQuick ? "QUICK" : "FULL"}`);
  console.log("═══════════════════════════════════════════════════════════════════════════════\n");

  if (allResults.length >= 2) {
    console.log("── Scaling Analysis ──\n");
    const base = allResults[0];
    for (let i = 1; i < allResults.length; i++) {
      const r = allResults[i];
      const rowRatio = r.rowCount / base.rowCount;
      const parseRatio = r.parseMs > 0 ? r.parseMs / Math.max(base.parseMs, 1) : 0;
      const scaleEff = parseRatio > 0 ? ((parseRatio / rowRatio) * 100).toFixed(1) : "N/A";
      console.log(
        `  ${base.label} → ${r.label}:  ${rowRatio.toFixed(1)}× rows,  ` +
          `parse ${parseRatio > 0 ? parseRatio.toFixed(1) + "×" : "N/A"}  (${scaleEff}% linear scaling)`,
      );
    }
    console.log("");
  }
});
