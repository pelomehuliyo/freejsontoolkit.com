import type { IndentOption } from "./types";

// A small but feature-rich VALID document: scalars of every kind, a string
// array, two [tables], an underscored integer (15_000_000 → 15000000), and a
// bare date (→ ISO-8601 string in JSON, since JSON has no date type). Load
// Sample LOADS ONLY; press Convert.
export const SAMPLE_TOML = `# Free JSON Toolkit — sample config
toolkit = "Free JSON Toolkit"
version = "1.5.0"
local = true
uploads = 0

tools = ["toml-to-json", "json-formatter", "json-validator"]

[limits]
maxChars = 15_000_000
workers = "background"

[release]
name = "foreign-grammars"
shipped = 2026-08-02
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