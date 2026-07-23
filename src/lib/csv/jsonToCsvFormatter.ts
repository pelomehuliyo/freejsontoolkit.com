/**
 * CSV Module — JSON Formatter
 *
 * Transforms structured JSON data (record arrays) into CSV strings.
 * Handles RFC 4180 cell escaping, configurable delimiters, flattening,
 * and header inclusion.
 */

import type { ConversionOptions, FlattenedRecord } from "./types";

// ──────────────────────────────────────────────
// Public API
// ──────────────────────────────────────────────

/**
 * Converts an array of record objects into a CSV string.
 *
 * @param data         Array of flat or nested objects
 * @param options      Conversion options (delimiter, flatten, includeHeaders)
 * @param headers      Optional explicit header ordering; auto-detected if omitted
 * @returns            RFC 4180 compliant CSV string
 */
export function formatJsonAsCsv(
  data: Record<string, unknown>[],
  options: ConversionOptions = {},
  headers?: string[],
): string {
  if (data.length === 0) {
    return "";
  }

  const delimiter = options.delimiter || ",";
  const includeHeaders = options.includeHeaders !== false;
  const flatten = options.flatten !== false;

  // Flatten all records if requested
  const processedItems = data.map((item) => {
    if (flatten) {
      return flattenJson(item);
    }
    // Otherwise stringify nested objects so they appear as JSON in the CSV cell
    const flat: FlattenedRecord = {};
    for (const [key, val] of Object.entries(item)) {
      if (val !== null && typeof val === "object") {
        flat[key] = JSON.stringify(val);
      } else {
        flat[key] = val;
      }
    }
    return flat;
  });

  // Collect all unique headers across all records
  const resolvedHeaders = headers ?? collectHeaders(processedItems);

  if (resolvedHeaders.length === 0) {
    return "";
  }

  const csvRows: string[] = [];

  // 1. Optional header row
  if (includeHeaders) {
    csvRows.push(resolvedHeaders.map((h) => escapeCsvCell(h, delimiter)).join(delimiter));
  }

  // 2. Data rows
  for (const item of processedItems) {
    const row = resolvedHeaders.map((header) => escapeCsvCell(item[header], delimiter));
    csvRows.push(row.join(delimiter));
  }

  return csvRows.join("\r\n");
}

// ──────────────────────────────────────────────
// Internal Helpers
// ──────────────────────────────────────────────

/**
 * Flattens a nested object into dot-notation keys.
 *
 * Example:
 *   { user: { name: "John", tags: [1, 2] } }
 *   → { "user.name": "John", "user.tags.0": 1, "user.tags.1": 2 }
 */
function flattenJson(obj: unknown, prefix = "", res: FlattenedRecord = {}): FlattenedRecord {
  if (obj === null || obj === undefined) {
    if (prefix) res[prefix] = "";
    return res;
  }

  if (Array.isArray(obj)) {
    if (obj.length === 0) {
      if (prefix) res[prefix] = "";
    } else {
      for (let i = 0; i < obj.length; i++) {
        const propName = prefix ? `${prefix}.${i}` : `${i}`;
        flattenJson(obj[i], propName, res);
      }
    }
    return res;
  }

  if (typeof obj === "object" && obj !== null) {
    const keys = Object.keys(obj as Record<string, unknown>);
    if (keys.length === 0) {
      if (prefix) res[prefix] = "";
    } else {
      for (const key of keys) {
        const val = (obj as Record<string, unknown>)[key];
        const propName = prefix ? `${prefix}.${key}` : key;
        if (val !== null && typeof val === "object") {
          flattenJson(val, propName, res);
        } else {
          res[propName] = val;
        }
      }
    }
    return res;
  }

  // Primitive value at root
  if (prefix) {
    res[prefix] = obj;
  }
  return res;
}

/**
 * Collects all unique keys (headers) from an array of flat records,
 * preserving insertion order for predictability.
 */
function collectHeaders(items: FlattenedRecord[]): string[] {
  const headerSet = new Set<string>();
  for (const item of items) {
    for (const key of Object.keys(item)) {
      headerSet.add(key);
    }
  }
  return Array.from(headerSet);
}

/**
 * Escapes a single cell value according to RFC 4180.
 *
 * Wraps cells in double quotes if they contain:
 *   - the delimiter character
 *   - double quotes
 *   - newlines / carriage returns
 */
function escapeCsvCell(val: unknown, delimiter: string): string {
  if (val === null || val === undefined) {
    return "";
  }

  const str = String(val);

  const needsEscaping =
    str.includes(delimiter) || str.includes('"') || str.includes("\n") || str.includes("\r");

  if (needsEscaping) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}
