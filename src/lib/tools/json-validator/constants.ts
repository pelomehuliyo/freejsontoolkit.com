import type { IndentOption } from "./types";

// A small but nested VALID document, so "Load Sample" shows a clean, correct
// example — and once you press Validate, a rich structure tally. Errors are
// still one typo away, and the FAQ explains the pinpointed-error behaviour.
export const SAMPLE_JSON = `{
  "toolkit": "Free JSON Toolkit",
  "version": "1.1.0",
  "local": true,
  "tools": ["json-to-csv", "csv-to-json", "json-formatter"],
  "limits": { "maxChars": 15000000, "uploads": 0 }
}`;

export const INDENT_OPTIONS: { value: IndentOption; label: string }[] = [
  { value: "2", label: "2 spaces" },
  { value: "4", label: "4 spaces" },
  { value: "tab", label: "Tab" },
];

export const MAX_INPUT_CHARS = 15_000_000;

// Live (main-thread) validation caps here so big inputs never hitch the UI;
// above it, validity is confirmed by the worker when you press Validate.
export const LIVE_VALIDATE_THRESHOLD = 300_000;
