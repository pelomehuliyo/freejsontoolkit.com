# TODO: CSV Module Restructure

## Priority 1 — Fix Broken Imports First
- [x] Fix `src/lib/lib/json-to-csv.worker.ts` import path: `./converter` → `../converter`
- [x] Fix `src/pages/tools/json-to-csv.astro` import path: `../../lib/json/converter` → `../../lib/converter`
- [x] Fix `src/pages/tools/json-to-csv.astro` Worker URL path: `../../lib/json/` → `../../lib/lib/`

## Priority 2 — Create Centralized Types
- [x] Create `src/lib/csv/types.ts`

## Priority 3 — Create Validation Module
- [x] Create `src/lib/csv/validation.ts`

## Priority 4 — Create Parser & Formatter Modules
- [x] Create `src/lib/csv/csvParser.ts`
- [x] Create `src/lib/csv/jsonFormatter.ts`
- [x] Create `src/lib/csv/autoConvert.ts`

## Priority 5 — Refactor converter.ts
- [x] Refactor `src/lib/converter.ts` to re-export from new `./csv/` modules

## Priority 6 — Verify Build
- [ ] Run `astro build` to verify everything compiles

## Priority 7 — Clean Up
- [ ] Remove stale empty `src/lib/lib/csv/` stub files (after build verified)
