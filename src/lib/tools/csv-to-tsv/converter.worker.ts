import { convertCsvToTsv } from "./engine";
import type { ConvertOptions } from "./types";
import { PREVIEW_CHARS } from "./constants";

const ctx = self as unknown as {
  onmessage: ((e: MessageEvent) => void) | null;
  postMessage: (msg: unknown) => void;
};

interface WorkerRequest {
  id: number;
  input: string;
  options: ConvertOptions;
}

interface LargeWorkerRequest {
  id: number;
  kind: "large";
  file: File;
  options: ConvertOptions;
}

type Incoming = WorkerRequest | LargeWorkerRequest;

/**
 * Trim a full TSV result to a preview (≤ PREVIEW_CHARS) cut at the LAST complete
 * row, so the viewer never sees a truncated final line.
 */
function makePreview(output: string): string {
  if (output.length <= PREVIEW_CHARS) return output;
  const cut = output.slice(0, PREVIEW_CHARS);
  const lastNl = cut.lastIndexOf("\n");
  return lastNl === -1 ? cut : cut.slice(0, lastNl + 1);
}

/** Count columns from the first row of TSV output (tab-delimited). */
function countColumns(output: string): number {
  const nl = output.indexOf("\n");
  const first = nl === -1 ? output : output.slice(0, nl);
  return first.split("\t").length;
}

/**
 * Large-file path: the worker owns the read (off the main thread), runs ONE
 * single-pass conversion, and posts back the full result as a Blob (sent by
 * reference, not cloned) plus a capped preview and row/col counts. Discrete
 * phase ticks keep the UI honest — no fake continuous %. Staleness is handled
 * by the caller via the per-request `id`.
 */
async function handleLarge(req: LargeWorkerRequest): Promise<void> {
  const { id, file, options } = req;
  ctx.postMessage({ id, phase: "reading" });
  const text = await file.text();
  ctx.postMessage({ id, phase: "converting" });
  const result = convertCsvToTsv(text, options);
  result.authoritative = true;
  ctx.postMessage({ id, phase: "preparing" });

  if (!result.ok) {
    ctx.postMessage({
      id,
      phase: "done",
      ok: false,
      error: result.error?.message ?? "Conversion failed. Check the CSV and try again.",
      rows: 0,
      cols: 0,
    });
    return;
  }

  const blob = new Blob([result.output], {
    type: "text/tab-separated-values;charset=utf-8",
  });
  ctx.postMessage({
    id,
    phase: "done",
    ok: true,
    blob,
    preview: makePreview(result.output),
    rows: result.rowCount,
    cols: countColumns(result.output),
    name: file.name,
  });
}

ctx.onmessage = (e: MessageEvent) => {
  const message = e.data as Incoming;
  const { id } = message;
  if ("kind" in message && message.kind === "large") {
    void handleLarge(message as LargeWorkerRequest);
    return;
  }
  const req = message as WorkerRequest;
  try {
    const result = convertCsvToTsv(req.input, req.options);
    result.authoritative = true;
    ctx.postMessage({ id, ok: true, result });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Conversion failed unexpectedly. Check the CSV and try again.";
    ctx.postMessage({ id, ok: false, error: msg });
  }
};
