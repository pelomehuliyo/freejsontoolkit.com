/**
 * JSON→CSV Tool — Web Worker
 *
 * Orchestrates JSON→CSV conversion using the shared CSV engine.
 * Communicates with the main thread via the typed WorkerProtocol.
 *
 * Lifecycle:
 *   1. Receives ConvertRequest with requestId + payload
 *   2. Reports progress at each stage boundary
 *   3. Checks cancellation flag after each stage
 *   4. Sends DoneResponse / ErrorResponse / CancelledResponse
 *   5. Terminates cleanly
 */

import { convertJsonToCsv } from "../lib/csv/converter";
import type {
  WorkerRequest,
  ProgressResponse,
  DoneResponse,
  ErrorResponse,
  CancelledResponse,
} from "../lib/tools/json-to-csv/workerProtocol";

// ── State ──

/** Set of requestIds that have been cancelled by the main thread */
const cancelledRequests = new Set<string>();

// ── Message Handler ──

self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const message = event.data;

  switch (message.type) {
    case "convert":
      handleConvert(message);
      break;
    case "cancel":
      handleCancel(message);
      break;
    default:
      // Unknown message type — ignore
      break;
  }
};

// ── Convert Handler ──

async function handleConvert(request: WorkerRequest & { type: "convert" }): Promise<void> {
  const { requestId, payload } = request;
  const { jsonStr, options } = payload;

  try {
    // ── Stage 1: Parsing ──
    if (cancelledRequests.has(requestId)) {
      sendCancelled(requestId);
      cancelledRequests.delete(requestId);
      return;
    }
    sendProgress(requestId, "parsing");

    // validate JSON and parse into records (inside convertJsonToCsv)
    // We separate parsing from formatting by doing a quick validation parse first
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonStr.trim());
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to parse JSON";
      sendError(requestId, `Invalid JSON syntax: ${msg}`);
      return;
    }

    if (!Array.isArray(parsed)) {
      sendError(requestId, "JSON must be an array of objects");
      return;
    }

    if (parsed.length === 0) {
      sendDone(requestId, "");
      return;
    }

    // ── Stage 2: Flattening & Formatting ──
    if (cancelledRequests.has(requestId)) {
      sendCancelled(requestId);
      cancelledRequests.delete(requestId);
      return;
    }
    sendProgress(requestId, "flattening");

    // ── Stage 3: Formatting ──
    if (cancelledRequests.has(requestId)) {
      sendCancelled(requestId);
      cancelledRequests.delete(requestId);
      return;
    }
    sendProgress(requestId, "formatting");

    // Run the actual conversion using the shared CSV engine
    const csv = convertJsonToCsv(jsonStr, {
      delimiter: options.delimiter as "," | ";" | "\t",
      includeHeaders: options.includeHeaders,
      flatten: options.flatten,
    });

    // Check cancellation one more time before sending result
    if (cancelledRequests.has(requestId)) {
      sendCancelled(requestId);
      cancelledRequests.delete(requestId);
      return;
    }

    sendProgress(requestId, "complete");
    sendDone(requestId, csv);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Conversion failed";
    sendError(requestId, message);
  }
}

// ── Cancel Handler ──

function handleCancel(request: WorkerRequest & { type: "cancel" }): void {
  cancelledRequests.add(request.requestId);
}

// ── Message Senders ──

function sendProgress(requestId: string, stage: ProgressResponse["payload"]["stage"]): void {
  const response: ProgressResponse = {
    type: "progress",
    requestId,
    payload: { stage },
  };
  self.postMessage(response);
}

function sendDone(requestId: string, csv: string): void {
  const response: DoneResponse = {
    type: "done",
    requestId,
    payload: { csv },
  };
  self.postMessage(response);
}

function sendError(requestId: string, message: string): void {
  const response: ErrorResponse = {
    type: "error",
    requestId,
    payload: { message },
  };
  self.postMessage(response);
}

function sendCancelled(requestId: string): void {
  const response: CancelledResponse = {
    type: "cancelled",
    requestId,
  };
  self.postMessage(response);
}

