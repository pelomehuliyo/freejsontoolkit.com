import type { Store } from "../../state/toolStore";
import type { XmlToJsonState, XmlToJsonOptions } from "./types";
import { MAX_INPUT_CHARS, SAMPLE_XML } from "./constants";

let worker: Worker | null = null;
let reqId = 0;

function getWorker(): Worker {
    if (!worker) {
        worker = new Worker(new URL("./worker.ts", import.meta.url), { type: "module" });
    }
    return worker;
}

function isValidXml(xml: string): boolean {
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(xml, "text/xml");
        return !doc.querySelector("parsererror");
    } catch {
        return false;
    }
}

export function handleInput(store: Store<XmlToJsonState>, text: string): void {
    const state = store.get();
    if (!text.trim()) {
        store.set({ ...state, xmlInput: text, jsonOutput: "", inputStatus: "empty", outputStatus: "empty", error: null });
        return;
    }
    if (text.length > MAX_INPUT_CHARS) {
        store.set({
            ...state,
            xmlInput: text,
            inputStatus: "invalid",
            error: `Input too large (${text.length.toLocaleString()} chars). Limit is ${MAX_INPUT_CHARS.toLocaleString()}.`,
        });
        return;
    }
    const valid = isValidXml(text);
    store.set({
        ...state,
        xmlInput: text,
        inputStatus: valid ? "ready" : "invalid",
        error: valid ? null : "Invalid XML – check syntax",
    });
}

export function convert(store: Store<XmlToJsonState>): void {
    const state = store.get();
    if (state.isConverting) return;
    if (!state.xmlInput.trim()) {
        store.update((s) => ({ ...s, error: "Paste or load XML first." }));
        return;
    }
    if (state.inputStatus === "invalid") {
        store.update((s) => ({ ...s, error: "Fix the XML syntax before converting." }));
        return;
    }

    const id = ++reqId;
    store.update((s) => ({ ...s, isConverting: true, error: null }));

    const w = getWorker();
    const onMessage = (e: MessageEvent) => {
        const data = e.data as { id: number; ok: boolean; result?: any; error?: string };
        if (data.id !== id) return;
        w.removeEventListener("message", onMessage);
        if (data.id !== reqId) return;
        if (data.ok && data.result) {
            store.update((s) => ({
                ...s,
                isConverting: false,
                jsonOutput: data.result.output,
                outputStatus: "converted",
                error: null,
            }));
        } else {
            store.update((s) => ({
                ...s,
                isConverting: false,
                inputStatus: "invalid",
                error: data.error ?? "Conversion failed.",
            }));
        }
    };

    w.addEventListener("message", onMessage);
    w.postMessage({
        id,
        xml: state.xmlInput,
        options: {
            includeAttributes: state.includeAttributes,
            preserveArrays: state.preserveArrays,
            indent: state.indent,
        },
    });
}

export function loadSample(store: Store<XmlToJsonState>): void {
    handleInput(store, SAMPLE_XML);
    convert(store);
}

export function clearAll(store: Store<XmlToJsonState>): void {
    reqId++;
    store.update((s) => ({
        ...s,
        xmlInput: "",
        jsonOutput: "",
        inputStatus: "empty",
        outputStatus: "empty",
        isConverting: false,
        error: null,
    }));
}

export function setIncludeAttributes(store: Store<XmlToJsonState>, value: boolean): void {
    store.update((s) => ({ ...s, includeAttributes: value }));
    if (store.get().inputStatus === "ready") convert(store);
}
export function setPreserveArrays(store: Store<XmlToJsonState>, value: boolean): void {
    store.update((s) => ({ ...s, preserveArrays: value }));
    if (store.get().inputStatus === "ready") convert(store);
}
export function setIndent(store: Store<XmlToJsonState>, indent: string | number): void {
    store.update((s) => ({ ...s, indent }));
    if (store.get().inputStatus === "ready") convert(store);
}