import type { Store } from "../../state/toolStore";
import type { TsMode, TsState, TsUnit } from "./types";
import { run, nowLocalInput } from "./engine";
import {
    AUTO_THRESHOLD,
    SAMPLE_DATE,
    SAMPLE_MICROSECONDS,
    SAMPLE_MILLISECONDS,
    SAMPLE_NANOSECONDS,
    SAMPLE_SECONDS,
} from "./constants";

/** Fill the input with "now" in the current unit, using exact BigInt math. */
function nowInUnit(unit: TsUnit): string {
    const ms = BigInt(Date.now());

    switch (unit) {
        case "seconds":
            return (ms / 1_000n).toString();
        case "milliseconds":
            return ms.toString();
        case "microseconds":
            return (ms * 1_000n).toString();
        case "nanoseconds":
            return (ms * 1_000_000n).toString();
    }
}

export function setInput(store: Store<TsState>, text: string): void {
    store.update((s) => ({ ...s, input: text, error: null }));
}

export function setMode(store: Store<TsState>, mode: TsMode): void {
    store.update((s) => ({ ...s, mode, error: null }));
}

export function setUnit(store: Store<TsState>, unit: TsUnit): void {
    store.update((s) => ({ ...s, unit, error: null }));
}

/**
 * Fill the input with the current time.
 *
 * Timestamp → Date:
 *   inserts a numeric timestamp in the selected unit.
 *
 * Date → Timestamp:
 *   inserts a current local ISO date string.
 */
export function useNow(store: Store<TsState>): void {
    store.update((s) => ({
        ...s,
        input: s.mode === "to-date" ? nowInUnit(s.unit) : nowLocalInput(),
        error: null,
    }));
}

export function clearAll(store: Store<TsState>): void {
    store.update((s) => ({
        ...s,
        input: "",
        result: null,
        error: null,
    }));
}

/** Recompute. Live calls pass forced=false and skip work above the threshold. */
export function convert(store: Store<TsState>, forced = false): void {
    const s = store.get();
    if (s.isRunning) return;

    if (s.input.trim() === "") {
        store.update((x) => ({ ...x, result: null, error: null }));
        return;
    }

    if (!forced && s.input.length > AUTO_THRESHOLD) {
        store.update((x) => ({ ...x, result: null, error: null }));
        return;
    }

    store.update((x) => ({ ...x, isRunning: true, error: null }));

    queueMicrotask(() => {
        try {
            const result = run(s.input.trim(), { mode: s.mode, unit: s.unit });
            store.update((x) => ({
                ...x,
                isRunning: false,
                result,
                error: result.error,
            }));
        } catch (err) {
            store.update((x) => ({
                ...x,
                isRunning: false,
                error: err instanceof Error ? err.message : "Conversion failed.",
            }));
        }
    });
}

/** Load a sample appropriate to the current mode/unit. LOAD ONLY. */
export function loadSample(store: Store<TsState>): void {
    store.update((s) => {
        const input = s.mode === "to-date" ? sampleForUnit(s.unit) : SAMPLE_DATE;
        return { ...s, input, error: null };
    });
}

function sampleForUnit(unit: TsUnit): string {
    switch (unit) {
        case "seconds":
            return SAMPLE_SECONDS;
        case "milliseconds":
            return SAMPLE_MILLISECONDS;
        case "microseconds":
            return SAMPLE_MICROSECONDS;
        case "nanoseconds":
            return SAMPLE_NANOSECONDS;
    }
}