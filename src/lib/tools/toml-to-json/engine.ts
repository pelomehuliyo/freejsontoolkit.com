/**
 * TOML → JSON — engine.
 *
 * Parses with smol-toml (tiny, TS-native, zero-dep, pure JS — safe in a
 * worker) and re-serializes as pretty-printed JSON. Stance decisions, all
 * deliberate and stated honestly in the FAQ:
 *   - comments are dropped (JSON has nowhere to keep them);
 *   - TOML datetimes become ISO-8601 strings (JSON has no date type);
 *   - the int/float distinction is lost (both become JSON numbers);
 *   - inf / nan become null (JSON has no such values);
 *   - duplicate keys are an error — the TOML spec forbids them, and smol-toml
 *     refuses rather than silently collapsing.
 *
 * The error normalizer is defensive: smol-toml may expose line/column as
 * structured fields OR embed them in the message, so we try both and fall
 * back to the bare message. Pure: no DOM, no store.
 */
import { parse } from "smol-toml";
import type { ConvertError, ConvertResult, ConverterOptions, ConvertStats } from "./types";

const MAX_TALLY_DEPTH = 512;

function normalizeTomlError(e: unknown): ConvertError {
    const err = e as { message?: string; line?: number; column?: number };
    const raw = err?.message ?? "Invalid TOML";
    // strip a trailing "at line L, column C" / "(line L)" — we render our own coords
    const message = raw.replace(/\s*(\(?at\s+)?line \d+[\s\S]*$/i, "").trim() || "Invalid TOML";
    if (typeof err?.line === "number") {
        return {
            message,
            line: err.line,
            column: typeof err.column === "number" ? err.column : undefined,
        };
    }
    const m = /line (\d+)(?:[,:]\s*column (\d+))?/i.exec(raw);
    if (m) {
        return { message, line: Number(m[1]), column: m[2] ? Number(m[2]) : undefined };
    }
    return { message };
}

function tally(root: unknown): ConvertStats {
    let objects = 0;
    let arrays = 0;
    let scalars = 0;
    let keys = 0;
    let maxDepth = 0;
    const walk = (v: unknown, depth: number): void => {
        if (depth > MAX_TALLY_DEPTH) return;
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

export function convertTomlToJson(input: string, opts: ConverterOptions): ConvertResult {
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
        value = parse(input);
    } catch (e) {
        return {
            ok: false,
            authoritative: false,
            output: "",
            sourceSize,
            error: normalizeTomlError(e),
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
                    "This TOML can't be represented as JSON: " +
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
        return ["✗ Invalid TOML", "", "  " + err.message].join("\n");
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
        "✗ Invalid TOML",
        "",
        `  ${err.message}`,
        `  at line ${err.line}, column ${err.column ?? "?"}`,
        "",
        ctx,
        caret,
    ].join("\n");
}