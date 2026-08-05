import { validateAgainstSchema } from "./engine";
import type { EngineInput } from "./engine";

const ctx = self as unknown as {
    onmessage: ((e: MessageEvent) => void) | null;
    postMessage: (msg: unknown) => void;
};

interface WorkerRequest {
    id: number;
    input: EngineInput;
}

ctx.onmessage = (e: MessageEvent) => {
    const { id, input } = e.data as WorkerRequest;
    try {
        const result = validateAgainstSchema(input);
        result.authoritative = true;
        ctx.postMessage({ id, ok: true, result });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Validation failed unexpectedly.";
        ctx.postMessage({ id, ok: false, error: message });
    }
};