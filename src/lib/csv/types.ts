/**
 * CSV Module — Shared Types & Interfaces
 *
 * Centralises all type definitions for the CSV utility modules.
 * Every other module in src/lib/csv/ should import from here
 * instead of redefining types.
 */

// ──────────────────────────────────────────────
// Conversion Options (JSON → CSV)
// ──────────────────────────────────────────────

export interface ConversionOptions {
  delimiter?: "," | ";" | "\t";
  flatten?: boolean;
  includeHeaders?: boolean;
}

// ──────────────────────────────────────────────
// Parse Options (CSV → structured data)
// ──────────────────────────────────────────────

export interface ParseOptions {
  delimiter?: "," | ";" | "\t" | "|" | ":";
  hasHeader?: boolean;
  trimWhitespace?: boolean;
  skipEmptyLines?: boolean;
}

// ──────────────────────────────────────────────
// Parse Result
// ──────────────────────────────────────────────

export interface ParseResult<T> {
  success: boolean;
  data?: T[];
  error?: CsvError;
  warnings?: CsvError[];
}

// ──────────────────────────────────────────────
// CSV Error
// ──────────────────────────────────────────────

export interface CsvError {
  code: string;
  message: string;
  line?: number;
  column?: number;
}

// ──────────────────────────────────────────────
// CsvRecord
// ──────────────────────────────────────────────

export interface CsvRecord {
  [key: string]: string;
}

// ──────────────────────────────────────────────
// Flattened Record (internal helper type)
// ──────────────────────────────────────────────

export type FlattenedRecord = Record<string, unknown>;
