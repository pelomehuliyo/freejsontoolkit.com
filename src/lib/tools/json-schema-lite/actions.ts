import type { Store } from "../../state/toolStore";
import type { SchemaLiteState, SchemaValidateResult } from "./types";
import { validateAgainstSchema } from "./engine";
import { LIVE_VALIDATE_THRESHOLD, MAX_INPUT_CHARS, SAMPLE_INSTANCE, SAMPLE_SCHEMA } from "./constants";

// ── Worker management: big-input validation off the main thread ──
let worker: Worker | null = null;
let reqId = 0;

function getWorker(): Worker {
    if (!worker) {
        worker = new Worker(new URL("./schema-lite.worker.ts", import.meta.url), { type: "module" });
    }
    return worker;
}

/** Recompute the verdict. Live (as-you-type) calls pass forced=false and are
 *  skipped above the threshold (the UI then offers the Validate button);
 *  explicit Validate / Load Sample pass forced=true. */
export function recompute(store: Store<SchemaLiteState>, forced = false): void {
    const s = store.get();

    if (s.jsonInput.length > MAX_INPUT_CHARS || s.schemaInput.length > MAX_INPUT_CHARS) {
        store.update((x) => ({
            ...x,
            error: "Input too large. Limit is " + MAX_INPUT_CHARS.toLocaleString() + " chars per side.",
        }));
        return;
    }

    if (!s.jsonInput.trim() || !s.schemaInput.trim()) {
        store.update((x) => ({
            ...x,
            result: null,
            inputStatus: "empty",
            outputStatus: "empty",
            isValidating: false,
            error: null,
        }));
        return;
    }

    const combined = s.jsonInput.length + s.schemaInput.length;
    if (!forced && combined > LIVE_VALIDATE_THRESHOLD) {
        store.update((x) => ({ ...x, inputStatus: "ready" }));
        return;
    }

    store.update((x) => ({ ...x, inputStatus: "ready", error: null, isValidating: forced }));

    if (!forced) {
        const live = validateAgainstSchema({ instance: s.jsonInput, schema: s.schemaInput });
        live.authoritative = false;
        store.update((x) => ({
            ...x,
            result: live,
            outputStatus: live.ok ? "valid" : "invalid",
            isValidating: false,
        }));
        return;
    }

    const id = ++reqId;
    const w = getWorker();
    const onMessage = (e: MessageEvent) => {
        const d = e.data as { id: number; ok: boolean; result?: SchemaValidateResult; error?: string };
        if (d.id !== id) return;
        w.removeEventListener("message", onMessage);
        if (d.id !== reqId) return; // superseded by newer input
        if (d.ok && d.result) {
            const result = d.result;
            result.authoritative = true;
            store.update((x) => ({
                ...x,
                isValidating: false,
                result,
                outputStatus: result.ok ? "valid" : "invalid",
            }));
        } else {
            store.update((x) => ({
                ...x,
                isValidating: false,
                error: d.error ?? "Validation failed.",
            }));
        }
    };
    w.addEventListener("message", onMessage);
    w.postMessage({ id, input: { instance: s.jsonInput, schema: s.schemaInput } });
}

export function setJsonInput(store: Store<SchemaLiteState>, value: string): void {
    store.update((s) => ({ ...s, jsonInput: value, error: null }));
}

export function setSchemaInput(store: Store<SchemaLiteState>, value: string): void {
    store.update((s) => ({ ...s, schemaInput: value, error: null }));
}

export function loadSample(store: Store<SchemaLiteState>): void {
    // Load only — never auto-run. The user clicks Validate explicitly.
    store.update((s) => ({
        ...s,
        jsonInput: SAMPLE_INSTANCE,
        schemaInput: SAMPLE_SCHEMA,
        error: null,
    }));
}

export function clearAll(store: Store<SchemaLiteState>): void {
    reqId++;
    store.update((s) => ({
        ...s,
        jsonInput: "",
        schemaInput: "",
        result: null,
        inputStatus: "empty",
        outputStatus: "empty",
        isValidating: false,
        error: null,
    }));
}