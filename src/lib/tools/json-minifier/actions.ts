import type { Store } from "../../state/toolStore.ts";
import type { JsonMinifierState, MinifyResult } from "./types.ts";
import { validateJson } from "../json-validator/engine.ts";
import { MAX_INPUT_CHARS, SAMPLE_JSON } from "./constants.ts";

// ── Worker management: big-file minify off the main thread ──
let worker: Worker | null = null;
let reqId = 0;

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL("./minifier.worker.ts", import.meta.url), { type: "module" });
  }
  return worker;
}

/** As-you-type: validate only (reusing the shared validator engine) so the
 *  input status bar shows Valid / Invalid with line+col. Never produces output
 *  and never scrolls — typing stays smooth and jump-free. */
export function handleInput(store: Store<JsonMinifierState>, text: string): void {
  reqId++;
  const state = store.get();

  if (!text.trim()) {
    store.set({
      ...state,
      jsonInput: text,
      result: null,
      inputStatus: "empty",
      outputStatus: "empty",
      isMinifying: false,
      error: null,
    });
    return;
  }

  if (text.length > MAX_INPUT_CHARS) {
    store.set({
      ...state,
      jsonInput: text,
      result: null,
      inputStatus: "invalid",
      outputStatus: "empty",
      isMinifying: false,
      error:
        "Input too large (" +
        text.length.toLocaleString() +
        " chars). Limit is " +
        MAX_INPUT_CHARS.toLocaleString() +
        ".",
    });
    return;
  }

  const v = validateJson(text, {
    flagDuplicateKeys: false,
    indent: "2",
    includeNormalized: false,
  });
  store.set({
    ...state,
    jsonInput: text,
    inputStatus: v.valid ? "ready" : "invalid",
    error: null,
  });
}

/** The explicit Minify — runs in the worker, drives the output + the stats. */
export function minify(store: Store<JsonMinifierState>): void {
  const state = store.get();
  if (state.isMinifying) return;
  if (!state.jsonInput.trim()) {
    store.update((s) => ({ ...s, error: "Paste or load JSON first." }));
    return;
  }

  const id = ++reqId;
  store.update((s) => ({ ...s, isMinifying: true, error: null }));

  const w = getWorker();
  const onMessage = (e: MessageEvent) => {
    const d = e.data as { id: number; ok: boolean; result?: MinifyResult; error?: string };
    if (d.id !== id) return;
    w.removeEventListener("message", onMessage);
    if (d.id !== reqId) return; // superseded by newer input
    if (d.ok && d.result) {
      store.update((s) => ({
        ...s,
        isMinifying: false,
        result: d.result as MinifyResult,
        outputStatus: "minified",
        inputStatus: "ready",
        error: null,
      }));
    } else {
      store.update((s) => ({
        ...s,
        isMinifying: false,
        inputStatus: "invalid",
        error: d.error ?? "Failed to minify JSON.",
      }));
    }
  };

  w.addEventListener("message", onMessage);
  w.postMessage({
    id,
    input: state.jsonInput,
    options: { sortKeys: state.sortKeys },
  });
}

export function loadSample(store: Store<JsonMinifierState>): void {
  // Load only — never auto-run. The user clicks Minify explicitly.
  handleInput(store, SAMPLE_JSON);
}

export function clearAll(store: Store<JsonMinifierState>): void {
  reqId++;
  store.update((s) => ({
    ...s,
    jsonInput: "",
    result: null,
    inputStatus: "empty",
    outputStatus: "empty",
    isMinifying: false,
    error: null,
  }));
}

export function setSortKeys(store: Store<JsonMinifierState>, value: boolean): void {
  store.update((s) => ({ ...s, sortKeys: value }));
}
