import type { Store } from "../../state/toolStore";
import type { JsonToYamlState, IndentOption } from "./types";
import { MAX_INPUT_CHARS, SAMPLE_JSON } from "./constants";

let worker: Worker | null = null;
let reqId = 0;

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL("./worker.ts", import.meta.url), { type: "module" });
  }
  return worker;
}

function isValidJson(text: string): { valid: boolean; error?: string } {
  try {
    JSON.parse(text);
    return { valid: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Invalid JSON";
    return { valid: false, error: msg };
  }
}

export function handleInput(store: Store<JsonToYamlState>, text: string): void {
  const state = store.get();
  if (!text.trim()) {
    store.set({
      ...state,
      jsonInput: text,
      yamlOutput: "",
      inputStatus: "empty",
      outputStatus: "empty",
      error: null,
    });
    return;
  }
  if (text.length > MAX_INPUT_CHARS) {
    store.set({
      ...state,
      jsonInput: text,
      inputStatus: "invalid",
      error: `Input too large (${text.length.toLocaleString()} chars). Limit is ${MAX_INPUT_CHARS.toLocaleString()}.`,
    });
    return;
  }

  const result = isValidJson(text);
  if (!result.valid) {
    store.set({
      ...state,
      jsonInput: text,
      inputStatus: "invalid",
      error: `Invalid JSON: ${result.error}`,
    });
    return;
  }

  store.set({
    ...state,
    jsonInput: text,
    inputStatus: "ready",
    error: null,
  });
}

export function convert(store: Store<JsonToYamlState>): void {
  const state = store.get();
  if (state.isConverting) return;

  if (!state.jsonInput.trim()) {
    store.update((s) => ({ ...s, error: "Paste or load JSON first." }));
    return;
  }
  if (state.inputStatus === "invalid") {
    return;
  }

  const id = ++reqId;
  store.update((s) => ({ ...s, isConverting: true, error: null }));

  const w = getWorker();
  const onMessage = (e: MessageEvent) => {
    const data = e.data as { id: number; ok: boolean; output?: string; error?: string };
    if (data.id !== id) return;
    w.removeEventListener("message", onMessage);
    if (data.id !== reqId) return;
    if (data.ok && data.output) {
      const yamlOutput = data.output;
      store.update((s) => ({
        ...s,
        isConverting: false,
        yamlOutput,
        outputStatus: "converted",
        error: null,
      }));
    } else {
      store.update((s) => ({
        ...s,
        isConverting: false,
        inputStatus: "invalid",
        error: data.error ?? "Conversion failed.",
      }));
    }
  };

  w.addEventListener("message", onMessage);
  w.postMessage({
    id,
    input: state.jsonInput,
    options: { indent: state.indent, sortKeys: state.sortKeys },
  });
}

export function loadSample(store: Store<JsonToYamlState>): void {
  handleInput(store, SAMPLE_JSON);
  // no auto-convert – user clicks Convert
}

export function clearAll(store: Store<JsonToYamlState>): void {
  reqId++;
  store.update((s) => ({
    ...s,
    jsonInput: "",
    yamlOutput: "",
    inputStatus: "empty",
    outputStatus: "empty",
    isConverting: false,
    error: null,
  }));
}

export function setIndent(store: Store<JsonToYamlState>, indent: IndentOption): void {
  store.update((s) => ({ ...s, indent }));
}
export function setSortKeys(store: Store<JsonToYamlState>, sortKeys: boolean): void {
  store.update((s) => ({ ...s, sortKeys }));
}
