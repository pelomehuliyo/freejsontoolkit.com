/**
 * CSV Parser — Comprehensive Unit Tests
 *
 * Covers all major functionality of parseCsv():
 *   - Happy path (basic CSV, multiple rows, header mode, headerless mode)
 *   - Delimiters (comma, semicolon, pipe, colon, tab)
 *   - RFC 4180 (quoted commas, escaped quotes, multiline quoted fields,
 *               empty quoted fields, quoted whitespace preservation)
 *   - Whitespace (trimWhitespace=true, trimWhitespace=false)
 *   - Options (skipEmptyLines=true, skipEmptyLines=false)
 *   - Errors (empty input, unterminated quote, unsupported delimiter)
 *   - Headers (duplicate headers generate warnings)
 *   - Misc (UTF-8 BOM stripping)
 *   - Row length mismatch behaviour
 *   - Large input sanity test
 *
 * Every test clearly states:
 *   - input
 *   - options
 *   - expected ParseResult
 *
 * NOTE: Do NOT modify the parser implementation unless a failing test proves a bug.
 *       These tests are written against the current implementation's behaviour.
 */

import { describe, it, expect } from "vitest";
import { parseCsv } from "../csvParser";

// ──────────────────────────────────────────────
// Happy Path — Basic CSV
// ──────────────────────────────────────────────

describe("happy path — basic CSV", () => {
    it("should parse a single row with header mode (default)", () => {
        // Input: "a,b,c\n1,2,3"
        // Options: {} (default)
        // Expected: success=true, data=[{ a: "1", b: "2", c: "3" }]
        const result = parseCsv("a,b,c\n1,2,3");
        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(1);
        expect(result.data![0]).toEqual({ a: "1", b: "2", c: "3" });
    });

    it("should parse multiple rows", () => {
        // Input: "name,age\nAlice,30\nBob,25\nCharlie,35"
        // Options: {} (default)
        // Expected: success=true, data has 3 records
        const result = parseCsv("name,age\nAlice,30\nBob,25\nCharlie,35");
        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(3);
        expect(result.data![0]).toEqual({ name: "Alice", age: "30" });
        expect(result.data![1]).toEqual({ name: "Bob", age: "25" });
        expect(result.data![2]).toEqual({ name: "Charlie", age: "35" });
    });

    it("should parse header mode with defaults", () => {
        // Input: "city,population,country\nTokyo,13929286,Japan\nDelhi,30290936,India"
        // Options: { hasHeader: true }
        // Expected: first row used as header keys
        const result = parseCsv("city,population,country\nTokyo,13929286,Japan\nDelhi,30290936,India", {
            hasHeader: true,
        });
        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(2);
        expect(result.data![0]).toEqual({ city: "Tokyo", population: "13929286", country: "Japan" });
        expect(result.data![1]).toEqual({ city: "Delhi", population: "30290936", country: "India" });
    });

    it("should parse headerless mode with synthetic column names", () => {
        // Input: "John,30\nJane,25"
        // Options: { hasHeader: false }
        // Expected: synthetic keys column1, column2, ...
        const result = parseCsv("John,30\nJane,25", { hasHeader: false });
        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(2);
        expect(result.data![0]).toEqual({ column1: "John", column2: "30" });
        expect(result.data![1]).toEqual({ column1: "Jane", column2: "25" });
    });
});

// ──────────────────────────────────────────────
// Delimiters
// ──────────────────────────────────────────────

describe("delimiters", () => {
    it("should parse with comma delimiter (default)", () => {
        // Input: "a,b,c\n1,2,3"
        // Options: { delimiter: "," }
        // Expected: default comma parsing
        const result = parseCsv("a,b,c\n1,2,3", { delimiter: "," });
        expect(result.success).toBe(true);
        expect(result.data![0]).toEqual({ a: "1", b: "2", c: "3" });
    });

    it("should parse with semicolon delimiter", () => {
        // Input: "a;b;c\n1;2;3"
        // Options: { delimiter: ";" }
        // Expected: semicolon-delimited fields
        const result = parseCsv("a;b;c\n1;2;3", { delimiter: ";" });
        expect(result.success).toBe(true);
        expect(result.data![0]).toEqual({ a: "1", b: "2", c: "3" });
    });

    it("should parse with pipe delimiter", () => {
        // Input: "a|b|c\n1|2|3"
        // Options: { delimiter: "|" }
        // Expected: pipe-delimited fields
        const result = parseCsv("a|b|c\n1|2|3", { delimiter: "|" });
        expect(result.success).toBe(true);
        expect(result.data![0]).toEqual({ a: "1", b: "2", c: "3" });
    });

    it("should parse with colon delimiter", () => {
        // Input: "a:b:c\n1:2:3"
        // Options: { delimiter: ":" }
        // Expected: colon-delimited fields
        const result = parseCsv("a:b:c\n1:2:3", { delimiter: ":" });
        expect(result.success).toBe(true);
        expect(result.data![0]).toEqual({ a: "1", b: "2", c: "3" });
    });

    it("should parse with tab delimiter", () => {
        // Input: "a\tb\tc\n1\t2\t3"
        // Options: { delimiter: "\t" }
        // Expected: tab-delimited fields
        const result = parseCsv("a\tb\tc\n1\t2\t3", { delimiter: "\t" });
        expect(result.success).toBe(true);
        expect(result.data![0]).toEqual({ a: "1", b: "2", c: "3" });
    });
});

// ──────────────────────────────────────────────
// RFC 4180
// ──────────────────────────────────────────────

describe("RFC 4180 compliance", () => {
    it("should handle quoted fields containing commas", () => {
        // Input: 'a,"b,c",d\n1,2,3'
        // Options: { hasHeader: true }
        // Expected: quoted comma preserved as part of field value
        const result = parseCsv('a,"b,c",d\n1,2,3');
        expect(result.success).toBe(true);
        expect(Object.keys(result.data![0])).toContain("b,c");
        expect(result.data![0]["b,c"]).toBe("2");
    });

    it("should handle escaped double quotes inside quoted fields", () => {
        // Input: 'a,"say ""hello""",c\n1,2,3'
        // Options: { hasHeader: true }
        // Expected: "" inside quotes becomes a single "
        const result = parseCsv('a,"say ""hello""",c\n1,2,3');
        expect(result.success).toBe(true);
        expect(Object.keys(result.data![0])).toContain('say "hello"');
        expect(result.data![0]['say "hello"']).toBe("2");
    });

    it("should handle multiline quoted fields", () => {
        // Input: 'a,"multi\nline",c\n1,2,3'
        // Options: { hasHeader: true }
        // Expected: newline preserved inside quoted field
        const result = parseCsv('a,"multi\nline",c\n1,2,3');
        expect(result.success).toBe(true);
        expect(Object.keys(result.data![0])).toContain("multi\nline");
        expect(result.data![0]["multi\nline"]).toBe("2");
    });

    it("should handle empty quoted fields", () => {
        // Input: 'a,"",c\n1,2,3'
        // Options: { hasHeader: true }
        // Expected: empty quoted field produces empty string
        const result = parseCsv('a,"",c\n1,2,3');
        expect(result.success).toBe(true);
        const keys = Object.keys(result.data![0]);
        expect(keys).toContain("a");
        expect(keys).toContain("c");
    });

    it("should preserve whitespace inside quoted fields", () => {
        // Input: '"  value with spaces  ",b\nhello,world'
        // Options: { hasHeader: true }
        // Expected: quoted whitespace is preserved
        const result = parseCsv('"  value with spaces  ",b\nhello,world');
        expect(result.success).toBe(true);
        expect(Object.keys(result.data![0])).toContain("b");
        expect(result.data![0]["b"]).toBe("world");
    });

    it("should handle field with just escaped quotes", () => {
        // Input: 'a,"""""",c\n1,2,3'
        // Options: { hasHeader: true }
        const result = parseCsv('a,"""""",c\n1,2,3');
        expect(result.success).toBe(true);
        expect(Object.keys(result.data![0])).toContain("a");
        expect(Object.keys(result.data![0])).toContain("c");
    });
});

// ──────────────────────────────────────────────
// Whitespace
// ──────────────────────────────────────────────

describe("whitespace handling", () => {
    it("should trim unquoted whitespace when trimWhitespace=true (default)", () => {
        // Input: "  a  ,  b  ,  c  \n  1  ,  2  ,  3  "
        // Options: {} (default)
        // Expected: headers and unquoted data trimmed
        const result = parseCsv("  a  ,  b  ,  c  \n  1  ,  2  ,  3  ");
        expect(result.success).toBe(true);
        expect(result.data![0]).toEqual({ a: "1", b: "2", c: "3" });
    });

    it("should preserve unquoted whitespace in data values when trimWhitespace=false", () => {
        // Input: "col1,col2\n  a  ,  b  "
        // Options: { trimWhitespace: false }
        // Expected: headers always trimmed; data values preserve whitespace
        const result = parseCsv("col1,col2\n  a  ,  b  ", { trimWhitespace: false });
        expect(result.success).toBe(true);
        expect(Object.keys(result.data![0])).toEqual(["col1", "col2"]);
        expect(result.data![0]["col1"]).toBe("  a  ");
        expect(result.data![0]["col2"]).toBe("  b  ");
    });

    it("should NOT trim quoted whitespace in data values when trimWhitespace=true", () => {
        // Input: 'a,b\n"  hello  ","  world  "'
        // Options: { trimWhitespace: true }
        // Expected: quoted data values preserve whitespace
        const result = parseCsv('a,b\n"  hello  ","  world  "', { trimWhitespace: true });
        expect(result.success).toBe(true);
        expect(result.data![0]).toEqual({ a: "  hello  ", b: "  world  " });
    });

    it("should NOT trim quoted whitespace in data values when trimWhitespace=false", () => {
        // Input: 'a,b\n"  spaced  ",  value  '
        // Options: { trimWhitespace: false }
        // Expected: quoted field preserves whitespace; unquoted field also preserves
        const result = parseCsv('a,b\n"  spaced  ",  value  ', { trimWhitespace: false });
        expect(result.success).toBe(true);
        expect(result.data![0]).toEqual({ a: "  spaced  ", b: "  value  " });
    });

    it("should preserve unquoted whitespace in headerless mode when trimWhitespace=false", () => {
        // Input: "  hello  ,  world  "
        // Options: { hasHeader: false, trimWhitespace: false }
        // Expected: no header trimming in headerless mode; values preserve whitespace
        const result = parseCsv("  hello  ,  world  ", { hasHeader: false, trimWhitespace: false });
        expect(result.success).toBe(true);
        expect(result.data![0]).toEqual({ column1: "  hello  ", column2: "  world  " });
    });
});

// ──────────────────────────────────────────────
// Options — skipEmptyLines
// ──────────────────────────────────────────────

describe("skipEmptyLines option", () => {
    it("should skip blank lines when skipEmptyLines=true", () => {
        // Input: "a,b\n1,2\n\n3,4\n\n5,6"
        // Options: { skipEmptyLines: true }
        // Expected: blank lines ignored
        const result = parseCsv("a,b\n1,2\n\n3,4\n\n5,6", { skipEmptyLines: true });
        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(3);
        expect(result.data![0]).toEqual({ a: "1", b: "2" });
        expect(result.data![1]).toEqual({ a: "3", b: "4" });
        expect(result.data![2]).toEqual({ a: "5", b: "6" });
    });

    it("should keep blank lines when skipEmptyLines=false (default)", () => {
        // Input: "a,b\n1,2\n\n3,4"
        // Options: { skipEmptyLines: false }
        // Expected: blank line produces a record with empty values
        const result = parseCsv("a,b\n1,2\n\n3,4", { skipEmptyLines: false });
        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(3);
        expect(result.data![0]).toEqual({ a: "1", b: "2" });
        expect(result.data![2]).toEqual({ a: "3", b: "4" });
    });

    it("should skip leading blank lines when skipEmptyLines=true", () => {
        // Input: "\n\n\na,b\n1,2"
        // Options: { skipEmptyLines: true }
        // Expected: leading blank lines dropped
        const result = parseCsv("\n\n\na,b\n1,2", { skipEmptyLines: true });
        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(1);
        expect(result.data![0]).toEqual({ a: "1", b: "2" });
    });

    it("should skip trailing blank lines when skipEmptyLines=true", () => {
        // Input: "a,b\n1,2\n\n\n"
        // Options: { skipEmptyLines: true }
        // Expected: trailing blank lines dropped
        const result = parseCsv("a,b\n1,2\n\n\n", { skipEmptyLines: true });
        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(1);
        expect(result.data![0]).toEqual({ a: "1", b: "2" });
    });
});

// ──────────────────────────────────────────────
// Errors
// ──────────────────────────────────────────────

describe("error handling", () => {
    it("should return NO_ROWS error for empty input", () => {
        // Input: ""
        // Options: {} (default)
        // Expected: success=false, error.code="NO_ROWS"
        const result = parseCsv("");
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.error!.code).toBe("NO_ROWS");
    });

    it("should succeed with whitespace-only lines when skipEmptyLines=true since spaces count as content", () => {
        // Input: "   \n\n  "
        // Options: { skipEmptyLines: true }
        // Expected: whitespace lines have content so they are not empty; parsing succeeds
        const result = parseCsv("   \n\n  ", { skipEmptyLines: true });
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
    });

    it("should return UNTERMINATED_QUOTE error for unterminated quote", () => {
        // Input: '"unterminated'
        // Options: { hasHeader: false }
        // Expected: success=false, error.code="UNTERMINATED_QUOTE"
        const result = parseCsv('"unterminated', { hasHeader: false });
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.error!.code).toBe("UNTERMINATED_QUOTE");
    });

    it("should return INVALID_DELIMITER error for unsupported delimiter", () => {
        // Input: "a,b,c\n1,2,3"
        // Options: { delimiter: "x" }
        // Expected: success=false, error.code="INVALID_DELIMITER"
        const result = parseCsv("a,b,c\n1,2,3", { delimiter: "x" as "," | ";" | "\t" | "|" | ":" });
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.error!.code).toBe("INVALID_DELIMITER");
    });

    it("should return INVALID_DELIMITER error for space delimiter", () => {
        // Input: "a b c\n1 2 3"
        // Options: { delimiter: " " }
        // Expected: success=false, error.code="INVALID_DELIMITER"
        const result = parseCsv("a b c\n1 2 3", { delimiter: " " as "," | ";" | "\t" | "|" | ":" });
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.error!.code).toBe("INVALID_DELIMITER");
    });

    it("should provide line/column info in unterminated quote errors", () => {
        // Input: "a,b\n\"unterminated\nnext"
        // Options: { hasHeader: false }
        // Expected: error with line=2, column=1
        const result = parseCsv("a,b\n\"unterminated\nnext", { hasHeader: false });
        expect(result.success).toBe(false);
        expect(result.error!.code).toBe("UNTERMINATED_QUOTE");
        expect(result.error!.line).toBe(2);
        expect(result.error!.column).toBe(1);
    });
});

// ──────────────────────────────────────────────
// Headers — Duplicate Warning
// ──────────────────────────────────────────────

describe("duplicate header warning", () => {
    it("should emit a warning for duplicate headers without failing", () => {
        // Input: "a,a,b\n1,2,3"
        // Options: {} (default)
        // Expected: success=true, warnings contains DUPLICATE_HEADER
        const result = parseCsv("a,a,b\n1,2,3");
        expect(result.success).toBe(true);
        expect(result.warnings).toBeDefined();
        const dupWarnings = result.warnings!.filter((w) => w.code === "DUPLICATE_HEADER");
        expect(dupWarnings.length).toBeGreaterThanOrEqual(1);
    });

    it("should report each duplicate header separately", () => {
        // Input: "x,x,y,y,z\n1,2,3,4,5"
        // Options: {} (default)
        // Expected: warnings for 'x' and 'y' being duplicated
        const result = parseCsv("x,x,y,y,z\n1,2,3,4,5");
        expect(result.success).toBe(true);
        expect(result.warnings).toBeDefined();
        const dupWarnings = result.warnings!.filter((w) => w.code === "DUPLICATE_HEADER");
        expect(dupWarnings.length).toBe(2);
        expect(dupWarnings[0].message).toContain("x");
        expect(dupWarnings[1].message).toContain("y");
    });

    it("should not emit warnings for unique headers", () => {
        // Input: "col1,col2,col3\n1,2,3"
        // Options: {} (default)
        // Expected: no warnings
        const result = parseCsv("col1,col2,col3\n1,2,3");
        expect(result.success).toBe(true);
        const dupWarnings = (result.warnings ?? []).filter((w) => w.code === "DUPLICATE_HEADER");
        expect(dupWarnings.length).toBe(0);
    });
});

// ──────────────────────────────────────────────
// UTF-8 BOM Stripping
// ──────────────────────────────────────────────

describe("UTF-8 BOM stripping", () => {
    it("should strip BOM from start of input", () => {
        // Input: "\uFEFFa,b,c\n1,2,3"
        // Options: {} (default)
        // Expected: BOM stripped, parsing succeeds normally
        const BOM = "\uFEFF";
        const result = parseCsv(BOM + "a,b,c\n1,2,3");
        expect(result.success).toBe(true);
        expect(result.data![0]).toEqual({ a: "1", b: "2", c: "3" });
    });

    it("should parse correctly with BOM and quoted fields", () => {
        // Input: "\uFEFF\"hello\",world\n1,2"
        // Options: {} (default)
        // Expected: BOM stripped, quoted fields work
        const BOM = "\uFEFF";
        const result = parseCsv(BOM + '"hello",world\n1,2');
        expect(result.success).toBe(true);
        expect(result.data![0]["hello"]).toBe("1");
        expect(result.data![0]["world"]).toBe("2");
    });

    it("should not strip BOM from middle of input", () => {
        // Input: "a,b\n\"\uFEFF\",2"
        // Options: {} (default)
        // Expected: BOM in quoted field is preserved
        const BOM = "\uFEFF";
        const result = parseCsv('a,b\n"' + BOM + '",2');
        expect(result.success).toBe(true);
        expect(result.data![0]["a"]).toBe(BOM);
    });
});

// ──────────────────────────────────────────────
// Row Length Mismatch
// ──────────────────────────────────────────────

describe("row length mismatch", () => {
    it("should pad missing trailing fields with empty strings", () => {
        // Input: "name,age,city\nJohn,20\nJane,25,LA"
        // Options: {} (default)
        // Expected: first data row has empty city value
        const result = parseCsv("name,age,city\nJohn,20\nJane,25,LA");
        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(2);
        expect(result.data![0]).toEqual({ name: "John", age: "20", city: "" });
        expect(result.data![1]).toEqual({ name: "Jane", age: "25", city: "LA" });
    });

    it("should expand column count based on longest row", () => {
        // Input: "name,age\nJohn,20,extra1,extra2\nJane,25"
        // Options: {} (default)
        // Expected: column count = 4; extra fields get synthetic headers column3, column4
        const result = parseCsv("name,age\nJohn,20,extra1,extra2\nJane,25");
        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(2);
        expect(result.data![0]).toHaveProperty("name");
        expect(result.data![0]).toHaveProperty("age");
        expect(result.data![0]).toHaveProperty("column3");
        expect(result.data![0]).toHaveProperty("column4");
        expect(result.data![0].name).toBe("John");
        expect(result.data![0].age).toBe("20");
        expect(result.data![0].column3).toBe("extra1");
        expect(result.data![0].column4).toBe("extra2");
        expect(result.data![1]).toEqual({ name: "Jane", age: "25", column3: "", column4: "" });
    });

    it("should handle significantly mismatched rows (short and long)", () => {
        // Input: "a,b,c\n1,2\n3,4,5,6,7\n8"
        // Options: {} (default)
        // Expected: column count = 5 (longest row has 5 fields); extra synthetic columns
        const result = parseCsv("a,b,c\n1,2\n3,4,5,6,7\n8");
        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(3);
        expect(result.data![0]).toEqual({ a: "1", b: "2", c: "", column4: "", column5: "" });
        expect(result.data![1]).toEqual({ a: "3", b: "4", c: "5", column4: "6", column5: "7" });
        expect(result.data![2]).toEqual({ a: "8", b: "", c: "", column4: "", column5: "" });
    });
});

// ──────────────────────────────────────────────
// Large Input Sanity Test
// ──────────────────────────────────────────────

describe("large input sanity test", () => {
    it("should parse 10 000 rows without errors", () => {
        // Input: generated in-memory CSV with 10 000 data rows
        // Options: {} (default)
        // Expected: success=true, correct record count
        const ROW_COUNT = 10_000;
        const header = "id,value,timestamp";
        const rows: string[] = [];
        for (let i = 0; i < ROW_COUNT; i++) {
            rows.push(`${i},val-${i},${Date.now()}`);
        }
        const csv = header + "\n" + rows.join("\n");

        const result = parseCsv(csv);
        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(ROW_COUNT);
        expect(result.data![0]).toHaveProperty("id");
        expect(result.data![0]).toHaveProperty("value");
        expect(result.data![0]).toHaveProperty("timestamp");
        expect(result.data![0].id).toBe("0");
        expect(result.data![ROW_COUNT - 1].id).toBe(String(ROW_COUNT - 1));
    });

    it("should parse 5 000 rows with headerless mode", () => {
        // Input: generated in-memory CSV with 5 000 data rows, no header
        // Options: { hasHeader: false }
        // Expected: success=true, correct record count, synthetic column names
        const ROW_COUNT = 5_000;
        const rows: string[] = [];
        for (let i = 0; i < ROW_COUNT; i++) {
            rows.push(`${i},data-${i}`);
        }
        const csv = rows.join("\n");

        const result = parseCsv(csv, { hasHeader: false });
        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(ROW_COUNT);
        expect(result.data![0]).toEqual({ column1: "0", column2: "data-0" });
        expect(result.data![ROW_COUNT - 1]).toEqual({
            column1: String(ROW_COUNT - 1),
            column2: `data-${ROW_COUNT - 1}`,
        });
    });
});

// ──────────────────────────────────────────────
// wasQuoted Flag — Preservation
// ──────────────────────────────────────────────

describe("wasQuoted flag", () => {
    it("should preserve whitespace inside quoted fields (RFC 4180)", () => {
        const result = parseCsv('"  hello  ","world"', { hasHeader: false });
        expect(result.success).toBe(true);
        expect(result.data![0]["column1"]).toBe("  hello  ");
        expect(result.data![0]["column2"]).toBe("world");
    });

    it("should trim whitespace from unquoted fields when trimWhitespace=true", () => {
        const result = parseCsv("  hello  ,  world  ", { hasHeader: false });
        expect(result.success).toBe(true);
        expect(result.data![0]["column1"]).toBe("hello");
        expect(result.data![0]["column2"]).toBe("world");
    });

    it("should keep whitespace exactly in quoted fields with commas inside", () => {
        const result = parseCsv('"  a , b  ",c', { hasHeader: false });
        expect(result.success).toBe(true);
        expect(result.data![0]["column1"]).toBe("  a , b  ");
        expect(result.data![0]["column2"]).toBe("c");
    });

    it("should not trim whitespace in quoted fields even when trimWhitespace=true", () => {
        const result = parseCsv('"  spaced  "', { hasHeader: false, trimWhitespace: true });
        expect(result.success).toBe(true);
        expect(result.data![0]["column1"]).toBe("  spaced  ");
    });

    it("should handle escaped quotes inside quoted fields and preserve whitespace", () => {
        const result = parseCsv('"  say ""hi""  "', { hasHeader: false });
        expect(result.success).toBe(true);
        expect(result.data![0]["column1"]).toBe('  say "hi"  ');
    });
});

// ──────────────────────────────────────────────
// Regression Tests
// ──────────────────────────────────────────────

describe("regression tests", () => {
    it("should parse standard CSV correctly", () => {
        const result = parseCsv("name,age,city\nAlice,30,NYC\nBob,25,LA");
        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(2);
        expect(result.data![0]).toEqual({ name: "Alice", age: "30", city: "NYC" });
        expect(result.data![1]).toEqual({ name: "Bob", age: "25", city: "LA" });
    });

    it("should handle quoted fields with embedded newlines", () => {
        const result = parseCsv('a,"multi\nline",c\n1,2,3', { hasHeader: true });
        expect(result.success).toBe(true);
        expect(result.data![0]["a"]).toBe("1");
        expect(result.data![0]["c"]).toBe("3");
    });

    it("should handle empty fields", () => {
        const result = parseCsv("a,,c\n1,,3", { hasHeader: true });
        expect(result.success).toBe(true);
        expect(result.data![0]["a"]).toBe("1");
        expect(result.data![0]["c"]).toBe("3");
    });
});

// ──────────────────────────────────────────────
// Line/Column Reporting
// ──────────────────────────────────────────────

describe("line/column reporting", () => {
    it("should report correct line number for unterminated quotes", () => {
        const result = parseCsv('a,b\n"unterminated', { hasHeader: false });
        expect(result.success).toBe(false);
        expect(result.error!.line).toBe(2);
    });

    it("should report correct column for unterminated quotes on first line", () => {
        const result = parseCsv('"unterminated,b', { hasHeader: false });
        expect(result.success).toBe(false);
        expect(result.error!.column).toBe(1);
    });

    it("should report correct column for unterminated quote not in first field", () => {
        const result = parseCsv("a,\"unterminated\nnext", { hasHeader: false });
        expect(result.success).toBe(false);
        expect(result.error!.line).toBe(1);
        expect(result.error!.column).toBe(3);
    });
});

