import type { IndentOption } from "./types";

// A small but nested VALID document: scalars, a list, a nested map, and a bare
// date (which becomes an ISO-8601 string in JSON — a built-in demo of the
// type mapping). Load Sample LOADS ONLY; the user presses Convert explicitly.
export const SAMPLE_YAML = `# Free JSON Toolkit — sample config
toolkit: Free JSON Toolkit
version: 1.4.0
local: true
uploads: 0
tools:
  - yaml-to-json
  - json-to-yaml
  - json-formatter
limits:
  maxChars: 15000000
  workers: background
release:
  name: foreign-grammars
  shipped: 2026-08-02
`;

export const INDENT_OPTIONS: { value: IndentOption; label: string }[] = [
  { value: "2", label: "2 spaces" },
  { value: "4", label: "4 spaces" },
  { value: "tab", label: "Tab" },
];

export const MAX_INPUT_CHARS = 15_000_000;

// Live (main-thread) conversion caps here so big configs never hitch the UI;
// above it, the result arrives via the worker when you press Convert.
export const LIVE_CONVERT_THRESHOLD = 100_000;
