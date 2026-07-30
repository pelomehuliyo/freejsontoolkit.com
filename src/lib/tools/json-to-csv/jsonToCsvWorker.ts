/**
 * JSON→CSV Tool — Web Worker Client
 *
 * Typed communication layer between the page and the Web Worker.
 * Exposes a Promise-based API via WorkerClientHandle.
 *
 * Responsibilities:
 *   - Decide whether to use a worker based on input size
 *   - Create and manage the worker lifecycle
 *   - Correlate messages via requestId
 *   - Support cancellation with forced termination fallback
 *   - Timeout detection
 *
 * The page layer (actions.ts) calls this module unconditionally.
 * This module owns the "should I use a worker" decision.
 */

import { jsonToCsv } from "../../converter";
import type { WorkerClientHandle, WorkerClientResult, WorkerProgress } from "./workerProtocol";
import type { WorkerResponse } from "./workerProtocol";
import { USE_WORKER_ABOVE_CHARS, WORKER_TIMEOUT_MS, CANCELLATION_GRACE_MS } from "./constants";

// ── Internal counter for unique requestId generation ──
let requestIdCounter = 0;

function generateRequestId(): string {
  requestIdCounter += 1;
  return `j2c-${requestIdCounter}-${Date.now()}`;
}

// ── Worker Conversion Options ──

export interface WorkerConversionOptions {
  delimiter: string;
  includeHeaders: boolean;
  flatten: boolean;
}

// ── Public API ──

/**
 * Convert JSON string to CSV.
 *
 * For small inputs, conversion runs synchronously (avoids worker spin-up).
 * For large inputs, the Web Worker is used to keep the UI responsive.
 *
 * @param jsonStr    Raw JSON input string
 * @param options    Conversion options
 * @param onProgress Optional callback for structured progress events
 * @returns          A WorkerClientHandle with .result Promise and .cancel() method
 */
export function convertInWorker(
  jsonStr: string,
  options: WorkerConversionOptions,
  onProgress?: (progress: WorkerProgress) => void,
): WorkerClientHandle {
  const requestId = generateRequestId();

  // ── Synchronous path for small inputs ──
  if (jsonStr.length < USE_WORKER_ABOVE_CHARS) {
    // Report initial progress synchronously
    onProgress?.({ stage: "parsing" });

    try {
      const result = jsonToCsv(jsonStr, {
        delimiter: options.delimiter as "," | ";" | "\t",
        includeHeaders: options.includeHeaders,
        flatten: options.flatten,
      });

      onProgress?.({ stage: "complete" });

      return {
        result: Promise.resolve<WorkerClientResult>({ csv: result }),
        cancel: () => {
          // Synchronous path — no cancellation possible
        },
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Conversion failed";
      return {
        result: Promise.reject<WorkerClientResult>(new Error(message)),
        cancel: () => {
          // Synchronous path — no cancellation possible
        },
      };
    }
  }

  // ── Worker path for large inputs ──
  return createWorkerConversion(requestId, jsonStr, options, onProgress);
}

// ── Worker Path ──

function createWorkerConversion(
  requestId: string,
  jsonStr: string,
  options: WorkerConversionOptions,
  onProgress?: (progress: WorkerProgress) => void,
): WorkerClientHandle {
  let worker: Worker | null = null;
  let isCancelled = false;
  let isDone = false;

  // Create the promise
  const resultPromise = new Promise<WorkerClientResult>((resolve, reject) => {
    try {
      worker = new Worker(new URL("../../../workers/json-to-csv.worker.ts", import.meta.url), {
        type: "module",
      });
    } catch {
      reject(new Error("Failed to create conversion worker. Try a smaller input."));
      return;
    }

    // Timeout timer
    const timeoutId = setTimeout(() => {
      if (!isDone) {
        isDone = true;
        worker?.terminate();
        worker = null;
        reject(new Error("Conversion timed out. Try a smaller input."));
      }
    }, WORKER_TIMEOUT_MS);

    worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
      const response = e.data;

      // Ignore responses for a different requestId (stale messages)
      if (response.requestId !== requestId) return;

      switch (response.type) {
        case "progress":
          onProgress?.({
            stage: response.payload.stage,
            percentage: response.payload.percentage,
          });
          break;

        case "done":
          if (!isDone) {
            isDone = true;
            clearTimeout(timeoutId);
            worker?.terminate();
            worker = null;
            resolve({ csv: response.payload.csv });
          }
          break;

        case "error":
          if (!isDone) {
            isDone = true;
            clearTimeout(timeoutId);
            worker?.terminate();
            worker = null;
            reject(new Error(response.payload.message));
          }
          break;

        case "cancelled":
          if (!isDone) {
            isDone = true;
            clearTimeout(timeoutId);
            worker?.terminate();
            worker = null;
            reject(new Error("Conversion cancelled by user."));
          }
          break;
      }
    };

    worker.onerror = () => {
      if (!isDone) {
        isDone = true;
        clearTimeout(timeoutId);
        worker?.terminate();
        worker = null;
        reject(new Error("Conversion worker crashed. Try a smaller input."));
      }
    };

    // Send the conversion request
    worker.postMessage({
      type: "convert",
      requestId,
      payload: {
        jsonStr,
        options: {
          delimiter: options.delimiter,
          includeHeaders: options.includeHeaders,
          flatten: options.flatten,
        },
      },
    });
  });

  // ── Cancel function ──
  function cancel(): void {
    if (isDone || isCancelled) return;
    isCancelled = true;

    if (worker) {
      // Send cancel request with the same requestId
      worker.postMessage({
        type: "cancel",
        requestId,
      });

      // Force-terminate after grace period if worker doesn't respond
      setTimeout(() => {
        if (!isDone && worker) {
          isDone = true;
          worker.terminate();
          worker = null;
        }
      }, CANCELLATION_GRACE_MS);
    }
  }

  return {
    result: resultPromise,
    cancel,
  };
}
