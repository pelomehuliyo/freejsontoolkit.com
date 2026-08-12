import type { Store } from "../../state/toolStore";
import type { CsvToJsonState, CsvDelimiterOption, IndentOption } from "./types";
import { MAX_INPUT_CHARS, SAMPLE_CSV } from "./constants";

// ── Worker management: keeps big-file conversion off the main thread ──
let worker: Worker | null = null;
let reqId = 0;

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL("./converter.worker.ts", import.meta.url), { type: "module" });
  }
  return worker;
}

/** Store the input as the user types/pastes. Does NOT convert. Clears any
    stale output so the box never shows a previous result against new input. */
export function handleInput(store: Store<CsvToJsonState>, text: string): void {
  reqId++; // invalidate any in-flight conversion
  clearLargeFile(store); // typing supersedes a large-file preview
  const state = store.get();

  if (!text.trim()) {
    store.set({
      ...state,
      csvInput: text,
      jsonOutput: "",
      inputStatus: "empty",
      outputStatus: "empty",
      isConverting: false,
      recordCount: 0,
      delimiterUsed: "",
      error: null,
    });
    return;
  }

  if (text.length > MAX_INPUT_CHARS) {
    store.set({
      ...state,
      csvInput: text,
      jsonOutput: "",
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

  store.set({
    ...state,
    csvInput: text,
    jsonOutput: "",
    inputStatus: "ready",
    outputStatus: "empty",
    isConverting: false,
    recordCount: 0,
    delimiterUsed: "",
    error: null,
  });
}

/** The ONLY thing that converts (besides the Load Sample demo). Runs in a
    worker so the UI stays responsive; shows a "Converting…" state meanwhile. */
export function convert(store: Store<CsvToJsonState>): void {
  const state = store.get();
  if (state.isConverting) return;

  // Large-file mode: re-run from the retained file when options changed.
  const largeSource = state.largeFile?.source;
  if (largeSource) {
    convertLargeFile(store, largeSource, state.largeFile!.file.name, state.largeFile!.file.size);
    return;
  }

  if (!state.csvInput.trim()) {
    store.update((s) => ({ ...s, error: "Nothing to convert yet. Add CSV to the input box, then press Convert." }));
    return;
  }

  const id = ++reqId;
  store.update((s) => ({ ...s, isConverting: true, error: null }));

  const w = getWorker();
  const onMessage = (e: MessageEvent) => {
    const data = e.data as {
      id: number;
      ok: boolean;
      output?: string;
      recordCount?: number;
      delimiterUsed?: string;
      error?: string;
    };
    if (data.id !== id) return;
    w.removeEventListener("message", onMessage);
    if (data.id !== reqId) return; // superseded by newer input — discard

    if (data.ok) {
      store.update((s) => ({
        ...s,
        isConverting: false,
        jsonOutput: data.output ?? "",
        outputStatus: "converted",
        recordCount: data.recordCount ?? 0,
        delimiterUsed: data.delimiterUsed ?? "",
        error: null,
      }));
    } else {
      store.update((s) => ({
        ...s,
        isConverting: false,
        error: data.error ?? "Conversion failed. The CSV could not be converted. Check the input and try again.",
      }));
    }
  };

  w.addEventListener("message", onMessage);
  w.postMessage({
    id,
    input: state.csvInput,
    options: {
      delimiter: state.delimiter,
      hasHeader: state.hasHeader,
      skipEmptyLines: state.skipEmptyLines,
      indent: state.indent,
    },
  });
}

/** House rule: Load Sample only loads — it never auto-runs. The user clicks
 *  Convert explicitly. */
export function loadSample(store: Store<CsvToJsonState>): void {
  handleInput(store, SAMPLE_CSV);
}

export function clearAll(store: Store<CsvToJsonState>): void {
  reqId++;
  store.update((s) => ({
    ...s,
    csvInput: "",
    jsonOutput: "",
    inputStatus: "empty",
    outputStatus: "empty",
    isConverting: false,
    recordCount: 0,
    delimiterUsed: "",
    error: null,
    staleOptions: false,
  }));
}

export function getJsonContent(store: Store<CsvToJsonState>): string | null {
  return store.get().jsonOutput || null;
}

/** Option changes are STAGED only — click Convert to apply them. In
    large-file mode they mark the outcome stale instead so the page can say
    "Options changed — convert again." rather than silently keeping the old
    preview. */
/** Option changes are STAGED only — click Convert to apply them. In
    large-file mode they mark the outcome stale instead so the page can say
    "Options changed — convert again." rather than silently keeping the old
    preview. */
function stale(prev: CsvToJsonState): boolean {
  return !!prev.largeFile && prev.outputStatus === "converted" && !prev.isConverting;
}

export function setDelimiter(store: Store<CsvToJsonState>, value: CsvDelimiterOption): void {
  store.update((s) => ({ ...s, delimiter: value, staleOptions: s.staleOptions || stale(s) }));
}
export function setHasHeader(store: Store<CsvToJsonState>, value: boolean): void {
  store.update((s) => ({ ...s, hasHeader: value, staleOptions: s.staleOptions || stale(s) }));
}
export function setSkipEmptyLines(store: Store<CsvToJsonState>, value: boolean): void {
  store.update((s) => ({ ...s, skipEmptyLines: value, staleOptions: s.staleOptions || stale(s) }));
}
export function setIndent(store: Store<CsvToJsonState>, value: IndentOption): void {
  store.update((s) => ({ ...s, indent: value, staleOptions: s.staleOptions || stale(s) }));
}

// ── Large-file mode (interim): worker owns read + single-pass convert ──
// The result is a Blob (full file, download-only) plus a capped preview for the
// editor. Each dispatch gets its own reqId so a second dropped file supersedes
// the first (staleness guard). The Blob is kept in state until a new
// conversion replaces it or the user clears it; an object URL is created
// only at download time so no URL can outlive the file it points at.
let largeReqId = 0;

export function convertLargeFile(
  store: Store<CsvToJsonState>,
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
    jsonOutput: "",
    staleOptions: false,
    largeFile: {
      file: { name, size },
      source: file,
      blob: null,
      preview: "",
      phase: "reading",
      rows: 0,
      totalRows: 0,
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
      totalRows?: number;
      previewExceeded?: boolean;
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
        outputStatus: "converted",
        largeFile: s.largeFile
          ? {
              ...s.largeFile,
              blob: data.blob ?? null,
              preview: data.preview ?? "",
              rows: data.rows ?? 0,
              totalRows: data.totalRows ?? 0,
            }
          : s.largeFile,
      }));
    } else {
      store.update((s) => ({
        ...s,
        isConverting: false,
        error: data.error ?? "Conversion failed. The CSV could not be converted. Check the input and try again.",
      }));
    }
  };
  w.addEventListener("message", onMessage);
  w.postMessage({
    id,
    kind: "large",
    file,
    options: {
      delimiter: store.get().delimiter,
      hasHeader: store.get().hasHeader,
      skipEmptyLines: store.get().skipEmptyLines,
      indent: store.get().indent,
    },
  });
}

/** Release the active large-file mode and reset. */
export function clearLargeFile(store: Store<CsvToJsonState>): void {
  largeReqId++;
  store.update((s) => ({ ...s, largeFile: null, staleOptions: false }));
}
