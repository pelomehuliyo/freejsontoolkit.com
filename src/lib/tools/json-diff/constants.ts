// Two near-identical snippets so "Load Sample" shows a real, illustrative diff:
// a changed value, an added array element, and a new key.
export const SAMPLE_A = `{
  "name": "Ada Lovelace",
  "role": "mathematician",
  "active": true,
  "tags": ["pioneer", "writer"]
}`;

export const SAMPLE_B = `{
  "name": "Ada Lovelace",
  "role": "engineer",
  "active": true,
  "tags": ["pioneer", "writer", "visionary"],
  "year": 1843
}`;

export const MAX_INPUT_CHARS = 15_000_000;

// Live (as-you-type) diffing stops above this combined size so big pastes never
// hitch the UI; past it, the user presses Compare explicitly.
export const AUTO_DIFF_THRESHOLD = 300_000;