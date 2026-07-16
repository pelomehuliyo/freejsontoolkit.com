/// <reference lib="webworker" />

import { jsonToCsv, type ConversionOptions } from "./converter";

type WorkerRequest = {
    type: "convert";
    payload: {
        jsonStr: string;
        options: ConversionOptions;
    };
};

type WorkerProgress =
    | { type: "progress"; payload: { step: string; detail?: string } }
    | { type: "done"; payload: { result: string } }
    | { type: "error"; payload: { message: string } };

self.onmessage = (event: MessageEvent<WorkerRequest>) => {
    const msg = event.data;
    if (!msg || msg.type !== "convert") return;

    const { jsonStr, options } = msg.payload;

    try {
        // Coarse progress milestones.
        (self as any).postMessage({
            type: "progress",
            payload: { step: "start", detail: "Parsing JSON" },
        } satisfies WorkerProgress);

        // We can't granularly report internal converter milestones without
        // refactoring converter.ts, but we still keep the UI responsive.
        const result = jsonToCsv(jsonStr, options);

        (self as any).postMessage({
            type: "progress",
            payload: { step: "complete", detail: "Building CSV" },
        } satisfies WorkerProgress);

        (self as any).postMessage({
            type: "done",
            payload: { result },
        } satisfies WorkerProgress);
    } catch (err: any) {
        (self as any).postMessage({
            type: "error",
            payload: { message: err?.message || "Conversion failed" },
        } satisfies WorkerProgress);
    }
};

