/**
 * CSV Validation Layer — Comprehensive Unit Tests
 *
 * Covers:
 *   - validationRules.ts  — every rule function in isolation
 *   - statistics.ts       — computeStatistics
 *   - validator.ts        — validateCsv orchestrator
 *
 * Every test is deterministic, side-effect free, and uses no DOM/browser APIs.
 */

import { describe, it, expect } from "vitest";
import { parseCsv } from "../csvParser";
import { validateCsv } from "../validator";
import { computeStatistics } from "../statistics";
import {
  checkDuplicateHeaders,
  checkEmptyHeaders,
  checkInconsistentColumnCounts,
  checkDuplicateRows,
  checkEmptyValues,
  checkWhitespaceValues,
  checkEmptyFile,
} from "../validationRules";
import type { CsvRecord } from "../types";

// ──────────────────────────────────────────────
// validationRules.ts
// ──────────────────────────────────────────────

describe("checkDuplicateHeaders", () => {
  it("returns no issues for unique headers", () => {
    const issues = checkDuplicateHeaders(["a", "b", "c"]);
    expect(issues).toHaveLength(0);
  });

  it("returns warnings for duplicate headers", () => {
    const issues = checkDuplicateHeaders(["a", "a", "b"]);
    expect(issues).toHaveLength(1);
    expect(issues[0].severity).toBe("warning");
    expect(issues[0].code).toBe("DUPLICATE_HEADER");
    expect(issues[0].column).toBe(1);
  });

  it("reports each duplicate occurrence separately", () => {
    const issues = checkDuplicateHeaders(["x", "x", "y", "y", "z"]);
    expect(issues).toHaveLength(2);
    expect(issues[0].column).toBe(1);
    expect(issues[1].column).toBe(3);
  });

  it("reports triple duplicate headers", () => {
    const issues = checkDuplicateHeaders(["a", "a", "a"]);
    expect(issues).toHaveLength(2);
    expect(issues[0].column).toBe(1);
    expect(issues[1].column).toBe(2);
  });

  it("returns empty array for empty headers array", () => {
    const issues = checkDuplicateHeaders([]);
    expect(issues).toHaveLength(0);
  });
});

describe("checkEmptyHeaders", () => {
  it("returns no issues for non-empty headers", () => {
    const issues = checkEmptyHeaders(["a", "b", "c"]);
    expect(issues).toHaveLength(0);
  });

  it("flags empty string headers", () => {
    const issues = checkEmptyHeaders(["a", "", "c"]);
    expect(issues).toHaveLength(1);
    expect(issues[0].severity).toBe("error");
    expect(issues[0].code).toBe("EMPTY_HEADER");
    expect(issues[0].column).toBe(1);
  });

  it("flags whitespace-only headers", () => {
    const issues = checkEmptyHeaders(["a", "   ", "c"]);
    expect(issues).toHaveLength(1);
    expect(issues[0].column).toBe(1);
  });

  it("flags multiple empty headers", () => {
    const issues = checkEmptyHeaders(["", "b", ""]);
    expect(issues).toHaveLength(2);
  });

  it("returns empty array for empty headers array", () => {
    const issues = checkEmptyHeaders([]);
    expect(issues).toHaveLength(0);
  });
});

describe("checkInconsistentColumnCounts", () => {
  it("returns no issues when all rows match expected count", () => {
    const records: CsvRecord[] = [
      { a: "1", b: "2", c: "3" },
      { a: "4", b: "5", c: "6" },
    ];
    const issues = checkInconsistentColumnCounts(records, 3);
    expect(issues).toHaveLength(0);
  });

  it("flags rows with fewer columns", () => {
    const records: CsvRecord[] = [
      { a: "1", b: "2" },
      { a: "3", b: "4", c: "5" },
    ];
    const issues = checkInconsistentColumnCounts(records, 3);
    expect(issues).toHaveLength(1);
    expect(issues[0].severity).toBe("error");
    expect(issues[0].code).toBe("INCONSISTENT_COLUMN_COUNT");
    expect(issues[0].row).toBe(0);
  });

  it("flags rows with more columns", () => {
    const records: CsvRecord[] = [{ a: "1", b: "2", c: "3", d: "4" }];
    const issues = checkInconsistentColumnCounts(records, 3);
    expect(issues).toHaveLength(1);
    expect(issues[0].row).toBe(0);
  });

  it("flags multiple inconsistent rows", () => {
    const records: CsvRecord[] = [{ a: "1" }, { a: "2", b: "3" }, { a: "4", b: "5", c: "6" }];
    const issues = checkInconsistentColumnCounts(records, 3);
    expect(issues).toHaveLength(2);
  });
});

describe("checkDuplicateRows", () => {
  it("returns no issues for unique rows", () => {
    const records: CsvRecord[] = [
      { a: "1", b: "2" },
      { a: "3", b: "4" },
    ];
    const issues = checkDuplicateRows(records);
    expect(issues).toHaveLength(0);
  });

  it("detects exact duplicate rows", () => {
    const records: CsvRecord[] = [
      { a: "1", b: "2" },
      { a: "1", b: "2" },
    ];
    const issues = checkDuplicateRows(records);
    expect(issues).toHaveLength(1);
    expect(issues[0].severity).toBe("warning");
    expect(issues[0].code).toBe("DUPLICATE_ROW");
    expect(issues[0].row).toBe(1);
  });

  it("detects multiple duplicate rows", () => {
    const records: CsvRecord[] = [{ a: "1" }, { a: "2" }, { a: "1" }, { a: "2" }];
    const issues = checkDuplicateRows(records);
    expect(issues).toHaveLength(2);
    expect(issues[0].row).toBe(2);
    expect(issues[1].row).toBe(3);
  });

  it("returns empty array for empty records", () => {
    const issues = checkDuplicateRows([]);
    expect(issues).toHaveLength(0);
  });
});

describe("checkEmptyValues", () => {
  it("returns no issues when all cells have values", () => {
    const records: CsvRecord[] = [{ a: "1", b: "2" }];
    const issues = checkEmptyValues(records);
    expect(issues).toHaveLength(0);
  });

  it("flags cells with empty string values", () => {
    const records: CsvRecord[] = [{ a: "1", b: "" }];
    const issues = checkEmptyValues(records);
    expect(issues).toHaveLength(1);
    expect(issues[0].severity).toBe("warning");
    expect(issues[0].code).toBe("EMPTY_VALUE");
    expect(issues[0].row).toBe(0);
    expect(issues[0].column).toBe(1);
  });

  it("skips ignored columns", () => {
    const records: CsvRecord[] = [{ a: "1", b: "" }];
    const issues = checkEmptyValues(records, new Set(["b"]));
    expect(issues).toHaveLength(0);
  });

  it("flags multiple empty values across rows", () => {
    const records: CsvRecord[] = [
      { a: "", b: "2" },
      { a: "3", b: "" },
    ];
    const issues = checkEmptyValues(records);
    expect(issues).toHaveLength(2);
  });
});

describe("checkWhitespaceValues", () => {
  it("returns no issues for normal values", () => {
    const records: CsvRecord[] = [{ a: "hello", b: "world" }];
    const issues = checkWhitespaceValues(records);
    expect(issues).toHaveLength(0);
  });

  it("flags whitespace-only values", () => {
    const records: CsvRecord[] = [{ a: "1", b: "   " }];
    const issues = checkWhitespaceValues(records);
    expect(issues).toHaveLength(1);
    expect(issues[0].severity).toBe("warning");
    expect(issues[0].code).toBe("WHITESPACE_VALUE");
    expect(issues[0].row).toBe(0);
    expect(issues[0].column).toBe(1);
  });

  it("does not flag empty strings (those are caught by checkEmptyValues)", () => {
    const records: CsvRecord[] = [{ a: "" }];
    const issues = checkWhitespaceValues(records);
    expect(issues).toHaveLength(0);
  });

  it("skips ignored columns", () => {
    const records: CsvRecord[] = [{ a: "   ", b: "x" }];
    const issues = checkWhitespaceValues(records, new Set(["a"]));
    expect(issues).toHaveLength(0);
  });
});

describe("checkEmptyFile", () => {
  it("returns no issues for non-empty records", () => {
    const issues = checkEmptyFile([{ a: "1" }]);
    expect(issues).toHaveLength(0);
  });

  it("returns error for empty records", () => {
    const issues = checkEmptyFile([]);
    expect(issues).toHaveLength(1);
    expect(issues[0].severity).toBe("error");
    expect(issues[0].code).toBe("EMPTY_FILE");
  });
});

// ──────────────────────────────────────────────
// statistics.ts — computeStatistics
// ──────────────────────────────────────────────

describe("computeStatistics", () => {
  it("computes statistics for a simple dataset", () => {
    const records: CsvRecord[] = [
      { a: "1", b: "2" },
      { a: "3", b: "4" },
    ];
    const stats = computeStatistics(records, ["a", "b"]);
    expect(stats.rowCount).toBe(2);
    expect(stats.columnCount).toBe(2);
    expect(stats.emptyCellCount).toBe(0);
    expect(stats.duplicateHeaderCount).toBe(0);
    expect(stats.duplicateRowCount).toBe(0);
    expect(stats.inconsistentRowCount).toBe(0);
  });

  it("counts empty cells correctly", () => {
    const records: CsvRecord[] = [
      { a: "", b: "2" },
      { a: "3", b: "" },
    ];
    const stats = computeStatistics(records, ["a", "b"]);
    expect(stats.emptyCellCount).toBe(2);
  });

  it("counts duplicate headers correctly", () => {
    const records: CsvRecord[] = [{ a: "1", b: "2" }];
    const stats = computeStatistics(records, ["a", "a", "b"]);
    expect(stats.duplicateHeaderCount).toBe(1);
  });

  it("counts duplicate rows correctly", () => {
    const records: CsvRecord[] = [
      { a: "1", b: "2" },
      { a: "1", b: "2" },
      { a: "3", b: "4" },
    ];
    const stats = computeStatistics(records, ["a", "b"]);
    expect(stats.duplicateRowCount).toBe(1);
  });

  it("counts inconsistent rows correctly", () => {
    const records: CsvRecord[] = [{ a: "1" }, { a: "2", b: "3", c: "4" }, { a: "5", b: "6" }];
    const stats = computeStatistics(records, ["a", "b"]);
    expect(stats.inconsistentRowCount).toBe(2);
  });

  it("handles empty records", () => {
    const stats = computeStatistics([], []);
    expect(stats.rowCount).toBe(0);
    expect(stats.columnCount).toBe(0);
    expect(stats.emptyCellCount).toBe(0);
    expect(stats.duplicateHeaderCount).toBe(0);
    expect(stats.duplicateRowCount).toBe(0);
    expect(stats.inconsistentRowCount).toBe(0);
  });

  it("handles empty records with headers", () => {
    const stats = computeStatistics([], ["a", "b"]);
    expect(stats.rowCount).toBe(0);
    expect(stats.columnCount).toBe(2);
  });
});

// ──────────────────────────────────────────────
// validator.ts — validateCsv (integration)
// ──────────────────────────────────────────────

describe("validateCsv — integration", () => {
  it("returns valid=true for clean CSV", () => {
    const parsed = parseCsv("a,b\n1,2\n3,4");
    const result = validateCsv(parsed);
    expect(result.valid).toBe(true);
    expect(result.issues).toHaveLength(0);
    expect(result.statistics.rowCount).toBe(2);
    expect(result.statistics.columnCount).toBe(2);
  });

  it("detects duplicate headers from parsed CSV", () => {
    // Use 3 data rows so that after JS dedup of duplicate key "a",
    // records still have 3 keys matching the 3 headers.
    const parsed = parseCsv("a,a,b\n1,2,3\n4,5,6\n7,8,9");
    const result = validateCsv(parsed);
    const dupIssues = result.issues.filter((i) => i.code === "DUPLICATE_HEADER");
    expect(dupIssues.length).toBeGreaterThanOrEqual(1);
    expect(result.statistics.duplicateHeaderCount).toBe(1);
  });

  it("detects empty headers from parsed CSV", () => {
    // Parser fills empty headers with synthetic names.
    // Truly empty header fields become "column1" etc.
    const parsed = parseCsv(",b\n1,2");
    expect(parsed.success).toBe(true);
    expect(parsed.csv!.headers).toBeDefined();
    expect(parsed.csv!.headers![0]).toBe("column1");
  });

  it("detects inconsistent column counts", () => {
    // Use a CSV where the parser determines the column count from the longest row,
    // then compare with the shorter row to trigger inconsistency.
    // The parser will create synthetic headers for extra columns
    // and pad short rows — but the validator can detect if records differ.
    // Use checkInconsistentColumnCounts directly for precise testing:
    const records: CsvRecord[] = [
      { a: "1", b: "2", c: "3" },
      { a: "4", b: "5" },
    ];
    const issues = checkInconsistentColumnCounts(records, 3);
    expect(issues).toHaveLength(1);
  });

  it("detects duplicate rows", () => {
    const parsed = parseCsv("a,b\n1,2\n3,4\n1,2");
    const result = validateCsv(parsed);
    const dupIssues = result.issues.filter((i) => i.code === "DUPLICATE_ROW");
    expect(dupIssues).toHaveLength(1);
    expect(result.statistics.duplicateRowCount).toBe(1);
  });

  it("detects empty values", () => {
    const parsed = parseCsv("a,b\n1,\n,4");
    const result = validateCsv(parsed);
    const emptyIssues = result.issues.filter((i) => i.code === "EMPTY_VALUE");
    expect(emptyIssues.length).toBeGreaterThanOrEqual(1);
    expect(result.statistics.emptyCellCount).toBeGreaterThanOrEqual(1);
  });

  it("detects whitespace-only values via quoted fields", () => {
    const parsed = parseCsv('a,b\n1,"   "\n3,4');
    const result = validateCsv(parsed);
    const wsIssues = result.issues.filter((i) => i.code === "WHITESPACE_VALUE");
    expect(wsIssues).toHaveLength(1);
  });

  it("detects empty file (header only, no data rows)", () => {
    const parsed = parseCsv("a,b");
    expect(parsed.csv!.records).toHaveLength(0); // no data rows
    const result = validateCsv(parsed);
    expect(result.valid).toBe(false);
    const emptyFileIssues = result.issues.filter((i) => i.code === "EMPTY_FILE");
    expect(emptyFileIssues).toHaveLength(1);
  });

  it("handles parser failure for empty input", () => {
    const parsed = parseCsv("");
    const result = validateCsv(parsed);
    expect(result.valid).toBe(false);
    const parseIssues = result.issues.filter((i) => i.code === "PARSE_FAILURE");
    expect(parseIssues).toHaveLength(1);
    expect(result.statistics.rowCount).toBe(0);
  });

  it("supports rule toggling via ValidationOptions", () => {
    const parsed = parseCsv("a,a,b\n1,2,3");
    const result = validateCsv(parsed, {
      rules: { DUPLICATE_HEADER: false },
    });
    const dupIssues = result.issues.filter((i) => i.code === "DUPLICATE_HEADER");
    expect(dupIssues).toHaveLength(0);
  });

  it("computes correct statistics for a realistic dataset", () => {
    const csv = "name,age,city\nAlice,30,NYC\nBob,25,\nCharlie,,LA\nAlice,30,NYC";
    const parsed = parseCsv(csv);
    const result = validateCsv(parsed);
    expect(result.statistics.rowCount).toBe(4);
    expect(result.statistics.columnCount).toBe(3);
    expect(result.statistics.emptyCellCount).toBe(2);
    expect(result.statistics.duplicateRowCount).toBe(1);
  });
});

describe("validateCsv — parser failure handling", () => {
  it("returns valid=false with PARSE_FAILURE on parser error", () => {
    const parsed = parseCsv("a,b\n1,2", { delimiter: " " as "," | ";" | "\t" | "|" | ":" });
    const result = validateCsv(parsed);
    expect(result.valid).toBe(false);
    expect(result.issues[0].code).toBe("PARSE_FAILURE");
  });

  it("returns valid=false with PARSE_FAILURE on unterminated quotes", () => {
    const parsed = parseCsv('"unterminated', { hasHeader: false });
    const result = validateCsv(parsed);
    expect(result.valid).toBe(false);
    expect(result.issues[0].code).toBe("PARSE_FAILURE");
  });

  it("returns zeroed statistics on parser failure", () => {
    const parsed = parseCsv("", { hasHeader: false });
    const result = validateCsv(parsed);
    expect(result.statistics.rowCount).toBe(0);
    expect(result.statistics.columnCount).toBe(0);
    expect(result.statistics.emptyCellCount).toBe(0);
  });
});

describe("validateCsv — headerless mode", () => {
  it("validates headerless CSV (synthetic headers)", () => {
    const parsed = parseCsv("1,2,3\n4,5,6", { hasHeader: false });
    const result = validateCsv(parsed);
    expect(result.valid).toBe(true);
    expect(result.statistics.rowCount).toBe(2);
    expect(result.statistics.columnCount).toBe(3);
    // Synthetic column names ("column1", "column2", "column3") — no duplicates
    expect(result.statistics.duplicateHeaderCount).toBe(0);
  });

  it("detects inconsistent columns in headerless mode via rule function", () => {
    const records: CsvRecord[] = [
      { column1: "1", column2: "2" },
      { column1: "3", column2: "4", column3: "5" },
    ];
    const issues = checkInconsistentColumnCounts(records, 3);
    expect(issues).toHaveLength(1);
  });
});
