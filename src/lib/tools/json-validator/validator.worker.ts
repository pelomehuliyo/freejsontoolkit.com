import { validateJson } from "./engine";
import type { ValidatorOptions } from "./types";

const ctx = self as unknown as {
  onmessage: ((e: MessageEvent) => void) | null;
  postMessage: (msg: unknown) => void;
};

interface WorkerRequest {
  id: number;
  input: string;
  options: ValidatorOptions;
}

ctx.onmessage = (e: MessageEvent) => {
  const { id, input, options } = e.data as WorkerRequest;
  try {
    const result = validateJson(input, { ...options, authoritative: true } as ValidatorOptions & { authoritative: boolean });
    // validateJson ignores unknown keys; stamp authoritative on the way out.
    (result as { authoritative: boolean }).authoritative = true;
    ctx.postMessage({ id, ok: true, result });
  } catch (err) {
    // Defensive only — validateJson returns invalid results rather than throwing.
    const message = err instanceof Error ? err.message : "Validation failed unexpectedly.";
    ctx.postMessage({ id, ok: false, error: message });
  }
};