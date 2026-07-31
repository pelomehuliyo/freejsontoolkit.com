export interface MinifyOptions {
    sortKeys: boolean;
}

export interface MinifyResult {
    output: string;
    originalChars: number;
    minifiedChars: number;
    saved: number;
    reduction: number; // 0–100
    originalLines: number;
}

export interface JsonMinifierState {
    jsonInput: string;
    result: MinifyResult | null;
    inputStatus: "empty" | "ready" | "invalid";
    outputStatus: "empty" | "minified";
    isMinifying: boolean;
    error: string | null;
    sortKeys: boolean;
}

export const DEFAULT_STATE: JsonMinifierState = {
    jsonInput: "",
    result: null,
    inputStatus: "empty",
    outputStatus: "empty",
    isMinifying: false,
    error: null,
    sortKeys: false,
};