import type { CsvDelimiterOption, IndentOption } from "./types";

export const SAMPLE_CSV = `id,name,email,role,active
1,Ada Lovelace,ada@example.com,admin,true
2,Alan Turing,alan@example.com,engineer,true
3,Grace Hopper,grace@example.com,architect,false`;

export const DELIMITER_OPTIONS: { value: CsvDelimiterOption; label: string }[] = [
  { value: "auto", label: "Auto-detect" },
  { value: ",", label: "Comma ( , )" },
  { value: ";", label: "Semicolon ( ; )" },
  { value: "\t", label: "Tab" },
  { value: "|", label: "Pipe ( | )" },
];

export const INDENT_OPTIONS: { value: IndentOption; label: string }[] = [
  { value: "2", label: "2 spaces" },
  { value: "4", label: "4 spaces" },
  { value: "tab", label: "Tab" },
];

export const MAX_INPUT_CHARS = 15_000_000;

// --- Large-file mode (interim) ---------------------------------------------
// Files at/under this byte size stay on the exact current path (readAsText on
// the main thread). Only files that currently error out (> MAX_INPUT_CHARS) or
// exceed this byte ceiling get the new large-file mode: the worker reads the
// File, single-pass converts, and the result is exposed as a Blob download with
// a capped in-editor preview. The value mirrors the existing char cap (15 MB).
export const LARGE_FILE_THRESHOLD_BYTES = 15_000_000;

// The in-editor preview is capped at ~100k chars and trimmed to complete JSON
// records, so a huge result never floods the (non-virtualized) editor and the
// preview is always valid JSON. Honest labelling in the UI:
// "Preview — first N of M records; download for the full file."
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

/** Human-readable name for a detected/chosen delimiter. */
export function delimiterLabel(d: string): string {
  switch (d) {
    case ",":
      return "comma";
    case ";":
      return "semicolon";
    case "\t":
      return "tab";
    case "|":
      return "pipe";
    case ":":
      return "colon";
    default:
      return d ? JSON.stringify(d) : "";
  }
}
