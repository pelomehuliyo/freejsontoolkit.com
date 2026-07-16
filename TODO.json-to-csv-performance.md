# JSON → CSV performance audit (plan/work log)

- [x] Add Web Worker: `src/lib/json/json-to-csv.worker.ts`
- [x] Update UI logic in `src/pages/tools/json-to-csv.astro`:
  - [x] Convert happens only on Convert button click
  - [x] Add safe-size guard (MAX_INPUT_CHARS=2_500_000)
  - [x] Loading/progress text shown via `#csv-status`
  - [x] Disable Convert/Copy/Download while converting
  - [x] Move conversion to Web Worker for inputs above USE_WORKER_ABOVE_CHARS=400_000
  - [x] Refuse conversion (warn instead of freeze) when input exceeds MAX_INPUT_CHARS
- [ ] Manual test:
  - [ ] small JSON -> works
  - [ ] large JSON > MAX_INPUT_CHARS -> warning shown
  - [ ] medium/large JSON -> worker progress updates and UI stays responsive


