import type { Store } from "../../state/toolStore";
import type { BcryptState } from "./types";
import { SAMPLE_TEXT } from "./constants";

// ── Worker management ──
// bcrypt is intentionally slow (that's the point), so hashing runs in a
// background worker to keep the page responsive.
let worker: Worker | null = null;
let reqId = 0;

function getWorker(): Worker {
    if (!worker) {
        worker = new Worker(new URL("./bcrypt.worker.ts", import.meta.url), { type: "module" });
    }
    return worker;
}

export function setInput(store: Store<BcryptState>, text: string): void {
    store.update((s) => ({ ...s, input: text, error: null }));
}

export function setRounds(store: Store<BcryptState>, rounds: number): void {
    store.update((s) => ({ ...s, rounds, error: null }));
}

export function clearAll(store: Store<BcryptState>): void {
    reqId++;
    store.update((s) => ({
        ...s,
        input: "",
        result: null,
        error: null,
        isRunning: false,
    }));
}

export function loadSample(store: Store<BcryptState>): void {
    // Load only — never auto-run.
    store.update((s) => ({ ...s, input: SAMPLE_TEXT, error: null }));
}

/**
 * Hash a password in the worker. Uses a reqId staleness guard so rapid
 * clicks / input can't race. Never auto-runs on sample load.
 */
export function convert(store: Store<BcryptState>): void {
    const s = store.get();
    if (s.isRunning) return;

    if (!s.input.trim()) {
        store.update((x) => ({ ...x, result: null, error: null }));
        return;
    }

    const id = ++reqId;
    store.update((x) => ({ ...x, isRunning: true, error: null }));

    const w = getWorker();
    const onMessage = (e: MessageEvent) => {
        const d = e.data as { id: number; ok: boolean; result?: string; error?: string };
        if (d.id !== id) return;
        w.removeEventListener("message", onMessage);
        if (d.id !== reqId) return; // superseded by newer request
        if (d.ok && typeof d.result === "string") {
            store.update((x) => ({ ...x, isRunning: false, result: d.result as string }));
        } else {
            store.update((x) => ({
                ...x,
                isRunning: false,
                error: d.error ?? "Hashing failed. Check the input and try again.",
            }));
        }
    };

    w.addEventListener("message", onMessage);
    w.postMessage({ id, password: s.input, rounds: s.rounds });
}