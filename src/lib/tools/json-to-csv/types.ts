/**
 * JSON→CSV Tool — Type Definitions
 *
 * Central state interface for the JSON-to-CSV tool.
 * Uses status enums rather than display strings so the UI layer
 * can generate presentation text.
 */

import type { WorkerStage } from "./workerProtocol";

/** Input validation / file status */
export type InputStatus = "empty" | "ready" | "valid" | "invalid" | "large-file-loaded";

/** Output generation status */
export type OutputStatus = "ready" | "generating" | "generated" | "empty";

/** Supported CSV delimiters */
export type Delimiter = "," | ";" | "\t";

/** A single delimiter option for the UI select */
export interface DelimiterOption {
  value: Delimiter;
  label: string;
}

/**
 * Delegate for user confirmation dialogs.
 * Used to keep actions.ts free of DOM/BOM APIs like confirm().
 */
export type ConfirmDelegate = (message: string) => boolean;

/** Structured conversion progress reported by the worker */
export interface ConversionProgress {
  stage: WorkerStage;
  percentage?: number;
}

/**
 * Complete observable state for the JSON→CSV tool.
 *
 * Design rules:
 *   - No derived values (char counts computed from .length)
 *   - No presentation strings (UI generates display text from enums)
 *   - All settings are stored here so actions don't need DOM access
 */
export interface JsonToCsvState {
  // ── Content ──
  jsonInput: string;
  csvOutput: string;
  /** Full text for large files (>500 KB) kept separate from preview */
  largeJsonContent: string | null;
  /** Full CSV kept separate for copy/download when output is large */
  largeCsvContent: string | null;

  // ── Settings ──
  delimiter: Delimiter;
  flatten: boolean;
  includeHeaders: boolean;

  // ── Status ──
  inputStatus: InputStatus;
  outputStatus: OutputStatus;
  error: string | null;
  /** Non-error informational notice shown in the output panel (e.g. empty array) */
  outputNotice: string | null;
  /** True when the displayed CSV is a truncated preview of a larger output */
  isPreview: boolean;

  // ── Worker Lifecycle ──
  /** True while a conversion is in progress */
  isConverting: boolean;
  /** True when the user has requested cancellation */
  isCancelling: boolean;
  /** Structured progress from the worker (null when not converting) */
  conversionProgress: ConversionProgress | null;
}

/** Factory for the default/initial state */
export const DEFAULT_STATE: JsonToCsvState = {
  jsonInput: "",
  csvOutput: "",
  largeJsonContent: null,
  largeCsvContent: null,
  delimiter: ",",
  flatten: true,
  includeHeaders: true,
  inputStatus: "empty",
  outputStatus: "empty",
  error: null,
  outputNotice: null,
  isPreview: false,
  isConverting: false,
  isCancelling: false,
  conversionProgress: null,
};
