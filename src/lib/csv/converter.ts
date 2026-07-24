/**
 * CSV Module — Auto-Convert
 *
 * High-level bridge that orchestrates the full JSON → CSV pipeline:
 *   1. Validate JSON input
 *   2. Parse JSON into record array
 *   3. Flatten records (if requested)
 *   4. Format into CSV string
 *
 * This is the primary entry-point for the JSON-to-CSV tool.
 */

import type { ConversionOptions } from "./types";
import { validateJsonInput } from "./validation";
import { formatJsonAsCsv } from "./jsonToCsvFormatter";
import { flattenJson as flattenObj } from "./helpers";

// ──────────────────────────────────────────────
// Public API
// ──────────────────────────────────────────────

/**
 * Converts a raw JSON string into a CSV string.
 *
 * Supports both JSON arrays and single objects/primitives
 * (which are wrapped into a single-element array).
 *
 * @param jsonStr  Raw JSON input
 * @param options  Conversion options (delimiter, flatten, includeHeaders)
 * @returns        RFC 4180 CSV string
 * @throws         If JSON is invalid or conversion fails
 */
export function convertJsonToCsv(jsonStr: string, options: ConversionOptions = {}): string {
  const input = jsonStr.trim();
  if (!input) {
    return "";
  }

  // Validate before processing
  const validation = validateJsonInput(input);
  if (!validation.valid) {
    throw new Error(validation.errors.map((e) => e.message).join("; "));
  }

  // Parse JSON
  let parsed: unknown;
  try {
    parsed = JSON.parse(input);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to parse JSON";
    throw new Error(`Invalid JSON syntax: ${msg}`);
  }

  // Standardise: wrap non-arrays into a single-element array
  const items = Array.isArray(parsed) ? parsed : [parsed];

  // Convert to CSV
  const result = formatJsonAsCsv(items as Record<string, unknown>[], options);

  return result;
}

/**
 * Given a JSON string, returns parsed records for preview / inspection.
 *
 * @returns Array of parsed objects (flattened if options.flatten is true)
 */
export function previewJsonRecords(
  jsonStr: string,
  options: ConversionOptions = {},
): Record<string, unknown>[] {
  // Parse JSON
  const parsed: unknown = JSON.parse(jsonStr.trim());
  const items = Array.isArray(parsed) ? parsed : [parsed];

  const flatten = options.flatten !== false;

  if (flatten) {
    return items.map((item: unknown) => {
      const flat: Record<string, unknown> = {};
      flattenObj(item, "", flat);
      return flat;
    });
  }

  return items as Record<string, unknown>[];
}
