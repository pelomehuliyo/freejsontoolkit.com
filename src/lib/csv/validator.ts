/**
 * CSV Validation — Orchestrator
 *
 * Accepts a `ParseResult<CsvRecord>` (the output of parseCsv), runs all
 * enabled validation rules, computes statistics, and returns a structured
 * `ValidationResult`.
 *
 * Single context object (ParsedCsv) makes it easy to extend with future
 * parser metadata (delimiter, encoding, file size, BOM presence, etc.)
 * without changing function signatures.
 *
 * This module is deterministic, side-effect free, and framework-independent.
 */

import type {
  CsvRecord,
  ParseResult,
  ValidationIssue,
  ValidationOptions,
  ValidationResult,
} from "./types";
import { computeStatistics } from "./statistics";
import {
  checkDuplicateHeaders,
  checkEmptyFile,
  checkEmptyHeaders,
  checkEmptyValues,
  checkDuplicateRows,
  checkInconsistentColumnCounts,
  checkWhitespaceValues,
} from "./validationRules";

// ──────────────────────────────────────────────
// Default Rules Configuration
// ──────────────────────────────────────────────

/**
 * All rule codes that the validator knows about.
 * Keys match the `code` field of the issues they produce.
 */
const ALL_RULES: Record<string, boolean> = {
  DUPLICATE_HEADER: true,
  EMPTY_HEADER: true,
  INCONSISTENT_COLUMN_COUNT: true,
  DUPLICATE_ROW: true,
  EMPTY_VALUE: true,
  WHITESPACE_VALUE: true,
  EMPTY_FILE: true,
};

// ──────────────────────────────────────────────
// Public API
// ──────────────────────────────────────────────

/**
 * Validates a parsed CSV and returns structured results including all
 * issues found and computed statistics.
 *
 * @param parsedCsv — The result object from `parseCsv()`
 * @param options   — Optional validation options (rule toggles)
 * @returns         A `ValidationResult` with issues and statistics
 *
 * @example
 * const parsed = parseCsv("a,b\n1,2\n3,4");
 * const result = validateCsv(parsed);
 * // { valid: true, issues: [], statistics: { rowCount: 2, ... } }
 *
 * @example
 * const parsed = parseCsv("a,a,b\n1,2,3");
 * const result = validateCsv(parsed);
 * // { valid: true, issues: [DUPLICATE_HEADER warning], statistics: { ... } }
 */
export function validateCsv(
  parsedCsv: ParseResult<CsvRecord>,
  options: ValidationOptions = {},
): ValidationResult {
  const issues: ValidationIssue[] = [];

  // Resolve which rules are enabled
  const enabledRules = { ...ALL_RULES, ...options.rules };

  // ── Guard: parser must have succeeded ──
  if (!parsedCsv.success || !parsedCsv.csv) {
    return {
      valid: false,
      issues: [
        {
          severity: "error",
          code: "PARSE_FAILURE",
          message: parsedCsv.error?.message ?? "CSV parsing failed with an unknown error.",
          suggestion: "Check the CSV syntax and try again.",
        },
      ],
      statistics: {
        rowCount: 0,
        columnCount: 0,
        emptyCellCount: 0,
        duplicateHeaderCount: 0,
        duplicateRowCount: 0,
        inconsistentRowCount: 0,
      },
    };
  }

  const { records, headers } = parsedCsv.csv;

  // ── Run header-based rules (only when headers are available) ──
  if (headers.length > 0) {
    if (enabledRules.DUPLICATE_HEADER) {
      issues.push(...checkDuplicateHeaders(headers));
    }
    if (enabledRules.EMPTY_HEADER) {
      issues.push(...checkEmptyHeaders(headers));
    }
  }

  // ── Run record-based rules ──
  if (enabledRules.EMPTY_FILE) {
    issues.push(...checkEmptyFile(records));
  }

  // If the file is empty, skip remaining record-level checks
  if (records.length > 0) {
    if (enabledRules.INCONSISTENT_COLUMN_COUNT && headers.length > 0) {
      issues.push(...checkInconsistentColumnCounts(records, headers.length));
    }
    if (enabledRules.DUPLICATE_ROW) {
      issues.push(...checkDuplicateRows(records));
    }
    if (enabledRules.EMPTY_VALUE) {
      issues.push(...checkEmptyValues(records));
    }
    if (enabledRules.WHITESPACE_VALUE) {
      issues.push(...checkWhitespaceValues(records));
    }
  }

  // ── Compute statistics ──
  const statistics = computeStatistics(records, headers);

  // ── Determine validity ──
  const hasErrors = issues.some((issue) => issue.severity === "error");

  return {
    valid: !hasErrors,
    issues,
    statistics,
  };
}
