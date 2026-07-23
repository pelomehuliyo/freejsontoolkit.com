/**
 * CSV Module — CSV Parser
 *
 * Parses CSV strings into structured data / record arrays.
 * Handles RFC 4180 escaping, configurable delimiters, and headers.
 */

import type { CsvError, ParseOptions, ParseResult } from "./types";

// ──────────────────────────────────────────────
// Public API
// ──────────────────────────────────────────────

/**
 * Parses a raw CSV string into an array of records.
 *
 * By default the first line is treated as a header row and
 * each subsequent line becomes a record keyed by those headers.
 *
 * Set `hasHeader: false` to return positional arrays instead.
 */
export function parseCsv<T = Record<string, unknown>>(
  csvStr: string,
  options: ParseOptions = {},
): ParseResult<T> {
  const errors: CsvError[] = [];
  const { delimiter = ",", hasHeader = true, trimWhitespace = true } = options;

  // Normalise line endings
  const normalized = csvStr.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = normalized.split("\n").filter((line) => line.length > 0 || line === "\n");

  if (lines.length === 0) {
    return {
      success: false,
      errors: [{ code: "EMPTY_INPUT", message: "CSV input is empty." }],
    };
  }

  // Parse all lines into row-based cell arrays
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = "";
  let inQuotes = false;
  let lineIndex = 0;

  for (const rawLine of lines) {
    const chars = rawLine.split("");
    for (let i = 0; i < chars.length; i++) {
      const ch = chars[i];
      const next = chars[i + 1];

      if (inQuotes) {
        if (ch === '"') {
          if (next === '"') {
            currentField += '"';
            i++; // skip escaped quote
          } else {
            inQuotes = false;
          }
        } else {
          currentField += ch;
        }
      } else {
        if (ch === '"') {
          inQuotes = true;
        } else if (ch === delimiter) {
          currentRow.push(trimWhitespace ? currentField.trim() : currentField);
          currentField = "";
        } else if (ch === "\n") {
          currentRow.push(trimWhitespace ? currentField.trim() : currentField);
          currentField = "";
          rows.push(currentRow);
          currentRow = [];
        } else {
          currentField += ch;
        }
      }
    }
    lineIndex++;
  }

  // Push last field if present
  if (currentField || currentRow.length > 0) {
    currentRow.push(trimWhitespace ? currentField.trim() : currentField);
    rows.push(currentRow);
  }

  if (rows.length === 0) {
    return {
      success: false,
      errors: [{ code: "NO_ROWS", message: "No CSV rows could be parsed." }],
    };
  }

  // Determine column count (use longest row as reference)
  const maxCols = Math.max(...rows.map((r) => r.length));

  // Normalise row lengths (pad shorter rows)
  for (const row of rows) {
    while (row.length < maxCols) {
      row.push("");
    }
  }

  // Build result
  if (hasHeader) {
    const headers = rows[0];
    const dataRows = rows.slice(1);
    const data = dataRows.map((row) => {
      const record: Record<string, unknown> = {};
      headers.forEach((h, i) => {
        record[h] = row[i] ?? "";
      });
      return record as unknown as T;
    });

    return { success: true, data, errors };
  } else {
    // Without headers, return array of arrays as records keyed by index
    const data = rows.map((row) => {
      const record: Record<string, unknown> = {};
      row.forEach((cell, i) => {
        record[String(i)] = cell;
      });
      return record as unknown as T;
    });

    return { success: true, data, errors };
  }
}

/**
 * Converts a CSV string to a JSON string (pretty-printed).
 */
export function csvToJson(csvStr: string, options: ParseOptions = {}): string {
  const result = parseCsv(csvStr, options);
  if (!result.success || !result.data) {
    throw new Error(result.errors.map((e) => e.message).join("; ") || "Failed to parse CSV");
  }
  return JSON.stringify(result.data, null, 2);
}
