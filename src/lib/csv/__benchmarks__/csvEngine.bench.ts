/**
 * CSV Engine — Performance Benchmark Suite (Final)
 *
 * Measures baseline performance of the CSV engine across multiple sizes.
 *
 * ⚠️ CRITICAL ENGINE BUG DISCOVERED: `buildRecords()` at csvParser.ts:353 uses
 *    `Math.max(...rows.map(...))` which hits JS spread-operator argument limit
 *    (~125K). Any CSV with >125K rows FAILS to parse. Sizes 500K and 1M are
 *    affected — they cannot be benchmarked until this bug is fixed.
 *
 * Tested sizes: 1K, 10K, 100K (safe for all operations).
 * Data is pre-generated once per describe block using deterministic seed (42).
 *
 * Run: `npx vitest bench --run`
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

// Only sizes that work (Math.max spread bug prevents > ~125K rows)
const WORKING_SIZES = CSV_SIZES.filter((s) => s.rowCount <= 100_000);
// Edge case sizes (smaller for quick execution)
const SMALL_SIZES = CSV_SIZES.filter((s) => s.rowCount <= 10_000);

// Pre-generate all CSV data once at module load time
const csvCache = new Map<number, string>();
function csv(rowCount: number): string {
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

describe("CSV Parse (parseCsv)", () => {
    for (const size of WORKING_SIZES) {
        const data = csv(size.rowCount);

        bench(
            `${size.label} rows`,
            () => {
                const result = parseCsv(data);
                if (!result.success) throw new Error(`Parse failed: ${result.error?.message}`);
            },
            size.rowCount >= 100_000 ? { time: 10_000, warmupTime: 3_000 } : { time: 5_000 },
        );
    }
});

// ──────────────────────────────────────────────
// 2. Parse + Validate
// ──────────────────────────────────────────────

describe("CSV Parse + Validate", () => {
    // Pre-parse once for each size
    const parsedCache = new Map<number, ReturnType<typeof parseCsv>>();

    for (const size of WORKING_SIZES) {
        if (!parsedCache.has(size.rowCount)) {
            const data = csv(size.rowCount);
            parsedCache.set(size.rowCount, parseCsv(data));
        }
        const parseResult = parsedCache.get(size.rowCount)!;

        bench(
            `${size.label} rows`,
            () => {
                const result = validateCsv(parseResult);
                if (!result) throw new Error("Validation returned no result");
            },
            size.rowCount >= 100_000 ? { time: 10_000, warmupTime: 3_000 } : { time: 5_000 },
        );
    }
});

// ──────────────────────────────────────────────
// 3. Type Inference
// ──────────────────────────────────────────────

describe("CSV Type Inference (analyzeTypes)", () => {
    const parsedCache = new Map<number, NonNullable<ReturnType<typeof parseCsv>["csv"]>>();

    for (const size of WORKING_SIZES) {
        if (!parsedCache.has(size.rowCount)) {
            const data = csv(size.rowCount);
            const r = parseCsv(data);
            if (!r.success || !r.csv) throw new Error("Pre-parse failed");
            parsedCache.set(size.rowCount, r.csv);
        }
        const parsedCsv = parsedCache.get(size.rowCount)!;

        bench(
            `${size.label} rows`,
            () => {
                const analysis = analyzeTypes(parsedCsv);
                if (!analysis.complete) throw new Error("Analysis incomplete");
            },
            size.rowCount >= 100_000 ? { time: 10_000, warmupTime: 3_000 } : { time: 5_000 },
        );
    }
});

// ──────────────────────────────────────────────
// 4. Full Pipeline
// ──────────────────────────────────────────────

describe("CSV Full Pipeline (parse + validate + types)", () => {
    for (const size of WORKING_SIZES) {
        const data = csv(size.rowCount);

        bench(
            `${size.label} rows`,
            () => {
                const parseResult = parseCsv(data);
                if (!parseResult.success || !parseResult.csv) {
                    throw new Error(`Parse failed: ${parseResult.error?.message}`);
                }
                const v = validateCsv(parseResult);
                if (!v) throw new Error("Validation failed");
                const a = analyzeTypes(parseResult.csv);
                if (!a.complete) throw new Error("Analysis incomplete");
            },
            size.rowCount >= 100_000 ? { time: 10_000, warmupTime: 3_000 } : { time: 5_000 },
        );
    }
});

// ──────────────────────────────────────────────
// 5. Edge Cases
// ──────────────────────────────────────────────

describe("CSV Edge Cases", () => {
    // Quoted fields
    for (const size of SMALL_SIZES) {
        const { csv: raw } = generateBenchmarkCsv(size.rowCount);
        const quoted = raw.split("\n").map((l) => l.split(",").map((f) => `"${f}"`).join(",")).join("\n");

        bench(`quoted fields — ${size.label} rows`, () => {
            const r = parseCsv(quoted);
            if (!r.success) throw new Error(`Parse failed: ${r.error?.message}`);
        }, { time: 5_000 });
    }

    // Headerless
    for (const size of SMALL_SIZES) {
        const data = csv(size.rowCount);
        bench(`headerless — ${size.label} rows`, () => {
            const r = parseCsv(data, { hasHeader: false });
            if (!r.success) throw new Error(`Parse failed: ${r.error?.message}`);
        }, { time: 5_000 });
    }

    // Auto delimiter
    for (const size of SMALL_SIZES) {
        const data = csv(size.rowCount);
        bench(`auto delimiter — ${size.label} rows`, () => {
            const r = parseCsv(data, { delimiter: "auto" });
            if (!r.success) throw new Error(`Parse failed: ${r.error?.message}`);
        }, { time: 5_000 });
    }
});

// ──────────────────────────────────────────────
// 6. Sub-Operations (10K)
// ──────────────────────────────────────────────

describe("CSV Sub-operations (10K rows, pre-parsed)", () => {
    const data = csv(10_000);
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

describe("Memory Estimates (10K rows)", () => {
    const data = csv(10_000);
    const parseResult = parseCsv(data);
    if (!parseResult.success || !parseResult.csv) throw new Error("Pre-parse failed");

    bench("string-size estimate", () => {
        const inputSize = data.length;
        let fieldChars = 0;
        let fieldCount = 0;
        for (const record of parseResult.csv.records) {
            for (const val of Object.values(record)) {
                fieldChars += val.length;
                fieldCount++;
            }
        }
        const headerChars = parseResult.csv.headers.join(",").length;
        const total = inputSize * 2 + fieldChars * 2 + headerChars * 2;
        if (total < 0) throw new Error("Unexpected");
    });
});

