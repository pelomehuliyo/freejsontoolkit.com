/**
 * Regex Tester — engine.
 *
 * Pure: no DOM, no store. Runs on the main thread by design — a regex test is
 * bounded by the input cap, and live-as-you-type feedback needs to be instant.
 * (Catastrophic backtracking on a hostile pattern is the one honest caveat,
 * documented in the FAQ; the input cap bounds the blast radius.)
 */
import type {
    CaptureGroup,
    RegexFlags,
    RegexMatch,
    RegexResult,
    RegexSegment,
} from "./types";
import { MAX_MATCHES } from "./constants";

export function buildFlagString(f: RegexFlags): string {
    let s = "";
    if (f.g) s += "g";
    if (f.i) s += "i";
    if (f.m) s += "m";
    if (f.s) s += "s";
    if (f.u) s += "u";
    if (f.y) s += "y";
    return s;
}

function toMatch(m: RegExpExecArray): RegexMatch {
    const groups: CaptureGroup[] = [];
    for (let i = 1; i < m.length; i++) groups.push({ index: i, value: m[i] });
    return { index: m.index, text: m[0], groups, namedGroups: { ...(m.groups ?? {}) } };
}

export function testRegex(
    pattern: string,
    flags: RegexFlags,
    input: string,
    replaceValue?: string,
): RegexResult {
    const inputSize = input.length;
    const empty = (error?: string): RegexResult => ({
        ok: !error,
        error: error ? { message: error } : undefined,
        matches: [],
        segments: input ? [{ text: input, isMatch: false }] : [],
        truncated: false,
        inputSize,
    });

    if (!pattern) return empty("Empty pattern");

    let re: RegExp;
    try {
        re = new RegExp(pattern, buildFlagString(flags));
    } catch (e) {
        return empty(e instanceof Error ? e.message : "Invalid regular expression");
    }

    const matches: RegexMatch[] = [];
    const segments: RegexSegment[] = [];
    let cursor = 0;
    let truncated = false;

    if (flags.g) {
        re.lastIndex = 0;
        let m: RegExpExecArray | null;
        while (matches.length < MAX_MATCHES && (m = re.exec(input)) !== null) {
            if (m.index > cursor) segments.push({ text: input.slice(cursor, m.index), isMatch: false });
            segments.push({ text: m[0], isMatch: true });
            matches.push(toMatch(m));
            cursor = m.index + m[0].length;
            // zero-width match: advance manually so we can't loop forever
            if (m[0].length === 0) re.lastIndex++;
        }
        if (matches.length >= MAX_MATCHES && re.exec(input) !== null) truncated = true;
    } else {
        const m = re.exec(input);
        if (m) {
            if (m.index > 0) segments.push({ text: input.slice(0, m.index), isMatch: false });
            segments.push({ text: m[0], isMatch: true });
            matches.push(toMatch(m));
            cursor = m.index + m[0].length;
        }
    }

    if (cursor < input.length) segments.push({ text: input.slice(cursor), isMatch: false });
    if (segments.length === 0 && input) segments.push({ text: input, isMatch: false });

    let replaced: string | undefined;
    if (replaceValue !== undefined) {
        try {
            replaced = input.replace(re, replaceValue);
        } catch {
            replaced = undefined;
        }
    }

    return { ok: true, matches, segments, replaced, truncated, inputSize };
}