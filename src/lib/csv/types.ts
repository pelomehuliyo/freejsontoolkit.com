/**
 * CSV Module — Shared Types & Interfaces
 *
 * Centralises all type definitions for the CSV utility modules.
 * Every other module in src/lib/csv/ should import from here
 * instead of redefining types.
 */

// ──────────────────────────────────────────────
// Conversion Options (JSON → CSV)
// ──────────────────────────────────────────────

export interface ConversionOptions {
  delimiter?: "," | ";" | "\t";
  flatten?: boolean;
  includeHeaders?: boolean;
}

// ──────────────────────────────────────────────
// Delimiter Detection Types
// ──────────────────────────────────────────────

/** The 5 supported CSV delimiter characters */
export type CsvDelimiter = "," | ";" | "\t" | "|" | ":";

/** Options for the delimiter detector */
export interface DetectorOptions {
  /** Number of non-empty lines to sample (default: 10) */
  sampleLines?: number;
}

/** Result of automatic delimiter detection */
export interface DelimiterDetectionResult {
  /** The detected delimiter */
  delimiter: CsvDelimiter;
  /** Overall confidence 0-1 (1 = absolute certainty) */
  confidence: number;
  /** Per-delimiter score breakdown (0-1 each) */
  scores: Record<CsvDelimiter, number>;
  /** Number of non-empty lines sampled */
  sampledLines: number;
  /** Whether the tiebreaker pass was needed */
  tiebroken: boolean;
  /** Whether the result is ambiguous (top 2 scores within 5%) */
  ambiguous: boolean;
  /** The runner-up delimiter, if ambiguous */
  runnerUp?: CsvDelimiter;
}

// ──────────────────────────────────────────────
// Parse Options (CSV → structured data)
// ──────────────────────────────────────────────

export interface ParseOptions {
  delimiter?: "auto" | CsvDelimiter;
  hasHeader?: boolean;
  trimWhitespace?: boolean;
  skipEmptyLines?: boolean;
}

// ──────────────────────────────────────────────
// Parsed CSV (success payload)
// ──────────────────────────────────────────────

/**
 * The structured result of a successful CSV parse.
 * Contains all data and metadata produced by the parser.
 */
export interface ParsedCsv {
  /** Parsed data records (excluding header row) */
  records: CsvRecord[];
  /** Resolved header names from the parsed CSV */
  headers: string[];
  /** Detected or configured delimiter used for parsing */
  delimiter: CsvDelimiter;
  /** Non-fatal warnings produced during parsing */
  warnings: CsvError[];
  /** Delimiter detection metadata (only present when delimiter was auto-detected) */
  detection?: DelimiterDetectionResult;
}

// ──────────────────────────────────────────────
// Parse Result (top-level wrapper)
// ──────────────────────────────────────────────

export interface ParseResult<T> {
  success: boolean;
  /** Populated when parsing succeeds */
  csv?: ParsedCsv;
  /** Populated when parsing fails */
  error?: CsvError;
}

// ──────────────────────────────────────────────
// CSV Error
// ──────────────────────────────────────────────

export interface CsvError {
  code: string;
  message: string;
  line?: number;
  column?: number;
}

// ──────────────────────────────────────────────
// CsvRecord
// ──────────────────────────────────────────────

export interface CsvRecord {
  [key: string]: string;
}

// ──────────────────────────────────────────────
// Flattened Record (internal helper type)
// ──────────────────────────────────────────────

export type FlattenedRecord = Record<string, unknown>;

// ──────────────────────────────────────────────
// Validation Types
// ──────────────────────────────────────────────

/**
 * Severity level for a validation issue.
 * - `error` — Data integrity problem; the CSV should not be used as-is.
 * - `warning` — Potential problem or ambiguity; review recommended.
 * - `info` — Informational observation; no action required.
 */
export type IssueSeverity = "error" | "warning" | "info";

/**
 * A single structured validation issue found during CSV validation.
 */
export interface ValidationIssue {
  /** Severity level */
  severity: IssueSeverity;
  /** Machine-readable error/warning code (e.g. "DUPLICATE_HEADER") */
  code: string;
  /** Human-readable description of the issue */
  message: string;
  /** 0-based row index where the issue occurs (optional) */
  row?: number;
  /** 0-based column index where the issue occurs (optional) */
  column?: number;
  /** Suggested remediation (optional) */
  suggestion?: string;
}

/**
 * Aggregate statistics computed from a parsed CSV.
 * All values are deterministic — no memory estimation, no I/O.
 */
export interface CsvStatistics {
  /** Total number of data rows (excluding header) */
  rowCount: number;
  /** Number of columns (based on resolved header count) */
  columnCount: number;
  /** Number of cells with empty string values */
  emptyCellCount: number;
  /** Number of duplicate header names detected */
  duplicateHeaderCount: number;
  /** Number of duplicate data rows detected */
  duplicateRowCount: number;
  /** Number of rows with a column count that differs from the header count */
  inconsistentRowCount: number;
}

/**
 * Options to control validation behaviour.
 */
export interface ValidationOptions {
  /**
   * Per-rule toggle map.
   * Key is the rule code (e.g. "DUPLICATE_HEADER"), value is whether to run it.
   * By default all rules are enabled.
   */
  rules?: Record<string, boolean>;
}

/**
 * The complete result of a CSV validation pass.
 */
export interface ValidationResult {
  /** Whether the CSV passed all validation checks (no errors) */
  valid: boolean;
  /** All issues found during validation (errors, warnings, info) */
  issues: ValidationIssue[];
  /** Computed statistics for the parsed CSV */
  statistics: CsvStatistics;
}

// ──────────────────────────────────────────────
// Type Inference Types
// ──────────────────────────────────────────────

/**
 * The possible inferred types for a single CSV cell value.
 *
 * Ordered by specificity (most-specific first):
 *   null → boolean → integer → float → string
 */
export type InferredCellType = "integer" | "float" | "boolean" | "null" | "string";

/**
 * The type-inference result for a single CSV column.
 */
export interface ColumnTypeProfile {
  /** The column header name */
  column: string;
  /**
   * The most specific type that ALL non-empty values in this column
   * are consistent with, per the STRICT inference policy.
   */
  inferredType: InferredCellType;
  /**
   * Confidence score 0–1 representing the proportion of non-empty values
   * that match the inferredType. 1.0 = perfect agreement.
   * For "string" type, confidence is always 1.0.
   * For columns with zero non-empty values, confidence is 0.
   */
  confidence: number;
  /** Raw count of each InferredCellType detected in this column */
  typeCounts: Record<InferredCellType, number>;
  /** Number of non-empty values scanned in this column */
  totalValues: number;
  /** Number of cells that were empty strings (counted separately) */
  emptyCount: number;
}

/**
 * The full result of a type analysis pass on a ParsedCsv.
 */
export interface TypeAnalysis {
  /** One ColumnTypeProfile per column, in header order */
  columns: ColumnTypeProfile[];
  /** Whether analysis was completed across all columns */
  complete: boolean;
}

/**
 * The types that type inference will attempt to detect.
 *
 * The DEFAULT_DETECT set is used when no explicit `detect` array is provided.
 */
export const DEFAULT_DETECT: InferredCellType[] = ["integer", "float", "boolean", "null"];

/**
 * Options to control type inference behaviour.
 *
 * Compact grouped format: pass an array of InferredCellType values
 * that should be detected. Types not in the array will be treated as "string".
 *
 * @example
 * // Detect all supported types (default)
 * { detect: ["integer", "float", "boolean", "null"] }
 *
 * @example
 * // Detect integers and booleans only
 * { detect: ["integer", "boolean"] }
 *
 * @example
 * // No inference — everything stays as string
 * { detect: [] }
 */
export interface TypeInferenceOptions {
  /**
   * Array of InferredCellType values to detect during analysis.
   * Types omitted from this list will be classified as "string".
   * Defaults to ["integer", "float", "boolean", "null"].
   */
  detect?: InferredCellType[];
}

