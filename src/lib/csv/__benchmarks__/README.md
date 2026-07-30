# CSV Engine — Performance Benchmarks

## Overview

This benchmark suite measures baseline performance of the CSV engine before any optimizations are applied. It covers parsing, validation, type inference, and full-pipeline throughput across multiple CSV sizes.

## Running

```bash
# Run all benchmarks (1K, 10K, 100K, 500K, 1M rows)
npx vitest bench --run

# Run benchmarks for specific sizes (filter by name)
npx vitest bench --run "CSV Parse"

# Run with detailed output (no colors for piping to file)
npx vitest bench --run --reporter=verbose
```

## Sizes

| Label | Rows      | Est. Size | Description                  |
| ----- | --------- | --------- | ---------------------------- |
| 1K    | 1,000     | ~50 KB    | Small — quick smoke test     |
| 10K   | 10,000    | ~500 KB   | Medium — typical user input  |
| 100K  | 100,000   | ~5 MB     | Large — triggers worker path |
| 500K  | 500,000   | ~25 MB    | X-Large — stress test        |
| 1M    | 1,000,000 | ~50 MB    | XX-Large — upper limit       |

## Metrics Collected

- **Parse time**: `parseCsv()` only — pure character-level FSM
- **Validation time**: `parseCsv()` + `validateCsv()` — parse + 7 rule checks
- **Type inference time**: `parseCsv()` + `analyzeTypes()` — parse + STRICT inference
- **Full pipeline**: parse + validate + type inference — end-to-end
- **Memory estimate**: approximate string sizes (UTF-16) for input, fields, headers

## Edge Case Tests

- **Quoted fields**: Every field wrapped in double quotes (worst-case for FSM)
- **Irregular columns**: Rows with varying column counts (8-12 per row)
- **No headers**: Synthetic column name generation
- **Auto delimiter**: Delimiter detection overhead
- **No trimming**: Skip whitespace normalization

## Data

All benchmark data is generated deterministically using a seeded PRNG (seed=42).
Results are reproducible across runs.

## Results

After running, report results in `results/baseline-<date>.md`.
