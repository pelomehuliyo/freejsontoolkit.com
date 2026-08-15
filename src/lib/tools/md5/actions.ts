import type { Store } from "../../state/toolStore";
import type { Md5State, HashEncoding } from "./types";
import { run } from "./engine";
import { SAMPLE_TEXT } from "./constants";

let reqId = 0;

export function setInput(store: Store<Md5State>, text: string): void {
    store.update((s) => ({ ...s, input: text, error: null }));
}

export function setEncoding(store: Store<Md5State>, encoding: HashEncoding): void {
    store.update((s) => ({ ...s, encoding, error: null }));
}

export function clearAll(store: Store<Md5State>): void {
    reqId++; // Invalidate pending requests
    store.update((s) => ({
        ...s,
        input: "",
        result: null,
        error: null,
        isRunning: false,
    }));
}

export function loadSample(store: Store<Md5State>): void {
    store.update((s) => ({ ...s, input: SAMPLE_TEXT, error: null }));
}

/**
 * Async hash action.
 * Uses reqId staleness guard to prevent race conditions on rapid typing.
 */
export async function convert(store: Store<Md5State>): Promise<void> {
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