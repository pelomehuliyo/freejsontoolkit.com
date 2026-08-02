import { convertJsonToYaml } from "./engine";
import type { IndentOption } from "./types";

const ctx = self as unknown as {
  onmessage: ((e: MessageEvent) => void) | null;
  postMessage: (msg: unknown) => void;
};

interface WorkerRequest {
  id: number;
  input: string;
  options: { indent: IndentOption; sortKeys: boolean };
}

ctx.onmessage = (e: MessageEvent) => {
  const { id, input, options } = e.data as WorkerRequest;
  try {
    const result = convertJsonToYaml(input, options);
    ctx.postMessage({ id, ok: true, output: result.output });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Conversion failed";
    ctx.postMessage({ id, ok: false, error: message });
  }
};
