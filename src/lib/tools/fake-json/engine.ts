/**
 * Fake JSON — engine.
 *
 * A template-driven faker. The template is *valid JSON* whose string leaves may
 * contain faker tokens like {{name}} or {{int:1..100}}. We delegate structure to
 * JSON.parse (free, robust, great errors) and own only the token expansion:
 *   - a string that is EXACTLY one token is replaced by that token's native
 *     value (so "{{int}}" yields a number, "{{bool}}" a boolean) — the unbox rule;
 *   - a string that CONTAINS tokens is interpolated as text;
 *   - objects / arrays recurse, so nesting "just works".
 *
 * Randomness comes from a seeded PRNG (mulberry32 + xmur3 string-hash) so a set
 * seed reproduces the same fixture exactly. With no seed we seed the PRNG from
 * crypto.getRandomValues — high quality, just not reproducible. (We do NOT use
 * crypto for seeded runs, because crypto can't be seeded — determinism is the
 * whole point of the seed field.)
 *
 * Pure apart from crypto + performance.now(); no DOM, no store.
 */
import type { FakeJsonOptions, FakeJsonResult, TemplateValidity } from "./types";
import {
    DOMAINS,
    FIRST_NAMES,
    LAST_NAMES,
    LOREM,
    TLDS,
    glyphFor,
} from "./constants";

// ── seeded PRNG ──
function xmur3(str: string): () => number {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) {
        h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
        h = (h << 13) | (h >>> 19);
    }
    return function () {
        h = Math.imul(h ^ (h >>> 16), 2246822507);
        h = Math.imul(h ^ (h >>> 13), 3266489909);
        h ^= h >>> 16;
        return h >>> 0;
    };
}
function mulberry32(a: number): () => number {
    return function () {
        a |= 0;
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

interface Rng {
    f: () => number; // [0,1)
    int: (min: number, max: number) => number;
    pick: <T, >(arr: T[]) => T;
    chance: (p: number) => boolean;
}
function makeRng(seed: string): Rng {
    const next = seed ? mulberry32(xmur3(seed)()) : mulberry32(cryptoSeed());
    const f = next;
    return {
        f,
        int: (min, max) => min + Math.floor(f() * (max - min + 1)),
        pick: (arr) => arr[Math.floor(f() * arr.length)],
        chance: (p) => f() < p,
    };
}
function cryptoSeed(): number {
    const a = new Uint32Array(1);
    crypto.getRandomValues(a);
    return a[0];
}

// ── value generators (return native JS values) ──
function lower(s: string): string {
    return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}
function alnum(rng: Rng, n: number): string {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let s = "";
    for (let i = 0; i < n; i++) s += chars[Math.floor(rng.f() * chars.length)];
    return s;
}
function words(rng: Rng, n: number): string {
    const out: string[] = [];
    for (let i = 0; i < n; i++) out.push(rng.pick(LOREM));
    return out.join(" ");
}
function sentence(rng: Rng): string {
    const n = rng.int(6, 12);
    const w = words(rng, n);
    return w.charAt(0).toUpperCase() + w.slice(1) + ".";
}
function paragraph(rng: Rng): string {
    const n = rng.int(3, 5);
    const out: string[] = [];
    for (let i = 0; i < n; i++) out.push(sentence(rng));
    return out.join(" ");
}
function email(rng: Rng): string {
    const sep = rng.pick([".", "_", ""]);
    const num = rng.chance(0.5) ? String(rng.int(0, 99)) : "";
    return `${lower(rng.pick(FIRST_NAMES))}${sep}${lower(rng.pick(LAST_NAMES))}${num}@${rng.pick(DOMAINS)}`;
}
function username(rng: Rng): string {
    const sep = rng.pick([".", "_", ""]);
    return `${lower(rng.pick(FIRST_NAMES))}${sep}${lower(rng.pick(LAST_NAMES))}${rng.int(1, 999)}`;
}
function ipv4(rng: Rng): string {
    return `${rng.int(1, 255)}.${rng.int(0, 255)}.${rng.int(0, 255)}.${rng.int(1, 254)}`;
}
function url(rng: Rng): string {
    return `https://${rng.pick(LOREM)}.${rng.pick(TLDS)}/${rng.pick(LOREM)}`;
}
function parseSide(s: string, upper: boolean): number {
    const t = s.trim();
    if (/^\d{4}$/.test(t)) {
        return upper ? Date.UTC(Number(t), 11, 31, 23, 59, 59) : Date.UTC(Number(t), 0, 1);
    }
    const ms = Date.parse(t);
    return Number.isNaN(ms) ? Date.now() : ms;
}
function isoDate(rng: Rng, arg: string | undefined): string {
    if (!arg || arg.indexOf("..") === -1) {
        // no range → a date within the last ~5 years
        const now = Date.now();
        return new Date(now - rng.int(0, 5 * 365) * 86400000).toISOString().slice(0, 10);
    }
    const [a, b] = arg.split("..");
    const lo = parseSide(a, false);
    const hi = parseSide(b, true);
    const ms = lo + Math.floor(rng.f() * Math.max(1, hi - lo));
    return new Date(ms).toISOString().slice(0, 10);
}

interface Ctx {
    index: number;
}

function evalToken(kind: string, arg: string | undefined, rng: Rng, ctx: Ctx): unknown {
    switch (kind) {
        case "uuid": {
            // v4-shaped, drawn from the PRNG so seeds stay deterministic
            const b = new Uint8Array(16);
            for (let i = 0; i < 16; i++) b[i] = Math.floor(rng.f() * 256);
            b[6] = (b[6] & 0x0f) | 0x40;
            b[8] = (b[8] & 0x3f) | 0x80;
            const h = (n: number) => n.toString(16).padStart(2, "0");
            const s = Array.from(b, h).join("");
            return `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20)}`;
        }
        case "index":
            return ctx.index;
        case "index1":
            return ctx.index + 1;
        case "int": {
            if (arg && arg.indexOf("..") !== -1) {
                const [a, b] = arg.split("..").map((x) => parseInt(x, 10));
                return rng.int(Number.isNaN(a) ? 0 : a, Number.isNaN(b) ? 100 : b);
            }
            return rng.int(0, 100);
        }
        case "float": {
            let lo = 0;
            let hi = 1;
            if (arg && arg.indexOf("..") !== -1) {
                const [a, b] = arg.split("..").map((x) => parseFloat(x));
                lo = Number.isNaN(a) ? 0 : a;
                hi = Number.isNaN(b) ? 1 : b;
            }
            return Math.round((lo + rng.f() * (hi - lo)) * 100) / 100;
        }
        case "bool":
            return rng.chance(0.5);
        case "null":
            return null;
        case "name":
            return `${rng.pick(FIRST_NAMES)} ${rng.pick(LAST_NAMES)}`;
        case "firstName":
            return rng.pick(FIRST_NAMES);
        case "lastName":
            return rng.pick(LAST_NAMES);
        case "email":
            return email(rng);
        case "username":
            return username(rng);
        case "word":
            return rng.pick(LOREM);
        case "words":
            return words(rng, arg ? Math.max(1, parseInt(arg, 10) || 3) : 3);
        case "sentence":
            return sentence(rng);
        case "paragraph":
            return paragraph(rng);
        case "string":
            return alnum(rng, arg ? Math.max(1, parseInt(arg, 10) || 8) : 8);
        case "ipv4":
            return ipv4(rng);
        case "url":
            return url(rng);
        case "date":
            return isoDate(rng, arg);
        case "now":
            return new Date().toISOString();
        case "timestamp":
            return Date.now() - rng.int(0, 365) * 86400000;
        case "enum":
        case "pick":
            return arg ? rng.pick(arg.split("|")) : "";
        default:
            throw new Error(`unknown token {{${kind}}}`);
    }
}

const TOKEN_RE = /\{\{\s*([a-zA-Z0-9]+)(?::([^}]*?))?\s*\}\}/g;
const FULL_TOKEN_RE = /^\{\{\s*([a-zA-Z0-9]+)(?::([^}]*?))?\s*\}\}$/;

/** Expand a parsed template node into realized data. */
function expand(node: unknown, rng: Rng, ctx: Ctx): unknown {
    if (node === null || typeof node === "number" || typeof node === "boolean") return node;
    if (typeof node === "string") {
        const full = node.match(FULL_TOKEN_RE);
        if (full) return evalToken(full[1], full[2], rng, ctx); // unbox → native type
        if (node.indexOf("{{") === -1) return node;
        return node.replace(TOKEN_RE, (_m, kind, arg) => String(evalToken(kind, arg, rng, ctx)));
    }
    if (Array.isArray(node)) return node.map((x) => expand(x, rng, ctx));
    if (typeof node === "object") {
        const out: Record<string, unknown> = {};
        for (const k of Object.keys(node as Record<string, unknown>)) {
            out[k] = expand((node as Record<string, unknown>)[k], rng, ctx);
        }
        return out;
    }
    return node;
}

const KNOWN = new Set([
    "uuid", "index", "index1", "int", "float", "bool", "null", "name", "firstName",
    "lastName", "email", "username", "word", "words", "sentence", "paragraph",
    "string", "ipv4", "url", "date", "now", "timestamp", "enum", "pick",
]);

/** Cheap, generation-free validity check used by the live status indicator. */
export function validateTemplate(tpl: string): TemplateValidity {
    let parsed: unknown;
    try {
        parsed = JSON.parse(tpl);
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Invalid JSON";
        const hint = tpl.indexOf("{{") !== -1 ? " — faker tokens must be quoted, e.g. \"{{int}}\"" : "";
        return { ok: false, message: msg + hint };
    }
    // scan tokens for unknown kinds
    const re = new RegExp(TOKEN_RE.source, "g");
    let m: RegExpExecArray | null;
    while ((m = re.exec(tpl)) !== null) {
        if (!KNOWN.has(m[1])) {
            const before = tpl.slice(0, m.index);
            const line = before.split("\n").length;
            return { ok: false, message: `unknown token {{${m[1]}}} (line ${line})` };
        }
    }
    void parsed;
    return { ok: true, message: "" };
}

export function generate(tpl: string, opts: FakeJsonOptions): FakeJsonResult {
    const parsed = JSON.parse(tpl); // throws if invalid — actions guard first
    const isObject = parsed !== null && typeof parsed === "object" && !Array.isArray(parsed);
    const fields = isObject ? Object.keys(parsed as Record<string, unknown>).length : 0;

    const rng = makeRng(opts.seed);
    const count = Math.max(1, Math.min(opts.count || 1, 5000));
    const t0 = performance.now();
    const arr: unknown[] = [];
    for (let i = 0; i < count; i++) arr.push(expand(parsed, rng, { index: i }));
    const ms = performance.now() - t0;

    const output = JSON.stringify(arr, null, opts.pretty ? 2 : 0);
    return {
        output,
        records: count,
        bytes: output.length,
        fields,
        ms,
        seedEcho: opts.seed.trim() ? opts.seed.trim() : "random",
    };
}

/** Top-level key → glyph, for the live "shape" strip (no generation needed). */
export function shapeOf(tpl: string): { key: string; glyph: string }[] {
    let parsed: unknown;
    try {
        parsed = JSON.parse(tpl);
    } catch {
        return [];
    }
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) return [];
    const out: { key: string; glyph: string }[] = [];
    for (const k of Object.keys(parsed as Record<string, unknown>)) {
        const v = (parsed as Record<string, unknown>)[k];
        let glyph = "·";
        if (typeof v === "string") {
            const m = v.match(TOKEN_RE);
            if (m) glyph = glyphFor(m[1]);
            else glyph = "T";
        } else if (typeof v === "number") glyph = "#";
        else if (typeof v === "boolean") glyph = "◉";
        else if (v === null) glyph = "∅";
        else if (Array.isArray(v)) glyph = "[]";
        else if (typeof v === "object") glyph = "{}";
        out.push({ key: k, glyph });
    }
    return out;
}

export { glyphFor };