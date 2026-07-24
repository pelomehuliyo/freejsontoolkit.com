/**
 * CSV Module — RFC 4180 CSV Parser
 *
 * Parses CSV strings into structured record arrays.
 * Fully compliant with RFC 4180, handling:
 *   - Configurable delimiters (,, ;, |, :, \t)
 *   - Quoted fields containing delimiters, newlines, and escaped quotes ("")
 *   - Multiline quoted fields
 *   - Optional header rows
 *   - Blank-line skipping
 *   - Whitespace trimming (unquoted fields only)
 *
 * This module is pure, side-effect free, framework-independent,
 * and contains no DOM or browser APIs.
 */

import type { CsvDelimiter, CsvError, CsvRecord, DelimiterDetectionResult, ParseOptions, ParseResult, ParsedCsv } from "./types";
import { detectDelimiter } from "./delimiterDetection";

// ──────────────────────────────────────────────
// Internal Types
// ──────────────────────────────────────────────

/**
 * A single parsed field with position tracking.
 * The `wasQuoted` flag distinguishes fields that were wrapped in
 * double quotes — these should NOT have whitespace trimmed.
 */
interface ParsedField {
  value: string;
  wasQuoted: boolean;
  line: number;
  column: number;
}

/**
 * The raw output of the character-level parser.
 */
interface RawParseResult {
  rows: ParsedField[][];
  errors: CsvError[];
}

// ──────────────────────────────────────────────
// Public API
// ──────────────────────────────────────────────

/**
 * Parses a raw CSV string into a `ParseResult` containing a `ParsedCsv`
 * on success or an error on failure.
 *
 * @param csvStr  The raw CSV text to parse
 * @param options Parsing options (delimiter, header flag, trimming, blank-line skipping)
 * @returns       A `ParseResult<CsvRecord>` containing `csv` (ParsedCsv) or an `error`
 *
 * @example
 * ```ts
 * const result = parseCsv("a,b,c\n1,2,3");
 * // { success: true, csv: { records: [{ a: "1", b: "2", c: "3" }], headers: ["a","b","c"], delimiter: ",", warnings: [] } }
 * ```
 */
export function parseCsv(csvStr: string, options: ParseOptions = {}): ParseResult<CsvRecord> {
  const errors: CsvError[] = [];
  const warnings: CsvError[] = [];

  const hasHeader = options.hasHeader ?? true;
  const trimWhitespace = options.trimWhitespace ?? true;
  const skipEmptyLines = options.skipEmptyLines ?? false;

  // Resolve delimiter: auto-detect if requested
  let delimiter;
  let detection;

  if (options.delimiter === "auto") {
    detection = detectDelimiter(csvStr);
    delimiter = detection.delimiter;
  } else {
    delimiter = options.delimiter ?? ",";
  }

  // Validate delimiter
  const validDelimiters = [",", ";", "|", ":", "\t"];
  if (!validDelimiters.includes(delimiter)) {
    return {
      success: false,
      error: {
        code: "INVALID_DELIMITER",
        message: `Unsupported delimiter "${delimiter}". Supported: ${validDelimiters.map((d) => JSON.stringify(d)).join(", ")}`,
      },
    };
  }

  // 1. Strip optional UTF-8 BOM
  csvStr = csvStr.replace(/^\uFEFF/, "");

  // 2. Normalise line endings
  const normalized = normalizeEOL(csvStr);

  // 2. Character-level parse
  const { rows, errors: parseErrors } = parseRawRows(normalized, delimiter, skipEmptyLines);
  errors.push(...parseErrors);

  if (errors.length > 0) {
    return {
      success: false,
      error: errors[0],
    };
  }

  if (rows.length === 0) {
    return {
      success: false,
      error: {
        code: "NO_ROWS",
        message: "CSV input contains no data rows after parsing.",
      },
    };
  }

  // 3. Build records
  const { records, headers, warnings: buildWarnings } = buildRecords(rows, hasHeader, trimWhitespace);
  warnings.push(...buildWarnings);

  return {
    success: true,
    csv: {
      records,
      headers,
      delimiter,
      warnings,
      detection,
    },
  };
}

/**
 * Convenience wrapper that parses CSV and returns a pretty-printed JSON string.
 *
 * @param csvStr  Raw CSV input
 * @param options Parsing options
 * @returns       Pretty-printed JSON string
 * @throws        If parsing fails
 */
export function csvToJson(csvStr: string, options: ParseOptions = {}): string {
  const result = parseCsv(csvStr, options);
  if (!result.success || !result.csv) {
    const err = result.error ?? { code: "UNKNOWN", message: "Failed to parse CSV" };
    throw new Error(`[${err.code}] ${err.message}`);
  }
  return JSON.stringify(result.csv.records, null, 2);
}

// ──────────────────────────────────────────────
// Step 1: Normalise Line Endings
// ──────────────────────────────────────────────

/**
 * Normalises all line endings to Unix-style `\n`.
 *
 * Handles:
 *   - Windows `\r\n`  → `\n`
 *   - Old Mac `\r`    → `\n`
 *
 * @param input Raw CSV string with any line-ending convention
 * @returns     String with only `\n` line endings
 */
function normalizeEOL(input: string): string {
  return input.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

// ──────────────────────────────────────────────
// Step 2: Character-Level Parsing
// ──────────────────────────────────────────────

/**
 * Character-level finite-state parser for RFC 4180 CSV.
 *
 * Iterates through the input character by character, tracking:
 *   - Current field content
 *   - Whether we are inside double quotes
 *   - Current line and column numbers (for error reporting)
 *   - Row/field boundaries
 *
 * @param input          Normalised CSV string (Unix line endings)
 * @param delimiter      Field delimiter character
 * @param skipEmptyLines Whether to skip blank/empty lines
 * @returns              Parsed rows with position metadata
 */
function parseRawRows(
  input: string,
  delimiter: string,
  skipEmptyLines: boolean,
): RawParseResult {
  const rows: ParsedField[][] = [];
  const errors: CsvError[] = [];
  let currentFields: ParsedField[] = [];
  let currentField = "";
  let inQuotes = false;
  /** Dedicated flag set when an opening quote is encountered, used in pushField.
   *  This fixes the wasQuoted bug: the closing-quote handler clears inQuotes
   *  before pushField is called, so we need a separate flag that survives
   *  until the field is pushed. */
  let fieldWasQuoted = false;
  let line = 1;
  let col = 1;
  let fieldStartCol = 1;
  /** Tracks the line where the current field started, so unterminated-quote
   *  errors report the start position rather than the detection position. */
  let fieldStartLine = 1;
  let rowHasContent = false;

  // ── helpers ──────────────────────────────────

  /**
   * Finalises the current field and appends it to the row buffer.
   */
  function pushField(): void {
    currentFields.push({
      value: currentField,
      wasQuoted: fieldWasQuoted,
      line: fieldStartLine,
      column: fieldStartCol,
    });
    currentField = "";
    fieldWasQuoted = false;
    fieldStartCol = col + 1;
    fieldStartLine = line;
  }

  /**
   * Finalises the current row and appends it to the row list.
   * If `skipEmptyLines` is true and the row has no content, it is dropped.
   */
  function pushRow(): void {
    if (!rowHasContent && skipEmptyLines) {
      // Drop empty row — just reset
      currentFields = [];
      return;
    }
    rows.push(currentFields);
    currentFields = [];
    rowHasContent = false;
    // Reset fieldStartCol for the next row to fix line/column reporting
    fieldStartCol = 1;
    fieldStartLine = line + 1;
  }

  // ── main parse loop ──────────────────────────

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    const next = i + 1 < input.length ? input[i + 1] : null;

    if (inQuotes) {
      // ── Inside a quoted field ──────────────────
      if (ch === '"') {
        if (next === '"') {
          // Escaped double-quote inside quoted field
          currentField += '"';
          i++; // skip the next quote
          col++;
        } else {
          // Closing quote
          inQuotes = false;
        }
      } else if (ch === "\n") {
        // Multiline quoted field — keep newline in value
        currentField += "\n";
        line++;
        col = 0;
      } else {
        currentField += ch;
      }
    } else {
      // ── Outside quotes ─────────────────────────
      if (ch === '"') {
        // Start of quoted field
        inQuotes = true;
        fieldWasQuoted = true;
        rowHasContent = true;
      } else if (ch === delimiter) {
        // End of field
        pushField();
        col++;
      } else if (ch === "\n") {
        // End of row
        pushField();
        pushRow();
        line++;
        col = 0;
      } else {
        // Regular character
        currentField += ch;
        rowHasContent = true;
      }
    }

    col++;
  }

  // ── Handle final unterminated line ────────────

  if (inQuotes) {
    // Unterminated quote at end of input
    errors.push({
      code: "UNTERMINATED_QUOTE",
      message: `Unterminated double-quote starting at line ${fieldStartLine}, column ${fieldStartCol}.`,
      line: fieldStartLine,
      column: fieldStartCol,
    });
    // Still push the partial field so we return what we can
  }

  // Push the final field and row (unless we just pushed one on the last \n)
  if (currentField || rowHasContent || currentFields.length > 0) {
    pushField();
    pushRow();
  }

  return { rows, errors };
}

// ──────────────────────────────────────────────
// Step 3: Build Records
// ──────────────────────────────────────────────

/**
 * Transforms raw parsed rows into `CsvRecord[]`.
 *
 * When `hasHeader` is `true`, the first row supplies header names.
 * When `hasHeader` is `false`, synthetic keys (`column1`, `column2`, …) are used.
 *
 * Whitespace trimming:
 *   - Only applies to unquoted fields (`wasQuoted === false`).
 *   - Header names are ALWAYS trimmed.
 *   - Quoted fields preserve their original whitespace.
 *
 * @param rows            Parsed fields with position metadata
 * @param hasHeader       Whether the first row is a header row
 * @param trimWhitespace   Whether to trim whitespace from unquoted fields
 * @returns               An object with `records`, `headers`, and `warnings`
 */
function buildRecords(
  rows: ParsedField[][],
  hasHeader: boolean,
  trimWhitespace: boolean,
): { records: CsvRecord[]; headers: string[]; warnings: CsvError[] } {
  if (rows.length === 0) {
    return { records: [], headers: [], warnings: [] };
  }

  // Determine column count (use the longest row)
  // NOTE: Iterative approach to avoid JavaScript spread-operator argument limit (~125K).
  // Math.max(...rows.map(...)) would crash for CSV files with >125K rows.
  let columnCount = 0;
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].length > columnCount) {
      columnCount = rows[i].length;
    }
  }

  // Resolve headers
  let headers: string[];
  const warnings: CsvError[] = [];

  if (hasHeader) {
    // Use the first row as headers — always trimmed
    const headerRow = rows[0];
    headers = [];
    const seen = new Set<string>();
    for (let i = 0; i < columnCount; i++) {
      const raw = i < headerRow.length ? headerRow[i].value.trim() : "";
      const header = raw || `column${i + 1}`;
      if (seen.has(header)) {
        warnings.push({
          code: "DUPLICATE_HEADER",
          message: `Duplicate header "${header}" found at column ${i + 1}.`,
        });
      }
      seen.add(header);
      headers.push(header);
    }
  } else {
    // Synthetic headers: column1, column2, …
    headers = [];
    for (let i = 0; i < columnCount; i++) {
      headers.push(`column${i + 1}`);
    }
  }

  // Build data rows
  const dataRows = hasHeader ? rows.slice(1) : rows;
  const records: CsvRecord[] = [];

  for (const row of dataRows) {
    const record: CsvRecord = {};

    for (let i = 0; i < columnCount; i++) {
      const header = headers[i];
      let value: string;

      if (i < row.length) {
        const field = row[i];
        value = field.value;

        // Trim whitespace only for unquoted fields
        if (trimWhitespace && !field.wasQuoted) {
          value = value.trim();
        }
      } else {
        value = "";
      }

      record[header] = value;
    }

    records.push(record);
  }

  return { records, headers, warnings };
}

