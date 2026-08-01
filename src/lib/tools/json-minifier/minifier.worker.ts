import { minifyJson } from "./engine";
import type { MinifyOptions } from "./types";

const ctx = self as unknown as {
  onmessage: ((e: MessageEvent) => void) | null;
  postMessage: (msg: unknown) => void;
};

interface WorkerRequest {
  id: number;
  input: string;
  options: MinifyOptions;
}

ctx.onmessage = (e: MessageEvent) => {
  const { id, input, options } = e.data as WorkerRequest;
  try {
    const result = minifyJson(input, options);
    ctx.postMessage({ id, ok: true, result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Minify failed unexpectedly.";
    ctx.postMessage({ id, ok: false, error: message });
  }
};
