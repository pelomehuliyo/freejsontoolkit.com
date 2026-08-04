import type { ConvertOptions } from "./types";

// A small, nested, null-FREE document (so Load Sample → Convert works cleanly),
// mirroring the TOML → JSON sample for round-trip symmetry. Load Sample LOADS
// ONLY; press Convert.
export const SAMPLE_JSON = `{
  "toolkit": "Free JSON Toolkit",
  "version": "1.5.0",
  "local": true,
  "uploads": 0,
  "tools": ["json-to-toml", "toml-to-json", "json-formatter"],
  "limits": {
    "maxChars": 15000000,
    "workers": "background"
  },
  "release": {
    "name": "foreign-grammars",
    "shipped": "2026-08-04"
  }
}`;

export const NULL_STRATEGIES: { value: ConvertOptions["nullStrategy"]; label: string }[] = [
    { value: "reject", label: "Refuse (honest default)" },
    { value: "strip", label: "Strip nulls" },
];

export const MAX_INPUT_CHARS = 15_000_000;

// Live (main-thread) conversion caps here so big configs never hitch the UI;
// above it, the result arrives via the worker when you press Convert.
export const LIVE_CONVERT_THRESHOLD = 100_000;