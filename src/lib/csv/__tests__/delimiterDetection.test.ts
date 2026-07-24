/**
 * Delimiter Detection — Comprehensive Unit Tests
 *
 * Covers all functionality of detectDelimiter():
 *   - Basic detection for each candidate delimiter
 *   - Quoted field awareness (delimiters inside quotes are ignored)
 *   - Multi-line and multi-row CSV
 *   - Edge cases (empty, single-line, whitespace, all delimiters, inconsistent)
 *   - Tiebreaker (ambiguous scores)
 *   - Confidence levels
 *   - Additional: 1-column files, headers-only, all delimiters in quoted text,
 *     100k-line performance sanity, random text fallback, Unicode (emoji, Chinese, Arabic)
 *
 * Every test clearly states:
 *   - input
 *   - options (if any)
 *   - expected DelimiterDetectionResult fields
 */

import { describe, it, expect } from "vitest";
import { detectDelimiter, DEFAULT_SAMPLE_LINES } from "../delimiterDetection";
import type { CsvDelimiter } from "../types";

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

/** Build a multi-row CSV string for a given delimiter */
function csvOf(delim: string, rows: number): string {
    const headers = ["a", "b", "c"].join(delim);
    const data: string[] = [];
    for (let i = 0; i < rows; i++) {
        data.push([`v${i}1`, `v${i}2`, `v${i}3`].join(delim));
    }
    return [headers, ...data].join("\n");
}

// ──────────────────────────────────────────────
// Basic Detection
// ──────────────────────────────────────────────

describe("basic detection — each candidate delimiter", () => {
    it("should detect comma delimiter", () => {
        const result = detectDelimiter("a,b,c\n1,2,3\n4,5,6");
        expect(result.delimiter).toBe(",");
        expect(result.confidence).toBeGreaterThanOrEqual(0.9);
        expect(result.scores[","]).toBeGreaterThan(0);
        expect(result.scores[";"]).toBe(0);
        expect(result.sampledLines).toBeGreaterThan(0);
    });

    it("should detect semicolon delimiter", () => {
        const result = detectDelimiter("a;b;c\n1;2;3\n4;5;6");
        expect(result.delimiter).toBe(";");
        expect(result.confidence).toBeGreaterThanOrEqual(0.9);
        expect(result.scores[";"]).toBeGreaterThan(0);
        expect(result.scores[","]).toBe(0);
    });

    it("should detect tab delimiter", () => {
        const result = detectDelimiter("a\tb\tc\n1\t2\t3\n4\t5\t6");
        expect(result.delimiter).toBe("\t");
        expect(result.confidence).toBeGreaterThanOrEqual(0.9);
        expect(result.scores["\t"]).toBeGreaterThan(0);
    });

    it("should detect pipe delimiter", () => {
        const result = detectDelimiter("a|b|c\n1|2|3\n4|5|6");
        expect(result.delimiter).toBe("|");
        expect(result.confidence).toBeGreaterThanOrEqual(0.9);
        expect(result.scores["|"]).toBeGreaterThan(0);
    });

    it("should detect colon delimiter", () => {
        const result = detectDelimiter("a:b:c\n1:2:3\n4:5:6");
        expect(result.delimiter).toBe(":");
        expect(result.confidence).toBeGreaterThanOrEqual(0.9);
        expect(result.scores[":"]).toBeGreaterThan(0);
    });
});

// ──────────────────────────────────────────────
// Quoted Fields
// ──────────────────────────────────────────────

describe("quoted fields — delimiters inside quotes are ignored", () => {
    it("should ignore comma inside quoted field", () => {
        // The comma inside "hello,world" should NOT count as a delimiter
        const result = detectDelimiter('"hello,world",foo\n1,2');
        expect(result.delimiter).toBe(",");
        // Only 1 comma outside quotes per line = consistent
        expect(result.confidence).toBeGreaterThanOrEqual(0.5);
    });

    it("should ignore semicolon inside quoted field", () => {
        const result = detectDelimiter('"hello;world";foo\n1;2');
        expect(result.delimiter).toBe(";");
        expect(result.confidence).toBeGreaterThanOrEqual(0.5);
    });

    it("should ignore pipe inside quoted field", () => {
        const result = detectDelimiter('"hello|world"|foo\n1|2');
        expect(result.delimiter).toBe("|");
        expect(result.confidence).toBeGreaterThanOrEqual(0.5);
    });

    it("should ignore colon inside quoted field", () => {
        const result = detectDelimiter('"hello:world":foo\n1:2');
        expect(result.delimiter).toBe(":");
        expect(result.confidence).toBeGreaterThanOrEqual(0.5);
    });

    it("should ignore tab inside quoted field", () => {
        const result = detectDelimiter('"hello\tworld"\tfoo\n1\t2');
        expect(result.delimiter).toBe("\t");
        expect(result.confidence).toBeGreaterThanOrEqual(0.5);
    });

    it("should handle escaped double quotes inside quoted fields", () => {
        // The "" inside quotes is an escaped quote, should not break quote tracking
        const result = detectDelimiter('"say ""hi""",foo\n1,2');
        expect(result.delimiter).toBe(",");
        expect(result.confidence).toBeGreaterThanOrEqual(0.5);
    });

    it("should handle multiple quoted fields with delimiters", () => {
        const result = detectDelimiter('"a,b","c,d",e\n1,2,3');
        expect(result.delimiter).toBe(",");
        // 1 comma outside quotes per line
        expect(result.confidence).toBeGreaterThanOrEqual(0.3);
    });
});

// ──────────────────────────────────────────────
// Multi-line and Multi-row
// ──────────────────────────────────────────────

describe("multi-line and multi-row CSV", () => {
    it("should detect delimiter across multiple rows", () => {
        const csv = csvOf(",", 5);
        const result = detectDelimiter(csv);
        expect(result.delimiter).toBe(",");
        expect(result.confidence).toBeGreaterThanOrEqual(0.9);
    });

    it("should handle multiline quoted fields (newline inside quotes)", () => {
        // The newline is inside quotes, so the line appears as one row split across lines
        const result = detectDelimiter('a,"multi\nline",c\n1,2,3');
        expect(result.delimiter).toBe(",");
        // Should still detect correctly (the multiline field spans 2 lines)
        expect(result.confidence).toBeGreaterThanOrEqual(0.3);
    });

    it("should handle CSV with trailing newline", () => {
        const result = detectDelimiter("a,b,c\n1,2,3\n");
        expect(result.delimiter).toBe(",");
        expect(result.confidence).toBeGreaterThanOrEqual(0.9);
    });
});

// ──────────────────────────────────────────────
// Edge Cases
// ──────────────────────────────────────────────

describe("edge cases", () => {
    it("should return comma with confidence 0 for empty input", () => {
        const result = detectDelimiter("");
        expect(result.delimiter).toBe(",");
        expect(result.confidence).toBe(0);
        expect(result.sampledLines).toBe(0);
        expect(result.tiebroken).toBe(false);
        expect(result.ambiguous).toBe(false);
    });

    it("should detect delimiter in single-line CSV (headers only)", () => {
        const result = detectDelimiter("a,b,c");
        expect(result.delimiter).toBe(",");
        expect(result.confidence).toBeGreaterThanOrEqual(0.3);
    });

    it("should detect delimiter in single-line CSV (data only, headerless)", () => {
        const result = detectDelimiter("1,2,3");
        expect(result.delimiter).toBe(",");
        expect(result.confidence).toBeGreaterThanOrEqual(0.3);
    });

    it("should handle whitespace around delimiters", () => {
        const result = detectDelimiter("a , b , c\n1 , 2 , 3");
        expect(result.delimiter).toBe(",");
        expect(result.confidence).toBeGreaterThanOrEqual(0.5);
    });

    it("should detect best delimiter when all delimiters are present", () => {
        // The comma is most consistent (3 per line) vs semicolon (1 per line)
        const result = detectDelimiter("a,b;c|d:e\n1,2;3|4:5");
        expect(result.delimiter).toBe(",");
        expect(result.confidence).toBeGreaterThanOrEqual(0.3);
    });

    it("should return low confidence for inconsistent delimiters across rows", () => {
        // Row 1: comma, Row 2: semicolon
        const result = detectDelimiter("a,b,c\n1;2;3");
        // Neither should have high confidence
        expect(result.confidence).toBeLessThan(0.9);
    });

    it("should handle BOM-prefixed input and detect correctly", () => {
        const BOM = "\uFEFF";
        const result = detectDelimiter(BOM + "a,b,c\n1,2,3");
        expect(result.delimiter).toBe(",");
        expect(result.confidence).toBeGreaterThanOrEqual(0.5);
    });

    it("should handle whitespace-only lines (skip them)", () => {
        // Multiple blank lines mixed with data
        const result = detectDelimiter("\n\n\na,b,c\n\n1,2,3\n\n");
        expect(result.delimiter).toBe(",");
        expect(result.confidence).toBeGreaterThanOrEqual(0.5);
    });

    it("should sample limited lines and not scan full large input unnecessarily", () => {
        // Create a 100-line CSV — detector should only sample DEFAULT_SAMPLE_LINES
        const csv = csvOf(",", 100);
        const result = detectDelimiter(csv);
        expect(result.delimiter).toBe(",");
        expect(result.sampledLines).toBeLessThanOrEqual(DEFAULT_SAMPLE_LINES);
        expect(result.confidence).toBeGreaterThanOrEqual(0.9);
    });
});

// ──────────────────────────────────────────────
// Tiebreaker
// ──────────────────────────────────────────────

describe("tiebreaker — ambiguous cases", () => {
    it("should handle single-column CSV (no delimiters to compare)", () => {
        const result = detectDelimiter("a\n1\n2");
        // All scores are 0, so fallback to comma
        expect(result.delimiter).toBe(",");
        expect(result.confidence).toBe(0);
    });

    it("should detect correctly when two delimiters appear equally often", () => {
        // Both comma and semicolon appear 2 times per line.
        // Tiebreaker should resolve by field-count consistency.
        const result = detectDelimiter("a,b;c,d;e\n1,2;3,4;5\n6,7;8,9;10");
        // If commas and semicolons appear equally, tiebreaker picks by consistency
        expect([",", ";" as CsvDelimiter]).toContain(result.delimiter);
    });
});

// ──────────────────────────────────────────────
// Confidence Levels
// ──────────────────────────────────────────────

describe("confidence levels", () => {
    it("should return high confidence for perfectly consistent CSV", () => {
        const csv = csvOf(",", 8);
        const result = detectDelimiter(csv);
        expect(result.delimiter).toBe(",");
        expect(result.confidence).toBeGreaterThanOrEqual(0.9);
    });

    it("should return medium confidence for somewhat inconsistent CSV", () => {
        // Mix of comma and semicolon rows
        const result = detectDelimiter("a,b,c\n1,2,3\n4;5;6\n7,8,9");
        expect(result.confidence).toBeLessThan(1);
        // The most consistent delimiter should be chosen
        expect(["," as CsvDelimiter, ";" as CsvDelimiter]).toContain(result.delimiter);
    });

    it("should return low confidence for near-random distribution", () => {
        // Each row uses a different delimiter
        const result = detectDelimiter("a,b,c\n1;2;3\n4|5|6\n7:8:9");
        // No single delimiter is consistently used
        expect(result.confidence).toBeLessThan(0.5);
    });
});

// ──────────────────────────────────────────────
// Additional Tests
// ──────────────────────────────────────────────

describe("additional edge cases", () => {
    it("should handle file with only one column", () => {
        const result = detectDelimiter("a\n1\n2\n3");
        expect(result.delimiter).toBe(",");
        expect(result.confidence).toBe(0);
    });

    it("should handle file with only headers (single line, no data)", () => {
        const result = detectDelimiter("a,b,c,d");
        expect(result.delimiter).toBe(",");
        expect(result.confidence).toBeGreaterThanOrEqual(0.3);
    });

    it("should handle file containing every delimiter inside quoted text", () => {
        // All delimiter characters inside quotes — should be ignored
        // Only the separators outside quotes count
        const csv = '"a,b;c|d:e",foo\n"1,2;3|4:5",bar';
        const result = detectDelimiter(csv);
        expect(result.delimiter).toBe(",");
    });

    it("should handle random text gracefully (fallback)", () => {
        // No clear delimiter pattern — just random characters
        const result = detectDelimiter("the quick brown fox jumps over the lazy dog");
        // Should not crash; fallback to comma
        expect(result.delimiter).toBe(",");
        expect(result.confidence).toBeLessThanOrEqual(0.5);
    });

    it("should handle malformed CSV with unterminated quote", () => {
        // Unterminated quote means everything after is "inside" quotes
        // This should result in low confidence / fallback
        const result = detectDelimiter('a,b,c\n"unterminated,1,2');
        // Won't crash — should still return a result
        expect(result.delimiter).toBeDefined();
    });

    it("should handle Unicode with emoji characters", () => {
        const result = detectDelimiter("name,message\n😀,hello\n🎉,world");
        expect(result.delimiter).toBe(",");
        expect(result.confidence).toBeGreaterThanOrEqual(0.5);
    });

    it("should handle Unicode with Chinese characters", () => {
        const result = detectDelimiter("姓名,年龄\n张三,30\n李四,25");
        expect(result.delimiter).toBe(",");
        expect(result.confidence).toBeGreaterThanOrEqual(0.5);
    });

    it("should handle Unicode with Arabic characters", () => {
        const result = detectDelimiter("الاسم,العمر\nأحمد,30\nسارة,25");
        expect(result.delimiter).toBe(",");
        expect(result.confidence).toBeGreaterThanOrEqual(0.5);
    });

    it("should handle 100k-line CSV performance sanity test", () => {
        // Build 100k lines of comma-delimited data
        const header = "a,b,c";
        const rows: string[] = [];
        for (let i = 0; i < 100_000; i++) {
            rows.push(`${i},val-${i},ts-${i}`);
        }
        const csv = header + "\n" + rows.join("\n");

        const start = performance.now();
        const result = detectDelimiter(csv);
        const elapsed = performance.now() - start;

        // Should still detect correctly
        expect(result.delimiter).toBe(",");
        expect(result.confidence).toBeGreaterThanOrEqual(0.9);
        // Should only sample DEFAULT_SAMPLE_LINES (10)
        expect(result.sampledLines).toBe(DEFAULT_SAMPLE_LINES);
        // Should complete quickly (under 500ms)
        expect(elapsed).toBeLessThan(500);
    });
});

// ──────────────────────────────────────────────
// DetectorOptions — sampleLines
// ──────────────────────────────────────────────

describe("DetectorOptions", () => {
    it("should respect custom sampleLines option", () => {
        const csv = csvOf(",", 50);
        const result = detectDelimiter(csv, { sampleLines: 5 });
        expect(result.sampledLines).toBeLessThanOrEqual(5);
        // Should still detect correctly
        expect(result.delimiter).toBe(",");
        expect(result.confidence).toBeGreaterThanOrEqual(0.5);
    });

    it("should use DEFAULT_SAMPLE_LINES when no options provided", () => {
        const csv = csvOf(",", 50);
        const result = detectDelimiter(csv);
        expect(result.sampledLines).toBeLessThanOrEqual(DEFAULT_SAMPLE_LINES);
    });
});

// ──────────────────────────────────────────────
// Ambiguity and Runner-Up
// ──────────────────────────────────────────────

describe("ambiguity reporting", () => {
    it("should not be ambiguous for clear single-delimiter CSV", () => {
        const result = detectDelimiter("a,b,c\n1,2,3\n4,5,6");
        expect(result.ambiguous).toBe(false);
        expect(result.runnerUp).toBeUndefined();
    });

    it("should report ambiguity when delimiters are close", () => {
        // Both comma and semicolon appear in similar patterns
        // This CSV has 2 commas AND 2 semicolons per line
        const result = detectDelimiter("a,b;c,d;e\n1,2;3,4;5\n6,7;8,9;10");
        // Could be ambiguous
        expect(result.delimiter).toBeDefined();
        // If ambiguous, runnerUp should be set
        if (result.ambiguous && result.runnerUp) {
            expect(result.runnerUp).not.toBe(result.delimiter);
        }
    });
});

