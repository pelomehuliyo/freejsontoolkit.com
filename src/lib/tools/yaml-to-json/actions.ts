import type { Store } from "../../state/toolStore";
import type { YamlToJsonState, IndentOption, ConvertResult } from "./types";
import { convertYamlToJson } from "./engine";
import { LIVE_CONVERT_THRESHOLD, MAX_INPUT_CHARS, SAMPLE_YAML } from "./constants";

// ── Worker management: big-config conversion off the main thread ──
let worker: Worker | null = null;
let reqId = 0;

function getWorker(): Worker {
    if (!worker) {
        worker = new Worker(new URL("./converter.worker.ts", import.meta.url), { type: "module" });
    }
    return worker;
}

/** As-you-type conversion (main thread, capped by LIVE_CONVERT_THRESHOLD).
 *  Updates the input status bar (Valid / Invalid · line, col) but NEVER the
 *  output box — the output only changes on the explicit Convert action, so
 *  Load Sample stays load-only and typing never churns the result. */
export function handleInput(store: Store<YamlToJsonState>, text: string): void {
    reqId++;
    const state = store.get();
    if (!text.trim()) {
        store.set({
            ...state,
            yamlInput: text,
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
            yamlInput: text,
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
        // Defer the real conversion to the worker on Convert; keep the box responsive.
        store.set({ ...state, yamlInput: text, inputStatus: "ready", error: null });
        return;
    }
    const live = convertYamlToJson(text, { indent: state.indent });
    live.authoritative = false;
    store.set({ ...state, yamlInput: text, result: live, inputStatus: "ready", error: null });
}

/** The explicit Convert — runs in the worker, drives the output editor and
 *  (on error) the scroll-to-error in the page. */
export function convert(store: Store<YamlToJsonState>): void {
    const state = store.get();
    if (state.isConverting) return;
    if (!state.yamlInput.trim()) {
        store.update((s) => ({ ...s, error: "Paste or load YAML first." }));
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
                outputStatus: result.ok ? "valid" : "invalid",
                error: null,
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
    w.postMessage({ id, input: state.yamlInput, options: { indent: state.indent } });
}

export function loadSample(store: Store<YamlToJsonState>): void {
    // Load only — never auto-run. The user clicks Convert explicitly.
    handleInput(store, SAMPLE_YAML);
}

export function clearAll(store: Store<YamlToJsonState>): void {
    reqId++;
    store.update((s) => ({
        ...s,
        yamlInput: "",
        result: null,
        inputStatus: "empty",
        outputStatus: "empty",
        isConverting: false,
        error: null,
    }));
}

export function setIndent(store: Store<YamlToJsonState>, value: IndentOption): void {
    store.update((s) => ({ ...s, indent: value }));
}