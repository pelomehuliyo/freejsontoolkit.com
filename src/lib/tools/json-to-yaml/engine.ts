/**
 * JSON → YAML — engine.
 *
 * A pure, dependency‑free YAML serializer. It converts a JSON object into a
 * YAML string with configurable indentation and optional key sorting.
 * Runs in a Worker for large files.
 */
import type { IndentOption } from "./types";

function escapeYamlString(str: string): string {
    // Quote strings that contain special characters, start/end with spaces, or are empty
    if (
        str === "" ||
        str.match(/^[\s]/) ||
        str.match(/[\s]$/) ||
        str.match(/[:"{}[\],&*#?|<>!=+%@]/) ||
        str.match(/^[0-9]/) // numbers as strings are fine, but quote to be safe
    ) {
        // Replace backslashes and quotes
        const escaped = str.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
        return `"${escaped}"`;
    }
    return str;
}

function indentChar(opts: { indent: IndentOption }): string {
    if (opts.indent === "tab") return "\t";
    return " ".repeat(Number(opts.indent));
}

function stringifyYaml(
    value: unknown,
    opts: { indent: IndentOption; sortKeys: boolean },
    level: number,
): string {
    const ind = indentChar(opts);
    const prefix = ind.repeat(level);

    if (value === null || value === undefined) {
        return "null";
    }
    if (typeof value === "string") {
        return escapeYamlString(value);
    }
    if (typeof value === "number") {
        // Check if integer
        if (Number.isInteger(value)) return String(value);
        return String(value);
    }
    if (typeof value === "boolean") {
        return value ? "true" : "false";
    }
    if (Array.isArray(value)) {
        if (value.length === 0) return "[]";
        const lines: string[] = [];
        for (const item of value) {
            const itemStr = stringifyYaml(item, opts, level + 1);
            // If the item is a complex object/array, we need to add the dash on its own line
            // and then the content indented.
            if (typeof item === "object" && item !== null) {
                // multi-line
                const childLines = itemStr.split("\n");
                // The first line should be preceded by '- '
                lines.push(`${prefix}- ${childLines[0]}`);
                for (let i = 1; i < childLines.length; i++) {
                    lines.push(`${prefix}  ${childLines[i]}`);
                }
            } else {
                lines.push(`${prefix}- ${itemStr}`);
            }
        }
        return lines.join("\n");
    }
    if (typeof value === "object") {
        const obj = value as Record<string, unknown>;
        const keys = Object.keys(obj);
        if (opts.sortKeys) keys.sort();
        if (keys.length === 0) return "{}";
        const lines: string[] = [];
        for (const key of keys) {
            const val = obj[key];
            const valStr = stringifyYaml(val, opts, level + 1);
            // If the value is a complex object or array, we need to put the key on its own line
            // and then the value indented.
            if (typeof val === "object" && val !== null) {
                const childLines = valStr.split("\n");
                lines.push(`${prefix}${escapeYamlString(key)}:`);
                for (const line of childLines) {
                    lines.push(`${ind}${line}`);
                }
            } else {
                lines.push(`${prefix}${escapeYamlString(key)}: ${valStr}`);
            }
        }
        return lines.join("\n");
    }
    return "null";
}

export function convertJsonToYaml(input: string, opts: { indent: IndentOption; sortKeys: boolean }): { output: string } {
    let parsed: unknown;
    try {
        parsed = JSON.parse(input);
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Invalid JSON";
        throw new Error(`Invalid JSON: ${msg}`);
    }
    const yaml = stringifyYaml(parsed, opts, 0);
    return { output: yaml };
}