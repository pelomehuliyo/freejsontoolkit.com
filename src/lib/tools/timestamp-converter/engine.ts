/**
 * Timestamp Converter — engine (pure, no DOM / store / browser APIs).
 *
 * Two directions:
 *   to-date       → number (in a unit) → Date → rich breakdown
 *   to-timestamp  → human date → ms → the value in every unit
 *
 * Correctness notes:
 *   - Date resolution is milliseconds.
 *   - The engine parses timestamp input through a BigInt-backed decimal path
 *     so large integer inputs do not suffer Number precision loss.
 *   - Output values are formatted with BigInt where needed, because
 *     microseconds and nanoseconds can exceed Number.MAX_SAFE_INTEGER.
 *   - Date parsing accepts local ISO, UTC ISO with Z, RFC/HTTP dates, and
 *     bare dates. Local ISO without timezone suffix is treated as local time.
 */

import type {
    TsDateBreakdown,
    TsOptions,
    TsResult,
    TsUnit,
    TsValueSet,
} from "./types";
import { MAX_ABS_MS_VALUE } from "./constants";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
];

const TIMESTAMP_RE = /^[+-]?(\d*)(?:\.(\d*))?$/;
const MAX_TIMESTAMP_INPUT_LENGTH = 64;

/** ISO week number (1–53), computed from the date. */
export function isoWeekOf(d: Date): { week: number; year: number } {
    const date = new Date(d.getTime());
    date.setHours(0, 0, 0, 0);
    // Thursday of this week
    date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
    const yearStart = new Date(date.getFullYear(), 0, 1);
    const diff = date.getTime() - yearStart.getTime();
    const week = Math.floor(diff / (7 * 86400000)) + 1;
    return { week, year: date.getFullYear() };
}

/** Day of the year (1–366). */
export function dayOfYear(d: Date): number {
    const start = new Date(d.getFullYear(), 0, 0);
    return Math.floor((d.getTime() - start.getTime()) / 86400000);
}

function pad(n: number, len = 2): string {
    return String(n).padStart(len, "0");
}

/** Local ISO without offset, e.g. "2026-08-05T12:34:56" */
function localIso(d: Date): string {
    return (
        `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
        `T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
    );
}

/** Current local ISO input for Date → Timestamp mode. */
export function nowLocalInput(): string {
    return localIso(new Date());
}

/** Human local, e.g. "Wed, Aug 5, 2026, 2:34:56 PM" */
function humanLocal(d: Date): string {
    const ampm = d.getHours() >= 12 ? "PM" : "AM";
    const h12 = d.getHours() % 12 || 12;
    return (
        `${WEEKDAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}, ` +
        `${h12}:${pad(d.getMinutes())}:${pad(d.getSeconds())} ${ampm}`
    );
}

/** Human UTC, e.g. "Wed, Aug 5, 2026, 12:34:56 PM GMT" */
function humanUtc(d: Date): string {
    const ampm = d.getUTCHours() >= 12 ? "PM" : "AM";
    const h12 = d.getUTCHours() % 12 || 12;
    return (
        `${WEEKDAYS[d.getUTCDay()]}, ${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}, ` +
        `${h12}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())} ${ampm} GMT`
    );
}

/** "in 3 days" / "2 hours ago" style relative label. */
export function relativeTo(d: Date, now = Date.now()): {
    text: string;
    isFuture: boolean;
} {
    const diffMs = d.getTime() - now;
    const future = diffMs > 0;
    const abs = Math.abs(diffMs);
    const min = 60_000;
    const hour = 60 * min;
    const day = 24 * hour;
    const month = 30 * day;
    const year = 365 * day;

    let n = 0;
    let unit = "";
    if (abs < min) {
        n = Math.round(abs / 1000);
        unit = "second";
    } else if (abs < hour) {
        n = Math.round(abs / min);
        unit = "minute";
    } else if (abs < day) {
        n = Math.round(abs / hour);
        unit = "hour";
    } else if (abs < month) {
        n = Math.round(abs / day);
        unit = "day";
    } else if (abs < year) {
        n = Math.round(abs / month);
        unit = "month";
    } else {
        n = Math.round(abs / year);
        unit = "year";
    }
    const plural = n === 1 ? "" : "s";
    const text = future ? `in ${n} ${unit}${plural}` : `${n} ${unit}${plural} ago`;
    return { text, isFuture: future };
}

function breakdown(d: Date): TsDateBreakdown {
    const rel = relativeTo(d);
    const wk = isoWeekOf(d);
    return {
        utcIso: d.toISOString(),
        localIso: localIso(d),
        humanLocal: humanLocal(d),
        localInput: localIso(d),
        humanUtc: humanUtc(d),
        dayOfYear: dayOfYear(d),
        isoWeek: wk.week,
        isoWeekText: `${wk.year}-W${pad(wk.week)}`,
        relative: rel.text,
        isFuture: rel.isFuture,
        epochMs: d.getTime(),
    };
}

function groupDigits(text: string): string {
    const negative = text.startsWith("-");
    const digits = negative ? text.slice(1) : text;
    const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return (negative ? "-" : "") + grouped;
}

function groupBig(n: bigint): string {
    return groupDigits(n.toString());
}

function secondsFromMs(msBig: bigint): { display: string; raw: string } {
    const negative = msBig < 0n;
    const abs = negative ? -msBig : msBig;
    const sec = abs / 1000n;
    const rem = abs % 1000n;
    const sign = negative ? "-" : "";

    if (rem === 0n) {
        return {
            display: sign + groupBig(sec),
            raw: sign + sec.toString(),
        };
    }

    const frac = rem.toString().padStart(3, "0");
    return {
        display: sign + groupBig(sec) + "." + frac,
        raw: sign + sec.toString() + "." + frac,
    };
}

/** Convert a resolved Date ms value into exact values in every unit. */
function valueSetFromMs(ms: number): TsValueSet[] {
    const msBig = BigInt(Math.round(ms));

    const seconds = secondsFromMs(msBig);
    const msRaw = msBig.toString();
    const usBig = msBig * 1_000n;
    const nsBig = msBig * 1_000_000n;

    return [
        {
            unit: "seconds",
            value: seconds.display,
            raw: seconds.raw,
        },
        {
            unit: "milliseconds",
            value: groupBig(msBig),
            raw: msRaw,
        },
        {
            unit: "microseconds",
            value: groupBig(usBig),
            raw: usBig.toString(),
        },
        {
            unit: "nanoseconds",
            value: groupBig(nsBig),
            raw: nsBig.toString(),
        },
    ];
}

/**
 * Parse a timestamp string in the given unit into integer milliseconds.
 *
 * Uses BigInt-backed rational math so large integer inputs do not lose
 * precision before being reduced to Date-compatible milliseconds.
 */
function parseTimestampToMs(input: string, unit: TsUnit): number | null {
    const normalized = input.trim().replace(/,/g, "");
    if (normalized.length === 0 || normalized.length > MAX_TIMESTAMP_INPUT_LENGTH) {
        return null;
    }

    const match = TIMESTAMP_RE.exec(normalized);
    if (!match) return null;

    const negative = normalized.startsWith("-");
    const intText = match[1] ?? "";
    let fracText = match[2] ?? "";

    if (intText.length === 0 && fracText.length === 0) return null;

    // Anything beyond 12 fractional digits is far below Date resolution.
    if (fracText.length > 12) fracText = fracText.slice(0, 12);

    const scale = 10n ** BigInt(fracText.length);
    const intBig = intText.length > 0 ? BigInt(intText) : 0n;
    const fracBig = fracText.length > 0 ? BigInt(fracText) : 0n;
    const valueScaled = intBig * scale + fracBig;

    let numerator: bigint;
    let denominator: bigint;

    switch (unit) {
        case "seconds":
            numerator = valueScaled * 1_000n;
            denominator = scale;
            break;
        case "milliseconds":
            numerator = valueScaled;
            denominator = scale;
            break;
        case "microseconds":
            numerator = valueScaled;
            denominator = scale * 1_000n;
            break;
        case "nanoseconds":
            numerator = valueScaled;
            denominator = scale * 1_000_000n;
            break;
    }

    let msBig = numerator / denominator;
    const rem = numerator % denominator;

    // Round half away from zero at the millisecond boundary.
    if (rem * 2n >= denominator) {
        msBig += 1n;
    }

    if (negative) msBig = -msBig;

    const max = BigInt(MAX_ABS_MS_VALUE);
    if (msBig > max || msBig < -max) return null;

    const msNumber = Number(msBig);
    if (!Number.isFinite(msNumber)) return null;

    return msNumber;
}

/**
 * Parse a Unix timestamp string in the given unit into a Date.
 * Returns null when the number is not finite or lands outside Date's range.
 */
function parseTimestampToDate(input: string, unit: TsUnit): Date | null {
    const ms = parseTimestampToMs(input, unit);
    if (ms === null) return null;

    const d = new Date(ms);
    if (Number.isNaN(d.getTime())) return null;
    return d;
}

/**
 * Parse a human date string into a Date.
 * Accepts local ISO ("2026-08-05T12:00:00"), UTC ISO ("...Z"), RFC/HTTP dates,
 * and bare dates ("2026-08-05"). Returns null when unparseable.
 */
function parseDateToTimestamp(input: string): Date | null {
    const trimmed = input.trim();
    if (trimmed === "") return null;

    // Bare date → local midnight is the least-surprise interpretation.
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        const d = new Date(trimmed + "T00:00:00");
        return Number.isNaN(d.getTime()) ? null : d;
    }

    // Local ISO without a timezone suffix → treat as LOCAL time.
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\.\d+)?$/.test(trimmed)) {
        const d = new Date(trimmed);
        return Number.isNaN(d.getTime()) ? null : d;
    }

    // Everything else: hand to Date.parse (handles Z, offsets, RFC 2822, etc.)
    const d = new Date(Date.parse(trimmed));
    return Number.isNaN(d.getTime()) ? null : d;
}

/** Unit order used for the to-timestamp output table. */
export const UNIT_ORDER: TsUnit[] = ["seconds", "milliseconds", "microseconds", "nanoseconds"];

export function run(input: string, opts: TsOptions): TsResult {
    if (opts.mode === "to-date") {
        const d = parseTimestampToDate(input, opts.unit);
        if (!d) {
            return {
                valid: false,
                error: "That doesn't look like a valid " + opts.unit + " timestamp.",
                date: null,
                values: null,
                inputNumber: null,
                inputDate: null,
            };
        }

        return {
            valid: true,
            error: null,
            date: breakdown(d),
            values: null,
            inputNumber: null,
            inputDate: null,
        };
    }

    // to-timestamp
    const d = parseDateToTimestamp(input);
    if (!d) {
        return {
            valid: false,
            error: "Couldn't read that as a date. Try 2026-08-05T12:00:00 or a full date string.",
            date: null,
            values: null,
            inputNumber: null,
            inputDate: null,
        };
    }

    const ms = d.getTime();

    return {
        valid: true,
        error: null,
        date: breakdown(d),
        values: valueSetFromMs(ms),
        inputNumber: null,
        inputDate: input.trim(),
    };
}

/** Current epoch ms (for the live clock / "use now" button). */
export function nowMs(): number {
    return Date.now();
}