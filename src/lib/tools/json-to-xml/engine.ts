/**
 * JSON → XML — engine.
 *
 * A transparent, tunable mapping (root tag + array-item tag are user-visible):
 *   object  → <name> with one child element per key
 *   array   → <name> wrapping one <itemName> element per entry
 *   string  → <name>escaped text</name>
 *   number / boolean → <name>value</name>
 *   null    → <name/>   (self-closed)
 * Keys are sanitised into valid XML names. On invalid input we defer to the
 * SHARED validator engine (../json-validator/engine — ONE "..", it is a sibling
 * folder under src/lib/tools/) so the error carries exact line/column.
 *
 * Pure: no DOM, no store, no browser APIs. Safe in a Web Worker.
 */
import { validateJson } from "../json-validator/engine";
import type { XmlOptions, XmlResult } from "./types";

function esc(s: string): string {
    return s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}
/** Coerce an arbitrary JSON key into a valid XML element name. */
function xmlName(key: string): string {
    let n = key.replace(/[^A-Za-z0-9_.\-]/g, "_");
    if (!/^[A-Za-z_]/.test(n)) n = "_" + n;
    if (n === "") n = "_";
    return n;
}
interface Ctx {
    elements: number;
    maxDepth: number;
}
function build(
    value: unknown,
    name: string,
    depth: number,
    ind: string,
    opts: XmlOptions,
    ctx: Ctx,
    out: string[],
): void {
    ctx.elements++;
    if (depth > ctx.maxDepth) ctx.maxDepth = depth;
    const pad = opts.pretty ? ind.repeat(depth) : "";
    const nl = opts.pretty ? "\n" : "";
    if (value === null) {
        out.push(pad + "<" + name + "/>" + nl);
        return;
    }
    if (Array.isArray(value)) {
        out.push(pad + "<" + name + ">" + nl);
        for (const item of value) build(item, opts.itemName, depth + 1, ind, opts, ctx, out);
        out.push(pad + "</" + name + ">" + nl);
        return;
    }
    if (typeof value === "object") {
        const keys = Object.keys(value as Record<string, unknown>);
        if (keys.length === 0) {
            out.push(pad + "<" + name + "></" + name + ">" + nl);
            return;
        }
        out.push(pad + "<" + name + ">" + nl);
        for (const k of keys) {
            build((value as Record<string, unknown>)[k], xmlName(k), depth + 1, ind, opts, ctx, out);
        }
        out.push(pad + "</" + name + ">" + nl);
        return;
    }
    out.push(pad + "<" + name + ">" + esc(String(value)) + "</" + name + ">" + nl);
}
export function jsonToXml(input: string, opts: XmlOptions): XmlResult {
    const ind = opts.indent === "tab" ? "\t" : " ".repeat(Number(opts.indent));
    const root = xmlName(opts.rootName || "root");
    const itemName = xmlName(opts.itemName || "item");
    const norm: XmlOptions = { ...opts, rootName: root, itemName };
    let parsed: unknown;
    try {
        parsed = JSON.parse(input);
    } catch {
        const v = validateJson(input, { flagDuplicateKeys: false, indent: "2", includeNormalized: false });
        const e = v.error;
        throw new Error(e ? `${e.message} (line ${e.line}, column ${e.column})` : "Invalid JSON");
    }
    const ctx: Ctx = { elements: 0, maxDepth: 0 };
    const parts: string[] = [];
    build(parsed, root, 0, ind, norm, ctx, parts);
    const decl = opts.declaration
        ? '<?xml version="1.0" encoding="UTF-8"?>' + (opts.pretty ? "\n" : "")
        : "";
    const output = decl + parts.join("");
    return {
        output,
        inputChars: input.length,
        outputChars: output.length,
        elements: ctx.elements,
        maxDepth: ctx.maxDepth,
    };
}