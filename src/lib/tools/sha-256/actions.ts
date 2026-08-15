import type { Store } from "../../state/toolStore";
import type { Sha256State, HashEncoding } from "./types";
import { run } from "./engine";
import { SAMPLE_TEXT } from "./constants";

let reqId = 0;

export function setInput(store: Store<Sha256State>, text: string): void {
    store.update((s) => ({ ...s, input: text, error: null }));
}

export function setEncoding(store: Store<Sha256State>, encoding: HashEncoding): void {
    store.update((s) => ({ ...s, encoding, error: null }));
}

export function clearAll(store: Store<Sha256State>): void {
    reqId++; // Invalidate pending requests
    store.update((s) => ({
        ...s,
        input: "",
        result: null,
        error: null,
        isRunning: false,
    }));
}

export function loadSample(store: Store<Sha256State>): void {
    store.update((s) => ({ ...s, input: SAMPLE_TEXT, error: null }));
}

/**
 * Async hash action.
 * Uses reqId staleness guard to prevent race conditions on rapid typing.
 */
export async function convert(store: Store<Sha256State>): Promise<void> {
    const id = ++reqId;
    const s = store.get();

    if (s.isRunning) return;

    if (!s.input.trim()) {
        store.update((x) => ({ ...x, result: null, error: null }));
        return;
    }

    store.update((x) => ({ ...x, isRunning: true, error: null }));

    try {
        const result = await run(s.input);
        if (id !== reqId) return; // Stale result
        store.update((x) => ({ ...x, isRunning: false, result, error: null }));
    } catch (err) {
        if (id !== reqId) return;
        store.update((x) => ({
            ...x,
            isRunning: false,
            result: null,
            error: err instanceof Error ? err.message : "Hashing failed.",
        }));
    }
}