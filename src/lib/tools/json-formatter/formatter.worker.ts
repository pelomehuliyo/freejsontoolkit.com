import { formatJson } from "./engine";
import type { FormatOptions } from "./engine";

// Typed view of the worker global scope (avoids DOM/webworker lib clashes).
const ctx = self as unknown as {
  onmessage: ((e: MessageEvent) => void) | null;
  postMessage: (msg: unknown) => void;
};

interface WorkerRequest {
  id: number;
  input: string;
  options: FormatOptions;
}

ctx.onmessage = (e: MessageEvent) => {
  const { id, input, options } = e.data as WorkerRequest;
  try {
    const result = formatJson(input, options);
    ctx.postMessage({ id, ok: true, output: result.output, outputChars: result.outputChars });
  } catch (err) {
    ctx.postMessage({
      id,
      ok: false,
      error: err instanceof Error ? err.message : "Failed to format JSON.",
    });
  }
};
