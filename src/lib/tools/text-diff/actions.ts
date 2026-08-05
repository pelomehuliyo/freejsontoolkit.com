import type { Store } from "../../state/toolStore";
import type { DiffMode, DiffResult, TextDiffState } from "./types";
import { AUTO_DIFF_THRESHOLD, MAX_INPUT_CHARS, SAMPLE_A, SAMPLE_B } from "./constants";

// ── Worker management: the diff runs off the main thread ──
let worker: Worker | null = null;
let reqId = 0;

function getWorker(): Worker {
    if (!worker) {
        worker = new Worker(new URL("./text-diff.worker.ts", import.meta.url), { type: "module" });
    }
    return worker;
}

export function setInputA(store: Store<TextDiffState>, value: string): void {
    store.update((s) => ({ ...s, inputA: value, error: null }));
}
export function setInputB(store: Store<TextDiffState>, value: string): void {
    store.update((s) => ({ ...s, inputB: value, error: null }));
}

/** Recompute the diff. Live (as-you-type) calls pass forced=false and are
 *  skipped above AUTO_DIFF_THRESHOLD (the UI then offers the Compare button);
 *  explicit Compare / Load Sample / option changes pass forced=true. */
export function compare(store: Store<TextDiffState>, forced = false): void {
    const s = store.get();
    if (s.isComparing) return;

    if (s.inputA.length > MAX_INPUT_CHARS || s.inputB.length > MAX_INPUT_CHARS) {
        store.update((x) => ({
            ...x,
            error: "Input too large. Limit is " + MAX_INPUT_CHARS.toLocaleString() + " chars per side.",
        }));
        return;
    }

    const combined = s.inputA.length + s.inputB.length;
    if (!forced && combined > AUTO_DIFF_THRESHOLD) {
        store.update((x) => ({ ...x, needsManual: true }));
        return;
    }

    if (s.inputA.trim() === "" && s.inputB.trim() === "") {
        store.update((x) => ({ ...x, result: null, needsManual: false, isComparing: false }));
        return;
    }

    const id = ++reqId;
    store.update((x) => ({ ...x, isComparing: true, needsManual: false, error: null }));

    const w = getWorker();
    const onMessage = (e: MessageEvent) => {
        const d = e.data as { id: number; ok: boolean; result?: DiffResult; error?: string };
        if (d.id !== id) return;
        w.removeEventListener("message", onMessage);
        if (d.id !== reqId) return; // superseded by newer input
        if (d.ok && d.result) {
            store.update((x) => ({ ...x, isComparing: false, result: d.result as DiffResult }));
        } else {
            store.update((x) => ({ ...x, isComparing: false, error: d.error ?? "Diff failed." }));
        }
    };

    w.addEventListener("message", onMessage);
    w.postMessage({
        id,
        a: s.inputA,
        b: s.inputB,
        options: { ignoreWhitespace: s.ignoreWhitespace, ignoreCase: s.ignoreCase },
    });
}

export function loadSample(store: Store<TextDiffState>): void {
    store.update((s) => ({ ...s, inputA: SAMPLE_A, inputB: SAMPLE_B, error: null }));
    compare(store, true);
}

export function clearAll(store: Store<TextDiffState>): void {
    reqId++;
    store.update((s) => ({
        ...s,
        inputA: "",
        inputB: "",
        result: null,
        isComparing: false,
        needsManual: false,
        error: null,
    }));
}

export function setMode(store: Store<TextDiffState>, mode: DiffMode): void {
    store.update((s) => ({ ...s, mode }));
}
export function setIgnoreWhitespace(store: Store<TextDiffState>, value: boolean): void {
    store.update((s) => ({ ...s, ignoreWhitespace: value }));
    if (store.get().inputA || store.get().inputB) compare(store, true);
}
export function setIgnoreCase(store: Store<TextDiffState>, value: boolean): void {
    store.update((s) => ({ ...s, ignoreCase: value }));
    if (store.get().inputA || store.get().inputB) compare(store, true);
}