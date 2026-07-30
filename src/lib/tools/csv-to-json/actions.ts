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
  if (!state.csvInput.trim()) {
    store.update((s) => ({ ...s, error: "Paste or load CSV first." }));
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
        error: data.error ?? "Failed to convert CSV.",
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

/** Demo action — loads the sample AND converts it so you see the result. */
export function loadSample(store: Store<CsvToJsonState>): void {
  handleInput(store, SAMPLE_CSV);
  convert(store);
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
  }));
}

export function getJsonContent(store: Store<CsvToJsonState>): string | null {
  return store.get().jsonOutput || null;
}

/** Option changes are STAGED only — click Convert to apply them. */
export function setDelimiter(store: Store<CsvToJsonState>, value: CsvDelimiterOption): void {
  store.update((s) => ({ ...s, delimiter: value }));
}
export function setHasHeader(store: Store<CsvToJsonState>, value: boolean): void {
  store.update((s) => ({ ...s, hasHeader: value }));
}
export function setSkipEmptyLines(store: Store<CsvToJsonState>, value: boolean): void {
  store.update((s) => ({ ...s, skipEmptyLines: value }));
}
export function setIndent(store: Store<CsvToJsonState>, value: IndentOption): void {
  store.update((s) => ({ ...s, indent: value }));
}
