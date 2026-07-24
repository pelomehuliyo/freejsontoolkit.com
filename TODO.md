# Sprint 3.3 — Type Inference Implementation Steps

## Step 1: Add new types to `types.ts`
- [ ] Add `InferredCellType` union type
- [ ] Add `ColumnTypeProfile` interface
- [ ] Add `TypeAnalysis` interface
- [ ] Add `TypeInferenceOptions` interface (compact `detect` array pattern)

## Step 2: Implement `typeInference.ts`
- [ ] Classify value regex patterns (INTEGER_RE, FLOAT_RE, BOOLEAN_RE, NULL_RE)
- [ ] `classifyValue(value, options)` internal helper
- [ ] `buildColumnProfile(column, values, options)` internal helper
- [ ] `analyzeTypes(parsedCsv, options?)` public API
- [ ] `applyTypes(parsedCsv, analysis)` public API

## Step 3: Write comprehensive test suite
- [ ] Cell-level classification tests
- [ ] Column-level analysis tests
- [ ] Integration tests (parse → analyze → apply)
- [ ] Edge case tests (leading zeros, scientific notation, etc.)
- [ ] Option toggle tests (`detect: ["integer"]`, `detect: []`, etc.)
- [ ] Large input performance sanity test

## Step 4: Verify no regressions
- [ ] Run existing CSV parser tests
- [ ] Run existing validator tests
- [ ] Run new type inference tests

