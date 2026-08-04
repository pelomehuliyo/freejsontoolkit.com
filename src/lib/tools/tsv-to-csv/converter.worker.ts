import { convertTsvToCsv } from "./engine";

const ctx = self as unknown as {
    onmessage: ((e: MessageEvent) => void) | null;
    postMessage: (msg: unknown) => void;
};

interface WorkerRequest {
    id: number;
    input: string;
}

ctx.onmessage = (e: MessageEvent) => {
    const { id, input } = e.data as WorkerRequest;
    try {
        const result = convertTsvToCsv(input);
        result.authoritative = true;
        ctx.postMessage({ id, ok: true, result });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Conversion failed unexpectedly.";
        ctx.postMessage({ id, ok: false, error: message });
    }
};