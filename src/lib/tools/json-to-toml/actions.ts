import type { Store } from "../../state/toolStore";
import type { JsonToTomlState, ConvertOptions, ConvertResult } from "./types";
import { convertJsonToToml } from "./engine";
import { LIVE_CONVERT_THRESHOLD, MAX_INPUT_CHARS, SAMPLE_JSON } from "./constants";

// ── Worker management: big-config conversion off the main thread ──
let worker: Worker | null = null;
let reqId = 0;

function getWorker(): Worker {
    if (!worker) {
        worker = new Worker(new URL("./converter.worker.ts", import.meta.url), { type: "module" });
    }
    return worker;
}

/** As-you-type conversion (main thread, capped). Updates the input status bar
 *  but NEVER the output box — output only changes on the explicit Convert. */
export function handleInput(store: Store<JsonToTomlState>, text: string): void {
    reqId++;
    const state = store.get();
    if (!text.trim()) {
        store.set({
            ...state,
            jsonInput: text,
            result: null,
            inputStatus: "empty",
            outputStatus: "empty",
            isConverting: false,
            error: null,
        });
        return;
    }
    if (text.length > MAX_INPUT_CHARS) {
        store.set({
            ...state,
            jsonInput: text,
            result: null,
            inputStatus: "ready",
            outputStatus: "empty",
            isConverting: false,
            error:
                "Input too large (" +
                text.length.toLocaleString() +
                " chars). Limit is " +
                MAX_INPUT_CHARS.toLocaleString() +
                ".",
        });
        return;
    }
    if (text.length > LIVE_CONVERT_THRESHOLD) {
        store.set({ ...state, jsonInput: text, inputStatus: "ready", error: null });
        return;
    }
    const live = convertJsonToToml(text, { nullStrategy: state.nullStrategy });
    live.authoritative = false;
    store.set({ ...state, jsonInput: text, result: live, inputStatus: "ready", error: null });
}

/** The explicit Convert — runs in the worker, drives the output editor and,
 *  on failure, surfaces the reason in the error banner. */
export function convert(store: Store<JsonToTomlState>): void {
    const state = store.get();
    if (state.isConverting) return;
    if (!state.jsonInput.trim()) {
        store.update((s) => ({ ...s, error: "Paste or load JSON first." }));
        return;
    }
    const id = ++reqId;
    store.update((s) => ({ ...s, isConverting: true, error: null }));
    const w = getWorker();
    const onMessage = (e: MessageEvent) => {
        const data = e.data as { id: number; ok: boolean; result?: ConvertResult; error?: string };
        if (data.id !== id) return;
        w.removeEventListener("message", onMessage);
        if (data.id !== reqId) return; // superseded by newer input
        if (data.ok && data.result) {
            const result = data.result;
            result.authoritative = true;
            store.update((s) => ({
                ...s,
                isConverting: false,
                result,
                inputStatus: "ready",
                outputStatus: result.ok ? "converted" : "invalid",
                error: result.ok ? null : (result.error?.message ?? "Conversion failed."),
            }));
        } else {
            store.update((s) => ({
                ...s,
                isConverting: false,
                error: data.error ?? "Conversion failed.",
            }));
        }
    };
    w.addEventListener("message", onMessage);
    w.postMessage({ id, input: state.jsonInput, options: { nullStrategy: state.nullStrategy } });
}

export function loadSample(store: Store<JsonToTomlState>): void {
    // Load only — never auto-run. The user clicks Convert explicitly.
    handleInput(store, SAMPLE_JSON);
}

export function clearAll(store: Store<JsonToTomlState>): void {
    reqId++;
    store.update((s) => ({
        ...s,
        jsonInput: "",
        result: null,
        inputStatus: "empty",
        outputStatus: "empty",
        isConverting: false,
        error: null,
    }));
}

export function setNullStrategy(
    store: Store<JsonToTomlState>,
    value: ConvertOptions["nullStrategy"],
): void {
    store.update((s) => ({ ...s, nullStrategy: value }));
}