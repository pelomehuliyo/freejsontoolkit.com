/**
 * CSV Validation — Independent Rule Functions
 *
 * Each function is a single-purpose, pure validation check that accepts only
 * the data it needs (headers, records, or row metadata) and returns an array
 * of `ValidationIssue` objects.
 *
 * Every rule is deterministic, side-effect free, and framework-independent.
 */

import type { CsvRecord, ValidationIssue } from "./types";

// ──────────────────────────────────────────────
// Helper
// ──────────────────────────────────────────────

/**
 * Serialises a CsvRecord to a stable string for duplicate comparison.
 * Keys are sorted alphabetically to ensure consistent hashing.
 */
function serializeRecord(record: CsvRecord): string {
    const keys = Object.keys(record).sort();
    const parts = keys.map((k) => `${k}:${record[k]}`);
    return parts.join("|");
}

// ──────────────────────────────────────────────
// Rule: Duplicate Headers
// ──────────────────────────────────────────────

/**
 * Detects header names that appear more than once in the header row.
 *
 * @param headers — Resolved header name array from the parser
 * @returns       Validation issues with severity `warning`
 *
 * @example
 * checkDuplicateHeaders(["a", "a", "b"])
 * // → [{ severity: "warning", code: "DUPLICATE_HEADER", message: "...", column: 2, suggestion: "..." }]
 */
export function checkDuplicateHeaders(headers: string[]): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const seen = new Map<string, number[]>();

    for (let i = 0; i < headers.length; i++) {
        const header = headers[i];
        if (!seen.has(header)) {
            seen.set(header, []);
        }
        seen.get(header)!.push(i);
    }

    for (const [name, positions] of seen) {
        if (positions.length > 1) {
            // Report each duplicate after the first occurrence
            for (let j = 1; j < positions.length; j++) {
                const col = positions[j];
                issues.push({
                    severity: "warning",
                    code: "DUPLICATE_HEADER",
                    message: `Duplicate header "${name}" found at column ${col + 1}.`,
                    column: col,
                    suggestion: `Rename or deduplicate the header at column ${col + 1} to make it unique.`,
                });
            }
        }
    }

    return issues;
}

// ──────────────────────────────────────────────
// Rule: Empty Headers
// ──────────────────────────────────────────────

/**
 * Detects header names that are empty or whitespace-only strings.
 *
 * @param headers — Resolved header name array from the parser
 * @returns       Validation issues with severity `error`
 *
 * @example
 * checkEmptyHeaders(["a", "", "  "])
 * // → [{ severity: "error", code: "EMPTY_HEADER", message: "...", column: 1, suggestion: "..." }]
 */
export function checkEmptyHeaders(headers: string[]): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    for (let i = 0; i < headers.length; i++) {
        const header = headers[i];
        if (header === "" || header.trim() === "") {
            issues.push({
                severity: "error",
                code: "EMPTY_HEADER",
                message: `Header at column ${i + 1} is empty or whitespace-only.`,
                column: i,
                suggestion: `Provide a descriptive header name for column ${i + 1}.`,
            });
        }
    }

    return issues;
}

// ──────────────────────────────────────────────
// Rule: Inconsistent Column Counts
// ──────────────────────────────────────────────

/**
 * Detects data rows whose number of columns differs from the expected
 * header count. Both short rows (missing fields) and long rows (extra fields)
 * are flagged.
 *
 * @param records             — Parsed data records
 * @param expectedColumnCount — The expected number of columns (header count)
 * @returns                   Validation issues with severity `error`
 *
 * @example
 * checkInconsistentColumnCounts([{ a: "1", b: "2" }, { a: "3" }], 2)
 * // → [{ severity: "error", code: "INCONSISTENT_COLUMN_COUNT", row: 1, ... }]
 */
export function checkInconsistentColumnCounts(
    records: CsvRecord[],
    expectedColumnCount: number,
): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    for (let i = 0; i < records.length; i++) {
        const actualCount = Object.keys(records[i]).length;
        if (actualCount !== expectedColumnCount) {
            issues.push({
                severity: "error",
                code: "INCONSISTENT_COLUMN_COUNT",
                message: `Row ${i + 1} has ${actualCount} columns, but expected ${expectedColumnCount}.`,
                row: i,
                suggestion:
                    actualCount < expectedColumnCount
                        ? `Add missing values for row ${i + 1} to match the ${expectedColumnCount} expected columns.`
                        : `Remove extra values in row ${i + 1} to match the ${expectedColumnCount} expected columns.`,
            });
        }
    }

    return issues;
}

// ──────────────────────────────────────────────
// Rule: Duplicate Rows
// ──────────────────────────────────────────────

/**
 * Detects data rows that are exact duplicates of one another.
 *
 * @param records — Parsed data records
 * @returns       Validation issues with severity `warning`
 *
 * @example
 * checkDuplicateRows([{ a: "1" }, { a: "1" }, { a: "2" }])
 * // → [{ severity: "warning", code: "DUPLICATE_ROW", row: 1, suggestion: "..." }]
 */
export function checkDuplicateRows(records: CsvRecord[]): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const seen = new Map<string, number>();

    for (let i = 0; i < records.length; i++) {
        const key = serializeRecord(records[i]);
        if (seen.has(key)) {
            issues.push({
                severity: "warning",
                code: "DUPLICATE_ROW",
                message: `Row ${i + 1} is a duplicate of row ${(seen.get(key) as number) + 1}.`,
                row: i,
                suggestion: `Remove the duplicate row ${i + 1} unless it is intentional.`,
            });
        } else {
            seen.set(key, i);
        }
    }

    return issues;
}

// ──────────────────────────────────────────────
// Rule: Empty Values
// ──────────────────────────────────────────────

/**
 * Detects cells that contain empty string values. Optionally, a set of allowed
 * empty columns can be provided to skip certain columns from this check.
 *
 * @param records           — Parsed data records
 * @param ignoreColumns     — Optional set of column names to skip (e.g. ["notes"])
 * @returns                 Validation issues with severity `warning`
 *
 * @example
 * checkEmptyValues([{ a: "1", b: "" }])
 * // → [{ severity: "warning", code: "EMPTY_VALUE", row: 0, column: 1, suggestion: "..." }]
 */
export function checkEmptyValues(
    records: CsvRecord[],
    ignoreColumns?: Set<string>,
): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    for (let i = 0; i < records.length; i++) {
        const record = records[i];
        let col = 0;
        for (const [key, value] of Object.entries(record)) {
            if (ignoreColumns?.has(key)) {
                col++;
                continue;
            }
            if (value === "") {
                issues.push({
                    severity: "warning",
                    code: "EMPTY_VALUE",
                    message: `Empty value found in row ${i + 1}, column "${key}".`,
                    row: i,
                    column: col,
                    suggestion: `Provide a value for "${key}" in row ${i + 1}, or use a placeholder if intentionally empty.`,
                });
            }
            col++;
        }
    }

    return issues;
}

// ──────────────────────────────────────────────
// Rule: Whitespace-Only Values
// ──────────────────────────────────────────────

/**
 * Detects cells that contain only whitespace characters (spaces, tabs, etc.)
 * but are not empty. These are often data-entry errors.
 *
 * @param records           — Parsed data records
 * @param ignoreColumns     — Optional set of column names to skip
 * @returns                 Validation issues with severity `warning`
 *
 * @example
 * checkWhitespaceValues([{ a: "1", b: "   " }])
 * // → [{ severity: "warning", code: "WHITESPACE_VALUE", row: 0, column: 1, suggestion: "..." }]
 */
export function checkWhitespaceValues(
    records: CsvRecord[],
    ignoreColumns?: Set<string>,
): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    for (let i = 0; i < records.length; i++) {
        const record = records[i];
        let col = 0;
        for (const [key, value] of Object.entries(record)) {
            if (ignoreColumns?.has(key)) {
                col++;
                continue;
            }
            if (value !== "" && value.trim() === "") {
                issues.push({
                    severity: "warning",
                    code: "WHITESPACE_VALUE",
                    message: `Whitespace-only value found in row ${i + 1}, column "${key}".`,
                    row: i,
                    column: col,
                    suggestion: `Remove the invisible whitespace characters or provide a real value for "${key}" in row ${i + 1}.`,
                });
            }
            col++;
        }
    }

    return issues;
}

// ──────────────────────────────────────────────
// Rule: Empty File
// ──────────────────────────────────────────────

/**
 * Detects when the parsed CSV contains zero data records.
 *
 * @param records — Parsed data records
 * @returns       Validation issues with severity `error`
 *
 * @example
 * checkEmptyFile([])
 * // → [{ severity: "error", code: "EMPTY_FILE", message: "...", suggestion: "..." }]
 */
export function checkEmptyFile(records: CsvRecord[]): ValidationIssue[] {
    if (records.length === 0) {
        return [
            {
                severity: "error",
                code: "EMPTY_FILE",
                message: "CSV file contains no data records.",
                suggestion: "Ensure the CSV has at least one data row after the optional header.",
            },
        ];
    }
    return [];
}

