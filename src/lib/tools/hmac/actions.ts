import type { Store } from "../../state/toolStore";
import type { HmacState, HmacAlgorithm, HmacEncoding } from "./types";
import { run } from "./engine";
import { SAMPLE_KEY, SAMPLE_MESSAGE } from "./constants";

let reqId = 0;

export function setMessage(store: Store<HmacState>, text: string): void {
    store.update((s) => ({ ...s, message: text, error: null }));
}

export function setKey(store: Store<HmacState>, text: string): void {
    store.update((s) => ({ ...s, key: text, error: null }));
}

export function setAlgorithm(store: Store<HmacState>, algorithm: HmacAlgorithm): void {
    store.update((s) => ({ ...s, algorithm, error: null }));
}

export function setEncoding(store: Store<HmacState>, encoding: HmacEncoding): void {
    store.update((s) => ({ ...s, encoding, error: null }));
}

export function clearAll(store: Store<HmacState>): void {
    reqId++; // Invalidate pending requests
    store.update((s) => ({
        ...s,
        message: "",
        key: "",
        result: null,
        error: null,
        isRunning: false,
    }));
}

export function loadSample(store: Store<HmacState>): void {
    // Load only — never auto-run.
    store.update((s) => ({ ...s, message: SAMPLE_MESSAGE, key: SAMPLE_KEY, error: null }));
}

/**
 * Generate the HMAC. Uses a reqId staleness guard so rapid clicks / edits
 * can't race. Never auto-runs on sample load.
 */
export async function convert(store: Store<HmacState>): Promise<void> {
    const id = ++reqId;
    const s = store.get();

    if (s.isRunning) return;

    if (!s.message.trim() && !s.key.trim()) {
        store.update((x) => ({ ...x, result: null, error: null }));
        return;
    }

    store.update((x) => ({ ...x, isRunning: true, error: null }));

    try {
        const result = await run(s.message, s.key, s.algorithm);
        if (id !== reqId) return; // Stale result
        store.update((x) => ({ ...x, isRunning: false, result, error: null }));
    } catch (err) {
        if (id !== reqId) return;
        store.update((x) => ({
            ...x,
            isRunning: false,
            result: null,
            error: err instanceof Error ? err.message : "HMAC generation failed.",
        }));
    }
}