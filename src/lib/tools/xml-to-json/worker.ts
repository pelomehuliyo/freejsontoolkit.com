import { convertXmlToJson } from "./engine";
import type { XmlToJsonOptions } from "./types";

const ctx = self as unknown as {
    onmessage: ((e: MessageEvent) => void) | null;
    postMessage: (msg: unknown) => void;
};

interface WorkerRequest {
    id: number;
    xml: string;
    options: XmlToJsonOptions;
}

ctx.onmessage = (e: MessageEvent) => {
    const { id, xml, options } = e.data as WorkerRequest;
    try {
        const result = convertXmlToJson(xml, options);
        ctx.postMessage({ id, ok: true, result });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to convert XML";
        ctx.postMessage({ id, ok: false, error: message });
    }
};