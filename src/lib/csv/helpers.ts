/**
 * CSV Module — Shared Helper Utilities
 *
 * Centralises small pure functions that are used by multiple CSV modules.
 * Every module in src/lib/csv/ should import from here instead of
 * redefining these helpers.
 *
 * This module is deterministic, side-effect free, and framework-independent.
 */

import type { CsvRecord, FlattenedRecord } from "./types";

// ──────────────────────────────────────────────
// Serialization
// ──────────────────────────────────────────────

/**
 * Serialises a CsvRecord to a stable string for duplicate comparison.
 * Keys are sorted alphabetically to ensure consistent hashing.
 *
 * @param record — The record to serialize
 * @returns       A stable string representation
 *
 * @example
 * serializeRecord({ b: "2", a: "1" })
 * // → "a:1|b:2"
 */
export function serializeRecord(record: CsvRecord): string {
    const keys = Object.keys(record).sort();
    const parts = keys.map((k) => `${k}:${record[k]}`);
    return parts.join("|");
}

// ──────────────────────────────────────────────
// Flattening
// ──────────────────────────────────────────────

/**
 * Flattens a nested object into dot-notation keys.
 *
 * Mutates `res` in place for performance (avoids intermediate objects).
 *
 * @example
 * flattenJson({ user: { name: "John", tags: [1, 2] } })
 * → { "user.name": "John", "user.tags.0": 1, "user.tags.1": 2 }
 *
 * @param obj     The value to flatten (object, array, or primitive)
 * @param prefix  Dot-notation prefix for recursive calls (default: "")
 * @param res     Accumulator object (default: {})
 * @returns       The accumulator with flattened keys
 */
export function flattenJson(
    obj: unknown,
    prefix = "",
    res: FlattenedRecord = {},
): FlattenedRecord {
    if (obj === null || obj === undefined) {
        if (prefix) res[prefix] = "";
        return res;
    }

    if (Array.isArray(obj)) {
        if (obj.length === 0) {
            if (prefix) res[prefix] = "";
        } else {
            for (let i = 0; i < obj.length; i++) {
                const propName = prefix ? `${prefix}.${i}` : `${i}`;
                flattenJson(obj[i], propName, res);
            }
        }
        return res;
    }

    if (typeof obj === "object" && obj !== null) {
        const keys = Object.keys(obj as Record<string, unknown>);
        if (keys.length === 0) {
            if (prefix) res[prefix] = "";
        } else {
            for (const key of keys) {
                const val = (obj as Record<string, unknown>)[key];
                const propName = prefix ? `${prefix}.${key}` : key;
                if (val !== null && typeof val === "object") {
                    flattenJson(val, propName, res);
                } else {
                    res[propName] = val;
                }
            }
        }
        return res;
    }

    // Primitive value
    if (prefix) {
        res[prefix] = obj;
    }
    return res;
}
