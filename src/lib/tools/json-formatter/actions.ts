import type { Store } from "../../state/toolStore";
import type { JsonFormatterState, IndentOption } from "./types";
import { formatJson, validateJson } from "./engine";
import { MAX_INPUT_CHARS, SAMPLE_JSON } from "./constants";

// ── Worker management: keeps big-file formatting off the main thread ──
let worker: Worker | null = null;
let reqId = 0;

// Above this size we skip live (main-thread) validation while typing, because
// a synchronous JSON.parse on a multi-MB file would hitch the UI. Validity is
// still checked — in the worker — when the user clicks Format.
const LIVE_VALIDATE_THRESHOLD = 500_000;

function getWorker(): Worker {
    if (!worker) {
        worker = new Worker(new URL("./formatter.worker.ts", import.meta.url), { type: "module" });
    }
    return worker;
}

/** Validate-as-you-type. Does NOT format. Clears any stale output so the box
    never shows a previous result against new input. */
export function handleInput(store: Store<JsonFormatterState>, text: string): void {
    reqId++; // invalidate any in-flight format — its result is now stale
    const state = store.get();

    if (!text.trim()) {
        store.set({
            ...state,
            jsonInput: text,
            formattedOutput: "",
            inputStatus: "empty",
            outputStatus: "empty",
            isFormatting: false,
            error: null,
        });
        return;
    }

    if (text.length > MAX_INPUT_CHARS) {
        store.set({
            ...state,
            jsonInput: text,
            formattedOutput: "",
            inputStatus: "invalid",
            outputStatus: "empty",
            isFormatting: false,
            error:
                "Input too large (" +
                text.length.toLocaleString() +
                " chars). Limit is " +
                MAX_INPUT_CHARS.toLocaleString() +
                ".",
        });
        return;
    }

    // Large input: skip the synchronous parse here (it would freeze the page).
    // The worker validates it for real when Format is clicked.
    if (text.length > LIVE_VALIDATE_THRESHOLD) {
        store.set({
            ...state,
            jsonInput: text,
            formattedOutput: "",
            inputStatus: "ready",
            outputStatus: "empty",
            isFormatting: false,
            error: null,
        });
        return;
    }

    const err = validateJson(text);
    store.set({
        ...state,
        jsonInput: text,
        formattedOutput: "",
        inputStatus: err ? "invalid" : "ready",
        outputStatus: "empty",
        isFormatting: false,
        error: err,
    });
}

/** The ONLY thing that formats (besides the Load Sample demo). Runs in a
    worker so the UI stays responsive; shows a "Formatting…" state meanwhile. */
export function format(store: Store<JsonFormatterState>): void {
    const state = store.get();
    if (state.isFormatting) return; // ignore double-clicks / re-entrant triggers
    if (!state.jsonInput.trim()) {
        store.update((s) => ({ ...s, error: "Paste or load JSON first." }));
        return;
    }

    const id = ++reqId;
    store.update((s) => ({ ...s, isFormatting: true, error: null }));

    const w = getWorker();
    const onMessage = (e: MessageEvent) => {
        const data = e.data as { id: number; ok: boolean; output?: string; error?: string };
        if (data.id !== id) return; // a different request's response
        w.removeEventListener("message", onMessage);
        if (data.id !== reqId) return; // superseded by newer input — discard stale result

        if (data.ok) {
            store.update((s) => ({
                ...s,
                isFormatting: false,
                formattedOutput: data.output ?? "",
                outputStatus: "formatted",
                inputStatus: "ready",
                error: null,
            }));
        } else {
            store.update((s) => ({
                ...s,
                isFormatting: false,
                inputStatus: "invalid",
                error: data.error ?? "Failed to format JSON.",
            }));
        }
    };

    w.addEventListener("message", onMessage);
    w.postMessage({
        id,
        input: state.jsonInput,
        options: { indent: state.indent, sortKeys: state.sortKeys },
    });
}

/** Demo action — loads the sample AND formats it so you see the result. */
export function loadSample(store: Store<JsonFormatterState>): void {
    handleInput(store, SAMPLE_JSON);
    format(store);
}

export function clearAll(store: Store<JsonFormatterState>): void {
    reqId++;
    store.update((s) => ({
        ...s,
        jsonInput: "",
        formattedOutput: "",
        inputStatus: "empty",
        outputStatus: "empty",
        isFormatting: false,
        error: null,
    }));
}

export function getFormattedContent(store: Store<JsonFormatterState>): string | null {
    return store.get().formattedOutput || null;
}

/** Option changes are STAGED only — click Format to apply them. */
export function setIndent(store: Store<JsonFormatterState>, value: IndentOption): void {
    store.update((s) => ({ ...s, indent: value }));
}

export function setSortKeys(store: Store<JsonFormatterState>, value: boolean): void {
    store.update((s) => ({ ...s, sortKeys: value }));
}