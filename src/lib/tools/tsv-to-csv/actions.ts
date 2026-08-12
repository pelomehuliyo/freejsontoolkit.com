import type { Store } from "../../state/toolStore";
import type { TsvToCsvState, ConvertResult } from "./types";
import { convertTsvToCsv } from "./engine";
import { LIVE_CONVERT_THRESHOLD, MAX_INPUT_CHARS, SAMPLE_TSV } from "./constants";

// ── Worker management: big-table conversion off the main thread ──
let worker: Worker | null = null;
let reqId = 0;

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL("./converter.worker.ts", import.meta.url), { type: "module" });
  }
  return worker;
}

/** As-you-type conversion (main thread, capped). Updates the input status bar
 *  but NEVER the output box — output only changes on the explicit Convert. */
export function handleInput(store: Store<TsvToCsvState>, text: string): void {
  reqId++;
  const state = store.get();
  if (!text.trim()) {
    store.set({
      ...state,
      tsvInput: text,
      result: null,
      inputStatus: "empty",
      outputStatus: "empty",
      isConverting: false,
      error: null,
    });
    return;
  }
  if (text.length > MAX_INPUT_CHARS) {
    store.set({
      ...state,
      tsvInput: text,
      result: null,
      inputStatus: "ready",
      outputStatus: "empty",
      isConverting: false,
      error:
        "Input too large (" +
        text.length.toLocaleString() +
        " chars). Limit is " +
        MAX_INPUT_CHARS.toLocaleString() +
        ".",
    });
    return;
  }
  if (text.length > LIVE_CONVERT_THRESHOLD) {
    store.set({ ...state, tsvInput: text, inputStatus: "ready", error: null });
    return;
  }
  const live = convertTsvToCsv(text);
  live.authoritative = false;
  store.set({ ...state, tsvInput: text, result: live, inputStatus: "ready", error: null });
}

/** The explicit Convert — runs in the worker, drives the output editor. */
export function convert(store: Store<TsvToCsvState>): void {
  const state = store.get();
  if (state.isConverting) return;
  if (!state.tsvInput.trim()) {
    store.update((s) => ({ ...s, error: "Nothing to convert yet. Add TSV to the input box, then press Convert." }));
    return;
  }
  const id = ++reqId;
  store.update((s) => ({ ...s, isConverting: true, error: null }));
  const w = getWorker();
  const onMessage = (e: MessageEvent) => {
    const data = e.data as { id: number; ok: boolean; result?: ConvertResult; error?: string };
    if (data.id !== id) return;
    w.removeEventListener("message", onMessage);
    if (data.id !== reqId) return; // superseded by newer input
    if (data.ok && data.result) {
      const result = data.result;
      result.authoritative = true;
      store.update((s) => ({
        ...s,
        isConverting: false,
        result,
        inputStatus: "ready",
        outputStatus: result.ok ? "converted" : "invalid",
        error: null,
      }));
    } else {
      store.update((s) => ({
        ...s,
        isConverting: false,
        error: data.error ?? "Conversion failed. The TSV could not be converted. Check the input and try again.",
      }));
    }
  };
  w.addEventListener("message", onMessage);
  w.postMessage({ id, input: state.tsvInput });
}

export function loadSample(store: Store<TsvToCsvState>): void {
  // Load only — never auto-run. The user clicks Convert explicitly.
  handleInput(store, SAMPLE_TSV);
}

export function clearAll(store: Store<TsvToCsvState>): void {
  reqId++;
  store.update((s) => ({
    ...s,
    tsvInput: "",
    result: null,
    inputStatus: "empty",
    outputStatus: "empty",
    isConverting: false,
    error: null,
  }));
}

// ── Large-file mode (interim): worker owns read + single-pass convert ──
// The result is a Blob (full file, download-only) plus a capped preview for the
// editor. Each dispatch gets its own reqId so a second dropped file supersedes
// the first (staleness guard). The Blob is kept in state until a fresh
// conversion replaces it or the mode is cleared; an object URL is created
// only at download time so no URL can outlive the file it points at.
let largeReqId = 0;

export function convertLargeFile(
  store: Store<TsvToCsvState>,
  file: File,
  name: string,
  size: number,
): void {
  const id = ++largeReqId;

  store.update((s) => ({
    ...s,
    isConverting: true,
    error: null,
    outputStatus: "empty",
    largeFile: {
      file: { name, size },
      blob: null,
      preview: "",
      phase: "reading",
      rows: 0,
      cols: 0,
    },
  }));

  const w = getWorker();
  const onMessage = (e: MessageEvent) => {
    const data = e.data as {
      id: number;
      phase: string;
      ok?: boolean;
      blob?: Blob;
      preview?: string;
      rows?: number;
      cols?: number;
      error?: string;
    };
    if (data.id !== id) return;

    // Discrete phase readout — honest, single-pass, no fake percentage.
    store.update((s) =>
      s.largeFile ? { ...s, largeFile: { ...s.largeFile, phase: data.phase } } : s,
    );

    if (data.phase !== "done") return;
    w.removeEventListener("message", onMessage);
    if (data.id !== largeReqId) return; // superseded by a newer file

    if (data.ok && data.blob) {
      store.update((s) => ({
        ...s,
        isConverting: false,
        largeFile: s.largeFile
          ? {
              ...s.largeFile,
              blob: data.blob ?? null,
              preview: data.preview ?? "",
              rows: data.rows ?? 0,
              cols: data.cols ?? 0,
            }
          : s.largeFile,
      }));
    } else {
      store.update((s) => ({
        ...s,
        isConverting: false,
        error: data.error ?? "Conversion failed. The TSV could not be converted. Check the input and try again.",
      }));
    }
  };
  w.addEventListener("message", onMessage);
  w.postMessage({ id, kind: "large", file });
}

/** Release the active large-file mode and reset. */
export function clearLargeFile(store: Store<TsvToCsvState>): void {
  largeReqId++;
  store.update((s) => ({ ...s, largeFile: null }));
}
