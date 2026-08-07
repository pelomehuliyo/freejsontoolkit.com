import { convertTsvToCsv } from "./engine";
import { PREVIEW_CHARS } from "./constants";

const ctx = self as unknown as {
  onmessage: ((e: MessageEvent) => void) | null;
  postMessage: (msg: unknown) => void;
};

interface WorkerRequest {
  id: number;
  input: string;
}

interface LargeWorkerRequest {
  id: number;
  kind: "large";
  file: File;
}

type Incoming = WorkerRequest | LargeWorkerRequest;

/**
 * Trim a full CSV result to a preview (≤ PREVIEW_CHARS) cut at the last newline,
 * so the viewer never sees a truncated final row. CSV fields may contain
 * embedded newlines (quoted), so a "complete row" cut is best-effort for the
 * capped preview only — the Blob download remains the source of truth.
 */
function makePreview(output: string): string {
  if (output.length <= PREVIEW_CHARS) return output;
  const cut = output.slice(0, PREVIEW_CHARS);
  const lastNl = cut.lastIndexOf("\n");
  return lastNl === -1 ? cut : cut.slice(0, lastNl + 1);
}

/**
 * Large-file path: the worker owns the read (off the main thread), runs ONE
 * single-pass conversion, and posts back the full result as a Blob (sent by
 * reference, not cloned) plus a capped preview and row/col counts. Column count
 * comes from the engine result (the parsed grid's header width) — never from
 * comma-splitting CSV output, which a quoted comma would inflate. Discrete
 * phase ticks keep the UI honest — no fake continuous %. Staleness is handled
 * by the caller via the per-request `id`.
 */
async function handleLarge(req: LargeWorkerRequest): Promise<void> {
  const { id, file } = req;
  ctx.postMessage({ id, phase: "reading" });
  const text = await file.text();
  ctx.postMessage({ id, phase: "converting" });
  const result = convertTsvToCsv(text);
  result.authoritative = true;
  ctx.postMessage({ id, phase: "preparing" });

  if (!result.ok) {
    ctx.postMessage({
      id,
      phase: "done",
      ok: false,
      error: result.error?.message ?? "Conversion failed.",
      rows: 0,
      cols: 0,
    });
    return;
  }

  const blob = new Blob([result.output], { type: "text/csv;charset=utf-8" });
  ctx.postMessage({
    id,
    phase: "done",
    ok: true,
    blob,
    preview: makePreview(result.output),
    rows: result.rowCount,
    cols: result.colCount,
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
    const result = convertTsvToCsv(req.input);
    result.authoritative = true;
    ctx.postMessage({ id, ok: true, result });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Conversion failed unexpectedly.";
    ctx.postMessage({ id, ok: false, error: msg });
  }
};
