/**
 * JSON Minifier — engine.
 *
 * The happy path is intentionally tiny: parse, then stringify with no
 * whitespace. The two things that make it a real tool rather than a one-liner:
 *   - on invalid input we defer to the SHARED validator engine
 *     (../json-validator/engine) so the error carries exact line/column — one
 *     grammar walker, two tools;
 *   - we report the win (before / after / saved / reduction %) so the UI can
 *     show the compression as living feedback.
 *
 * Pure: no DOM, no store, no browser APIs. Safe in a Web Worker.
 */
import { validateJson } from "../json-validator/engine.ts";
import type { MinifyOptions, MinifyResult } from "./types.ts";

function countLines(s: string): number {
  let n = 1;
  for (let i = 0; i < s.length; i++) {
    if (s.charCodeAt(i) === 10) n++;
  }
  return n;
}

/** Recursively sort object keys so the minified output is deterministic.
 *  Arrays keep their order. Done as a transform (not a replacer) so there are
 *  no unused-parameter lint traps. */
function sortKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeysDeep);
  if (value !== null && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(value as Record<string, unknown>).sort()) {
      out[k] = sortKeysDeep((value as Record<string, unknown>)[k]);
    }
    return out;
  }
  return value;
}

export function minifyJson(input: string, opts: MinifyOptions): MinifyResult {
  const originalChars = input.length;
  const originalLines = countLines(input);

  let parsed: unknown;
  try {
    parsed = JSON.parse(input);
  } catch {
    // Reuse the validator's exact coordinates for a useful error message.
    const v = validateJson(input, {
      flagDuplicateKeys: false,
      indent: "2",
      includeNormalized: false,
    });
    const e = v.error;
    throw new Error(e ? `${e.message} (line ${e.line}, column ${e.column})` : "Invalid JSON");
  }

  const value = opts.sortKeys ? sortKeysDeep(parsed) : parsed;
  const output = JSON.stringify(value);
  const minifiedChars = output.length;
  const saved = Math.max(0, originalChars - minifiedChars);
  const reduction = originalChars > 0 ? Math.round((saved / originalChars) * 100) : 0;

  return { output, originalChars, minifiedChars, saved, reduction, originalLines };
}
