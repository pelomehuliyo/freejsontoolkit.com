/**
 * CSV Validation — Statistics
 *
 * Pure, deterministic statistics computed from parsed CSV data.
 * No I/O, no side effects, no framework dependencies.
 */

import type { CsvRecord, CsvStatistics } from "./types";
import { serializeRecord } from "./helpers";

// ──────────────────────────────────────────────
// Public API
// ──────────────────────────────────────────────

/**
 * Computes deterministic statistics from parsed CSV records and headers.
 *
 * @param records — Parsed data records (excluding header row)
 * @param headers — Resolved header names from the parser
 * @returns       A `CsvStatistics` object with computed values
 *
 * @example
 * const stats = computeStatistics(
 *   [{ a: "1", b: "2" }, { a: "3", b: "" }],
 *   ["a", "b"]
 * );
 * // { rowCount: 2, columnCount: 2, emptyCellCount: 1, ... }
 */
export function computeStatistics(
    records: CsvRecord[],
    headers: string[],
): CsvStatistics {
    const rowCount = records.length;
    const columnCount = headers.length;

    // ── Empty cell count ─────────────────────
    let emptyCellCount = 0;
    for (const record of records) {
        for (const key of headers) {
            if (record[key] === "") {
                emptyCellCount++;
            }
        }
    }

    // ── Duplicate header count ───────────────
    const headerSeen = new Set<string>();
    let duplicateHeaderCount = 0;
    for (const header of headers) {
        if (headerSeen.has(header)) {
            duplicateHeaderCount++;
        } else {
            headerSeen.add(header);
        }
    }

    // ── Duplicate row count ──────────────────
    const rowSeen = new Set<string>();
    let duplicateRowCount = 0;
    for (const record of records) {
        const key = serializeRecord(record);
        if (rowSeen.has(key)) {
            duplicateRowCount++;
        } else {
            rowSeen.add(key);
        }
    }

    // ── Inconsistent row count ───────────────
    let inconsistentRowCount = 0;
    for (const record of records) {
        const actualCount = Object.keys(record).length;
        if (actualCount !== columnCount) {
            inconsistentRowCount++;
        }
    }

    return {
        rowCount,
        columnCount,
        emptyCellCount,
        duplicateHeaderCount,
        duplicateRowCount,
        inconsistentRowCount,
    };
}



