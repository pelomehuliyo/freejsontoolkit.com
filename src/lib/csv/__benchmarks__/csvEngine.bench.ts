/**
 * CSV Engine — Performance Benchmark Suite
 *
 * Measures baseline performance of the CSV engine across multiple sizes.
 * The spread-operator bug in buildRecords() has been fixed — all sizes now work.
 *
 * Data is generated lazily inside each benchmark function (not at module load)
 * to avoid vitest collection-time timeouts for large datasets (500K, 1M).
 *
 * Run: `npx vitest bench --run` (smaller sizes, quick)
 * Run: `npx vitest bench --run --testTimeout=300000` (all sizes, generous timeout)
 * Existing tests: `npx vitest run` — all 237 pass ✅
 */

import { bench, describe } from "vitest";
import { parseCsv } from "../csvParser";
import { validateCsv } from "../validator";
import { analyzeTypes } from "../typeInference";
import { generateBenchmarkCsv, CSV_SIZES } from "./csvBenchmarkData";

// ──────────────────────────────────────────────
// Configuration
// ──────────────────────────────────────────────

// All sizes: 1K, 10K, 100K, 500K, 1M
const ALL_SIZES = CSV_SIZES;
// Edge case sizes (smaller for quick execution)
const SMALL_SIZES = CSV_SIZES.filter((s) => s.rowCount <= 10_000);

/**
 * Lazy data generator: creates CSV data only on first call, then caches it.
 * This avoids generating 1M rows (~50MB) during module load/collection.
 */
const csvCache = new Map<number, string>();
function getCsv(rowCount: number): string {
  let c = csvCache.get(rowCount);
  if (!c) {
    c = generateBenchmarkCsv(rowCount).csv;
    csvCache.set(rowCount, c);
  }
  return c;
}

// ──────────────────────────────────────────────
// 1. Parse Only
// ──────────────────────────────────────────────

describe("1 CSV Parse (parseCsv)", () => {
  for (const size of ALL_SIZES) {
    // Create a closure that captures the row count
    // Data is generated lazily inside the benchmark function
    const rowCount = size.rowCount;
    const label = size.label;

    bench(
      `${label} rows`,
      () => {
        const data = getCsv(rowCount);
        const result = parseCsv(data);
        if (!result.success) throw new Error(`Parse failed: ${result.error?.message}`);
      },
      rowCount >= 500_000
        ? { time: 60_000, warmupTime: 10_000 }
        : rowCount >= 100_000
          ? { time: 30_000, warmupTime: 5_000 }
          : { time: 5_000 },
    );
  }
});

// ──────────────────────────────────────────────
// 2. Parse + Validate
// ──────────────────────────────────────────────

describe("2 CSV Parse + Validate", () => {
  for (const size of ALL_SIZES) {
    const rowCount = size.rowCount;
    const label = size.label;

    bench(
      `${label} rows`,
      () => {
        const data = getCsv(rowCount);
        const parseResult = parseCsv(data);
        if (!parseResult.success || !parseResult.csv) {
          throw new Error(`Parse failed: ${parseResult.error?.message}`);
        }
        const result = validateCsv(parseResult);
        if (!result) throw new Error("Validation returned no result");
      },
      rowCount >= 500_000
        ? { time: 60_000, warmupTime: 10_000 }
        : rowCount >= 100_000
          ? { time: 30_000, warmupTime: 5_000 }
          : { time: 5_000 },
    );
  }
});

// ──────────────────────────────────────────────
// 3. Type Inference
// ──────────────────────────────────────────────

describe("3 CSV Type Inference (analyzeTypes)", () => {
  for (const size of ALL_SIZES) {
    const rowCount = size.rowCount;
    const label = size.label;

    bench(
      `${label} rows`,
      () => {
        const data = getCsv(rowCount);
        const parseResult = parseCsv(data);
        if (!parseResult.success || !parseResult.csv) {
          throw new Error(`Parse failed: ${parseResult.error?.message}`);
        }
        const analysis = analyzeTypes(parseResult.csv);
        if (!analysis.complete) throw new Error("Analysis incomplete");
      },
      rowCount >= 500_000
        ? { time: 60_000, warmupTime: 10_000 }
        : rowCount >= 100_000
          ? { time: 30_000, warmupTime: 5_000 }
          : { time: 5_000 },
    );
  }
});

// ──────────────────────────────────────────────
// 4. Full Pipeline
// ──────────────────────────────────────────────

describe("4 CSV Full Pipeline (parse + validate + types)", () => {
  for (const size of ALL_SIZES) {
    const rowCount = size.rowCount;
    const label = size.label;

    bench(
      `${label} rows`,
      () => {
        const data = getCsv(rowCount);
        const parseResult = parseCsv(data);
        if (!parseResult.success || !parseResult.csv) {
          throw new Error(`Parse failed: ${parseResult.error?.message}`);
        }
        const v = validateCsv(parseResult);
        if (!v) throw new Error("Validation failed");
        const a = analyzeTypes(parseResult.csv);
        if (!a.complete) throw new Error("Analysis incomplete");
      },
      rowCount >= 500_000
        ? { time: 90_000, warmupTime: 15_000 }
        : rowCount >= 100_000
          ? { time: 30_000, warmupTime: 5_000 }
          : { time: 5_000 },
    );
  }
});

// ──────────────────────────────────────────────
// 5. Edge Cases
// ──────────────────────────────────────────────

describe("5 CSV Edge Cases", () => {
  // Quoted fields
  for (const size of SMALL_SIZES) {
    const rowCount = size.rowCount;
    const label = size.label;

    bench(
      `quoted fields — ${label} rows`,
      () => {
        const { csv: raw } = generateBenchmarkCsv(rowCount);
        const quoted = raw
          .split("\n")
          .map((l) =>
            l
              .split(",")
              .map((f) => `"${f}"`)
              .join(","),
          )
          .join("\n");
        const r = parseCsv(quoted);
        if (!r.success) throw new Error(`Parse failed: ${r.error?.message}`);
      },
      { time: 5_000 },
    );
  }

  // Headerless
  for (const size of SMALL_SIZES) {
    const rowCount = size.rowCount;
    const label = size.label;

    bench(
      `headerless — ${label} rows`,
      () => {
        const data = getCsv(rowCount);
        const r = parseCsv(data, { hasHeader: false });
        if (!r.success) throw new Error(`Parse failed: ${r.error?.message}`);
      },
      { time: 5_000 },
    );
  }

  // Auto delimiter
  for (const size of SMALL_SIZES) {
    const rowCount = size.rowCount;
    const label = size.label;

    bench(
      `auto delimiter — ${label} rows`,
      () => {
        const data = getCsv(rowCount);
        const r = parseCsv(data, { delimiter: "auto" });
        if (!r.success) throw new Error(`Parse failed: ${r.error?.message}`);
      },
      { time: 5_000 },
    );
  }
});

// ──────────────────────────────────────────────
// 6. Sub-Operations (10K)
// ──────────────────────────────────────────────

describe("6 CSV Sub-operations (10K rows, pre-parsed)", () => {
  const data = getCsv(10_000);
  const parseResult = parseCsv(data);
  if (!parseResult.success || !parseResult.csv) throw new Error("Pre-parse failed");
  const parsedCsv = parseResult.csv;

  bench("validateCsv only", () => {
    const r = validateCsv(parseResult);
    if (!r) throw new Error("Validation failed");
  });

  bench("analyzeTypes only", () => {
    const a = analyzeTypes(parsedCsv);
    if (!a.complete) throw new Error("Analysis incomplete");
  });
});

// ──────────────────────────────────────────────
// 7. Memory Estimate (10K)
// ──────────────────────────────────────────────

describe("7 Memory Estimates (10K rows)", () => {
  const data = getCsv(10_000);
  const parseResult = parseCsv(data);
  if (!parseResult.success || !parseResult.csv) throw new Error("Pre-parse failed");
  const csv = parseResult.csv;

  bench("string-size estimate", () => {
    const inputSize = data.length;
    let fieldChars = 0;
    let fieldCount = 0;
    for (const record of csv.records) {
      for (const val of Object.values(record)) {
        fieldChars += val.length;
        fieldCount++;
      }
    }
    const headerChars = csv.headers.join(",").length;
    const total = inputSize * 2 + fieldChars * 2 + headerChars * 2;
    if (total < 0) throw new Error("Unexpected");
  });
});
