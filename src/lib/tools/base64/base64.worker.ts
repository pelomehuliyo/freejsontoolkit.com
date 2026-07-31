import { run } from "./engine";
import type { Base64Mode, Base64Options } from "./types";

const ctx = self as unknown as {
    onmessage: ((e: MessageEvent) => void) | null;
    postMessage: (msg: unknown) => void;
};

interface WorkerRequest {
    id: number;
    mode: Base64Mode;
    input: string;
    options: Base64Options;
}

ctx.onmessage = (e: MessageEvent) => {
    const { id, mode, input, options } = e.data as WorkerRequest;
    try {
        const result = run(mode, input, options);
        ctx.postMessage({ id, ok: true, result });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Base64 operation failed.";
        ctx.postMessage({ id, ok: false, error: message });
    }
};