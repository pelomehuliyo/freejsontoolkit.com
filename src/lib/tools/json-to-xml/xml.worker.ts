import { jsonToXml } from "./engine";
import type { XmlOptions } from "./types";

const ctx = self as unknown as {
    onmessage: ((e: MessageEvent) => void) | null;
    postMessage: (msg: unknown) => void;
};
interface WorkerRequest {
    id: number;
    input: string;
    options: XmlOptions;
}
ctx.onmessage = (e: MessageEvent) => {
    const { id, input, options } = e.data as WorkerRequest;
    try {
        const result = jsonToXml(input, options);
        ctx.postMessage({ id, ok: true, result });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Conversion failed unexpectedly.";
        ctx.postMessage({ id, ok: false, error: message });
    }
};