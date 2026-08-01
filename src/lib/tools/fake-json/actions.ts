import type { Store } from "../../state/toolStore";
import type { FakeJsonResult, FakeJsonState } from "./types";
import { generate, validateTemplate } from "./engine";
import { AUTO_GEN_COUNT, MAX_COUNT } from "./constants";

export function setTemplate(store: Store<FakeJsonState>, text: string): void {
  const validity = validateTemplate(text);
  store.update((s) => ({ ...s, template: text, validity, error: null }));
}
export function setCount(store: Store<FakeJsonState>, count: number): void {
  store.update((s) => ({ ...s, count: Math.max(1, Math.min(count | 0, MAX_COUNT)) }));
}
export function setSeed(store: Store<FakeJsonState>, seed: string): void {
  store.update((s) => ({ ...s, seed }));
}
export function setPretty(store: Store<FakeJsonState>, pretty: boolean): void {
  store.update((s) => ({ ...s, pretty }));
}

export function clearAll(store: Store<FakeJsonState>): void {
  store.update((s) => ({ ...s, result: null, error: null }));
}

/** Produce the dataset. Live calls pass forced=false and skip work when the
 *  template is invalid or the count is above the auto threshold (the UI then
 *  offers the Generate button). Explicit Generate / option changes pass true. */
export function run(store: Store<FakeJsonState>, forced = false): void {
  const s = store.get();
  if (s.isRunning) return;
  if (!s.validity.ok) {
    store.update((x) => ({ ...x, result: null, needsManual: false }));
    return;
  }
  if (!forced && s.count > AUTO_GEN_COUNT) {
    store.update((x) => ({ ...x, needsManual: true }));
    return;
  }

  store.update((x) => ({ ...x, isRunning: true, needsManual: false, error: null }));
  // generation is bounded + fast; run on the next frame so the button state paints
  queueMicrotask(() => {
    try {
      const result: FakeJsonResult = generate(s.template, {
        count: s.count,
        seed: s.seed,
        pretty: s.pretty,
      });
      store.update((x) => ({ ...x, isRunning: false, result }));
    } catch (err) {
      store.update((x) => ({
        ...x,
        isRunning: false,
        error: err instanceof Error ? err.message : "Generation failed.",
      }));
    }
  });
}
