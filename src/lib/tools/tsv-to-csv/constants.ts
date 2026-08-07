// A small rectangular sample with ONE field that contains a comma — in TSV a
// comma is just data, but when you convert, watch it come out quoted in the
// CSV. Load Sample LOADS ONLY; press Convert.
export const SAMPLE_TSV = `name\trole\tcity
Ada Lovelace\tEngineer, Analyst\tLondon
Alan Turing\tMathematician\tCambridge
Grace Hopper\tAdmiral\tArlington VA`;

export const MAX_INPUT_CHARS = 15_000_000;

// Live (main-thread) conversion caps here so big tables never hitch the UI;
// above it, the result arrives via the worker when you press Convert.
export const LIVE_CONVERT_THRESHOLD = 100_000;

// --- Large-file mode (interim) ---------------------------------------------
// Files at/under this byte size stay on the exact current path (readAsText on
// the main thread). Only files that currently error out (> MAX_INPUT_CHARS) or
// exceed this byte ceiling get the new large-file mode: the worker reads the
// File, single-pass converts, and the result is exposed as a Blob download with
// a capped in-editor preview. The value mirrors the existing char cap (15 MB).
export const LARGE_FILE_THRESHOLD_BYTES = 15_000_000;

// The in-editor preview is capped at ~100k chars and trimmed to the last
// complete row, so a huge result never floods the (non-virtualized) editor.
// Honest labelling in the UI: "Preview — first N rows; download for the full file."
export const PREVIEW_CHARS = 100_000;

// Discrete, honest progress readout for a single-pass (non-incremental) parse.
// We never claim a continuous percentage — it would be fabricated.
export const LARGE_FILE_PHASES: { key: string; label: string }[] = [
  { key: "reading", label: "Reading file…" },
  { key: "converting", label: "Converting…" },
  { key: "preparing", label: "Preparing download…" },
  { key: "done", label: "Done" },
];
export type LargeFilePhase = (typeof LARGE_FILE_PHASES)[number]["key"];
