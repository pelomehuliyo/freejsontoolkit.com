/**
 * CSV Module — Type Inference
 *
 * Pure, side-effect-free type inference for parsed CSV data.
 * Operates on the existing ParsedCsv (where all values are strings)
 * and returns structured type analysis metadata.
 *
 * Two-stage design:
 *   1. analyzeTypes — analyses string values and produces a TypeAnalysis
 *      with per-column profiles, confidence scores, and type counts.
 *   2. applyTypes   — applies the analysis to cast string values to
 *      their inferred JavaScript types.
 *
 * Inference policy: STRICT (v1)
 *   A column's inferredType is the most specific type that ALL non-empty
 *   values are consistent with. Any deviation forces "string".
 *
 * Supported types (configurable via TypeInferenceOptions.detect):
 *   - integer   (base-10, no leading zeros except single "0")
 *   - float     (decimal point, optional leading digits, required fractional)
 *   - boolean   (case-insensitive "true" / "false")
 *   - null      (case-insensitive literal "null")
 *
 * Explicitly NOT inferred (remain as strings):
 *   - Dates, scientific notation, UUIDs, hex, percentages,
 *     currencies, arrays, objects, Infinity, NaN
 *
 * This module is framework-independent, has no DOM or I/O dependencies,
 * and is fully testable in isolation.
 */

import type {
  ColumnTypeProfile,
  CsvRecord,
  InferredCellType,
  ParsedCsv,
  TypeAnalysis,
  TypeInferenceOptions,
} from "./types";
import { DEFAULT_DETECT } from "./types";

// ──────────────────────────────────────────────
// Regex Patterns
// ──────────────────────────────────────────────

/**
 * Matches a base-10 integer, possibly negative.
 * - Leading zeros are NOT allowed (except for the single digit "0").
 * - Negative sign allowed only before a non-zero digit.
 * - Negative zero ("-0") is NOT matched (remains string) — see isNegativeZero guard.
 * - Explicit "+" prefix is NOT matched (remains string).
 *
 * Valid: "0", "42", "-7", "100000"
 * Invalid: "00123", "+5", "-0", "1e5"
 */
const INTEGER_RE = /^-?(0|[1-9]\d*)$/;

/**
 * Guards against negative zero ("-0"), which matches INTEGER_RE but is
 * semantically ambiguous and should remain a string.
 */
function isNegativeZero(value: string): boolean {
  return value === "-0";
}

/**
 * Matches a floating-point number with decimal point.
 * - Optional leading digits, required fractional digits after ".".
 * - Leading zeros are allowed in the integer part (but see STRICT policy).
 * - Negative sign allowed.
 *
 * Valid: "3.14", ".5", "-2.5", "0.5", "100.0"
 * Invalid: "5.", "3.14.15", "1e5", ".", "NaN"
 */
const FLOAT_RE = /^-?(0|[1-9]\d*)?\.\d+$/;

/**
 * Matches boolean literals "true" / "false" (case-insensitive).
 * - Only exact matches; no "yes", "no", "1", "0", "t", "f".
 */
const BOOLEAN_RE = /^(true|false)$/i;

/**
 * Matches the literal string "null" (case-insensitive).
 * - Empty strings are NOT inferred as null (per spec).
 * - "undefined", "nil", "none" are NOT matched.
 */
const NULL_RE = /^(null)$/i;

// ──────────────────────────────────────────────
// Internal Helpers
// ──────────────────────────────────────────────

/**
 * Classifies a single string value into an InferredCellType.
 *
 * @param value   The raw string value from the CSV cell
 * @param detect  The set of types currently enabled for detection
 * @returns       The most specific type the value matches
 */
function classifyValue(value: string, detect: Set<InferredCellType>): InferredCellType {
  const trimmed = value.trim();

  // Empty strings are never inferred; they remain as strings
  // (they won't affect column-level type resolution since they're
  //  excluded from non-empty counts)
  if (trimmed === "") {
    return "string";
  }

  // Check in order: null → boolean → integer → float → string
  // This priority ensures most-specific type wins.

  if (detect.has("null") && NULL_RE.test(trimmed)) {
    return "null";
  }

  if (detect.has("boolean") && BOOLEAN_RE.test(trimmed)) {
    return "boolean";
  }

  if (detect.has("integer") && INTEGER_RE.test(trimmed) && !isNegativeZero(trimmed)) {
    return "integer";
  }

  if (detect.has("float") && FLOAT_RE.test(trimmed)) {
    return "float";
  }

  return "string";
}

/**
 * Creates an initialised typeCounts record with all types set to 0.
 */
function createEmptyTypeCounts(): Record<InferredCellType, number> {
  return {
    integer: 0,
    float: 0,
    boolean: 0,
    null: 0,
    string: 0,
  };
}

/**
 * Builds a ColumnTypeProfile for a single column by scanning all values.
 *
 * Implements the STRICT inference policy:
 *   - The inferredType is the intersection of all non-empty values' types.
 *   - The most specific type that covers ALL values wins.
 *   - If no single non-string type covers all values, the column is "string".
 *
 * @param column  The column header name
 * @param values  All string values for this column (one per row)
 * @param detect  The set of types enabled for detection
 * @returns       A fully populated ColumnTypeProfile
 */
function buildColumnProfile(
  column: string,
  values: string[],
  detect: Set<InferredCellType>,
): ColumnTypeProfile {
  const typeCounts = createEmptyTypeCounts();
  let emptyCount = 0;

  // First pass: classify every value
  for (const value of values) {
    const type = classifyValue(value, detect);
    if (type === "string" && value.trim() === "") {
      // Empty strings are counted separately and don't affect inference
      emptyCount++;
      // Don't increment string count for empty cells
      continue;
    }
    typeCounts[type]++;
  }

  const totalValues = values.length - emptyCount;

  // ── Resolve inferredType via STRICT policy ──

  // Collect all types that appear in non-empty values
  const presentTypes: InferredCellType[] = [];
  for (const t of ["integer", "float", "boolean", "null", "string"] as InferredCellType[]) {
    if (typeCounts[t] > 0) {
      presentTypes.push(t);
    }
  }

  let inferredType: InferredCellType;
  let confidence: number;

  if (totalValues === 0) {
    // No non-empty values — nothing to infer
    inferredType = "string";
    confidence = 0;
  } else if (presentTypes.length === 1) {
    // All values agree on a single type
    inferredType = presentTypes[0];
    confidence = 1.0;
  } else {
    // Multiple types present — apply STRICT resolution rules

    // If any value is a pure string, column is string
    if (typeCounts.string > 0) {
      inferredType = "string";
      confidence = 1.0;
    }
    // Mix of integer + float → float (broader type)
    else if (typeCounts.integer > 0 && typeCounts.float > 0 && presentTypes.length === 2) {
      inferredType = "float";
      confidence = typeCounts.float / totalValues;
    }
    // Mix of integer + null → integer (null is "absent value")
    else if (typeCounts.integer > 0 && typeCounts.null > 0 && presentTypes.length === 2) {
      inferredType = "integer";
      confidence = typeCounts.integer / totalValues;
    }
    // Mix of float + null → float
    else if (typeCounts.float > 0 && typeCounts.null > 0 && presentTypes.length === 2) {
      inferredType = "float";
      confidence = typeCounts.float / totalValues;
    }
    // Mix of boolean + null → boolean
    else if (typeCounts.boolean > 0 && typeCounts.null > 0 && presentTypes.length === 2) {
      inferredType = "boolean";
      confidence = typeCounts.boolean / totalValues;
    }
    // Any other combination → string (STRICT fails)
    else {
      inferredType = "string";
      confidence = 1.0;
    }
  }

  return {
    column,
    inferredType,
    confidence,
    typeCounts,
    totalValues,
    emptyCount,
  };
}

/**
 * Casts a single string value to its inferred JavaScript type.
 *
 * @param value  The raw string value
 * @param type   The inferred cell-level type
 * @returns      The value cast to the appropriate JS type, or the original string
 */
function castToType(value: string, type: InferredCellType): unknown {
  switch (type) {
    case "integer":
      return parseInt(value, 10);
    case "float":
      return parseFloat(value);
    case "boolean":
      return value.toLowerCase() === "true";
    case "null":
      return null;
    case "string":
    default:
      return value;
  }
}

/**
 * Resolves the effective detection set from options.
 */
function resolveDetect(options?: TypeInferenceOptions): Set<InferredCellType> {
  const detect = options?.detect ?? DEFAULT_DETECT;
  return new Set(detect);
}

// ──────────────────────────────────────────────
// Public API — Stage 1: Analysis
// ──────────────────────────────────────────────

/**
 * Analyses the string values in a ParsedCsv and returns a TypeAnalysis
 * containing per-column type profiles with confidence scores.
 *
 * Uses STRICT inference policy (v1): a column's inferredType is the most
 * specific type that ALL non-empty values are consistent with.
 *
 * @param csv     The parsed CSV (records with string values)
 * @param options Configuration for which types to infer
 * @returns       A TypeAnalysis with column profiles
 *
 * @example
 * const analysis = analyzeTypes(parsedCsv);
 * // analysis.columns[0] = { column: "age", inferredType: "integer", confidence: 1.0 }
 *
 * @example
 * // Only detect integers and booleans
 * const analysis = analyzeTypes(parsedCsv, { detect: ["integer", "boolean"] });
 */
export function analyzeTypes(csv: ParsedCsv, options?: TypeInferenceOptions): TypeAnalysis {
  const detect = resolveDetect(options);
  const { headers, records } = csv;

  if (headers.length === 0) {
    return { columns: [], complete: true };
  }

  const columns: ColumnTypeProfile[] = [];

  for (let colIndex = 0; colIndex < headers.length; colIndex++) {
    const columnName = headers[colIndex];
    const values: string[] = [];

    for (const record of records) {
      values.push(record[columnName] ?? "");
    }

    columns.push(buildColumnProfile(columnName, values, detect));
  }

  return { columns, complete: true };
}

// ──────────────────────────────────────────────
// Public API — Stage 2: Application
// ──────────────────────────────────────────────

/**
 * Applies a TypeAnalysis to a ParsedCsv, producing typed records.
 *
 * The original `records` array (with string values) is preserved unchanged.
 * A new `typedRecords` array is added where each value is cast to its
 * inferred JavaScript type.
 *
 * Values that don't match the column's inferredType are left as strings.
 * This can happen when the column has mixed types (confidence < 1.0).
 *
 * @param csv      The original parsed CSV (records with string values)
 * @param analysis The type analysis from analyzeTypes()
 * @returns        A new ParsedCsv extended with a `typedRecords` array
 *
 * @example
 * const analysis = analyzeTypes(parsedCsv);
 * const result = applyTypes(parsedCsv, analysis);
 * // result.typedRecords[0].age === 42 (number)
 * // result.records[0].age === "42" (string — original preserved)
 */
export function applyTypes(
  csv: ParsedCsv,
  analysis: TypeAnalysis,
): ParsedCsv & { typedRecords: Record<string, unknown>[] } {
  const { headers, records } = csv;
  const typedRecords: Record<string, unknown>[] = [];

  // Build a quick lookup: column name → inferredType
  const typeMap = new Map<string, InferredCellType>();
  for (const profile of analysis.columns) {
    typeMap.set(profile.column, profile.inferredType);
  }

  for (const record of records) {
    const typedRecord: Record<string, unknown> = {};

    for (const header of headers) {
      const rawValue = record[header] ?? "";
      const inferredType = typeMap.get(header) ?? "string";

      // Classify the individual value to check if it matches the column type
      const valueType = classifyValue(rawValue, new Set(["integer", "float", "boolean", "null"]));

      // Only cast if the value's detected type matches the column's inferred type
      if (valueType === inferredType) {
        typedRecord[header] = castToType(rawValue, inferredType);
      } else if (inferredType === "float" && valueType === "integer") {
        // Float columns also accept integer values (float is broader)
        typedRecord[header] = castToType(rawValue, "float");
      } else if (inferredType === "string") {
        // String columns keep values as-is
        typedRecord[header] = rawValue;
      } else {
        // Value doesn't match column type — keep as string
        typedRecord[header] = rawValue;
      }
    }

    typedRecords.push(typedRecord);
  }

  return {
    ...csv,
    typedRecords,
  };
}
