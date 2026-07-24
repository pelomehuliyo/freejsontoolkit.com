/**
 * JSON→CSV Tool — Actions
 *
 * Pure business logic operating exclusively on the store.
 * No DOM queries, no HTML IDs, no component knowledge.
 *
 * Each action:
 *   1. Reads current state from the store
 *   2. Performs computation / calls the CSV engine or worker
 *   3. Writes updated state back to the store
 */

import type { Store } from "../../state/toolStore";
import type { JsonToCsvState, Delimiter } from "./types";
import { jsonToCsv } from "../../converter";
import { convertInWorker } from "./jsonToCsvWorker";
import {
    LARGE_FILE_THRESHOLD,
    WARNING_THRESHOLD,
    MAX_INPUT_CHARS,
    USE_WORKER_ABOVE_CHARS,
    PREVIEW_LENGTH,
    SAMPLE_JSON,
} from "./constants";

// ── Input Handling ──

/**
 * Process raw input text (from paste, file upload, or direct typing).
 * Handles large file detection, preview truncation, and validation.
 */
export function handleInput(store: Store<JsonToCsvState>, text: string): void {
    const state = store.get();

    // Clear previous output on new input
    const base: Partial<JsonToCsvState> = {
        csvOutput: "",
        largeCsvContent: null,
        outputStatus: "empty",
        error: null,
    };

    if (!text.trim()) {
        store.set({
            ...state,
            ...base,
            jsonInput: text,
            largeJsonContent: null,
            inputStatus: "empty",
        });
        return;
    }

    if (text.length > MAX_INPUT_CHARS) {
        store.set({
            ...state,
            ...base,
            jsonInput: text.substring(0, PREVIEW_LENGTH),
            largeJsonContent: text,
            inputStatus: "invalid",
            error: `Input too large (${text.length.toLocaleString()} chars). To keep the page responsive, limit is ${MAX_INPUT_CHARS.toLocaleString()} chars.`,
        });
        return;
    }

    if (text.length > LARGE_FILE_THRESHOLD) {
        // Large file: show preview, store full text
        const preview =
            text.substring(0, PREVIEW_LENGTH) +
            `\n\n... [Truncated: ${(text.length - PREVIEW_LENGTH).toLocaleString()} more characters. Click Convert to process the entire file.]`;

        store.set({
            ...state,
            ...base,
            jsonInput: preview,
            largeJsonContent: text,
            inputStatus: "large-file-loaded",
        });
        return;
    }

    // Normal-size input
    store.set({
        ...state,
        ...base,
        jsonInput: text,
        largeJsonContent: null,
        inputStatus: text.trim() ? "ready" : "empty",
    });
}

// ── Conversion ──

/**
 * Run the JSON→CSV conversion using the current store settings.
 * Automatically uses the Web Worker for large inputs.
 */
export async function convertJsonToCsv(store: Store<JsonToCsvState>): Promise<void> {
    const state = store.get();

    const input = state.largeJsonContent ?? state.jsonInput;
    const trimmed = input.trim();

    if (!trimmed) {
        store.update((s) => ({ ...s, error: "Please paste or load JSON first." }));
        return;
    }

    // Warn before processing extremely large files
    if (trimmed.length > WARNING_THRESHOLD) {
        // Note: confirm() is a browser API — this is the one acceptable side-effect
        // since it blocks user interaction by design.
        const proceed = confirm(
            `The JSON data is large (${(trimmed.length / 1024 / 1024).toFixed(1)} MB). Converting it might take a few seconds and consume memory. Do you want to proceed?`,
        );
        if (!proceed) return;
    }

    store.update((s) => ({
        ...s,
        error: null,
        outputStatus: "generating",
        csvOutput: "",
        largeCsvContent: null,
    }));

    const options = {
        delimiter: state.delimiter,
        includeHeaders: state.includeHeaders,
        flatten: state.flatten,
    };

    try {
        let result: string;

        if (trimmed.length < USE_WORKER_ABOVE_CHARS) {
            // Synchronous path (small input)
            result = jsonToCsv(trimmed, options);
        } else {
            // Worker path (large input)
            result = await convertInWorker(trimmed, options, (step) => {
                store.update((s) => ({
                    ...s,
                    csvStatus: step === "start" ? "Converting JSON… (parsing)" : `Converting JSON… (${step})`,
                }));
            });
        }

        // Handle large output with preview
        if (result.length > LARGE_FILE_THRESHOLD) {
            const preview =
                result.substring(0, PREVIEW_LENGTH) +
                `\n\n... [Truncated: ${(result.length - PREVIEW_LENGTH).toLocaleString()} more characters. Click Copy or Download to get the full CSV.]`;

            store.update((s) => ({
                ...s,
                csvOutput: preview,
                largeCsvContent: result,
                outputStatus: "generated",
            }));
        } else {
            store.update((s) => ({
                ...s,
                csvOutput: result,
                largeCsvContent: null,
                outputStatus: "generated",
            }));
        }
    } catch (err: any) {
        store.update((s) => ({
            ...s,
            error: err?.message || "Failed to convert JSON.",
            csvOutput: "",
            largeCsvContent: null,
            outputStatus: "empty",
        }));
    }
}

// ── Sample / Clear ──

/** Load sample JSON data into the input */
export function loadSample(store: Store<JsonToCsvState>): void {
    handleInput(store, SAMPLE_JSON);
}

/** Reset all content and clear errors */
export function clearAll(store: Store<JsonToCsvState>): void {
    store.update((s) => ({
        ...s,
        jsonInput: "",
        csvOutput: "",
        largeJsonContent: null,
        largeCsvContent: null,
        inputStatus: "empty",
        outputStatus: "empty",
        error: null,
    }));
}

// ── Clipboard / Download ──

/**
 * Copy CSV output to clipboard.
 * @returns true if copy was successful, false otherwise
 */
export async function copyCsv(store: Store<JsonToCsvState>): Promise<boolean> {
    const state = store.get();
    const csv = state.largeCsvContent ?? state.csvOutput;
    if (!csv) return false;

    try {
        await navigator.clipboard.writeText(csv);
        return true;
    } catch {
        return false;
    }
}

/**
 * Trigger a CSV file download in the browser.
 */
export function downloadCsv(store: Store<JsonToCsvState>): void {
    const state = store.get();
    const csv = state.largeCsvContent ?? state.csvOutput;
    if (!csv) return;

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "data.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// ── Settings Mutators ──

export function setDelimiter(
    store: Store<JsonToCsvState>,
    value: Delimiter,
): void {
    store.update((s) => ({ ...s, delimiter: value }));
}

export function setFlatten(store: Store<JsonToCsvState>, value: boolean): void {
    store.update((s) => ({ ...s, flatten: value }));
}

export function setIncludeHeaders(
    store: Store<JsonToCsvState>,
    value: boolean,
): void {
    store.update((s) => ({ ...s, includeHeaders: value }));
}

