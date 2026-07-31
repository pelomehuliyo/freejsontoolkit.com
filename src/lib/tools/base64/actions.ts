import type { Store } from "../../state/toolStore";
import type {
    Base64Mode,
    Base64Result,
    Base64State,
    Base64Variant,
} from "./types";
import { isBase64 } from "./engine";
import { AUTO_RUN_THRESHOLD, MAX_INPUT_CHARS, SAMPLE_B64, SAMPLE_TEXT } from "./constants";

// ── Worker management ──
let worker: Worker | null = null;
let reqId = 0;

function getWorker(): Worker {
    if (!worker) {
        worker = new Worker(new URL("./base64.worker.ts", import.meta.url), { type: "module" });
    }
    return worker;
}

function optsOf(s: Base64State) {
    return { variant: s.variant, padding: s.padding, dataUri: s.dataUri, mime: s.mime };
}

/** As-you-type: store the input + a cheap validity read (decode mode). Never
 *  produces output and never scrolls — typing stays smooth and jump-free. */
export function handleInput(store: Store<Base64State>, text: string): void {
    reqId++;
    const s = store.get();
    let inputStatus: Base64State["inputStatus"] = "empty";
    if (text.trim().length > 0) {
        if (s.mode === "decode") inputStatus = isBase64(text, s.variant) ? "ready" : "invalid";
        else inputStatus = "ready";
    }
    if (text.length > MAX_INPUT_CHARS) inputStatus = "invalid";
    store.set({ ...s, input: text, inputStatus, error: null });
}

/** Produce the result. Live calls pass forced=false and skip work above the
 *  cap (or, in decode mode, while the input isn't valid base64 — so the error
 *  banner doesn't flicker on every keystroke). Explicit button / option / mode
 *  changes pass forced=true. */
export function transform(store: Store<Base64State>, forced = false): void {
    const s = store.get();
    if (s.isRunning) return;

    const trimmed = s.input.trim();
    if (trimmed.length === 0) {
        store.update((x) => ({ ...x, result: null, needsManual: false, isRunning: false }));
        return;
    }
    if (s.input.length > MAX_INPUT_CHARS) {
        store.update((x) => ({
            ...x,
            error: "Input too large. Limit is " + MAX_INPUT_CHARS.toLocaleString() + " chars.",
        }));
        return;
    }

    if (!forced) {
        if (s.input.length > AUTO_RUN_THRESHOLD) {
            store.update((x) => ({ ...x, needsManual: true }));
            return;
        }
        if (s.mode === "decode" && !isBase64(s.input, s.variant)) {
            // invalid base64 while typing → clear output, no worker error spam
            store.update((x) => ({ ...x, result: null, needsManual: false }));
            return;
        }
    }

    const id = ++reqId;
    store.update((x) => ({ ...x, isRunning: true, needsManual: false, error: null }));

    const w = getWorker();
    const onMessage = (e: MessageEvent) => {
        const d = e.data as { id: number; ok: boolean; result?: Base64Result; error?: string };
        if (d.id !== id) return;
        w.removeEventListener("message", onMessage);
        if (d.id !== reqId) return; // superseded by newer input
        if (d.ok && d.result) {
            store.update((x) => ({ ...x, isRunning: false, result: d.result as Base64Result }));
        } else {
            store.update((x) => ({
                ...x,
                isRunning: false,
                inputStatus: x.mode === "decode" ? "invalid" : x.inputStatus,
                error: d.error ?? "Operation failed.",
            }));
        }
    };

    w.addEventListener("message", onMessage);
    w.postMessage({ id, mode: s.mode, input: s.input, options: optsOf(s) });
}

export function loadSample(store: Store<Base64State>): void {
    // Load only — never auto-run (matches the rule approved for the other tools).
    // To also show the result on sample load, add: transform(store, true);
    const s = store.get();
    const sample = s.mode === "encode" ? SAMPLE_TEXT : SAMPLE_B64;
    reqId++;
    const inputStatus =
        s.mode === "decode" ? (isBase64(sample, s.variant) ? "ready" : "invalid") : "ready";
    store.set({ ...s, input: sample, result: null, inputStatus, needsManual: false, error: null });
}

export function clearAll(store: Store<Base64State>): void {
    reqId++;
    store.update((s) => ({
        ...s,
        input: "",
        result: null,
        inputStatus: "empty",
        isRunning: false,
        needsManual: false,
        error: null,
    }));
}

function change(store: Store<Base64State>, patch: Partial<Base64State>): void {
    store.update((s) => ({ ...s, ...patch }));
    if (store.get().input.trim()) transform(store, true);
}

export function setMode(store: Store<Base64State>, mode: Base64Mode): void {
    change(store, { mode });
}
export function setVariant(store: Store<Base64State>, variant: Base64Variant): void {
    change(store, { variant });
}
export function setPadding(store: Store<Base64State>, padding: boolean): void {
    change(store, { padding });
}
export function setDataUri(store: Store<Base64State>, dataUri: boolean): void {
    change(store, { dataUri });
}
export function setMime(store: Store<Base64State>, mime: string): void {
    change(store, { mime });
}