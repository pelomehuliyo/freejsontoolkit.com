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
import type { JsonToCsvState, Delimiter, ConversionProgress } from "./types";
import { convertInWorker } from "./jsonToCsvWorker";
import type { WorkerClientHandle } from "./workerProtocol";
import {
    LARGE_FILE_THRESHOLD,
    WARNING_THRESHOLD,
    MAX_INPUT_CHARS,
    PREVIEW_LENGTH,
    SAMPLE_JSON,
} from "./constants";

// ── Module-level reference to the current conversion handle ──
// Allows cancellation across multiple rapid conversions.
let currentWorkerHandle: WorkerClientHandle | null = null;

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
        conversionProgress: null,
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
 * The worker client handles the decision of whether to use a Web Worker.
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
        const proceed = confirm(
            `The JSON data is large (${(trimmed.length / 1024 / 1024).toFixed(1)} MB). Converting it might take a few seconds and consume memory. Do you want to proceed?`,
        );
        if (!proceed) return;
    }

    // Cancel any previous conversion that might still be running
    cancelCurrentConversion();

    // Reset state for new conversion
    store.update((s) => ({
        ...s,
        error: null,
        outputStatus: "generating",
        csvOutput: "",
        largeCsvContent: null,
        isConverting: true,
        isCancelling: false,
        conversionProgress: null,
    }));

    const options = {
        delimiter: state.delimiter,
        includeHeaders: state.includeHeaders,
        flatten: state.flatten,
    };

    try {
        const handle = convertInWorker(trimmed, options, (progress) => {
            // Update structured progress in store
            const conversionProgress: ConversionProgress = {
                stage: progress.stage,
                percentage: progress.percentage,
            };
            store.update((s) => ({
                ...s,
                conversionProgress,
            }));
        });

        // Store the handle for cancellation
        currentWorkerHandle = handle;

        const result = await handle.result;

        // Handle large output with preview
        if (result.csv.length > LARGE_FILE_THRESHOLD) {
            const preview =
                result.csv.substring(0, PREVIEW_LENGTH) +
                `\n\n... [Truncated: ${(result.csv.length - PREVIEW_LENGTH).toLocaleString()} more characters. Click Copy or Download to get the full CSV.]`;

            store.update((s) => ({
                ...s,
                csvOutput: preview,
                largeCsvContent: result.csv,
                outputStatus: "generated",
                isConverting: false,
                isCancelling: false,
                conversionProgress: null,
            }));
        } else {
            store.update((s) => ({
                ...s,
                csvOutput: result.csv,
                largeCsvContent: null,
                outputStatus: "generated",
                isConverting: false,
                isCancelling: false,
                conversionProgress: null,
            }));
        }

        currentWorkerHandle = null;
    } catch (err: any) {
        // Check if this was a cancellation
        const isCancel = err?.message?.includes("cancelled") || err?.message?.includes("Cancelled");

        store.update((s) => ({
            ...s,
            error: isCancel ? null : (err?.message || "Failed to convert JSON."),
            csvOutput: isCancel ? s.csvOutput : "",
            largeCsvContent: isCancel ? s.largeCsvContent : null,
            outputStatus: isCancel ? s.outputStatus : "empty",
            isConverting: false,
            isCancelling: false,
            conversionProgress: null,
        }));

        currentWorkerHandle = null;
    }
}

/**
 * Cancel the currently running conversion, if any.
 */
export function cancelConversion(store: Store<JsonToCsvState>): void {
    const state = store.get();
    if (!state.isConverting) return;

    store.update((s) => ({
        ...s,
        isCancelling: true,
    }));

    cancelCurrentConversion();
}

/**
 * Internal helper to cancel the current worker handle.
 */
function cancelCurrentConversion(): void {
    if (currentWorkerHandle) {
        currentWorkerHandle.cancel();
        currentWorkerHandle = null;
    }
}

// ── Sample / Clear ──

/** Load sample JSON data into the input */
export function loadSample(store: Store<JsonToCsvState>): void {
    handleInput(store, SAMPLE_JSON);
}

/** Reset all content and clear errors */
export function clearAll(store: Store<JsonToCsvState>): void {
    cancelCurrentConversion();

    store.update((s) => ({
        ...s,
        jsonInput: "",
        csvOutput: "",
        largeJsonContent: null,
        largeCsvContent: null,
        inputStatus: "empty",
        outputStatus: "empty",
        error: null,
        isConverting: false,
        isCancelling: false,
        conversionProgress: null,
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

