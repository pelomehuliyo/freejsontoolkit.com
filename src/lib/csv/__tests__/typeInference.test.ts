/**
 * CSV Type Inference — Comprehensive Unit Tests
 *
 * Covers every aspect of the type inference module:
 *   - Cell-level classification (classifyValue logic)
 *   - Column-level analysis (buildColumnProfile + analyzeTypes)
 *   - Type application (applyTypes)
 *   - Integration tests (full pipeline: parse -> analyze -> apply)
 *   - Edge cases (leading zeros, scientific notation, booleans, etc.)
 *   - Option toggling (detect subsets, empty detect array)
 *   - Large input sanity test
 *
 * Every test is deterministic, side-effect free, and uses no DOM/browser APIs.
 */

import { describe, it, expect } from "vitest";
import { parseCsv } from "../csvParser";
import { analyzeTypes, applyTypes } from "../typeInference";
import type { ParsedCsv } from "../types";

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

function makeParsedCsv(headers: string[], data: Record<string, string>[]): ParsedCsv {
  return {
    records: data,
    headers,
    delimiter: ",",
    warnings: [],
  };
}

// ──────────────────────────────────────────────
// Cell-Level Classification Tests
// ──────────────────────────────────────────────

describe("cell-level type classification", () => {
  // ── Integer ──

  it("should classify '42' as integer", () => {
    const csv = makeParsedCsv(["col"], [{ col: "42" }]);
    const analysis = analyzeTypes(csv);
    expect(analysis.columns[0].inferredType).toBe("integer");
    expect(analysis.columns[0].confidence).toBe(1.0);
  });

  it("should classify '0' as integer", () => {
    const csv = makeParsedCsv(["col"], [{ col: "0" }]);
    const analysis = analyzeTypes(csv);
    expect(analysis.columns[0].inferredType).toBe("integer");
  });

  it("should classify '-7' as integer", () => {
    const csv = makeParsedCsv(["col"], [{ col: "-7" }]);
    const analysis = analyzeTypes(csv);
    expect(analysis.columns[0].inferredType).toBe("integer");
  });

  it("should NOT classify '00123' as integer (leading zeros)", () => {
    const csv = makeParsedCsv(["col"], [{ col: "00123" }]);
    const analysis = analyzeTypes(csv);
    expect(analysis.columns[0].inferredType).toBe("string");
  });

  it("should NOT classify '+25' as integer (explicit plus)", () => {
    const csv = makeParsedCsv(["col"], [{ col: "+25" }]);
    const analysis = analyzeTypes(csv);
    expect(analysis.columns[0].inferredType).toBe("string");
  });

  it("should NOT classify '-0' as integer (negative zero)", () => {
    const csv = makeParsedCsv(["col"], [{ col: "-0" }]);
    const analysis = analyzeTypes(csv);
    expect(analysis.columns[0].inferredType).toBe("string");
  });

  // ── Float ──

  it("should classify '3.14' as float", () => {
    const csv = makeParsedCsv(["col"], [{ col: "3.14" }]);
    const analysis = analyzeTypes(csv);
    expect(analysis.columns[0].inferredType).toBe("float");
  });

  it("should classify '-2.5' as float", () => {
    const csv = makeParsedCsv(["col"], [{ col: "-2.5" }]);
    const analysis = analyzeTypes(csv);
    expect(analysis.columns[0].inferredType).toBe("float");
  });

  it("should classify '.5' as float (leading dot)", () => {
    const csv = makeParsedCsv(["col"], [{ col: ".5" }]);
    const analysis = analyzeTypes(csv);
    expect(analysis.columns[0].inferredType).toBe("float");
  });

  it("should classify '0.5' as float", () => {
    const csv = makeParsedCsv(["col"], [{ col: "0.5" }]);
    const analysis = analyzeTypes(csv);
    expect(analysis.columns[0].inferredType).toBe("float");
  });

  it("should classify '100.0' as float", () => {
    const csv = makeParsedCsv(["col"], [{ col: "100.0" }]);
    const analysis = analyzeTypes(csv);
    expect(analysis.columns[0].inferredType).toBe("float");
  });

  it("should NOT classify '5.' as float (trailing dot)", () => {
    const csv = makeParsedCsv(["col"], [{ col: "5." }]);
    const analysis = analyzeTypes(csv);
    expect(analysis.columns[0].inferredType).toBe("string");
  });

  it("should NOT classify '3.14.15' as float (multiple dots)", () => {
    const csv = makeParsedCsv(["col"], [{ col: "3.14.15" }]);
    const analysis = analyzeTypes(csv);
    expect(analysis.columns[0].inferredType).toBe("string");
  });

  // ── Boolean ──

  it("should classify 'true' as boolean", () => {
    const csv = makeParsedCsv(["col"], [{ col: "true" }]);
    const analysis = analyzeTypes(csv);
    expect(analysis.columns[0].inferredType).toBe("boolean");
  });

  it("should classify 'TRUE' as boolean (uppercase)", () => {
    const csv = makeParsedCsv(["col"], [{ col: "TRUE" }]);
    const analysis = analyzeTypes(csv);
    expect(analysis.columns[0].inferredType).toBe("boolean");
  });

  it("should classify 'True' as boolean (title case)", () => {
    const csv = makeParsedCsv(["col"], [{ col: "True" }]);
    const analysis = analyzeTypes(csv);
    expect(analysis.columns[0].inferredType).toBe("boolean");
  });

  it("should classify 'false' as boolean", () => {
    const csv = makeParsedCsv(["col"], [{ col: "false" }]);
    const analysis = analyzeTypes(csv);
    expect(analysis.columns[0].inferredType).toBe("boolean");
  });

  it("should NOT classify 'yes' as boolean", () => {
    const csv = makeParsedCsv(["col"], [{ col: "yes" }]);
    const analysis = analyzeTypes(csv);
    expect(analysis.columns[0].inferredType).toBe("string");
  });

  it("should NOT classify 'no' as boolean", () => {
    const csv = makeParsedCsv(["col"], [{ col: "no" }]);
    const analysis = analyzeTypes(csv);
    expect(analysis.columns[0].inferredType).toBe("string");
  });

  // ── Null ──

  it("should classify 'null' as null (lowercase)", () => {
    const csv = makeParsedCsv(["col"], [{ col: "null" }]);
    const analysis = analyzeTypes(csv);
    expect(analysis.columns[0].inferredType).toBe("null");
  });

  it("should classify 'NULL' as null (uppercase)", () => {
    const csv = makeParsedCsv(["col"], [{ col: "NULL" }]);
    const analysis = analyzeTypes(csv);
    expect(analysis.columns[0].inferredType).toBe("null");
  });

  it("should classify 'Null' as null (title case)", () => {
    const csv = makeParsedCsv(["col"], [{ col: "Null" }]);
    const analysis = analyzeTypes(csv);
    expect(analysis.columns[0].inferredType).toBe("null");
  });

  it("should NOT classify empty string as null", () => {
    const csv = makeParsedCsv(["col"], [{ col: "" }]);
    const analysis = analyzeTypes(csv);
    expect(analysis.columns[0].inferredType).toBe("string");
    expect(analysis.columns[0].confidence).toBe(0);
  });

  it("should NOT classify 'undefined' as null", () => {
    const csv = makeParsedCsv(["col"], [{ col: "undefined" }]);
    const analysis = analyzeTypes(csv);
    expect(analysis.columns[0].inferredType).toBe("string");
  });

  // ── String fallback ──

  it("should classify 'hello' as string (fallback)", () => {
    const csv = makeParsedCsv(["col"], [{ col: "hello" }]);
    const analysis = analyzeTypes(csv);
    expect(analysis.columns[0].inferredType).toBe("string");
  });

  it("should classify '1e5' as string (no scientific notation)", () => {
    const csv = makeParsedCsv(["col"], [{ col: "1e5" }]);
    const analysis = analyzeTypes(csv);
    expect(analysis.columns[0].inferredType).toBe("string");
  });

  it("should classify 'NaN' as string", () => {
    const csv = makeParsedCsv(["col"], [{ col: "NaN" }]);
    const analysis = analyzeTypes(csv);
    expect(analysis.columns[0].inferredType).toBe("string");
  });

  it("should classify 'Infinity' as string", () => {
    const csv = makeParsedCsv(["col"], [{ col: "Infinity" }]);
    const analysis = analyzeTypes(csv);
    expect(analysis.columns[0].inferredType).toBe("string");
  });

  it("should classify '2024-01-15' as string (no dates)", () => {
    const csv = makeParsedCsv(["col"], [{ col: "2024-01-15" }]);
    const analysis = analyzeTypes(csv);
    expect(analysis.columns[0].inferredType).toBe("string");
  });

  it("should classify '50%' as string (no percentages)", () => {
    const csv = makeParsedCsv(["col"], [{ col: "50%" }]);
    const analysis = analyzeTypes(csv);
    expect(analysis.columns[0].inferredType).toBe("string");
  });

  it("should classify '$100' as string (no currencies)", () => {
    const csv = makeParsedCsv(["col"], [{ col: "$100" }]);
    const analysis = analyzeTypes(csv);
    expect(analysis.columns[0].inferredType).toBe("string");
  });

  it("should classify '0xFF' as string (no hex)", () => {
    const csv = makeParsedCsv(["col"], [{ col: "0xFF" }]);
    const analysis = analyzeTypes(csv);
    expect(analysis.columns[0].inferredType).toBe("string");
  });

  it("should classify '  42  ' as integer after whitespace trimming", () => {
    const csv = makeParsedCsv(["col"], [{ col: "  42  " }]);
    const analysis = analyzeTypes(csv);
    expect(analysis.columns[0].inferredType).toBe("integer");
  });
});

// ──────────────────────────────────────────────
// Column-Level Analysis Tests
// ──────────────────────────────────────────────

describe("column-level type analysis", () => {
  it("should infer integer column from multiple integer values", () => {
    const csv = makeParsedCsv(["age"], [{ age: "25" }, { age: "30" }, { age: "35" }]);
    const analysis = analyzeTypes(csv);
    expect(analysis.columns[0].inferredType).toBe("integer");
    expect(analysis.columns[0].confidence).toBe(1.0);
    expect(analysis.columns[0].totalValues).toBe(3);
    expect(analysis.columns[0].typeCounts.integer).toBe(3);
  });

  it("should infer float column from multiple float values", () => {
    const csv = makeParsedCsv(["price"], [{ price: "1.99" }, { price: "2.50" }, { price: "3.00" }]);
    const analysis = analyzeTypes(csv);
    expect(analysis.columns[0].inferredType).toBe("float");
    expect(analysis.columns[0].confidence).toBe(1.0);
    expect(analysis.columns[0].typeCounts.float).toBe(3);
  });

  it("should infer boolean column from multiple boolean values", () => {
    const csv = makeParsedCsv(
      ["active"],
      [{ active: "true" }, { active: "false" }, { active: "true" }],
    );
    const analysis = analyzeTypes(csv);
    expect(analysis.columns[0].inferredType).toBe("boolean");
    expect(analysis.columns[0].typeCounts.boolean).toBe(3);
  });

  it("should infer null column from multiple null literals", () => {
    const csv = makeParsedCsv(["col"], [{ col: "null" }, { col: "NULL" }, { col: "Null" }]);
    const analysis = analyzeTypes(csv);
    expect(analysis.columns[0].inferredType).toBe("null");
    expect(analysis.columns[0].confidence).toBe(1.0);
    expect(analysis.columns[0].typeCounts.null).toBe(3);
  });

  it("should resolve mixed integer+float column as float", () => {
    const csv = makeParsedCsv(["value"], [{ value: "1" }, { value: "2.5" }, { value: "3" }]);
    const analysis = analyzeTypes(csv);
    expect(analysis.columns[0].inferredType).toBe("float");
  });

  it("should resolve mixed integer+null column as integer", () => {
    const csv = makeParsedCsv(["value"], [{ value: "42" }, { value: "null" }, { value: "100" }]);
    const analysis = analyzeTypes(csv);
    expect(analysis.columns[0].inferredType).toBe("integer");
    expect(analysis.columns[0].confidence).toBe(2 / 3);
    expect(analysis.columns[0].typeCounts.integer).toBe(2);
    expect(analysis.columns[0].typeCounts.null).toBe(1);
  });

  it("should resolve mixed float+null column as float", () => {
    const csv = makeParsedCsv(["value"], [{ value: "3.14" }, { value: "null" }, { value: "2.71" }]);
    const analysis = analyzeTypes(csv);
    expect(analysis.columns[0].inferredType).toBe("float");
    expect(analysis.columns[0].confidence).toBe(2 / 3);
  });

  it("should resolve mixed boolean+null column as boolean", () => {
    const csv = makeParsedCsv(
      ["value"],
      [{ value: "true" }, { value: "null" }, { value: "false" }],
    );
    const analysis = analyzeTypes(csv);
    expect(analysis.columns[0].inferredType).toBe("boolean");
    expect(analysis.columns[0].confidence).toBe(2 / 3);
  });

  it("should fall back to string for mixed integer+boolean column", () => {
    const csv = makeParsedCsv(["value"], [{ value: "42" }, { value: "true" }]);
    const analysis = analyzeTypes(csv);
    expect(analysis.columns[0].inferredType).toBe("string");
  });

  it("should fall back to string if any string value is present", () => {
    const csv = makeParsedCsv(["value"], [{ value: "42" }, { value: "hello" }, { value: "3.14" }]);
    const analysis = analyzeTypes(csv);
    expect(analysis.columns[0].inferredType).toBe("string");
  });

  it("should report empty cells separately", () => {
    const csv = makeParsedCsv(["value"], [{ value: "42" }, { value: "" }, { value: "100" }]);
    const analysis = analyzeTypes(csv);
    expect(analysis.columns[0].inferredType).toBe("integer");
    expect(analysis.columns[0].totalValues).toBe(2);
    expect(analysis.columns[0].emptyCount).toBe(1);
    expect(analysis.columns[0].confidence).toBe(1.0);
  });

  it("should return string with 0 confidence for all-empty column", () => {
    const csv = makeParsedCsv(["value"], [{ value: "" }, { value: "" }]);
    const analysis = analyzeTypes(csv);
    expect(analysis.columns[0].inferredType).toBe("string");
    expect(analysis.columns[0].confidence).toBe(0);
    expect(analysis.columns[0].totalValues).toBe(0);
    expect(analysis.columns[0].emptyCount).toBe(2);
  });

  it("should analyse multiple columns independently", () => {
    const csv = makeParsedCsv(
      ["name", "age", "score", "active", "note"],
      [
        { name: "Alice", age: "30", score: "95.5", active: "true", note: "null" },
        { name: "Bob", age: "25", score: "87.0", active: "false", note: "NULL" },
      ],
    );
    const analysis = analyzeTypes(csv);
    expect(analysis.columns).toHaveLength(5);
    expect(analysis.columns[0].inferredType).toBe("string");
    expect(analysis.columns[1].inferredType).toBe("integer");
    expect(analysis.columns[2].inferredType).toBe("float");
    expect(analysis.columns[3].inferredType).toBe("boolean");
    expect(analysis.columns[4].inferredType).toBe("null");
    expect(analysis.complete).toBe(true);
  });

  it("should return empty columns array for empty headers", () => {
    const csv = { records: [], headers: [], delimiter: "," as const, warnings: [] };
    const analysis = analyzeTypes(csv);
    expect(analysis.columns).toEqual([]);
    expect(analysis.complete).toBe(true);
  });
});

// ──────────────────────────────────────────────
// Option Toggling Tests
// ──────────────────────────────────────────────

describe("option toggling", () => {
  it("should detect all types by default", () => {
    const csv = makeParsedCsv(["a", "b", "c", "d"], [{ a: "42", b: "3.14", c: "true", d: "null" }]);
    const analysis = analyzeTypes(csv);
    expect(analysis.columns[0].inferredType).toBe("integer");
    expect(analysis.columns[1].inferredType).toBe("float");
    expect(analysis.columns[2].inferredType).toBe("boolean");
    expect(analysis.columns[3].inferredType).toBe("null");
  });

  it("should only detect integers when detect: ['integer']", () => {
    const csv = makeParsedCsv(["a", "b"], [{ a: "42", b: "3.14" }]);
    const analysis = analyzeTypes(csv, { detect: ["integer"] });
    expect(analysis.columns[0].inferredType).toBe("integer");
    expect(analysis.columns[1].inferredType).toBe("string");
  });

  it("should treat everything as string when detect array is empty", () => {
    const csv = makeParsedCsv(["a", "b", "c", "d"], [{ a: "42", b: "3.14", c: "true", d: "null" }]);
    const analysis = analyzeTypes(csv, { detect: [] });
    expect(analysis.columns[0].inferredType).toBe("string");
    expect(analysis.columns[1].inferredType).toBe("string");
    expect(analysis.columns[2].inferredType).toBe("string");
    expect(analysis.columns[3].inferredType).toBe("string");
  });

  it("should detect only null when detect: ['null']", () => {
    const csv = makeParsedCsv(["a", "b"], [{ a: "null", b: "hello" }]);
    const analysis = analyzeTypes(csv, { detect: ["null"] });
    expect(analysis.columns[0].inferredType).toBe("null");
    expect(analysis.columns[1].inferredType).toBe("string");
  });
});

// ──────────────────────────────────────────────
// applyTypes Tests
// ──────────────────────────────────────────────

describe("applyTypes", () => {
  it("should cast integer string to JS number", () => {
    const csv = makeParsedCsv(["age"], [{ age: "42" }]);
    const analysis = analyzeTypes(csv);
    const result = applyTypes(csv, analysis);
    expect(result.typedRecords[0].age).toBe(42);
    expect(typeof result.typedRecords[0].age).toBe("number");
  });

  it("should cast float string to JS number", () => {
    const csv = makeParsedCsv(["price"], [{ price: "3.14" }]);
    const analysis = analyzeTypes(csv);
    const result = applyTypes(csv, analysis);
    expect(result.typedRecords[0].price).toBe(3.14);
    expect(typeof result.typedRecords[0].price).toBe("number");
  });

  it("should cast boolean string to JS boolean", () => {
    const csv = makeParsedCsv(["active"], [{ active: "true" }]);
    const analysis = analyzeTypes(csv);
    const result = applyTypes(csv, analysis);
    expect(result.typedRecords[0].active).toBe(true);
    expect(typeof result.typedRecords[0].active).toBe("boolean");
  });

  it("should cast null string to JS null", () => {
    const csv = makeParsedCsv(["col"], [{ col: "null" }]);
    const analysis = analyzeTypes(csv);
    const result = applyTypes(csv, analysis);
    expect(result.typedRecords[0].col).toBeNull();
  });

  it("should preserve original string records", () => {
    const csv = makeParsedCsv(["age"], [{ age: "42" }]);
    const analysis = analyzeTypes(csv);
    const result = applyTypes(csv, analysis);
    expect(result.records[0].age).toBe("42");
    expect(typeof result.records[0].age).toBe("string");
  });

  it("should keep string column values as-is", () => {
    const csv = makeParsedCsv(["name"], [{ name: "Alice" }]);
    const analysis = analyzeTypes(csv);
    const result = applyTypes(csv, analysis);
    expect(result.typedRecords[0].name).toBe("Alice");
    expect(typeof result.typedRecords[0].name).toBe("string");
  });

  it("should cast integers to float in float columns", () => {
    const csv = makeParsedCsv(["value"], [{ value: "1" }, { value: "2.5" }]);
    const analysis = analyzeTypes(csv);
    const result = applyTypes(csv, analysis);
    expect(result.typedRecords[0].value).toBe(1.0);
    expect(result.typedRecords[1].value).toBe(2.5);
  });

  it("should preserve all original ParsedCsv properties", () => {
    const csv = makeParsedCsv(["a"], [{ a: "1" }]);
    const analysis = analyzeTypes(csv);
    const result = applyTypes(csv, analysis);
    expect(result.delimiter).toBe(",");
    expect(result.warnings).toEqual([]);
    expect(result.headers).toEqual(["a"]);
  });
});

// ──────────────────────────────────────────────
// Integration Tests
// ──────────────────────────────────────────────

describe("integration - full pipeline", () => {
  it("should parse CSV, infer types, and apply them", () => {
    const parsed = parseCsv("name,age,score,active\nAlice,30,95.5,true\nBob,25,87.0,false");
    expect(parsed.success).toBe(true);
    const csv = parsed.csv!;

    const analysis = analyzeTypes(csv);
    expect(analysis.columns).toHaveLength(4);
    expect(analysis.columns[0].inferredType).toBe("string");
    expect(analysis.columns[1].inferredType).toBe("integer");
    expect(analysis.columns[2].inferredType).toBe("float");
    expect(analysis.columns[3].inferredType).toBe("boolean");

    const result = applyTypes(csv, analysis);
    expect(result.typedRecords[0].name).toBe("Alice");
    expect(result.typedRecords[0].age).toBe(30);
    expect(result.typedRecords[0].score).toBe(95.5);
    expect(result.typedRecords[0].active).toBe(true);
  });

  it("should handle headerless CSV", () => {
    const parsed = parseCsv("42,3.14,true,null", { hasHeader: false });
    const csv = parsed.csv!;
    const analysis = analyzeTypes(csv);
    expect(analysis.columns[0].inferredType).toBe("integer");
    expect(analysis.columns[1].inferredType).toBe("float");
    expect(analysis.columns[2].inferredType).toBe("boolean");
    expect(analysis.columns[3].inferredType).toBe("null");
  });

  it("should handle leading zeros (preserved as strings)", () => {
    const parsed = parseCsv("code\n00123\n00456\n");
    const csv = parsed.csv!;
    const analysis = analyzeTypes(csv);
    expect(analysis.columns[0].inferredType).toBe("string");
  });

  it("should handle scientific notation (preserved as strings)", () => {
    const parsed = parseCsv("value\n1e5\n2e10\n");
    const csv = parsed.csv!;
    const analysis = analyzeTypes(csv);
    expect(analysis.columns[0].inferredType).toBe("string");
  });
});

// ──────────────────────────────────────────────
// Large Input Sanity Test
// ──────────────────────────────────────────────

describe("large input sanity test", () => {
  it("should analyse and apply types to 10,000 rows", () => {
    const ROW_COUNT = 10_000;
    const headers = ["id", "value", "score", "active"];
    const records: Record<string, string>[] = [];

    for (let i = 0; i < ROW_COUNT; i++) {
      records.push({
        id: String(i),
        value: `val-${i}`,
        score: i % 1000 === 0 ? String(i) : `${i}.${i % 100}`,
        active: i % 2 === 0 ? "true" : "false",
      });
    }

    const csv = makeParsedCsv(headers, records);
    const analysis = analyzeTypes(csv);
    expect(analysis.complete).toBe(true);
    expect(analysis.columns[0].inferredType).toBe("integer");
    expect(analysis.columns[1].inferredType).toBe("string");
    expect(analysis.columns[2].inferredType).toBe("float");
    expect(analysis.columns[3].inferredType).toBe("boolean");

    const result = applyTypes(csv, analysis);
    expect(result.typedRecords).toHaveLength(ROW_COUNT);
    expect(typeof result.typedRecords[0].id).toBe("number");
    expect(result.typedRecords[ROW_COUNT - 1].id).toBe(ROW_COUNT - 1);
  });
});
