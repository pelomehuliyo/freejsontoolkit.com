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
  delimiter?: string;
  hasHeader?: boolean;
  trimWhitespace?: boolean;
}

// ──────────────────────────────────────────────
// Parse Result
// ──────────────────────────────────────────────

export interface ParseResult<T = Record<string, unknown>> {
  success: boolean;
  data?: T[];
  errors: CsvError[];
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
// Flattened Record (internal helper type)
// ──────────────────────────────────────────────

export type FlattenedRecord = Record<string, unknown>;
