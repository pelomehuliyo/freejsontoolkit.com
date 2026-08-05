/**
 * Timestamp Converter — types.
 *
 * Two directions, exactly like the mental model:
 *   to-date       → a Unix timestamp in as a number, get a human date back
 *   to-timestamp  → a human date in, get the Unix timestamp(s) back
 * Four units cover the common backends: seconds (classic Unix), milliseconds
 * (JS Date.now()), microseconds (Go / Postgres), nanoseconds (Rust / Go).
 */

export type TsMode = "to-date" | "to-timestamp";
export type TsUnit = "seconds" | "milliseconds" | "microseconds" | "nanoseconds";

export interface TsOptions {
    mode: TsMode;
    unit: TsUnit;
}

/** The date breakdown shown when a moment is resolved. */
export interface TsDateBreakdown {
    /** UTC ISO-8601, e.g. "2026-08-05T12:34:56.000Z" */
    utcIso: string;
    /** Local ISO-8601 WITHOUT the offset, ready to paste as a local date */
    localIso: string;
    /** Local RFC-ish human string, e.g. "Wed, Aug 5, 2026, 2:34:56 PM" */
    humanLocal: string;
    /** Reversible input for the reverse direction (local ISO) */
    localInput: string;
    /** UTC human string, e.g. "Wed, Aug 5, 2026, 12:34:56 PM GMT" */
    humanUtc: string;
    /** Day of the year (1–366) */
    dayOfYear: number;
    /** ISO week number (1–53) */
    isoWeek: number;
    /** ISO "YYYY-Www" quite readable */
    isoWeekText: string;
    /** Human relative time, e.g. "in 3 days" / "2 hours ago" */
    relative: string;
    /** True if the resolved moment is in the future relative to now */
    isFuture: boolean;
    /** Milliseconds since epoch (always computable regardless of input unit) */
    epochMs: number;
}

export interface TsValueSet {
    /** Which unit this value set describes */
    unit: TsUnit;
    /** The value in the currently selected unit, formatted for display */
    value: string;
    /** The raw numeric value in the selected unit (may be fractional) */
    number: number;
}

export interface TsResult {
    valid: boolean;
    error: string | null;
    /** For to-date: the resolved moment; for to-timestamp: null */
    date: TsDateBreakdown | null;
    /** For to-timestamp: the time values in every unit; for to-date: null */
    values: TsValueSet[] | null;
    /** The timestamp that was parsed (to-date) — echo for the readout */
    inputNumber: number | null;
    /** The date string that was parsed (to-timestamp) — echo for the readout */
    inputDate: string | null;
}

export interface TsState {
    input: string;
    result: TsResult | null;
    mode: TsMode;
    unit: TsUnit;
    isRunning: boolean;
    error: string | null;
}

export const DEFAULT_STATE: TsState = {
    input: "",
    result: null,
    mode: "to-date",
    unit: "seconds",
    isRunning: false,
    error: null,
};
