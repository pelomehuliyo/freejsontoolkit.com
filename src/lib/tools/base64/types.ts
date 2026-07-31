export type Base64Mode = "encode" | "decode";
export type Base64Variant = "std" | "url";

export interface Base64Options {
    variant: Base64Variant;
    padding: boolean;
    dataUri: boolean;
    mime: string;
}

export interface Base64Result {
    output: string;
    inputChars: number;
    inputBytes: number;
    outputChars: number;
    outputBytes: number;
    ratio: number; // percent, content-sensitive — see engine
    /** decode only: what the decoded bytes look like, else null */
    looksLike: string | null;
    /** decode only: true when the payload is binary, not text */
    binary: boolean;
}

export interface Base64State {
    input: string;
    result: Base64Result | null;
    mode: Base64Mode;
    variant: Base64Variant;
    padding: boolean;
    dataUri: boolean;
    mime: string;
    inputStatus: "empty" | "ready" | "invalid";
    isRunning: boolean;
    needsManual: boolean;
    error: string | null;
}

export const DEFAULT_STATE: Base64State = {
    input: "",
    result: null,
    mode: "encode",
    variant: "std",
    padding: true,
    dataUri: false,
    mime: "text/plain",
    inputStatus: "empty",
    isRunning: false,
    needsManual: false,
    error: null,
};