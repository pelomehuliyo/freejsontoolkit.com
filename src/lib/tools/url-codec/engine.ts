/**
 * URL encode / decode — engine.
 *
 * Three real encodings, because using the wrong one is the most common bug:
 *   component → encodeURIComponent  (a query VALUE / path segment)
 *   whole     → encodeURI           (an entire URL; structure preserved)
 *   form      → x-www-form-urlencoded (space → +, and ~ ! ' ( ) encoded too)
 * Decode mirrors them: component/form use decodeURIComponent (form first maps
 * '+' → space when plusSpace is on); whole uses decodeURI (the "safe" decode
 * that leaves reserved sequences intact).
 *
 * On top of the codec, two things make it a tool rather than a wrapper:
 *   - a FOOTPRINT that renders the encoded form as %XX chips vs passthrough
 *     literals, so you can *see* the encoding's footprint per character;
 *   - a byte-accurate readout (UTF-8 bytes, not JS char units) so an emoji
 *     honestly reports as four bytes.
 *
 * Pure: no DOM, no store, no browser APIs.
 */
import type {
    FootToken,
    UrlCodecOptions,
    UrlCodecResult,
    UrlEncoding,
    UrlValidity,
} from "./types";
import { FOOT_CAP } from "./constants";

const enc = new TextEncoder();
function bytes(s: string): number {
    return enc.encode(s).length;
}
function codePoints(s: string): number {
    let n = 0;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const _ of s) n++;
    return n;
}

function formEncode(s: string): string {
    return encodeURIComponent(s)
        .replace(/%20/g, "+")
        .replace(/!/g, "%21")
        .replace(/'/g, "%27")
        .replace(/\(/g, "%28")
        .replace(/\)/g, "%29")
        .replace(/~/g, "%7E");
}

function encodeOne(cp: string, encoding: UrlEncoding): string {
    try {
        if (encoding === "whole") return encodeURI(cp);
        if (encoding === "form") return formEncode(cp);
        return encodeURIComponent(cp);
    } catch {
        return cp; // lone surrogate etc. — leave as-is rather than throw
    }
}

function encodeAll(input: string, encoding: UrlEncoding): string {
    if (encoding === "whole") return encodeURI(input);
    if (encoding === "form") return formEncode(input);
    return encodeURIComponent(input);
}

function decodeAll(input: string, encoding: UrlEncoding, plusSpace: boolean): string {
    const src = plusSpace ? input.replace(/\+/g, " ") : input;
    if (encoding === "whole") return decodeURI(src);
    return decodeURIComponent(src);
}

/** Cheap validity check for the live status dot (decode mode). Catches a lone
 *  '%' or a bad hex pair with a position, then a malformed-UTF-8 sequence. */
export function validate(input: string, encoding: UrlEncoding, plusSpace: boolean): UrlValidity {
    const bad = /%(?![0-9a-fA-F]{2})/.exec(input);
    if (bad) {
        return { ok: false, message: `Stray '%' at position ${bad.index + 1}` };
    }
    try {
        decodeAll(input, encoding, plusSpace);
        return { ok: true, message: "" };
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Invalid percent-encoding";
        return { ok: false, message: msg };
    }
}

export function run(input: string, opts: UrlCodecOptions): UrlCodecResult {
    const inputChars = codePoints(input);
    const inputBytes = bytes(input);
    let output = "";
    let valid = true;
    let error: string | null = null;

    if (opts.mode === "encode") {
        try {
            output = encodeAll(input, opts.encoding);
        } catch (e) {
            valid = false;
            error = e instanceof Error ? e.message : "Could not encode input";
        }
    } else {
        try {
            output = decodeAll(input, opts.encoding, opts.plusSpace);
        } catch (e) {
            valid = false;
            error = e instanceof Error ? e.message : "Invalid percent-encoding";
        }
    }

    const outputChars = codePoints(output);
    const outputBytes = bytes(output);
    const ratio = inputBytes > 0 ? Math.round((outputBytes / inputBytes) * 100) : 0;

    return { output, inputChars, inputBytes, outputChars, outputBytes, ratio, valid, error };
}

/** The annotated view. Encode mode: each source code point becomes a chip if it
 *  encodes, else a literal. Decode mode: the (encoded) input is tokenized into
 *  %XX chips and literals, with '+' shown as a chip when plusSpace is on (it
 *  will decode to a space). Bounded to FOOT_CAP tokens. */
export function footprint(
    input: string,
    opts: UrlCodecOptions,
): { tokens: FootToken[]; truncated: boolean } {
    const tokens: FootToken[] = [];
    let truncated = false;

    if (opts.mode === "encode") {
        for (const cp of input) {
            if (tokens.length >= FOOT_CAP) {
                truncated = true;
                break;
            }
            const e = encodeOne(cp, opts.encoding);
            tokens.push(e === cp ? { kind: "lit", text: cp } : { kind: "chip", text: e });
        }
        return { tokens, truncated };
    }

    // decode: tokenize the encoded input
    const re = /%[0-9a-fA-F]{2}|%|\+/g;
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(input)) !== null) {
        if (tokens.length >= FOOT_CAP) {
            truncated = true;
            break;
        }
        if (m.index > last) {
            tokens.push({ kind: "lit", text: input.slice(last, m.index) });
        }
        const t = m[0];
        if (t === "+") {
            tokens.push(opts.plusSpace ? { kind: "chip", text: "+" } : { kind: "lit", text: "+" });
        } else if (t === "%") {
            tokens.push({ kind: "err", text: "%" });
        } else {
            tokens.push({ kind: "chip", text: t.toUpperCase() });
        }
        last = m.index + t.length;
    }
    if (!truncated && last < input.length) {
        tokens.push({ kind: "lit", text: input.slice(last) });
    }
    return { tokens, truncated };
}