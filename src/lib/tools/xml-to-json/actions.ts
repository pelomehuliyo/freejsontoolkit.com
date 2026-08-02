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

/**
 * Validate XML using DOMParser (main thread only).
 * Strips BOM and returns a detailed error message with line/column if available.
 */
function validateXml(xml: string): { valid: boolean; error?: string; line?: number; column?: number } {
    // Strip UTF-8 BOM if present
    const cleanXml = xml.replace(/^\uFEFF/, "");
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(cleanXml, "text/xml");
        const errorNode = doc.querySelector("parsererror");
        if (errorNode) {
            const msg = errorNode.textContent || "Invalid XML";
            const match = msg.match(/line\s+(\d+)\s*,\s*column\s+(\d+)/i);
            if (match) {
                return {
                    valid: false,
                    error: msg,
                    line: parseInt(match[1], 10),
                    column: parseInt(match[2], 10),
                };
            }
            return { valid: false, error: msg };
        }
        return { valid: true };
    } catch (e) {
        return {
            valid: false,
            error: e instanceof Error ? e.message : "Invalid XML",
        };
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

    const result = validateXml(text);
    if (!result.valid) {
        let errMsg = result.error || "Invalid XML";
        if (result.line && result.column) {
            errMsg = `Invalid XML at line ${result.line}, column ${result.column}`;
        } else if (!errMsg.includes("line")) {
            errMsg = `Invalid XML: ${errMsg}`;
        }
        store.set({
            ...state,
            xmlInput: text,
            inputStatus: "invalid",
            error: errMsg,
        });
        return;
    }

    store.set({
        ...state,
        xmlInput: text,
        inputStatus: "ready",
        error: null,
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
        // error already set – just announce it
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

/** Load sample – does NOT auto‑convert. User must click Convert. */
export function loadSample(store: Store<XmlToJsonState>): void {
    handleInput(store, SAMPLE_XML);
    // intentionally no convert() – wait for user click
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

/** Option changes – only update state, do NOT auto‑convert */
export function setIncludeAttributes(store: Store<XmlToJsonState>, value: boolean): void {
    store.update((s) => ({ ...s, includeAttributes: value }));
}
export function setPreserveArrays(store: Store<XmlToJsonState>, value: boolean): void {
    store.update((s) => ({ ...s, preserveArrays: value }));
}
export function setIndent(store: Store<XmlToJsonState>, indent: string | number): void {
    store.update((s) => ({ ...s, indent }));
}