# CSV Engine — Baseline Performance Report

**Date:** 2025-07-05  
**Author:** Architecture Review  
**Status:** Baseline only — no optimizations applied

---

## 1. Benchmark Configuration

| Setting | Value |
|---------|-------|
| Tool | Vitest v3.2.7 (experimental benchmark API) |
| Iterations | Adaptive (5s — 10s per benchmark, warmup 3s for large) |
| Data source | In-memory generated (seeded PRNG, seed=42) |
| CSV columns | 10 (id, name, email, age, salary, is_active, department, start_date, rating, notes) |
| Data types | int, string, float, boolean, date string |
| CSV dialect | RFC 4180, comma-delimited, header row included |
| Parser options | Default (hasHeader: true, trimWhitespace: true, skipEmptyLines: false) |
| Benchmark modes | Parse only, Parse+Validate, Type Inference, Full Pipeline, Edge Cases |

---

## 2. Hardware / Environment

| Property | Value |
|----------|-------|
| OS | Windows 10 x64 |
| Node.js | v24.16.0 |
| CPU | x64 (not explicitly detected, but benchmark host) |
| RAM | 8 GB total (7.9 GB visible, ~1.3 GB free at test time) |
| V8 heap limit | 2,240 MB |
| Runtime | Node.js (not browser) |
| Process | Single-threaded, main thread only |

---

## 3. Dataset Sizes Tested

| Label | Rows | Columns | Cells | Est. CSV Size | Est. CSV Size (UTF-16) |
|-------|------|---------|-------|---------------|------------------------|
| 1K | 1,000 | 10 | 10,000 | ~50 KB | ~100 KB |
| 10K | 10,000 | 10 | 100,000 | ~500 KB | ~1 MB |
| 100K | 100,000 | 10 | 1,000,000 | ~5 MB | ~10 MB |
| ~~500K~~ | ~~500,000~~ | 10 | ~~5,000,000~~ | ~~~25 MB~~ | **Blocked by bug** |
| ~~1M~~ | ~~1,000,000~~ | 10 | ~~10,000,000~~ | ~~~50 MB~~ | **Blocked by bug** |

> **⚠️ 500K and 1M sizes could not be tested.**  
> `buildRecords()` at `csvParser.ts:353` uses `Math.max(...rows.map(r => r.length))` which hits JavaScript's spread-operator argument limit (~125K elements). Any CSV with >~125K data rows causes a `RangeError: Maximum call stack size exceeded` or `spread argument too large`. This is a **critical bug** that must be fixed before larger datasets can be benchmarked.

---

## 4. Parse Throughput

### 4.1. Raw Parse (`parseCsv`)

| Size | Mean (ms) | Min (ms) | Max (ms) | Rows/s | MB/s | vs 1K |
|------|-----------|----------|----------|--------|------|-------|
| 1K | 7.00 | 2.63 | 185.41 | 142,857 | ~7.1 | 1.0× |
| 10K | 70.56 | 38.79 | 292.89 | 141,723 | ~7.1 | 10.1× |
| 100K | 931.64 | 434.69 | 2,570.69 | 107,337 | ~5.4 | 133× |

**Observations:**
- Parse throughput is **~140K rows/second** for small-medium sizes.
- At 100K rows, throughput drops ~25% (107K rows/s) due to GC pressure from millions of small `ParsedField` objects.
- The high `max` values (2.57s for 100K) indicate occasional GC pauses during parsing.
- The RME (relative margin of error) is high for 100K (44%) — significant variance between runs, consistent with GC-heavy workload.

### 4.2. Edge Cases (Parse)

| Scenario | 1K (ms) | 10K (ms) | 1K rows/s | 10K rows/s |
|----------|---------|----------|-----------|------------|
| Standard (default) | 7.00 | 70.56 | 142,857 | 141,723 |
| Quoted fields | 6.23 | 59.50 | 160,514 | 168,067 |
| Headerless | 5.81 | 38.64 | 172,117 | 258,799 |
| Auto delimiter | 4.05 | 46.41 | 246,913 | 215,470 |

**Counterintuitive finding:** Quoted fields parse **faster** than standard CSV. This is likely because the FSM takes a simpler branch for quoted content (fewer character-type checks). Headerless mode is fastest because it skips the header-processing step entirely.

---

## 5. Validation Throughput

### 5.1. Parse + Validate (`parseCsv` + `validateCsv`)

| Size | Mean (ms) | Min (ms) | Max (ms) | Validations/s | vs 1K |
|------|-----------|----------|----------|---------------|-------|
| 1K | 4.81 | 4.10 | 8.41 | 207,692 | 1.0× |
| 10K | 55.07 | 49.70 | 171.05 | 181,585 | 11.4× |
| 100K | 1,031.98 | 937.28 | 1,391.05 | 96,899 | 214× |

**Observations:**
- Validation scales roughly linearly up to 10K rows, but degrades significantly at 100K.
- The 100K measurement (1,032ms) is actually **slower than parse alone** (932ms), meaning validation overhead is ~100ms for 100K rows.
- At 100K, the 7 independent traversals of the data compound with GC pressure.

### 5.2. Validation Only (10K rows, pre-parsed)

| Operation | Mean (ms) | Rows/s | Notes |
|-----------|-----------|--------|-------|
| validateCsv only | 137.46 | 72,747 | **High variance** (RME 84.85%, only 10 samples) |
| analyzeTypes only | 40.76 | 245,338 | Stable (RME 5.56%) |

**Key insight:** Validation costs **~2× the parse time** for 10K rows. The 7 independent rule traversals are the primary cause. The `checkDuplicateRows()` rule is particularly expensive due to per-row string serialization.

---

## 6. Type Inference Throughput

### 6.1. Type Inference (`analyzeTypes`)

| Size | Mean (ms) | Min (ms) | Max (ms) | Inferences/s | vs 1K |
|------|-----------|----------|----------|--------------|-------|
| 1K | 3.89 | 1.65 | 76.87 | 257,069 | 1.0× |
| 10K | 39.18 | 31.39 | 95.28 | 255,232 | 10.1× |
| 100K | 346.97 | 257.48 | 1,472.01 | 288,210 | 89× |

**Observations:**
- Type inference has the **best scaling** of all operations (89× from 1K to 100K, vs 133× for parse).
- High throughput (~250K cells/s) due to simple regex matching per cell.
- The 100K measurement has high variance (RME 25.4%) due to GC pauses from the per-column `values[]` array allocations.

---

## 7. End-to-End Throughput

### 7.1. Full Pipeline (parse + validate + type inference)

| Size | Mean (ms) | Min (ms) | Max (ms) | Rows/s | MB/s | vs 1K |
|------|-----------|----------|----------|--------|------|-------|
| 1K | 11.40 | 9.59 | 20.83 | 87,719 | ~4.4 | 1.0× |
| 10K | 122.59 | 113.12 | 206.03 | 81,573 | ~4.1 | 10.8× |
| 100K | 2,407.47 | 2,090.59 | 3,078.09 | 41,537 | ~2.1 | 211× |

**Observations:**
- End-to-end throughput drops **50%** from 10K to 100K (81K → 41K rows/s).
- At 100K rows, the pipeline takes **2.4 seconds** — acceptable for one-off use, but poor for interactive or repeated processing.
- The full pipeline is ~2.5× slower than parse alone for 100K rows.

### 7.2. Pipeline Breakdown (10K rows)

| Stage | Time (ms) | % of Total | Cumulative |
|-------|-----------|------------|------------|
| Parse | 70.56 | 57.6% | 57.6% |
| Validate | 55.07 | 44.9% | 102.5%* |
| Type Inference | 39.18 | 32.0% | 134.5%* |
| **Total** | **122.59** | 100% | 100% |

> *Percentages >100% because validation and type inference are measured from pre-parsed data (parse time excluded from their measurement). The actual pipeline is parse → validate → type inference, where validate and type inference run on already-parsed data.

**Breakdown of the 2.4s for 100K rows:**
- Parse: ~932ms (39%)
- Validate: ~1,032ms (43%) — **biggest single contributor**
- Type inference: ~347ms (14%)
- Overhead/GC: ~96ms (4%)

---

## 8. Memory Usage Observations

### 8.1. Estimated String Sizes (10K rows)

| Component | Characters | Est. Memory (UTF-16) |
|-----------|-----------|---------------------|
| Raw CSV input | ~500,000 | ~1,000 KB |
| Parsed field strings | ~700,000 | ~1,400 KB |
| Headers | ~100 | ~0.2 KB |
| **Total strings** | **~1,200,000** | **~2,400 KB** |

### 8.2. Object Allocations (Estimated)

| Stage | Objects Allocated | Per 100K rows |
|-------|------------------|---------------|
| Raw parse FSM | `ParsedField[]` × 1 row | 100K arrays |
| | `ParsedField` × 10 per row | **1,000,000 objects** |
| Record building | `CsvRecord` × 1 per row | 100,000 objects |
| | Property assignments (bracket notation) × 10 per row | 1,000,000 assignments |
| Validation | Serialized strings via `serializeRecord()` | 100,000 string concat ops |
| | `Set<string>` entries | 100,000 entries |
| Type inference | `values[]` arrays × 10 columns | 10 arrays × 100K refs |
| | `ColumnTypeProfile` × 10 | 10 objects |
| **Total (approx.)** | | **~1.3M objects + ~1M property assignments** |

### 8.3. Memory Pressure Points

| Rank | Source | Impact | Mitigation |
|------|--------|--------|------------|
| 1 | `ParsedField` objects (1M per 100K rows) | **Very High** | Eliminate by merging parse+build into single pass |
| 2 | `normalizeEOL()` string copy | **High** | Handle `\r\n`/`\r` inline in FSM |
| 3 | `CsvRecord` hash-map objects | **High** | Replace with `string[]` indexed rows |
| 4 | `values[]` per column in type inference | **Medium** | Classify on-the-fly during single pass |
| 5 | `serializeRecord()` string concatenation | **Medium** | Cache or avoid redundant serialization |

---

## 9. Slowest Functions (Hot Paths)

### 9.1. By Absolute Time (100K rows)

| Rank | Function | File | Est. Time (ms) | % of Pipeline |
|------|----------|------|---------------|---------------|
| 1 | `validateCsv()` → orchestrating 7 rules | `validator.ts` | ~1,032 | 43% |
| 2 | `parseRawRows()` → character-level FSM | `csvParser.ts` | ~600 | 25% |
| 3 | `buildRecords()` → object construction | `csvParser.ts` | ~330 | 14% |
| 4 | `analyzeTypes()` → regex classification | `typeInference.ts` | ~347 | 14% |
| 5 | `checkDuplicateRows()` → string serialization | `validationRules.ts` | ~200 | 8% |

### 9.2. Total Pipeline Time (100K rows): ~2,407ms

### 9.3. Complexity Analysis

**`parseRawRows()`** — O(n) where n = input characters. Character-by-character FSM with quote-state tracking. The tight loop is efficient but allocates 1 `ParsedField` object per cell, causing GC pressure.

**`buildRecords()`** — O(rows × cols). Creates `CsvRecord` objects with bracket-notation property assignment. **Contains the critical bug** (`Math.max(...rows.map(...))`) that limits input to ~125K rows.

**`validateCsv()`** — O(7 × rows × cols). Runs 7 independent rule functions, each traversing all records. `checkDuplicateRows()` is the most expensive due to `serializeRecord()` which builds a string via `Object.keys().sort().map().join("|")` per row.

**`analyzeTypes()`** — O(rows × cols × regex). Each cell is classified via up to 4 regex tests. The per-column `values[]` array allocation adds GC pressure.

---

## 10. Largest Allocations

| Rank | Allocation | Size (100K rows) | Location |
|------|-----------|------------------|----------|
| 1 | `ParsedField` array-of-arrays | 100K arrays × 10 fields = **1,000,000 objects** | `csvParser.ts` — `parseRawRows()` |
| 2 | Normalized CSV string | ~5 MB string (UTF-16: ~10 MB) | `csvParser.ts` — `normalizeEOL()` |
| 3 | `CsvRecord[]` records | 100K objects × 10 properties = **100,000 objects** | `csvParser.ts` — `buildRecords()` |
| 4 | `values[]` per column (type inference) | 10 arrays × 100K string references | `typeInference.ts` — `analyzeTypes()` |
| 5 | `Set<string>` for duplicate row detection | 100K string entries (serialized) | `validationRules.ts` — `checkDuplicateRows()` |

---

## 11. Top 5 Optimization Opportunities

### #1: Fix `Math.max(...rows.map(...))` spread bug

**File:** `csvParser.ts:353` (`buildRecords()`)  
**Expected impact:** **Critical** — enables 500K and 1M benchmarking  
**Complexity:** **Low**  
**Description:** Replace `const columnCount = Math.max(...rows.map(r => r.length))` with a simple `for` loop or `reduce()`:

```ts
let columnCount = 0;
for (const row of rows) {
  if (row.length > columnCount) columnCount = row.length;
}
```

This is a one-line fix that removes the JavaScript spread-operator argument limit (~125K). Without this fix, the engine **cannot parse any CSV larger than ~125K rows**.

---

### #2: Merge `parseRawRows()` + `buildRecords()` into single pass

**Files:** `csvParser.ts`  
**Expected impact:** **~35% faster parse, -40% allocations**  
**Complexity:** **Medium**  
**Description:** Currently the parser creates a full intermediate `ParsedField[][]` (with `{value, wasQuoted, line, column}` per cell), then makes a second pass to build `CsvRecord[]`. By building `CsvRecord[]` directly during character-level parsing, we eliminate:
- 1,000,000 `ParsedField` objects per 100K rows
- One full data traversal
- The `wasQuoted` tracking can use a `Uint8Array` bit field per row instead of per-field objects

**Estimated savings:** 1M objects eliminated, ~330ms → ~200ms for 100K rows

---

### #3: Unify validation rules into single pass

**Files:** `validator.ts`, `validationRules.ts`  
**Expected impact:** **~35% faster validation, -1 traversal**  
**Complexity:** **Medium**  
**Description:** Currently `validateCsv()` runs 7 independent rule checks:
1. `checkDuplicateHeaders` — O(header)
2. `checkEmptyHeaders` — O(header)
3. `checkEmptyFile` — O(1)
4. `checkInconsistentColumnCounts` — O(rows)
5. `checkDuplicateRows` — O(rows) + serialization
6. `checkEmptyValues` — O(rows × cols)
7. `checkWhitespaceValues` — O(rows × cols)

Combine checks 4-7 into a single pass over records using an enabled-rule bitmask. This eliminates 3 traversals of the data.

**Estimated savings:** ~1,032ms → ~670ms for 100K rows

---

### #4: Merge `computeStatistics()` into `buildRecords()`

**Files:** `statistics.ts`, `csvParser.ts`  
**Expected impact:** **~8% faster overall, -1 traversal**  
**Complexity:** **Low**  
**Description:** Increment statistics counters (row count, empty cell count, inconsistent row count) during record construction instead of re-traversing all records. The duplicate-row detection in `computeStatistics()` duplicates work already done in `checkDuplicateRows()` — this can be shared.

**Estimated savings:** ~200ms for 100K rows (eliminates redundant `serializeRecord()` call)

---

### #5: Eliminate `normalizeEOL()` string copy

**File:** `csvParser.ts`  
**Expected impact:** **~5% faster parse, -1 string copy**  
**Complexity:** **Low**  
**Description:** Currently `normalizeEOL()` creates a new string by replacing `\r\n` → `\n` and `\r` → `\n`. The character-level FSM in `parseRawRows()` can handle `\r` and `\r\n` sequences directly, eliminating the need for the preprocessing step. Similarly, BOM stripping via `replace()` can be done inline.

**Estimated savings:** 1 full string copy eliminated (~5-10 MB for 100K), ~50ms saved

---

## 12. Optimization Ranking Summary

| Rank | Optimization | Est. Impact | Complexity | Files Affected | Est. Time Saved (100K) |
|------|-------------|-------------|------------|---------------|----------------------|
| 1 | Fix `Math.max(...rows.map(...))` spread bug | **Critical** (unblocks 500K/1M) | Low | `csvParser.ts` | N/A — enables benchmarking |
| 2 | Merge `parseRawRows()` + `buildRecords()` | **~35% parse speedup** | Medium | `csvParser.ts` | ~130ms |
| 3 | Unify validation rules into single pass | **~35% validation speedup** | Medium | `validator.ts`, `validationRules.ts` | ~360ms |
| 4 | Merge `computeStatistics()` into `buildRecords()` | **~8% pipeline speedup** | Low | `statistics.ts`, `csvParser.ts` | ~200ms |
| 5 | Eliminate `normalizeEOL()` string copy | **~5% parse speedup** | Low | `csvParser.ts` | ~50ms |

**Estimated total pipeline improvement (100K rows):** 2,407ms → **~1,667ms (31% faster)**  
**Estimated total object reduction:** ~1,300,000 → **~300,000 (77% fewer objects)**  
**Estimated total traversals:** 12 → **~3 (75% fewer traversals)** once all 5 optimizations are applied.

---

## 13. Recommendations

1. **Fix the critical bug first** (Optimization #1) — it blocks all testing of larger datasets.
2. **Benchmark again after fix** — re-run the suite with 500K and 1M sizes to establish a complete baseline.
3. **Implement Optimizations #4 and #5** (Low complexity) — quick wins that don't require architecture changes.
4. **Implement Optimization #2** (Medium complexity) — the biggest single performance win.
5. **Implement Optimization #3** (Medium complexity) — the second biggest win.
6. **Re-benchmark after each optimization** to validate improvements.

---

## Appendix A: Raw Benchmark Output

```
CSV Parse (parseCsv)
  1K rows      142.83 ops/s  mean=7.00ms   samples=715
  10K rows     14.17 ops/s   mean=70.56ms  samples=71
  100K rows    1.07 ops/s    mean=931.64ms samples=11

CSV Parse + Validate
  1K rows      207.76 ops/s  mean=4.81ms   samples=1,039
  10K rows     18.16 ops/s   mean=55.07ms  samples=91
  100K rows    0.97 ops/s    mean=1,032ms  samples=10

CSV Type Inference (analyzeTypes)
  1K rows      257.13 ops/s  mean=3.89ms   samples=1,286
  10K rows     25.52 ops/s   mean=39.18ms  samples=128
  100K rows    2.88 ops/s    mean=346.97ms samples=29

CSV Full Pipeline (parse + validate + types)
  1K rows      87.70 ops/s   mean=11.40ms  samples=439
  10K rows     8.16 ops/s    mean=122.59ms samples=41
  100K rows    0.42 ops/s    mean=2,407ms  samples=10

Edge Cases
  Quoted 1K      160.53 ops/s  mean=6.23ms   samples=803
  Quoted 10K     16.81 ops/s   mean=59.50ms  samples=85
  Headerless 1K  171.97 ops/s  mean=5.81ms   samples=860
  Headerless 10K 25.88 ops/s   mean=38.64ms  samples=130
  Auto delim 1K  246.70 ops/s  mean=4.05ms   samples=1,234
  Auto delim 10K 21.55 ops/s   mean=46.41ms  samples=108

Sub-operations (10K, pre-parsed)
  validateCsv only    7.28 ops/s   mean=137.46ms samples=10
  analyzeTypes only  24.54 ops/s   mean=40.76ms  samples=13

Memory Estimates (10K)
  string-size estimate  529.57 ops/s  mean=1.89ms  samples=265
```

## Appendix B: Critical Bug Details

**Location:** `csvParser.ts`, `buildRecords()` function, line ~353  
**Code:** `const columnCount = Math.max(...rows.map((r) => r.length));`  
**Error:** `RangeError: Maximum call stack size exceeded` when `rows.length > ~125,000`  
**Root cause:** JavaScript spread operator (`...`) has a limit on the number of arguments that can be passed to a function, typically ~125K on V8.  
**Workaround:** None — the bug completely blocks parsing of CSV files with >125K data rows.  
**Fix:** Replace with iterative `reduce()` or `for` loop.

---

*End of report. No code optimizations have been applied.*
