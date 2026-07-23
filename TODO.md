# CSV Parser Implementation — TODO

## Completed
- [x] Read existing types, converter, validation, existing parser stub
- [x] Plan approved with adjustments
- [x] Rewrite `src/lib/csv/csvParser.ts` with helpers:
  - `normalizeEOL()` — normalize `\r\n` / `\r` to `\n`
  - `parseRawRows()` — RFC 4180 character-by-character state machine
    - Supports delimiters: `,` `;` `|` `:` `\t`
    - Quoted fields with `""` escape
    - Multiline quoted fields
    - Blank-line skipping (`skipEmptyLines`)
    - Line/col tracking for syntax errors
  - `buildRecords()` — transform parsed rows into `CsvRecord[]`
    - `hasHeader: true` → first row as header keys (always trimmed)
    - `hasHeader: false` → `column1, column2, ...` keys
    - `trimWhitespace` only on unquoted fields
  - `parseCsv()` — main orchestrator, returns `ParseResult<CsvRecord>`
  - `csvToJson()` — convenience wrapper (preserved)
  - JSDoc comments on all exported functions and helpers
- [x] Run existing tests — **28/28 passed** 🟢

