import type { TsMode, TsUnit } from "./types";

/**
 * Factors from the selected unit → milliseconds.
 *
 * Kept for reference. The engine’s exact parser/formatter uses BigInt-based
 * scaling instead of plain number math because microsecond and nanosecond
 * values can exceed Number.MAX_SAFE_INTEGER.
 */
export const UNIT_TO_MS: Record<TsUnit, number> = {
    seconds: 1_000,
    milliseconds: 1,
    microseconds: 0.001,
    nanoseconds: 0.000001,
};

/** Human labels for the unit segmented control. */
export const UNITS: { id: TsUnit; label: string }[] = [
    { id: "seconds", label: "Seconds" },
    { id: "milliseconds", label: "Milliseconds" },
    { id: "microseconds", label: "Microseconds" },
    { id: "nanoseconds", label: "Nanoseconds" },
];

export const MODES: { id: TsMode; label: string }[] = [
    { id: "to-date", label: "Timestamp → Date" },
    { id: "to-timestamp", label: "Date → Timestamp" },
];

/**
 * Samples all point at the same instant:
 * 2026-08-05T12:00:00Z.
 *
 * Kept as strings because nanosecond values exceed Number.MAX_SAFE_INTEGER.
 */
export const SAMPLE_SECONDS = "1785931200";
export const SAMPLE_MILLISECONDS = "1785931200000";
export const SAMPLE_MICROSECONDS = "1785931200000000";
export const SAMPLE_NANOSECONDS = "1785931200000000000";

/** Reversible sample date, UTC, used for the reverse direction. */
export const SAMPLE_DATE = "2026-08-05T12:00:00Z";

/** Live-as-you-type recompute stops above this pure-text length. */
export const AUTO_THRESHOLD = 10_000;

/** Reject absurd magnitudes early so Date() can't be shoved into +275760. */
export const MAX_ABS_MS_VALUE = 8.64e15;

/** A sensible clock tick for the live "now" readout (ms). */
export const CLOCK_TICK = 1000;