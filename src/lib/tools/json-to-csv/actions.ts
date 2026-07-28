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
 *
 * ── Cancellation model (read this before touching cancel logic) ──────────
 * A conversion can run on a Web Worker. Cancelling it kills / signals that
 * worker, but a killed worker may NEVER settle the outstanding result
 * promise — which used to leave the UI stuck on "Cancelling…" forever,
 * because the only code that cleared the flags lived behind that promise.
 *
 * The rule we now enforce: a cancel MUST always resolve the UI, to either
 * "cancelled" or an honest "could not cancel cleanly", within a bounded
 * time. We guarantee this with three cooperating mechanisms:
 *
 *   1. conversionRunId  — a counter bumped on every start AND every cancel.
 *      Every store write checks "am I still the current run?" (isStale())
 *      and no-ops if not. This turns late messages from dead/old
 *      conversions into harmless ghosts, and stops an old conversion from
 *      clobbering a freshly started one.
 *   2. Self-finishing cancel — cancelConversion attaches its OWN listener
 *      to the worker's result promise, so a clean cancel flips the flags
 *      back to idle immediately, without depending on convertJsonToCsv.
 *   3. The watchdog — a short timer started on cancel. If the worker never
 *      acknowledges (the dead-worker case), the timer force-resets the UI
 *      and shows an honest "abandoned" notice. This is the hard ceiling
 *      that makes "stuck forever" structurally impossible.
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
import type { ConfirmDelegate } from "./types";

// ── Module-level reference to the current conversion handle ──
// Allows cancellation across multiple rapid conversions.
let currentWorkerHandle: WorkerClientHandle | null = null;

// ── Run counter for the stale-write guard (see header comment) ──
let conversionRunId = 0;

// ── Hard ceiling for a cancel that the worker never acknowledges ──
const CANCEL_TIMEOUT_MS = 2000;

// ── Input Handling ──

/**
 * Process raw input text (from paste, file upload, or direct typing).
 * Handles large file detection, preview truncation, and validation.
 */
export function handleInput(store: Store<JsonToCsvState>, text: string): void {
    const state = store.get();

    // Clear previous output on new input.
    // NOTE: outputNotice / isPreview are cleared here too, so a stale
    // "Conversion cancelled." banner doesn't linger once you start typing
    // fresh JSON.
    const base: Partial<JsonToCsvState> = {
        csvOutput: "",
        largeCsvContent: null,
        outputStatus: "empty",
        outputNotice: null,
        isPreview: false,
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
            error: "Input too large (" + text.length.toLocaleString() + " chars). To keep the page responsive, limit is " + MAX_INPUT_CHARS.toLocaleString() + " chars.",
        });
        return;
    }

    if (text.length > LARGE_FILE_THRESHOLD) {
        // Large file: show preview, store full text
        const preview =
            text.substring(0, PREVIEW_LENGTH) +
            "\n\n... [Truncated: " + (text.length - PREVIEW_LENGTH).toLocaleString() + " more characters. Click Convert to process the entire file.]";

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
 * Run the JSON->CSV conversion using the current store settings.
 * The worker client handles the decision of whether to use a Web Worker.
 *
 * @param store     — The tool store
 * @param onConfirm — Optional callback for user confirmation prompts (e.g. large file warning).
 *                    Return true to proceed, false to cancel.
 */
export async function convertJsonToCsv(
    store: Store<JsonToCsvState>,
    onConfirm?: ConfirmDelegate,
): Promise<void> {
    const state = store.get();

    const input = state.largeJsonContent ?? state.jsonInput;
    const trimmed = input.trim();

    if (!trimmed) {
        store.update((s) => ({ ...s, error: "Please paste or load JSON first." }));
        return;
    }

    // Warn before processing extremely large files (delegated to caller via onConfirm)
    if (trimmed.length > WARNING_THRESHOLD) {
        const msg =
            "The JSON data is large (" + (trimmed.length / 1024 / 1024).toFixed(1) + " MB). Converting it might take a few seconds and consume memory. Do you want to proceed?";
        const confirmed = onConfirm ? onConfirm(msg) : window.confirm(msg);
        if (!confirmed) return;
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
        outputNotice: null,
        isPreview: false,
        isConverting: true,
        isCancelling: false,
        conversionProgress: null,
    }));

    // ── Claim this run. Any older in-flight conversion now reads as stale
    //    and will silently drop its writes (see isStale below). ──
    const myRunId = ++conversionRunId;
    const isStale = () => myRunId !== conversionRunId;

    const options = {
        delimiter: state.delimiter,
        includeHeaders: state.includeHeaders,
        flatten: state.flatten,
    };

    let handle: WorkerClientHandle | null = null;

    try {
        handle = convertInWorker(trimmed, options, (progress) => {
            // A cancel (or a newer conversion) may have started since we
            // began; if so, ignore late progress ticks.
            if (isStale()) return;
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

        // If we were cancelled / superseded while awaiting, do NOT touch the
        // store — the cancel path (or the newer conversion) now owns the UI.
        if (isStale()) {
            if (currentWorkerHandle === handle) currentWorkerHandle = null;
            return;
        }

        // Determine output notice and preview state
        let outputNotice: string | null = null;
        let isPreview = false;

        // Empty array result - no CSV rows generated
        if (result.csv.length === 0 && trimmed.length > 0) {
            outputNotice = "The JSON array was empty - no CSV rows were generated.";
        }

        // Handle large output with external preview banner (no in-content truncation text)
        if (result.csv.length > LARGE_FILE_THRESHOLD) {
            const preview = result.csv.substring(0, PREVIEW_LENGTH);
            outputNotice = "Large output: showing first " + PREVIEW_LENGTH.toLocaleString() + " of " + result.csv.length.toLocaleString() + " characters. Use Copy or Download to get the full CSV.";
            isPreview = true;

            store.update((s) => ({
                ...s,
                csvOutput: preview,
                largeCsvContent: result.csv,
                outputStatus: "generated",
                outputNotice,
                isPreview,
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
                outputNotice,
                isPreview,
                isConverting: false,
                isCancelling: false,
                conversionProgress: null,
            }));
        }

        if (currentWorkerHandle === handle) currentWorkerHandle = null;
    } catch (err: any) {
        // If this run was cancelled / superseded, the cancel path already
        // finalised the UI — don't overwrite it with our error/empty state.
        if (isStale()) {
            if (handle && currentWorkerHandle === handle) currentWorkerHandle = null;
            return;
        }

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

        if (handle && currentWorkerHandle === handle) currentWorkerHandle = null;
    }
}

/**
 * Cancel the currently running conversion, if any.
 *
 * This function OWNS the off-switch for the "Cancelling…" state:
 *   - it asks the worker to stop,
 *   - it invalidates the in-flight run (so its late writes are ignored),
 *   - it finalises the UI the moment the worker acknowledges the cancel,
 *   - and it arms a watchdog that force-finalises the UI if the worker
 *     never responds — so the button can NEVER stay on "Cancelling…"
 *     forever. Bounded time, guaranteed.
 */
export function cancelConversion(store: Store<JsonToCsvState>): void {
    const state = store.get();
    if (!state.isConverting) return;

    // Light the "Cancelling…" flag so the UI reflects intent immediately.
    store.update((s) => ({ ...s, isCancelling: true }));

    // Grab the handle, then invalidate the run + ask the worker to stop.
    const handle = currentWorkerHandle;
    const myCancelRunId = ++conversionRunId; // old conversion's writes now no-op
    if (handle) {
        try {
            handle.cancel();
        } catch {
            /* worker may already be dead — that's fine, the watchdog covers us */
        }
    }
    currentWorkerHandle = null;

    // The single, idempotent place that turns the "Cancelling…" light OFF.
    let finalized = false;
    const finalize = (clean: boolean): void => {
        if (finalized) return;
        // If a brand-new conversion has started since we cancelled, it now
        // owns the UI — we must not clobber it. The run counter tells us.
        if (conversionRunId !== myCancelRunId) return;
        finalized = true;

        const s = store.get();
        // Already idle (e.g. clearAll ran) — nothing to do.
        if (!s.isCancelling && !s.isConverting) return;

        const hasOutput = !!(s.csvOutput || s.largeCsvContent);
        store.update((prev) => ({
            ...prev,
            isConverting: false,
            isCancelling: false,
            conversionProgress: null,
            outputStatus: hasOutput ? "generated" : "empty",
            error: null,
            outputNotice: clean
                ? hasOutput
                    ? "Conversion cancelled — partial output kept."
                    : "Conversion cancelled."
                : "Conversion stopped — the background task did not respond to cancel in time, so it was abandoned.",
        }));
    };

    if (
        handle &&
        handle.result &&
        typeof (handle.result as unknown as { then?: unknown }).then === "function"
    ) {
        // Good path: worker acknowledges the cancel -> promise settles ->
        // finalise right away (clean = true).
        (handle.result as Promise<unknown>).then(
            () => finalize(true),
            () => finalize(true),
        );
        // Watchdog: the hard guarantee. If the promise never settles (the
        // dead-worker case that used to hang forever), force-finalise with
        // an honest "abandoned" notice after the bounded timeout.
        setTimeout(() => finalize(false), CANCEL_TIMEOUT_MS);
    } else {
        // No handle / no promise to wait on — nothing is actually running
        // in the background, so resolve immediately.
        finalize(true);
    }
}

/**
 * Internal helper to cancel the current worker handle WITHOUT touching the
 * store. Used at the *start* of a new conversion and by clearAll(), where
 * the caller is about to overwrite the state itself and just needs the old
 * worker to die. (Bumping conversionRunId here would be wrong: the caller
 * controls the run counter for its own purposes.)
 */
function cancelCurrentConversion(): void {
    if (currentWorkerHandle) {
        try {
            currentWorkerHandle.cancel();
        } catch {
            /* ignore — best effort */
        }
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
    // Invalidate any in-flight conversion so its late writes can't repopulate
    // the fields we're about to wipe.
    conversionRunId++;

    store.update((s) => ({
        ...s,
        jsonInput: "",
        csvOutput: "",
        largeJsonContent: null,
        largeCsvContent: null,
        inputStatus: "empty",
        outputStatus: "empty",
        outputNotice: null,
        isPreview: false,
        error: null,
        isConverting: false,
        isCancelling: false,
        conversionProgress: null,
    }));
}

// ── Data Accessor (pure state, no browser APIs) ──

/**
 * Resolve the actual CSV content (full version if large, preview otherwise).
 * Returns null if no output exists.
 */
export function getCsvContent(store: Store<JsonToCsvState>): string | null {
    const state = store.get();
    return state.largeCsvContent ?? state.csvOutput ?? null;
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