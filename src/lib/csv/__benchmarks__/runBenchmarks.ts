/**
 * CSV Engine — Standalone Benchmark Runner
 *
 * Measures baseline performance across multiple CSV sizes.
 * Optimized for large files: no vitest bench overhead, minimal warmup.
 *
 * Usage: npx tsx src/lib/csv/__benchmarks__/runBenchmarks.ts
 *        npx tsx src/lib/csv/__benchmarks__/runBenchmarks.ts --quick (1K,10K,100K only)
 */

import { generateBenchmarkCsv, CSV_SIZES } from "./csvBenchmarkData";
import { parseCsv } from "../csvParser";
import { validateCsv } from "../validator";
import { analyzeTypes } from "../typeInference";
import type { CsvSizeDefinition } from "./csvBenchmarkData";

// ──────────────────────────────────────────────
// Config
// ──────────────────────────────────────────────

declare const performance: { now(): number };
declare const process: { argv: string[]; exit(code?: number): never };

const RUNS = 3; // Number of runs per operation/size
const MIN_WARMUP_RUNS = 1; // Warmup runs before measurement

const isQuick = process.argv.includes("--quick");
const QUICK_SIZES = CSV_SIZES.filter((s) => s.rowCount <= 100_000);
const ALL_SIZES = CSV_SIZES;
const SIZES_TO_RUN = isQuick ? QUICK_SIZES : ALL_SIZES;

// ──────────────────────────────────────────────
// Timer helper
// ──────────────────────────────────────────────

function measure(fn: () => void, runs: number): { times: number[]; mean: number; median: number } {
  const times: number[] = [];

  // Warmup
  for (let w = 0; w < MIN_WARMUP_RUNS; w++) {
    fn();
  }

  // Measured runs
  for (let i = 0; i < runs; i++) {
    const start = performance.now();
    fn();
    const end = performance.now();
    times.push(end - start);
  }

  times.sort((a, b) => a - b);
  const mean = times.reduce((s, t) => s + t, 0) / times.length;
  const median =
    times.length % 2 === 1
      ? times[Math.floor(times.length / 2)]
      : (times[times.length / 2 - 1] + times[times.length / 2]) / 2;

  return { times, mean, median };
}

// ──────────────────────────────────────────────
// Benchmark operations
// ──────────────────────────────────────────────

interface BenchmarkResult {
  size: string;
  rowCount: number;
  csvSizeKb: number;
  parseMs: number;
  validateMs: number;
  typeInferenceMs: number;
  fullPipelineMs: number;
}

function runBenchmarks(): BenchmarkResult[] {
  const results: BenchmarkResult[] = [];

  for (const size of SIZES_TO_RUN) {
    const { csv: data, rowCount } = generateBenchmarkCsv(size.rowCount);
    const csvSizeKb = Math.round(data.length / 1024);

    console.log(`\n═══ ${size.label} rows (${csvSizeKb} KB) ═══`);

    // 1. Parse only
    const parseResult = measure(() => {
      const r = parseCsv(data);
      if (!r.success) throw new Error(`Parse failed: ${r.error?.message}`);
    }, RUNS);
    console.log(`  Parse:          ${parseResult.median.toFixed(1)} ms (median of ${RUNS})`);

    // Pre-parse once for validate & type inference
    const parsed = parseCsv(data);
    if (!parsed.success || !parsed.csv) throw new Error("Pre-parse failed");

    // 2. Validate only
    const validateResult = measure(() => {
      const v = validateCsv(parsed);
      if (!v) throw new Error("Validation failed");
    }, RUNS);
    console.log(`  Validate:       ${validateResult.median.toFixed(1)} ms (median of ${RUNS})`);

    // 3. Type inference only
    const typeResult = measure(() => {
      const a = analyzeTypes(parsed.csv!);
      if (!a.complete) throw new Error("Analysis incomplete");
    }, RUNS);
    console.log(`  Type Inference: ${typeResult.median.toFixed(1)} ms (median of ${RUNS})`);

    // 4. Full pipeline
    const pipelineResult = measure(() => {
      const r = parseCsv(data);
      if (!r.success || !r.csv) throw new Error("Parse failed");
      validateCsv(r);
      analyzeTypes(r.csv);
    }, RUNS);
    console.log(`  Full Pipeline:  ${pipelineResult.median.toFixed(1)} ms (median of ${RUNS})`);

    results.push({
      size: size.label,
      rowCount,
      csvSizeKb,
      parseMs: Math.round(parseResult.median),
      validateMs: Math.round(validateResult.median),
      typeInferenceMs: Math.round(typeResult.median),
      fullPipelineMs: Math.round(pipelineResult.median),
    });
  }

  return results;
}

// ──────────────────────────────────────────────
// Report
// ──────────────────────────────────────────────

function printReport(results: BenchmarkResult[]): void {
  console.log("\n\n═══════════════════════════════════════════════════════════");
  console.log("              CSV ENGINE BENCHMARK REPORT");
  console.log("═══════════════════════════════════════════════════════════\n");

  // Table header
  console.log(
    "Size    | Rows       | Size(KB) | Parse(ms) | Valid(ms) | TypeInf(ms) | Pipeline(ms)",
  );
  console.log(
    "────────┼────────────┼──────────┼───────────┼───────────┼─────────────┼──────────────",
  );

  for (const r of results) {
    const sizeLabel = r.size.padEnd(6);
    const rowStr = r.rowCount.toLocaleString().padStart(10);
    const sizeStr = r.csvSizeKb.toLocaleString().padStart(8);
    const parseStr = r.parseMs.toLocaleString().padStart(9);
    const validStr = r.validateMs.toLocaleString().padStart(9);
    const typeStr = r.typeInferenceMs.toLocaleString().padStart(11);
    const pipeStr = r.fullPipelineMs.toLocaleString().padStart(12);

    console.log(
      `${sizeLabel} | ${rowStr} | ${sizeStr} | ${parseStr} | ${validStr} | ${typeStr} | ${pipeStr}`,
    );
  }

  console.log("\n═══════════════════════════════════════════════════════════");
  console.log(`  Runs per operation: ${RUNS}  |  Quick mode: ${isQuick ? "YES" : "NO"}"`);
  console.log("═══════════════════════════════════════════════════════════\n");

  // Check for linear scaling
  if (results.length >= 2) {
    console.log("── Scaling Analysis ──\n");
    const base = results[0];
    for (let i = 1; i < results.length; i++) {
      const r = results[i];
      const rowRatio = r.rowCount / base.rowCount;
      const parseRatio = r.parseMs / Math.max(base.parseMs, 1);
      const pipelineRatio = r.fullPipelineMs / Math.max(base.fullPipelineMs, 1);
      const scaleEfficiency = ((parseRatio / rowRatio) * 100).toFixed(1);
      console.log(
        `  ${base.size}→${r.size}:  ${r.rowCount / base.rowCount}x rows,  ` +
          `parse ${parseRatio.toFixed(1)}x,  pipeline ${pipelineRatio.toFixed(1)}x  ` +
          `(scaling: ${scaleEfficiency}%)`,
      );
    }
  }
}

// ──────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────

function main(): void {
  console.log("╔═══════════════════════════════════════════════╗");
  console.log("║    CSV Engine Performance Benchmark Suite     ║");
  console.log("╚═══════════════════════════════════════════════╝\n");

  const startTime = performance.now();
  const results = runBenchmarks();
  const totalTime = ((performance.now() - startTime) / 1000).toFixed(1);

  printReport(results);

  console.log(`\nTotal benchmark time: ${totalTime}s`);
  console.log("Done.");
}

main();
