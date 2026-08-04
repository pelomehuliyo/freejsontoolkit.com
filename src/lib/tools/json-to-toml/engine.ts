/**
 * JSON → TOML — engine.
 *
 * Parses with JSON.parse and re-serializes with smol-toml's stringify. Two
 * structural honesty rules, both deliberate (TOML is stricter than JSON here):
 *   - TOML's root must be a table — a top-level JSON array or scalar is
 *     refused with an explanation, never silently wrapped;
 *   - TOML has no null — any null is refused by default with the exact path
 *     (e.g. "limits.timeout", "tools[2]"), plus an explicit "strip nulls"
 *     escape hatch that drops null-valued keys and null array elements.
 *
 * Because JSON.parse emits no line/column, invalid-JSON errors carry the
 * native message plus a nudge to the JSON Validator (the tool whose whole job
 * is exact coordinates) rather than faking a caret.
 *
 * Pure: no DOM, no store. Safe to run in a Web Worker.
 */
import { stringify } from "smol-toml";
import type { ConvertOptions, ConvertResult, ConvertStats } from "./types";

const MAX_TALLY_DEPTH = 512;

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

/** Collect dot/bracket paths to every null in the tree. */
function findNulls(value: unknown, path: string, out: string[]): void {
    if (value === null) {
        out.push(path || "(root)");
        return;
    }
    if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) findNulls(value[i], `${path}[${i}]`, out);
        return;
    }
    if (typeof value === "object") {
        for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
            findNulls(v, path ? `${path}.${k}` : k, out);
        }
    }
}

/** Return a copy of the tree with null-valued keys and null array elements removed. */
function stripNulls(value: unknown): unknown {
    if (Array.isArray(value)) {
        return value.filter((v) => v !== null).map((v) => stripNulls(v));
    }
    if (value !== null && typeof value === "object") {
        const out: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
            if (v === null) continue;
            out[k] = stripNulls(v);
        }
        return out;
    }
    return value;
}

export function convertJsonToToml(input: string, opts: ConvertOptions): ConvertResult {
    const sourceSize = input.length;
    if (input.trim().length === 0) {
        return {
            ok: false,
            authoritative: false,
            output: "",
            sourceSize,
            nullPaths: [],
            error: { message: "Empty input" },
        };
    }

    // 1. Parse the JSON. JSON.parse gives no line/col, so on failure we report
    //    the message and route to the Validator for exact coordinates.
    let value: unknown;
    try {
        value = JSON.parse(input);
    } catch (e) {
        return {
            ok: false,
            authoritative: false,
            output: "",
            sourceSize,
            nullPaths: [],
            error: {
                message:
                    (e instanceof Error ? e.message : "Invalid JSON") +
                    " — for the exact line and column, run it through the JSON Validator.",
            },
        };
    }

    // 2. TOML's root must be a table.
    if (Array.isArray(value)) {
        return {
            ok: false,
            authoritative: false,
            output: "",
            sourceSize,
            nullPaths: [],
            error: {
                message:
                    "TOML's root must be a table (object), but the top-level JSON is an array. " +
                    'Wrap it in an object (e.g. { "items": [...] }) to convert.',
            },
        };
    }
    if (value === null || typeof value !== "object") {
        const kindLabel =
            value === null
                ? "null"
                : typeof value === "string"
                    ? "a string"
                    : typeof value === "number"
                        ? "a number"
                        : "a boolean";
        return {
            ok: false,
            authoritative: false,
            output: "",
            sourceSize,
            nullPaths: [],
            error: {
                message:
                    `TOML's root must be a table (object), but the top-level JSON is ${kindLabel}. ` +
                    "Wrap it in an object to convert.",
            },
        };
    }

    // 3. Null handling — TOML has no null value.
    const nullPaths: string[] = [];
    findNulls(value, "", nullPaths);
    let toSerialize: unknown = value;
    if (nullPaths.length > 0) {
        if (opts.nullStrategy === "reject") {
            const spots = nullPaths.slice(0, 5).join(", ");
            const more = nullPaths.length > 5 ? ` (+${nullPaths.length - 5} more)` : "";
            return {
                ok: false,
                authoritative: false,
                output: "",
                sourceSize,
                nullPaths,
                error: {
                    message:
                        `${nullPaths.length} value${nullPaths.length === 1 ? " is" : "s are"} null, which TOML can't ` +
                        `represent (${spots}${more}). Remove ${nullPaths.length === 1 ? "it" : "them"}, or switch to "Strip nulls".`,
                },
            };
        }
        toSerialize = stripNulls(value);
    }

    // 4. Serialize to TOML.
    let output: string;
    try {
        output = stringify(toSerialize as Record<string, unknown>);
    } catch (e) {
        return {
            ok: false,
            authoritative: false,
            output: "",
            sourceSize,
            nullPaths,
            error: {
                message:
                    "This JSON can't be represented as TOML: " +
                    (e instanceof Error ? e.message : "unserializable value"),
            },
        };
    }

    return { ok: true, authoritative: false, output, sourceSize, nullPaths, stats: tally(value) };
}