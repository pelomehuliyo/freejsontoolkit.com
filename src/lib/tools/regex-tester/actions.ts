import type { Store } from "../../state/toolStore";
import type { RegexState, RegexFlags } from "./types";
import { testRegex } from "./engine";
import { MAX_TEST_CHARS, SAMPLE_PATTERN, SAMPLE_TEST } from "./constants";

function recompute(store: Store<RegexState>): void {
    const s = store.get();
    if (!s.pattern && !s.testInput.trim()) {
        store.update((st) => ({ ...st, result: null, inputStatus: "empty", error: null }));
        return;
    }
    if (s.testInput.length > MAX_TEST_CHARS) {
        store.update((st) => ({
            ...st,
            result: null,
            inputStatus: "ready",
            error:
                "Test string too large for live matching (" +
                s.testInput.length.toLocaleString() +
                " chars). Limit is " +
                MAX_TEST_CHARS.toLocaleString() +
                ".",
        }));
        return;
    }
    const result = testRegex(s.pattern, s.flags, s.testInput, s.showReplace ? s.replaceValue : undefined);
    store.update((st) => ({
        ...st,
        result,
        inputStatus: "ready",
        error: result.ok ? null : (result.error?.message ?? null),
    }));
}

export function setPattern(store: Store<RegexState>, value: string): void {
    store.update((s) => ({ ...s, pattern: value }));
    recompute(store);
}

export function toggleFlag(store: Store<RegexState>, key: keyof RegexFlags): void {
    store.update((s) => ({ ...s, flags: { ...s.flags, [key]: !s.flags[key] } }));
    recompute(store);
}

export function setTestInput(store: Store<RegexState>, value: string): void {
    store.update((s) => ({ ...s, testInput: value }));
    recompute(store);
}

export function setReplaceValue(store: Store<RegexState>, value: string): void {
    store.update((s) => ({ ...s, replaceValue: value }));
    recompute(store);
}

export function setShowReplace(store: Store<RegexState>, value: boolean): void {
    store.update((s) => ({ ...s, showReplace: value }));
    recompute(store);
}

export function loadSample(store: Store<RegexState>): void {
    // Regex is live-by-nature (no discrete "run" verb), so loading the sample
    // naturally shows its matches — that IS the demo.
    store.update((s) => ({ ...s, pattern: SAMPLE_PATTERN, testInput: SAMPLE_TEST }));
    recompute(store);
}

export function clearAll(store: Store<RegexState>): void {
    store.update((s) => ({
        ...s,
        pattern: "",
        testInput: "",
        replaceValue: "",
        showReplace: false,
        result: null,
        inputStatus: "empty",
        error: null,
    }));
}