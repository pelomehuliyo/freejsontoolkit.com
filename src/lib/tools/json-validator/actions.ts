import type { Store } from "../../state/toolStore";
import type { JsonValidatorState, IndentOption, ValidationResult } from "./types";
import { validateJson } from "./engine";
import { LIVE_VALIDATE_THRESHOLD, MAX_INPUT_CHARS, SAMPLE_JSON } from "./constants";

// ── Worker management: big-file validation off the main thread ──
let worker: Worker | null = null;
let reqId = 0;

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL("./validator.worker.ts", import.meta.url), { type: "module" });
  }
  return worker;
}

/** As-you-type validation (main thread, capped by LIVE_VALIDATE_THRESHOLD).
 *  Updates the input status bar with line/col but never the output box and
 *  never scrolls — so typing stays smooth and jump-free. */
export function handleInput(store: Store<JsonValidatorState>, text: string): void {
  reqId++;
  const state = store.get();

  if (!text.trim()) {
    store.set({
      ...state,
      jsonInput: text,
      result: null,
      inputStatus: "empty",
      outputStatus: "empty",
      isValidating: false,
      error: null,
    });
    return;
  }
  if (text.length > MAX_INPUT_CHARS) {
    store.set({
      ...state,
      jsonInput: text,
      result: null,
      inputStatus: "ready",
      outputStatus: "empty",
      isValidating: false,
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
    // Defer the real check to the worker on Validate; keep the box responsive.
    store.set({ ...state, jsonInput: text, inputStatus: "ready", error: null });
    return;
  }

  const live = validateJson(text, {
    flagDuplicateKeys: state.flagDuplicateKeys,
    indent: state.indent,
    includeNormalized: false,
  });
  live.authoritative = false;
  store.set({ ...state, jsonInput: text, result: live, inputStatus: "ready", error: null });
}

/** The explicit Validate — runs in the worker, drives the output report and
 *  (on error) the scroll-to-error in the page. */
export function validate(store: Store<JsonValidatorState>): void {
  const state = store.get();
  if (state.isValidating) return;
  if (!state.jsonInput.trim()) {
    store.update((s) => ({ ...s, error: "Paste or load JSON first." }));
    return;
  }

  const id = ++reqId;
  store.update((s) => ({ ...s, isValidating: true, error: null }));

  const w = getWorker();
  const onMessage = (e: MessageEvent) => {
    const data = e.data as { id: number; ok: boolean; result?: ValidationResult; error?: string };
    if (data.id !== id) return;
    w.removeEventListener("message", onMessage);
    if (data.id !== reqId) return; // superseded by newer input

    if (data.ok && data.result) {
      const result = data.result;
      result.authoritative = true;
      store.update((s) => ({
        ...s,
        isValidating: false,
        result,
        inputStatus: "ready",
        outputStatus: result.valid ? "valid" : "invalid",
        error: null,
      }));
    } else {
      store.update((s) => ({
        ...s,
        isValidating: false,
        error: data.error ?? "Validation failed.",
      }));
    }
  };

  w.addEventListener("message", onMessage);
  w.postMessage({
    id,
    input: state.jsonInput,
    options: {
      flagDuplicateKeys: state.flagDuplicateKeys,
      indent: state.indent,
      includeNormalized: state.includeNormalized,
    },
  });
}

export function loadSample(store: Store<JsonValidatorState>): void {
  // Load only — never auto-run. The user clicks Validate explicitly.
  handleInput(store, SAMPLE_JSON);
}

export function clearAll(store: Store<JsonValidatorState>): void {
  reqId++;
  store.update((s) => ({
    ...s,
    jsonInput: "",
    result: null,
    inputStatus: "empty",
    outputStatus: "empty",
    isValidating: false,
    error: null,
  }));
}

export function getReportContent(store: Store<JsonValidatorState>): string | null {
  const r = store.get().result;
  return r ? null : null; // report text is built in the page; this returns raw only if needed
}

export function setFlagDuplicateKeys(store: Store<JsonValidatorState>, value: boolean): void {
  store.update((s) => ({ ...s, flagDuplicateKeys: value }));
}
export function setIncludeNormalized(store: Store<JsonValidatorState>, value: boolean): void {
  store.update((s) => ({ ...s, includeNormalized: value }));
}
export function setIndent(store: Store<JsonValidatorState>, value: IndentOption): void {
  store.update((s) => ({ ...s, indent: value }));
}
