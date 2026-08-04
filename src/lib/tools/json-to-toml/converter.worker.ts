import { convertJsonToToml } from "./engine";
import type { ConvertOptions } from "./types";

const ctx = self as unknown as {
    onmessage: ((e: MessageEvent) => void) | null;
    postMessage: (msg: unknown) => void;
};

interface WorkerRequest {
    id: number;
    input: string;
    options: ConvertOptions;
}

ctx.onmessage = (e: MessageEvent) => {
    const { id, input, options } = e.data as WorkerRequest;
    try {
        const result = convertJsonToToml(input, options);
        result.authoritative = true;
        ctx.postMessage({ id, ok: true, result });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Conversion failed unexpectedly.";
        ctx.postMessage({ id, ok: false, error: message });
    }
};