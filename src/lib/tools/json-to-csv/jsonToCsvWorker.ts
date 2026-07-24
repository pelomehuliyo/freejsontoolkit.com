/**
 * JSON→CSV Tool — Web Worker Client
 *
 * Isolates all Worker construction and message-passing logic.
 * Exposes a Promise-based API that actions.ts calls.
 *
 * Threshold decision (whether to use worker) is made by the caller.
 * This module only knows how to communicate with the worker.
 */

import { WORKER_STEPS } from "./constants";

/** Options that mirror ConversionOptions from the CSV engine */
export interface WorkerConversionOptions {
    delimiter: string;
    includeHeaders: boolean;
    flatten: boolean;
}

/** Progress callback invoked during conversion */
export interface WorkerProgressCallback {
    (step: string, detail?: string): void;
}

/**
 * Converts JSON string to CSV using the dedicated Web Worker.
 *
 * @param jsonStr  Raw JSON input string
 * @param options  Conversion options
 * @param onProgress  Optional progress callback (called during conversion)
 * @returns  Promise resolving to the CSV output string
 * @throws  If the worker crashes or returns an error
 */
export function convertInWorker(
    jsonStr: string,
    options: WorkerConversionOptions,
    onProgress?: WorkerProgressCallback,
): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        let worker: Worker | null = null;

        try {
            worker = new Worker(
                new URL("../../../workers/json-to-csv.worker.ts", import.meta.url),
                { type: "module" },
            );
        } catch (err) {
            reject(new Error("Failed to create conversion worker. Try a smaller input."));
            return;
        }

        const timeoutId = setTimeout(() => {
            worker?.terminate();
            reject(new Error("Conversion timed out. Try a smaller input."));
        }, 60_000);

        worker.onmessage = (e: MessageEvent) => {
            const data = e.data;
            if (!data) return;

            if (data.type === "progress") {
                onProgress?.(data.payload?.step || "", data.payload?.detail || "");
                return;
            }

            if (data.type === "done") {
                clearTimeout(timeoutId);
                worker?.terminate();
                resolve(data.payload?.result || "");
                return;
            }

            if (data.type === "error") {
                clearTimeout(timeoutId);
                worker?.terminate();
                reject(new Error(data.payload?.message || "Conversion failed."));
                return;
            }
        };

        worker.onerror = () => {
            clearTimeout(timeoutId);
            worker?.terminate();
            reject(new Error("Conversion worker crashed. Try a smaller input."));
        };

        worker.postMessage({
            type: "convert",
            payload: {
                jsonStr,
                options,
            },
        });
    });
}

