import type { Store } from "../../state/toolStore";
import type { IndentOption, JsonToXmlState, XmlResult } from "./types";
import { validateJson } from "../json-validator/engine";
import { LIVE_VALIDATE_THRESHOLD, MAX_INPUT_CHARS, SAMPLE_JSON } from "./constants";

// ── Worker management: big-file conversion off the main thread ──
let worker: Worker | null = null;
let reqId = 0;
function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL("./xml.worker.ts", import.meta.url), { type: "module" });
  }
  return worker;
}
/** As-you-type: validate only (shared validator engine) so the status bar shows
 *  Valid / Invalid with line+col. Never produces output, never scrolls. */
export function handleInput(store: Store<JsonToXmlState>, text: string): void {
  reqId++;
  const state = store.get();
  if (!text.trim()) {
    store.set({
      ...state,
      jsonInput: text,
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
      jsonInput: text,
      result: null,
      inputStatus: "invalid",
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
  if (text.length > LIVE_VALIDATE_THRESHOLD) {
    store.set({ ...state, jsonInput: text, inputStatus: "ready", error: null });
    return;
  }
  const v = validateJson(text, { flagDuplicateKeys: false, indent: "2", includeNormalized: false });
  store.set({ ...state, jsonInput: text, inputStatus: v.valid ? "ready" : "invalid", error: null });
}
/** The explicit Convert — runs in the worker, drives the output + readout. */
export function convert(store: Store<JsonToXmlState>): void {
  const state = store.get();
  if (state.isConverting) return;
  if (!state.jsonInput.trim()) {
    store.update((s) => ({ ...s, error: "Paste or load JSON first." }));
    return;
  }
  const id = ++reqId;
  store.update((s) => ({ ...s, isConverting: true, error: null }));
  const w = getWorker();
  const onMessage = (e: MessageEvent) => {
    const d = e.data as { id: number; ok: boolean; result?: XmlResult; error?: string };
    if (d.id !== id) return;
    w.removeEventListener("message", onMessage);
    if (d.id !== reqId) return; // superseded by newer input
    if (d.ok && d.result) {
      store.update((s) => ({
        ...s,
        isConverting: false,
        result: d.result as XmlResult,
        outputStatus: "converted",
        inputStatus: "ready",
        error: null,
      }));
    } else {
      store.update((s) => ({
        ...s,
        isConverting: false,
        inputStatus: "invalid",
        error: d.error ?? "Failed to convert JSON.",
      }));
    }
  };
  w.addEventListener("message", onMessage);
  w.postMessage({
    id,
    input: state.jsonInput,
    options: {
      pretty: state.pretty,
      indent: state.indent,
      rootName: state.rootName,
      itemName: state.itemName,
      declaration: state.declaration,
    },
  });
}
/** Load only — never auto-run. The user clicks Convert explicitly. */
export function loadSample(store: Store<JsonToXmlState>): void {
  handleInput(store, SAMPLE_JSON);
}
export function clearAll(store: Store<JsonToXmlState>): void {
  reqId++;
  store.update((s) => ({
    ...s,
    jsonInput: "",
    result: null,
    inputStatus: "empty",
    outputStatus: "empty",
    isConverting: false,
    error: null,
  }));
}
export function setPretty(store: Store<JsonToXmlState>, value: boolean): void {
  store.update((s) => ({ ...s, pretty: value }));
}
export function setIndent(store: Store<JsonToXmlState>, value: IndentOption): void {
  store.update((s) => ({ ...s, indent: value }));
}
export function setDeclaration(store: Store<JsonToXmlState>, value: boolean): void {
  store.update((s) => ({ ...s, declaration: value }));
}
export function setRootName(store: Store<JsonToXmlState>, value: string): void {
  store.update((s) => ({ ...s, rootName: value }));
}
export function setItemName(store: Store<JsonToXmlState>, value: string): void {
  store.update((s) => ({ ...s, itemName: value }));
}
