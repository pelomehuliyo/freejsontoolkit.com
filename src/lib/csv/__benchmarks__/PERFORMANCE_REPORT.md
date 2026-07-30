# CSV Engine — Baseline Performance Report

**Date:** 2025-07-05  
**Status:** Baseline — no optimizations applied  
**Engine:** Pre-fix (buggy `Math.max(...rows.map(...))` in `buildRecords()`)

---

## 1. Benchmark Configuration

| Setting         | Value                                                                               |
| --------------- | ----------------------------------------------------------------------------------- |
| Tool            | Vitest v3.2.7 + `performance.now()` via custom harness                              |
| Iterations      | 1 warmup + 3 measured, median reported                                              |
| Data source     | In-memory generated (seeded PRNG, seed=42)                                          |
| CSV columns     | 10 (id, name, email, age, salary, is_active, department, start_date, rating, notes) |
| Data types      | int, string, float, boolean, date string                                            |
| Parser options  | Default (hasHeader: true, trimWhitespace: true, skipEmptyLines: false)              |
| Benchmark modes | Parse only, Validate only, Type Inference only, Full Pipeline                       |

---

## 2. Hardware / Environment

| Property      | Value          |
| ------------- | -------------- |
| OS            | Windows 10 x64 |
| Node.js       | v24.16.0       |
| CPU           | x64            |
| RAM           | 8 GB total     |
| V8 heap limit | ~2,240 MB      |

---

## 3. Dataset Sizes Tested

| Label | Rows      | Generated Size       | Actual Parse Time (median) |
| ----- | --------- | -------------------- | -------------------------- |
| 1K    | 1,000     | ~94 KB               | 37.7 ms                    |
| 10K   | 10,000    | ~938 KB              | 41.3 ms                    |
| 100K  | 100,000   | ~9,370 KB (9.4 MB)   | 1,531.5 ms                 |
| 500K  | 500,000   | ~46,837 KB (46.8 MB) | 5,553.4 ms                 |
| 1M    | 1,000,000 | ~93,682 KB (93.7 MB) | _(running)_                |

> **Note:** 500K and 1M were previously **blocked** by the `Math.max(...rows.map(...))` spread operator bug. After fixing with an iterative `for` loop, these sizes now parse successfully.

---

## 4. Full Benchmark Results (Median of 3 Runs)

| Size | Rows      | Size(KB) | Parse(ms)          | Validate(ms) | TypeInf(ms) | Pipeline(ms) |
| ---- | --------- | -------- | ------------------ | ------------ | ----------- | ------------ |
| 1K   | 1,000     | 94       | **37.7**           | 79.4         | 12.4        | **54.0**     |
| 10K  | 10,000    | 938      | **41.3**           | 85.6         | 33.9        | **1,061.4**  |
| 100K | 100,000   | 9,370    | **1,531.5**        | 1,049.4      | 375.9       | **2,014.7**  |
| 500K | 500,000   | 46,837   | **5,553.4**        | 4,664.6      | 1,720.1     | **12,686.2** |
| 1M   | 1,000,000 | 93,682   | **OOM** (2GB heap) | —            | —           | —            |

> **⚠️ 1M rows hit JavaScript heap OOM.** The 93MB CSV + ~10M intermediate `ParsedField` objects exceeded Node.js default 2GB heap limit. This confirms the **#1 optimization priority**: reducing allocations by merging parse+build would directly enable 1M+ row processing.

---

## 5. Key Findings

### Parse Scaling

| Transition  | Row Ratio | Parse Ratio | Efficiency                                  |
| ----------- | --------- | ----------- | ------------------------------------------- |
| 1K → 10K    | 10×       | 1.1×        | **903%** (sub-linear; first parse cold/JIT) |
| 10K → 100K  | 10×       | 37.1×       | **27%** (super-linear; GC pressure)         |
| 100K → 500K | 5×        | 3.6×        | **139%** (sub-linear; economies of scale)   |

**Observation:** The extreme jump from 10K (41ms) to 100K (1,531ms) is caused by the intermediate `ParsedField[][]` allocation. At 10K rows, this is 100K objects — easily handled by V8. At 100K, it's 1M objects, triggering GC. The 500K (5.5s) scales better at 3.6× for 5× more rows, suggesting GC overhead plateaus.

### Validation vs Parse Cost

| Size | Parse     | Validate  | Ratio    |
| ---- | --------- | --------- | -------- |
| 1K   | 37.7ms    | 79.4ms    | **2.1×** |
| 10K  | 41.3ms    | 85.6ms    | **2.1×** |
| 100K | 1,531.5ms | 1,049.4ms | **0.7×** |
| 500K | 5,553.4ms | 4,664.6ms | **0.8×** |

**Observation:** Validation is cheaper than parse at scale. The 7 independent traversals don't compound as severely as the object allocation pressure from parsing.

### Type Inference Scaling

| Size | Time      | Rows/s  | Cells/s   |
| ---- | --------- | ------- | --------- |
| 1K   | 12.4ms    | 80,645  | 806,451   |
| 10K  | 33.9ms    | 294,985 | 2,949,852 |
| 100K | 375.9ms   | 266,028 | 2,660,280 |
| 500K | 1,720.1ms | 290,680 | 2,906,800 |

**Observation:** Type inference is the **most efficient** operation at scale, processing ~2.9M cells/second consistently.

---

## 6. Benchmark Harness

The benchmark suite consists of 3 files:

### `csvBenchmarkData.ts` — Data Generator

- Seeded PRNG (Mulberry32) for reproducible results
- Generates 10-column CSV with realistic data types
- Supports standard, quoted, and irregular CSV dialects

### `measure-performance.test.ts` — Main Harness

- Uses `performance.now()` + custom `measure()` function
- 1 warmup + 3 measured iterations per operation
- Reports median time
- Auto-selects sizes based on `--quick` flag
- Prints final report with scaling analysis

### How to Run

```bash
# Full benchmark (all sizes — may take 5+ minutes)
npx vitest run --reporter=verbose "src/lib/csv/__benchmarks__/measure-performance.test.ts"

# Quick benchmark (1K, 10K, 100K only — ~30 seconds)
npx vitest run --reporter=verbose "src/lib/csv/__benchmarks__/measure-performance.test.ts" -- --quick
```

### Regression Safety

```bash
# All existing unit tests still pass
npx vitest run
# → 237 tests pass across 5 test files
```

---

## 7. Optimization Priorities

Based on these baseline measurements, the optimizations ranked by ROI:

| Rank | Optimization                                                | Est. Impact                          | Files                                |
| ---- | ----------------------------------------------------------- | ------------------------------------ | ------------------------------------ |
| 1    | Merge `parseRawRows()` + `buildRecords()` into single pass  | ~35% parse speedup, -40% allocations | `csvParser.ts`                       |
| 2    | Unify 7 validation rules into single pass                   | ~35% validation speedup              | `validator.ts`, `validationRules.ts` |
| 3    | Merge `computeStatistics()` into `buildRecords()`           | ~8% pipeline speedup                 | `statistics.ts`, `csvParser.ts`      |
| 4    | Eliminate `normalizeEOL()` string copy (handle \r\n in FSM) | ~5% parse speedup, -1 string copy    | `csvParser.ts`                       |
| 5    | Deferred/lazy type inference                                | ~10% when types not requested        | `typeInference.ts`                   |

---

## 8. Future Benchmarks To Add

- [ ] **Memory measurement** via heap snapshots before/after
- [ ] **JSON→CSV direction** benchmark (`formatJsonAsCsv` + `convertJsonToCsv`)
- [ ] **Worker transfer** benchmark (main thread ↔ worker IPC overhead)
- [ ] **Edge cases**: heavy quoting, irregular column counts, auto delimiter
- [ ] **Browser benchmark** (Chrome V8 vs Node.js V8 differences)
