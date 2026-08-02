import type { IndentOption } from "./types";
// A valid, nested document: string, number, boolean, array, nested object and
// null — so converting it exercises every branch of the XML builder at once.
export const SAMPLE_JSON = `{
  "toolkit": "Free JSON Toolkit",
  "version": "1.4.0",
  "local": true,
  "tools": ["json-to-csv", "json-formatter", "json-validator"],
  "limits": { "maxChars": 15000000, "uploads": 0 },
  "note": null
}`;
export const INDENT_OPTIONS: { value: IndentOption; label: string }[] = [
  { value: "2", label: "2 spaces" },
  { value: "4", label: "4 spaces" },
  { value: "tab", label: "Tab" },
];
export const MAX_INPUT_CHARS = 15_000_000;
// Live (main-thread) validation caps here so big inputs never hitch the UI;
// above it, validity is confirmed by the worker when you press Convert.
export const LIVE_VALIDATE_THRESHOLD = 300_000;
