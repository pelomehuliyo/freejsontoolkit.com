import { convertCsvToJson } from "./engine";
import type { ConvertOptions } from "./engine";

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
        const result = convertCsvToJson(input, options);
        ctx.postMessage({
            id,
            ok: true,
            output: result.output,
            recordCount: result.recordCount,
            outputChars: result.outputChars,
            delimiterUsed: result.delimiterUsed,
        });
    } catch (err) {
        ctx.postMessage({
            id,
            ok: false,
            error: err instanceof Error ? err.message : "Failed to convert CSV.",
        });
    }
};