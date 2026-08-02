/**
 * YAML → JSON — engine.
 *
 * Parses YAML 1.2 (via the `yaml` package — the same lib JSON → YAML uses) and
 * re-serializes to pretty-printed JSON. Stance decisions, all deliberate:
 *   - duplicate keys are an ERROR, not a silent last-wins (JSON consumers
 *     would get last-wins; we point at the problem instead — honesty over
 *     completeness, same as the validator);
 *   - comments are dropped (JSON has nowhere to keep them);
 *   - anchors/aliases resolve to their expanded values;
 *   - timestamps become ISO-8601 strings (JSON has no date type).
 *
 * Pure: no DOM, no store. Safe to run in a Web Worker.
 */
import { load } from "js-yaml";
import type { ConvertError, ConvertResult, ConverterOptions, ConvertStats } from "./types";

const MAX_TALLY_DEPTH = 512;

function normalizeYamlError(e: unknown): ConvertError {
  const err = e as {
    reason?: string;
    message?: string;
    mark?: { line: number; column: number; position: number };
  };
  const message = (err?.reason ?? err?.message ?? "Invalid YAML").trim() || "Invalid YAML";
  const mark = err?.mark;
  return mark
    ? { message, line: mark.line + 1, column: mark.column + 1, position: mark.position }
    : { message };
}

function tally(root: unknown): ConvertStats {
  let objects = 0;
  let arrays = 0;
  let scalars = 0;
  let keys = 0;
  let maxDepth = 0;
  const walk = (v: unknown, depth: number): void => {
    if (depth > MAX_TALLY_DEPTH) return; // pathological nesting: cap the count
    if (depth > maxDepth) maxDepth = depth;
    if (Array.isArray(v)) {
      arrays++;
      for (const item of v) walk(item, depth + 1);
    } else if (v !== null && typeof v === "object") {
      objects++;
      const entries = Object.entries(v as Record<string, unknown>);
      keys += entries.length;
      for (const [, val] of entries) walk(val, depth + 1);
    } else {
      scalars++;
    }
  };
  walk(root, 1);
  return { objects, arrays, scalars, keys, maxDepth };
}

export function convertYamlToJson(input: string, opts: ConverterOptions): ConvertResult {
  const sourceSize = input.length;
  if (input.trim().length === 0) {
    return {
      ok: false,
      authoritative: false,
      output: "",
      sourceSize,
      error: { message: "Empty input" },
    };
  }

  let value: unknown;
  try {
    value = load(input);
  } catch (e) {
    return {
      ok: false,
      authoritative: false,
      output: "",
      sourceSize,
      error: normalizeYamlError(e),
    };
  }

  let output: string;
  try {
    output = JSON.stringify(value, null, opts.indent === "tab" ? "\t" : Number(opts.indent));
  } catch (e) {
    return {
      ok: false,
      authoritative: false,
      output: "",
      sourceSize,
      error: {
        message:
          "This YAML can't be represented as JSON: " +
          (e instanceof Error ? e.message : "unserializable value"),
      },
    };
  }

  return { ok: true, authoritative: false, output, sourceSize, stats: tally(value) };
}

/** Pure presentation: the JSON when ok; a validator-style mono error readout
 *  (offending lines + caret) when not. */
export function buildOutput(result: ConvertResult, source: string): string {
  if (result.ok) return result.output;
  const err = result.error!;
  if (err.line == null) {
    return ["✗ Invalid YAML", "", "  " + err.message].join("\n");
  }
  const lines = source.split("\n");
  const lo = Math.max(0, err.line - 2);
  const hi = Math.min(lines.length - 1, err.line);
  const width = String(hi + 1).length;
  const ctx = lines
    .slice(lo, hi + 1)
    .map((ln, idx) => {
      const n = lo + idx + 1;
      const mark = n === err.line ? ">" : " ";
      return `${mark} ${String(n).padStart(width)} | ${ln}`;
    })
    .join("\n");
  const caret = `${" ".repeat(width + 4)}| ${" ".repeat(Math.max(0, (err.column ?? 1) - 1))}^`;
  return [
    "✗ Invalid YAML",
    "",
    `  ${err.message}`,
    `  at line ${err.line}, column ${err.column ?? "?"}`,
    "",
    ctx,
    caret,
  ].join("\n");
}
