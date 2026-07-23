import { describe, it, expect } from "vitest";
import { convertJsonToCsv, previewJsonRecords } from "../converter";
import { validateJsonInput, detectDelimiter } from "../validation";
import { formatJsonAsCsv } from "../jsonToCsvFormatter";

// ──────────────────────────────────────────────
// converter.ts — convertJsonToCsv
// ──────────────────────────────────────────────

describe("convertJsonToCsv", () => {
  it("converts a simple array of objects to CSV", () => {
    const input = JSON.stringify([
      { name: "Alice", age: 30 },
      { name: "Bob", age: 25 },
    ]);
    const result = convertJsonToCsv(input);
    const lines = result.split("\r\n");
    expect(lines[0]).toBe("name,age");
    expect(lines[1]).toBe("Alice,30");
    expect(lines[2]).toBe("Bob,25");
  });

  it("returns empty string for empty input", () => {
    expect(convertJsonToCsv("")).toBe("");
    expect(convertJsonToCsv("   ")).toBe("");
  });

  it("wraps single object into array", () => {
    const result = convertJsonToCsv('{"id":1,"name":"Test"}');
    expect(result).toContain("id,name");
    expect(result).toContain("1,Test");
  });

  it("throws on invalid JSON", () => {
    expect(() => convertJsonToCsv("{bad json}")).toThrow();
  });

  it("throws on null JSON", () => {
    expect(() => convertJsonToCsv("null")).toThrow();
  });

  it("supports semicolon delimiter", () => {
    const input = JSON.stringify([{ a: 1, b: 2 }]);
    const result = convertJsonToCsv(input, { delimiter: ";" });
    expect(result).toBe("a;b\r\n1;2");
  });

  it("supports tab delimiter", () => {
    const input = JSON.stringify([{ a: 1, b: 2 }]);
    const result = convertJsonToCsv(input, { delimiter: "\t" });
    expect(result).toBe("a\tb\r\n1\t2");
  });

  it("excludes headers when includeHeaders is false", () => {
    const input = JSON.stringify([{ x: 10, y: 20 }]);
    const result = convertJsonToCsv(input, { includeHeaders: false });
    expect(result).toBe("10,20");
  });

  it("flattens nested objects by default", () => {
    const input = JSON.stringify([{ user: { name: "Alice", age: 30 } }]);
    const result = convertJsonToCsv(input);
    expect(result).toContain("user.name");
    expect(result).toContain("user.age");
    expect(result).toContain("Alice");
    expect(result).toContain("30");
  });

  it("escapes cells containing delimiters", () => {
    const input = JSON.stringify([{ note: "hello, world" }]);
    const result = convertJsonToCsv(input);
    expect(result).toContain('"hello, world"');
  });

  it("escapes cells containing double quotes", () => {
    const input = JSON.stringify([{ note: 'say "hi"' }]);
    const result = convertJsonToCsv(input);
    expect(result).toContain('"say ""hi"""');
  });

  it("handles primitive values", () => {
    expect(() => convertJsonToCsv('"just a string"')).not.toThrow();
    expect(() => convertJsonToCsv("42")).not.toThrow();
    expect(() => convertJsonToCsv("true")).not.toThrow();
  });
});

// ──────────────────────────────────────────────
// converter.ts — previewJsonRecords
// ──────────────────────────────────────────────

describe("previewJsonRecords", () => {
  it("returns parsed records", () => {
    const input = JSON.stringify([{ a: 1 }, { a: 2 }]);
    const records = previewJsonRecords(input);
    expect(records).toHaveLength(2);
    expect(records[0]).toEqual({ a: 1 });
  });

  it("wraps single object into array", () => {
    const records = previewJsonRecords('{"x":1}');
    expect(records).toHaveLength(1);
    expect(records[0]).toEqual({ x: 1 });
  });

  it("flattens nested objects", () => {
    const input = JSON.stringify([{ user: { name: "Alice" } }]);
    const records = previewJsonRecords(input);
    expect(records[0]).toHaveProperty("user.name");
  });
});

// ──────────────────────────────────────────────
// validation.ts — validateJsonInput
// ──────────────────────────────────────────────

describe("validateJsonInput", () => {
  it("returns valid for good JSON array", () => {
    const result = validateJsonInput('[{"a":1}]');
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("returns error for empty input", () => {
    const result = validateJsonInput("");
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe("EMPTY_INPUT");
  });

  it("returns error for invalid JSON", () => {
    const result = validateJsonInput("{bad}");
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe("INVALID_JSON");
  });

  it("returns error for null", () => {
    const result = validateJsonInput("null");
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe("NULL_VALUE");
  });

  it("returns warning for primitive values", () => {
    const result = validateJsonInput('"hello"');
    expect(result.valid).toBe(true);
    expect(result.warnings[0].code).toBe("PRIMITIVE_VALUE");
  });

  it("returns warning for empty array", () => {
    const result = validateJsonInput("[]");
    expect(result.valid).toBe(true);
    expect(result.warnings[0].code).toBe("EMPTY_ARRAY");
  });
});

// ──────────────────────────────────────────────
// validation.ts — detectDelimiter
// ──────────────────────────────────────────────

describe("detectDelimiter", () => {
  it("detects comma", () => {
    expect(detectDelimiter("a,b,c")).toBe(",");
  });

  it("detects semicolon", () => {
    expect(detectDelimiter("a;b;c")).toBe(";");
  });

  it("detects tab", () => {
    expect(detectDelimiter("a\tb\tc")).toBe("\t");
  });

  it("returns comma for empty or ambiguous", () => {
    expect(detectDelimiter("")).toBe(",");
    expect(detectDelimiter("abc")).toBe(",");
  });
});

// ──────────────────────────────────────────────
// jsonToCsvFormatter.ts — formatJsonAsCsv
// ──────────────────────────────────────────────

describe("formatJsonAsCsv", () => {
  it("returns empty string for empty data", () => {
    expect(formatJsonAsCsv([])).toBe("");
  });

  it("uses provided headers in order", () => {
    const data = [{ b: 2, a: 1 }];
    const result = formatJsonAsCsv(data, {}, ["z", "a"]);
    const lines = result.split("\r\n");
    expect(lines[0]).toBe("z,a");
    expect(lines[1]).toBe(",1");
  });

  it("handles non-flatten mode by stringifying objects", () => {
    const data = [{ nested: { x: 1 } }];
    const result = formatJsonAsCsv(data, { flatten: false });
    // The nested object is stringified as JSON, then CSV-escaped (double quotes doubled)
    expect(result).toContain("nested");
    expect(result).toContain('{""x"":1}');
  });
});
