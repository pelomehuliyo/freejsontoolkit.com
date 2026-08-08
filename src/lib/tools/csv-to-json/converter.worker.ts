import { convertCsvToJson } from "./engine";
import type { ConvertOptions } from "./engine";
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

interface RecordRange {
  start: number;
  end: number;
}

/**
 * Locate the [start, end) spans of every complete top-level record in a JSON
 * array string. Brace/array depth and quoted-string state are tracked so a
 * record containing braces, brackets, or commas inside a value is never split.
 * The array's own "[" / "]" bracket the scan; only depth-1 objects are records.
 */
function findRecords(output: string): RecordRange[] {
  const ranges: RecordRange[] = [];
  let depth = 0;
  let inString = false;
  let escaped = false;
  let pendingStart = -1;

  for (let i = 0; i < output.length; i++) {
    const ch = output[i];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }
    if (ch === '"') {
      inString = true;
      continue;
    }
    if (ch === "{" || ch === "[") {
      const before = depth;
      depth++;
      if (before === 1 && pendingStart === -1) pendingStart = i;
      continue;
    }
    if (ch === "}" || ch === "]") {
      depth--;
      if (depth === 1 && pendingStart !== -1) {
        ranges.push({ start: pendingStart, end: i + 1 });
        pendingStart = -1;
      }
      continue;
    }
  }
  return ranges;
}

/**
 * Trim a full JSON array to a preview (≤ PREVIEW_CHARS) containing only WHOLE
 * records, re-wrapped as a valid array — never a mid-record cut. If even one
 * record cannot fit, `previewExceeded` is set (preview: "") so the UI shows a
 * clearly-marked fallback instead of a misleading empty array.
 */
function makePreview(output: string): {
  preview: string;
  rows: number;
  previewExceeded: boolean;
} {
  if (output.length <= PREVIEW_CHARS) {
    return { preview: output, rows: findRecords(output).length, previewExceeded: false };
  }
  const ranges = findRecords(output);
  const kept: string[] = [];
  let total = 1; // leading "["
  for (const r of ranges) {
    const record = output.slice(r.start, r.end);
    const separator = kept.length > 0 ? 1 : 0; // "," between records
    if (total + separator + record.length + 1 > PREVIEW_CHARS) break; // +1 trailing "]"
    total += separator + record.length;
    kept.push(record);
  }
  if (kept.length === 0) {
    return { preview: "", rows: 0, previewExceeded: true };
  }
  return { preview: "[" + kept.join(",") + "]", rows: kept.length, previewExceeded: false };
}

/**
 * Large-file path: the worker owns the read (off the main thread), runs ONE
 * single-pass conversion, and posts back the full result as a Blob (sent by
 * reference, not cloned) plus a capped preview of whole records and record
 * counts. Discrete phase ticks keep the UI honest — no fake continuous %.
 * Staleness is handled by the caller via the per-request `id`.
 */
async function handleLarge(req: LargeWorkerRequest): Promise<void> {
  const { id, file, options } = req;
  ctx.postMessage({ id, phase: "reading" });
  try {
    const text = await file.text();
    ctx.postMessage({ id, phase: "converting" });
    const result = convertCsvToJson(text, options);
    ctx.postMessage({ id, phase: "preparing" });

    const blob = new Blob([result.output], { type: "application/json;charset=utf-8" });
    const { preview, rows, previewExceeded } = makePreview(result.output);
    ctx.postMessage({
      id,
      phase: "done",
      ok: true,
      blob,
      preview,
      rows,
      totalRows: result.recordCount,
      previewExceeded,
      name: file.name,
    });
  } catch (err) {
    ctx.postMessage({
      id,
      phase: "done",
      ok: false,
      error: err instanceof Error ? err.message : "Failed to convert CSV.",
    });
  }
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
    const result = convertCsvToJson(req.input, req.options);
    ctx.postMessage({
      id,
      ok: true,
      output: result.output,
      recordCount: result.recordCount,
      outputChars: result.outputChars,
      delimiterUsed: result.delimiterUsed,
    });
  } catch (err) {
    ctx.postMessage({
      id,
      ok: false,
      error: err instanceof Error ? err.message : "Failed to convert CSV.",
    });
  }
};
