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

/**
 * Iterative JSON serializer. Native JSON.stringify recurses, and Firefox's
 * implementation overflows the stack ("too much recursion") for deeply nested
 * input that JSON.parse happily accepts. Values come from JSON.parse, so the
 * shapes are limited to null / boolean / number / string / array / object,
 * which keeps this serializer exact without toJSON or undefined handling.
 */
function stringifyJson(value: unknown, sortKeys: boolean): string {
  const out: string[] = [];
  type Op =
    | { kind: "val"; value: unknown }
    | { kind: "key"; value: string }
    | { kind: "close"; ch: string }
    | { kind: "sep" };
  const stack: Op[] = [{ kind: "val", value }];

  while (stack.length > 0) {
    const op = stack.pop()!;
    if (op.kind === "close") {
      out.push(op.ch);
      continue;
    }
    if (op.kind === "sep") {
      out.push(",");
      continue;
    }
    if (op.kind === "key") {
      out.push(JSON.stringify(op.value), ":");
      continue;
    }
    const v = op.value;
    if (v === null) {
      out.push("null");
      continue;
    }
    const t = typeof v;
    if (t === "number") {
      out.push(Number.isFinite(v as number) ? String(v) : "null");
      continue;
    }
    if (t === "boolean") {
      out.push(v ? "true" : "false");
      continue;
    }
    if (t === "string") {
      out.push(JSON.stringify(v));
      continue;
    }
    if (Array.isArray(v)) {
      out.push("[");
      stack.push({ kind: "close", ch: "]" });
      const n = v.length;
      for (let i = n - 1; i >= 0; i--) {
        if (i < n - 1) stack.push({ kind: "sep" });
        stack.push({ kind: "val", value: v[i] });
      }
      continue;
    }
    out.push("{");
    stack.push({ kind: "close", ch: "}" });
    const keys = Object.keys(v as Record<string, unknown>);
    if (sortKeys) keys.sort();
    const n = keys.length;
    for (let i = n - 1; i >= 0; i--) {
      if (i < n - 1) stack.push({ kind: "sep" });
      stack.push({ kind: "val", value: (v as Record<string, unknown>)[keys[i]] });
      stack.push({ kind: "key", value: keys[i] });
    }
  }
  return out.join("");
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
    throw new Error(e ? `${e.message} at line ${e.line}, column ${e.column}. Check the JSON and try again.` : "Invalid JSON. Check the syntax and try again.");
  }

  const output = stringifyJson(parsed, opts.sortKeys);
  const minifiedChars = output.length;
  const saved = Math.max(0, originalChars - minifiedChars);
  const reduction = originalChars > 0 ? Math.round((saved / originalChars) * 100) : 0;

  return { output, originalChars, minifiedChars, saved, reduction, originalLines };
}