import type { IndentOption } from "./types";

export interface FormatOptions {
  indent: IndentOption;
  sortKeys: boolean;
}

export interface FormatResult {
  output: string;
  inputChars: number;
  outputChars: number;
}

/** Recursively sorts object keys so output is deterministic. Arrays keep order. */
function sortedReplacer() {
  return (_key: string, value: unknown) => {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return Object.keys(value as Record<string, unknown>)
        .sort()
        .reduce<Record<string, unknown>>((acc, k) => {
          acc[k] = (value as Record<string, unknown>)[k];
          return acc;
        }, {});
    }
    return value;
  };
}

/** Pure transform — no DOM, no store. Throws SyntaxError on invalid JSON. */
export function formatJson(input: string, opts: FormatOptions): FormatResult {
  const parsed = JSON.parse(input);
  const replacer = opts.sortKeys ? sortedReplacer() : undefined;
  const space = opts.indent === "tab" ? "\t" : Number(opts.indent);
  const output = JSON.stringify(parsed, replacer, space);
  return { output, inputChars: input.length, outputChars: output.length };
}

/** Lightweight validation for live typing feedback. Returns a message or null. */
export function validateJson(input: string): string | null {
  if (!input.trim()) return null;
  try {
    JSON.parse(input);
    return null;
  } catch (err) {
    return err instanceof Error ? err.message : "Invalid JSON";
  }
}
