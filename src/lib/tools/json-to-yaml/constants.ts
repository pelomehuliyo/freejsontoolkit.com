import type { IndentOption } from "./types";

export const SAMPLE_JSON = `{
  "toolkit": "Free JSON Toolkit",
  "version": "1.4.0",
  "local": true,
  "tools": [
    "json-to-csv",
    "csv-to-json",
    "json-formatter",
    "json-validator",
    "json-diff",
    "json-minifier",
    "base64",
    "uuid-generator",
    "fake-json",
    "url-encode",
    "xml-to-json"
  ],
  "limits": {
    "maxChars": 15000000,
    "uploads": 0
  }
}`;

export const INDENT_OPTIONS: { value: IndentOption; label: string }[] = [
  { value: "2", label: "2 spaces" },
  { value: "4", label: "4 spaces" },
  { value: "tab", label: "Tab" },
];

export const MAX_INPUT_CHARS = 15_000_000;
