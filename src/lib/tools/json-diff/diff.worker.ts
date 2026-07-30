import { computeDiff } from "./engine";
import type { DiffOptions } from "./types";

const ctx = self as unknown as {
    onmessage: ((e: MessageEvent) => void) | null;
    postMessage: (msg: unknown) => void;
};

interface WorkerRequest {
    id: number;
    a: string;
    b: string;
    options: DiffOptions;
}

ctx.onmessage = (e: MessageEvent) => {
    const { id, a, b, options } = e.data as WorkerRequest;
    try {
        const result = computeDiff(a, b, options);
        ctx.postMessage({ id, ok: true, result });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Diff failed unexpectedly.";
        ctx.postMessage({ id, ok: false, error: message });
    }
};