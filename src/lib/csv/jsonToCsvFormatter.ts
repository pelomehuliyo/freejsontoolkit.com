/**
 * CSV Module — JSON Formatter
 *
 * Transforms structured JSON data (record arrays) into CSV strings.
 * Handles RFC 4180 cell escaping, configurable delimiters, flattening,
 * and header inclusion.
 */

import type { ConversionOptions, FlattenedRecord } from "./types";
import { flattenJson } from "./helpers";

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
