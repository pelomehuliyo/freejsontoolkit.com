import type { Store } from "../../state/toolStore";
import type { TsMode, TsState, TsUnit } from "./types";
import { run } from "./engine";
import { AUTO_THRESHOLD, SAMPLE_DATE, SAMPLE_MICROSECONDS, SAMPLE_MILLISECONDS, SAMPLE_NANOSECONDS, SAMPLE_SECONDS } from "./constants";

/** Fill the input with "now" in the current unit. */
function nowInUnit(unit: TsUnit): string {
    const ms = Date.now();
    switch (unit) {
        case "seconds":
            return String(Math.floor(ms / 1000));
        case "milliseconds":
            return String(ms);
        case "microseconds":
            return String(ms * 1000);
        case "nanoseconds":
            return String(ms * 1_000_000);
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

/** Fill the input with the current Unix time in the selected unit. */
export function useNow(store: Store<TsState>): void {
    store.update((s) => ({ ...s, input: nowInUnit(s.unit), error: null }));
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

/** Load a sample appropriate to the current mode/unit. */
export function loadSample(store: Store<TsState>): void {
    store.update((s) => {
        const input = s.mode === "to-date" ? sampleForUnit(s.unit) : SAMPLE_DATE;
        const next = { ...s, input, error: null };
        return next;
    });
}

function sampleForUnit(unit: TsUnit): string {
    switch (unit) {
        case "seconds":
            return String(SAMPLE_SECONDS);
        case "milliseconds":
            return String(SAMPLE_MILLISECONDS);
        case "microseconds":
            return String(SAMPLE_MICROSECONDS);
        case "nanoseconds":
            return String(SAMPLE_NANOSECONDS);
    }
}
